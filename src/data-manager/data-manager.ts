import { IPlayer } from "src/player/player";
import { IData } from "./data";

export * from "./data";

class TestDownStreamSource implements UnderlyingSource {
  tickerId;
  startTimeStamp;
  lastTimeStamp;

  constructor(private buffer: IData[]) {}

  start(controller: ReadableStreamDefaultController) {
    const step = (stamp) => {
      if (this.lastTimeStamp === undefined || stamp - this.lastTimeStamp > 0) {
        const tmp = this.buffer.splice(0, this.buffer.length);
        if (tmp.length !== 0) {
          controller.enqueue(tmp);
          this.lastTimeStamp = stamp;
        }
        //  else {
        //   controller.close();
        //   return;
        // }
      }
      this.tickerId = requestAnimationFrame(step);
    };
    this.tickerId = requestAnimationFrame(step);
  }

  cancel() {
    cancelAnimationFrame(this.tickerId);
  }
}

class TestUpStreamSink implements UnderlyingSink {
  constructor(private buffer: IData[]) {}
  start(controller) {
    console.log("[start]");
  }
  // async write(chunk: IData[], controller) {
  write(chunk: IData[], controller) {
    // console.log("[write]", chunk);
    // Wait for next write.
    this.buffer.push(...chunk);
    // await new Promise((resolve) => {

    //   resolve(undefined);
    // });
  }
  close() {
    console.log("[close]");
  }
  abort(reason) {
    console.log("[abort]", reason);
  }
}

export class DataManager {
  buffer: IData[] = [];

  private upStream = new WritableStream(new TestUpStreamSink(this.buffer));
  private downStream = new ReadableStream<IData>(
    new TestDownStreamSource(this.buffer)
  );

  private reader: ReadableStreamDefaultReader;
  private writer: WritableStreamDefaultWriter;

  private consumers: Map<string, IPlayer> = new Map();
  private $panel: HTMLElement;

  constructor() {
    this.$panel = document.getElementById("debug-panel");
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
