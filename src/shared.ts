import { Mondrian } from "mondrian";

export class MondrianShared {
  constructor(private mondrian: Mondrian) {}
  get MID() {
    return this.mondrian.ID;
  }
  get pixiApp() {
    return this.mondrian.pixiApp;
  }

  get $panel() {
    return this.mondrian.$panel;
  }
}
