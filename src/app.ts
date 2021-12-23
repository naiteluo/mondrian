import {
  BrushName,
  BrushPluginState,
  BrushType,
  defaultBrushOptions,
} from "./plugin/brush-plugin";
import { Mondrian } from "./mondrian";
import { Controller, GUI } from "lil-gui";
import axios from "axios";
import {
  getAutoStart,
  getChannel,
  getChunkLimit,
  getResolution,
  setAutoStart,
  setChannel,
  setChunkLimit,
  setResolution,
} from "./app/app-helper";

const TEST_SERVER_HOST = `//${window.location.hostname}:3000`;

class App {
  $div: HTMLElement;
  mondrian!: Mondrian;
  gui: GUI;
  guiAutoCtrl: Controller;

  msg = "welcome.";
  msgCtrl: Controller;

  channel = getChannel();

  brushConfig: BrushPluginState = defaultBrushOptions;

  resolution = getResolution();
  chunkLimit = getChunkLimit() || 2000;
  autoStart = getAutoStart();

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
    this.mondrian.on(Mondrian.EVNET_RECOVER_RECEIVED, ({ size }) => {
      this.logMsg(`data size: ${size}`);
    });
    try {
      this.logMsg(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        `WebGL ${this.mondrian.pixiApp.renderer.context.webGLVersion}`
      );
    } catch (err) {
      console.log("webgl version dump fails.");
    }
  }

  initialLilGUI() {
    this.gui = new GUI();
    this.gui.add(this, "onStart").name("Start");

    const settingsFolder = this.gui.addFolder("Settings");
    this.msgCtrl = settingsFolder.add(this, "msg").name("Message:");
    settingsFolder
      .add(this, "resolution", 1, 3, 1)
      .listen()
      .name("resolution")
      .onFinishChange(() => {
        setResolution(this.resolution);
        window.location.reload();
      });
    settingsFolder
      .add(this, "chunkLimit", [NaN, 100, 1000, 2000, 5000, 10000, 50000])
      .listen()
      .name("chunkLimit")
      .onFinishChange(() => {
        setChunkLimit(this.chunkLimit);
        window.location.reload();
      });
    settingsFolder
      .add(this, "autoStart", [true, false])
      .listen()
      .name("autoStart")
      .onFinishChange(() => {
        setAutoStart(this.autoStart);
        window.location.reload();
      });
    settingsFolder
      .add(this, "autoStepTimeSpan", 10, 1000, 20)
      .name("time per step (ms)");
    this.guiAutoCtrl = settingsFolder
      .add(this, "onAuto")
      .name("Start Auto Draw");
    settingsFolder.add(this, "channel").name("Channel Name");
    settingsFolder.add(this, "onSwitchChannel").name("Swith Channel");
    settingsFolder.add(this, "onClearChannelCache").name("Clear Channel Cache");
    settingsFolder.add(this, "onResetChannel").name("Reset Channel");

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

  initialBrush() {
    this.mondrian.interaction.emit("player:state:change", {
      selectedBrush: this.brushConfig,
    });
  }

  initialMondrian() {
    // create instance
    this.mondrian = new Mondrian({
      container: this.$div,
      isProducer: true,
      resolution: this.resolution,
      autoStart: this.autoStart,
      chunkLimit: this.chunkLimit,
      channel: this.channel,
    });

    this.initialBrush();
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

  onStart() {
    this.mondrian.start();
    this.initialBrush();
  }

  private isAutoOn = false;
  private lastPoint = { x: 0, y: 0 };
  private autoStepLength = 80;
  private autoStepIndex = 0;
  private autoStepCountPerTick = 20;
  private autoStepTimeSpan = 100;
  private screenWidth = 0;
  private screenHeight = 0;

  private lt = 0;

  private step = (nt) => {
    if (this.isAutoOn) {
      if (nt - this.lt > this.autoStepTimeSpan) {
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
    this.screenWidth = this.mondrian.__debugPixiApp.screen.width;
    this.screenHeight = this.mondrian.__debugPixiApp.screen.height;
    this.lastPoint = { x: this.screenWidth / 2, y: this.screenHeight / 2 };
    this.isAutoOn = true;
    // stop real mouse events watching
    this.mondrian.interaction.stopPixiEventWatch();
    requestAnimationFrame(this.step);
  }

  onClearChannelCache() {
    this.mondrian.dm.client.forceClear();
    window.location.reload();
  }

  onResetChannel() {
    setChannel("guest");
    window.location.reload();
  }

  async onSwitchChannel() {
    try {
      setChannel(this.channel);
      window.location.reload();
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
