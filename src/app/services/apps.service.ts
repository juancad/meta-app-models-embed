import { Injectable } from '@angular/core';
import { Application } from '../models/application.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AppsService {
  baseUrl: string;
  user: User = null;
  private loggedInKey = 'loggedInUser';

  constructor(private http: HttpClient) {
    this.baseUrl = "http://localhost/meta-app-models";
    const storedUser = localStorage.getItem(this.loggedInKey);
    this.user = storedUser ? JSON.parse(storedUser) : null;
  }

  saveCoockies() {
    localStorage.setItem(this.loggedInKey, JSON.stringify(this.user));
  }

  login(id: string, password: string, type: boolean): Observable<User> {
    let url = this.baseUrl;
    const body = { id: id, password: password };

    if (type) {
      url += "/controller/loginByUsername.php";
    }
    else {
      url += "/controller/loginByEmail.php";
    }

    return this.http.post<User>(url, body);
  }

  logout(): void {
    this.user = null;
    localStorage.removeItem(this.loggedInKey);
  }

  register(user: User, password: string): Observable<User> {
    const body = { user, password: password };
    return this.http.post<User>(this.baseUrl + "/controller/postUser.php", JSON.stringify(body));
  }

  getUser(): Observable<User> {
    return this.http.get<User>(this.baseUrl + "/controller/getUser.php?username=" + this.user.username);
  }

  putUser(newusername: string, newemail: string, password: string) {
    const body = { user: this.user, newusername: newusername, newemail: newemail, password: password };
    return this.http.put(this.baseUrl + "/controller/putUser.php", JSON.stringify(body));
  }

  changePassword(password: string, newpassword: string) {
    const body = { username: this.user.username, password: password, newpassword: newpassword };
    return this.http.put(this.baseUrl + "/controller/changePassword.php", JSON.stringify(body));
  }

  getApp(id: string): Observable<Application> {
    return this.http.get<Application>(this.baseUrl + "/controller/getApp.php?id=" + id + "&username=" + this.user.username);
  }

  postApp(app: Application) {
    return this.http.post(this.baseUrl + "/controller/postApp.php?username=" + this.user.username, JSON.stringify(app));
  }

  putApp(app: Application, oldid: string) {
    return this.http.put(this.baseUrl + "/controller/putApp.php?oldid=" + oldid + "&username=" + this.user.username, JSON.stringify(app));
  }

  deleteApp(id: string) {
    return this.http.delete(this.baseUrl + "/controller/deleteApp.php?id=" + id + "&username=" + this.user.username);
  }

  uploadAppFiles(app: Application) {
    const html = this.createHTML(app);
    const css = this.createCSS(app);
    const js = this.createJS(app);
    const formData = new FormData();
    const headers = new HttpHeaders();

    formData.append('indexFile', html, html.name);
    formData.append('cssFile', css, css.name);
    formData.append('jsFile', js, js.name);

    return this.http.post(this.baseUrl + "/controller/uploadAppFiles.php?id=" + app.id + "&username=" + this.user.username, formData, { headers });
  }

  uploadModelFIles(id: string, json: File, bin: FileList) {
    const formData = new FormData();
    formData.append('json', json, json.name);

    for (let i = 0; i < bin.length; i++) {
      formData.append('bin[]', bin[i], bin[i].name);
    }

    return this.http.post(this.baseUrl + "/controller/uploadModelFiles.php?id=" + id + "&username=" + this.user.username, formData);
  }

  downloadApp(id: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = { headers: headers, responseType: 'blob' as 'json' };
    const rutaDirectorio = "../users/" + this.user.username + "/" + id;
    const rutaCodificada = encodeURIComponent(rutaDirectorio);

    this.http.get(this.baseUrl + `/controller/downloadApp.php?ruta=${rutaCodificada}`, options)
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
    window.open(`${this.baseUrl}/users/${this.user.username}/${id}/index.html`, "_blank");
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