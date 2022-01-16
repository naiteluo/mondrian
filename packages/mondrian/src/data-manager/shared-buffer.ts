import { IMondrianData } from "./data";

export class MondrianSharedBuffer {
  private _buffer: IMondrianData[] = [];

  get buffer() {
    return this._buffer;
  }

  append(datas: IMondrianData[]) {
    this._buffer = this._buffer.concat(datas);
  }
}
