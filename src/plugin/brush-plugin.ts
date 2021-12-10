import { DataType, IData } from "data-manager";
import { Service } from "typedi";
import { Plugin } from "./plugin";

import { ILineStyleOptions, LINE_CAP, LINE_JOIN } from "@pixi/graphics";
import { PlayerState } from "player";

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
  width: 10,
  alpha: 1,
  native: false,
  __brushType: BrushType.Normal,
  __brushName: BrushName.PENCIL,
  cap: LINE_CAP.ROUND,
  join: LINE_JOIN.ROUND,
};

export class BrushPlugin extends Plugin {
  private brushState;
  reactDragStart(data: IData): void {}
  reactDragMove(data: IData): void {}
  reactDragEnd(data: IData): void {}
  reactStateChange(data: IData): void {}
  reactUndo(event: any): void {}
  reactRedo(event: any): void {}
  reactClick(event: any): void {}
  reactInput(event: any): void {}

  /**
   *
   * @param data
   * @returns
   */
  static matcher(data: IData) {}
}
