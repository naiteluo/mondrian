import { IModrianReactor } from "../common/reactor";
import { IModrianData } from "../data-manager";
import { ModrianRenderer } from "../renderer/modrian-renderer";

export interface IPluginConfig {}

export interface IModrianPlugin {
  PID: symbol;
}

export class ModrianPlugin implements IModrianPlugin, IModrianReactor {
  constructor(private _renderer: ModrianRenderer) {}

  get renderer() {
    return this._renderer;
  }

  reactDragStart(data: IModrianData): void {}
  reactDragMove(data: IModrianData): void {}
  reactDragEnd(data: IModrianData): void {}
  reactStateChange(data: IModrianData): void {}
  reactUndo(event: any): void {}
  reactRedo(event: any): void {}
  reactClick(event: any): void {}
  reactInput(event: any): void {}

  PID: symbol;
}
