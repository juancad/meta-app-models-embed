import { Category } from "./category.model";
import { Style } from "./style.model";

export class Configuration {
    title: string;
    description: string;
    modelURL: string;
    width: number;
    height: number;
    style: Style;
    categories: Array<Category>;

    constructor(title: string, description: string, modelURL: string, width: number, height: number, style: Style, categories: Array<Category>) {
        this.title = title;
        this.description = description;
        this.modelURL = modelURL;
        this.width = width;
        this.height = height;
        this.style = style;
        this.categories = categories;
    }
}