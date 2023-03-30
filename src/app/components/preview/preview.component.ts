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
  respuesta: String;
  resultado: number;

  constructor() {
    this.width = 400;
    this.height = 400;
    this.modelo = null;
    this.facingMode = "user";
    this.respuesta = "Cargando...";
    this.resultado = 0;
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
      let canvasAux = <HTMLCanvasElement>document.getElementById("canvasAux");
      let ctxAux = canvasAux.getContext('2d', { willReadFrequently: true });

      //redimensiona la imagen de la cámara a las dimensiones del modelo (definidas en configuration)
      ctxAux.drawImage(this.video, 0, 0, this.width, this.height, 0, 0, this.configuration.width, this.configuration.height);
      let imgData = ctxAux.getImageData(0, 0, this.configuration.width, this.configuration.height);

      let arr = [];
      let arr100 = [];

      for (let i = 0; i < imgData.data.length; i += 4) {
        let rojo = imgData.data[i] / 255;
        let verde = imgData.data[i + 1] / 255;
        let azul = imgData.data[i + 2] / 255;

        let gris = (rojo + verde + azul) / 3;

        arr100.push([gris]);
        if (arr100.length == 100) {
          arr.push(arr100);
          arr100 = [];
        }
      }

      arr = [arr];

      let tensor = tf.tensor4d(arr);
      let resultado = this.modelo.predict(tensor).dataSync();
      this.resultado = resultado;
      
      for (const element of this.configuration.categories) {
        if (this.resultado >= element.minValue && this.resultado < element.maxValue) {
          this.respuesta = element.name;
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