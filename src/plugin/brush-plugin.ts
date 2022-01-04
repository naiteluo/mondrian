import { IMondrianData } from "../data-manager";
import { MondrianPlugin, PluginType } from "./plugin";

import { ILineStyleOptions, LINE_CAP, LINE_JOIN } from "@pixi/graphics";
import { filters } from "pixi.js";
import { MondrianShared } from "../shared";

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

  private brushState;
}
