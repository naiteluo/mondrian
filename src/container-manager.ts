import { MondrianShared } from "./shared";
import { MondrianModuleBase } from "./common/module-base";
import { MondrianUtils } from "./common/utils";

export class MondrianContainerManager extends MondrianModuleBase {
  /**
   * DOM container ref
   */
  private _$container: HTMLElement;

  private _$panel: HTMLDivElement;

  constructor(private shared: MondrianShared) {
    super();
    this._$container = shared.settings.container;
  }

  start() {
    super.start();
    this.initializeContainer();
    this.initialzieDebugPanel();
  }

  resize() {
    const wh = MondrianUtils.getScreenWH();
    this.$container.style.width = `${wh.w}px`;
    this.$container.style.height = `${wh.h}px`;
  }

  private initializeContainer() {
    this.$container.classList.add("mondrian-container");
    this.$container.style.position = "absolute";
    this.$container.style.zIndex = "0";
    this.$container.style.margin = "0px 0px";
    this.$container.style.userSelect = "none";
    this.$container.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  }

  private initialzieDebugPanel() {
    this._$panel = document.createElement("div");
    this._$panel.id = "debug-panel";
    this._$panel.style.width = "100px;";
    this._$panel.style.height = "100px;";
    this._$panel.style.zIndex = "2";
    this._$panel.style.position = "fixed";
    this._$panel.style.top = "0px";
    this._$panel.style.left = "15px";
    this._$panel.style.backgroundColor = "#000";
    this._$panel.style.padding = "0px 10px";
    this._$panel.style.height = "35.5px";
    this._$panel.style.color = "#13c039";
    this._$panel.style.display = "flex";
    this._$panel.style.opacity = "0.8";
    this._$panel.style.alignItems = "center";
    this._$panel.style.fontFamily = "monospace";
    this._$panel.innerHTML = "debug panel";
    document.body.appendChild(this._$panel);
  }

  private setCursorVisible(flag: boolean) {
    this.$container.style.cursor = flag ? "pointer" : "none";
  }

  public get $container() {
    return this._$container;
  }

  public get $panel() {
    return this._$panel;
  }

  hidePannel() {
    this._$panel.style.visibility = "hidden";
  }

  showPannel() {
    this._$panel.style.visibility = "visible";
  }
}
