import { Application, Container } from "pixi.js";
import { MondrianShared } from "../shared";
import {
  IMondrianInteractor,
  IMondrianMockInteractionEvent,
} from "../common/interactor";
import {
  MondrianDataType,
  IMondrianData,
  MondrianDataManager,
  MondrianInteractType,
  MondrianActionType,
  IMondrianState,
} from "../data-manager";
import { MondrianPlayer, IMondrianPlayerState } from "./player";
import { MondrianRenderer } from "../renderer/renderer";

export class MondrianProducer
  extends MondrianPlayer
  implements IMondrianInteractor
{
  private get stage() {
    return this.renderer.pixiApp.stage;
  }

  constructor(
    id: string,
    private dataManager: MondrianDataManager,
    private renderer: MondrianRenderer,
    private shared: MondrianShared
  ) {
    super();
    this.id = id;
  }

  consume(datas: IMondrianData[]) {
    super.consume(datas);
  }

  onStateChange(states: IMondrianState) {
    this.dataManager.push([
      {
        playerID: this.id,
        type: MondrianDataType.SET_STATE,
        data: { ...states },
      },
    ]);
  }

  onDragStart(event: IMondrianMockInteractionEvent): void {
    this.dataManager.push([
      this.packEvent(MondrianInteractType.POINTER_DOWN, event),
    ]);
  }

  onDragMove(event: IMondrianMockInteractionEvent): void {
    this.dataManager.push([
      this.packEvent(MondrianInteractType.POINTER_MOVE, event),
    ]);
  }

  onDragEnd(event: IMondrianMockInteractionEvent): void {
    this.dataManager.push([
      this.packEvent(MondrianInteractType.POINTER_UP, event),
    ]);
  }

  onUndo(event: any): void {
    this.dataManager.push([
      {
        playerID: this.id,
        type: MondrianDataType.COMMAND,
        data: { subType: MondrianActionType.UNDO },
      },
    ]);
  }

  onRedo(event: any): void {
    this.dataManager.push([
      {
        playerID: this.id,
        type: MondrianDataType.COMMAND,
        data: { subType: MondrianActionType.REDO },
      },
    ]);
  }

  onClear(event: any): void {
    this.dataManager.push([
      {
        playerID: this.id,
        type: MondrianDataType.COMMAND,
        data: { subType: MondrianActionType.CLEAR },
      },
    ]);
  }

  onClick(event: any): void {
    console.log("implement it");
  }

  onInput(event: any): void {
    console.log("implement it");
  }

  private packEvent(
    subType: MondrianInteractType,
    event: IMondrianMockInteractionEvent
  ): IMondrianData {
    const newEvent: IMondrianData = {
      playerID: this.id,
      type: MondrianDataType.INTERACT,
      data: {
        subType,
        ...this.getXyFromEvent(event),
      },
    };
    if (event?.data?.originalEvent) {
      if (event.data.originalEvent.shiftKey) {
        newEvent.data.shiftKey = event.data.originalEvent.shiftKey;
      }
      if (event.data.originalEvent.altKey) {
        newEvent.data.altKey = event.data.originalEvent.altKey;
      }
      if (event.data.originalEvent.ctrlKey) {
        newEvent.data.ctrlKey = event.data.originalEvent.ctrlKey;
      }
    }
    return newEvent;
  }

  // todo move this coord operation together for flexibility
  // todo event point can reuse
  private getXyFromEvent(event: IMondrianMockInteractionEvent) {
    return this.xyToCenter(
      event.mock
        ? { x: event.mockX, y: event.mockY }
        : event.data.getLocalPosition(this.stage)
    );
  }

  // todo optimize
  private xyToCenter({ x, y }) {
    const { width, height } = this.renderer.pixiApp.screen;
    return {
      x: x - width / 2,
      y: y - height / 2,
    };
  }
}
