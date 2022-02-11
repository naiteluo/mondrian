import { Graphics } from "@pixi/graphics";
import {
  IMondrianData,
  IMondrianInteractData,
  IMondrianStateData,
  MondrianDataType,
} from "../data-manager";
import { BrushName } from "./brush-common";
import { PluginType } from "./plugin";
import { ShapePlugin } from "./shape-plugin";

export class CuboidPlugin extends ShapePlugin {
  static override Type = PluginType.ConsumerExcludesive;

  static override PID = Symbol("cuboid-plugin");

  static override predicate(data: IMondrianData | null): boolean {
    if (data === null) return false;
    if (data.type === MondrianDataType.SET_STATE) {
      if (data as IMondrianStateData) {
        if (data.data.player.brush.brushName === BrushName.Cuboid) {
          return true;
        }
      }
    }
    return false;
  }

  private get customizedDash() {
    // reuse graphics
    if (!this.handler.children.dashGraphics) {
      const g = new Graphics();
      this.handler.c.addChild(g);
      this.handler.children.dashGraphics = g;
    }
    this.handler.dashlines.dashline0 = this.handler.createDashLine(
      this.handler.children.dashGraphics
    );

    return this.handler.dashlines.dashline0;
  }

  override reactDragMove(data: IMondrianInteractData): boolean {
    if (!super.reactDragMove(data)) return false;

    const g = this.handler.g;

    this.handler.c.children.forEach((obj) => {
      const g = obj as Graphics;
      g.clear();
    });
    this.handler.lineStyle = { ...this.handler.lineStyle };

    // set up points

    const offsetRatioX = 0.2;
    const offsetRatioY = 0.2;
    const p1 = {
      x: this.shapeRect.ox,
      y: this.shapeRect.oy + this.shapeRect.dy * offsetRatioY,
    };
    const p2 = {
      x: this.shapeRect.ox + this.shapeRect.dx * (1 - offsetRatioX),
      y: this.shapeRect.oy + this.shapeRect.dy * offsetRatioY,
    };
    const p3 = {
      x: this.shapeRect.ox + this.shapeRect.dx * (1 - offsetRatioX),
      y: this.shapeRect.oy + this.shapeRect.dy,
    };
    const p4 = {
      x: this.shapeRect.ox,
      y: this.shapeRect.oy + this.shapeRect.dy,
    };
    const p5 = {
      x: this.shapeRect.ox + this.shapeRect.dx * offsetRatioX,
      y: this.shapeRect.oy,
    };
    const p6 = {
      x: this.shapeRect.ox + this.shapeRect.dx,
      y: this.shapeRect.oy,
    };
    const p7 = {
      x: this.shapeRect.ox + this.shapeRect.dx,
      y: this.shapeRect.oy + this.shapeRect.dy * (1 - offsetRatioY),
    };
    const p8 = {
      x: this.shapeRect.ox + this.shapeRect.dx * offsetRatioX,
      y: this.shapeRect.oy + this.shapeRect.dy * (1 - offsetRatioY),
    };

    if (this.shapeRect.dy > 0) {
      g.drawRect(
        Math.min(p1.x, p2.x, p3.x, p4.x),
        Math.min(p1.y, p2.y, p3.y, p4.y),
        Math.abs(p1.x - p2.x),
        Math.abs(p1.y - p4.y)
      );

      g.moveTo(p1.x, p1.y);
      g.lineTo(p5.x, p5.y);
      g.moveTo(p2.x, p2.y);
      g.lineTo(p6.x, p6.y);
      g.moveTo(p3.x, p3.y);
      g.lineTo(p7.x, p7.y);
      g.moveTo(p5.x, p5.y);
      g.lineTo(p6.x, p6.y);
      g.moveTo(p6.x, p6.y);
      g.lineTo(p7.x, p7.y);

      this.customizedDash.moveTo(p8.x, p8.y).lineTo(p5.x, p5.y);
      this.customizedDash.moveTo(p8.x, p8.y).lineTo(p4.x, p4.y);
      this.customizedDash.moveTo(p8.x, p8.y).lineTo(p7.x, p7.y);
    } else {
      g.drawRect(
        Math.min(p5.x, p6.x, p7.x, p8.x),
        Math.min(p5.y, p6.y, p7.y, p8.y),
        Math.abs(p5.x - p6.x),
        Math.abs(p5.y - p8.y)
      );

      g.moveTo(p4.x, p4.y);
      g.lineTo(p8.x, p8.y);
      g.moveTo(p3.x, p3.y);
      g.lineTo(p7.x, p7.y);
      g.moveTo(p1.x, p1.y);
      g.lineTo(p5.x, p5.y);
      g.moveTo(p3.x, p3.y);
      g.lineTo(p4.x, p4.y);
      g.moveTo(p1.x, p1.y);
      g.lineTo(p4.x, p4.y);

      this.customizedDash.moveTo(p2.x, p2.y).lineTo(p3.x, p3.y);
      this.customizedDash.moveTo(p2.x, p2.y).lineTo(p1.x, p1.y);
      this.customizedDash.moveTo(p2.x, p2.y).lineTo(p6.x, p6.y);
    }

    return true;
  }
}
