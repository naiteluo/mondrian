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
import { MondrianEvents } from "./common/events";

/**
 * @public
 */
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

  // todo reset to private
  public renderer: MondrianRenderer;

  private playerManager: MondrianPlayerManager;

  private eventProxier: MondrianEventProxier;

  private dataManager: MondrianDataManager;

  private _settings: IMondrianSettings;

  // todo #10 better settings handling
  constructor(_settings: Partial<IMondrianSettings>) {
    super();
    this._settings = { ...DefaultMondrianSettings, ..._settings };

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
      this.connect();
    }

    window.mo = this;
  }

  override async start() {
    super.start();

    this.containerManager.start();
    this.eventProxier.resize();
    this.renderer.start();
    this.eventProxier.start();
    this.playerManager.start();
    this.dataManager.start();
    return true;
  }

  async connect() {
    this.shared.time(PERF_LOAD);
    /**
     * create players' instances
     */
    this.loading.show();
    this.loading.setText("Data client: Connecting...");
    this.dataManager.once(MondrianEvents.EVENT_RECOVER_CONSUMED, () => {
      this.loading.hide();
      this.emit(MondrianEvents.EVENT_RECOVER_CONSUMED);
      this.shared.time(PERF_PROCESS);
      this.shared.printTimes();
    });
    const { success, size } = (await this.dataManager.connect()) as {
      success: boolean;
      size: number;
    };

    if (success) {
      this.shared.time(PERF_LOAD);
      console.log(`Connect success, recovered data size: ${size}`);
      this.loading.setText(`Data client: ${size} Data received. Processing...`);
      this.emit(MondrianEvents.EVNET_RECOVER_RECEIVED, {
        size,
      });
      this.shared.time(PERF_PROCESS);
    } else {
      throw new Error("Start fails.");
    }
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

  public get containers() {
    return this.containerManager;
  }

  public showPannel() {
    this.containerManager.showPannel();
  }

  public hidePannel() {
    this.containerManager.hidePannel();
  }

  /**
   *
   * resize mondrian stage manually.
   *
   *
   * @public
   *
   */
  public resize() {
    this.interaction.resize();
  }

  /**
   * reset viewport's postion and scale to container's center
   */
  public fitCenter() {
    this.renderer.fitViewportToCenter();
  }

  /**
   * take a snapshot of current stage and export as base64 string
   *
   * @returns image base64 data
   */
  public takeSnapshot(): string {
    return this.renderer.exportToBase64();
  }

  /**
   * draw the passed image base64 string data to stage
   *
   * @param data image base64 data
   */
  public async applySnapshot(data: string) {
    return this.renderer.updateFixedTexture(data);
  }

  /**
   * clear all stuffs in the renderer
   */
  public clearAll() {
    this.renderer.clear();
  }
}
