import { io, Socket } from "socket.io-client";
import { IMondrianData } from "./data-manager";
import { MondrianDataClient } from "./data-manager/data-client";
import { MondrianShared } from "./shared";

// const hostname = '161.117.225.178'
const hostname = window.location.hostname;

export interface IoClientSettings {
  channel: string;
}

// todo #11 client module should be redesing and refactor
export class MondrianBuiltinWsClient extends MondrianDataClient {
  private socket: Socket;

  /**
   * temp buffer zone stores temp real-item data before recover
   */
  private _tempBuffer: IMondrianData[] = [];

  private _recovered = false;

  constructor(private shared: MondrianShared) {
    super();
    this.socket = io(shared.settings.builtintClientUrl, {
      autoConnect: false,
      query: {
        channel: this.shared.settings.channel || "guest",
      },
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
      }
      this.receivedFromRemote(datas);
      this.receivedFromRemote(this._tempBuffer);

      if (!last) {
        this.receivedFromRemote([this.generateLastData()]);
      }

      this.recoveredFromRemote({
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
      this.receivedFromRemote(datas);
    });
  }

  override sendToRemote(datas: IMondrianData[]) {
    this.socket.emit("d", datas);
  }

  override start() {
    this.socket.open();
  }

  forceClear() {
    this.socket.emit("fr");
  }
}
