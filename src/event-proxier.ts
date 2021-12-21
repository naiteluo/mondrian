import { Application } from "@pixi/app";
import { IRendererPlugins } from "@pixi/core";
import { Container } from "@pixi/display";
import { InteractionEvent } from "@pixi/interaction";
import {
  IMondrianInteractor,
  IMondrianMockInteractionEvent,
} from "./common/interactor";
import { MondrianEventEmitter } from "./common/event-emitter";
import { IMondrianPlayerState } from "./player/player";
import { MondrianShared } from "./shared";
import { MondrianPlayerManager } from "./player";
import { IMondrianStateData } from "data-manager";

export class MondrianEventProxier extends MondrianEventEmitter {
  private get interaction() {
    return this.shared.pixiApp.renderer.plugins.interaction;
  }

  private get interactor() {
    return this.playerManager.producer;
  }

  private get stage() {
    return this.shared.pixiApp.stage;
  }

  constructor(
    private playerManager: MondrianPlayerManager,
    private shared: MondrianShared
  ) {
    super();
  }

  public start() {
    this.startSelfEventWatch();
    this.startPixiEventWatch();
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
    this.on("player:interaction:pointerdown", this.onDragStart);
    this.on("player:interaction:pointermove", this.onDragMove);
    this.on("player:interaction:pointerup", this.onDragEnd);
    this.on("player:state:change", this.onStateChange);
    this.on("player:action:undo", this.onUndo);
    this.on("player:action:redo", this.onRedo);
  }

  public stopSelfEventWatch() {
    this.off("player:interaction:pointerdown", this.onDragStart);
    this.off("player:interaction:pointermove", this.onDragMove);
    this.off("player:interaction:pointerup", this.onDragEnd);
    this.off("player:state:change", this.onStateChange);
    this.off("play:action:undo", this.onUndo);
    this.off("play:action:redo", this.onRedo);
  }

  public destroy() {
    this.stop();
  }

  private onStateChange = (state: IMondrianPlayerState) => {
    this.interactor.onStateChange(state);
  };

  private onUndo = (event: IMondrianStateData) => {
    this.interactor.onUndo(event);
  };

  private onRedo = (event: IMondrianStateData) => {
    this.interactor.onRedo(event);
  };

  private onDragStart = (event: IMondrianMockInteractionEvent) => {
    this.interactor.onDragStart(event);
  };

  private onDragMove = (event: IMondrianMockInteractionEvent) => {
    this.interactor.onDragMove(event);
  };
  private onDragEnd = (event: IMondrianMockInteractionEvent) => {
    this.interactor.onDragEnd(event);
  };
}
