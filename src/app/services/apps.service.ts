import { Injectable } from '@angular/core';
import { Application } from '../models/application.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AppsService {
  baseUrl: string;
  user: User;
  private loggedInKey = 'loggedInUser';

  constructor(private http: HttpClient, private router: Router) {
    this.baseUrl = "http://localhost/meta-app-models";
    const storedUser = localStorage.getItem(this.loggedInKey);
    this.user = storedUser ? JSON.parse(storedUser) : null;
  }

  login(id: string, password: string, loginByUsername: boolean): Observable<boolean> {
    let url = this.baseUrl;
    const body = { id: id, password: password };

    if (loginByUsername) {
      url += "/config/getByUsername.php";
    }
    else {
      url += "/config/getByEmail.php";
    }

    return new Observable<boolean>(observer => {
      this.http.post<User>(url, body).subscribe(
        res => {
          this.user = res;
          // Almacenar los datos del usuario en el localStorage
          localStorage.setItem(this.loggedInKey, JSON.stringify(this.user));
          observer.next(true);
          observer.complete();
        },
        err => {
          console.log(err);
          observer.next(false);
          observer.complete();
        }
      )
    });
  }

  logout(): void {
    this.user = null;
    localStorage.removeItem(this.loggedInKey);
  }

  getById(id: string): Observable<Application> {
    return this.http.get<Application>(this.baseUrl + "/config/getById.php?id=" + id + "&username=" + this.user.username);
  }

  post(app: Application) {
    return this.http.post(this.baseUrl + "/config/post.php", JSON.stringify(app));
  }

  put(config: Application, oldid: string) {
    return this.http.put(this.baseUrl + "/config/put.php?oldid=" + oldid, JSON.stringify(config));
  }

  uploadAppFiles(config: Application) {
    const html = this.createHTML(config);
    const css = this.createCSS(config);
    const js = this.createJS(config);
    const formData = new FormData();
    const headers = new HttpHeaders();

    formData.append('indexFile', html, html.name);
    formData.append('cssFile', css, css.name);
    formData.append('jsFile', js, js.name);

    return this.http.post(this.baseUrl + "/config/uploadAppFiles.php?id=" + config.id + "&username=" + this.user.username, formData, { headers });
  }

  uploadModelFIles(id: string, json: File, bin: FileList) {
    const formData = new FormData();
    formData.append('json', json, json.name);

    for (let i = 0; i < bin.length; i++) {
      formData.append('bin[]', bin[i], bin[i].name);
    }

    return this.http.post(this.baseUrl + "/config/uploadModelFiles.php?id=" + id + "&username=" + this.user.username, formData);
  }

  delete(id: string) {
    return this.http.delete(this.baseUrl + "/config/delete.php?id=" + id + "&username=" + this.user.username);
  }

  getFolder(id: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = { headers: headers, responseType: 'blob' as 'json' };
    const rutaDirectorio = "../apps/" + this.user.username + "/" + id;
    const rutaCodificada = encodeURIComponent(rutaDirectorio);

    this.http.get(this.baseUrl + `/config/download.php?ruta=${rutaCodificada}`, options)
      .subscribe((response: any) => {
        const blob = new Blob([response], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.download = 'app.zip';
        anchor.href = url;
        anchor.click();
      });
  }

  view(id: string) {
    window.open(`${this.baseUrl}/apps/${this.user.username}/${id}/index.html`, "_blank");
  }

  createHTML(config: Application): File {
    const HTMLContent = "<!DOCTYPE html>\n" +
      "<html>\n" +
      "\t<head>\n" +
      "\t\t<link rel=\"stylesheet\" href=\"styles.css\">\n" +
      "\t</head>\n\n" +
      "\t<body>\n" +
      "\t\t" + config.title + "\n" +
      "\t\t" + config.description + "\n" +
      "\t\t<script src=\"script.js\"></script>\n" +
      "\t</body>\n" +
      "</html>";

    const blob = new Blob([HTMLContent], { type: 'text/html' });
    const html = new File([blob], 'index.html', { type: 'text/html' });

    return html;
  }

  createCSS(config: Application): File {
    const CSSContent = "body {\n" +
      "\tbackground-color: " + config.style.backgroundColor + ";\n" +
      "\tfont-family: " + config.style.font + ";\n" +
      "\tcolor: " + config.style.textColor + ";\n" +
      "}\n\n";

    const blob = new Blob([CSSContent], { type: 'text/css' });
    const css = new File([blob], 'styles.css', { type: 'text/css' });

    return css;
  }

  createJS(config: Application): File {
    const JSContent = "";

    const blob = new Blob([JSContent], { type: 'text/javascript' });
    const js = new File([blob], 'script.js', { type: 'text/javascript' });

    return js;
  }
}