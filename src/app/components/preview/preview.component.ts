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
  modelo: any;
  width: number;
  height: number;
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  ctx: any;
  currentStream: MediaStream;
  facingMode: string;
  category: String;
  output: number;

  constructor() {
    this.width = 400;
    this.height = 400;
    this.modelo = null;
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
    this.modelo = await tf.loadLayersModel(this.configuration.modelURL);
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
        facingMode: "user", width: this.width, height: this.height
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
        width: this.width,
        height: this.height
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
    this.ctx.drawImage(this.video, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
    setTimeout(this.procesarCamara.bind(this), 20);
  }

  predecir() {
    if (this.modelo != null) {
      // obtiene los datos de la imagen de la cámara
      let imageData = this.ctx.getImageData(0, 0, this.width, this.height);
      let imageTensor = tf.browser.fromPixels(imageData).toFloat();
      // redimensiona la imagen al tamaño requerido por el tensor
      let resizedTensor = tf.image.resizeBilinear(imageTensor, [this.configuration.height, this.configuration.width]);

      // convertir la imagen a escala de grises
      let grayTensor = resizedTensor.mean(2, true);
      // normaliza los valores de los píxeles
      let normalizedTensor = grayTensor.div(255);
      let tensor = normalizedTensor.reshape([1, this.configuration.width, this.configuration.height, 1]);

      let output = this.modelo.predict(tensor).dataSync();
      this.output = output;

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