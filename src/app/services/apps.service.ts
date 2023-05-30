import { Injectable } from '@angular/core';
import { Configuration } from '../models/configuration.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppsService {
  baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = "http://localhost/meta-app-models";
  }

  get(): Observable<Configuration[]> {
    return this.http.get<Configuration[]>(this.baseUrl + "/config/get.php");
  }

  getById(id: string): Observable<Configuration> {
    return this.http.get<Configuration>(this.baseUrl + "/config/getById.php?id=" + id);
  }

  post(config: Configuration) {
    const html = this.createHTML(config);
    const css = this.createCSS(config);
    const js = this.createJS(config);
    const formData = new FormData();
    const headers = new HttpHeaders();

    formData.append('indexFile', html, html.name);
    formData.append('cssFile', css, css.name);
    formData.append('jsFile', js, js.name);
    formData.append('config', JSON.stringify(config));

    headers.append('Accept', 'application/json');

    return this.http.post(this.baseUrl + "/config/post.php", formData, { headers });
  }

  put(config: Configuration, oldid: string) {
    return this.http.put(this.baseUrl + "/config/put.php?oldid=" + oldid, JSON.stringify(config));
  }

  putFolderFiles(config: Configuration) {
    const html = this.createHTML(config);
    const css = this.createCSS(config);
    const js = this.createJS(config);
    const formData = new FormData();
    const headers = new HttpHeaders();

    formData.append('indexFile', html, html.name);
    formData.append('cssFile', css, css.name);
    formData.append('jsFile', js, js.name);

    return this.http.post(this.baseUrl + "/config/putFolderFiles.php?folder=" + config.id, formData, { headers });
  }

  delete(id: string) {
    return this.http.delete(this.baseUrl + "/config/delete.php?id=" + id);
  }

  getFolder(id: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = { headers: headers, responseType: 'blob' as 'json' };
    const rutaDirectorio = "../assets/" + id;
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
    window.open(`${this.baseUrl}/assets/${id}/index.html`, "_blank");
  }

  createHTML(config: Configuration): File {
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

  createCSS(config: Configuration): File {
    const CSSContent = "body {\n" +
      "\tbackground-color: " + config.style.backgroundColor + ";\n" +
      "\tfont-family: " + config.style.font + ";\n" +
      "\tcolor: " + config.style.textColor + ";\n" +
      "}\n\n";

    const blob = new Blob([CSSContent], { type: 'text/css' });
    const css = new File([blob], 'styles.css', { type: 'text/css' });

    return css;
  }

  createJS(config: Configuration): File {
    const JSContent = "";

    const blob = new Blob([JSContent], { type: 'text/javascript' });
    const js = new File([blob], 'script.js', { type: 'text/javascript' });

    return js;
  }
}