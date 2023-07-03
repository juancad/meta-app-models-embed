import { Component, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { Application } from 'src/app/models/application.model';
import { Align } from 'src/app/models/style.model';
import { Router } from '@angular/router'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AppsService } from 'src/app/services/apps.service';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit, OnChanges {
  app: Application;
  HTMLTitle: SafeHtml;
  HTMLDesc: SafeHtml;
  model: any;
  camWidth: number;
  camHeight: number;
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  ctx: any;
  currentStream: MediaStream;
  facingMode: string;
  category: String;
  output: any;
  inputShape: any;

  constructor(private router: Router, private sanitizer: DomSanitizer, private appsService: AppsService) {
    this.camWidth = 420;
    this.camHeight = 420;
    this.model = null;
    this.facingMode = "user";
    this.category = "";
    this.output = 0;
  }

  @Input()
  set application(value: Application) {
    this.app = value;
  }

  @Input()
  set applicationAndChargeModel(value: Application) {
    this.app = value;
    this.ngOnInit();
  }

  ngOnInit(): void {
    const url = this.appsService.baseUrl + "/users/" + this.appsService.user.username + "/" + this.app.id + "/model/model.json";

    this.video = <HTMLVideoElement>document.getElementById("video");
    this.canvas = <HTMLCanvasElement>document.getElementById("canvas");
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    console.log("Cargando modelo...");
    this.category = "Cargando...";

    tf.loadLayersModel(url)
      .then((model) => {
        this.model = model;
        this.inputShape = this.model.inputs[0].shape;
        //cambia los valores null del array por el valor 1
        this.inputShape = this.inputShape.map((value) => (value === null ? 1 : value));
        console.log("Modelo cargado. inputShape:" + this.inputShape);
        this.showCam();
      })
      .catch((error) => {
        this.model = null;
        this.output = 0;
        this.category = "No se ha podido cargar el modelo correctamente.";
        console.log(error);
      });
  }

  /**
   * Cada vez que cambie los valores del @input se ejecuta este método
   */
  ngOnChanges(changes: SimpleChanges) {
    this.HTMLTitle = this.sanitizer.bypassSecurityTrustHtml(this.app.title);
    this.HTMLDesc = this.sanitizer.bypassSecurityTrustHtml(this.app.description);
  }

  showCam() {
    let options = {
      audio: false,
      video: {
        facingMode: this.facingMode, width: this.camWidth, height: this.camHeight
      }
    }

    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia(options)
        .then((stream) => {
          this.currentStream = stream;
          this.video.srcObject = stream;
          this.video.onloadedmetadata = () => {
            this.video.play();
          };
          this.processCamera();
          this.predict();
        })
        .catch(function (err) {
          alert("No se ha podido utilizar la cámara.");
          console.log(err);
          alert(err);
        })
    } else {
      alert("No existe la funcion getUserMedia.");
    }
  }

  processCamera() {
    this.ctx.drawImage(this.video, 0, 0, this.camWidth, this.camHeight, 0, 0, this.camWidth, this.camHeight);
    setTimeout(this.processCamera.bind(this), 20);
  }

  predict() {
    if (this.model != null) {
      //el método tidy() libera la memoria después de ejecutar una serie de operaciones
      tf.tidy(() => {
        let imageData = this.ctx.getImageData(0, 0, this.camWidth, this.camHeight);
        let imageTensor = tf.browser.fromPixels(imageData);
        const sorted: number[] = this.inputShape.slice().sort((a, b) => b - a);
        const highestValue1: number = sorted[0];
        const highestValue2: number = sorted[1];
        let tensor;

        // redimensiona la imagen a las dimensiones requeridas por el tensor
        imageTensor = tf.image.resizeBilinear(imageTensor, [highestValue1, highestValue2]);

        // convertir la imagen a escala de grises si el modelo utiliza sólo 1 canal de color
        if (!this.inputShape.includes(3)) {
          imageTensor = imageTensor.mean(2, true);
        }

        // normaliza los valores de los píxeles
        imageTensor = imageTensor.div(255);

        try { // intenta con las dimensiones anteriores conseguidas (highestValue1 x highestValue2)
          tensor = imageTensor.reshape(this.inputShape);
        }
        catch (error) {
          // si no son correctas las dimenesiones es que están al revés, intenta con (highestValue2 x highestValue1)
          imageTensor = tf.image.resizeBilinear(imageTensor, [highestValue2, highestValue1]);

          if (!this.inputShape.includes(3)) {
            imageTensor = imageTensor.mean(2, true);
          }
          imageTensor = imageTensor.div(255);
          tensor = imageTensor.reshape(this.inputShape);
        }

        this.output = this.model.predict(tensor).dataSync();
      });

      //si el modelo utiliza el rango, se mostrará la categoría dependiendo del rango
      if (this.app.useRange && this.app.categories.length > 0) {
        for (const categorie of this.app.categories) {
          if (this.output >= categorie.minVal && this.output < categorie.maxVal) {
            this.category = categorie.name;
          }
        }
      }
      //si el modelo no utiliza el rango, se mostrará la categoría dependiendo del índice
      else {
        const index = tf.argMax(this.output).dataSync()[0];
        if (this.app.categories.length > index) {
          this.category = this.app.categories[index].name;
        }
        else {
          this.category = index.toString();
        }
      }
    }

    setTimeout(this.predict.bind(this), 100);
  }

  cambiarCamara() {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach((track: { stop: () => void; }) => {
        track.stop();
      });
    }

    this.facingMode = this.facingMode == "user" ? "environment" : "user";

    let opciones = {
      audio: false,
      video: {
        facingMode: this.facingMode,
        width: this.camWidth,
        height: this.camHeight
      }
    }

    navigator.mediaDevices.getUserMedia(opciones)
      .then(stream => {
        this.currentStream = stream;
        this.video.srcObject = stream;
      })
      .catch(function (err) {
        console.log("No se ha podido cambiar la cámara.", err);
      })
  }

  getCamAlign(): string {
    return Align[this.app.style.camAlign];
  }
}