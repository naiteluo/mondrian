import { MondrianUtils } from "../common/utils";
import { IMondrianData } from "../data-manager";
import { MondrianShared } from "../shared";
import { BrushPlugin } from "./brush-plugin";
import { PluginType } from "./plugin";

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

  protected shapeRect = { x: 0, y: 0, w: 0, h: 0 };

  reactDragMove(data: IMondrianData): boolean {
    if (!super.reactDragMove(data)) return false;
    MondrianUtils.getRectByCorner(
      this.currentPos.x,
      this.currentPos.y,
      this.startPos.x,
      this.startPos.y,
      this.shapeRect
    );
    return true;
  }
}
