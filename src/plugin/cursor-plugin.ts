import { IMondrianData } from "../data-manager";
import { MondrianRenderer } from "../renderer/renderer";
import { Sprite } from "pixi.js";
import { MondrianPlugin } from "./plugin";

import cursorImg from "../assets/cursor.png";

export const CursorPluginPID = Symbol("cursor-plugin");

export class CursorPlugin extends MondrianPlugin {
  PID = CursorPluginPID;
  static PID = CursorPluginPID;

  private cursor: Sprite;

  constructor(_renderer: MondrianRenderer) {
    super(_renderer);
    // todo
    this.cursor = Sprite.from(cursorImg);
    _renderer.uiLayer.addChild(this.cursor);
  }

  reactDragMove(data: IMondrianData): void {
    this.cursor.x = data.data.x;
    this.cursor.y = data.data.y;
  }
}
