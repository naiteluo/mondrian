export class MondrianModuleBase {
  private _initialized = false;
  private _running = false;
  constructor() {
    this._initialized = true;
  }
  start() {
    if (this._running) throw new Error("start a module twice is forbidden");
    this._running = true;
  }
  stop() {
    if (!this._running) return;
    this._running = false;
  }
  get initialized() {
    return this._initialized;
  }

  get running() {
    return this._running;
  }
}
