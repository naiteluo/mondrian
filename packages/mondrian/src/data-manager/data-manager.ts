import { MondrianShared } from "../shared";
import { MondrianModuleBase } from "../common/module-base";
import { MondrianPlayerManager } from "../player";
import { IMondrianData } from "./data";
import { MondrianWsDownStreamSource } from "./down-stream";
import { MondrianWsUpStreamSink } from "./up-stream";
import { MondrianSharedBuffer } from "./shared-buffer";
import { MondrianRenderer } from "../renderer/renderer";
import { IMondrianDataClient } from "./data-client";
import { MondrianBuiltinWsClient } from "./builtin-ws-client";
import { MondrianDataClient } from "./data-client";
import { MondrianEvents } from "../common/events";

export class MondrianDataManager extends MondrianModuleBase {
  sharedBuffer: MondrianSharedBuffer = new MondrianSharedBuffer();

  client!: IMondrianDataClient;

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
    if (this.shared.settings.useBuiltinClient) {
      // todo might have circle refer issue here
      this.client = new MondrianBuiltinWsClient(this.shared);
    } else {
      if (this.shared.settings.client) {
        this.client = this.shared.settings.client;
      } else {
        this.client = new MondrianDataClient();
      }
    }

    this.upStream = new WritableStream(
      new MondrianWsUpStreamSink(this.sharedBuffer, this.client)
    );
    this.downStream = new ReadableStream<IMondrianData>(
      new MondrianWsDownStreamSource(
        this.sharedBuffer,
        this.client,
        this.renderer,
        this.shared
      )
    );
    this.startRead();
    this.startWrite();
  }

  async connect() {
    const p = new Promise((resolve) => {
      if (!this.client) {
        throw new Error("client had not been bind!");
      }
      this.client.bindRecoveredListener((success) => {
        resolve(success);
      });
    });

    this.client.start();
    return p;
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
          this.emit(MondrianEvents.EVENT_RECOVER_CONSUMED);
        }, this.delayTime);
      }
      if (this.lastCount > 1) {
        throw new Error("Double lasFt error!!!");
      }
    });
  }

  async push(datas: IMondrianData[]) {
    if (!this.writer) {
      throw new Error("writer is not initialized");
    }
    await this.writer.write(datas);
  }
}
