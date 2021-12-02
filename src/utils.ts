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

  static getScreenWH(): { w: number; h: number } {
    return { w: window.innerWidth, h: window.innerHeight };
  }

  static storageGet(key: string): any {
    const r = window.localStorage.getItem(key);
    if (r != null) {
      return JSON.parse(window.localStorage.getItem(key));
    } else {
      return null;
    }
  }

  static storageSet(key: string, value: any) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  static getQueryString(param) {
    //param为要获取的参数名 注:获取不到是为null
    var currentUrl = window.location.href; //获取当前链接
    var arr = currentUrl.split("?"); //分割域名和参数界限
    if (arr.length > 1) {
      arr = arr[1].split("&"); //分割参数
      for (var i = 0; i < arr.length; i++) {
        var tem = arr[i].split("="); //分割参数名和参数内容
        if (tem[0] == param) {
          return tem[1];
        }
      }
      return null;
    } else {
      return null;
    }
  }
}
