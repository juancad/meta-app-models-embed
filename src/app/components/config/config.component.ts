import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Configuration } from 'src/app/models/configuration.model';
import { Align } from 'src/app/models/style.model';
import { Style } from 'src/app/models/style.model';
import { Category } from 'src/app/models/category.model';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {
  @ViewChild('description') description: any;
  @ViewChild('title') title: any;
  configuration: Configuration;
  Align = Align;
  form: FormGroup;
  mensaje: string;

  constructor(private fb: FormBuilder) {
    const style = new Style("#000000", "#000000", "#FFFFFF", "Calibri", Align.center, Align.center);
    const categories = new Array<Category>;
    categories.push(new Category("Gato", 0, 0.5));
    categories.push(new Category("Perro", 0.5, Number.MAX_SAFE_INTEGER));
    this.configuration = new Configuration("Perros y gatos", "", "./assets/perros-gatos/model.json", 100, 100, style, categories);
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
}
