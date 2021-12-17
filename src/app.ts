import {
  BrushName,
  BrushPluginState,
  BrushType,
  defaultBrushOptions,
} from "./plugin/brush-plugin";
import { Mondrian } from "./mondrian";
import { Controller, GUI } from "lil-gui";

const AUTO_START = true;

class App {
  $div: HTMLElement;
  mondrian!: Mondrian;
  gui: GUI;
  guiAutoCtrl: Controller;

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
    this.initialMondrian();
  }

  initialLilGUI() {
    this.gui = new GUI();

    const brushFolder = this.gui.addFolder("Brush").close();
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

    const commandFolder = this.gui.addFolder("Command");
    commandFolder.open();
    commandFolder.add(this, "onUndo").name("Undo");
    commandFolder.add(this, "onRedo").name("Redo");
    commandFolder.add(this, "onClear").name("Clear");

    const testFolder = this.gui.addFolder("Test");
    this.guiAutoCtrl = testFolder.add(this, "onAuto").name("Start Auto Draw");
    testFolder.add(this, "onClearServerCache").name("Clear Server Cache");
  }

  initialMondrian() {
    // create instance
    this.mondrian = new Mondrian({
      container: this.$div,
      isProducer: true,
    });

    this.mondrian.interaction.emit("player:state:change", {
      selectedBrush: this.brushConfig,
    });
  }

  private _onBrushStateChange = (evt) => {
    this.sendBrushUpdateSignal();
  };

  sendBrushUpdateSignal() {
    this.mondrian.interaction.emit("player:state:change", {
      selectedBrush: this.brushConfig,
    });
  }

  onUndo() {
    this.mondrian.interaction.emit("player:action:undo");
  }

  onRedo() {
    this.mondrian.interaction.emit("player:action:redo");
  }

  onClear() {
    this.mondrian.interaction.emit("player:action:clear");
  }

  private isAutoOn = false;
  private lastPoint = { x: 0, y: 0 };
  private autoStepLength = 80;
  private autoStepIndex = 0;
  private autoStepCountPerTick = 20;
  private viewWidth = 0;
  private viewHeight = 0;
  private lt = 0;

  private step = (nt) => {
    if (this.isAutoOn) {
      if (nt - this.lt > 100) {
        this.lt = nt;
        switch (this.autoStepIndex) {
          case 0:
            // simulate self drag
            this.mondrian.interaction.emit("player:state:change", {
              selectedBrush: {
                ...this.brushConfig,
                color: (Math.random() * 0xffffff) << 0,
              },
            });
            this.mondrian.interaction.emit("player:interaction:pointerdown", {
              mock: true,
              mockX: this.lastPoint.x,
              mockY: this.lastPoint.y,
            });
            break;
          case this.autoStepCountPerTick:
            this.mondrian.interaction.emit("player:interaction:pointerup", {
              mock: true,
              mockX: this.lastPoint.x,
              mockY: this.lastPoint.y,
            });
            break;
          default:
            this.randomUpdatePoint();
            this.mondrian.interaction.emit("player:interaction:pointermove", {
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

  private forcePointerUp() {
    this.mondrian.interaction.emit("player:interaction:pointerup", {
      mock: true,
      mockX: this.lastPoint.x,
      mockY: this.lastPoint.y,
    });
  }

  private randomUpdatePoint() {
    this.lastPoint.x +=
      Math.random() * this.autoStepLength * 2 - this.autoStepLength;
    this.lastPoint.y +=
      Math.random() * this.autoStepLength * 2 - this.autoStepLength;
    this.lastPoint.x =
      this.lastPoint.x < 0 ? this.viewWidth / 2 : this.lastPoint.x;
    this.lastPoint.y =
      this.lastPoint.y < 0 ? this.viewHeight / 2 : this.lastPoint.y;
    this.lastPoint.x =
      this.lastPoint.x > this.viewWidth ? this.viewWidth / 2 : this.lastPoint.x;
    this.lastPoint.y =
      this.lastPoint.y > this.viewHeight
        ? this.viewHeight / 2
        : this.lastPoint.y;
  }

  onAuto() {
    if (this.isAutoOn) {
      this.isAutoOn = false;
      this.forcePointerUp();
      this.mondrian.interaction.startPixiEventWatch();
      this.guiAutoCtrl.name("Start Auto Draw");
      return;
    }
    this.guiAutoCtrl.name("Stop Auto Draw");
    // update view size
    this.viewWidth = this.mondrian.pixiApp.view.width;
    this.viewHeight = this.mondrian.pixiApp.view.height;
    this.lastPoint = { x: this.viewWidth / 2, y: this.viewHeight / 2 };
    this.isAutoOn = true;
    // stop real mouse events watching
    this.mondrian.interaction.stopPixiEventWatch();
    requestAnimationFrame(this.step);
  }

  onClearServerCache() {
    this.mondrian.dm.client.forceClear();
  }
}

new App();
