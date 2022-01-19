import { IMondrianMockInteractionEvent } from "./common/interactor";
import { MondrianEventEmitter } from "./common/event-emitter";
import { MondrianShared } from "./shared";
import { MondrianPlayerManager } from "./player";
import { IMondrianState, IMondrianStateData } from "./data-manager";
import { MondrianRenderer } from "./renderer/renderer";
import { MondrianContainerManager } from "./container-manager";

export class MondrianEventProxier extends MondrianEventEmitter {
  private get interaction() {
    return this.renderer.pixiApp.renderer.plugins.interaction;
  }

  private get interactor() {
    return this.playerManager.producer;
  }

  private get stage() {
    return this.renderer.pixiApp.stage;
  }

  constructor(
    private playerManager: MondrianPlayerManager,
    private renderer: MondrianRenderer,
    private containerManager: MondrianContainerManager,
    private shared: MondrianShared
  ) {
    super();
  }

  public start() {
    this.startSelfEventWatch();
    this.startPixiEventWatch();
    window.addEventListener("resize", this.resizeEventHandler);
  }

  public stop() {
    this.stopSelfEventWatch();
    this.stopPixiEventWatch();
  }

  public startPixiEventWatch() {
    this.stage.interactive = true;
    this.interaction.on("pointerdown", this.onDragStart);
    this.interaction.on("pointermove", this.onDragMove);
    this.interaction.on("pointerup", this.onDragEnd);
  }

  public stopPixiEventWatch() {
    this.stage.interactive = false;
    this.interaction.off("pointerdown", this.onDragStart);
    this.interaction.off("pointermove", this.onDragMove);
    this.interaction.off("pointerup", this.onDragEnd);
  }

  public startSelfEventWatch() {
    // mostly emitted by mock or code manually
    this.on("interaction:pointerdown", this.onDragStart);
    this.on("interaction:pointermove", this.onDragMove);
    this.on("interaction:pointerup", this.onDragEnd);
    this.on("state:change", this.onStateChange);
    this.on("command:undo", this.onUndo);
    this.on("command:redo", this.onRedo);
    this.on("command:clear", this.onClear);

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    // disable browser default pinch zoom behavior
    window.addEventListener("wheel", this.onWheel, {
      passive: false,
    });
  }

  public stopSelfEventWatch() {
    this.off("interaction:pointerdown", this.onDragStart);
    this.off("interaction:pointermove", this.onDragMove);
    this.off("interaction:pointerup", this.onDragEnd);
    this.off("state:change", this.onStateChange);
    this.off("command:undo", this.onUndo);
    this.off("command:redo", this.onRedo);
    this.off("command:clear", this.onClear);

    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("wheel", this.onWheel);
  }

  public destroy() {
    this.stop();
  }

  private onStateChange = (states: IMondrianState) => {
    if (!this.interactor) {
      return;
    }
    this.interactor.onStateChange(states);
  };

  private onUndo = (event: IMondrianStateData) => {
    if (!this.interactor) {
      return;
    }
    this.interactor.onUndo(event);
  };

  private onRedo = (event: IMondrianStateData) => {
    if (!this.interactor) {
      return;
    }
    this.interactor.onRedo(event);
  };

  private onClear = (event: IMondrianStateData) => {
    if (!this.interactor) {
      return;
    }
    this.interactor.onClear(event);
  };

  private onDragStart = (event: IMondrianMockInteractionEvent) => {
    if (!this.interactor) {
      return;
    }
    this.interactor.onDragStart(event);
  };

  private onDragMove = (event: IMondrianMockInteractionEvent) => {
    if (!this.interactor) {
      return;
    }
    this.interactor.onDragMove(event);
  };

  private onDragEnd = (event: IMondrianMockInteractionEvent) => {
    if (!this.interactor) {
      return;
    }
    this.interactor.onDragEnd(event);
  };

  private keyDownMap: { [key: string]: boolean } = {};

  private onKeyDown = (event: KeyboardEvent) => {
    const code = event.code;
    if (!this.keyDownMap[code]) {
      this.interactor.onKeyDown(event);
      this.keyDownMap[code] = true;
    }
  };

  private onKeyUp = (event: KeyboardEvent) => {
    const code = event.code;
    this.interactor.onKeyUp(event);
    delete this.keyDownMap[code];
  };

  private onWheel = (event: MouseEvent) => {
    event.preventDefault();
  };

  private resizeEventHandler = () => {
    this.containerManager.resize();
    this.renderer.resize();
  };

  public resize() {
    this.resizeEventHandler();
  }
}