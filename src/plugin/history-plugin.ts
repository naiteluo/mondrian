import { MondrianRenderer } from "../renderer/renderer";
import { MondrianPlugin } from "./plugin";

export const HistoryPluginPID = Symbol("history-plugin");

export class HistoryPlugin extends MondrianPlugin {
  PID = HistoryPluginPID;

  static PID = HistoryPluginPID;

  constructor(_renderer: MondrianRenderer) {
    super(_renderer);
  }

  reactUndo(): void {
    this.renderer.backward();
  }

  reactRedo(): void {
    this.renderer.forward();
  }
}
