import { BLEND_MODES } from "@pixi/constants";
import { MondrianGraphicsHandler } from "../renderer/grapichs-handler";
import { MondrianRenderer } from "../renderer/renderer";
import { MondrianPlugin } from "./plugin";

export const ClearPluginPID = Symbol("clear-plugin");

export class ClearPlugin extends MondrianPlugin {
  protected handler: MondrianGraphicsHandler;

  PID = ClearPluginPID;

  static PID = ClearPluginPID;

  constructor(_renderer: MondrianRenderer) {
    super(_renderer);
  }

  // todo do have racing issue in this kind of command
  // todo don't react continuous clear command
  reactClear(event: any): void {
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
  }
}
