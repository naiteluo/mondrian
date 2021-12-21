import { MondrianModuleBase } from "./common/module-base";
import { Mondrian } from "mondrian";

export class MondrianShared extends MondrianModuleBase {
  constructor(private mondrian: Mondrian) {
    super();
    this.start();
  }
  get MID() {
    return this.mondrian.ID;
  }
  get pixiApp() {
    return this.mondrian.pixiApp;
  }

  get $panel() {
    return this.mondrian.$panel;
  }

  get settings() {
    return this.mondrian.settings;
  }
}
