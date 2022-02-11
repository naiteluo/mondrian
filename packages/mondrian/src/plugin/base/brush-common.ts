import { ILineStyleOptions, LINE_CAP, LINE_JOIN } from "@pixi/graphics";

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
  Cone = "Cone"
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
  BrushName.Sphere,
  BrushName.Cylinder,
  BrushName.Cone,
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
