import { Application } from "@pixi/app";
import { IRendererPlugins } from "@pixi/core";
import { Container } from "@pixi/display";
import { InteractionEvent } from "@pixi/interaction";
import { IInteractor } from "./common/interactor";
import { EventEmitter } from "./common/event-emitter";
import { PlayerState } from "./player/player";

export class EventProxier extends EventEmitter {
  private stage: Container;
  private interaction: IRendererPlugins;

  constructor(
    private application: Application,
    private interactors: IInteractor[]
  ) {
    super();
    this.stage = application.stage;
    this.stage.interactive = true;
    this.interaction = application.renderer.plugins.interaction;
    this.interaction.on("pointerdown", this.onDragStart);
    this.interaction.on("pointermove", this.onDragMove);
    this.interaction.on("pointerup", this.onDragEnd);

    this.on("player:state:change", this.onStateChange);
    this.on("play:action:undo", this.onUndo);
    this.on("play:action:redo", this.onRedo);
  }

  addInteractor(target: IInteractor) {
    if (this.interactors.indexOf(target)) {
      this.interactors.push(target);
    }
  }

  removeInteractor(target: IInteractor) {
    const i = this.interactors.indexOf(target);
    if (i !== -1) {
      this.interactors.splice(i, 1);
    }
  }

  private onStateChange = (state: PlayerState) => {
    this.interactors.forEach((t) => {
      t.onStateChange(state);
    });
  };

  private onUndo = (event: any) => {
    this.interactors.forEach((interactor) => {
      interactor.onUndo(event);
    });
  };

  private onRedo = (event: any) => {
    this.interactors.forEach((interactor) => {
      interactor.onRedo(event);
    });
  };

  private onDragStart = (event: InteractionEvent) => {
    this.interactors.forEach((interactor) => {
      interactor.onDragStart(event);
    });
  };

  private onDragMove = (event: InteractionEvent) => {
    this.interactors.forEach((interactor) => {
      interactor.onDragMove(event);
    });
  };
  private onDragEnd = (event: InteractionEvent) => {
    this.interactors.forEach((interactor) => {
      interactor.onDragEnd(event);
    });
  };

  destroy() {
    this.interaction.off("pointerdown", this.onDragStart);
    this.interaction.off("pointermove", this.onDragMove);
    this.interaction.off("pointerup", this.onDragEnd);

    this.stage.interactive = false;
    this.off("player:state:change", this.onStateChange);
    this.off("play:action:undo", this.onUndo);
    this.off("play:action:redo", this.onRedo);

    this.interaction = undefined;
    this.application = undefined;
    this.interactors = undefined;
  }
}
