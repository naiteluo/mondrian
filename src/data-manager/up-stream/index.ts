import { MondrianSharedBuffer } from "../shared-buffer";
import { IMondrianData } from "../data-manager";
import { IoClient } from "../ws-client";

export class MondrianLocalUpStreamSink implements UnderlyingSink {
  constructor(private sharedBuffer: MondrianSharedBuffer) {}
  start(controller) {
    console.log("[start]");
  }
  async write(chunk: IMondrianData[], controller) {
    this.sharedBuffer.append(chunk);
    await new Promise((resolve) => {
      resolve(undefined);
    });
  }
  close() {
    console.log("[close]");
  }
  abort(reason) {
    console.log("[abort]", reason);
  }
}

export class MondrianWsUpStreamSink implements UnderlyingSink {
  constructor(
    private sharedBuffer: MondrianSharedBuffer,
    private client: IoClient
  ) {}
  start(controller) {
    console.log("[start]");
  }
  async write(chunk: IMondrianData[], controller) {
    this.sharedBuffer.append(chunk);
    this.client.send(chunk);
    await new Promise((resolve) => {
      resolve(undefined);
    });
  }
  close() {
    console.log("[close]");
  }
  abort(reason) {
    console.log("[abort]", reason);
  }
}
