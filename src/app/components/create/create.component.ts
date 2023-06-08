import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Category } from 'src/app/models/category.model';
import { Application } from 'src/app/models/application.model';
import { Align, Style } from 'src/app/models/style.model';
import { AppsService } from 'src/app/services/apps.service';
import * as tf from '@tensorflow/tfjs';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent {
  @ViewChild('close') closeModal;
  app: Application;
  idMessage: string;
  json: File;
  jsonMessage: string;
  jsonFormat: boolean;
  bin: FileList;
  binMessage: string;
  binFormat: boolean;
  form: FormGroup;
  errorMessage: string;
  loading: boolean;

  constructor(private fb: FormBuilder, private appsService: AppsService, private router: Router) {
    this.app = new Application("", "<h1 style='text-align: center'>Titulo de la aplicación</h1>", "", new Style(Align.center, 'Arial', "#FFFFFF", "#353535", true), new Array<Category>, false, this.appsService.user.username);
    this.idMessage = "El identificador no puede estar vacío.";
    this.jsonMessage = "Debes seleccionar un archivo en formato \".json\"";
    this.jsonFormat = false;
    this.binMessage = "Debes seleccionar los archivos en formato \".bin\"";
    this.binFormat = false;
    this.errorMessage = "";
    this.loading = false;

    this.form = this.fb.group({
      id: [
        this.app.id,
        Validators.compose([
          Validators.required,
          Validators.maxLength(20),
          Validators.pattern(/^[a-zA-Z0-9ñÑ._-]+$/)
        ]),
      ],
    });
  }

  setId(id: string) {
    if (!this.form.controls['id'].errors) {
      this.idMessage = "";
      this.app.id = id;
    }
    else {
      console.log(this.form.controls['id'].errors);
      if (this.form.controls['id'].errors['required']) {
        this.idMessage = "El identificador no puede estar vacío.";
      }
      if (this.form.controls['id'].errors['pattern']) {
        this.idMessage = "El identificador contiene caracteres no válidos. Solo puede contener caracteres alfanuméricos, puntos, guiones y/o guiones bajos.";
      }
      if (this.form.controls['id'].errors['maxlength']) {
        this.idMessage = "El identificdor no puede contener más de 20 caracteres.";
      }
    }
  }

  selectJSON(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.name === 'model.json') {
        this.jsonFormat = true;
        this.jsonMessage = "";
        this.json = file;
      }
      else {
        this.jsonFormat = false;
        this.jsonMessage = "El archivo debe llamarse \"model\" y tener extensión \".json\"";
      }
    }
  }

  selectBIN(event: any) {
    const files: FileList = event.target.files;
    const pattern = /^group\d+-shard\d+of\d+\.bin$/;
    let validated = true;

    if (files) {
      for (let i = 0; i < files.length; i++) {
        if (!pattern.test(files[i].name)) {
          validated = false;
        }
      }

      if (validated) {
        this.binFormat = true;
        this.binMessage = "";
        this.bin = files;
      }
      else {
        this.binFormat = false;
        this.binMessage = "Los archivos seleccionados deben seguir el patrón \"groupG-shardNofM\" donde G es el número del grupo, N es el número del archivo del grupo y M es el total de ficheros del grupo, además de tener formato \".bin\"";
      }
    }
  }

  async onCreate() {
    if (this.form.valid && this.jsonFormat && this.binFormat) {
      this.loading = true;
      const modelTopologyFiles = [this.json];
      const weightPathFiles = Array.from(this.bin);

      const modelIOHandler = tf.io.browserFiles([...modelTopologyFiles, ...weightPathFiles]);

      tf.loadLayersModel(modelIOHandler)
        .then(model => {
          this.post();
        })
        .catch(error => {
          console.log(error);
          tf.loadGraphModel(modelIOHandler)
            .then(model => {
              this.post();
            })
            .catch(error => {
              console.log(error);
              this.errorMessage = "El modelo seleccionado no es un modelo compatible con esta aplicación. Por favor, lee la <a href=\"/help\">ayuda</a> para más información.";
              this.loading = false;
            });
        });
    }
    else {
      this.errorMessage = "No se ha podido crear la aplicación. Por favor, revisa los campos del formulario.";
    }
  }

  post() {
    this.appsService.post(this.app).subscribe( // añade la configuración a la base de datos
      res => {
        this.appsService.uploadAppFiles(this.app).subscribe( // crea la carpeta y añade los archivos de la aplicación
          res => {
            this.appsService.uploadModelFIles(this.app.id, this.json, this.bin).subscribe(
              res => {
                this.errorMessage = "";
                this.closeModal.nativeElement.click();
                this.loading = false;
                this.router.navigate(['/edit'], { queryParams: { id: this.app.id } });
              },
              err => {
                this.errorMessage = "No se ha podido crear la aplicación correctamente. Hubo un error a la hora de subir los modelos al servidor.";
                this.loading = false;
                console.log(err);
              }
            )
          },
          err => {
            this.errorMessage = "No se ha podido crear la aplicación correctamente. Hubo un error a la hora de crear el directorio: " + this.app.id;
            this.loading = false;
            console.log(err);
          }
        );
      },
      err => {
        this.errorMessage = "No se ha podido crear la aplicación, el id ya existe.";
        this.loading = false;
        console.log(err);
      }
    );
  }
}