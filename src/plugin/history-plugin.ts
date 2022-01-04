import { IMondrianData } from "../data-manager";
import { MondrianRenderer } from "../renderer/renderer";
import { MondrianShared } from "../shared";
import { MondrianPlugin, PluginType } from "./plugin";

export class HistoryPlugin extends MondrianPlugin {
  static Type = PluginType.Global;

  static PID = Symbol("history-plugin");

  static predicate(
    data: IMondrianData | null,
    shared?: MondrianShared
  ): boolean {
    if (data === null) {
      return true;
    }
    return false;
  }

  constructor(_renderer: MondrianRenderer) {
    super(_renderer);
  }

  reactUndo(): boolean {
    this.renderer.backward();
    return true;
  }

  reactRedo(): boolean {
    this.renderer.forward();
    return true;
  }
}
