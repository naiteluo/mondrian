import { Container, Graphics, ILineStyleOptions } from "pixi.js";
import { BrushPluginState } from "plugin/brush-plugin";

export interface ModrianGraphicsHandlerOptions {
  canCacheAsBitmap?: boolean;
  /**
   * enable discrete graphics
   */
  enableDiscrete?: boolean;
  lineStyle: ILineStyleOptions;
}

export class ModrianGraphicsHandler {
  static DefaultOptions: ModrianGraphicsHandlerOptions = {
    canCacheAsBitmap: true,
    enableDiscrete: true,
    lineStyle: {},
  };

  private _gs: Graphics[] = [];
  private _g?: Graphics;

  private _finished = false;

  private options: ModrianGraphicsHandlerOptions;

  constructor(
    private layer: Container,
    options?: ModrianGraphicsHandlerOptions
  ) {
    this.options = {
      ...ModrianGraphicsHandler.DefaultOptions,
      ...(options || {}),
    };
  }

  refresh() {
    this._g = undefined;
  }

  start() {}

  get gs() {
    return this._gs;
  }

  get g() {
    if (this._g) {
      return this._g;
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
        g.cacheAsBitmapResolution = 1;
        g.cacheAsBitmapMultisample = 4;
        g.cacheAsBitmap = true;
      });
    }
    this._finished = true;
  }

  detach() {
    return this._gs.map((g) => {
      return this.layer.removeChild(g);
    });
  }

  destroy() {
    this._gs = [];
    this._g = undefined;
    // this.layer = undefined;
    // this.options = undefined;
  }

  get finished() {
    return this._finished;
  }

  set lineStyle(style: BrushPluginState) {
    this.options.lineStyle = { ...style };
    this.g.lineStyle(this.options.lineStyle);
  }
}
