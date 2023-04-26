import { Category } from "./category.model";
import { Style } from "./style.model";

export class Configuration {
    id: string;
    title: string;
    description: string;
    style: Style;
    categories: Array<Category>;
    useRange: boolean;

    constructor(id: string, title: string, description: string, style: Style, categories: Array<Category>, useRange: boolean) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.style = style;
        this.categories = categories;
        this.useRange = useRange;
    }
}