import { IMondrianReactor } from "../common/reactor";
import { IMondrianData } from "../data-manager";
import { MondrianRenderer } from "../renderer/renderer";

export interface IPluginConfig {}

export interface IMondrianPlugin {
  PID: symbol;
}

export class MondrianPlugin implements IMondrianPlugin, IMondrianReactor {
  constructor(private _renderer: MondrianRenderer) {}

  get renderer() {
    return this._renderer;
  }

  reactDragStart(data: IMondrianData): void {}
  reactDragMove(data: IMondrianData): void {}
  reactDragEnd(data: IMondrianData): void {}
  reactStateChange(data: IMondrianData): void {}
  reactUndo(event: any): void {}
  reactRedo(event: any): void {}
  reactClick(event: any): void {}
  reactInput(event: any): void {}

  PID: symbol;
}
