import { Component, OnInit } from '@angular/core';
import { AppsService } from 'src/app/services/apps.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  message: string;
  form: FormGroup;

  constructor(private appsService: AppsService, private router: Router, private fb: FormBuilder) {
    this.message = "";
  }

  ngOnInit(): void {
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
      if (emailPattern.test(id)) { //si es un correo electrónico
        type = false;
      }
      this.appsService.login(id, password, type).subscribe(
        res => {
          if (res) {
            this.router.navigate(['/home']);
          }
          else {
            this.message = "Los datos introducidos no se encuentran registrados en la aplicación. Por favor verifica la identificación o la contraseña.";
          }
        },
        err => {
          this.message = "Ha habido un problema al intentar conectar con el servidor para poder iniciar sesión. Inténtelo de nuevo más tarde.";
        });
    }
    else {
      this.message = "No se puede iniciar sesión, por favor introduce todos los datos requeridos."
    }
  }
}
