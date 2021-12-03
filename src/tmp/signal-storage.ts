import { SignalData } from "./data-center";
import { Utils } from "./utils";

const SIGNAL_KEY: string = "signal";
const SIGNAL_INDEX: string = "signal-index";
const MAX_SEND_RATE: number = 1000; //最大发送频率

export class LocalStorageService {
  private _buffer: SignalData[];
  private _maxLenght: 10000;
  private _timer;
  private _localConsumeListener: Function;

  private static _instance: LocalStorageService;

  constructor() {
    this._buffer = [];
  }

  public static getInstance(): LocalStorageService {
    if (this._instance instanceof LocalStorageService === false) {
      this._instance = new LocalStorageService();
    }
    return this._instance;
  }

  public set localListener(listener: Function) {
    this._localConsumeListener = listener;
  }

  public start() {
    const r = Utils.storageGet(SIGNAL_KEY) as SignalData[];
    if (r === null || r instanceof Array != true) {
      Utils.storageSet(SIGNAL_KEY, []);
    } else {
      //本地缓存数据
      if (this._localConsumeListener) {
        r.forEach((v) => this._localConsumeListener(v));
      }
    }

    const i = Utils.storageGet(SIGNAL_INDEX);
    if (i === null || i.index === undefined) {
      Utils.storageSet(SIGNAL_INDEX, { index: 0 });
    }

    this._timer = setInterval(this._sendToStorage, MAX_SEND_RATE);
  }

  public destroy() {
    this._buffer = [];
    clearInterval(this._timer);
  }

  public send(data: SignalData) {
    //本地消费
    if (this._localConsumeListener) this._localConsumeListener(data);
    this._buffer.push(data);
  }

  public clear() {
    this._buffer = [];
    Utils.storageSet(SIGNAL_INDEX, { index: 0 });
    Utils.storageSet(SIGNAL_KEY, []);
  }

  private _sendToStorage = () => {
    let data: SignalData[] = Utils.storageGet(SIGNAL_KEY) as SignalData[];
    let idx: number = Utils.storageGet(SIGNAL_INDEX).index;
    while (this._buffer.length > 0) {
      data.push(this._buffer.shift());
      idx++;
    }

    if (data.length > this._maxLenght) {
      data.splice(0, data.length - this._maxLenght);
    }

    Utils.storageSet(SIGNAL_KEY, data);
    Utils.storageSet(SIGNAL_INDEX, { index: idx });

    data = null;
  };
}

export class LocalStorageClient {
  private _buffer: SignalData[] = [];
  private _reciveIndex: number = 0;
  private _listenerlist: Function[] = [];
  private _animate;
  private _isResume: Boolean = true; //是否是信令恢复状态

  constructor() {}

  public start() {
    this._tickerHandler();
  }

  public destroy() {
    cancelAnimationFrame(this._animate);
  }

  public addListener(listener: Function) {
    this._listenerlist.push(listener);
  }

  public removeListener(listener: Function) {
    const i: number = this._listenerlist.findIndex((v) => v == listener);
    this._listenerlist.splice(i, 1);
  }

  private _tickerHandler = () => {
    this._recive();
    this._consume();
    this._animate = requestAnimationFrame(this._tickerHandler);
  };

  private _recive() {
    const idx: number = Utils.storageGet(SIGNAL_INDEX).index;
    if (idx != this._reciveIndex) console.log("recive index change: ", idx);
    if (idx > this._reciveIndex) {
      const d: number = idx - this._reciveIndex;
      const data: SignalData[] = Utils.storageGet(SIGNAL_KEY) as any[];
      const buffer: SignalData[] = data.splice(data.length - d, d);
      const delay: number = new Date().getTime() - buffer[0].timestamp;
      buffer.forEach((v) => (v.delay = delay));
      this._buffer.push(...buffer);
      this._reciveIndex = idx;
    }
  }

  private _consume() {
    let consumeBuffer: SignalData[];
    const t: number = new Date().getTime();

    if (this._isResume) {
      //如果是信令恢复状态 则全部消费
      consumeBuffer = this._buffer;
      this._isResume = false;
    } else {
      //非信令恢复状态 找出按照延迟处理后 需要消费的信令
      consumeBuffer = [];
      let i: number = 0;
      while (i < this._buffer.length) {
        let v: SignalData = this._buffer[i];
        if (v.timestamp + v.delay <= t) {
          consumeBuffer.push(this._buffer.shift());
        } else {
          i++;
        }
      }
    }

    while (consumeBuffer.length > 0) {
      let data: SignalData = consumeBuffer.shift();
      this._listenerlist.forEach((fn) => fn(data));
    }
  }
}
