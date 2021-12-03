import { Application } from "@pixi/app";
import { IRendererPlugins } from "@pixi/core";
import { Container } from "@pixi/display";
import { InteractionEvent } from "@pixi/interaction";
import { Interactor } from "./common/interactor";
import { EventEmitter } from "./common/event-emitter";
import { DataType, IData, InteractType } from "./data-manager";
import { PlayerState } from "./player/player";

export class EventProxier extends EventEmitter {
  private stage: Container;
  private interaction: IRendererPlugins;

  constructor(
    private application: Application,
    private consumers: Interactor[]
  ) {
    super();
    this.stage = application.stage;
    this.stage.interactive = true;
    // @ts-ignore
    window.appp = application;
    this.interaction = application.renderer.plugins.interaction;
    this.interaction.on("pointerdown", this.onDragStart);
    this.interaction.on("pointermove", this.onDragMove);
    this.interaction.on("pointerup", this.onDragEnd);

    this.on("player:state:change", this.onStateChange);
    this.on("play:action:undo", this.onUndo);
    this.on("play:action:redo", this.onRedo);
  }

  addTarget(target: Interactor) {
    if (this.consumers.indexOf(target)) {
      this.consumers.push(target);
    }
  }

  removeTarget(target: Interactor) {}

  private onStateChange = (state: PlayerState) => {
    this.consumers.forEach((t) => {
      t.consume([{ type: DataType.STATE, data: { ...state } }]);
    });
  };

  private onUndo = () => {};

  private onRedo = () => {};

  private onDragStart = (event: InteractionEvent) => {
    let { x, y } = event.data.getLocalPosition(this.stage);
    this.iterateConsumersAndConsume([
      {
        type: DataType.INTERACT,
        data: { subType: InteractType.DRAG_START, x, y },
      },
    ]);
  };

  private onDragMove = (event: InteractionEvent) => {
    let { x, y } = event.data.getLocalPosition(this.stage);
    this.iterateConsumersAndConsume([
      {
        type: DataType.INTERACT,
        data: { subType: InteractType.DRAG, x, y },
      },
    ]);
  };
  private onDragEnd = (event: InteractionEvent) => {
    let { x, y } = event.data.getLocalPosition(this.stage);
    this.iterateConsumersAndConsume([
      {
        type: DataType.INTERACT,
        data: { subType: InteractType.DRAG_END, x, y },
      },
    ]);
  };

  private iterateConsumersAndConsume(datas: IData[]) {
    this.consumers.forEach((t) => {
      t.consume(datas);
    });
  }

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
    this.consumers = undefined;
  }
}
