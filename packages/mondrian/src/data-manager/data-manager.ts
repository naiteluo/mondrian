import { MondrianShared } from "../shared";
import { MondrianModuleBase } from "../common/module-base";
import { MondrianPlayerManager } from "../player";
import { IMondrianData } from "./data";
import { MondrianWsDownStreamSource } from "./down-stream";
import { MondrianWsUpStreamSink } from "./up-stream";
import { IoClient } from "./ws-client";
import { MondrianSharedBuffer } from "./shared-buffer";
import { MondrianRenderer } from "../renderer/renderer";

export * from "./data";

export class MondrianDataManager extends MondrianModuleBase {
  sharedBuffer: MondrianSharedBuffer = new MondrianSharedBuffer();

  client!: IoClient;

  private upStream!: WritableStream;

  private downStream!: ReadableStream<IMondrianData>;

  private reader!: ReadableStreamDefaultReader;

  private writer!: WritableStreamDefaultWriter;

  private get consumers() {
    return this.playerManager.consumers;
  }

  constructor(
    private playerManager: MondrianPlayerManager,
    private renderer: MondrianRenderer,
    private shared: MondrianShared
  ) {
    super();
  }

  override async start() {
    super.start();
    this.client = new IoClient({
      // todo remote make channel safe
      channel: this.shared.settings.channel || "guest",
    });
    this.upStream = new WritableStream(
      new MondrianWsUpStreamSink(this.sharedBuffer, this.client)
      // new LocalUpStreamSink(this.buffer)
    );
    this.downStream = new ReadableStream<IMondrianData>(
      new MondrianWsDownStreamSource(
        this.sharedBuffer,
        this.client,
        this.renderer,
        this.shared
      )
      // new LocalDownStreamSource(this.buffer)
    );
    return new Promise((resolve) => {
      if (!this.client) {
        throw new Error("client had not been bind!");
      }
      this.client.start();
      this.client.onRecovered((success) => {
        resolve(success);
      });
      this.startRead();
      this.startWrite();
    });
  }

  override stop() {
    super.stop();
  }

  async startRead() {
    if (!this.downStream) {
      throw new Error("downStream is not initialized");
    }
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
    if (!this.upStream) {
      throw new Error("upStream is not initialized");
    }
    this.writer = this.upStream.getWriter();
  }

  private delayTime = 300;

  private lastCount = 0;

  dispatch(datas: IMondrianData[]) {
    // dispatch messages to every activated consumer
    datas.forEach((v) => {
      if (v.playerID) {
        if (!this.consumers.has(v.playerID)) {
          this.playerManager.createConsumer(v.playerID);
        }
        this.consumers.get(v.playerID)?.consume([v]);
      } else {
        console.error("!!!");
      }
      if (v.extra?.last) {
        this.lastCount++;
        setTimeout(() => {
          this.emit(MondrianDataManager.EVENT_RECOVER_CONSUMED);
        }, this.delayTime);
      }
      if (this.lastCount > 1) {
        throw new Error("Double last error!!!");
      }
    });
  }

  async push(datas: IMondrianData[]) {
    if (!this.writer) {
      throw new Error("writer is not initialized");
    }
    await this.writer.write(datas);
  }

  static EVENT_RECOVER_CONSUMED = "recover:consumed";
}
