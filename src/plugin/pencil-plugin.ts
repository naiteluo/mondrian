import { IPointData } from "@pixi/math";
import { ModrianUtils } from "../common/utils";
import { IModrianData } from "../data-manager";
import { IModrianPlayerState } from "../player";
import { BrushPlugin } from "./brush-plugin";
import { ModrianGraphicsHandler } from "renderer/grapichs-handler";

export const PencilBrushPluginPID = Symbol("pencil-plugin");

export class PencilBrushPlugin extends BrushPlugin {
  PID = PencilBrushPluginPID;
  static PID = PencilBrushPluginPID;

  private isDrawing = false;
  private startPos: IPointData;
  private currentPos: IPointData;
  private pointCache = [];
  private handler: ModrianGraphicsHandler;

  private state: IModrianPlayerState;

  reactDragStart(data: IModrianData): void {
    const p = { x: data.data.x, y: data.data.y };
    this.handler = this.renderer.startGraphicsHandler();
    this.handler.lineStyle = this.state.selectedBrush;
    this.isDrawing = true;
    this.startPos = this.currentPos = { ...p };
    this.pointCache = [p];
  }

  reactDragMove(data: IModrianData): void {
    const p = { x: data.data.x, y: data.data.y };
    if (!this.isDrawing) return;
    const l = this.pointCache.length;
    this.pointCache.push(ModrianUtils.midPos(this.pointCache[l - 1], p), p);
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
  reactDragEnd(data: IModrianData): void {
    this.pointCache = [];
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.handler.stop();
  }

  reactStateChange(data: IModrianData): void {
    this.state = data.data as IModrianPlayerState;
  }
}
