import { Component } from '@angular/core';
import { AppsService } from 'src/app/services/apps.service';
import { Configuration } from 'src/app/models/configuration.model';
import { Category } from 'src/app/models/category.model';
import { Align, Style } from 'src/app/models/style.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  title;
  configurations: Configuration[];
  selectedConfig: Configuration;
  deleteConfigId: string;
  configLoaded;
  json: File;
  jsonMessage: string;
  jsonFormat: boolean;
  bin: FileList;
  binMessage: string;
  binFormat: boolean;

  constructor(private appsService: AppsService, private router: Router) {
    this.title = "meta-app-models";
    this.configurations = [];
    this.configLoaded = false;
    this.deleteConfigId = null;
    this.jsonMessage = "";
    this.jsonFormat = false;
    this.binFormat = false;
  }

  ngOnInit() {
    this.appsService.get().subscribe(
      res => {
        this.configurations = res;
        if (this.configurations.length > 0) {
          this.selectedConfig = structuredClone(this.configurations[this.configurations.length - 1]);
          this.configLoaded = true;
        }
        else {
          this.createDefaultConfig();
          this.selectedConfig = structuredClone(this.configurations[this.configurations.length - 1]);
          this.configLoaded = true;
        }
      },
      err => {
        console.error(err);
        this.router.navigateByUrl('/404');
      }
    );
  }

  createDefaultConfig() {
    const style = new Style(Align.center, 'Arial', "#FFFFFF", "#353535", true);
    const categories = new Array<Category>;
    categories.push(new Category("Perro", 0, 0.5));
    categories.push(new Category("Gato", 0, 1));

    this.appsService.post(new Configuration("default", "<h1 style='text-align: center'>Perros y gatos</h1>", "", style, categories, true)).subscribe(
      res => {
        location.reload(); // vuelve a cargar para actualizar la lista
        console.log(res);
      },
      err => {
        console.log(err);
      }
    )
  }

  getSelectedConfig(): Configuration {
    return this.selectedConfig;
  }

  setSelectedConfig(config: Configuration): void {
    this.selectedConfig = structuredClone(config);
  }

  setDeleteConfigId(id: string) {
    this.deleteConfigId = id;
  }

  readConfig() {
    this.appsService.get().subscribe(
      res => {
        this.configurations = res;
        if (this.configurations.length > 0) {
          this.selectedConfig = structuredClone(this.configurations[this.configurations.length - 1]);
        }
        else {
          this.createDefaultConfig();
          this.selectedConfig = structuredClone(this.configurations[this.configurations.length - 1]);
        }
      },
      err => {
        console.error(err);
      }
    );
  }

  onDelete() {
    this.appsService.delete(this.deleteConfigId).subscribe(
      res => {
        location.reload(); // vuelve a cargar para actualizar la lista
      },
      err => {
        console.error(err);
      }
    );
  }

  onCreate() {

  }

  selectJSON(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.name === 'model.json') {
        this.jsonFormat = true;
        this.jsonMessage = "";
        this.json = file;
      }
      else {
        this.jsonFormat = false;
        this.jsonMessage = "El archivo debe llamarse \"model\" y tener extensión \".json\"";
      }
    }
  }

  selectBIN(event: any) {
    const files: FileList = event.target.files;
    const pattern = /^group\d+-shard\d+of\d+\.bin$/;
    let cont = 0;

    if (files) {
      for (let i = 0; i < files.length; i++) {
        if (pattern.test(files[i].name)) {
          cont ++;
          console.log(files[i].name);
          console.log(cont);
        }
      }

      if (cont == files.length) {
        this.binFormat = true;
        this.binMessage = "";
        this.bin = files;
      }
      else {
        this.binFormat = false;
        this.binMessage = "Los archivos seleccionados deben seguir el patrón \"groupG-shardNofM\" donde G es el número del grupo, N es el número del archivo del grupo y M es el total de ficheros del grupo, además de tener formato \".bin\"";
      }
    }
  }

  download(id: string) {
    this.appsService.getFolder(id);
  }

  view(id: string) {
    this.appsService.view(id);
  }

  openEdit() {
    this.router.navigate(['/edit'], { queryParams: { id: this.selectedConfig.id } });
  }
}