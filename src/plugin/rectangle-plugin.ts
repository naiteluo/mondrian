import {
  IMondrianData,
  IMondrianStateData,
  MondrianDataType,
} from "../data-manager";
import { MondrianShared } from "../shared";
import { BrushName, BrushPlugin } from "./brush-plugin";
import { PluginType } from "./plugin";

export class RectanglePlugin extends BrushPlugin {
  static Type = PluginType.ConsumerExcludesive;

  static PID = Symbol("rectangle-plugin");

  static predicate(
    data: IMondrianData | null,
    shared?: MondrianShared
  ): boolean {
    if (data === null) return false;
    if (data.type === MondrianDataType.SET_STATE) {
      if (data as IMondrianStateData) {
        if (data.data.player.brush.brushName === BrushName.Rectangle) {
          return true;
        }
      }
    }
    return false;
  }
}
