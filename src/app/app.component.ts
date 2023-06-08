import { Component } from '@angular/core';
import { AppsService } from './services/apps.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Kanbase';

  constructor(private appsService: AppsService, private router: Router) {
  }

  ngOnInit() {
    setTimeout(() => {
      if (this.appsService.user != null && (this.router.url === '/' || this.router.url === '')) {
        this.router.navigate(['/home']);
      } else if (this.appsService.user == null && (this.router.url === '/' || this.router.url === '')) {
        this.router.navigate(['/login']);
      }
    }, 0);
  }
}