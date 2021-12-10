import { Application } from "@pixi/app";
import { Container } from "@pixi/display";
import { Graphics } from "@pixi/graphics";
import { Rectangle } from "@pixi/math";
import { BaseTextureCache } from "@pixi/utils";
import { BaseTexture, settings, Sprite } from "pixi.js";

export class ModrianRenderer {
  private rootLayer: Container;
  private dynamicLayer: Container;
  private staticLayer: Sprite;

  private dynamicLevel = 5;
  private gPool = [];

  constructor(private app: Application) {
    this.rootLayer = new Container();
    this.dynamicLayer = new Container();
    this.staticLayer = new Sprite();
    this.rootLayer.addChild(this.staticLayer, this.dynamicLayer);
    this.app.stage.addChild(this.rootLayer);
    this.app.ticker.minFPS = 60;
    this.app.ticker.add(this.main);
    this.app.ticker.add(this.gc);
    settings.GC_MAX_CHECK_COUNT = 2;
    // @ts-ignore
    window.BaseTextureCache = BaseTextureCache;
  }

  getTestHandle() {
    const g = new Graphics();
    this.dynamicLayer.addChild(g);
    this.gPool.push(g);
    return g;
  }

  private main = () => {
    if (this.dynamicLayer.children.length <= this.dynamicLevel) return;

    while (this.dynamicLayer.children.length > this.dynamicLevel) {
      const g = this.dynamicLayer.removeChildAt(0);
      this.staticLayer.addChild(g);
    }

    const wh = { w: this.app.stage.width, h: this.app.stage.height };
    const texture = this.app.renderer.generateTexture(this.staticLayer, {
      region: new Rectangle(0, 0, wh.w, wh.h),
    });

    this.staticLayer.removeChildren().forEach((v) => {
      v.visible = false;
    });
    this.staticLayer.texture.destroy(true);
    this.staticLayer.texture = texture;
  };

  private gc = () => {};
}
