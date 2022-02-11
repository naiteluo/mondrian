import { io, Socket } from "socket.io-client";
import { IMondrianData } from ".";
import { MondrianDataClient } from "./data-client";
import { MondrianShared } from "../shared";

export interface IoClientSettings {
  channel: string;
}

/**
 * builtin websocket based data client
 *
 * @remarks default websocket based data client, auto sync data from/to remote ws server.
 *
 */
export class MondrianBuiltinWsClient extends MondrianDataClient {
  private socket: Socket;

  /**
   * temp buffer zone stores temp real-item data before recover
   */
  private _tempBuffer: IMondrianData[] = [];

  private _recovered = false;

  /**
   *
   * @param shared.settings.builtintClientUrl ws server url
   *
   * todo describe default ws data protocals
   *
   */
  constructor(private shared: MondrianShared) {
    super();
    this.socket = io(shared.settings.builtintClientUrl, {
      autoConnect: false,
      query: {
        channel: this.shared.settings.channel || "guest",
      },
    });
    // handle recovered data
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
    // handle recovered data
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
