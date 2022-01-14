import { IPointData } from "@pixi/math";

export interface IMondrianRect {
  x: number;
  y: number;
  w: number;
  h: number;
  ox: number;
  oy: number;
  dx: number;
  dy: number;
}

export class MondrianUtils {
  /**
   *
   * @param x1
   * @param y1
   * @param x2
   * @param y2
   * @param restrict restrict rect as max width square
   * @param ref object to be modified
   * @returns
   */
  static getRectByCorner(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    restrict = false,
    ref: IMondrianRect = {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      ox: 0,
      oy: 0,
      dx: 0,
      dy: 0,
    }
  ) {
    ref.ox = x1;
    ref.oy = y1;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const w = Math.abs(dx);
    const h = Math.abs(dy);

    if (restrict) {
      const maxDelta = Math.max(w, h);
      // keep sign
      ref.dx = (dx >= 0 ? 1 : -1) * maxDelta;
      ref.dy = (dy >= 0 ? 1 : -1) * maxDelta;
      ref.w = ref.h = Math.max(w, h);

      const x3 = x1 + ref.dx;
      const y3 = y1 + ref.dy;

      ref.x = Math.min(x1, x3);
      ref.y = Math.min(y1, y3);
    } else {
      ref.dx = dx;
      ref.dy = dy;
      ref.w = w;
      ref.h = h;
      ref.x = Math.min(x1, x2);
      ref.y = Math.min(y1, y2);
    }

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
