import { BrushPluginState } from "../plugin/brush-plugin";
import { IMondrianData } from "../data-manager";

export interface IMondrianPlayerState {
  selectedBrush: BrushPluginState;
}

export interface IMondrianPlayer {
  id: string;
  state: IMondrianPlayerState;

  consume(datas: IMondrianData[]);
}

export class MondrianPlayer implements IMondrianPlayer {
  private _id: string;
  private _state: IMondrianPlayerState;

  consume(datas: IMondrianData[]) {}

  get id(): string {
    return this._id;
  }

  set id(id: string) {
    if (this._id) throw new Error("player id can not be re-assigned!");
    this._id = id;
  }

  get state(): IMondrianPlayerState {
    return this._state;
  }

  set state(state: IMondrianPlayerState) {
    this._state = { ...state };
  }
}
