import { IMondrianData } from "../data-manager";
import { PencilBrushPlugin } from "./pencil-plugin";

export const HighlighterBrushPluginPID = Symbol("highlighter-plugin");

export class HighlighterBrushPlugin extends PencilBrushPlugin {
  PID = HighlighterBrushPluginPID;

  static PID = HighlighterBrushPluginPID;

  reactDragStart(data: IMondrianData): void {
    super.reactDragStart(data);
    this.handler.config({
      enableDiscrete: false,
      canCacheAsBitmap: true,
    });
    this.handler.c.filters = [this.sharedAlphaFilter];
  }
}
