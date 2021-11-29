import { IPointData } from "@pixi/math";

export class Utils {
    static getDistence(p1: IPointData, p2: IPointData): number {
        return Math.abs(
            Math.sqrt(Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2))
        );
    }

    static midPos(p1: IPointData, p2: IPointData): IPointData {
        return {
            x: p1.x + (p2.x - p1.x) / 2,
            y: p1.y + (p2.y - p1.y) / 2,
        };
    }
}