import { IPointData } from "@pixi/math";
import { ILineStyleOptions } from "pixi.js";
import { MondrianUtils } from "../common/utils";
import {
  IMondrianData,
  IMondrianStateData,
  MondrianDataType,
} from "../data-manager";
import { IMondrianPlayerState } from "../player";
import { MondrianGraphicsHandler } from "../renderer/grapichs-handler";
import { MondrianShared } from "../shared";
import { BrushName, BrushPlugin } from "./brush-plugin";
import { PluginType } from "./plugin";

export class PencilBrushPlugin extends BrushPlugin {
  static Type = PluginType.ConsumerExcludesive;

  static PID = Symbol("pencil-plugin");

  static predicate(
    data: IMondrianData | null,
    shared?: MondrianShared
  ): boolean {
    if (data === null) return false;
    if (data.type === MondrianDataType.SET_STATE) {
      if (data as IMondrianStateData) {
        if (data.data.player.brush.brushName === BrushName.Pencil) {
          return true;
        }
      }
    }
    return false;
  }

  private isDrawing = false;

  private startPos: IPointData;

  private currentPos: IPointData;

  private pointCache = [];

  protected handler: MondrianGraphicsHandler;

  protected state: IMondrianPlayerState;

  protected lineStyle: ILineStyleOptions;

  reactDragStart(data: IMondrianData): void {
    const p = { x: data.data.x, y: data.data.y };
    this.handler = this.renderer.startGraphicsHandler();
    this.handler.lineStyle = this.lineStyle;
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
    this.state = (data as IMondrianStateData).data.player;
    this.lineStyle = {
      ...this.state.brush.lineStyle,
      width: this.state.brush.brushWidth,
      color: this.state.brush.brushColor,
    };
  }
}
