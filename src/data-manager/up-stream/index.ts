import { IData } from "data-manager";
import { IoClient } from "data-manager/ws-client";

export class LocalUpStreamSink implements UnderlyingSink {
  constructor(private buffer: IData[]) {}
  start(controller) {
    console.log("[start]");
  }
  async write(chunk: IData[], controller) {
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

export class WsUpStreamSink implements UnderlyingSink {
  constructor(private buffer: IData[], private client: IoClient) {}
  start(controller) {
    console.log("[start]");
  }
  async write(chunk: IData[], controller) {
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
