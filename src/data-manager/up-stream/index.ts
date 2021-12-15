import { IModrianData } from "../data-manager";
import { IoClient } from "../ws-client";

export class ModrianLocalUpStreamSink implements UnderlyingSink {
  constructor(private buffer: IModrianData[]) {}
  start(controller) {
    console.log("[start]");
  }
  async write(chunk: IModrianData[], controller) {
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

export class ModrianWsUpStreamSink implements UnderlyingSink {
  constructor(private buffer: IModrianData[], private client: IoClient) {}
  start(controller) {
    console.log("[start]");
  }
  async write(chunk: IModrianData[], controller) {
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
