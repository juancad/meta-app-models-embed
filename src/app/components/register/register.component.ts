import { Component } from '@angular/core';
import { AppsService } from 'src/app/services/apps.service';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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

    if (password == rpassword) {
      if (this.form.valid) {
        this.appsService.register(new User(username, password, email, [])).subscribe( // añade la configuración a la base de datos
          res => {
            this.appsService.login(username, password, true).subscribe(
              res => {
                if (res) {
                  this.router.navigate(['/home']);
                }
                else {
                  this.message = "Se ha registrado el usuario pero no se ha podido iniciar sesión.";
                }
              },
              err => {
                this.message = "Ha habido un problema al intentar conectar con el servidor para poder iniciar sesión. Inténtelo de nuevo más tarde.";
              });
          },
          err => {
            this.message = "El nombre de usuario o correo ya existe en la base de datos. Por favor, prueba con uno diferente.";
          });
      }
      else {
        this.message = "Las contraseñas no coinciden."
      }
    }
  }
}