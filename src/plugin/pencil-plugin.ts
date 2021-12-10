import { Graphics } from "@pixi/graphics";
import { IPointData } from "@pixi/math";
import { Utils } from "../common/utils";
import { IData } from "data-manager";
import { PlayerState } from "player";
import { BrushPlugin } from "./brush-plugin";

export const PencilBrushPluginPID = Symbol("pencil-plugin");

export class PencilBrushPlugin extends BrushPlugin {
  private isDrawing = false;
  private startPos: IPointData;
  private currentPos: IPointData;
  private pointCache = [];
  private g: Graphics;

  private state: PlayerState;

  reactDragStart(data: IData): void {
    const p = { x: data.data.x, y: data.data.y };
    this.g = this.renderer.getTestHandle();

    this.g.lineStyle({
      ...this.state.selectedBrush,
    });
    this.isDrawing = true;
    this.startPos = this.currentPos = { ...p };
    this.pointCache = [p];
  }

  reactDragMove(data: IData): void {
    const p = { x: data.data.x, y: data.data.y };
    if (!this.isDrawing) return;
    const l = this.pointCache.length;
    this.pointCache.push(Utils.midPos(this.pointCache[l - 1], p), p);
    const m = this.pointCache[this.pointCache.length - 4],
      e: IPointData = this.pointCache[this.pointCache.length - 3],
      d: IPointData = this.pointCache[this.pointCache.length - 2];
    if (this.pointCache.length > 3) {
      this.g.moveTo(m.x, m.y).quadraticCurveTo(e.x, e.y, d.x, d.y);
    } else {
      this.g.moveTo(e.x, e.y).lineTo(d.x, d.y);
    }
    this.currentPos = { ...p };
  }

  reactDragEnd(data: IData): void {
    this.pointCache = [];
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.g.cacheAsBitmapResolution = 1;
    this.g.cacheAsBitmapMultisample = 4;
    this.g.cacheAsBitmap = true;
  }

  reactStateChange(data: IData): void {
    this.state = data.data as PlayerState;
  }

  PID = PencilBrushPluginPID;
  static PID = PencilBrushPluginPID;
}
