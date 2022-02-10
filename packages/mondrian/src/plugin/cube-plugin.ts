import {
  IMondrianData,
  IMondrianInteractData,
  IMondrianStateData,
  MondrianDataType,
} from "../data-manager";
import { BrushName } from "./brush-plugin";
import { CuboidPlugin } from "./cuboid-plugin";
import { PluginType } from "./plugin";

export class CubePlugin extends CuboidPlugin {
  static override Type = PluginType.ConsumerExcludesive;

  static override PID = Symbol("cuboid-plugin");

  static override predicate(data: IMondrianData | null): boolean {
    if (data === null) return false;
    if (data.type === MondrianDataType.SET_STATE) {
      if (data as IMondrianStateData) {
        if (data.data.player.brush.brushName === BrushName.Cube) {
          return true;
        }
      }
    }
    return false;
  }

  override reactDragStart(data: IMondrianInteractData): boolean {
    if (super.reactDragStart(data)) {
      // force set restrict option
      // todo not elegant here
      this.brushState.restrict = true;
      return true;
    }
    return false;
  }

  override reactDragEnd(data: IMondrianInteractData): boolean {
    if (super.reactDragEnd(data)) {
      // force reset restrict option
      this.brushState.restrict = this.playerState.brush.restrict;
      return true;
    }
    return false;
  }
}
