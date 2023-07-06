import { Component, Input } from '@angular/core';
import { AppsService } from 'src/app/services/apps.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
/**
 * Componente para contener la barra de navegación de la aplicación-
 */
export class NavbarComponent {
  title: String;

  constructor(private appsService: AppsService, private router: Router) {
    this.title = "Incrustado de modelos";
  }
}
