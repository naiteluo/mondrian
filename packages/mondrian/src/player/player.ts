import { BrushPluginState } from "../plugin/brush-common";
import { IMondrianData } from "../data-manager";

export interface IMondrianPlayerState {
  brush: BrushPluginState;
}

export interface IMondrianPlayer {
  id: string;
  state: IMondrianPlayerState;

  consume(datas: IMondrianData[]): void;
}

export class MondrianPlayer implements IMondrianPlayer {
  private _id!: string;

  private _state!: IMondrianPlayerState;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  consume(datas: IMondrianData[]) {
    // todo do something
  }

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
