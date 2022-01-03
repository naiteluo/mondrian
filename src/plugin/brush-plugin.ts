import { IMondrianData } from "../data-manager";
import { MondrianPlugin } from "./plugin";

import { ILineStyleOptions, LINE_CAP, LINE_JOIN } from "@pixi/graphics";
import { filters } from "pixi.js";

export const enum BrushName {
  PENCIL = "Pencil",
  Eraser = "Eraser",
  Highlighter = "Highlighter",
  Dash = "Dash",
  RECTANGLE = "Rectangle",
  CIRCLE = "Circle",
}

export interface BrushPluginState {
  brushName: BrushName;
  brushColor: number;
  brushWidth: 5;
  lineStyle: ILineStyleOptions;
}

export const defaultBrushOptions: BrushPluginState = {
  brushName: BrushName.PENCIL,
  brushColor: 0x000000,
  brushWidth: 5,
  lineStyle: {
    cap: LINE_CAP.ROUND,
    join: LINE_JOIN.ROUND,
    width: 5,
    alpha: 1,
    native: false,
  },
};

export class BrushPlugin extends MondrianPlugin {
  protected sharedAlphaFilter = new filters.AlphaFilter(0.4);

  protected sharedFXAAFilter = new filters.FXAAFilter();

  private brushState;

  reactDragStart(data: IMondrianData): void {}

  reactDragMove(data: IMondrianData): void {}

  reactDragEnd(data: IMondrianData): void {}

  reactStateChange(data: IMondrianData): void {}

  reactUndo(event: any): void {}

  reactRedo(event: any): void {}

  reactClick(event: any): void {}

  reactInput(event: any): void {}

  /**
   *
   * @param data
   * @returns
   */
  static matcher(data: IMondrianData) {}
}
