import { Component } from '@angular/core';
import { AppsService } from 'src/app/services/apps.service';
import { Application } from 'src/app/models/application.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
/**
 * Componente para la página de inicio.
 */
export class HomeComponent {
  title: string;
  selectedApp: Application;
  deleteAppId: string;

  constructor(private appsService: AppsService, private router: Router) {
    this.title = "meta-app-models";
    this.deleteAppId = null;
    this.selectedApp = null;

    if (this.appsService.user == null) {
      this.router.navigate(['']);
    }

    this.selectedApp = appsService.user.apps[appsService.user.apps.length - 1];
  }

  /**
   * Permite obtener la lista de aplicaciones del usuario.
   * @returns lista de aplicaciones del usuario
   */
  getApps(): Array<Application> {
    return this.appsService.user.apps;
  }

  /**
   * Permite obtener la aplicación seleccionada en la lista de aplicaciones.
   * @returns aplicación seleccionada de la lista.
   */
  getSelectedApp(): Application {
    return this.selectedApp;
  }

  /**
   * Permite obtener el nombre del usuario que tiene la sesión iniciada.
   * @returns nombre del usuario
   */
  getUsername(): string {
    return this.appsService.user.username;
  }

  /**
   * Permite cambiar la aplicación seleccionada de la lista.
   * @param app aplicación nueva seleccionada.
   */
  setSelectedApp(app: Application): void {
    this.selectedApp = app;
  }

  /**
   * Permite seleccionar la aplicación que se va a eilminar.
   * @param id identificador de la aplicación a seleccionar.
   */
  setDeleteAppId(id: string) {
    this.deleteAppId = id;
  }

  /**
   * Elimina la aplicación seleccionada para eliimnar de la lista de aplicaciones, utilizando la función deleteApp del servicio.
   * Si se elimina correctamente se actualizan los datos del usuario identificado, para obtener su nueva lista de aplicaciones, utilizando la función getUser del servicio.
   */
  onDelete() {
    this.appsService.deleteApp(this.deleteAppId).subscribe(
      res => {
        this.appsService.getUser().subscribe(
          res => {
            this.appsService.user = res;
            this.appsService.saveCoockies();
            if (res.apps.length > 0) {
              this.selectedApp = res.apps[res.apps.length - 1];
            }
          },
          err => {
            console.log(err);
            this.appsService.logout();
            this.router.navigate(['']);
          }
        );
      },
      err => {
        console.error(err);
      }
    );
  }

  /**
   * Permite descargar una aplicación de la lista utilizando la función downloadApp del servicio.
   * @param id 
   */
  download(id: string) {
    this.appsService.downloadApp(id);
  }

  /**
   * Permite ver una aplicación de la lista utilizando la función view del servicio.
   * @param id 
   */
  view(id: string) {
    this.appsService.view(id);
  }

  /**
   * Abre el editor de aplicaciones, se le pasa a la ruta la aplicación seleccionada.
   */
  openEdit() {
    this.router.navigate(['/edit'], { queryParams: { id: this.selectedApp.id } });
  }

  /**
   * Abre el editor del perfil del usuario navegando.
   */
  editProfile() {
    this.router.navigate(['/profile']);
  }

  /**
   * Cierra la sesión del usuario.
   */
  logout() {
    this.appsService.logout();
    this.router.navigate(['']);
  }
}