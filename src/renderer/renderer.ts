import { Application } from "@pixi/app";
import { Container, DisplayObject } from "@pixi/display";
import { BaseTextureCache } from "@pixi/utils";
import { MondrianModuleBase } from "../common/module-base";
import {
  ENV,
  RenderTexture,
  settings,
  Sprite,
  Texture,
  UPDATE_PRIORITY,
} from "pixi.js";
import { MondrianShared } from "../shared";
import {
  MondrianGraphicsHandler,
  MondrianGraphicsHandlerOptions,
} from "./grapichs-handler";
import { MondrianContainerManager } from "../container-manager";
import { MondrianUtils } from "../common/utils";

const enum TrashType {
  DisplayObject,
  Texture,
}

type Trash =
  | { type: TrashType.DisplayObject; target: DisplayObject }
  | { type: TrashType.Texture; target: Texture };

export class MondrianRenderer extends MondrianModuleBase {
  private $canvas: HTMLCanvasElement;

  /**
   * pixi's instances
   */
  private app: Application;

  private rootLayer: Container;
  // todo unsafe
  // high update freqency element like cursor or performces ui
  public uiLayer: Container;
  // real contents of stage
  private dynamicLayer: Container;
  // cached static texture layer
  private staticLayer: Container;
  // rewritable texture for snapshot
  private fixedTexture: RenderTexture;
  // sprite that hold snapshot
  private fixedSprite: Sprite;

  private dynamicLevel = 20;
  private dynamicCache: MondrianGraphicsHandler[] = [];

  private dynamicCacheIndex = -1;

  private trash: Trash[] = [];

  get pixiApp() {
    return this.app;
  }

  private get $panel() {
    return this.containerManager.$panel;
  }

  constructor(
    private containerManager: MondrianContainerManager,
    private shared: MondrianShared
  ) {
    super();
    this.initializePIXIApplication();
  }

  start() {
    super.start();
    this.rootLayer = new Container();
    this.uiLayer = new Container();
    this.dynamicLayer = new Container();
    this.staticLayer = new Container();

    // init a big enough texture,
    // draw static layer to this fixedTexture, and reuse this texture,
    // instead of creating new texture again an again.
    this.fixedTexture = RenderTexture.create({
      width: this.pixiApp.screen.width,
      height: this.pixiApp.screen.height,
    });
    this.fixedSprite = new Sprite(this.fixedTexture);

    this.rootLayer.addChild(
      this.fixedSprite,
      this.staticLayer,
      this.dynamicLayer,
      this.uiLayer
    );
    this.pixiApp.stage.addChild(this.rootLayer);

    this.pixiApp.ticker.minFPS = 60;
    /**
     * add main loop ticker
     */
    this.pixiApp.ticker.add(this.main);
    /**
     * add gc ticker
     */
    this.pixiApp.ticker.add(this.gc, undefined, UPDATE_PRIORITY.LOW);
    // show perf info
    this.initialPerfTool();
    this.pixiApp.start();
  }

  stop() {
    super.stop();
  }

  private initializePIXIApplication() {
    /**
     * in mobile pixi fallback to webgl1 even webview support webgl2
     * https://bugs.chromium.org/p/chromium/issues/detail?id=934823
     * https://github.com/pixijs/pixijs/issues/7899
     */
    // todo add version detect to set webgl1 as prefer_env before chrome 75
    settings.PREFER_ENV = ENV.WEBGL2;
    // Create a Pixi Application
    this.app = new Application({
      antialias: true,
      backgroundAlpha: 0,
      autoDensity: true,
      resolution: this.shared.settings.resolution,
      autoStart: false,
    });
    // Add the canvas that Pixi automatically created for you to the HTML document
    this.$canvas = this.app.view;
    this.containerManager.$container.appendChild(this.$canvas);
  }

  resize() {
    const wh = MondrianUtils.getScreenWH();
    this.app.view.style.width = `${wh.w}px`;
    this.app.view.style.height = `${wh.h}px`;
    this.app.renderer.resize(wh.w, wh.h);
  }

  private initialPerfTool() {
    /**
     * add perf ticker
     */
    this.pixiApp.ticker.add(this.perf, undefined, UPDATE_PRIORITY.LOW);
  }

  /**
   * shift graphics handler out when reach dynamicLevel,
   *
   */
  private shiftGrapicsHandlersToStatic() {
    while (this.dynamicCache.length > this.dynamicLevel) {
      const handler = this.dynamicCache.shift();
      this.dynamicCacheIndex--;
      // todo handler which is unfinished might also be shifted. Causing some unexpected behavior like unfinisded line.
      // todo these situation will be easily re-produce if dynamicLevel is set a small value like 2.
      // todo now just simple force stop the handler.
      handler.stop();
      const gs = handler.detach();
      gs.forEach((g) => {
        this.staticLayer.addChild(g);
      });
      handler.destroy();

      // Notices:
      // now, graphics objs that holding by handler are moved to static layer
    }
  }

  startGraphicsHandler(options?: MondrianGraphicsHandlerOptions) {
    // make sure dynamic cache size fit to history stack.
    // discard handlers if reaching dynamic level,

    // 1. check and discard leading cache
    this.shiftGrapicsHandlersToStatic();

    // 2. check and discard tail of cache
    this.checkAndCleanDiscardableDynamicCache();

    // create handler and add to cache
    const handler = new MondrianGraphicsHandler(this.dynamicLayer, options);
    this.dynamicCache.push(handler);
    handler.start();

    // move indicator
    this.dynamicCacheIndex += 1;

    return handler;
  }

  /**
   * these handler would not be moved to static layer
   * will be mark gc-able now.
   */
  checkAndCleanDiscardableDynamicCache() {
    const countOfTails =
      this.dynamicCache.length - (this.dynamicCacheIndex + 1);
    if (countOfTails > 0) {
      const toBeDelete = this.dynamicCache.splice(
        this.dynamicCacheIndex + 1,
        countOfTails
      );
      toBeDelete.map((h) => {
        h.stop();
        h.detach();
        h.gs.forEach((g) => {
          this.markGc({ type: TrashType.DisplayObject, target: g });
        });
        h.destroy();
      });
    }
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

  stopGraphicsHandler(handler: MondrianGraphicsHandler) {
    handler.stop();
  }

  private lastMainDt = 0;

  /**
   * main loop
   * normal prioriry
   * @returns
   */
  private main = (dt) => {
    if (this.lastMainDt < 30) {
      this.lastMainDt += dt;
      return;
    }
    this.lastMainDt = 0;
    if (this.dynamicCache.length <= this.dynamicLevel) return;
    this.shiftGrapicsHandlersToStatic();
    this.pixiApp.renderer.render(this.staticLayer, {
      renderTexture: this.fixedTexture,
      clear: false,
    });

    this.staticLayer.removeChildren().forEach((v) => {
      v.visible = false;
      this.markGc({ type: TrashType.DisplayObject, target: v });
    });
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
    if (this.lastPerfDt < 100) {
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
