import { Application } from "@pixi/app";
import { Container } from "@pixi/display";
import { Graphics } from "@pixi/graphics";

export class ModrianRenderer {
  private rootLayer: Container;
  private dynamicLayer: Container;
  private staticLayer: Container;

  constructor(private app: Application) {
    this.rootLayer = new Container();
    this.dynamicLayer = new Container();
    this.staticLayer = new Container();
    this.rootLayer.addChild(this.staticLayer, this.dynamicLayer);
    this.app.stage.addChild(this.rootLayer);
    this.app.ticker.minFPS = 60;
    this.app.ticker.add(this.tickerHandler);
  }

  getTestHandle() {
    const g = new Graphics();
    this.dynamicLayer.addChild(g);
    return g;
  }

  private tickerHandler = () => {};
}
