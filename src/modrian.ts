import "pixi.js";

import { Application } from "@pixi/app";
import { EventProxier } from "./event-proxier";
import { ModrianConsumer, ModrianProducer } from "./player";
import { ModrianUtils } from "./common/utils";
import { ModrianRenderer } from "./renderer/renderer";
import { ModrianDataManager } from "./data-manager";

export interface IModrianParams {
  container: HTMLElement;
  isProducer: boolean;
}

export class Modrian {
  private ID = `${+new Date()}-${Math.round(Math.random() * 100)}`;

  private app: Application;
  private $container: HTMLElement;
  private $canvas: HTMLCanvasElement;
  private $panel: HTMLDivElement;

  private eventProxier: EventProxier;

  private producer: ModrianProducer;
  private renderer: ModrianRenderer;

  private consumers: Map<string, ModrianConsumer> = new Map();

  dataManager: ModrianDataManager;

  get interaction() {
    return this.eventProxier;
  }

  get pixiApp() {
    return this.app;
  }

  constructor(private params: IModrianParams) {
    this.$container = params.container;
    this.initializeContainer();
    this.initialzieDebugPanel();
    this.initializePIXIApplication();
    this.resizeEventHandler();

    this.dataManager = new ModrianDataManager(this);
    this.initializeModrianRenderer();

    if (params.isProducer) {
      this.initializeProducer();
    }
    this.initializeConsumer();
    this.dataManager.start();
    // @ts-ignore
    window.mo = this;
  }

  initializePIXIApplication() {
    //Create a Pixi Application
    this.app = new Application({
      antialias: true,
      backgroundAlpha: 0,
      autoDensity: true,
      resolution: 1,
      autoStart: true,
    });
    //Add the canvas that Pixi automatically created for you to the HTML document
    this.$canvas = this.app.view;

    this.$container.appendChild(this.$canvas);

    window.addEventListener("resize", this.resizeEventHandler);

    // todo turn off if there is no producer
    this.app.stage.interactive = true;
  }

  initializeProducer() {
    this.producer = new ModrianProducer(this.ID, this.app, this.dataManager);
    this.eventProxier = new EventProxier(this.app, [this.producer]);
  }

  initializeConsumer() {
    this.addConsumer(this.ID);
  }

  addConsumer(id: string) {
    const consumer = new ModrianConsumer(id, this.renderer);
    this.consumers.set(id, consumer);
    this.dataManager.registerConsumer(id, consumer);
  }

  initializeContainer() {
    this.$container.style.position = "absolute";
    this.$container.style.zIndex = "0";
    this.$container.style.margin = "0px 0px";
    this.$container.style.cursor = "none";
  }

  resizeEventHandler = () => {
    const wh = ModrianUtils.getScreenWH();
    this.$container.style.width = `${wh.w}px`;
    this.$container.style.height = `${wh.h}px`;
    this.$canvas.style.width = `${wh.w}px`;
    this.$canvas.style.height = `${wh.h}px`;
    this.app.renderer.resize(wh.w, wh.h);
  };

  initializeModrianRenderer() {
    this.renderer = new ModrianRenderer(this.app, this.$panel);
  }

  initialzieDebugPanel() {
    this.$panel = document.createElement("div");
    this.$panel.id = "debug-panel";
    this.$panel.style.width = "100px;";
    this.$panel.style.height = "100px;";
    this.$panel.style.zIndex = "9";
    this.$panel.style.position = "absolute";
    this.$panel.style.top = "10px";
    this.$panel.style.left = "10px";
    this.$panel.style.backgroundColor = "#000";
    this.$panel.style.height = "30px";
    this.$panel.style.padding = "2px 5px";
    this.$panel.style.color = "#13c039";
    this.$panel.style.display = "flex";
    this.$panel.style.opacity = "0.6";
    this.$panel.style.alignItems = "center";
    this.$panel.style.fontFamily = "monospace";
    this.$panel.innerHTML = "debug";

    document.body.appendChild(this.$panel);
  }

  get player() {
    return this.producer;
  }
}
