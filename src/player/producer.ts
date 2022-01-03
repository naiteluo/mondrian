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
    const { x, y } = this.getXyFromEvent(event);
    this.dataManager.push([
      {
        playerID: this.id,
        type: MondrianDataType.INTERACT,
        data: { subType: MondrianInteractType.POINTER_DOWN, x, y },
      },
    ]);
  }

  onDragMove(event: IMondrianMockInteractionEvent): void {
    const { x, y } = this.getXyFromEvent(event);
    this.dataManager.push([
      {
        playerID: this.id,
        type: MondrianDataType.INTERACT,
        data: { subType: MondrianInteractType.POINTER_MOVE, x, y },
      },
    ]);
  }

  onDragEnd(event: IMondrianMockInteractionEvent): void {
    const { x, y } = this.getXyFromEvent(event);
    this.dataManager.push([
      {
        playerID: this.id,
        type: MondrianDataType.INTERACT,
        data: { subType: MondrianInteractType.POINTER_UP, x, y },
      },
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
