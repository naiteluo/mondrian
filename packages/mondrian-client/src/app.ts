import {
  Mondrian,
  BrushPluginState,
  DefaultMondrianBrushOptions,
  MondrianDefaultBrushPluginList,
} from "mondrian/lib/index";
import { Controller, GUI } from "lil-gui";
import { AutoDrawController } from "./auto-draw-controller";
import { getMondrianSettings, setMondrianSettings } from "./utils/app-helper";
import { MondrianBuiltinWsClient } from "../../mondrian/src/builtin-ws-client";
import { CustomizedDataClient } from "./customized-data-client";

export class ClientApplication {
  $div: HTMLElement;

  mondrian!: Mondrian;

  appSettings = {
    mondrianSettings: getMondrianSettings(),
  };

  brushConfig: BrushPluginState = DefaultMondrianBrushOptions;

  gui!: GUI;

  guiAutoCtrl!: Controller;

  msg = "welcome.";

  msgCtrl!: Controller;

  autoDrawController: AutoDrawController;

  constructor() {
    this.resetGlobalStyle();

    this.$div = document.createElement("div");
    document.body.appendChild(this.$div);

    this.$div.style.width = `${window.innerWidth}px`;
    this.$div.style.height = `${window.innerHeight}px`;

    // create mondrian instance
    this.mondrian = new Mondrian({
      ...this.appSettings.mondrianSettings,
      container: this.$div,
      useBuiltinClient: true,
      builtintClientUrl: "ws://localhost:3000",
      // client: new CustomizedDataClient(),
    });

    // listen data recovered event
    this.mondrian.on(
      Mondrian.EVNET_RECOVER_RECEIVED,
      ({ size }: { size: number }) => {
        this.logMsg(`data size: ${size}`);
        this.initialBrush();
      }
    );

    this.autoDrawController = new AutoDrawController(this.mondrian, this);

    this.initialLilGUI();
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
    this.setupSettingControls();
    this.setupChannelControls();
    this.setupAutomationControls();
    this.setupCommandControls();
    this.setupBrushControls();
  }

  private setupSettingControls() {
    const settingsFolder = this.gui.addFolder("Settings").close();
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
    const channelFolder = this.gui.addFolder("Channel").close();
    channelFolder
      .add(this.appSettings.mondrianSettings, "channel")
      .name("Channel Name");
    channelFolder.add(this, "onSwitchChannel").name("Swith Channel");
    channelFolder.add(this, "onClearChannelCache").name("Clear Channel Cache");
    channelFolder.add(this, "onResetChannel").name("Reset Channel");
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
    this.mondrian.interaction.emit("state:change", {
      player: {
        brush: DefaultMondrianBrushOptions,
      },
    });
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
    window.location.reload();
  }

  private async onSwitchChannel() {
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

window.moApp = new ClientApplication();
