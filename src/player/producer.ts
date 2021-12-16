import { Application, Container, InteractionEvent } from "pixi.js";
import {
  IModrianInteractor,
  IModrianMockInteractionEvent,
} from "../common/interactor";
import {
  ModrianDataType,
  IModrianData,
  ModrianDataManager,
  ModrianInteractType,
  ModrianActionType,
} from "../data-manager";
import { ModrianPlayer, IModrianPlayerState } from "./player";

export class ModrianProducer
  extends ModrianPlayer
  implements IModrianInteractor
{
  private stage: Container;

  constructor(
    id: string,
    private application: Application,
    private dataManager: ModrianDataManager
  ) {
    super();
    this.id = id;
    this.stage = application.stage;
  }

  consume(datas: IModrianData[]) {
    super.consume(datas);
  }

  onStateChange(state: IModrianPlayerState) {
    this.dataManager.push([
      { playerID: this.id, type: ModrianDataType.STATE, data: { ...state } },
    ]);
  }

  onDragStart(event: IModrianMockInteractionEvent): void {
    const { x, y } = event.mock
      ? { x: event.mockX, y: event.mockY }
      : event.data.getLocalPosition(this.stage);
    this.dataManager.push([
      {
        playerID: this.id,
        type: ModrianDataType.INTERACT,
        data: { subType: ModrianInteractType.DRAG_START, x, y },
      },
    ]);
  }
  onDragMove(event: IModrianMockInteractionEvent): void {
    const { x, y } = event.mock
      ? { x: event.mockX, y: event.mockY }
      : event.data.getLocalPosition(this.stage);
    this.dataManager.push([
      {
        playerID: this.id,
        type: ModrianDataType.INTERACT,
        data: { subType: ModrianInteractType.DRAG, x, y },
      },
    ]);
  }
  onDragEnd(event: IModrianMockInteractionEvent): void {
    const { x, y } = event.mock
      ? { x: event.mockX, y: event.mockY }
      : event.data.getLocalPosition(this.stage);
    this.dataManager.push([
      {
        playerID: this.id,
        type: ModrianDataType.INTERACT,
        data: { subType: ModrianInteractType.DRAG_END, x, y },
      },
    ]);
  }
  onUndo(event: any): void {
    this.dataManager.push([
      {
        playerID: this.id,
        type: ModrianDataType.ACTION,
        data: { subType: ModrianActionType.UNDO },
      },
    ]);
  }
  onRedo(event: any): void {
    this.dataManager.push([
      {
        playerID: this.id,
        type: ModrianDataType.ACTION,
        data: { subType: ModrianActionType.REDO },
      },
    ]);
  }
  onClick(event: any): void {}
  onInput(event: any): void {}
}
