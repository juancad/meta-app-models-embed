import { Category } from "./category.model";
import { Style } from "./style.model";

export class Application {
    id: string;
    title: string;
    description: string;
    style: Style;
    categories: Array<Category>;
    useRange: boolean;
    username: string;

    constructor(id: string, title: string, description: string, style: Style, categories: Array<Category>, useRange: boolean, username: string) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.style = style;
        this.categories = categories;
        this.useRange = useRange;
        this.username = username;
    }
}