import { IData } from "data-manager";
import { IoClient } from "data-manager/ws-client";

export class LocalDownStreamSource implements UnderlyingSource {
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
      }
      this.tickerId = requestAnimationFrame(step);
    };
    this.tickerId = requestAnimationFrame(step);
  }

  cancel() {
    cancelAnimationFrame(this.tickerId);
  }
}

export class WsDownStreamSource implements UnderlyingSource {
  tickerId;
  startTimeStamp;
  lastTimeStamp;

  constructor(private buffer: IData[], private client: IoClient) {
    this.client.on((datas) => {
      this.buffer.push(...datas);
    });
  }

  start(controller: ReadableStreamDefaultController) {
    const step = (stamp) => {
      if (this.lastTimeStamp === undefined || stamp - this.lastTimeStamp > 0) {
        const tmp = this.buffer.splice(0, this.buffer.length);
        if (tmp.length !== 0) {
          controller.enqueue(tmp);
          this.lastTimeStamp = stamp;
        }
      }
      this.tickerId = requestAnimationFrame(step);
    };
    this.tickerId = requestAnimationFrame(step);
  }

  cancel() {
    cancelAnimationFrame(this.tickerId);
  }
}
