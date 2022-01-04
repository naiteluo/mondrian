import {
  IMondrianData,
  IMondrianStateData,
  MondrianDataType,
} from "../data-manager";
import { MondrianShared } from "../shared";
import { BrushName } from "./brush-plugin";
import { PencilBrushPlugin } from "./pencil-plugin";
import { PluginType } from "./plugin";

export class HighlighterBrushPlugin extends PencilBrushPlugin {
  static Type = PluginType.ConsumerExcludesive;

  static PID = Symbol("highlighter-plugin");

  static predicate(
    data: IMondrianData | null,
    shared?: MondrianShared
  ): boolean {
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

  reactDragStart(data: IMondrianData): boolean {
    if (!super.reactDragStart(data)) return false;
    this.handler.config({
      enableDiscrete: false,
      canCacheAsBitmap: true,
    });
    this.handler.c.filters = [this.sharedAlphaFilter];
    return true;
  }
}
