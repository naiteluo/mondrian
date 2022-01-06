import { MondrianUtils } from "../common/utils";
import { IMondrianData } from "../data-manager";
import { MondrianShared } from "../shared";
import { BrushPlugin } from "./brush-plugin";
import { PluginType } from "./plugin";
import { DashLine } from "pixi-dashed-line";

export class ShapePlugin extends BrushPlugin {
  static Type = PluginType.ConsumerExcludesive;

  static PID = Symbol("shape-plugin");

  static predicate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: IMondrianData | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shared?: MondrianShared
  ): boolean {
    return false;
  }

  protected shapeRect = { x: 0, y: 0, w: 0, h: 0, dx: 0, dy: 0, ox: 0, oy: 0 };

  protected dash: DashLine;

  protected getDrawShapeHandle(data: IMondrianData) {
    const useDash = this.brushState.dash || data.data.ctrlKey;
    if (useDash) {
      this.dash = new DashLine(this.handler.g, {
        dash: [10, 5],
        ...this.handler.lineStyle,
        useTexture: true,
      });
    }
    return useDash ? this.dash : this.handler.g;
  }

  reactDragMove(data: IMondrianData): boolean {
    if (!super.reactDragMove(data)) return false;
    const isRestricted = this.brushState.restrict || data.data.shiftKey;
    MondrianUtils.getRectByCorner(
      this.startPos.x,
      this.startPos.y,
      this.currentPos.x,
      this.currentPos.y,
      isRestricted,
      this.shapeRect
    );
    return true;
  }
}
