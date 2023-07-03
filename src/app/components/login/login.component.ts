import { Component } from '@angular/core';
import { AppsService } from 'src/app/services/apps.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  message: string;
  form: FormGroup;

  constructor(private appsService: AppsService, private router: Router, private fb: FormBuilder) {
    this.message = "";
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login() {
    const id = this.form.value.username;
    const password = this.form.value.password;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    let type: boolean = true;

    if (this.form.valid) {
      if (emailPattern.test(id)) {
        type = false;
      }
      this.appsService.login(id, password, type).subscribe(
        res => {
          this.appsService.user = res;
          this.appsService.saveCoockies();
          this.router.navigate(['/home']);
        },
        err => {
          console.log(err.status);
          if (err.status === 401) {
            this.message = "Las credenciales no son válidas. Por favor verifica la identificación o la contraseña.";
          }
          else {
            this.message = "Hay un problema con el servidor por el cual no se puede iniciar sesión. Inténtelo de nuevo más tarde.";
          }
        }
      );
    } else {
      this.message = "No se puede iniciar sesión, por favor introduce todos los datos requeridos.";
    }
  }
}
