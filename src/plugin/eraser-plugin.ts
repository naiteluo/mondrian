import { BLEND_MODES } from "pixi.js";
import { IMondrianData } from "../data-manager";
import { PencilBrushPlugin } from "./pencil-plugin";

export const EraserBrushPluginPID = Symbol("eraser-plugin");

export class EraserBrushPlugin extends PencilBrushPlugin {
  PID = EraserBrushPluginPID;

  static PID = EraserBrushPluginPID;

  reactDragStart(data: IMondrianData): void {
    super.reactDragStart(data);
    this.handler.config({
      enableDiscrete: false,
      canCacheAsBitmap: false,
    });
    this.handler.g.blendMode = BLEND_MODES.ERASE;
  }
}
