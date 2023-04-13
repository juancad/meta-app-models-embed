import { Injectable } from '@angular/core';
import { Configuration } from '../models/configuration.model';
import { Category } from '../models/category.model';
import { Align } from '../models/style.model';
import { Style } from '../models/style.model';

@Injectable({
  providedIn: 'root'
})
export class AppsService {

  configs: Configuration[];

  constructor() {
    const style = new Style("#000000", "#000000", "#FFFFFF", "Arial", "Arial", Align.center, Align.center);
    const categories = new Array<Category>;
    categories.push(new Category("Gato", 0, 0.5));
    categories.push(new Category("Perro", 0.5, Number.MAX_SAFE_INTEGER));

    this.configs = [
      new Configuration("Perros y gatos", "", "./assets/perros-gatos/model.json", style, categories, true),
    ]
  }

  addConfig(config: Configuration): boolean {
    let added = false;
    //si la lista contiene una config con el mismo nombre no la añade
    if (!this.configs.some(obj => obj.title == config.title)) {
      this.configs.push(config);
      added = true;
    }
    return added;
  }
}
