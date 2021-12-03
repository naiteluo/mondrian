import { ExtendedLineStyle } from "../brush";
import { IData } from "../data-manager/data";

export interface PlayerState {
  selectedBrush: ExtendedLineStyle;
}

export interface IPlayer {
  id: string;
  state: PlayerState;

  consume(datas: IData[]);
}

export class Player implements IPlayer {
  _id: string;
  _state: PlayerState;

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
