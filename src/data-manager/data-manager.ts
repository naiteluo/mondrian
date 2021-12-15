import { Modrian } from "modrian";
import { IModrianPlayer } from "../player";
import { IModrianData } from "./data";
import {
  ModrianLocalDownStreamSource,
  ModrianWsDownStreamSource,
} from "./down-stream";
import { ModrianLocalUpStreamSink, ModrianWsUpStreamSink } from "./up-stream";
import { IoClient } from "./ws-client";

export * from "./data";

export class ModrianDataManager {
  buffer: IModrianData[] = [];

  client: IoClient = new IoClient();

  private upStream = new WritableStream(
    new ModrianWsUpStreamSink(this.buffer, this.client)
    // new LocalUpStreamSink(this.buffer)
  );
  private downStream = new ReadableStream<IModrianData>(
    new ModrianWsDownStreamSource(this.buffer, this.client)
    // new LocalDownStreamSource(this.buffer)
  );

  private reader: ReadableStreamDefaultReader;
  private writer: WritableStreamDefaultWriter;

  private consumers: Map<string, IModrianPlayer> = new Map();
  private $panel: HTMLElement;

  constructor(private modrian: Modrian) {
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

  dispatch(datas: IModrianData[]) {
    // dispatch messages to every activated consumer
    datas.forEach((v) => {
      if (v.playerID) {
        if (!this.consumers.has(v.playerID)) {
          this.modrian.addConsumer(v.playerID);
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

  tmp: IModrianData[] = [];

  async push(datas: IModrianData[]) {
    await this.writer.write(datas);

    // datas.map((d) => {
    //   this.dispatch(d);
    // });
  }

  registerConsumer(id: string, consumer: IModrianPlayer) {
    this.consumers.set(id, consumer);
  }

  saveTmp() {
    localStorage.setItem("test", JSON.stringify(this.tmp));
  }

  consumeTmp() {
    const datas: IModrianData[] = JSON.parse(localStorage.getItem("test"));
    this.dispatch(datas);
  }
}
