import { MondrianUtils } from "../common/utils";
import {
  IMondrianData,
  IMondrianStateData,
  MondrianDataType,
} from "../data-manager";
import { MondrianShared } from "../shared";
import { BrushName } from "./brush-plugin";
import { PluginType } from "./plugin";
import { ShapePlugin } from "./shape-plugin";

export class CirclePlugin extends ShapePlugin {
  static Type = PluginType.ConsumerExcludesive;

  static PID = Symbol("circle-plugin");

  static predicate(
    data: IMondrianData | null,
    shared?: MondrianShared
  ): boolean {
    if (data === null) return false;
    if (data.type === MondrianDataType.SET_STATE) {
      if (data as IMondrianStateData) {
        if (data.data.player.brush.brushName === BrushName.Circle) {
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
      this.handler.g.drawCircle(
        this.shapeRect.x + mw / 2,
        this.shapeRect.y + mw / 2,
        mw / 2
      );
    } else {
      this.handler.g.drawEllipse(
        this.shapeRect.x + this.shapeRect.w / 2,
        this.shapeRect.y + this.shapeRect.h / 2,
        this.shapeRect.w / 2,
        this.shapeRect.h / 2
      );
    }
  }
}
