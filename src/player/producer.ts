import { Application, Container, InteractionEvent } from "pixi.js";
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
} from "../data-manager";
import { MondrianPlayer, IMondrianPlayerState } from "./player";

export class MondrianProducer
  extends MondrianPlayer
  implements IMondrianInteractor
{
  private stage: Container;

  constructor(
    id: string,
    private application: Application,
    private dataManager: MondrianDataManager
  ) {
    super();
    this.id = id;
    this.stage = application.stage;
  }

  consume(datas: IMondrianData[]) {
    super.consume(datas);
  }

  onStateChange(state: IMondrianPlayerState) {
    this.dataManager.push([
      { playerID: this.id, type: MondrianDataType.SET_STATE, data: { ...state } },
    ]);
  }

  onDragStart(event: IMondrianMockInteractionEvent): void {
    const { x, y } = event.mock
      ? { x: event.mockX, y: event.mockY }
      : event.data.getLocalPosition(this.stage);
    this.dataManager.push([
      {
        playerID: this.id,
        type: MondrianDataType.INTERACT,
        data: { subType: MondrianInteractType.POINTER_DOWN, x, y },
      },
    ]);
  }
  onDragMove(event: IMondrianMockInteractionEvent): void {
    const { x, y } = event.mock
      ? { x: event.mockX, y: event.mockY }
      : event.data.getLocalPosition(this.stage);
    this.dataManager.push([
      {
        playerID: this.id,
        type: MondrianDataType.INTERACT,
        data: { subType: MondrianInteractType.POINTER_MOVE, x, y },
      },
    ]);
  }
  onDragEnd(event: IMondrianMockInteractionEvent): void {
    const { x, y } = event.mock
      ? { x: event.mockX, y: event.mockY }
      : event.data.getLocalPosition(this.stage);
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
  onClick(event: any): void {}
  onInput(event: any): void {}
}
