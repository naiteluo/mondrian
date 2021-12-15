import { Application } from "@pixi/app";
import { Container, DisplayObject } from "@pixi/display";
import { Rectangle } from "@pixi/math";
import { BaseTextureCache } from "@pixi/utils";
import { Sprite, Texture, UPDATE_PRIORITY } from "pixi.js";
import {
  ModrianGraphicsHandler,
  ModrianGraphicsHandlerOptions,
} from "./grapichs-handler";

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
  private dynamicCache: ModrianGraphicsHandler[] = [];

  private dynamicCacheIndex = -1;

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
    // @ ts-ignore
    (window as any).BaseTextureCache = BaseTextureCache;
  }

  private shiftGrapicsHandlersToStatic() {
    while (this.dynamicCache.length > this.dynamicLevel) {
      const handler = this.dynamicCache.shift();
      this.dynamicCacheIndex--;
      const gs = handler.detach();
      gs.forEach((g) => {
        this.staticLayer.addChild(g);
      });
      handler.destroy();
    }
  }

  startGraphicsHandler(options?: ModrianGraphicsHandlerOptions) {
    const handler = new ModrianGraphicsHandler(this.dynamicLayer, options);
    const countOfTails =
      this.dynamicCache.length - (this.dynamicCacheIndex + 1);
    if (this.dynamicCache.length >= this.dynamicLevel) {
      this.shiftGrapicsHandlersToStatic();
    }
    if (countOfTails > 0) {
      const toBeDelete = this.dynamicCache.splice(
        this.dynamicCacheIndex + 1,
        countOfTails
      );
      toBeDelete.map((h) => {
        h.detach();
        h.gs.forEach((g) => {
          this.markGc({ type: TrashType.DisplayObject, target: g });
        });
        h.destroy();
      });
    }
    this.dynamicCache.push(handler);
    this.dynamicCacheIndex += 1;
    handler.start();
    return handler;
  }

  forward() {
    if (this.dynamicCacheIndex < this.dynamicCache.length - 1) {
      this.dynamicCacheIndex++;
      const handler = this.dynamicCache[this.dynamicCacheIndex];
      handler.attach();
    } else {
      console.warn("can't forward dynamic cache anymore");
    }
  }

  backward() {
    if (this.dynamicCacheIndex >= 0) {
      const handler = this.dynamicCache[this.dynamicCacheIndex];
      handler.detach();
      this.dynamicCacheIndex--;
    } else {
      console.warn("can't backward dynamic cache anymore");
    }
  }

  stopGraphicsHandler(handler: ModrianGraphicsHandler) {
    handler.stop();
  }

  /**
   * main loop
   * normal prioriry
   * @returns
   */
  private main = () => {
    if (this.dynamicCache.length <= this.dynamicLevel) return;
    this.shiftGrapicsHandlersToStatic();
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
    this.dynamicCache.forEach((v) => {
      v.refresh();
    });
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
  };

  private markGc(item) {
    this.trash.push(item);
  }

  lastPerfDt = 0;
  textureMem = 0;

  private perf = (dt) => {
    if (this.lastPerfDt < 20) {
      this.lastPerfDt += dt;
      return;
    }
    this.lastPerfDt = 0;
    let tmpMemSize = 0;
    for (const key in BaseTextureCache) {
      if (Object.prototype.hasOwnProperty.call(BaseTextureCache, key)) {
        const element = BaseTextureCache[key];
        //  (baseTexture.realWidth * baseTexture.realHeight * 4) / 1024 / 1024
        tmpMemSize +=
          (element.realWidth * element.realHeight * 4) / 1024 / 1024;
      }
    }
    const tmpGraphicsCount = this.dynamicCache.reduce((prev, v) => {
      return prev + v.gs.length;
    }, 0);
    if (tmpMemSize !== this.textureMem) {
      this.$panel.innerHTML = `
        <div style="display:block">tx mem: ${this.textureMem.toFixed(
          2
        )} MB | </div> 
        <div> g count: ${tmpGraphicsCount}</div>
      `;
      this.textureMem = tmpMemSize;
    }

    this.__debug_checkUnfinishedHandler();
  };

  private __debug_unfinishedHandlerCount = 0;

  private __debug_checkUnfinishedHandler() {
    this.__debug_unfinishedHandlerCount = 0;
    // check and warn unfinshed graphic handles
    this.dynamicCache.forEach((handle) => {
      if (!handle.finished) {
        this.__debug_unfinishedHandlerCount++;
      }
    });
    if (this.__debug_unfinishedHandlerCount > 1) {
      console.warn(
        `unfinished graphic (${this.__debug_unfinishedHandlerCount}) handle!!!!`
      );
    }
  }
}
