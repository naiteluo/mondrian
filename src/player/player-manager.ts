import { MondrianDataManager } from "data-manager";
import { MondrianRenderer } from "../renderer/renderer";
import { MondrianShared } from "shared";
import { MondrianConsumer } from "./consumer";
import { MondrianProducer } from "./producer";
import { MondrianModuleBase } from "../common/module-base";

export class MondrianPlayerManager extends MondrianModuleBase {
  private _producer: MondrianProducer;
  private _consumers: Map<string, MondrianConsumer> = new Map();

  private dataManager?: MondrianDataManager;
  private renderer?: MondrianRenderer;

  constructor(private shared: MondrianShared) {
    super();
  }

  injectDataManager(dataManager: MondrianDataManager) {
    this.dataManager = dataManager;
  }

  injectRenderer(renderer: MondrianRenderer) {
    this.renderer = renderer;
  }

  get producer() {
    if (!this._producer) {
      throw new Error("No producer instance had been created.");
    }
    return this._producer;
  }

  get consumers() {
    return this._consumers;
  }

  /**
   * create default producer and consumer
   */
  start() {
    super.start();
    this.createConsumer();
    if (this.shared.settings.isProducer) {
      this.createProducer();
    }
  }

  stop() {
    super.stop();
  }

  createProducer() {
    if (!this.detect()) return;
    this._producer = new MondrianProducer(
      this.shared.MID,
      this.dataManager,
      this.shared
    );
  }

  createConsumer(id?: string) {
    if (!this.detect()) return;
    const consumerId = id ? id : this.shared.MID;
    if (this.consumers.get(consumerId)) {
      throw new Error(
        `Duplicated consumerId ${consumerId}，this Consumer had been register already.`
      );
    }
    const consumer = new MondrianConsumer(
      consumerId,
      this.renderer,
      this.shared
    );
    this.consumers.set(consumerId, consumer);
  }

  getConsumerByID(id: string) {
    console.warn("to be implemented");
  }

  /**
   * check if deps ready
   */
  private detect() {
    if (!this.dataManager) {
      throw new Error("dataManager had not been bind!");
    }
    if (!this.renderer) {
      throw new Error("renderer had not been bind!");
    }
    return true;
  }
}
