import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Configuration } from 'src/app/models/configuration.model';
import { Align } from 'src/app/models/style.model';
import { AppsService } from 'src/app/services/apps.service';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {
  @ViewChild('description') description: any;
  @ViewChild('title') title: any;
  @Input() configuration: Configuration;
  Align = Align;
  form: FormGroup;
  message: string = "";
  success: boolean = true;

  constructor(private fb: FormBuilder, private appsService: AppsService) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      title: [
        this.configuration.title,
        Validators.compose([
          Validators.required,
          Validators.maxLength(30),
        ]),
      ],
      description: [
        this.configuration.description,
        Validators.compose([
          Validators.maxLength(200)
        ]),
      ],
    });

  }

  setTextAlign(textAlign: Align) {
    this.configuration.style.textAlign = textAlign;
  }

  setCamAlign(camAlign: Align) {
    this.configuration.style.camAlign = camAlign;
  }

  setTitle(title: string) {
    if (!this.form.controls['title'].errors) {
      this.configuration.title = title;
    }
  }

  setDescription(description: string) {
    if (!this.form.controls['description'].errors) {
      this.configuration.description = description;
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    const allowedFormats = ["json", "bin"];
    const bins = [];
    let model;

    //filtro de archivos
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const extension = file.name.split(".").pop();

      if (extension == "json") {
        model = file;
      }
      if (extension == "bin") {
        bins.push(file);
      }
    }
    this.configuration.modelURL = model.webkitRelativePath;
  }

  download() {
    const html = "<div id='main'>\n<h1>" + this.configuration.title + "</h1>\n<p>" + this.configuration.description + "</p>\n</div>\n";
    const css = "body {background-color:" + this.configuration.style.backgroundColor + "; color: " + this.configuration.style.contentColor + "}\nh1 {color: " + this.configuration.style.titleColor + "}";
    const js = '';
    const zip = new JSZip();

    zip.file("index.html", html);
    zip.file("style.css", css);
    zip.file("script.js", js);

    zip.generateAsync({ type: "blob" }).then(function (content) {
      saveAs(content, "app.zip");
    });
  }

  addConfig() {
    if (this.appsService.addConfig(this.configuration)) {
      this.message = "Se ha añadido correctamente la aplicación actual a la lista.";
      this.success = true;
    }
    else {
      this.message = "La configuración actual no puede añadirse a la lista, ya existe otra configuración con el mismo título.";
      this.success = false;
    }
  }

  closeMessage() {
    this.message = "";
  }
}