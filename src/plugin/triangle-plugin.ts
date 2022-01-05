import {
  IMondrianData,
  IMondrianStateData,
  MondrianDataType,
} from "../data-manager";
import { MondrianShared } from "../shared";
import { BrushName } from "./brush-plugin";
import { PluginType } from "./plugin";
import { ShapePlugin } from "./shape-plugin";

export class TrianglePlugin extends ShapePlugin {
  static Type = PluginType.ConsumerExcludesive;

  static PID = Symbol("triangle-plugin");

  static predicate(
    data: IMondrianData | null,
    shared?: MondrianShared
  ): boolean {
    if (data === null) return false;
    if (data.type === MondrianDataType.SET_STATE) {
      if (data as IMondrianStateData) {
        if (data.data.player.brush.brushName === BrushName.Triangle) {
          return true;
        }
      }
    }
    return false;
  }

  reactDragMove(data: IMondrianData): boolean {
    if (!super.reactDragMove(data)) return false;
    this.handler.g.clear();
    this.handler.lineStyle = { ...this.handler.lineStyle };
    if (data.data.shiftKey) {
      const mw = Math.max(this.shapeRect.w, this.shapeRect.h);
      this.handler.g.drawRect(this.shapeRect.x, this.shapeRect.y, mw, mw);
    } else {
      const sx = this.shapeRect.x + this.shapeRect.w * 0.6;
      this.handler.g.drawPolygon([
        sx,
        this.shapeRect.y,
        this.shapeRect.x + this.shapeRect.w,
        this.shapeRect.y + this.shapeRect.h,
        this.shapeRect.x,
        this.shapeRect.y + this.shapeRect.h,
      ]);
    }
    return true;
  }
}
