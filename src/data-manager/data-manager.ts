import { Mondrian } from "mondrian";
import { IMondrianPlayer } from "../player";
import { IMondrianData } from "./data";
import {
  MondrianLocalDownStreamSource,
  MondrianWsDownStreamSource,
} from "./down-stream";
import { MondrianLocalUpStreamSink, MondrianWsUpStreamSink } from "./up-stream";
import { IoClient } from "./ws-client";

export * from "./data";

export class MondrianDataManager {
  buffer: IMondrianData[] = [];

  client: IoClient = new IoClient();

  private upStream = new WritableStream(
    new MondrianWsUpStreamSink(this.buffer, this.client)
    // new LocalUpStreamSink(this.buffer)
  );
  private downStream = new ReadableStream<IMondrianData>(
    new MondrianWsDownStreamSource(this.buffer, this.client)
    // new LocalDownStreamSource(this.buffer)
  );

  private reader: ReadableStreamDefaultReader;
  private writer: WritableStreamDefaultWriter;

  private consumers: Map<string, IMondrianPlayer> = new Map();
  private $panel: HTMLElement;

  constructor(private mondrian: Mondrian) {
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

  dispatch(datas: IMondrianData[]) {
    // dispatch messages to every activated consumer
    datas.forEach((v) => {
      if (v.playerID) {
        if (!this.consumers.has(v.playerID)) {
          this.mondrian.addConsumer(v.playerID);
        }
        this.consumers.get(v.playerID).consume([v]);
      } else {
        console.error("!!!");
      }
    });
    // this.consumers.forEach((player) => {
    //   player.consume(datas);
    // });
  }

  tmp: IMondrianData[] = [];

  async push(datas: IMondrianData[]) {
    await this.writer.write(datas);

    // datas.map((d) => {
    //   this.dispatch(d);
    // });
  }

  registerConsumer(id: string, consumer: IMondrianPlayer) {
    this.consumers.set(id, consumer);
  }

  saveTmp() {
    localStorage.setItem("test", JSON.stringify(this.tmp));
  }

  consumeTmp() {
    const datas: IMondrianData[] = JSON.parse(localStorage.getItem("test"));
    this.dispatch(datas);
  }
}
