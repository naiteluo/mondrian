import { Application, IApplicationOptions } from "@pixi/app";
import { Container, DisplayObject } from "@pixi/display";
import { BaseTextureCache } from "@pixi/utils";
import { MondrianModuleBase } from "../common/module-base";
import {
  BaseTexture,
  ENV,
  Graphics,
  MSAA_QUALITY,
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
import { Viewport } from "pixi-viewport";

const enum TrashType {
  DisplayObject,
  Texture,
}

/**
 * default dynamic level for history stack
 */
const DefaultDynamicLevel = 20;
/**
 * default dynamic level for high capacity mode
 * will disable graphics' cacheasbitmap and mass
 * shift dynamic cache to static layer and take snapshot in
 * low freqency
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HighCapactityDefaultDynamicLevel = 40;

type Trash =
  | { type: TrashType.DisplayObject; target: DisplayObject }
  | { type: TrashType.Texture; target: Texture };

export class MondrianRenderer extends MondrianModuleBase {
  private $canvas!: HTMLCanvasElement;

  /**
   * pixi's instances
   */
  private app!: Application;

  public viewport!: Viewport;

  public rootLayer!: Container;

  // todo unsafe
  // high update freqency element like cursor or performces ui
  public uiLayer!: Container;

  // real contents of stage
  private dynamicLayer!: Container;

  // cached static texture layer
  private staticLayer!: Container;

  // rewritable texture for snapshot
  private fixedTexture!: RenderTexture;

  // sprite that hold snapshot
  private fixedSprite!: Sprite;

  private dynamicLevel = DefaultDynamicLevel;

  // two level dynamic cache:
  // 1. dynamicBufferingCache
  //    for unfinished grahpic handlers
  //    handler will move to dynamicCache when finished or timeout
  private dynamicBufferingCache: MondrianGraphicsHandler[] = [];

  // 2. dynamicCache
  //    for finished graphic hanler
  //    history command can only manipulate dynamicCache
  private dynamicCache: MondrianGraphicsHandler[] = [];

  private dynamicCacheIndex = -1;

  private trash: Trash[] = [];

  /**
   * pixi app instance
   */
  get pixiApp() {
    return this.app;
  }

  /**
   * pixi app ticker
   */
  get ticker() {
    return this.app.ticker;
  }

  /**
   * current viewport scale
   */
  get scale() {
    if (this.viewport) {
      return this.viewport.scale;
    } else {
      return { x: 1, y: 1 };
    }
  }

  /**
   * current bounding rect size of world
   */
  get worldRect() {
    return {
      width: this.viewport.worldWidth,
      height: this.viewport.worldHeight,
    };
  }

  private get $panel() {
    return this.containerManager.$panel;
  }

  constructor(
    private containerManager: MondrianContainerManager,
    private shared: MondrianShared
  ) {
    super();

    this.dynamicLevel = this.shared.settings.historySize || DefaultDynamicLevel;

    this.initializePIXIApplication();
  }

  override start() {
    super.start();
    this.rootLayer = new Container();
    this.uiLayer = new Container();
    this.dynamicLayer = new Container();
    this.staticLayer = new Container();

    this.initializeFixedTexture();

    /**
     * use mask to clip out of bound elements
     */
    const rootLayerMask = new Graphics();
    rootLayerMask.beginFill(0x000000);
    rootLayerMask.drawRect(
      0,
      0,
      this.shared.settings.worldWidth,
      this.shared.settings.worldHeight
    );
    this.rootLayer.mask = rootLayerMask;

    this.rootLayer.addChild(
      // add mask to root so it can transfrom with view port
      rootLayerMask,
      this.fixedSprite,
      this.staticLayer,
      this.dynamicLayer
    );

    this.viewport = new Viewport({
      screenWidth: this.pixiApp.screen.width,
      screenHeight: this.pixiApp.screen.height,
      worldWidth: this.shared.settings.worldWidth,
      worldHeight: this.shared.settings.worldHeight,
      interaction: this.pixiApp.renderer.plugins.interaction,
    });
    if (this.shared.settings.background) {
      const background = this.viewport.addChild(new Graphics());
      background
        .beginFill(0xffffff, 1)
        .drawRect(0, 0, this.viewport.worldWidth, this.viewport.worldHeight)
        .endFill()
        .lineStyle({
          width: 2,
          color: 0x13c039,
        })
        .drawRect(
          1,
          1,
          this.viewport.worldWidth - 2,
          this.viewport.worldHeight - 2
        );
    }
    this.pixiApp.stage.addChild(this.viewport);
    this.viewport.addChild(this.rootLayer, this.uiLayer);
    this.viewport.clamp({
      left: -this.viewport.worldWidth / 2,
      right: (this.viewport.worldWidth * 3) / 2,
      top: -this.viewport.worldHeight / 2,
      bottom: (this.viewport.worldHeight * 3) / 2,
    });
    this.viewport.clampZoom({ minScale: 0.5, maxScale: 20 });
    this.viewport.drag().pinch().wheel().decelerate();

    this.fitViewportToCenter();

    this.viewport.pause = true;

    this.pixiApp.ticker.minFPS = 30;
    this.pixiApp.ticker.maxFPS = 60;
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

  /**
   * reset viewport position and scale to fit container's center
   */
  public fitViewportToCenter() {
    if (this.shared.settings.viewport) {
      this.viewport.fit();
    } else {
      const screenRatio =
        this.pixiApp.screen.width / this.pixiApp.screen.height;
      const worldRatio =
        this.shared.settings.worldWidth / this.shared.settings.worldHeight;
      if (screenRatio > worldRatio) {
        this.viewport.fitWidth(
          this.viewport.findFitWidth(this.pixiApp.screen.width) *
            this.viewport.worldWidth
        );
      } else {
        this.viewport.fitHeight(
          this.viewport.findFitHeight(this.pixiApp.screen.height) *
            this.viewport.worldHeight
        );
      }
    }

    this.viewport.moveCenter(
      this.viewport.worldWidth / 2,
      this.viewport.worldHeight / 2
    );
  }

  override stop() {
    super.stop();
  }

  private initializePIXIApplication() {
    /**
     * in mobile pixi fallback to webgl1 even webview support webgl2
     * https://bugs.chromium.org/p/chromium/issues/detail?id=934823
     * https://github.com/pixijs/pixijs/issues/7899
     */
    // todo #7 add version detect to set webgl1 as prefer_env before chrome 75
    settings.PREFER_ENV = ENV.WEBGL2;
    // Create a Pixi Application

    const pixiConfig: IApplicationOptions = {
      antialias: true,
      backgroundAlpha: 0,
      autoDensity: true,
      resolution: this.shared.settings.resolution,
      autoStart: false,
    };

    if (this.shared.settings.background) {
      pixiConfig.backgroundAlpha = 1;
      pixiConfig.backgroundColor = 0xf8f9fa;
    }

    this.app = new Application(pixiConfig);
    // Add the canvas that Pixi automatically created for you to the HTML document
    this.$canvas = this.app.view;
    this.containerManager.$container.appendChild(this.$canvas);
  }

  /**
   *
   * @returns image object
   */
  public exportToImage(): any {
    const tmpTexture = RenderTexture.create({
      width: this.shared.settings.worldWidth,
      height: this.shared.settings.worldHeight,
    });
    this.app.renderer.render(this.fixedSprite, {
      renderTexture: tmpTexture,
    });

    const img = this.app.renderer.plugins.extract.image(
      tmpTexture,
      "image/png"
    );
    tmpTexture.destroy(true);
    return img;
  }

  /**
   *
   * @returns image base64 string
   */
  public exportToBase64(): string {
    const tmpTexture = RenderTexture.create({
      width: this.shared.settings.worldWidth,
      height: this.shared.settings.worldHeight,
    });
    this.app.renderer.render(this.fixedSprite, {
      renderTexture: tmpTexture,
    });

    const str = this.app.renderer.plugins.extract.base64(
      tmpTexture,
      "image/png"
    );
    tmpTexture.destroy(true);
    return str;
  }

  async updateFixedTexture(img: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = img;
      image.onload = () => {
        const sprite = Sprite.from(image);
        this.pixiApp.renderer.render(sprite, {
          renderTexture: this.fixedTexture,
          clear: true,
        });
        this.blitFrameBuffer();
        // manually render the whole stage imediately.
        this.pixiApp.renderer.render(this.pixiApp.stage);
        resolve();
      };
    });
  }

  private initializeFixedTexture(): void {
    const hasOldTexture = this.fixedTexture;
    if (hasOldTexture) {
      this.fixedTexture.destroy(true);
    }
    // init a big enough texture,
    // draw static layer to this fixedTexture, and reuse this texture,
    // instead of creating new texture again an again.
    this.fixedTexture = RenderTexture.create({
      width: this.shared.settings.worldWidth,
      height: this.shared.settings.worldHeight,
      multisample: MSAA_QUALITY.MEDIUM,
      resolution: this.shared.settings.resolution,
    });
    if (hasOldTexture) {
      this.fixedSprite.texture = this.fixedTexture;
    } else {
      this.fixedSprite = new Sprite(this.fixedTexture);
    }
  }

  private blitFrameBuffer() {
    if (this.fixedTexture.multisample > 0) {
      // mannualy trigger framebuffer blit() to solve below issue
      // https://github.com/pixijs/pixijs/pull/7633/commits/4fed9efb876b4d505fd862ba2e822b72b55f8240
      // todo might have better solution
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.pixiApp.renderer.framebuffer.blit();
    }
  }

  clear() {
    this.initializeFixedTexture();
    this.clearStaticLayer();
    this.clearDynamicLayer();
    this.gc();
  }

  private clearDynamicLayer() {
    while (this.dynamicCache.length > 0) {
      const handler = this.dynamicCache.shift();
      if (handler) {
        handler.detach();
        this.markGc({ type: TrashType.DisplayObject, target: handler.c });
        handler.afterDetach();
        handler.destroy();
      }
    }
    while (this.dynamicBufferingCache.length > 0) {
      const handler = this.dynamicCache.shift();
      if (handler) {
        handler.detach();
        this.markGc({ type: TrashType.DisplayObject, target: handler.c });
        handler.afterDetach();
        handler.destroy();
      }
    }
    this.dynamicCacheIndex = -1;
  }

  private clearStaticLayer() {
    this.staticLayer.removeChildren().forEach((v) => {
      v.visible = false;
      this.markGc({ type: TrashType.DisplayObject, target: v });
    });
  }

  resize() {
    this.app.view.style.width = `${this.containerManager.$container.clientWidth}px`;
    this.app.view.style.height = `${this.containerManager.$container.clientHeight}px`;
    this.app.renderer.resize(
      this.containerManager.$container.clientWidth,
      this.containerManager.$container.clientHeight
    );
    if (this.viewport) {
      this.viewport.resize(
        this.pixiApp.screen.width,
        this.pixiApp.screen.height,
        this.shared.settings.worldWidth,
        this.shared.settings.worldHeight
      );
      this.viewport.moveCenter(
        this.viewport.worldWidth / 2,
        this.viewport.worldHeight / 2
      );
    }
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
    // determine whether trigger cache shift
    if (this.dynamicCache.length <= this.dynamicLevel) {
      return;
    }
    // keep size just right as this.dynamicLevel
    while (this.dynamicCache.length > this.dynamicLevel) {
      const handler = this.dynamicCache.shift();
      if (handler) {
        this.dynamicCacheIndex--;
        handler.detach();
        this.staticLayer.addChild(handler.c);
        handler.afterDetach();
        handler.destroy();
      }

      // Notices:
      // now, graphics objs that holding by handler are moved to static layer
    }
  }

  startGraphicsHandler(
    options: MondrianGraphicsHandlerOptions = MondrianGraphicsHandler.DefaultOptions
  ) {
    // make sure dynamic cache size fit to history stack.
    // discard handlers if reaching dynamic level,

    // 1. check and discard leading cache
    this.shiftGrapicsHandlersToStatic();

    // 2. check and discard tail of cache
    this.checkAndCleanDiscardableDynamicCache();

    const handlerOptions = { ...options };

    // create handler and add to cache
    const handler = new MondrianGraphicsHandler(
      this,
      this.dynamicLayer,
      this.shared,
      {
        ...handlerOptions,
      }
    );
    this.dynamicBufferingCache.push(handler);
    handler.start();

    return handler;
  }

  public __debug_grahpic_draw = 0;

  exchangeBufferingCache(handler: MondrianGraphicsHandler) {
    this.__debug_grahpic_draw++;
    const idx = this.dynamicBufferingCache.indexOf(handler);
    if (idx !== -1) {
      // todo do we really need to double check it?
      // check and discard leading cache
      this.shiftGrapicsHandlersToStatic();

      const removed = this.dynamicBufferingCache.splice(idx, 1);
      this.dynamicCache.push(...removed);
      // move indicator
      this.dynamicCacheIndex += 1;
    } else {
      console.trace();
      throw new Error("Unexpected dangling handler");
    }
  }

  stopGraphicsHandler(handler: MondrianGraphicsHandler) {
    handler.stop();
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
        h.detach();
        this.markGc({ type: TrashType.DisplayObject, target: h.c });
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

  /**
   * main loop
   * normal prioriry
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private main = (_dt: number) => {
    this.shiftGrapicsHandlersToStatic();

    // nothing in static layer, no need to update texture
    // if viewport control opens, no need to update texture
    // if (
    //   this.staticLayer.children.length === 0 ||
    //   this.shared.settings.viewport
    // ) {
    if (this.staticLayer.children.length === 0) {
      return;
    }

    this.shared.log(
      `drawing ${this.staticLayer.children.length} grahpics to texture`
    );

    this.pixiApp.renderer.render(this.staticLayer, {
      renderTexture: this.fixedTexture,
      clear: false,
    });

    this.blitFrameBuffer();

    this.clearStaticLayer();
  };

  /**
   * gc loop
   * low priority
   */
  private gc = () => {
    // todo disable discrete handler
    // todo #13 we are having idempotent issue, stop this feature temporarily
    // this.dynamicCache.forEach((v) => {
    //   v.refresh();
    // });
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

  private markGc(item: Trash) {
    this.trash.push(item);
  }

  lastPerfDt = 0;

  textureMem = 0;

  graphicsCount = 0;

  private perf = (dt: number) => {
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
    tmpMemSize +=
      (this.fixedTexture.baseTexture.realWidth *
        this.fixedTexture.baseTexture.realHeight *
        4 *
        4) /
      1024 /
      1024;
    let tmpGraphicsCount = this.dynamicCache.reduce((prev, v) => {
      return prev + v.c.children.length;
    }, 0);
    tmpGraphicsCount = this.dynamicBufferingCache.reduce((prev, v) => {
      return prev + v.c.children.length;
    }, tmpGraphicsCount);
    if (
      tmpMemSize !== this.textureMem ||
      tmpGraphicsCount !== this.graphicsCount
    ) {
      this.textureMem = tmpMemSize;
      this.graphicsCount = tmpGraphicsCount;
      if (this.$panel) {
        this.shared.logTextureMem(`${this.textureMem.toFixed(2)} MB`);
        this.shared.logGCount(tmpGraphicsCount);
      }
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
      console.error(
        `unfinished graphic in dynamicCache is fatal, counts: (${this.__debug_unfinishedHandlerCount}) unfinished handle!!!!`
      );
    }
  }
}
