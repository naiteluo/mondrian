import {
  IMondrianData,
  IMondrianInteractData,
  IMondrianStateData,
} from "../data-manager";
import { MondrianPlugin, PluginType } from "./plugin";

import { ILineStyleOptions, LINE_CAP, LINE_JOIN } from "@pixi/graphics";
import { filters, IPointData } from "pixi.js";
import { MondrianShared } from "../shared";
import { IMondrianPlayerState } from "../player";
import { MondrianGraphicsHandler } from "../renderer/grapichs-handler";

/**
 * brush name enum
 *
 * @public
 */
export const enum BrushName {
  // lines brush
  Pencil = "Pencil",
  Eraser = "Eraser",
  Highlighter = "Highlighter",
  Stroke = "Stroke",

  // 2d shape brush
  Rectangle = "Rectangle",
  Circle = "Circle",
  Triangle = "Triangle",
  RightAngleTriangle = "RightAngleTriangle",
  Parallelogram = "Parallelogram",
  RightAngleTrapezoid = "RightAngleTrapezoid",
  Trapezoid = "Trapezoid",
  SemiCircle = "SemiCircle",

  // 3d shape brush
  Cube = "Cube",
  Cuboid = "Cuboid",
  Sphere = "Sphere",
  Cylinder = "Cylinder",
  Cone = "Cone",
}

/**
 * brush name list
 *
 * @remarks
 *
 * for client ui
 *
 * @public
 */
export const MondrianDefaultBrushPluginList = [
  BrushName.Pencil,
  BrushName.Eraser,
  BrushName.Highlighter,
  BrushName.Rectangle,
  BrushName.Circle,
  BrushName.Triangle,
  BrushName.Stroke,
  BrushName.RightAngleTriangle,
  BrushName.Parallelogram,
  BrushName.RightAngleTrapezoid,
  BrushName.Trapezoid,
  BrushName.SemiCircle,
  BrushName.Cube,
  BrushName.Cuboid,
];

/**
 * state of the brush in playerState
 *
 * @remarks
 *
 * describe current user's brush state,
 * like which brush are selected, what color or width are set.
 *
 * @public
 */
export interface BrushPluginState {
  brushName: BrushName;
  brushColor: number;
  brushWidth: 5;

  /**
   * apply dash line
   */
  dash?: boolean;
  /**
   * restrict shape bounding to square
   */
  restrict?: boolean;

  lineStyle: ILineStyleOptions;
}

/**
 * default brush state
 *
 * @public
 */
export const DefaultMondrianBrushOptions: BrushPluginState = {
  brushName: BrushName.Pencil,
  brushColor: 0x000000,
  brushWidth: 5,
  dash: false,
  restrict: false,
  lineStyle: {
    cap: LINE_CAP.ROUND,
    join: LINE_JOIN.ROUND,
    native: false,
  },
};

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
