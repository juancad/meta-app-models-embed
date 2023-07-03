import { Component } from '@angular/core';
import { AppsService } from 'src/app/services/apps.service';
import { Application } from 'src/app/models/application.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
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

  download(id: string) {
    this.appsService.downloadApp(id);
  }

  view(id: string) {
    this.appsService.view(id);
  }

  openEdit() {
    this.router.navigate(['/edit'], { queryParams: { id: this.selectedApp.id } });
  }

  editProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.appsService.logout();
    this.router.navigate(['']);
  }
}