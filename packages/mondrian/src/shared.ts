import { MondrianModuleBase } from "./common/module-base";
import { Mondrian } from "./mondrian";

interface IMondrianDebugTimePair {
  s?: number;
  e?: number;
  valid: boolean;
  deltaMs?: number;
  msg?: string;
}

export class MondrianShared extends MondrianModuleBase {
  constructor(private mondrian: Mondrian) {
    super();
    super.start();
  }

  get MID() {
    return this.mondrian.ID;
  }

  get settings() {
    return this.mondrian.settings;
  }

  // todo if debug functionanlities become complicated, remove from here

  private __debug_log_on_console = false;

  /**
   * for debug
   */
  logs: string[] = [];

  log(msg: string) {
    if (!this.settings.debug) {
      return;
    }
    if (this.__debug_log_on_console) {
      console.log(msg);
    }
    this.logs.push(msg);
  }

  times: Map<string, IMondrianDebugTimePair> = new Map();

  /**
   * save time mark pairs for debugging.
   * @param mark
   */
  time(mark: string) {
    let pair = this.times.get(mark);
    if (!pair) {
      pair = { valid: false };
      this.times.set(mark, pair);
    }
    if (pair.s === undefined) {
      pair.s = performance.now();
      return;
    }
    if (pair.e === undefined) {
      pair.e = performance.now();
      pair.deltaMs = pair.e - pair.s;
      pair.valid = true;
      return;
    }
    pair.valid = false;
    pair.msg = "MissMatchTimePair";
  }

  printTimes() {
    console.log("Times Logs: ");
    this.times.forEach((pair, key) => {
      console.log(key, pair.deltaMs);
    });
  }
}
