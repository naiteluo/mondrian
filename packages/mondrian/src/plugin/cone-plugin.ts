import { Graphics } from "@pixi/graphics";
import { DashLine } from "pixi-dashed-line";
import {
  IMondrianData,
  IMondrianInteractData,
  IMondrianStateData,
  MondrianDataType,
} from "../data-manager";
import { BrushName } from "./brush-common";
import { PluginType } from "./plugin";
import { ShapePlugin } from "./shape-plugin";

export class ConePlugin extends ShapePlugin {
  static override Type = PluginType.ConsumerExcludesive;

  static override PID = Symbol("cone-plugin");

  static override predicate(data: IMondrianData | null): boolean {
    if (data === null) return false;
    if (data.type === MondrianDataType.SET_STATE) {
      if (data as IMondrianStateData) {
        if (data.data.player.brush.brushName === BrushName.Cone) {
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

    this.handler.c.children.forEach((obj) => {
      const g = obj as Graphics;
      g.clear();
    });
    this.handler.lineStyle = { ...this.handler.lineStyle };

    const rx = this.shapeRect.w / 2;
    const ry = this.shapeRect.w / 2 / 3;

    if (Math.abs(this.shapeRect.dy) < ry * 3) {
      return false;
    }

    // set up points
    const poOfNear = {
      x:
        this.shapeRect.ox +
        (this.shapeRect.dx / Math.abs(this.shapeRect.dx)) * rx,
      y: this.shapeRect.oy,
    };

    const poOfFar = {
      x:
        this.shapeRect.ox +
        (this.shapeRect.dx / Math.abs(this.shapeRect.dx)) * rx,
      y:
        this.shapeRect.oy +
        this.shapeRect.dy -
        (this.shapeRect.dy / Math.abs(this.shapeRect.dy)) * ry,
    };

    // draw straight line
    this.handler.g
      .moveTo(poOfNear.x, poOfNear.y)
      .lineTo(poOfFar.x + rx, poOfFar.y);
    this.handler.g
      .moveTo(poOfNear.x, poOfNear.y)
      .lineTo(poOfFar.x - rx, poOfFar.y);

    const needReverseY = this.shapeRect.dy < 0;

    const ellipsePoints = 80;

    const interval = (Math.PI * 2) / ellipsePoints;
    const dashline = this.customizedDash;
    let isInUpperTail = true;
    for (let i = 0; i < Math.PI * 2; i += interval) {
      const x0 = poOfFar.x - rx * Math.cos(i);
      const y0 = poOfFar.y - ry * Math.sin(i);
      let g: Graphics | DashLine = this.handler.g;
      // toggle g object between dashline and normal grahpic based on radius and drag direction in Y-axis.
      if (i > Math.PI) {
        g = needReverseY ? dashline : this.handler.g;
      } else {
        g = needReverseY ? this.handler.g : dashline;
      }
      if (i === 0 || (i > Math.PI && isInUpperTail)) {
        if (i > Math.PI && isInUpperTail) {
          isInUpperTail = false;
        }
        g.moveTo(x0, y0);
      } else {
        g.lineTo(x0, y0);
      }
    }

    return true;
  }
}
