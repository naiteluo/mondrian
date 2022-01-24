import { MondrianSharedBuffer } from "../shared-buffer";
import { IMondrianData } from "../data";
import { IMondrianDataClient } from "..";

export class MondrianLocalUpStreamSink implements UnderlyingSink {
  constructor(private sharedBuffer: MondrianSharedBuffer) {}

  start() {
    console.log("[start]");
  }

  async write(chunk: IMondrianData[]) {
    this.sharedBuffer.append(chunk);
    await new Promise((resolve) => {
      resolve(undefined);
    });
  }

  close() {
    console.log("[close]");
  }

  abort(reason: unknown) {
    console.log("[abort]", reason);
  }
}

export class MondrianWsUpStreamSink implements UnderlyingSink {
  constructor(
    private sharedBuffer: MondrianSharedBuffer,
    private client: IMondrianDataClient
  ) {}

  start() {
    console.log("[start]");
  }

  async write(chunk: IMondrianData[]) {
    this.sharedBuffer.append(chunk);
    // local data will not be broadcasted
    const toSend = chunk.filter((data) => {
      return !data.local;
    });
    if (toSend.length > 0) {
      this.client.sendToRemote(chunk);
    }
    await new Promise((resolve) => {
      resolve(undefined);
    });
  }

  close() {
    console.log("[close]");
  }

  abort(reason: unknown) {
    console.log("[abort]", reason);
  }
}
