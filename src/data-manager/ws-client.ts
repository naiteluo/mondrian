import { io, Socket } from "socket.io-client";
import { IModrianData } from "./data";

type IoDataListener = (datas: IModrianData[], isRecover?: boolean) => void;

const IoEmptyListener = (datas: IModrianData[]) => {
  console.log("empty", datas);
};

// const hostname = '161.117.225.178'
const hostname = window.location.hostname

// todo refactor
export class IoClient {
  private socket: Socket;
  private _listener: IoDataListener = IoEmptyListener;
  constructor() {
    this.socket = io(`ws://${hostname}:3000`, {
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
  forceClear() {
    this.socket.emit("fr");
  }
}
