import { IPlayer } from "../player";
import { IData } from "./data";
import { LocalDownStreamSource, WsDownStreamSource } from "./down-stream";
import { LocalUpStreamSink, WsUpStreamSink } from "./up-stream";
import { IoClient } from "./ws-client";

export * from "./data";

export class DataManager {
  buffer: IData[] = [];

  client: IoClient = new IoClient();

  private upStream = new WritableStream(
    new WsUpStreamSink(this.buffer, this.client)
    // new LocalUpStreamSink(this.buffer)
  );
  private downStream = new ReadableStream<IData>(
    new WsDownStreamSource(this.buffer, this.client)
    // new LocalDownStreamSource(this.buffer)
  );

  private reader: ReadableStreamDefaultReader;
  private writer: WritableStreamDefaultWriter;

  private consumers: Map<string, IPlayer> = new Map();
  private $panel: HTMLElement;

  constructor() {
    this.$panel = document.getElementById("debug-panel");
    this.client.start();
  }

  start() {
    this.startRead();
    this.startWrite();
  }

  async startRead() {
    this.reader = this.downStream.getReader();

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

  dispatch(datas: IData[]) {
    // dispatch messages to every activated consumer
    this.consumers.forEach((player) => {
      player.consume(datas);
    });
  }

  tmp: IData[] = [];

  async push(datas: IData[]) {
    await this.writer.write(datas);

    // datas.map((d) => {
    //   this.dispatch(d);
    // });
  }

  registerConsumer(id: string, consumer: IPlayer) {
    this.consumers.set(id, consumer);
  }

  saveTmp() {
    localStorage.setItem("test", JSON.stringify(this.tmp));
  }

  consumeTmp() {
    let datas: IData[] = JSON.parse(localStorage.getItem("test"));
    this.dispatch(datas);
  }
}
