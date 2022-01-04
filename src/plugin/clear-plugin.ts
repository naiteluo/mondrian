import { BLEND_MODES } from "@pixi/constants";
import { IMondrianData } from "../data-manager";
import { MondrianGraphicsHandler } from "../renderer/grapichs-handler";
import { MondrianRenderer } from "../renderer/renderer";
import { MondrianShared } from "../shared";
import { MondrianPlugin, PluginType } from "./plugin";

export class ClearPlugin extends MondrianPlugin {
  static Type = PluginType.Global;

  static PID = Symbol("clear-plugin");

  static predicate(
    data: IMondrianData | null,
    shared?: MondrianShared
  ): boolean {
    if (data === null) {
      return true;
    }
    return false;
  }

  protected handler: MondrianGraphicsHandler;

  constructor(_renderer: MondrianRenderer) {
    super(_renderer);
  }

  // todo do have racing issue in this kind of command
  // todo don't react continuous clear command
  reactClear(event: any): boolean {
    this.handler = this.renderer.startGraphicsHandler();
    this.handler.config({
      enableDiscrete: false,
      canCacheAsBitmap: false,
    });
    this.handler.g.beginFill(0x000000);
    this.handler.g.blendMode = BLEND_MODES.ERASE;
    this.handler.g.drawRect(
      0,
      0,
      this.renderer.pixiApp.screen.width,
      this.renderer.pixiApp.screen.height
    );
    this.handler.stop();
    return true;
  }
}