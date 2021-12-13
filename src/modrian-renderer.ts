import { Application } from "@pixi/app";
import { Container, DisplayObject } from "@pixi/display";
import { Graphics } from "@pixi/graphics";
import { Rectangle } from "@pixi/math";
import { BaseTextureCache } from "@pixi/utils";
import {
  BaseTexture,
  settings,
  Sprite,
  Texture,
  UPDATE_PRIORITY,
} from "pixi.js";

const enum TrashType {
  DisplayObject,
  Texture,
}

type Trash =
  | { type: TrashType.DisplayObject; target: DisplayObject }
  | { type: TrashType.Texture; target: Texture };

export class ModrianRenderer {
  private rootLayer: Container;
  // high update freqency element like cursor or performces ui
  // todo unsafe
  public uiLayer: Container;
  // real contents of stage
  private dynamicLayer: Container;
  // cached static texture layer
  private staticLayer: Sprite;

  private dynamicLevel = 20;
  private dynamicCache: ModrianGraphicsHandle[] = [];
  private dynamicCacheIndex: number = 0;

  private trash: Trash[] = [];

  constructor(private app: Application, private $panel: HTMLDivElement) {
    this.rootLayer = new Container();
    this.uiLayer = new Container();
    this.dynamicLayer = new Container();
    this.staticLayer = new Sprite();
    this.rootLayer.addChild(this.staticLayer, this.dynamicLayer, this.uiLayer);
    this.app.stage.addChild(this.rootLayer);
    this.app.ticker.minFPS = 60;
    /**
     * add main loop ticker
     */
    this.app.ticker.add(this.main);
    /**
     * add gc ticker
     */
    this.app.ticker.add(this.gc, undefined, UPDATE_PRIORITY.LOW);
    // show perf info
    this.initialPerfTool();
  }

  private initialPerfTool() {
    /**
     * add perf ticker
     */
    this.app.ticker.add(this.perf, undefined, UPDATE_PRIORITY.LOW);

    // expose base texture cache to window for debeg
    // @ts-ignore
    window.BaseTextureCache = BaseTextureCache;
  }

  private shiftGrapicsHandlesToStatic() {
    while (this.dynamicCache.length > this.dynamicLevel) {
      const handle = this.dynamicCache.shift();
      const g = handle.g;
      this.dynamicLayer.removeChild(g);
      this.staticLayer.addChild(g);
      handle.destroy();
    }
  }

  startGraphicsHandle(options?: ModrianGraphicsHandleOptions) {
    const handle = new ModrianGraphicsHandle(options);
    this.dynamicLayer.addChild(handle.g);
    this.dynamicCache.push(handle);
    handle.start();
    return handle;
  }

  stopGraphicsHandle(handle: ModrianGraphicsHandle) {
    handle.stop();
  }

  /**
   * main loop
   * normal prioriry
   * @returns
   */
  private main = () => {
    if (this.dynamicCache.length <= this.dynamicLevel) return;
    this.shiftGrapicsHandlesToStatic();
    const wh = { w: this.app.stage.width, h: this.app.stage.height };
    const texture = this.app.renderer.generateTexture(this.staticLayer, {
      region: new Rectangle(0, 0, wh.w, wh.h),
    });

    this.staticLayer.removeChildren().forEach((v) => {
      v.visible = false;
      this.markGc({ type: TrashType.DisplayObject, target: v });
    });
    this.markGc({ type: TrashType.Texture, target: this.staticLayer.texture });
    this.staticLayer.texture = texture;
  };

  unfinishedCount = 0;

  /**
   * gc loop
   * low priority
   */
  private gc = () => {
    this.trash.forEach((r) => {
      switch (r.type) {
        case TrashType.DisplayObject:
          r.target.destroy({
            children: true,
            texture: true,
            baseTexture: true,
          });
          break;
        case TrashType.Texture:
          r.target.destroy(true);
          break;
        default:
          throw new Error(`unkown gc type`);
      }
    });
    // clean trash
    this.trash = [];

    this.unfinishedCount = 0;
    // check and warn unfinshed graphic handles
    this.dynamicCache.forEach((handle) => {
      if (!handle.finished) {
        this.unfinishedCount++;
      }
    });
    if (this.unfinishedCount > 1) {
      console.error("unfinished graphic handle!!!!");
    }
  };

  private markGc(Trash) {
    this.trash.push(Trash);
  }

  lastPerfDt = 0;
  textureMem = 0;

  private perf = (dt) => {
    if (this.lastPerfDt < 20) {
      this.lastPerfDt += dt;
      return;
    }
    this.lastPerfDt = 0;
    let tmp = 0;
    for (const key in BaseTextureCache) {
      if (Object.prototype.hasOwnProperty.call(BaseTextureCache, key)) {
        const element = BaseTextureCache[key];
        //  (baseTexture.realWidth * baseTexture.realHeight * 4) / 1024 / 1024
        tmp += (element.realWidth * element.realHeight * 4) / 1024 / 1024;
      }
    }
    if (tmp !== this.textureMem) {
      this.$panel.innerHTML = `tx mem: ${this.textureMem} MB`;
      this.textureMem = tmp;
    }
  };
}

interface ModrianGraphicsHandleOptions {
  canCacheAsBitmap?: boolean;
}

/**
 * 感觉这么封装不太舒服，再想想
 */
export class ModrianGraphicsHandle {
  static DefaultOptions: ModrianGraphicsHandleOptions = {
    canCacheAsBitmap: true,
  };

  private _g: Graphics;

  private _finished = false;

  private options: ModrianGraphicsHandleOptions;

  constructor(options?: { canCacheAsBitmap?: boolean }) {
    this.options = {
      ...ModrianGraphicsHandle.DefaultOptions,
      ...(options || {}),
    };
    this._g = new Graphics();
  }

  start() {}

  stop() {
    if (this.options.canCacheAsBitmap) {
      this.g.cacheAsBitmapResolution = 1;
      this.g.cacheAsBitmapMultisample = 4;
      this.g.cacheAsBitmap = true;
    }
    this._finished = true;
  }

  destroy() {
    this._g = undefined;
  }

  get g() {
    return this._g;
  }

  get finished() {
    return this._finished;
  }
}
