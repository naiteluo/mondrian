import {
  BrushName,
  BrushPluginState,
  BrushType,
  defaultBrushOptions,
} from "./plugin/brush-plugin";
import { Mondrian } from "./mondrian";
import { Controller, GUI } from "lil-gui";
import axios from "axios";
import { getResolution, setResolution } from "./app-helper";

const AUTO_START = true;
const TEST_SERVER_HOST = `//${window.location.hostname}:3000`;

class App {
  $div: HTMLElement;
  mondrian!: Mondrian;
  gui: GUI;
  guiAutoCtrl: Controller;

  msg = "welcome.";
  msgCtrl: Controller;

  brushConfig: BrushPluginState = defaultBrushOptions;

  resolution = getResolution();

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

    const testFolder = this.gui.addFolder("Test");
    this.msgCtrl = testFolder.add(this, "msg").name("Message:");
    this.guiAutoCtrl = testFolder.add(this, "onAuto").name("Start Auto Draw");
    testFolder.add(this, "onClearServerCache").name("Clear Server Cache");
    testFolder.add(this, "onSaveServerCache").name("Save Server Cache");
    testFolder
      .add(this, "resolution", 1, 3, 1)
      .listen()
      .name("resolution")
      .onFinishChange(() => {
        setResolution(this.resolution);
        window.location.reload();
      });

    const commandFolder = this.gui.addFolder("Command").close();
    commandFolder.add(this, "onUndo").name("Undo");
    commandFolder.add(this, "onRedo").name("Redo");
    commandFolder.add(this, "onClear").name("Clear");

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
  }

  initialMondrian() {
    // create instance
    this.mondrian = new Mondrian({
      container: this.$div,
      isProducer: true,
      resolution: this.resolution,
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
  private screenWidth = 0;
  private screenHeight = 0;
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
      this.lastPoint.x < 0 ? this.screenWidth / 2 : this.lastPoint.x;
    this.lastPoint.y =
      this.lastPoint.y < 0 ? this.screenHeight / 2 : this.lastPoint.y;
    this.lastPoint.x =
      this.lastPoint.x > this.screenWidth
        ? this.screenWidth / 2
        : this.lastPoint.x;
    this.lastPoint.y =
      this.lastPoint.y > this.screenHeight
        ? this.screenHeight / 2
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
    this.screenWidth = this.mondrian.pixiApp.screen.width;
    this.screenHeight = this.mondrian.pixiApp.screen.height;
    this.lastPoint = { x: this.screenWidth / 2, y: this.screenHeight / 2 };
    this.isAutoOn = true;
    // stop real mouse events watching
    this.mondrian.interaction.stopPixiEventWatch();
    requestAnimationFrame(this.step);
  }

  onClearServerCache() {
    this.mondrian.dm.client.forceClear();
  }

  async onSaveServerCache() {
    try {
      const { success } = (await axios.get(`${TEST_SERVER_HOST}/saveCache`))
        .data;
      if (success) {
        this.logMsg("cache saved.");
      }
    } catch (err) {
      this.logMsg("cache fails to save.", true);
    }
  }

  logMsg(str, isError = false) {
    this.msg = str;
    this.msgCtrl.updateDisplay();
    if (isError) {
      console.error(str);
    } else {
      console.log(str);
    }
  }
}

new App();
