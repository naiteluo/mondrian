
import {
    Graphics,
    ILineStyleOptions,
    IPointData,
    LINE_CAP,
    LINE_JOIN,
    BLEND_MODES,
  } from "pixi.js";
import { ExtendedAPIPlugin } from "webpack";


import { Utils } from './utils';

export interface ExtendedLineStyle extends ILineStyleOptions {
    __brushType?: BrushType;
    __brushName?: BrushName;
  }

export const enum BrushType {
    Normal = "Normal",
    Eraser = "Eraser",
    Highlighter = "Highlighter",
    Dash = "Dash",
  }

  const defaultBrushOptions: ExtendedLineStyle = {
    color: 0x000000,
    width: 10,
    alpha: 1,
    native: false,
    __brushType: BrushType.Normal,
    __brushName: BrushName.PENCIL,
    cap: LINE_CAP.ROUND,
    join: LINE_JOIN.ROUND,
  };

  
export const enum BrushName {
    PENCIL = 'Pencil',
    RECTANGLE = 'Rectangle',
    CIRCLE = 'Circle',
}

/***
 * 画笔基础类，其他画笔类都继承于此
 */
export class BaseBrush {
    protected lineStyleOption: ExtendedLineStyle;
    protected g: Graphics;
    protected isDrawing: Boolean;
    protected startPos: IPointData;
    protected currPos: IPointData;
    constructor(g: Graphics, lineStyleOption: ExtendedLineStyle) {
        this.g = g;
        this.lineStyleOption = lineStyleOption;
    }
    public get graphics(): Graphics {
        return this.g;
    }
    public drawStart(p: IPointData) {
        if(this.isDrawing) return;
        this.isDrawing = true;

        switch(this.lineStyleOption.__brushType) {
            case BrushType.Eraser:
                this.g.blendMode = BLEND_MODES.ERASE;
                this.g.lineStyle({
                    ...this.lineStyleOption,
                    color: 0x000000,
                    alpha: 1,
                });
                // console.log('设置橡皮擦');
                break;
            case BrushType.Normal:
                this.g.blendMode = BLEND_MODES.NONE;
                this.g.lineStyle(this.lineStyleOption);
                break;
            default:
                break;
        }
        this.startPos = this.currPos = { ...p };
    }
    public drawMove(p: IPointData) {
        if(!this.isDrawing) return;
        //... 
    }
    public drawEnd(p: IPointData) {
        if(!this.isDrawing) return;

        this.isDrawing = false;
        //如果不是橡皮擦模式 则换成成bitmap
        if(this.lineStyleOption.__brushType !== BrushType.Eraser) {
            this.g.cacheAsBitmapResolution = 1;
            this.g.cacheAsBitmapMultisample = 4;       //4次采样
            this.g.cacheAsBitmap = true;
        }
        this.lineStyleOption = null;
        this.startPos = null;
        this.currPos = null;
        //...
    }
}

/***
 * 普通画笔
 */
export class BrushPencil extends BaseBrush {

    private pointCache: IPointData[];

    public drawStart(p: IPointData) {
        super.drawStart(p);
        this.pointCache = [p];
    }

    public drawMove(p: IPointData) {
        super.drawMove(p);
        const l: number = this.pointCache.length;
        this.pointCache.push(Utils.midPos(this.pointCache[l - 1], p), p);
        const m: IPointData = this.pointCache[this.pointCache.length - 4],
                e: IPointData = this.pointCache[this.pointCache.length - 3],
                d: IPointData = this.pointCache[this.pointCache.length - 2];
        if(this.pointCache.length > 3) {
            this.g.moveTo(m.x, m.y)
                .quadraticCurveTo(e.x, e.y, d.x, d.y);
        } else {
            this.g.moveTo(e.x, e.y)
                .lineTo(d.x, d.y);
        }

        this.currPos = {...p};
    }

    public drawEnd(p: IPointData) {
        this.pointCache = [];
        this.pointCache = null;
        super.drawEnd(p);
    }
}

/***
 * 圆形画笔
 */
export class BrushCircle extends BaseBrush {

    public drawMove(p: IPointData) {
        super.drawMove(p);

        const r: number = Utils.getDistence(p, this.startPos);
        this.g.clear()
            .lineStyle(this.lineStyleOption)
            .drawCircle(this.startPos.x, this.startPos.y, r);
    }
}

/**
 * 方形画笔
 */
export class BrushRectangle extends BaseBrush {

    public drawMove(p: IPointData) {
        super.drawMove(p);
        
        this.g.clear()
            .lineStyle(this.lineStyleOption)
            .drawRect(
                Math.min(this.startPos.x, p.x), 
                Math.min(this.startPos.y, p.y), 
                Math.abs(p.x - this.startPos.x), 
                Math.abs(p.y - this.startPos.y)
                );
    }

}

/**
 * 画笔manager
 */
export class BrushManager {
    private _brushLineStyle: ExtendedLineStyle = {...defaultBrushOptions};
    private static _instance: BrushManager;
    
    constructor() {
    }

    private _brushDestroyHandler = () => {
        
    }

    public static getInstance(): BrushManager {
        if(this._instance == undefined) {
            this._instance = new BrushManager();
        }
        return this._instance;
    }

    public createBursh(g: Graphics): BaseBrush {
        let brush: BaseBrush;
        switch(this._brushLineStyle.__brushName) {
            case BrushName.CIRCLE:
                brush = new BrushCircle(g, this._brushLineStyle);
                break;
            case BrushName.RECTANGLE:
                brush = new BrushRectangle(g, this._brushLineStyle);
                break;
            default:
                brush = new BrushPencil(g, this._brushLineStyle);
                break;
        }
        return brush;
    }

    public set lineStyle(opt: ExtendedLineStyle) {
        this._brushLineStyle = {...this._brushLineStyle, ...opt};
    }

    public get lineStyle(): ExtendedLineStyle {
        return this._brushLineStyle;
    }

}