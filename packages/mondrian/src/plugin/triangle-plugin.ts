import {
  IMondrianData,
  IMondrianInteractData,
  IMondrianStateData,
  MondrianDataType,
} from "../data-manager";
import { BrushName } from "./brush-plugin";
import { PluginType } from "./plugin";
import { ShapePlugin } from "./shape-plugin";

export class TrianglePlugin extends ShapePlugin {
  static override Type = PluginType.ConsumerExcludesive;

  static override PID = Symbol("triangle-plugin");

  static override predicate(data: IMondrianData | null): boolean {
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

  override reactDragMove(data: IMondrianInteractData): boolean {
    if (!super.reactDragMove(data)) return false;
    this.handler.g.clear();
    this.handler.lineStyle = { ...this.handler.lineStyle };
    this.getDrawShapeHandle(data).drawPolygon([
      // point 1
      this.shapeRect.ox + this.shapeRect.dx / 2,
      this.shapeRect.oy,
      // point 2
      this.shapeRect.ox,
      this.shapeRect.oy + this.shapeRect.dy,
      // point 3
      this.shapeRect.ox + this.shapeRect.dx,
      this.shapeRect.oy + this.shapeRect.dy,
      // point 1
      this.shapeRect.ox + this.shapeRect.dx / 2,
      this.shapeRect.oy,
    ]);
    return true;
  }
}