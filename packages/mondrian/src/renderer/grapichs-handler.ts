import { DashLine, DashLineOptions } from "pixi-dashed-line";
import { Container, Graphics, ILineStyleOptions, MSAA_QUALITY } from "pixi.js";
import { TextInput } from "../common/pixi-text-input";
import { MondrianShared } from "../shared";
import { MondrianRenderer } from "./renderer";

export interface MondrianGraphicsHandlerOptions {
  canCacheAsBitmap?: boolean;
  /**
   * enable discrete graphics
   */
  enableDiscrete?: boolean;
  lineStyle: ILineStyleOptions;
}

export class MondrianGraphicsHandler {
  static DefaultOptions: MondrianGraphicsHandlerOptions = {
    canCacheAsBitmap: true,
    /**
     * todo dig into this issue
     *
     * combine discrete grahpics as a handler has to cover so many
     * situation, like copy full attrs set to old grahpic when new
     * grahpics are automatically created. so disbale this.
     *
     *
     */
    enableDiscrete: false,
    lineStyle: {},
  };

  private _c?: Container;

  private _g?: Graphics;

  private _finished = false;

  private options: MondrianGraphicsHandlerOptions;

  constructor(
    private renderer: MondrianRenderer,
    private layer: Container | undefined,
    private shared: MondrianShared,
    options?: MondrianGraphicsHandlerOptions
  ) {
    if (layer === undefined) {
      throw new Error("layer for graphics handler is undefined");
    }
    this.options = {
      ...MondrianGraphicsHandler.DefaultOptions,
      ...(options || {}),
    };
  }

  config(options: Partial<MondrianGraphicsHandlerOptions>) {
    this.options = {
      ...this.options,
      ...options,
    };
  }

  refresh() {
    if (this.options.enableDiscrete) {
      this._g = undefined;
    }
  }

  start() {
    // nothing
  }

  get c() {
    if (!this._c) {
      this._c = new Container();
      if (!this.g) {
        // do nothing
      }
    }
    return this._c;
  }

  get g() {
    if (this._g) {
      return this._g;
    }
    if (this._finished) {
      throw new Error("Accessing finished handler is forbidden.");
    }
    if (!this.layer) {
      throw new Error("layer is not initialized");
    }
    this._g = new Graphics();
    this.c.addChild(this._g);
    this.layer.addChild(this.c);
    this._g.lineStyle(this.options.lineStyle);
    return this._g;
  }

  stop() {
    if (this.options.canCacheAsBitmap && !this.shared.settings.viewport) {
      this.c.children.forEach((g) => {
        if (!g.cacheAsBitmap) {
          g.cacheAsBitmapMultisample = MSAA_QUALITY.MEDIUM;
          g.cacheAsBitmap = true;
        }
      });
    }
    this._finished = true;
    this.renderer.exchangeBufferingCache(this);
  }

  attach() {
    if (!this.layer) {
      throw new Error("layer is not initialized");
    }
    this.layer.addChild(this.c);
  }

  detach() {
    if (!this.layer) {
      throw new Error("layer is not initialized");
    }
    if (!this._finished) {
      console.trace();
      throw new Error("Detaching unfinished handler is forbidden.");
    }
    // remove references
    this.children = {};
    this.dashlines = {};
    return this.layer.removeChild(this.c);
  }

  afterDetach() {
    // pixijs Text is lazy by default.
    // mannualy trigger texture update here
    // before draw Texts to renderTexture.
    // without this step, text will be in wrong position
    // after draw static layer to render texture.
    for (const key in this.texts) {
      if (Object.prototype.hasOwnProperty.call(this.texts, key)) {
        const text = this.texts[key];
        text.surrogate?.updateText(true);
      }
    }
  }

  destroy() {
    // remove references
    this.children = {};
    this.dashlines = {};
    this.texts = {};
    this._g = undefined;
    this._c = undefined;
    this.layer = undefined;
  }

  get finished() {
    return this._finished;
  }

  set lineStyle(style: ILineStyleOptions) {
    this.options.lineStyle = { ...style };
    this.g.lineStyle(this.options.lineStyle);
    this.c.children.forEach((obj) => {
      const g = obj as Graphics;
      if (g.lineStyle) {
        g.lineStyle(this.options.lineStyle);
      }
    });
  }

  get lineStyle() {
    return this.options.lineStyle;
  }

  /**
   * references to children graphics
   */
  public children: {
    [name: string]: Graphics;
  } = {};

  /**
   *  references to dashline instances
   */
  public dashlines: {
    [name: string]: DashLine;
  } = {};

  /**
   *  references to text instances
   */
  public texts: {
    [name: string]: TextInput;
  } = {};

  public createDashLine(g: Graphics, options?: DashLineOptions) {
    // dashline instance need to be recreate when start draw new stuff
    // but graphic can be reused
    return new DashLine(g, {
      ...(options || {}),
      dash: [10, 5],
      ...this.lineStyle,
      useTexture: true,
    });
  }
}
