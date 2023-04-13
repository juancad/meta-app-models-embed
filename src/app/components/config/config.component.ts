import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Configuration } from 'src/app/models/configuration.model';
import { Align } from 'src/app/models/style.model';
import { AppsService } from 'src/app/services/apps.service';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Category } from 'src/app/models/category.model';

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
  fontList: { name: string; value: string; }[];

  constructor(private fb: FormBuilder, private appsService: AppsService) {
    this.fontList = [
      { name: 'Arial', value: 'Arial, sans-serif' },
      { name: 'Verdana', value: 'Verdana, sans-serif' },
      { name: 'Helvetica', value: 'Helvetica, sans-serif' },
      { name: 'Times New Roman', value: 'Times New Roman, serif' },
      { name: 'Courier New', value: 'Courier New, monospace' }
    ];
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
          Validators.maxLength(300)
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
    for (const element of files) {
      const file = element
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
    const html = "<!DOCTYPE html>\n" +
      "<html>\n" +
      "\t<head>\n" +
      "\t\t<link rel=\"stylesheet\" href=\"styles.css\">\n" +
      "\t</head>\n\n" +
      "\t<body>\n" +
      "\t\t<h1>" + this.configuration.title + "</h1>\n" +
      "\t\t<p>" + this.configuration.description + "</p>\n" +
      "\t\t<script src=\"script.js\"></script>\n" +
      "\t</body>\n" +
      "</html>";
    const css = "body {\n" +
      "\tbackground-color: " + this.configuration.style.backgroundColor + ";\n" +
      "\tcolor: " + this.configuration.style.contentColor + ";\n" +
      "\tfont-family: " + this.configuration.style.contentFontFamily + ";\n" +
      "}\n\n" +
      "h1 {\n" +
      "\tcolor: " + this.configuration.style.titleColor + ";\n" +
      "\tfont-family: " + this.configuration.style.titleFontFamily + ";\n" +
      "}";
    const js = "";
    var zip = new JSZip();

    zip.file("index.html", html);
    zip.file("styles.css", css);
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

  addCategory() {
    this.configuration.categories.push(new Category("Nombre categoría", null, null));
  }

  closeMessage() {
    this.message = "";
  }

  deleteCategory(category: Category) {
    const index = this.configuration.categories.indexOf(category);
    if (index !== -1) {
      this.configuration.categories.splice(index, 1);
    }
  }
}