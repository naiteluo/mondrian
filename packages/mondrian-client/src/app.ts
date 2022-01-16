import { Mondrian } from "mondrian/lib/mondrian";
import {
  BrushPluginState,
  defaultBrushOptions,
  MondrianDefaultBrushPluginList,
} from "mondrian/lib/plugin/brush-plugin";
import { Controller, GUI } from "lil-gui";
import { appSettings } from "./utils/app-settings";

const BrushPluginList = MondrianDefaultBrushPluginList;
class App {
  $div: HTMLElement;

  mondrian!: Mondrian;

  gui!: GUI;

  guiAutoCtrl!: Controller;

  msgCtrl!: Controller;

  msg = "welcome.";

  appSettings = appSettings;

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
    this.mondrian.on(
      Mondrian.EVNET_RECOVER_RECEIVED,
      ({ size }: { size: number }) => {
        this.logMsg(`data size: ${size}`);
        this.initialBrush();
      }
    );
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
    this.gui = new GUI({
      title: "Mondrian",
    });
    this.gui.add(this, "onStart").name("Start");

    const settingsFolder = this.gui.addFolder("Settings");
    this.msgCtrl = settingsFolder.add(this, "msg").name("Message:");
    settingsFolder
      .add(this.appSettings.mondrianSettings, "resolution", 1, 3, 1)
      .listen()
      .name("resolution")
      .onFinishChange(() => {
        window.location.reload();
      });
    settingsFolder
      .add(
        this.appSettings.mondrianSettings,
        "chunkLimit",
        [100, 500, 1000, 2000, 5000, 10000, 50000]
      )
      .listen()
      .name("chunkLimit")
      .onFinishChange(() => {
        window.location.reload();
      });
    settingsFolder
      .add(this.appSettings.mondrianSettings, "isProducer", [true, false])
      .listen()
      .name("isProducer")
      .onFinishChange(() => {
        window.location.reload();
      });
    settingsFolder
      .add(this.appSettings.mondrianSettings, "autoStart", [true, false])
      .listen()
      .name("autoStart")
      .onFinishChange(() => {
        window.location.reload();
      });
    settingsFolder
      .add(this.appSettings.mondrianSettings, "disableCursor", [true, false])
      .listen()
      .name("disableCursor")
      .onFinishChange(() => {
        window.location.reload();
      });
    settingsFolder
      .add(this.appSettings.mondrianSettings, "debug", [true, false])
      .listen()
      .name("debug")
      .onFinishChange(() => {
        window.location.reload();
      });
    settingsFolder
      .add(this.appSettings.mondrianSettings, "viewport", [true, false])
      .listen()
      .name("useViewport")
      .onFinishChange(() => {
        window.location.reload();
      });
    settingsFolder
      .add(this.appSettings.mondrianSettings, "background", [true, false])
      .listen()
      .name("showBackground")
      .onFinishChange(() => {
        window.location.reload();
      });
    settingsFolder
      .add(this, "autoStepTimeSpan", 10, 1000, 20)
      .name("time per step (ms)");
    this.guiAutoCtrl = settingsFolder
      .add(this, "onAuto")
      .name("Start Auto Draw");
    settingsFolder
      .add(this.appSettings.mondrianSettings, "channel")
      .name("Channel Name");
    settingsFolder.add(this, "onSwitchChannel").name("Swith Channel");
    settingsFolder.add(this, "onClearChannelCache").name("Clear Channel Cache");
    settingsFolder.add(this, "onResetChannel").name("Reset Channel");

    const commandFolder = this.gui.addFolder("Command");
    commandFolder.add(this, "onUndo").name("Undo");
    commandFolder.add(this, "onRedo").name("Redo");
    commandFolder
      .add(this, "onClear")
      .name("Clear")
      .$widget.setAttribute("data-test-id", "clear");

    const brushFolder = this.gui.addFolder("Brush");
    brushFolder
      .add(this.brushConfig, "brushName", [...BrushPluginList])
      .onChange(this._onBrushStateChange)
      .$widget.setAttribute("data-test-id", "brushName");
    brushFolder
      .add(this.brushConfig, "dash", [true, false])
      .onChange(this._onBrushStateChange)
      .$widget.setAttribute("data-test-id", "dash");
    brushFolder
      .add(this.brushConfig, "restrict", [true, false])
      .onChange(this._onBrushStateChange)
      .$widget.setAttribute("data-test-id", "restrict");
    brushFolder
      .add(this.brushConfig, "brushWidth", 1, 50)
      .onChange(this._onBrushStateChange)
      .$widget.setAttribute("data-test-id", "brushWidth");
    brushFolder
      .addColor(this.brushConfig, "brushColor")
      .onChange(this._onBrushStateChange)
      .$widget.setAttribute("data-test-id", "brushColor");
  }

  initialBrush() {
    this.mondrian.interaction.emit("state:change", {
      player: {
        brush: defaultBrushOptions,
      },
    });
  }

  initialMondrian() {
    // create instance
    this.mondrian = new Mondrian({
      container: this.$div,
      ...this.appSettings.mondrianSettings,
    });
  }

  private _onBrushStateChange = () => {
    this.sendBrushUpdateSignal();
  };

  sendBrushUpdateSignal() {
    this.mondrian.interaction.emit("state:change", {
      player: {
        brush: this.brushConfig,
      },
    });
  }

  onUndo() {
    this.mondrian.interaction.emit("command:undo");
  }

  onRedo() {
    this.mondrian.interaction.emit("command:redo");
  }

  onClear() {
    this.mondrian.interaction.emit("command:clear");
  }

  onStart() {
    this.mondrian.start();
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

  private step = (nt: number) => {
    if (this.isAutoOn) {
      if (nt - this.lt > this.autoStepTimeSpan) {
        this.lt = nt;
        switch (this.autoStepIndex) {
          case 0:
            // simulate self drag
            this.mondrian.interaction.emit("state:change", {
              player: {
                brush: {
                  ...this.brushConfig,
                  brushColor: (Math.random() * 0xffffff) << 0,
                },
              },
            });
            this.mondrian.interaction.emit("interaction:pointerdown", {
              mock: true,
              mockX: this.lastPoint.x,
              mockY: this.lastPoint.y,
            });
            break;
          case this.autoStepCountPerTick:
            this.mondrian.interaction.emit("interaction:pointerup", {
              mock: true,
              mockX: this.lastPoint.x,
              mockY: this.lastPoint.y,
            });
            break;
          default:
            this.randomUpdatePoint();
            this.mondrian.interaction.emit("interaction:pointermove", {
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
    this.mondrian.interaction.emit("interaction:pointerup", {
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
    this.appSettings.mondrianSettings.channel = "guest";
    window.location.reload();
  }

  async onSwitchChannel() {
    try {
      window.location.reload();
    } catch (err) {
      this.logMsg("cache fails to save.", true);
    }
  }

  logMsg(str: string, isError = false) {
    this.msg = str;
    this.msgCtrl.updateDisplay();
    if (isError) {
      console.error(str);
    } else {
      console.log(str);
    }
  }

  hideUI() {
    this.mondrian.hidePannel();
    this.gui.$title.hidden = true;
    this.gui.$children.hidden = true;
  }

  showUI() {
    this.mondrian.showPannel();
    this.gui.$title.hidden = false;
    this.gui.$children.hidden = false;
  }
}

// todo only for testing
(window as Window & typeof globalThis & { moApp: App }).moApp = new App();
