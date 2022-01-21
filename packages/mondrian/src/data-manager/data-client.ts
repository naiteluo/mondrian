import { IMondrianData, MondrianActionType, MondrianDataType } from "./data";

export interface IMondrianDataClient {
  start(): void;
  receivedFromRemote: MondrianDataClientReceivedListener;
  recoveredFromRemote: MondrianDataClientRecoveredListener;
  sendToRemote(datasToSend: IMondrianData[]): void;
  bindReceivedListener(listener: MondrianDataClientReceivedListener): void;
  bindRecoveredListener(listener: MondrianDataClientRecoveredListener): void;
}

export type MondrianDataClientReceivedListener = (
  datas: IMondrianData[],
  isRecover?: boolean
) => void;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MondrianDataClientReceivedListenerEmpty = (datas: IMondrianData[]) => {
  console.warn("Haven't set any ws listener!!");
};

type MondrianDataClientRecoveredListener = (info: {
  success: boolean;
  size: number;
}) => void;

const MondrianDataClientRecoveredListenerEmpty = () => {
  console.warn("Haven't set any ws recovered handler!!");
};

export class MondrianDataClient {
  private _receivedlistener: MondrianDataClientReceivedListener =
    MondrianDataClientReceivedListenerEmpty;

  private _recovredListener: MondrianDataClientRecoveredListener =
    MondrianDataClientRecoveredListenerEmpty;

  /**
   *
   * called when DataManager is ready
   *
   * @public
   */
  start() {
    this.receivedFromRemote([this.generateLastData()]);
    this.recoveredFromRemote({ success: true, size: 0 });
    return;
  }

  /**
   * called when client received data from removeListener
   *
   * @remarks will be defined and bind by DataManager and called in client by user
   *
   */
  get receivedFromRemote() {
    return this._receivedlistener;
  }

  /**
   * called when client recovered data from removeListener
   *
   * @remarks will be defined and bind by DataManager and called in client by user
   *
   */
  get recoveredFromRemote() {
    return this._recovredListener;
  }

  /**
   * called when DataManager need to send data to remote
   *
   * @remarks will be defined by user, and called by DataManager
   *
   * @public
   *
   * @param datasToSend
   * @returns
   */
  public sendToRemote(datasToSend: IMondrianData[]) {
    return;
  }

  bindReceivedListener(listener: MondrianDataClientReceivedListener) {
    if (this._receivedlistener !== MondrianDataClientReceivedListenerEmpty) {
      console.warn("A modified data client received listener is already bind!");
    }
    this._receivedlistener = listener;
  }

  bindRecoveredListener(listener: MondrianDataClientRecoveredListener) {
    if (this._receivedlistener !== MondrianDataClientRecoveredListenerEmpty) {
      console.warn("A modified data client received listener is already bind!");
    }
    this._recovredListener = listener;
  }

  protected generateLastData(): IMondrianData {
    return {
      type: MondrianDataType.COMMAND,
      data: {
        subType: MondrianActionType.SYSTEM,
      },
      local: true,
      extra: {
        last: true,
      },
    };
  }
}
