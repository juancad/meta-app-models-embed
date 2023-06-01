import { Component, Input, OnInit } from '@angular/core';
import { Configuration } from 'src/app/models/configuration.model';
import { ActivatedRoute } from '@angular/router';
import { Category } from 'src/app/models/category.model';
import { AppsService } from 'src/app/services/apps.service';
import { Align } from 'src/app/models/style.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Editor, Toolbar, } from 'ngx-editor';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  @Input() idConfig: string;
  configuration: Configuration;
  loaded: boolean; //configuración cargada correctamente
  Align = Align;
  form: FormGroup;
  errorMessage: string;
  editorTitle: Editor;
  editorDesc: Editor;
  toolbar: Toolbar;
  colorPresets;
  fontList: { name: string; value: string; }[];
  saveMessage: string;
  saved: boolean; // se han guardado los cambios o no

  constructor(private appsService: AppsService, private route: ActivatedRoute, private fb: FormBuilder, private router: Router) {
    this.errorMessage = "";
    this.saveMessage = "";
    this.loaded = false;
    this.saved = false;

    this.toolbar = [
      ['bold', 'italic'],
      ['underline', 'strike'],
      ['code'],
      ['ordered_list', 'bullet_list'],
      [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
      ['link', 'image'],
      ['text_color', 'background_color'],
      ['align_left', 'align_center', 'align_right', 'align_justify'],
      ['horizontal_rule', 'format_clear'],
    ];

    this.fontList = [
      { name: 'Arial', value: 'Arial, sans-serif' },
      { name: 'Verdana', value: 'Verdana, sans-serif' },
      { name: 'Times New Roman', value: 'Times New Roman, serif' },
      { name: 'Courier New', value: 'Courier New, monospace' },
      { name: 'Georgia', value: 'Georgia, serif' },
      { name: 'Palatino', value: 'Palatino, serif' },
      { name: 'Garamond', value: 'Garamond, serif' },
      { name: 'Bookman', value: 'Bookman, serif' },
      { name: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
      { name: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
      { name: 'Arial Black', value: 'Arial Black, sans-serif' },
      { name: 'Impact', value: 'Impact, sans-serif' }
    ];

    this.colorPresets = [
      '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
      '#FFC0CB', '#008000', '#000080', '#800000', '#808080', '#FFD700', '#A9A9A9', '#FF8C00', '#8B008B', '#4B0082',
      '#FFFFF0', '#F0FFF0', '#F0F8FF', '#F5F5DC', '#FFDAB9', '#DC143C', '#00CED1', '#F08080', '#FF1493', '#0000CD',
      '#BC8F8F', '#7FFFD4', '#FF00FF', '#DA70D6', '#FFE4C4', '#8A2BE2', '#2F4F4F', '#20B2AA', '#DAA520', '#BDB76B',
      '#ADD8E6', '#FF69B4', '#F0E68C', '#E6E6FA', '#FFF0F5', '#FFA07A', '#FF4500', '#DDA0DD', '#EE82EE', '#B0C4DE',
      '#00FF7F', '#3CB371', '#2E8B57', '#FF6347', '#FFE4B5', '#FFDEAD', '#DEB887', '#A52A2A', '#CD853F', '#FFFAFA',
      '#FFEFD5', '#FFFACD', '#FDF5E6', '#F5DEB3', '#F4A460', '#FFEBCD', '#D2691E', '#B8860B', '#FAEBD7', '#FFE4E1',
      '#FFE4E1', '#FFDAB9', '#CD5C5C', '#8B4513', '#FFF8DC', '#F8F8FF', '#FFEFD5', '#FFEFDB', '#FFE4B5', '#FFDAB9',
    ];

  }

  ngOnInit(): void {
    this.editorTitle = new Editor();
    this.editorDesc = new Editor();

    this.route.queryParams.subscribe(
      res => {
        this.idConfig = res['id'];

        this.appsService.getById(this.idConfig).subscribe(
          res => {
            this.configuration = res;
            this.loaded = true;

            this.form = this.fb.group({
              id: [
                this.configuration.id,
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
                  Validators.minLength(10),
                  Validators.maxLength(1000)
                ]),
              ],
              description: [
                this.configuration.description,
                Validators.compose([
                  Validators.maxLength(15000)
                ]),
              ],
            });
          },
          err => {
            console.error(err);
            this.router.navigate(['/404']);
          }
        );
      },
      err => {
        console.log(err);
        this.router.navigate(['/404']);
      });
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

  setTitle(newTitle: any) {
    if (!this.form.controls['title'].errors) {
      this.errorMessage = "";
      this.configuration.title = newTitle;

      this.configuration = Object.assign({}, this.configuration);
    }
    else {
      if (this.form.controls['title'].errors['required'] || this.form.controls['title'].errors['minlength']) {
        this.errorMessage = "El título de la aplicación no puede estar vacío o ser tan corto.";
      }
      if (this.form.controls['title'].errors['maxlength']) {
        this.errorMessage = "El título de la aplicación no puede contener más de 1000 caracteres.";
      }
    }
  }

  setDescription(newDescription: any) {
    if (!this.form.controls['description'].errors) {
      this.errorMessage = "";
      this.configuration.description = newDescription;
      this.configuration = Object.assign({}, this.configuration);
    }
    else {
      if (this.form.controls['description'].errors['maxlength']) {
        this.errorMessage = "La descripción de la aplicación no puede contener más de 15000 caracteres.";
      }
    }
  }

  setId(id: string) {
    if (!this.form.controls['id'].errors) {
      this.errorMessage = "";
      this.configuration.id = id;
    }
    else {
      console.log(this.form.controls['id'].errors);
      if (this.form.controls['id'].errors['required']) {
        this.errorMessage = "El identificador no puede estar vacío.";
      }
      if (this.form.controls['id'].errors['pattern']) {
        this.errorMessage = "El identificador contiene caracteres no válidos. Solo puede contener caracteres alfanuméricos, puntos, guiones y/o guiones bajos.";
      }
      if (this.form.controls['id'].errors['maxlength']) {
        this.errorMessage = "El identificdor no puede contener más de 20 caracteres.";
      }
    }
  }

  setCamAlign(camAlign: Align) {
    this.configuration.style.camAlign = camAlign;
  }

  saveChanges() {
    if (this.form.valid) {
      this.appsService.put(this.configuration, this.idConfig).subscribe(
        res => {
          this.appsService.uploadAppFiles(this.configuration).subscribe(
            res => {
              this.saved = true;
              this.saveMessage = "Se han guardado correctamente los cambios en la aplicación.";
              this.idConfig = this.configuration.id;
              this.router.navigate(['/edit'], { queryParams: { id: this.configuration.id } });
            },
            err => {
              this.saved = false;
              this.saveMessage = "No se han podido actualizar los datos correctamente. Hubo un error a la hora de crear el directorio: " + this.configuration.id;
              console.log(err);
            }
          );
        },
        err => {
          this.saved = false;
          this.saveMessage = "No se han podido actualizar los datos correctamente. Por favor, revisa que el id no coincida con el id de otra aplicación.";
          console.log(err);
        }
      );
    }
    else {
      this.saveMessage = "No se han podido guardar los cambios de la aplicación correctamente. Por favor, revisa los campos del formulario.";
    }
  }

  closeMessage() {
    this.saveMessage = "";
  }
}