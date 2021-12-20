import { Container, Graphics, ILineStyleOptions, MSAA_QUALITY } from "pixi.js";
import { BrushPluginState } from "plugin/brush-plugin";

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
    enableDiscrete: false,
    lineStyle: {},
  };

  private _gs: Graphics[] = [];
  private _g?: Graphics;

  private _finished = false;

  private options: MondrianGraphicsHandlerOptions;

  constructor(
    private layer: Container,
    options?: MondrianGraphicsHandlerOptions
  ) {
    this.options = {
      ...MondrianGraphicsHandler.DefaultOptions,
      ...(options || {}),
    };
  }

  refresh() {
    if (this.options.enableDiscrete) {
      this._g = undefined;
    }
  }

  start() {}

  get gs() {
    return this._gs;
  }

  get g() {
    if (this._g) {
      return this._g;
    }
    if (this._finished) {
      throw new Error("Accessing finished handler is forbidden.");
    }
    this._g = new Graphics();
    this._gs.push(this._g);
    this.layer.addChild(this._g);
    this._g.lineStyle(this.options.lineStyle);
    return this._g;
  }

  stop() {
    if (this.options.canCacheAsBitmap) {
      this._gs.forEach((g) => {
        if (!g.cacheAsBitmap) {
          // g.cacheAsBitmapResolution = 1;
          g.cacheAsBitmapMultisample = MSAA_QUALITY.NONE;
          g.cacheAsBitmap = true;
        }
      });
    }
    this._finished = true;
  }

  attach() {
    return this._gs.map((g) => {
      return this.layer.addChild(g);
    });
  }

  detach() {
    if (!this._finished) {
      throw new Error("Detaching unfinished handler is forbidden.");
    }
    return this._gs.map((g) => {
      return this.layer.removeChild(g);
    });
  }

  destroy() {
    this._gs = [];
    this._g = undefined;
    this.layer = undefined;
    this.options = undefined;
  }

  get finished() {
    return this._finished;
  }

  set lineStyle(style: BrushPluginState) {
    this.options.lineStyle = { ...style };
    this.g.lineStyle(this.options.lineStyle);
  }
}
