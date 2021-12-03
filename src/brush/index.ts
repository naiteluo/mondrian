import { ILineStyleOptions, LINE_CAP, LINE_JOIN } from "@pixi/graphics";

export const enum BrushName {
  PENCIL = "Pencil",
  RECTANGLE = "Rectangle",
  CIRCLE = "Circle",
}

export const enum BrushType {
  Normal = "Normal",
  Eraser = "Eraser",
  Highlighter = "Highlighter",
  Dash = "Dash",
}

export interface ExtendedLineStyle extends ILineStyleOptions {
  __brushType?: BrushType;
  __brushName?: BrushName;
}

export const defaultBrushOptions: ExtendedLineStyle = {
  color: 0x000000,
  width: 10,
  alpha: 1,
  native: false,
  __brushType: BrushType.Normal,
  __brushName: BrushName.PENCIL,
  cap: LINE_CAP.ROUND,
  join: LINE_JOIN.ROUND,
};
