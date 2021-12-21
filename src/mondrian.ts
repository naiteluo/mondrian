import "pixi.js";

import { Application } from "@pixi/app";
import { MondrianEventProxier } from "./event-proxier";
import {
  MondrianConsumer,
  MondrianPlayerManager,
  MondrianProducer,
} from "./player";
import { MondrianUtils } from "./common/utils";
import { MondrianRenderer } from "./renderer/renderer";
import { MondrianDataManager } from "./data-manager";

import "web-streams-polyfill/es6";
import { ENV, settings } from "pixi.js";
import { MondrianShared } from "./shared";
import { MondrianModuleBase } from "./common/module-base";

export interface IMondrianSettings {
  container: HTMLElement;
  isProducer?: boolean;
  resolution?: number;
  autoStart?: boolean;
}

export class Mondrian extends MondrianModuleBase {
  /**
   * self's props
   */
  private _ID = `${+new Date()}-${Math.round(Math.random() * 100)}`;

  /**
   * DOM container ref
   */
  private $container: HTMLElement;
  private $canvas: HTMLCanvasElement;
  private _$panel: HTMLDivElement;

  /**
   * pixi's instances
   */
  private app: Application;

  /**
   * modules
   */
  private shared: MondrianShared;
  private renderer: MondrianRenderer;
  private playerManager: MondrianPlayerManager;
  private eventProxier: MondrianEventProxier;
  private dataManager: MondrianDataManager;

  // todo better settings handling
  constructor(private _settings: IMondrianSettings) {
    super();
    // bind to given dom container
    this.$container = _settings.container;
    // setup dom related staffs
    this.initializeContainer();
    // setup debug panel
    this.initialzieDebugPanel();
    // init pixi
    // todo not start immediately
    this.initializePIXIApplication();

    /**
     * ** warning **
     *
     * only Shared module has direct access to Mondrian instance
     * to keep dependency clear,
     * other inner module can't directly access Mondrian!!
     *
     * other inner module can indirectly access Mondrian instance
     * through injected Shared module instance.
     */
    this.shared = new MondrianShared(this);
    /**
     * initialize inner modules and inject dependencies
     */
    this.playerManager = new MondrianPlayerManager(this.shared);
    this.renderer = new MondrianRenderer(this.shared);
    this.dataManager = new MondrianDataManager(this.playerManager);
    this.eventProxier = new MondrianEventProxier(
      this.playerManager,
      this.shared
    );
    this.playerManager.injectDataManager(this.dataManager);
    this.playerManager.injectRenderer(this.renderer);

    if (this.settings.autoStart) {
      this.start();
    }
  }

  start() {
    super.start();
    /**
     * create players' instances
     */
    this.renderer.start();
    this.playerManager.start();
    this.dataManager.start();
    this.eventProxier.start();
  }

  private setCursorVisible(flag: boolean) {
    this.$container.style.cursor = flag ? "pointer" : "none";
  }

  // todo init pixi app in renderer
  private initializePIXIApplication() {
    /**
     * in mobile pixi fallback to webgl1 even webview support webgl2
     * https://bugs.chromium.org/p/chromium/issues/detail?id=934823
     * https://github.com/pixijs/pixijs/issues/7899
     */
    // todo add version detect to set webgl1 as prefer_env before chrome 75
    settings.PREFER_ENV = ENV.WEBGL2;
    // Create a Pixi Application
    this.app = new Application({
      antialias: true,
      backgroundAlpha: 0,
      autoDensity: true,
      resolution: this.settings.resolution,
      autoStart: false,
    });
    // Add the canvas that Pixi automatically created for you to the HTML document
    this.$canvas = this.app.view;
    this.$container.appendChild(this.$canvas);
    window.addEventListener("resize", this.resizeEventHandler);
    // todo turn off if there is no producer
    this.app.stage.interactive = true;
    // resize immediately to fit full container
    this.resizeEventHandler();
  }

  private initializeContainer() {
    this.$container.style.position = "absolute";
    this.$container.style.zIndex = "0";
    this.$container.style.margin = "0px 0px";
  }

  private initialzieDebugPanel() {
    this._$panel = document.createElement("div");
    this.$panel.id = "debug-panel";
    this.$panel.style.width = "100px;";
    this.$panel.style.height = "100px;";
    this.$panel.style.zIndex = "2";
    this.$panel.style.position = "fixed";
    this.$panel.style.top = "0px";
    this.$panel.style.left = "15px";
    this.$panel.style.backgroundColor = "#000";
    this.$panel.style.padding = "0px 10px";
    this.$panel.style.height = "35.5px";
    this.$panel.style.color = "#13c039";
    this.$panel.style.display = "flex";
    this.$panel.style.opacity = "0.8";
    this.$panel.style.alignItems = "center";
    this.$panel.style.fontFamily = "monospace";
    this.$panel.innerHTML = "debug panel";
    document.body.appendChild(this.$panel);
  }

  private resizeEventHandler = () => {
    const wh = MondrianUtils.getScreenWH();
    this.$container.style.width = `${wh.w}px`;
    this.$container.style.height = `${wh.h}px`;
    this.$canvas.style.width = `${wh.w}px`;
    this.$canvas.style.height = `${wh.h}px`;
    this.app.renderer.resize(wh.w, wh.h);
  };

  get ID() {
    return this._ID;
  }

  get player() {
    return this.playerManager.producer;
  }

  get interaction() {
    return this.eventProxier;
  }

  // data manager
  get dm() {
    return this.dataManager;
  }

  get pixiApp() {
    return this.app;
  }

  get $panel() {
    return this._$panel;
  }

  get settings() {
    return this._settings;
  }
}
