export class Style {
    titleColor: string;
    contentColor: string;
    backgroundColor: string;
    contentFontFamily: string;
    titleFontFamily: string;
    textAlign: Align;
    camAlign: Align;

    constructor(titleColor: string, contentColor: string, backgroundColor: string, contentFontFamily: string, titleFontFamily: string, textAlign: Align, camAlign: Align) {
        this.titleColor = titleColor;
        this.contentColor = contentColor;
        this.backgroundColor = backgroundColor;
        this.contentFontFamily = contentFontFamily;
        this.titleFontFamily = titleFontFamily;        
        this.textAlign = textAlign;
        this.camAlign = camAlign;
    }
}

export enum Align {
    center,
    right,
    left,
    justify
  }