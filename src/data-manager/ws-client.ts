import { io, Socket } from "socket.io-client";
import { IData } from "./data";

type IoDataListener = (datas: IData[]) => void;

const IoEmptyListener = (datas: IData[]) => {
  console.log("empty", datas);
};

export class IoClient {
  private socket: Socket;
  private _listener: IoDataListener = IoEmptyListener;
  constructor() {
    this.socket = io("ws://localhost:3000", { autoConnect: false });
    this.socket.on("d", (datas) => {
      this._listener(datas);
    });
  }
  send(datas: IData[]) {
    this.socket.emit("d", datas);
  }
  on(listner: IoDataListener) {
    this._listener = listner;
  }
  off() {
    this._listener = IoEmptyListener;
  }
  start() {
    this.socket.open();
  }
}
