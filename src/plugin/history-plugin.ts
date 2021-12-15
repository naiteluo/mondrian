import { IModrianData } from "../data-manager";
import { ModrianRenderer } from "../renderer/renderer";
import { Sprite } from "pixi.js";
import { ModrianPlugin } from "./plugin";

export const HistoryPluginPID = Symbol("history-plugin");

export class HistoryPlugin extends ModrianPlugin {
  PID = HistoryPluginPID;
  static PID = HistoryPluginPID;

  constructor(_renderer: ModrianRenderer) {
    super(_renderer);
  }

  reactUndo(data: IModrianData): void {
    this.renderer.backward();
  }

  reactRedo(data: IModrianData): void {
    this.renderer.forward();
  }
}
