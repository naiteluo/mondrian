import { IPointData } from "@pixi/math";
import { MondrianUtils } from "../common/utils";
import { IMondrianData } from "../data-manager";
import { IMondrianPlayerState } from "../player";
import { MondrianGraphicsHandler } from "../renderer/grapichs-handler";
import { BrushPlugin } from "./brush-plugin";

export const PencilBrushPluginPID = Symbol("pencil-plugin");

export class PencilBrushPlugin extends BrushPlugin {
  PID = PencilBrushPluginPID;

  static PID = PencilBrushPluginPID;

  private isDrawing = false;

  private startPos: IPointData;

  private currentPos: IPointData;

  private pointCache = [];

  protected handler: MondrianGraphicsHandler;

  protected state: IMondrianPlayerState;

  reactDragStart(data: IMondrianData): void {
    const p = { x: data.data.x, y: data.data.y };
    this.handler = this.renderer.startGraphicsHandler();
    this.handler.lineStyle = this.state.selectedBrush;
    this.isDrawing = true;
    this.startPos = this.currentPos = { ...p };
    this.pointCache = [p];
  }

  reactDragMove(data: IMondrianData): void {
    const p = { x: data.data.x, y: data.data.y };
    if (!this.isDrawing) return;
    const l = this.pointCache.length;
    this.pointCache.push(MondrianUtils.midPos(this.pointCache[l - 1], p), p);
    const m = this.pointCache[this.pointCache.length - 4],
      e: IPointData = this.pointCache[this.pointCache.length - 3],
      d: IPointData = this.pointCache[this.pointCache.length - 2];
    if (this.pointCache.length > 3) {
      this.handler.g.moveTo(m.x, m.y).quadraticCurveTo(e.x, e.y, d.x, d.y);
    } else {
      this.handler.g.moveTo(e.x, e.y).lineTo(d.x, d.y);
    }
    this.currentPos = { ...p };
  }

  // todo handle unclosed drag event properly
  reactDragEnd(data: IMondrianData): void {
    this.pointCache = [];
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.handler.stop();
  }

  reactStateChange(data: IMondrianData): void {
    this.state = data.data as IMondrianPlayerState;
  }
}
