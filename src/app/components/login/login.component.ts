import { Component } from '@angular/core';
import { AppsService } from 'src/app/services/apps.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  message: string;

  constructor(private appsService: AppsService, private router: Router) {
  }

  login() {
    this.appsService.login('Juan', '1234', true).subscribe(() => {
      this.router.navigate(['/home']);
    });
  }
}
