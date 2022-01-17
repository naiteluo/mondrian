import {
  IMondrianData,
  IMondrianStateData,
  MondrianDataType,
} from "../data-manager";
import { BrushName } from "./brush-plugin";
import { PluginType } from "./plugin";
import { ShapePlugin } from "./shape-plugin";

export class RectanglePlugin extends ShapePlugin {
  static override Type = PluginType.ConsumerExcludesive;

  static override PID = Symbol("rectangle-plugin");

  static override predicate(data: IMondrianData | null): boolean {
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

  override reactDragMove(data: IMondrianData): boolean {
    if (!super.reactDragMove(data)) return false;
    this.handler.g.clear();
    this.handler.lineStyle = { ...this.handler.lineStyle };
    this.getDrawShapeHandle(data).drawRect(
      this.shapeRect.x,
      this.shapeRect.y,
      this.shapeRect.w,
      this.shapeRect.h
    );
    return true;
  }
}
