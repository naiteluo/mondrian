import "pixi.js";

import { Application } from "@pixi/app";
import { EventProxier } from "./event-proxier";
import { MondrianConsumer, MondrianProducer } from "./player";
import { MondrianUtils } from "./common/utils";
import { MondrianRenderer } from "./renderer/renderer";
import { MondrianDataManager } from "./data-manager";

import "web-streams-polyfill/es6";

export interface IMondrianParams {
  container: HTMLElement;
  isProducer: boolean;
  resolution: number;
}

export class Mondrian {
  private ID = `${+new Date()}-${Math.round(Math.random() * 100)}`;

  private app: Application;
  private $container: HTMLElement;
  private $canvas: HTMLCanvasElement;
  private $panel: HTMLDivElement;

  private eventProxier: EventProxier;

  private producer: MondrianProducer;
  private renderer: MondrianRenderer;

  private consumers: Map<string, MondrianConsumer> = new Map();

  private dataManager: MondrianDataManager;

  constructor(private params: IMondrianParams) {
    this.$container = params.container;
    this.initializeContainer();
    this.initialzieDebugPanel();
    this.initializePIXIApplication();
    this.resizeEventHandler();

    this.dataManager = new MondrianDataManager(this);
    this.initializeMondrianRenderer();

    if (params.isProducer) {
      this.initializeProducer();
    }
    this.initializeConsumer();
    this.dataManager.start();

    // todo remove debug
    (window as any).mo = this;
  }

  private initializePIXIApplication() {
    //Create a Pixi Application
    this.app = new Application({
      antialias: true,
      backgroundAlpha: 0,
      autoDensity: true,
      resolution: this.params.resolution,
      autoStart: true,
    });
    //Add the canvas that Pixi automatically created for you to the HTML document
    this.$canvas = this.app.view;

    this.$container.appendChild(this.$canvas);

    window.addEventListener("resize", this.resizeEventHandler);

    // todo turn off if there is no producer
    this.app.stage.interactive = true;
  }

  private initializeProducer() {
    this.producer = new MondrianProducer(this.ID, this.app, this.dataManager);
    this.eventProxier = new EventProxier(this.app, [this.producer]);
  }

  private initializeConsumer() {
    this.addConsumer(this.ID);
  }

  addConsumer(id: string) {
    const consumer = new MondrianConsumer(id, this.renderer, this.app);
    this.consumers.set(id, consumer);
    this.dataManager.registerConsumer(id, consumer);
  }

  private initializeContainer() {
    this.$container.style.position = "absolute";
    this.$container.style.zIndex = "0";
    this.$container.style.margin = "0px 0px";
    this.$container.style.cursor = "none";
  }

  private resizeEventHandler = () => {
    const wh = MondrianUtils.getScreenWH();
    this.$container.style.width = `${wh.w}px`;
    this.$container.style.height = `${wh.h}px`;
    this.$canvas.style.width = `${wh.w}px`;
    this.$canvas.style.height = `${wh.h}px`;
    this.app.renderer.resize(wh.w, wh.h);
  };

  private initializeMondrianRenderer() {
    this.renderer = new MondrianRenderer(this.app, this.$panel);
  }

  initialzieDebugPanel() {
    this.$panel = document.createElement("div");
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

  get player() {
    return this.producer;
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
}
