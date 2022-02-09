import { BLEND_MODES } from "@pixi/constants";
import { IMondrianData } from "../data-manager";
import { MondrianGraphicsHandler } from "../renderer/grapichs-handler";
import { MondrianPlugin, PluginType } from "./plugin";

export class ClearPlugin extends MondrianPlugin {
  static Type = PluginType.Global;

  static override PID = Symbol("clear-plugin");

  static override predicate(data: IMondrianData | null): boolean {
    if (data === null) {
      return true;
    }
    return false;
  }

  protected handler?: MondrianGraphicsHandler;

  // todo do have racing issue in this kind of command
  // todo don't react continuous clear command
  override reactClear(): boolean {
    this.handler = this.renderer.startGraphicsHandler();
    this.handler.config({
      enableDiscrete: false,
      canCacheAsBitmap: false,
    });
    this.handler.g.beginFill(0x000000);   
    this.handler.g.blendMode = BLEND_MODES.ERASE;
    let padding = 0;
    if (this.shared.settings.background) {
      padding = 1;
    }
    this.handler.g.drawRect(
      padding,
      padding,
      this.renderer.viewport.worldWidth - 2 * padding,
      this.renderer.viewport.worldHeight - 2 * padding
    );
    this.handler.stop();
    return true;
  }
}
