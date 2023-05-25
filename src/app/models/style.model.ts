export class Style {
    camAlign: Align;
    font: string;
    backgroundColor: string;
    textColor: string;
    showOutput: boolean;

    constructor(camAlign: Align, font: string, backgroundColor: string, textColor: string, showOutput: boolean) {
        this.camAlign = camAlign;
        this.font = font;
        this.backgroundColor = backgroundColor;
        this.textColor = textColor;
        this.showOutput = showOutput;
    }
}

export enum Align {
    center,
    right,
    left,
  }