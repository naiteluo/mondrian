import { IMondrianData, MondrianDataSubType, MondrianDataType } from "./data";

export interface IMondrianDataClient {
  /**
   * start the data client
   *
   * @remarks will be called when the data manager start to init data client. Need to be override.
   */
  start(): void;
  /**
   * tell data manager data received and send data to data manager
   *
   * @remarks will be called by data client itself
   */
  receivedFromRemote: MondrianDataClientReceivedListener;
  /**
   * tell data manager data recovered and send data to data manager
   *
   * @remarks will be called by data client itself
   */
  recoveredFromRemote: MondrianDataClientRecoveredListener;
  /**
   *
   * called by data manager when new data had been created.
   *
   * @remarks need to be override
   *
   * @param datasToSend
   */
  sendToRemote(datasToSend: IMondrianData[]): void;
  /**
   *
   * @remarks should not be override or called in data client
   *
   * @internal
   *
   * @param listener
   */
  bindReceivedListener(listener: MondrianDataClientReceivedListener): void;
  /**
   *
   * @remarks should not be override or called in data client
   *
   * @internal
   *
   * @param listener
   */
  bindRecoveredListener(listener: MondrianDataClientRecoveredListener): void;
}

/**
 * data received listener type
 */
export type MondrianDataClientReceivedListener = (
  datas: IMondrianData[],
  isRecover?: boolean
) => void;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MondrianDataClientReceivedListenerEmpty = (datas: IMondrianData[]) => {
  console.warn("Haven't set any ws listener!!");
};

/**
 * data recovered listener type
 */
type MondrianDataClientRecoveredListener = (info: {
  success: boolean;
  size: number;
}) => void;

const MondrianDataClientRecoveredListenerEmpty = () => {
  console.warn("Haven't set any ws recovered handler!!");
};

/**
 * base class of data client
 *
 * @remarks implements {@link IMondrianDataClient}. Do default binding job. Beding default empty data client, it implements empty in/out APIs.
 *
 * @public
 *
 */
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

  /**
   *
   * bind received listener
   *
   * @remarks should not be override or called outside mondrian
   *
   * @param listener
   */
  bindReceivedListener(listener: MondrianDataClientReceivedListener) {
    if (this._receivedlistener !== MondrianDataClientReceivedListenerEmpty) {
      console.warn("A modified data client received listener is already bind!");
    }
    this._receivedlistener = listener;
  }

  /**
   *
   * bind received listener
   *
   * @remarks should not be override or called outside mondrian
   *
   * @param listener
   */
  bindRecoveredListener(listener: MondrianDataClientRecoveredListener) {
    if (this._receivedlistener !== MondrianDataClientRecoveredListenerEmpty) {
      console.warn("A modified data client received listener is already bind!");
    }
    this._recovredListener = listener;
  }

  /**
   *
   * @returns
   */
  protected generateLastData(): IMondrianData {
    return {
      type: MondrianDataType.COMMAND,
      subType: MondrianDataSubType.SYSTEM,
      data: {
        subType: MondrianDataSubType.SYSTEM,
      },
      local: true,
      extra: {
        last: true,
      },
    };
  }
}
