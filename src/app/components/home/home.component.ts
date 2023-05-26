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
  deleteConfigId: string = null;
  configLoaded;

  constructor(private appsService: AppsService, private router: Router) {
    this.title = "meta-app-models";
    this.configurations = [];
    this.configLoaded = false;
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
        this.configLoaded = false;
        console.error(err);
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
        //actualiza la lista de aplicaciones
        this.readConfig();
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
        location.reload();
      },
      err => {
        console.error(err);
      }
    );
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