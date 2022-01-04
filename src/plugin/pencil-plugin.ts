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

  private pointCache = [];

  reactDragStart(data: IMondrianData): boolean {
    if (!super.reactDragStart(data)) return false;
    const p = { x: data.data.x, y: data.data.y };
    this.pointCache = [p];
    return true;
  }

  reactDragMove(data: IMondrianData): boolean {
    if (!super.reactDragMove(data)) return false;
    const p = { x: data.data.x, y: data.data.y };
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
    return true;
  }

  // todo handle unclosed drag event properly
  reactDragEnd(data: IMondrianData): boolean {
    this.pointCache = [];
    if (!super.reactDragEnd(data)) return false;
    this.handler.stop();
    return true;
  }
}
