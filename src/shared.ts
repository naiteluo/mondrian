import { MondrianModuleBase } from "./common/module-base";
import { Mondrian } from "mondrian";

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

  public debug = false;

  /**
   * for debug
   */
  logs: string[] = [];

  log(msg: string) {
    if (!this.debug) {
      return;
    }
    this.logs.push(msg);
  }
}
