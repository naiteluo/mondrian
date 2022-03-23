import { MondrianShared } from "./shared";
import { MondrianModuleBase } from "./common/module-base";
import { MondrianUtils } from "./common/utils";

export class MondrianContainerManager extends MondrianModuleBase {
  /**
   * DOM container ref
   */
  private _$container: HTMLElement;

  private _$panel?: HTMLDivElement;

  constructor(private shared: MondrianShared) {
    super();
    if (!shared.settings.container) {
      throw new Error("container is invalid");
    }
    this._$container = shared.settings.container;
  }

  override start() {
    super.start();
    this.initializeContainer();
    if (this.shared.settings.debug) {
      this.initialzieDebugPanel();
    }
    if (this.shared.settings.disableCursor) {
      this.setCursorVisible(true);
    }
  }

  resize() {
    // resize container if fullscreen is set
    if (this.shared.settings.fullscreen) {
      const wh = MondrianUtils.getScreenWH();
      this.$container.style.width = `${wh.w}px`;
      this.$container.style.height = `${wh.h}px`;
    }
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
    this.createStatisticItem("tx-mem", "tx mem:");
    this.createStatisticItem("g-count", "g count:");
    this.createStatisticItem("pos", "(x, y):");
    document.body.appendChild(this._$panel);
  }

  public setCursorVisible(flag: boolean) {
    this.$container.style.cursor = flag ? "default" : "none";
  }

  public get $container() {
    return this._$container;
  }

  public get $panel() {
    return this._$panel;
  }

  hidePannel() {
    if (!this._$panel) {
      return;
    }
    this._$panel.style.visibility = "hidden";
  }

  showPannel() {
    if (!this._$panel) {
      return;
    }
    this._$panel.style.visibility = "visible";
  }

  createStatisticItem(name: string, description: string) {
    if (!this.$panel) return;
    const $div = document.createElement("div");
    const $span = document.createElement("span");
    $div.style.marginRight = "5px";
    $div.style.paddingRight = "5px";
    $div.style.borderRight = "solid 1px #13c039";
    $div.style.lineHeight = "1em";
    $div.className = `${name}`;
    $span.className = `${name}-value`;
    $div.appendChild(document.createTextNode(description));
    $div.appendChild($span);
    this.$panel.appendChild($div);
  }

  getStatisticItem(name: string) {
    if (!this.$panel) return;
    return this.$panel.getElementsByClassName(`${name}`)[0];
  }

  getStatisticValueItem(name: string) {
    if (!this.$panel) return;
    return this.$panel.getElementsByClassName(`${name}-value`)[0];
  }

  printInPannel(name: string, data: string | number) {
    if (!this.$panel) return;
    const $span = this.getStatisticValueItem(name);
    if ($span) {
      $span.innerHTML = `${data}`;
    }
  }
}
