import { IMondrianData } from "../data-manager";
import { MondrianRenderer } from "../renderer/renderer";
import { MondrianShared } from "../shared";
import { MondrianPlugin, PluginType } from "./plugin";

export class HistoryPlugin extends MondrianPlugin {
  static Type = PluginType.Global;

  static override PID = Symbol("history-plugin");

  static override predicate(
    data: IMondrianData | null,
    shared?: MondrianShared
  ): boolean {
    if (data === null) {
      return true;
    }
    return false;
  }

  override reactUndo(): boolean {
    this.renderer.backward();
    return true;
  }

  override reactRedo(): boolean {
    this.renderer.forward();
    return true;
  }
}
