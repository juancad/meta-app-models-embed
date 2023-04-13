import { Category } from "./category.model";
import { Style } from "./style.model";

export class Configuration {
    title: string;
    description: string;
    modelURL: string;
    style: Style;
    categories: Array<Category>;
    useRange: boolean;

    constructor(title: string, description: string, modelURL: string, style: Style, categories: Array<Category>, useRange: boolean) {
        this.title = title;
        this.description = description;
        this.modelURL = modelURL;
        this.style = style;
        this.categories = categories;
        this.useRange = useRange;
    }
}