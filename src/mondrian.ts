import "pixi.js";
import "web-streams-polyfill/es6";

import { MondrianEventProxier } from "./event-proxier";
import { MondrianPlayerManager } from "./player";
import { MondrianRenderer } from "./renderer/renderer";
import { MondrianDataManager } from "./data-manager";

import { MondrianShared } from "./shared";
import { MondrianModuleBase } from "./common/module-base";
import { MondrianContainerManager } from "./container-manager";
import { MondrianLoading } from "./common/loading";
import { DefaultMondrianSettings, IMondrianSettings } from "./mondian-settings";
import { PERF_LOAD, PERF_PROCESS } from "./common/constants";

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

  private loading: MondrianLoading;

  private renderer: MondrianRenderer;

  private playerManager: MondrianPlayerManager;

  private eventProxier: MondrianEventProxier;

  private dataManager: MondrianDataManager;

  // todo better settings handling
  constructor(private _settings: IMondrianSettings) {
    super();
    this._settings = { ...DefaultMondrianSettings, ...this._settings };

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
    this.loading = new MondrianLoading(this.containerManager, this.shared);
    this.playerManager = new MondrianPlayerManager(this.shared);
    this.renderer = new MondrianRenderer(this.containerManager, this.shared);
    this.dataManager = new MondrianDataManager(
      this.playerManager,
      this.renderer,
      this.shared
    );
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

    // todo debug only
    (window as any).mo = this;
  }

  async start() {
    super.start();
    this.shared.time(PERF_LOAD);
    /**
     * create players' instances
     */
    this.loading.show();
    this.loading.setText("Fetching data...");
    this.containerManager.start();
    this.eventProxier.resize();
    this.renderer.start();
    this.eventProxier.start();
    this.playerManager.start();
    this.dataManager.once(MondrianDataManager.EVENT_RECOVER_CONSUMED, () => {
      this.loading.hide();

      this.emit(Mondrian.EVENT_RECOVER_CONSUMED);
      this.shared.time(PERF_PROCESS);
      this.shared.printTimes();
    });
    const { success, size } = (await this.dataManager.start()) as {
      success: boolean;
      size: number;
    };
    this.shared.time(PERF_LOAD);
    this.shared.time(PERF_PROCESS);
    this.loading.setText(`${size} Data received. Processing...`);
    if (success) {
      console.log(`Start success, recovered data size: ${size}`);
      this.emit(Mondrian.EVNET_RECOVER_RECEIVED, {
        size,
      });
    } else {
      throw new Error("Start fails.");
    }
    return true;
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

  get __debugShared() {
    return this.shared;
  }

  public showPannel() {
    this.containerManager.showPannel();
  }

  public hidePannel() {
    this.containerManager.hidePannel();
  }

  static EVENT_RECOVER_CONSUMED = "recover:consumed";

  static EVNET_RECOVER_RECEIVED = "recover:received";
}
