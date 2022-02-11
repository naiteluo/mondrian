import {
  IMondrianData,
  IMondrianInteractData,
  IMondrianStateData,
  MondrianDataType,
} from "../../data-manager";
import { BrushName } from "../base/brush-common";
import { PluginType } from "../base/plugin";
import { ShapePlugin } from "../base/shape.plugin";

export class RightAngleTrianglePlugin extends ShapePlugin {
  static override Type = PluginType.ConsumerExcludesive;

  static override PID = Symbol("right-angle-triangle-plugin");

  static override predicate(data: IMondrianData | null): boolean {
    if (data === null) return false;
    if (data.type === MondrianDataType.SET_STATE) {
      if (data as IMondrianStateData) {
        if (data.data.player.brush.brushName === BrushName.RightAngleTriangle) {
          return true;
        }
      }
    }
    return false;
  }

  override reactDragMove(data: IMondrianInteractData): boolean {
    if (!super.reactDragMove(data)) return false;
    this.handler.g.clear();
    this.handler.lineStyle = { ...this.handler.lineStyle };
    this.getDrawShapeHandle(data).drawPolygon([
      // point 1
      this.shapeRect.ox,
      this.shapeRect.oy,
      // point 2
      this.shapeRect.ox,
      this.shapeRect.oy + this.shapeRect.dy,
      // point 3
      this.shapeRect.ox + this.shapeRect.dx,
      this.shapeRect.oy + this.shapeRect.dy,
      // point 1
      this.shapeRect.ox,
      this.shapeRect.oy,
    ]);
    return true;
  }
}
