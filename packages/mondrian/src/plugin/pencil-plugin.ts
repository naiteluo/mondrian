import { IPointData } from "@pixi/math";
import { MondrianUtils } from "../common/utils";
import {
  IMondrianData,
  IMondrianInteractData,
  IMondrianStateData,
  MondrianDataType,
} from "../data-manager";
import { BrushPlugin } from "./brush-plugin";
import { BrushName } from "./brush-common";
import { PluginType } from "./plugin";

export class PencilBrushPlugin extends BrushPlugin {
  static override Type = PluginType.ConsumerExcludesive;

  static override PID = Symbol("pencil-plugin");

  static override predicate(data: IMondrianData | null): boolean {
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

  private pointCache: IPointData[] = [];

  override reactDragStart(data: IMondrianInteractData): boolean {
    if (!super.reactDragStart(data)) return false;
    const p = { x: data.data.x, y: data.data.y };
    this.pointCache = [p];
    return true;
  }

  override reactDragMove(data: IMondrianInteractData): boolean {
    if (!super.reactDragMove(data)) return false;
    const p = { x: data.data.x, y: data.data.y };
    const l = this.pointCache.length;
    this.pointCache.push(MondrianUtils.getMidPos(this.pointCache[l - 1], p), p);
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
  override reactDragEnd(data: IMondrianInteractData): boolean {
    this.pointCache = [];
    if (!super.reactDragEnd(data)) return false;
    return true;
  }
}
