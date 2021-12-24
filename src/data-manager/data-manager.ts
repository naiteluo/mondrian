import { MondrianShared } from "../shared";
import { MondrianModuleBase } from "../common/module-base";
import { MondrianPlayerManager } from "../player";
import { IMondrianData } from "./data";
import { MondrianWsDownStreamSource } from "./down-stream";
import { MondrianWsUpStreamSink } from "./up-stream";
import { IoClient } from "./ws-client";
import { MondrianSharedBuffer } from "./shared-buffer";

export * from "./data";

export class MondrianDataManager extends MondrianModuleBase {
  sharedBuffer: MondrianSharedBuffer = new MondrianSharedBuffer();

  client: IoClient;

  private upStream: WritableStream;
  private downStream: ReadableStream<IMondrianData>;

  private reader: ReadableStreamDefaultReader;
  private writer: WritableStreamDefaultWriter;

  private get consumers() {
    return this.playerManager.consumers;
  }

  constructor(
    private playerManager: MondrianPlayerManager,
    private shared: MondrianShared
  ) {
    super();
  }

  async start() {
    super.start();
    this.client = new IoClient({
      channel: this.shared.settings.channel,
    });
    this.upStream = new WritableStream(
      new MondrianWsUpStreamSink(this.sharedBuffer, this.client)
      // new LocalUpStreamSink(this.buffer)
    );
    this.downStream = new ReadableStream<IMondrianData>(
      new MondrianWsDownStreamSource(
        this.sharedBuffer,
        this.client,
        this.shared
      )
      // new LocalDownStreamSource(this.buffer)
    );
    return new Promise((resolve) => {
      this.client.start();
      this.client.onRecovered((success) => {
        resolve(success);
      });
      this.startRead();
      this.startWrite();
    });
  }

  stop() {
    super.stop();
  }

  async startRead() {
    this.reader = this.downStream.getReader();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await this.reader.read();
      if (done) break;
      this.dispatch(value);
    }
    this.reader.cancel();
  }

  async startWrite() {
    this.writer = this.upStream.getWriter();
  }

  private dLast = +new Date();
  private delayTime = 300;

  dispatch(datas: IMondrianData[]) {
    // dispatch messages to every activated consumer
    datas.forEach((v) => {
      if (v.playerID) {
        if (!this.consumers.has(v.playerID)) {
          this.playerManager.createConsumer(v.playerID);
        }
        this.consumers.get(v.playerID).consume([v]);
      } else {
        console.error("!!!");
      }
      if (v.extra?.last) {
        setTimeout(() => {
          this.emit(MondrianDataManager.EVENT_RECOVER_CONSUMED);
        }, this.delayTime);
      }
    });
  }

  async push(datas: IMondrianData[]) {
    await this.writer.write(datas);
  }

  static EVENT_RECOVER_CONSUMED = "recover:consumed";
}
