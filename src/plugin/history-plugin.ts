import { IMondrianData } from "../data-manager";
import { MondrianRenderer } from "../renderer/renderer";
import { Sprite } from "pixi.js";
import { MondrianPlugin } from "./plugin";

export const HistoryPluginPID = Symbol("history-plugin");

export class HistoryPlugin extends MondrianPlugin {
  PID = HistoryPluginPID;
  static PID = HistoryPluginPID;

  constructor(_renderer: MondrianRenderer) {
    super(_renderer);
  }

  reactUndo(data: IMondrianData): void {
    this.renderer.backward();
  }

  reactRedo(data: IMondrianData): void {
    this.renderer.forward();
  }
}
