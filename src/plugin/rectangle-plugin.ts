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

  reactDragMove(data: IMondrianData): boolean {
    if (!super.reactDragMove(data)) return false;

    const sx = Math.min(this.startPos.x, this.currentPos.x);
    const sy = Math.min(this.startPos.y, this.currentPos.y);
    const ex = Math.max(this.startPos.x, this.currentPos.x);
    const ey = Math.max(this.startPos.y, this.currentPos.y);

    this.handler.g.clear();
    this.handler.lineStyle = { ...this.handler.lineStyle };
    this.handler.g.drawRect(sx, sy, ex - sx, ey - sy);
  }
}
