import { Graphics } from "@pixi/graphics";
import { IPoint, IPointData } from "@pixi/math";
import { DataType, IData, InteractType } from "../data-manager";
import { ModrianRenderer } from "../modrian-renderer";
import { Utils } from "../common/utils";
import { Player, PlayerState } from "./player";

export class Consumer extends Player {
  constructor(private renderer: ModrianRenderer) {
    super();
  }

  private g: Graphics;

  private isDrawing = false;
  private startPos: IPointData;
  private currentPos: IPointData;
  private pointCache = [];

  consume(datas: IData[]) {
    datas.forEach((data) => {
      if (data.type === DataType.STATE) {
        this.state = data.data as PlayerState;
        return;
      }
      if (data.type === DataType.INTERACT) {
        const p = { x: data.data.x, y: data.data.y };
        switch (data.data.subType) {
          case InteractType.DRAG_START:
            this.g = this.renderer.getTestHandle();

            this.g.lineStyle({
              ...this.state.selectedBrush,
            });
            this.isDrawing = true;
            this.startPos = this.currentPos = { ...p };
            this.pointCache = [p];
            break;
          case InteractType.DRAG:
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
            break;
          case InteractType.DRAG_END:
            this.pointCache = [];
            if (!this.isDrawing) return;
            this.isDrawing = false;
            this.g.cacheAsBitmapResolution = 1;
            this.g.cacheAsBitmapMultisample = 4; //4次采样
            this.g.cacheAsBitmap = true;
            break;
          default:
            break;
        }
      }
    });
  }
}
