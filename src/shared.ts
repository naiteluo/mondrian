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
}
