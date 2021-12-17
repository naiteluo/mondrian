import {
  BrushName,
  BrushPluginState,
  BrushType,
  defaultBrushOptions,
} from "./plugin/brush-plugin";
import { Modrian } from "./modrian";
import { GUI } from "lil-gui";

const AUTO_START = true;

class App {
  $div: HTMLElement;
  modrian!: Modrian;
  gui: GUI;

  brushConfig: BrushPluginState = defaultBrushOptions;

  constructor() {
    // reset css
    const html = document.getElementsByTagName("html")[0];
    const body = document.body;
    html.style.margin = `0px`;
    html.style.padding = `0px`;
    html.style.height = "100%";
    body.style.margin = `0px`;
    body.style.padding = `0px`;
    body.style.height = `100%`;
    body.style.lineHeight = `0px`;
    body.style.overflow = `hidden`;

    this.$div = document.createElement("div");
    document.body.appendChild(this.$div);

    this.initialLilGUI();
    this.initialModrian();
  }

  initialLilGUI() {
    this.gui = new GUI();

    const brushFolder = this.gui.addFolder("Brush");
    brushFolder
      .add(this.brushConfig, "__brushType", [
        BrushType.Normal,
        BrushType.Eraser,
        // BrushType.Highlighter,
      ])
      .name("BrushType")
      .onChange(this._onBrushStateChange);
    brushFolder
      .add(this.brushConfig, "__brushName", [
        BrushName.PENCIL,
        BrushName.CIRCLE,
        BrushName.RECTANGLE,
      ])
      .name("BrushName")
      .onChange(this._onBrushStateChange);
    brushFolder
      .add(this.brushConfig, "width", 1, 50)
      .onChange(this._onBrushStateChange);
    brushFolder
      .add(this.brushConfig, "alpha", 0, 1)
      .onChange(this._onBrushStateChange);
    brushFolder
      .addColor(this.brushConfig, "color")
      .onChange(this._onBrushStateChange);

    const actionFolder = this.gui.addFolder("Action");
    actionFolder.open();
    actionFolder.add(this, "onUndo").name("Undo");
    actionFolder.add(this, "onRedo").name("Redo");
    actionFolder.add(this, "onAuto").name("Auto");
    actionFolder.add(this, "onClearServerCache").name("clearServerCache");
  }

  initialModrian() {
    // create instance
    this.modrian = new Modrian({
      container: this.$div,
      isProducer: true,
    });

    this.modrian.interaction.emit("player:state:change", {
      selectedBrush: this.brushConfig,
    });
  }

  private _onBrushStateChange = (evt) => {
    this.sendBrushUpdateSignal();
  };

  sendBrushUpdateSignal() {
    this.modrian.interaction.emit("player:state:change", {
      selectedBrush: this.brushConfig,
    });
  }

  onUndo() {
    this.modrian.interaction.emit("player:action:undo");
  }

  onRedo() {
    this.modrian.interaction.emit("player:action:redo");
  }

  private isAutoOn = false;
  private lastPoint = { x: 0, y: 0 };
  private autoStepLength = 40;
  private autoStepIndex = 0;
  private autoStepCountPerTick = 20;
  private viewWidth = 0;
  private viewHeight = 0;
  private lt = 0;

  private step = (nt) => {
    if (this.isAutoOn) {
      if (nt - this.lt > 50) {
        this.lt = nt;
        switch (this.autoStepIndex) {
          case 0:
            // simulate self drag
            this.modrian.interaction.emit("player:state:change", {
              selectedBrush: {
                ...this.brushConfig,
                color: (Math.random() * 0xffffff) << 0,
              },
            });
            this.modrian.interaction.emit("player:interaction:pointerdown", {
              mock: true,
              mockX: this.lastPoint.x,
              mockY: this.lastPoint.y,
            });
            break;
          case this.autoStepCountPerTick:
            this.modrian.interaction.emit("player:interaction:pointerup", {
              mock: true,
              mockX: this.lastPoint.x,
              mockY: this.lastPoint.y,
            });
            break;
          default:
            this.randomUpdatePoint();
            this.modrian.interaction.emit("player:interaction:pointermove", {
              mock: true,
              mockX: this.lastPoint.x,
              mockY: this.lastPoint.y,
            });
            break;
        }
        this.autoStepIndex =
          this.autoStepIndex === this.autoStepCountPerTick
            ? 0
            : this.autoStepIndex + 1;
      }
    }
    requestAnimationFrame(this.step);
  };

  private randomUpdatePoint() {
    this.lastPoint.x +=
      Math.random() * this.autoStepLength * 2 - this.autoStepLength;
    this.lastPoint.y +=
      Math.random() * this.autoStepLength * 2 - this.autoStepLength;
    this.lastPoint.x = this.lastPoint.x < 0 ? 0 : this.lastPoint.x;
    this.lastPoint.y = this.lastPoint.y < 0 ? 0 : this.lastPoint.y;
    this.lastPoint.x = this.lastPoint.x > this.viewWidth ? 0 : this.lastPoint.x;
    this.lastPoint.y =
      this.lastPoint.y > this.viewHeight ? 0 : this.lastPoint.y;
  }

  onAuto() {
    if (this.isAutoOn) {
      this.isAutoOn = false;
      this.modrian.interaction.startPixiEventWatch();
      return;
    }
    // update view size
    this.viewWidth = this.modrian.pixiApp.view.width;
    this.viewHeight = this.modrian.pixiApp.view.height;
    this.isAutoOn = true;
    // stop real mouse events watching
    this.modrian.interaction.stopPixiEventWatch();
    requestAnimationFrame(this.step);
  }

  onClearServerCache() {
    this.modrian.dataManager.client.forceClear();
  }
}

new App();
