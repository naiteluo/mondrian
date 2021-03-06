import {
  IMondrianData,
  IMondrianStateData,
  MondrianDataType,
  IMondrianInteractData,
} from "../../data-manager";
import { BrushName } from "../base/brush-common";
import { PluginType } from "../base/plugin";
import { ShapePlugin } from "../base/shape.plugin";

export class StrokePlugin extends ShapePlugin {
  static override Type = PluginType.ConsumerExcludesive;

  static override PID = Symbol("stroke-plugin");

  static override predicate(data: IMondrianData | null): boolean {
    if (data === null) return false;
    if (data.type === MondrianDataType.SET_STATE) {
      if (data as IMondrianStateData) {
        if (data.data.player.brush.brushName === BrushName.Stroke) {
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
    this.getDrawShapeHandle(data)
      .moveTo(this.shapeRect.ox, this.shapeRect.oy)
      .lineTo(
        this.shapeRect.ox + this.shapeRect.dx,
        this.shapeRect.oy + this.shapeRect.dy
      );
    return true;
  }
}
