import { Component, Input, OnInit } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { Configuration } from 'src/app/models/configuration.model';
import { Align } from 'src/app/models/style.model';
import { Router } from '@angular/router'

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {
  @Input() configuration: Configuration;
  model: any;
  camWidth: number;
  camHeight: number;
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  ctx: any;
  currentStream: MediaStream;
  facingMode: string;
  category: String;
  output: number;
  inputShape: any;

  constructor(private router: Router) {
    this.camWidth = 420;
    this.camHeight = 420;
    this.model = null;
    this.facingMode = "user";
    this.category = "";
    this.output = 0;
  }

  ngOnInit(): void {
    this.video = <HTMLVideoElement>document.getElementById("video");
    this.canvas = <HTMLCanvasElement>document.getElementById("canvas");
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }

  /**
   * Carga el modelo de la aplicación.
   * Cada vez que cambie los valores del @input se ejecuta el método ngOnChanges
   */
  async ngOnChanges() {
    console.log("Cargando modelo...");
    this.category = "Cargando...";
    const url = "http://localhost/meta-app-models/assets/" + this.configuration.id + "/model/model.json";

    tf.loadLayersModel(url)
      .then((model) => {
        this.model = model;
        this.inputShape = this.model.inputs[0].shape;
        console.log("Modelo cargado. inputShape:" + this.inputShape);
        this.mostrarCamara();
      })
      .catch((error) => {
        this.model = null;
        this.output = 0;
        this.category = "No se ha podido cargar el modelo correctamente.";
        console.log(error);
      });
  }

  mostrarCamara() {
    let opciones = {
      audio: false,
      video: {
        facingMode: "user", width: this.camWidth, height: this.camHeight
      }
    }

    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia(opciones)
        .then((stream) => {
          this.currentStream = stream;
          this.video.srcObject = stream;
          this.video.onloadedmetadata = () => {
            this.video.play();
          };
          this.procesarCamara();
          this.predecir();
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

  procesarCamara() {
    this.ctx.drawImage(this.video, 0, 0, this.camWidth, this.camHeight, 0, 0, this.camWidth, this.camHeight);
    setTimeout(this.procesarCamara.bind(this), 20);
  }

  predecir() {
    if (this.model != null) {
      //el método tidy() libera la memoria después de ejecutar una serie de operaciones
      tf.tidy(() => {
        let imageData = this.ctx.getImageData(0, 0, this.camWidth, this.camHeight);
        let imageTensor = tf.browser.fromPixels(imageData).toFloat();

        // redimensiona la imagen al tamaño requerido por el tensor
        imageTensor = tf.image.resizeBilinear(imageTensor, [this.inputShape[this.inputShape.length - 3], this.inputShape[this.inputShape.length - 2]]);
        // convertir la imagen a escala de grises si el modelo utiliza sólo 1 canal de color
        if (this.inputShape.length == 4 && this.inputShape[this.inputShape.length - 1] == 1) {
          imageTensor = imageTensor.mean(2, true);
        }
        // normaliza los valores de los píxeles
        imageTensor = imageTensor.div(255);

        let tensor = imageTensor.reshape([1, this.inputShape[this.inputShape.length - 3], this.inputShape[this.inputShape.length - 2], this.inputShape[this.inputShape.length - 1]]);
        this.output = this.model.predict(tensor).dataSync();
      });

      //si el modelo utiliza el rango, se mostrará la categoría dependiendo del rango
      if (this.configuration.useRange) {
        for (const categorie of this.configuration.categories) {
          if (this.output > categorie.minVal && this.output <= categorie.maxVal) {
            this.category = categorie.name;
          }
        }
      }
      //si el modelo no utiliza el rango, se mostrará la categoría dependiendo del índice
      else {
        const index = tf.argMax(this.output).dataSync()[0];
        this.category = this.configuration.categories[index].name;
      }
    }

    setTimeout(this.predecir.bind(this), 100);
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

  getTextAlign(): string {
    return Align[this.configuration.style.textAlign];
  }

  getTitleAlign(): string {
    return Align[this.configuration.style.titleAlign];
  }

  getCamAlign(): string {
    return Align[this.configuration.style.camAlign];
  }
}