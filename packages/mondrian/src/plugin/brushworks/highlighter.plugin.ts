import {
  IMondrianData,
  IMondrianInteractData,
  IMondrianStateData,
  MondrianDataType,
} from "../../data-manager";
import { PluginType, BrushName } from "../base";
import { PencilBrushPlugin } from "./pencil.plugin";

export class HighlighterBrushPlugin extends PencilBrushPlugin {
  static override Type = PluginType.ConsumerExcludesive;

  static override PID = Symbol("highlighter-plugin");

  static override predicate(data: IMondrianData | null): boolean {
    if (data === null) return false;
    if (data.type === MondrianDataType.SET_STATE) {
      if (data as IMondrianStateData) {
        if (data.data.player.brush.brushName === BrushName.Highlighter) {
          return true;
        }
      }
    }
    return false;
  }

  override reactDragStart(data: IMondrianInteractData): boolean {
    if (!super.reactDragStart(data)) return false;
    this.handler.config({
      enableDiscrete: false,
      canCacheAsBitmap: true,
    });
    this.handler.c.filters = [this.sharedAlphaFilter];
    return true;
  }
}
