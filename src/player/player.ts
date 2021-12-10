import { BrushPluginState } from "../plugin/brush-plugin";
import { IData } from "../data-manager";

export interface PlayerState {
  selectedBrush: BrushPluginState;
}

export interface IPlayer {
  id: string;
  state: PlayerState;

  consume(datas: IData[]);
}

export class Player implements IPlayer {
  private _id: string;
  private _state: PlayerState;

  consume(datas: IData[]) {}

  get id(): string {
    return this._id;
  }

  set id(id: string) {
    if (this._id) throw new Error("player id can not be re-assigned!");
    this._id = id;
  }

  get state(): PlayerState {
    return this._state;
  }

  set state(state: PlayerState) {
    this._state = { ...state };
  }
}
