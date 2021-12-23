import { io, Socket } from "socket.io-client";
import { IMondrianData, MondrianActionType, MondrianDataType } from "./data";

type IoDataListener = (datas: IMondrianData[], isRecover?: boolean) => void;

type IoRecoveredListener = ({ success: boolean, size: number }) => void;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const IoEmptyListener = (datas: IMondrianData[]) => {
  console.warn("Haven't set any ws listener!!");
};

const IoEmptyRecoveredListener = () => {
  console.warn("Haven't set any ws recovered handler!!");
};

// const hostname = '161.117.225.178'
const hostname = window.location.hostname;

// todo refactor
export class IoClient {
  private socket: Socket;
  private _listener: IoDataListener = IoEmptyListener;
  private _recovredHandler: IoRecoveredListener = IoEmptyRecoveredListener;
  /**
   * temp buffer zone stores temp real-item data before recover
   */
  private _tempBuffer: IMondrianData[] = [];
  private _recovered = false;
  constructor() {
    this.socket = io(`ws://${hostname}:3000`, {
      autoConnect: false,
    });
    this.socket.on("r", (datas: IMondrianData[]) => {
      let last: IMondrianData | undefined;
      // insert extra msg in data
      // mark which is the last of recovered datas
      if (this._tempBuffer.length > 0) {
        last = this._tempBuffer[this._tempBuffer.length - 1];
      } else {
        if (datas.length > 0) {
          last = datas[datas.length - 1];
        }
      }
      if (last) {
        last.extra = {
          last: true,
        };
      } else {
        this._tempBuffer.push({
          type: MondrianDataType.COMMAND,
          data: {
            subType: MondrianActionType.SYSTEM,
          },
          extra: {
            last: true,
          },
        });
      }
      this._listener(datas);
      this._listener(this._tempBuffer);
      this._recovredHandler({
        success: true,
        size: datas ? datas.length : 0 + this._tempBuffer.length,
      });
      this._tempBuffer = [];
      this._recovered = true;
    });
    this.socket.on("d", (datas) => {
      if (!this._recovered) {
        this._tempBuffer.push(...datas);
        return;
      }
      this._listener(datas);
    });
  }
  send(datas: IMondrianData[]) {
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
  onRecovered(handler: IoRecoveredListener) {
    this._recovredHandler = handler;
  }

  offRecovered() {
    this._recovredHandler = IoEmptyRecoveredListener;
  }
}
