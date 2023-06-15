import { Category } from "./category.model";
import { Style } from "./style.model";

export class Application {
    id: string;
    title: string;
    description: string;
    style: Style;
    categories: Array<Category>;
    useRange: boolean;

    constructor(id: string, title: string, description: string, style: Style, useRange: boolean) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.style = style;
        this.categories = new Array<Category>;
        this.useRange = useRange;
    }
}