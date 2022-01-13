import { IMondrianData } from "../data-manager";
import { MondrianRenderer } from "../renderer/renderer";
import { Sprite, Texture } from "pixi.js";
import { MondrianPlugin, PluginType } from "./plugin";

import cursorImg from "../assets/cursor.png";
import drawImg from "../assets/cursor-draw.png";
import dragImg from "../assets/cursor-drag.png";
import { MondrianShared } from "../shared";
import { MondrianPluginManager } from "./plugin-manager";
import { DropShadowFilter } from "@pixi/filter-drop-shadow";

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

  static dropShadowFilter = new DropShadowFilter({
    color: 0xffffff,
    alpha: 1,
    rotation: 10,
    blur: 1,
    distance: 3,
  });

  private autoHideHandler?: number;

  private cursorTexture: Texture;

  private cursorDrawTexture: Texture;

  private cursorDargTexture: Texture;

  private cursor: Sprite;

  constructor(
    _renderer: MondrianRenderer,
    shared: MondrianShared,
    manager: MondrianPluginManager
  ) {
    super(_renderer, shared, manager);
    this.cursorTexture = Texture.from(cursorImg);
    this.cursorDrawTexture = Texture.from(drawImg);
    this.cursorDargTexture = Texture.from(dragImg);
    this.cursor = new Sprite(this.cursorDrawTexture);
    this.cursor.filters = [CursorPlugin.dropShadowFilter];
    _renderer.uiLayer.addChild(this.cursor);
    this.triggerHideWhenIdle();
  }

  reactDragMove(data: IMondrianData): boolean {
    this.cursor.visible = true;
    this.cursor.x = data.data.x;
    this.cursor.y = data.data.y - this.cursor.height;
    this.cursor.scale.set(
      0.5 / this.renderer.scale.x,
      0.5 / this.renderer.scale.y
    );
    this.triggerHideWhenIdle();
    return true;
  }

  private triggerHideWhenIdle() {
    if (this.autoHideHandler) {
      clearTimeout(this.autoHideHandler);
      this.autoHideHandler = undefined;
    }
    this.autoHideHandler = window.setTimeout(() => {
      this.cursor.visible = false;
    }, 1000);
  }

  reactKeyDown(data: IMondrianData) {
    if (this.shared.settings.viewport) {
      this.cursor.texture = this.cursorDargTexture;
      return true;
    }
    return false;
  }

  reactKeyUp(data: IMondrianData) {
    if (this.shared.settings.viewport) {
      this.cursor.texture = this.cursorDrawTexture;
      return true;
    }
    return false;
  }
}
