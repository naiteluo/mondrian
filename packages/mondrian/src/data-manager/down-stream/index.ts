import { MondrianSharedBuffer } from "../shared-buffer";
import { MondrianShared } from "../../shared";
import { MondrianRenderer } from "../../renderer/renderer";
import { IMondrianDataClient } from "..";
import { Ticker } from "pixi.js";

export class MondrianWsDownStreamSource implements UnderlyingSource {
  startTimeStamp?: number;

  lastTimeStamp?: number;

  constructor(
    private sharedBuffer: MondrianSharedBuffer,
    private client: IMondrianDataClient,
    private renderer: MondrianRenderer,
    private shared: MondrianShared
  ) {
    this.client.bindReceivedListener((datas) => {
      this.sharedBuffer.append(datas);
    });
  }

  private get ChunkLimit() {
    return this.shared.settings.chunkLimit;
  }

  private dynamicChunkLimit = 500;

  /**
   * justify chunk limit size base on ticker's deltaTime（deltaFrame）
   * @param dt
   */
  private justifyChunkLimit(dt: number) {
    // if more than 2 frame had been skip
    // divide chunk limit size to slow the pipe down
    if (dt > 2) {
      this.dynamicChunkLimit = Math.round(this.dynamicChunkLimit / dt);
    } else {
      // raise 50% chunk size to speed up the consuming
      this.dynamicChunkLimit = Math.round(this.dynamicChunkLimit * (3 / 2));
    }
  }

  private step!: (dt: number) => void;

  private idleStopTickerTimeoutHandler?: number;

  start(controller: ReadableStreamDefaultController) {
    this.step = (dt: number) => {
      if (this.sharedBuffer.buffer.length > 0) {
        if (this.idleStopTickerTimeoutHandler) {
          window.clearTimeout(this.idleStopTickerTimeoutHandler);
          this.idleStopTickerTimeoutHandler = undefined;
        }
        this.renderer.ticker.start();

        this.justifyChunkLimit(dt);
        const tmp = this.sharedBuffer.buffer.splice(
          0,
          this.sharedBuffer.buffer.length > this.dynamicChunkLimit
            ? this.dynamicChunkLimit
            : this.sharedBuffer.buffer.length
        );
        if (tmp.length !== 0) {
          controller.enqueue(tmp);
          this.shared.log(`data dumped: ${tmp.length}`);
        }
      } else {
        if (
          this.renderer.ticker.started &&
          !this.idleStopTickerTimeoutHandler
        ) {
          // add delay to stop renderer's ticker, leave time space for interaction like pinch to zoom or viewport dragging.
          this.idleStopTickerTimeoutHandler = window.setTimeout(() => {
            requestAnimationFrame(() => {
              this.renderer.ticker.stop();
            });
            this.idleStopTickerTimeoutHandler = undefined;
          }, 2000);
        }
      }
    };
    Ticker.system.add(this.step);
  }

  cancel() {
    Ticker.system.remove(this.step);
  }
}
