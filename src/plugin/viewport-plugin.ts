import {
  IMondrianData,
  MondrianDataType,
  IMondrianInteractData,
  MondrianInteractType,
} from "../data-manager";
import { MondrianShared } from "../shared";
import { MondrianPlugin, PluginType } from "./plugin";

export class ViewportPlugin extends MondrianPlugin {
  static Type = PluginType.ConsumerTemp;

  static PID = Symbol("viewport-plugin");

  static predicate(
    data: IMondrianData | null,
    shared?: MondrianShared
  ): boolean {
    if (!shared.settings.viewport) {
      return false;
    }
    if (data === null) return false;
    if (data.type === MondrianDataType.INTERACT) {
      if (data as IMondrianInteractData) {
        if (
          data.data.subType === MondrianInteractType.KEY_DOWN &&
          data.data.code === "Space"
        ) {
          return true;
        }
      }
    }
    return false;
  }

  reactKeyDown(data: IMondrianData) {
    this.renderer.viewport.pause = false;
    return true;
  }

  reactKeyUp(data: IMondrianData) {
    this.renderer.viewport.pause = true;
    this.manager.restore();
    return true;
  }
}
