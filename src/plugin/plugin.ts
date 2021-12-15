import { IReactor } from "common/reactor";
import { IState } from "common/state";
import { IData } from "data-manager";
import { ModrianRenderer } from "../renderer/modrian-renderer";

export interface IPluginConfig {}

export interface IPlugin {
  PID: Symbol;
}

export class Plugin implements IPlugin, IReactor {
  constructor(private _renderer: ModrianRenderer) {}

  get renderer() {
    return this._renderer;
  }

  reactDragStart(data: IData): void {}
  reactDragMove(data: IData): void {}
  reactDragEnd(data: IData): void {}
  reactStateChange(data: IData): void {}
  reactUndo(event: any): void {}
  reactRedo(event: any): void {}
  reactClick(event: any): void {}
  reactInput(event: any): void {}

  PID: Symbol;
}
