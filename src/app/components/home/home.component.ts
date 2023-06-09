import { Component, OnInit } from '@angular/core';
import { AppsService } from 'src/app/services/apps.service';
import { Application } from 'src/app/models/application.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  title: string;
  selectedApp: Application;
  deleteAppId: string;

  constructor(private appsService: AppsService, private router: Router) {
    this.title = "meta-app-models";
    this.deleteAppId = null;
    this.selectedApp = null;
  }

  ngOnInit(): void {
    this.appsService.login(this.appsService.user.username, this.appsService.user.password, true).subscribe(
      res => {
        if (this.getApps().length > 0) {
          this.selectedApp = this.getApps()[this.getApps().length - 1];
        }
      },
      err => {
        console.error(err);
        this.router.navigate(['/404']);
      }
    );
  }

  getApps(): Array<Application> {
    return this.appsService.user.apps;
  }

  getSelectedApp(): Application {
    return this.selectedApp;
  }

  getUsername(): string {
    return this.appsService.user.username;
  }

  setSelectedApp(app: Application): void {
    this.selectedApp = app;
  }

  setDeleteAppId(id: string) {
    this.deleteAppId = id;
  }

  onDelete() {
    this.appsService.delete(this.deleteAppId).subscribe(
      res => {
        location.reload(); // vuelve a cargar para actualizar la lista
      },
      err => {
        console.error(err);
      }
    );
  }

  download(id: string) {
    this.appsService.getFolder(id);
  }

  view(id: string) {
    this.appsService.view(id);
  }

  openEdit() {
    this.router.navigate(['/edit'], { queryParams: { id: this.selectedApp.id } });
  }

  logout() {
    this.appsService.logout();
    this.router.navigate(['']);
  }
}