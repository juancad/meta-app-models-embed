import { Component, HostListener, Input, OnInit } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { Configuration } from 'src/app/models/configuration.model';
import { Align } from 'src/app/models/style.model';

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

  constructor() {
    this.camWidth = 400;
    this.camHeight = 400;
    this.model = null;
    this.facingMode = "user";
    this.category = "Cargando...";
    this.output = 0;
  }

  ngOnInit(): void {
    this.video = <HTMLVideoElement>document.getElementById("video");
    this.canvas = <HTMLCanvasElement>document.getElementById("canvas");
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.loadModel();
  }

  async loadModel() {
    console.log("Cargando modelo...");
    this.model = await tf.loadLayersModel(this.configuration.modelURL);
    //guardo información del tensor del modelo
    //el tensor de 4D será de la forma: [batchSize, height, width, channels], en el caso de 3D [height, width, channels]
    this.inputShape = this.model.inputs[0].shape;
    console.log(this.inputShape);
    console.log("Modelo cargado.");
  }

  @HostListener('window:load')
  onLoad() {
    this.mostrarCamara();
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

  procesarCamara() {
    this.ctx.drawImage(this.video, 0, 0, this.camWidth, this.camHeight, 0, 0, this.camWidth, this.camHeight);
    setTimeout(this.procesarCamara.bind(this), 20);
  }

  predecir() {
    if (this.model != null) {
      //el método tidy() de TensorFlow.js libera la memoria automáticamente después de ejecutar una serie de operaciones
      tf.tidy(() => {
        let imageData = this.ctx.getImageData(0, 0, this.camWidth, this.camHeight);
        let imageTensor = tf.browser.fromPixels(imageData).toFloat();

        // redimensiona la imagen al tamaño requerido por el tensor
        imageTensor = tf.image.resizeBilinear(imageTensor, [this.inputShape[this.inputShape.length - 3], this.inputShape[this.inputShape.length - 2]]);
        // convertir la imagen a escala de grises si el modelo utiliza sólo 1 canal de color
        if(this.inputShape.length == 4 && this.inputShape[this.inputShape.length-1] == 1) {
          imageTensor = imageTensor.mean(2, true);
        }
        // normaliza los valores de los píxeles
        imageTensor = imageTensor.div(255);

        let tensor = imageTensor.reshape([1, this.inputShape[this.inputShape.length - 3], this.inputShape[this.inputShape.length - 2], this.inputShape[this.inputShape.length - 1]]);
        this.output = this.model.predict(tensor).dataSync();

        //const indice = tf.argMax(this.output).dataSync()[0];
        //console.log(indice);
      });

      for (const element of this.configuration.categories) {
        if (this.output >= element.minValue && this.output < element.maxValue) {
          this.category = element.name;
        }
      }
    }

    setTimeout(this.predecir.bind(this), 100);
  }

  getTextAlign(): string {
    return Align[this.configuration.style.textAlign];
  }

  getCamAlign(): string {
    return Align[this.configuration.style.camAlign];
  }
}