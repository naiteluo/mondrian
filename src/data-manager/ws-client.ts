import { io, Socket } from "socket.io-client";
import { IModrianData } from "./data";

type IoDataListener = (datas: IModrianData[], isRecover?: boolean) => void;

const IoEmptyListener = (datas: IModrianData[]) => {
  console.log("empty", datas);
};

// todo refactor
export class IoClient {
  private socket: Socket;
  private _listener: IoDataListener = IoEmptyListener;
  constructor() {
    this.socket = io(`ws://${window.location.hostname}:3000`, {
      autoConnect: false,
    });
    this.socket.on("d", (datas) => {
      this._listener(datas);
    });
  }
  send(datas: IModrianData[]) {
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
