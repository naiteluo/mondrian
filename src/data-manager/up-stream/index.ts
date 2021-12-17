import { IMondrianData } from "../data-manager";
import { IoClient } from "../ws-client";

export class MondrianLocalUpStreamSink implements UnderlyingSink {
  constructor(private buffer: IMondrianData[]) {}
  start(controller) {
    console.log("[start]");
  }
  async write(chunk: IMondrianData[], controller) {
    this.buffer.push(...chunk);
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
  constructor(private buffer: IMondrianData[], private client: IoClient) {}
  start(controller) {
    console.log("[start]");
  }
  async write(chunk: IMondrianData[], controller) {
    this.buffer.push(...chunk);
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
