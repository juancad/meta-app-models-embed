export class Category {
    name: string;
    minValue: number;
    maxValue: number;

    constructor(name: string, minValue: number, maxValue: number) {
        this.name = name;
        this.minValue = minValue;
        this.maxValue = maxValue;
    }
}
