import {
  IMondrianData,
  MondrianDataType,
  IMondrianInteractData,
  MondrianInteractType,
} from "../../data-manager";
import { MondrianShared } from "../../shared";
import { MondrianPlugin, PluginType } from "../base/plugin";

export class ViewportPlugin extends MondrianPlugin {
  static Type = PluginType.ConsumerTemp;

  static override PID = Symbol("viewport-plugin");

  static override predicate(
    data: IMondrianData | null,
    shared?: MondrianShared
  ): boolean {
    if (!shared?.settings.viewport) {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override reactKeyDown(data: IMondrianData) {
    this.renderer.viewport.pause = false;
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override reactKeyUp(data: IMondrianData) {
    this.renderer.viewport.pause = true;
    this.manager.restore();
    return true;
  }
}
