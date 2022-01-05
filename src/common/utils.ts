import { IPointData } from "@pixi/math";

export interface IMondrianRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export class MondrianUtils {
  static getRectByCorner(
    x1,
    y1,
    x2,
    y2,
    ref: IMondrianRect = { x: 0, y: 0, w: 0, h: 0 }
  ) {
    ref.x = Math.min(x1, x2);
    ref.y = Math.min(y1, y2);
    ref.w = Math.abs(x1 - x2);
    ref.h = Math.abs(y1 - y2);
    return ref;
  }

  static getDistance(p1: IPointData, p2: IPointData): number {
    return Math.abs(
      Math.sqrt(Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2))
    );
  }

  static getMidPos(p1: IPointData, p2: IPointData): IPointData {
    return {
      x: p1.x + (p2.x - p1.x) / 2,
      y: p1.y + (p2.y - p1.y) / 2,
    };
  }

  static getScreenWH(): { w: number; h: number } {
    return { w: window.innerWidth, h: window.innerHeight };
  }
}
