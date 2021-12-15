import { IData } from "data-manager";
import { ModrianRenderer } from "../renderer/modrian-renderer";
import { Sprite } from "pixi.js";
import { Plugin } from "./plugin";

import cursorImg from "../assets/cursor.png";

console.log(cursorImg);

export const CursorPluginPID = Symbol("cursor-plugin");

export class CursorPlugin extends Plugin {
  PID = CursorPluginPID;
  static PID = CursorPluginPID;

  private cursor: Sprite;

  constructor(_renderer: ModrianRenderer) {
    super(_renderer);
    // todo
    this.cursor = Sprite.from(cursorImg);
    _renderer.uiLayer.addChild(this.cursor);
  }

  reactDragMove(data: IData): void {
    this.cursor.x = data.data.x;
    this.cursor.y = data.data.y;
  }
}
