import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppsService } from 'src/app/services/apps.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  formProfile: FormGroup;
  formPassword: FormGroup;
  profileMessage: string;
  passwordMessage: string;
  savedProfile: boolean;
  savedPassword: boolean;

  constructor(private appsService: AppsService, private fb: FormBuilder, private router: Router) {
    this.profileMessage = '';
    this.passwordMessage = '';
    this.savedProfile = false;
    this.savedPassword = false;

    if (this.appsService.user == null) {
      this.router.navigate(['/404']);
    }

    this.formProfile = this.fb.group({
      username: [this.appsService.user.username, [Validators.required, Validators.minLength(4), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9ñÑ._-]+$/)]],
      email: [this.appsService.user.email, [Validators.required, Validators.maxLength(255), Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      password: ['', [Validators.required]]
    });

    this.formPassword = this.fb.group({
      newpassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(60)]],
      rnewpassword: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  changePassword() {
    if (this.formPassword.value.newpassword == this.formPassword.value.rnewpassword) {
      if (this.formPassword.valid) {
        this.appsService.changePassword(this.formPassword.value.password, this.formPassword.value.newpassword).subscribe( // añade la configuración a la base de datos
          res => {
            this.savedPassword = true;
            this.passwordMessage = "Se ha cambiado la contraseña correctamente.";
          },
          err => {
            console.log(err);
            this.savedPassword = false;
            switch (err.status) {
              case 401:
                this.passwordMessage = "La contraseña introducida no es correcta, por favor introduce tu contraseña correctamente.";
                break;
              case 409:
                this.passwordMessage = "No se ha podido cambiar la contraseña.";
                break;
              default:
                this.passwordMessage = "Hay un problema con el servidor por el cual no se puede cambiar la contraseña en estos momentos. Inténtelo de nuevo más tarde.";
            }
          });
      }
    }
    else {
      this.passwordMessage = "Las contraseñas no coinciden.";
    }
  }

  putUser() {
    if (this.formProfile.valid) {
      this.appsService.putUser(this.formProfile.value.username, this.formProfile.value.email, this.formProfile.value.password).subscribe( // añade la configuración a la base de datos
        res => {
          this.appsService.user.username = this.formProfile.value.username;
          this.appsService.getUser().subscribe(
            res => {
              this.appsService.user = res;
              this.appsService.saveCoockies();
              this.savedProfile = true;
              this.profileMessage = "Se han guardado los cambios correctamente.";
            },
            err => {
              console.log(err);
              this.appsService.logout();
              this.router.navigate(['']);
            }
          );
        },
        err => {
          console.log(err);
          this.savedProfile = false;
          switch (err.status) {
            case 401:
              this.profileMessage = "La contraseña introducida no es correcta, por favor introduce tu contraseña correctamente.";
              break;
            case 409:
              this.profileMessage = "El nombre de usuario o correo ya está registrado en la aplicación. Por favor, prueba con uno diferente.";
              break;
            default:
              this.profileMessage = "Hay un problema con el servidor por el cual no se puede actualizar tu cuenta en estos momentos. Inténtelo de nuevo más tarde.";
          }
        });
    }
  }
}
