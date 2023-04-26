import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Configuration } from 'src/app/models/configuration.model';
import { Align } from 'src/app/models/style.model';
import { Category } from 'src/app/models/category.model';
import { AppsService } from 'src/app/services/apps.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent {
  @Input() configuration: Configuration;
  @Output() readConfigEvent: EventEmitter<any>;
  Align = Align;
  form: FormGroup;
  infoMessage: string;
  formMessage: string;
  success: boolean;
  fontList: { name: string; value: string; }[];
  newId: string;

  constructor(private fb: FormBuilder, private appsService: AppsService) {
    this.fontList = [
      { name: 'Arial', value: 'Arial, sans-serif' },
      { name: 'Verdana', value: 'Verdana, sans-serif' },
      { name: 'Helvetica', value: 'Helvetica, sans-serif' },
      { name: 'Times New Roman', value: 'Times New Roman, serif' },
      { name: 'Courier New', value: 'Courier New, monospace' }
    ];
    this.formMessage = "";
    this.infoMessage = "";
    this.success = false;
    this.readConfigEvent = new EventEmitter<any>();
  }

  ngOnChanges(): void {
    this.newId = this.configuration.id;

    this.form = this.fb.group({
      id: [
        this.newId,
        Validators.compose([
          Validators.required,
          Validators.maxLength(20),
          Validators.pattern(/^[a-zA-Z0-9ñÑ._-]+$/)
        ]),
      ],
      title: [
        this.configuration.title,
        Validators.compose([
          Validators.required,
          Validators.maxLength(255)
        ]),
      ],
      description: [
        this.configuration.description,
        Validators.compose([
          Validators.maxLength(2000)
        ]),
      ],
    });
  }

  setTextAlign(textAlign: Align) {
    this.configuration.style.textAlign = textAlign;
  }

  setTitleAlign(titleAlign: Align) {
    this.configuration.style.titleAlign = titleAlign;
  }

  setCamAlign(camAlign: Align) {
    this.configuration.style.camAlign = camAlign;
  }

  setId(id: string) {
    if (!this.form.controls['id'].errors) {
      this.formMessage = "";
      this.newId = id;
    }
    else {
      console.log(this.form.controls['id'].errors);
      if (this.form.controls['id'].errors['required']) {
        this.formMessage = "El identificador no puede estar vacío.";
      }
      if (this.form.controls['id'].errors['pattern']) {
        this.formMessage = "El identificador contiene caracteres no válidos. Solo puede contener caracteres alfanuméricos, puntos, guiones y/o guiones bajos.";
      }
      if (this.form.controls['id'].errors['maxlength']) {
        this.formMessage = "El identificdor no puede contener más de 20 caracteres.";
      }
    }
  }

  setTitle(title: string) {
    if (!this.form.controls['title'].errors) {
      this.formMessage = "";
      this.configuration.title = title;
    }
    else {
      if (this.form.controls['title'].errors['required']) {
        this.formMessage = "El título de la aplicación no puede estar vacío.";
      }
      if (this.form.controls['title'].errors['maxlength']) {
        this.formMessage = "El título de la aplicación no puede contener más de 255 caracteres.";
      }
    }
  }

  setDescription(description: string) {
    if (!this.form.controls['description'].errors) {
      this.formMessage = "";
      this.configuration.description = description;
    }
    else {
      if (this.form.controls['description'].errors['maxlength']) {
        this.formMessage = "La descripción de la aplicación no puede contener más de 2000 caracteres.";
      }
    }
  }

  addConfig() {
    this.success = false;
    if (this.form.valid) {
      this.configuration.id = this.newId;
      this.appsService.post(this.configuration).subscribe(
        res => {
          this.appsService.createFolder(this.configuration).subscribe(
            res => {
              //actualiza la lista de aplicaciones
              this.readConfigEvent.emit();
              this.success = true;
              this.infoMessage = "Se ha añadido correctamente la aplicación a la lista.";
              console.log(res);
            },
            err => {
              console.log(err);
            }
          )
          console.log(res);
        },
        err => {
          this.infoMessage = "No se ha podido añadir correctamente a la lista. El id de la aplicación ya existe, escribe un id único.";
          console.log(err);
        }
      )
    }
    else {
      this.infoMessage = "No se ha podido añadir la aplicación a la lista. Por favor, revisa los campos del formulario.";
    }
  }

  updateConfig() {
    this.success = false;

    if (this.form.valid) {
      this.appsService.put(this.configuration, this.newId).subscribe(
        res => {
          //actualiza la lista de aplicaciones
          this.readConfigEvent.emit();
          this.success = true;
          this.infoMessage = "Se han guardado los cambios de la aplicación correctamente.";
          console.log(res);
        },
        err => {
          this.infoMessage = "No se han podido actualizar los datos correctamente.";
          console.log(err);
        }
      )
    }
    else {
      this.infoMessage = "No se han podido guardar los cambios de la aplicación correctamente. Por favor, revisa los campos del formulario.";
    }
  }

  addCategory() {
    this.configuration.categories.push(new Category("Nombre categoría", null, null));
  }

  closeMessage() {
    this.infoMessage = "";
  }

  deleteCategory(category: Category) {
    const index = this.configuration.categories.indexOf(category);
    if (index !== -1) {
      this.configuration.categories.splice(index, 1);
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    const allowedFormats = ["json", "bin"];
    const bins = [];
    let model;

    //filtro de archivos
    for (const element of files) {
      const file = element
      const extension = file.name.split(".").pop();

      if (extension == "json") {
        model = file;
      }
      if (extension == "bin") {
        bins.push(file);
      }
    }
    //this.configuration.modelURL = model.webkitRelativePath;
  }
}