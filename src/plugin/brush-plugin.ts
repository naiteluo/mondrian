import { IMondrianData, IMondrianStateData } from "../data-manager";
import { MondrianPlugin, PluginType } from "./plugin";

import { ILineStyleOptions, LINE_CAP, LINE_JOIN } from "@pixi/graphics";
import { filters, IPointData } from "pixi.js";
import { MondrianShared } from "../shared";
import { IMondrianPlayerState } from "../player";
import { MondrianGraphicsHandler } from "../renderer/grapichs-handler";

export const enum BrushName {
  Pencil = "Pencil",
  Eraser = "Eraser",
  Highlighter = "Highlighter",
  Dash = "Dash",
  Rectangle = "Rectangle",
  Circle = "Circle",
}

export interface BrushPluginState {
  brushName: BrushName;
  brushColor: number;
  brushWidth: 5;
  lineStyle: ILineStyleOptions;
}

export const defaultBrushOptions: BrushPluginState = {
  brushName: BrushName.Pencil,
  brushColor: 0x000000,
  brushWidth: 5,
  lineStyle: {
    cap: LINE_CAP.ROUND,
    join: LINE_JOIN.ROUND,
    width: 5,
    alpha: 1,
    native: false,
  },
};

/**
 * this brush plugin class is a base class of brushes
 * will not be actually loaded in real-time
 */
export class BrushPlugin extends MondrianPlugin {
  static Type = PluginType.ConsumerExcludesive;

  static PID = Symbol("brush-plugin");

  static predicate(
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

  protected startPos: IPointData;

  protected currentPos: IPointData;

  protected state: IMondrianPlayerState;

  protected handler: MondrianGraphicsHandler;

  protected lineStyle: ILineStyleOptions;

  reactStateChange(data: IMondrianData): boolean {
    this.state = (data as IMondrianStateData).data.player;
    this.lineStyle = {
      ...this.state.brush.lineStyle,
      width: this.state.brush.brushWidth,
      color: this.state.brush.brushColor,
    };
    return true;
  }

  reactDragStart(data: IMondrianData): boolean {
    // todo if we should handle isDrawing === ture here?
    const p = { x: data.data.x, y: data.data.y };
    this.isDrawing = true;
    this.startPos = this.currentPos = { ...p };
    this.handler = this.renderer.startGraphicsHandler();
    this.handler.lineStyle = this.lineStyle;
    return true;
  }

  reactDragMove(data: IMondrianData): boolean {
    if (!this.isDrawing) return false;
    const p = { x: data.data.x, y: data.data.y };
    this.currentPos = { ...p };
    return true;
  }

  reactDragEnd(data: IMondrianData): boolean {
    if (!this.isDrawing) return false;
    this.isDrawing = false;
    return true;
  }
}
