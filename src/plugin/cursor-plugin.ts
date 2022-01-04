import { IMondrianData } from "../data-manager";
import { MondrianRenderer } from "../renderer/renderer";
import { Sprite } from "pixi.js";
import { MondrianPlugin, PluginType } from "./plugin";

import cursorImg from "../assets/cursor.png";
import { MondrianShared } from "../shared";

export class CursorPlugin extends MondrianPlugin {
  static Type = PluginType.Global;

  static PID = Symbol("cursor-plugin");

  static predicate(
    data: IMondrianData | null,
    shared?: MondrianShared
  ): boolean {
    if (shared.settings.disableCursor) {
      return false;
    }
    if (data === null) {
      return true;
    }
    return false;
  }

  private cursor: Sprite;

  constructor(_renderer: MondrianRenderer) {
    super(_renderer);
    this.cursor = Sprite.from(cursorImg);
    _renderer.uiLayer.addChild(this.cursor);
  }

  reactDragMove(data: IMondrianData): boolean {
    this.cursor.x = data.data.x;
    this.cursor.y = data.data.y;
    return true;
  }
}
