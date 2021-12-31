import { IMondrianData } from "../data-manager";
import { MondrianPlugin } from "./plugin";

import { ILineStyleOptions, LINE_CAP, LINE_JOIN } from "@pixi/graphics";
import { filters } from "pixi.js";

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

export interface BrushPluginState extends ILineStyleOptions {
  __brushType?: BrushType;
  __brushName?: BrushName;
}

export const defaultBrushOptions: BrushPluginState = {
  color: 0x000000,
  width: 5,
  alpha: 1,
  native: false,
  __brushType: BrushType.Normal,
  __brushName: BrushName.PENCIL,
  cap: LINE_CAP.ROUND,
  join: LINE_JOIN.ROUND,
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
