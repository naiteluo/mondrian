import { BLEND_MODES } from "pixi.js";
import {
  IMondrianData,
  IMondrianStateData,
  MondrianDataType,
} from "../data-manager";
import { BrushName } from "./brush-plugin";
import { PencilBrushPlugin } from "./pencil-plugin";
import { PluginType } from "./plugin";

export class EraserBrushPlugin extends PencilBrushPlugin {
  static override Type = PluginType.ConsumerExcludesive;

  static override PID = Symbol("eraser-plugin");

  static override predicate(data: IMondrianData | null): boolean {
    if (data === null) return false;
    if (data.type === MondrianDataType.SET_STATE) {
      if (data as IMondrianStateData) {
        if (data.data.player.brush.brushName === BrushName.Eraser) {
          return true;
        }
      }
    }
    return false;
  }

  override reactDragStart(data: IMondrianData): boolean {
    if (!super.reactDragStart(data)) return false;
    this.handler.config({
      enableDiscrete: false,
      canCacheAsBitmap: false,
    });
    this.handler.g.blendMode = BLEND_MODES.ERASE;
    return true;
  }
}
