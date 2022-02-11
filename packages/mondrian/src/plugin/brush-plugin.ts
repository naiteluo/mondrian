import {
  IMondrianData,
  IMondrianInteractData,
  IMondrianStateData,
} from "../data-manager";
import { MondrianPlugin, PluginType } from "./plugin";

import { ILineStyleOptions } from "@pixi/graphics";
import { filters, IPointData } from "pixi.js";
import { MondrianShared } from "../shared";
import { IMondrianPlayerState } from "../player";
import { MondrianGraphicsHandler } from "../renderer/grapichs-handler";
import { BrushPluginState } from "./brush-common";

/**
 * this brush plugin class is a base class of brushes
 * will not be actually loaded in real-time
 */
export class BrushPlugin extends MondrianPlugin {
  static Type = PluginType.ConsumerExcludesive;

  static override PID = Symbol("brush-plugin");

  static override predicate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: IMondrianData | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shared?: MondrianShared
  ): boolean {
    throw new Error(
      "Base BrushPlugin Class can't be registered to plugin list."
    );
  }

  protected sharedAlphaFilter = new filters.AlphaFilter(0.4);

  protected sharedFXAAFilter = new filters.FXAAFilter();

  private isDrawing = false;

  protected startPos!: IPointData;

  protected currentPos!: IPointData;

  protected playerState!: IMondrianPlayerState;

  protected brushState!: Partial<BrushPluginState>;

  protected handler!: MondrianGraphicsHandler;

  protected lineStyle!: ILineStyleOptions;

  override reactStateChange(data: IMondrianData): boolean {
    this.playerState = (data as IMondrianStateData).data.player;
    this.brushState = { ...this.playerState.brush } || {};
    this.lineStyle = {
      ...(this.brushState.lineStyle || {}),
      width: this.brushState.brushWidth,
      color: this.brushState.brushColor,
    };
    return true;
  }

  override reactDragStart(data: IMondrianInteractData): boolean {
    if (this.isDrawing) {
      return false;
    }
    const p = { x: data.data.x, y: data.data.y };
    this.isDrawing = true;
    this.startPos = this.currentPos = { ...p };
    this.handler = this.renderer.startGraphicsHandler();
    this.handler.lineStyle = this.lineStyle;
    return true;
  }

  override reactDragMove(data: IMondrianInteractData): boolean {
    if (!this.isDrawing) return false;
    const p = { x: data.data.x, y: data.data.y };
    this.currentPos = { ...p };
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override reactDragEnd(_data: IMondrianInteractData): boolean {
    if (!this.isDrawing) return false;
    this.isDrawing = false;
    this.handler.stop();
    return true;
  }
}
