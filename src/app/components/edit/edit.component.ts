import { Component, Input } from '@angular/core';
import { Application } from 'src/app/models/application.model';
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
/**
 * Componente para el editor de aplicaciones.
 */
export class EditComponent {
  @Input() appId: string;
  app: Application;
  loaded: boolean; //configuración cargada correctamente
  Align = Align;
  form: FormGroup;
  errorMessage: string;
  editorTitle: Editor;
  editorDesc: Editor;
  toolbar: Toolbar;
  colorPresets: Array<string>;
  fontList: { name: string; value: string; }[];
  saveMessage: string;
  saved: boolean; // se han guardado los cambios o no

  constructor(private appsService: AppsService, private route: ActivatedRoute, private fb: FormBuilder, private router: Router) {
    if (this.appsService.user == null) {
      this.router.navigate(['/404']);
    }

    this.errorMessage = "";
    this.saveMessage = "";
    this.loaded = false;
    this.saved = false;
    this.editorTitle = new Editor();
    this.editorDesc = new Editor();

    this.route.queryParams.subscribe(
      res => {
        this.appId = res['id'];
        this.appsService.getApp(this.appId).subscribe(
          res => {
            this.app = res;
            this.loaded = true;

            this.form = this.fb.group({
              id: [
                this.app.id,
                Validators.compose([
                  Validators.required,
                  Validators.maxLength(20),
                  Validators.pattern(/^[a-zA-Z0-9ñÑ._-]+$/)
                ]),
              ],
              title: [
                this.app.title,
                Validators.compose([
                  Validators.required,
                  Validators.minLength(10),
                  Validators.maxLength(1000)
                ]),
              ],
              description: [
                this.app.description,
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

  /**
   * Añade una nueva categoría a la lista de categorías de la instancia de Application.
   */
  addCategory() {
    this.app.categories.push(new Category("Nombre categoría", null, null));
  }

  /**
   * Eliimna una categoría de la lista de categoráis de la instancia de Application.
   * @param category categoría a eliminar
   */
  deleteCategory(category: Category) {
    const index = this.app.categories.indexOf(category);
    if (index !== -1) {
      this.app.categories.splice(index, 1);
    }
  }

  /**
   * Cambia el título de la instancia de Application recogiendo los datos del editor del título, si tiene la longitud adecuada.
   * @param newTitle nuevo título de la aplicación
   */
  setTitle(newTitle: any) {
    if (!this.form.controls['title'].errors) {
      this.errorMessage = "";
      this.app.title = newTitle;

      this.app = Object.assign({}, this.app);
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

  /**
  * Cambia la descripción de la instancia de Application recogiendo los datos del editor de la descripción, si tiene la longitud adecuada.
  * @param newTitle nuevo título de la aplicación
  */
  setDescription(newDescription: any) {
    if (!this.form.controls['description'].errors) {
      this.errorMessage = "";
      this.app.description = newDescription;
      this.app = Object.assign({}, this.app);
    }
    else {
      if (this.form.controls['description'].errors['maxlength']) {
        this.errorMessage = "La descripción de la aplicación no puede contener más de 15000 caracteres.";
      }
    }
  }

  /**
   * Cambia el id de la instancia de Application recogiendo el dato del formulario si cumple con las normas del id.
   * @param id nuevo id de la aplicación
   */
  setId(id: string) {
    if (!this.form.controls['id'].errors) {
      this.errorMessage = "";
      this.app.id = id;
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

  /**
   * Cambia la alineación de la cámara de la isntancia de Application.
   * @param camAlign nueva alineación de la cámara
   */
  setCamAlign(camAlign: Align) {
    this.app.style.camAlign = camAlign;
  }

  /**
   * Guarda los cambios, utilizando el método putApp del servicio. Se pasa la instancia de Application con los cambios realizados por el usuario y el anterior id de la aplicación.
   * Genera y sube los archivos nuevos de la aplicación al servidor, utilizando el método uploadAppFiles.
   * Una vez guardados los cambios y subidos los archivos vuelve a cargar la información del usuario con los nuevos cambios en la instancia del servicio y las cookies. Vuelve a cargar el editor con el nuevo id de aplicación por si ha cambiado.
   * Si se producen errores los muestra en el mensaje.
   */
  saveChanges() {
    if (this.form.valid) {
      this.appsService.putApp(this.app, this.appId).subscribe(
        res => {
          this.appsService.uploadAppFiles(this.app).subscribe(
            res => {
              this.appsService.getUser().subscribe(
                res => {
                  this.appsService.user = res;
                  this.appsService.saveCoockies();
                  this.saved = true;
                  this.saveMessage = "Se han guardado correctamente los cambios en la aplicación.";
                  this.appId = this.app.id;
                  this.router.navigate(['/edit'], { queryParams: { id: this.app.id } });
                },
                err => {
                  console.log(err);
                  this.appsService.logout();
                  this.router.navigate(['']);
                }
              );
            },
            err => {
              console.log(err);
              this.saved = false;
              this.saveMessage = "No se han podido actualizar los datos correctamente. Hubo un error a la hora de modificar el directorio.";
            }
          );
        },
        err => {
          console.log(err);
          this.saved = false;
          this.saveMessage = "No se han podido actualizar los datos correctamente. Por favor, revisa que el id no coincida con el id de otra aplicación.";
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