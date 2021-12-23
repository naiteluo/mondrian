import { IMondrianData } from "data-manager";
import { IoClient } from "data-manager/ws-client";
import { MondrianShared } from "../../shared";

export class MondrianLocalDownStreamSource implements UnderlyingSource {
  tickerId;
  startTimeStamp;
  lastTimeStamp;

  constructor(
    private buffer: IMondrianData[],
    private shared: MondrianShared
  ) {}

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

export class MondrianWsDownStreamSource implements UnderlyingSource {
  tickerId;
  startTimeStamp;
  lastTimeStamp;

  constructor(
    private buffer: IMondrianData[],
    private client: IoClient,
    private shared: MondrianShared
  ) {
    this.client.on((datas) => {
      this.buffer.push(...datas);
    });
  }

  private get ChunkLimit() {
    return this.shared.settings.chunkLimit;
  }

  // todo dynamicly controll down stream data dispatch freqency
  start(controller: ReadableStreamDefaultController) {
    const step = (stamp) => {
      if (this.lastTimeStamp === undefined || stamp - this.lastTimeStamp > 30) {
        const tmp = this.buffer.splice(
          0,
          this.buffer.length > this.ChunkLimit
            ? this.ChunkLimit
            : this.buffer.length
        );
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
