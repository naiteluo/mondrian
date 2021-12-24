import { IMondrianData } from "../data-manager";
import { MondrianSharedBuffer } from "../shared-buffer";
import { IoClient } from "../ws-client";
import { MondrianShared } from "../../shared";

export class MondrianLocalDownStreamSource implements UnderlyingSource {
  tickerId;
  startTimeStamp;
  lastTimeStamp;

  constructor(
    private sharedBuffer: MondrianSharedBuffer,
    private shared: MondrianShared
  ) {}

  start(controller: ReadableStreamDefaultController) {
    const step = (stamp) => {
      if (this.lastTimeStamp === undefined || stamp - this.lastTimeStamp > 0) {
        const tmp = this.sharedBuffer.buffer.splice(
          0,
          this.sharedBuffer.buffer.length
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

export class MondrianWsDownStreamSource implements UnderlyingSource {
  tickerId;
  startTimeStamp;
  lastTimeStamp;

  constructor(
    private sharedBuffer: MondrianSharedBuffer,
    private client: IoClient,
    private shared: MondrianShared
  ) {
    this.client.on((datas) => {
      this.sharedBuffer.append(datas);
    });
  }

  private get ChunkLimit() {
    return this.shared.settings.chunkLimit;
  }

  private get dynamicChunkLimitMode() {
    return true;
  }

  private DynamicChunkLimitMinimun = 100;

  private dynamicChunkLimit = 500;

  private tmpDeltaTime = 0;

  // todo dynamicly controll down stream data dispatch freqency
  start(controller: ReadableStreamDefaultController) {
    const step = (stamp) => {
      if (this.sharedBuffer.buffer.length > 0) {
        if (this.lastTimeStamp !== undefined) {
          this.tmpDeltaTime = stamp - this.lastTimeStamp;
          if (
            this.tmpDeltaTime > 33 &&
            this.dynamicChunkLimit > this.DynamicChunkLimitMinimun
          ) {
            this.dynamicChunkLimit -= 20;
          } else {
            this.dynamicChunkLimit += 20;
          }
        } else {
          this.dynamicChunkLimit = 80;
        }
        console.log("chunk limit", this.dynamicChunkLimit);

        const tmp = this.sharedBuffer.buffer.splice(
          0,
          this.sharedBuffer.buffer.length > this.dynamicChunkLimit
            ? this.dynamicChunkLimit
            : this.sharedBuffer.buffer.length
        );
        if (tmp.length !== 0) {
          controller.enqueue(tmp);
        }
        this.lastTimeStamp = stamp;
      }

      this.tickerId = requestAnimationFrame(step);
    };
    this.tickerId = requestAnimationFrame(step);
  }

  cancel() {
    cancelAnimationFrame(this.tickerId);
  }
}
