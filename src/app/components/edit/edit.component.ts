import { Component, Input, OnInit } from '@angular/core';
import { Configuration } from 'src/app/models/configuration.model';
import { ActivatedRoute } from '@angular/router';
import { Category } from 'src/app/models/category.model';
import { AppsService } from 'src/app/services/apps.service';
import { Align } from 'src/app/models/style.model';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  @Input() idConfig: string;
  configuration: Configuration;
  newId: string;
  loaded: boolean; //configuración cargada correctamente
  Align = Align;
  form: FormGroup;
  formMessage: string;

  constructor(private appsService: AppsService, private route: ActivatedRoute) {
    this.formMessage = "";
    this.loaded = false;
    
    this.route.queryParams.subscribe(
      res => {
        this.idConfig = res['id'];
        this.newId = res['id'];

        this.appsService.getById(this.idConfig).subscribe(
          res => {
            this.configuration = res;
            this.loaded = true;
          },
          err => {
            console.error(err);
          }
        );
      },
      err => {
        console.log(err);
      });
  }

  ngOnInit() {
  }

  addCategory() {
    this.configuration.categories.push(new Category("Nombre categoría", null, null));
  }

  deleteCategory(category: Category) {
    const index = this.configuration.categories.indexOf(category);
    if (index !== -1) {
      this.configuration.categories.splice(index, 1);
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
}