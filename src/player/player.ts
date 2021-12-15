import { BrushPluginState } from "../plugin/brush-plugin";
import { IModrianData } from "../data-manager";

export interface IModrianPlayerState {
  selectedBrush: BrushPluginState;
}

export interface IModrianPlayer {
  id: string;
  state: IModrianPlayerState;

  consume(datas: IModrianData[]);
}

export class ModrianPlayer implements IModrianPlayer {
  private _id: string;
  private _state: IModrianPlayerState;

  consume(datas: IModrianData[]) {}

  get id(): string {
    return this._id;
  }

  set id(id: string) {
    if (this._id) throw new Error("player id can not be re-assigned!");
    this._id = id;
  }

  get state(): IModrianPlayerState {
    return this._state;
  }

  set state(state: IModrianPlayerState) {
    this._state = { ...state };
  }
}
