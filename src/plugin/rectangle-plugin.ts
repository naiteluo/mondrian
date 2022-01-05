import {
  IMondrianData,
  IMondrianStateData,
  MondrianDataType,
} from "../data-manager";
import { MondrianShared } from "../shared";
import { BrushName } from "./brush-plugin";
import { PluginType } from "./plugin";
import { ShapePlugin } from "./shape-plugin";

export class RectanglePlugin extends ShapePlugin {
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
    this.handler.g.clear();
    this.handler.lineStyle = { ...this.handler.lineStyle };
    if (data.data.shiftKey) {
      const mw = Math.max(this.shapeRect.w, this.shapeRect.h);
      this.handler.g.drawRect(this.shapeRect.x, this.shapeRect.y, mw, mw);
    } else {
      this.handler.g.drawRect(
        this.shapeRect.x,
        this.shapeRect.y,
        this.shapeRect.w,
        this.shapeRect.h
      );
    }
    return true;
  }
}
