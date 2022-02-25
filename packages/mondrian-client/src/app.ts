import {
  Mondrian,
  BrushPluginState,
  DefaultMondrianBrushOptions,
  MondrianDefaultBrushPluginList,
  MondrianEvents,
  MondrianBuiltinWsClient,
} from "mondrian/lib/index";
import { Controller, GUI } from "lil-gui";
import { AutoDrawController } from "./auto-draw-controller";
import {
  getBrushConfig,
  getMondrianSettings,
  setBrushConfig,
  setMondrianSettings,
} from "./utils/app-helper";
import { CustomizedDataClient } from "./customized-data-client";

const NoGUI = window.location.search.includes("gui=0");

export class ClientApplication {
  $div: HTMLElement;

  mondrian!: Mondrian;

  appSettings = {
    mondrianSettings: getMondrianSettings(),
  };

  brushConfig: BrushPluginState = getBrushConfig();

  gui!: GUI;

  guiAutoCtrl!: Controller;

  msg = "welcome.";

  msgCtrl!: Controller;

  autoDrawController: AutoDrawController;

  stageOptions = { width: 500, height: 400 };

  constructor() {
    this.resetGlobalStyle();

    this.$div = document.createElement("div");
    document.body.appendChild(this.$div);

    // do nothing when set fullscreen, mondrian will do the job
    if (this.appSettings.mondrianSettings.fullscreen) {
      // do nothing
    } else {
      this.$div.style.width = `${this.stageOptions.width}px`;
      this.$div.style.height = `${this.stageOptions.height}px`;
    }

    if (!this.appSettings.mondrianSettings.useBuiltinClient) {
      // this.appSettings.mondrianSettings.client = new CustomizedDataClient();
    }

    // create mondrian instance
    this.mondrian = new Mondrian({
      ...this.appSettings.mondrianSettings,
      container: this.$div,
      builtintClientUrl: "ws://localhost:3000",
    });
    console.log(this.appSettings.mondrianSettings);

    // listen data recovered event
    this.mondrian.on(
      MondrianEvents.EVNET_RECOVER_RECEIVED,
      ({ size }: { size: number }) => {
        this.logMsg(`data size: ${size}`);
        this.initialBrush();
      }
    );

    this.autoDrawController = new AutoDrawController(this.mondrian, this);
    if (!NoGUI) {
      this.initialLilGUI();
    }
  }

  private resetGlobalStyle() {
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
  }

  initialLilGUI() {
    this.gui = new GUI({
      title: "Mondrian",
    });
    this.gui.add(this, "onStart").name("Start");
    this.msgCtrl = this.gui.add(this, "msg").name("Message:");
    this.setupMondrianSettingControls();
    this.setupAppSettingControls();
    this.setupChannelControls();
    // enable stage size pannel when fullscreen is disabled
    if (!this.appSettings.mondrianSettings.fullscreen) {
      this.setupStageControls();
    }
    this.setupAutomationControls();
    this.setupCommandControls();
    this.setupBrushControls();
  }

  private setupMondrianSettingControls() {
    const settingsFolder = this.gui.addFolder("Settings");
    settingsFolder
      .add(this.appSettings.mondrianSettings, "resolution", 1, 3, 1)
      .listen()
      .name("resolution")
      .onFinishChange(this.onMondrianSettingsChange);
    settingsFolder
      .add(
        this.appSettings.mondrianSettings,
        "chunkLimit",
        [100, 500, 1000, 2000, 5000, 10000, 50000]
      )
      .listen()
      .name("chunkLimit")
      .onFinishChange(this.onMondrianSettingsChange);
    settingsFolder
      .add(this.appSettings.mondrianSettings, "isProducer", [true, false])
      .listen()
      .name("isProducer")
      .onFinishChange(this.onMondrianSettingsChange);
    settingsFolder
      .add(this.appSettings.mondrianSettings, "autoStart", [true, false])
      .listen()
      .name("autoStart")
      .onFinishChange(this.onMondrianSettingsChange);
    settingsFolder
      .add(this.appSettings.mondrianSettings, "disableCursor", [true, false])
      .listen()
      .name("disableCursor")
      .onFinishChange(this.onMondrianSettingsChange);
    settingsFolder
      .add(this.appSettings.mondrianSettings, "debug", [true, false])
      .listen()
      .name("debug")
      .onFinishChange(this.onMondrianSettingsChange);
    settingsFolder
      .add(this.appSettings.mondrianSettings, "viewport", [true, false])
      .listen()
      .name("useViewport")
      .onFinishChange(this.onMondrianSettingsChange);
    settingsFolder
      .add(this.appSettings.mondrianSettings, "background", [true, false])
      .listen()
      .name("showBackground")
      .onFinishChange(this.onMondrianSettingsChange);
    settingsFolder
      .add(this.appSettings.mondrianSettings, "fullscreen", [true, false])
      .listen()
      .name("fullscreen")
      .onFinishChange(this.onMondrianSettingsChange);
    settingsFolder
      .add(this.appSettings.mondrianSettings, "historySize")
      .listen()
      .name("histroySize")
      .onFinishChange(this.onMondrianSettingsChange);
  }

  private setupAppSettingControls() {
    const appSettingsFolder = this.gui.addFolder("AppSetting");
  }

  private setupStageControls() {
    const stageFolder = this.gui.addFolder("Stage");
    const onStageOptionsChanged = () => {
      this.$div.style.width = `${+this.stageOptions.width}px`;
      this.$div.style.height = `${+this.stageOptions.height}px`;
      this.mondrian.resize();
      this.mondrian.fitCenter();
    };
    stageFolder
      .add(this.stageOptions, "width")
      .name("width")
      .onChange(onStageOptionsChanged);
    stageFolder
      .add(this.stageOptions, "height")
      .name("height")
      .onChange(onStageOptionsChanged);
  }

  private setupAutomationControls() {
    const automationFolder = this.gui.addFolder("Automation");
    automationFolder
      .add(this.autoDrawController, "autoStepTimeSpan", 10, 1000, 20)
      .name("time per step (ms)");
    this.guiAutoCtrl = automationFolder
      .add(this, "onAutoDrawToggle")
      .name("Start Auto Draw");
  }

  private setupChannelControls() {
    const channelFolder = this.gui.addFolder("Channel");
    // const channelFolder = this.gui.addFolder("Channel").close();
    channelFolder
      .add(this.appSettings.mondrianSettings, "useBuiltinClient", [true, false])
      .listen()
      .name("useBuiltinClient")
      .onFinishChange(this.onMondrianSettingsChange);
    // hide channel settings when builtin client disabled
    if (this.appSettings.mondrianSettings.useBuiltinClient) {
      channelFolder
        .add(this.appSettings.mondrianSettings, "channel")
        .name("Channel Name");
      channelFolder.add(this, "onSwitchChannel").name("Swith Channel");
      channelFolder
        .add(this, "onClearChannelCache")
        .name("Clear Channel Cache");
      channelFolder.add(this, "onResetChannel").name("Reset Channel");
    }
  }

  private setupCommandControls() {
    const commandFolder = this.gui.addFolder("Command");
    commandFolder.add(this, "onUndo").name("Undo");
    commandFolder.add(this, "onRedo").name("Redo");
    commandFolder
      .add(this, "onClear")
      .name("Clear")
      .$widget.setAttribute("data-test-id", "clear");
  }

  private setupBrushControls() {
    const brushFolder = this.gui.addFolder("Brush");
    brushFolder
      .add(this.brushConfig, "brushName", [...MondrianDefaultBrushPluginList])
      .onChange(this.onBrushStateChange)
      .$widget.setAttribute("data-test-id", "brushName");
    brushFolder
      .add(this.brushConfig, "dash", [true, false])
      .onChange(this.onBrushStateChange)
      .$widget.setAttribute("data-test-id", "dash");
    brushFolder
      .add(this.brushConfig, "restrict", [true, false])
      .onChange(this.onBrushStateChange)
      .$widget.setAttribute("data-test-id", "restrict");
    brushFolder
      .add(this.brushConfig, "brushWidth", 1, 50)
      .onChange(this.onBrushStateChange)
      .$widget.setAttribute("data-test-id", "brushWidth");
    brushFolder
      .addColor(this.brushConfig, "brushColor")
      .onChange(this.onBrushStateChange)
      .$widget.setAttribute("data-test-id", "brushColor");
  }

  initialBrush() {
    this.onBrushStateChange();
  }

  private applyBrushChanges() {
    this.mondrian.interaction.emit("state:change", {
      player: {
        brush: this.brushConfig,
      },
    });
  }

  private onMondrianSettingsChange = () => {
    setMondrianSettings(this.appSettings.mondrianSettings);
    window.location.reload();
  };

  private onBrushStateChange = () => {
    setBrushConfig(this.brushConfig);
    this.applyBrushChanges();
  };

  private onUndo() {
    this.mondrian.interaction.emit("command:undo");
  }

  private onRedo() {
    this.mondrian.interaction.emit("command:redo");
  }

  private onClear() {
    this.mondrian.interaction.emit("command:clear");
  }

  private onStart() {
    this.mondrian.start();
  }

  private onAutoDrawToggle() {
    if (this.autoDrawController.isAutoOn) {
      this.guiAutoCtrl.name("Start Auto Draw");
    } else {
      this.guiAutoCtrl.name("Stop Auto Draw");
    }
    this.autoDrawController.toggle();
  }

  private onClearChannelCache() {
    (this.mondrian.dm.client as MondrianBuiltinWsClient).forceClear();
    window.location.reload();
  }

  private onResetChannel() {
    this.appSettings.mondrianSettings.channel = "guest";
    this.onMondrianSettingsChange();
    window.location.reload();
  }

  private async onSwitchChannel() {
    try {
      this.onMondrianSettingsChange();
      window.location.reload();
    } catch (err) {
      this.logMsg("cache fails to save.", true);
    }
  }

  logMsg(str: string, isError = false) {
    this.msg = str;
    if (this.msgCtrl) {
      this.msgCtrl.updateDisplay();
    }
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

window.moApp = new ClientApplication();
