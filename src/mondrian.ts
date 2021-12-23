import "pixi.js";

import { MondrianEventProxier } from "./event-proxier";
import { MondrianPlayerManager } from "./player";
import { MondrianRenderer } from "./renderer/renderer";
import { MondrianDataManager } from "./data-manager";

import "web-streams-polyfill/es6";
import { MondrianShared } from "./shared";
import { MondrianModuleBase } from "./common/module-base";
import { MondrianContainerManager } from "./container-manager";

export interface IMondrianSettings {
  container: HTMLElement;
  isProducer?: boolean;
  resolution?: number;
  autoStart?: boolean;
  chunkLimit?: number;
}

export class Mondrian extends MondrianModuleBase {
  /**
   * self's props
   */
  private _ID = `${+new Date()}-${Math.round(Math.random() * 100)}`;

  /**
   * modules
   */
  private shared: MondrianShared;
  private containerManager: MondrianContainerManager;
  private renderer: MondrianRenderer;
  private playerManager: MondrianPlayerManager;
  private eventProxier: MondrianEventProxier;
  private dataManager: MondrianDataManager;

  // todo better settings handling
  constructor(private _settings: IMondrianSettings) {
    super();

    // preprocess settings

    if (!_settings.chunkLimit) {
      this._settings.chunkLimit = 2000;
    }

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
    this.containerManager = new MondrianContainerManager(this.shared);
    this.playerManager = new MondrianPlayerManager(this.shared);
    this.renderer = new MondrianRenderer(this.containerManager, this.shared);
    this.dataManager = new MondrianDataManager(this.playerManager, this.shared);
    this.eventProxier = new MondrianEventProxier(
      this.playerManager,
      this.renderer,
      this.containerManager,
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
    this.containerManager.start();
    this.eventProxier.resize();
    this.renderer.start();
    this.eventProxier.start();
    this.playerManager.start();
    this.dataManager.start();
  }

  get ID() {
    return this._ID;
  }

  get player() {
    return this.playerManager.producer;
  }

  get interaction() {
    return this.eventProxier;
  }

  get dm() {
    return this.dataManager;
  }

  get settings() {
    return this._settings;
  }

  get __debugPixiApp() {
    return this.renderer.pixiApp;
  }
}
