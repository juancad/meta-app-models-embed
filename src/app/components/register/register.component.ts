import { Component } from '@angular/core';
import { AppsService } from 'src/app/services/apps.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  message: string;
  form: FormGroup;
  checked: boolean = false;

  constructor(private appsService: AppsService, private router: Router, private fb: FormBuilder) {
    this.message = "";

    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9ñÑ._-]+$/)]],
      email: ['', [Validators.required, Validators.maxLength(255), Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(60)]],
      rpassword: ['', [Validators.required]],
      checkbox: ['', Validators.requiredTrue]
    });
  }

  register() {
    const username = this.form.value.username;
    const email = this.form.value.email;
    const password = this.form.value.password;
    const rpassword = this.form.value.rpassword;
    const user = new User(username, email, []);

    if (password == rpassword) {
      if (this.form.valid) {
        this.appsService.register(user, password).subscribe( // añade la configuración a la base de datos
          res => {
            this.appsService.user = user;
            this.appsService.saveCoockies();
            this.router.navigate(['/home']);
          },
          err => {
            console.log(err);
            if (err.status === 409) {
              this.message = "El nombre de usuario o correo ya está registrado en la aplicación. Por favor, prueba con uno diferente.";
            }
            else {
              this.message = "Hay un problema con el servidor por el cual no se puede registrar una cuenta nueva en estos momentos. Inténtelo de nuevo más tarde.";
            }
          });
      }
    }
    else {
      this.message = "Las contraseñas no coinciden."
    }
  }
}