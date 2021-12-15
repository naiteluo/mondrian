import {
  BrushName,
  BrushPluginState,
  BrushType,
  defaultBrushOptions,
} from "./plugin/brush-plugin";
import { Modrian } from "./modrian";
import * as dat from "dat.gui";

const AUTO_START = true;

class App {
  modrian!: Modrian;
  $div: HTMLElement;
  gui;

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

    this.initialGUI();
    this.initialModrian();
  }

  initialGUI() {
    // create ui
    this.gui = new dat.GUI();
    this.gui.domElement.parentElement.style.zIndex = "1";
    this.gui.domElement.style.transformOrigin = "top right";

    const brushFolder = this.gui.addFolder("Brush");
    brushFolder.open();
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
}

new App();
