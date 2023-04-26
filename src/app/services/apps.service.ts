import { Injectable } from '@angular/core';
import { Configuration } from '../models/configuration.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

@Injectable({
  providedIn: 'root'
})
export class AppsService {
  baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = "http://localhost/meta-app-models";
  }

  get() {
    return this.http.get<Configuration[]>(this.baseUrl + "/config/get.php");
  }

  post(config: Configuration) {
    return this.http.post(this.baseUrl + "/config/post.php", JSON.stringify(config));
  }

  put(config: Configuration, id: string) {
    return this.http.put(this.baseUrl + "/config/put.php?id=" + id, JSON.stringify(config));
  }

  delete(id: string) {
    return this.http.delete(this.baseUrl + "/config/delete.php?id=" + id);
  }


  getFolder(id: string) {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/zip',
        Accept: 'application/zip',
        responseType: 'blob',
      }),
      observe: 'response' as 'response',
      responseType: 'blob' as 'json',
    };

    return this.http.get(this.baseUrl + "/config/getFolder.php?id=" + id, options);
  }

  /*
  download(id: string) {
    const url = this.baseUrl + "/config/getFolder.php?id=" + id;

    this.http.get<string[]>(url).subscribe(files => {
      const zip = new JSZip();
      const folder = zip.folder('app');
      files.forEach(file => {
        // agrega cada archivo al objeto de la carpeta
        folder.file(file, file);
      });
      // crea el archivo zip
      zip.generateAsync({ type: 'blob' }).then(blob => {
        // descarga el archivo zip en el navegador
        saveAs(blob, 'app.zip');
      });
    });
  }
  */

  view(id: string) {
    window.open(`${this.baseUrl}/assets/${id}/index.html`, "_blank");
  }

  createFolder(config: Configuration) {
    console.log(config.id);
    const htmlContent = "<!DOCTYPE html>\n" +
      "<html>\n" +
      "\t<head>\n" +
      "\t\t<link rel=\"stylesheet\" href=\"styles.css\">\n" +
      "\t</head>\n\n" +
      "\t<body>\n" +
      "\t\t<h1>" + config.title + "</h1>\n" +
      "\t\t<p>" + config.description + "</p>\n" +
      "\t\t<script src=\"script.js\"></script>\n" +
      "\t</body>\n" +
      "</html>";

    const cssContent = "body {\n" +
      "\tbackground-color: " + config.style.backgroundColor + ";\n" +
      "\tcolor: " + config.style.contentColor + ";\n" +
      "\tfont-family: " + config.style.contentFontFamily + ";\n" +
      "}\n\n" +
      "h1 {\n" +
      "\tcolor: " + config.style.titleColor + ";\n" +
      "\tfont-family: " + config.style.titleFontFamily + ";\n" +
      "}";

    const jsContent = "";

    let blob = new Blob([htmlContent], { type: 'text/html' });
    const html = new File([blob], 'index.html', { type: 'text/html' });
    blob = new Blob([cssContent], { type: 'text/css' });
    const css = new File([blob], 'styles.css', { type: 'text/css' });
    blob = new Blob([jsContent], { type: 'text/javascript' });
    const js = new File([blob], 'script.js', { type: 'text/javascript' });

    const formData = new FormData();
    formData.append('folderName', config.id);
    formData.append('indexFile', html, html.name);
    formData.append('cssFile', css, css.name);
    formData.append('jsFile', js, js.name);

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    headers.append('Accept', 'application/json');

    return this.http.post(this.baseUrl + "/config/createFolder.php", formData, { headers });
  }
}