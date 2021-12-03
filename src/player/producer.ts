import { Application, Container, InteractionEvent } from "pixi.js";
import { Interactor } from "../common/interactor";
import { DataType, IData, DataManager, InteractType } from "../data-manager";
import { Player, PlayerState } from "./player";

export class Producer extends Player implements Interactor {
  private stage: Container;

  constructor(
    private application: Application,
    private dataManager: DataManager
  ) {
    super();
    this.stage = application.stage;
  }

  consume(datas: IData[]) {
    super.consume(datas);
  }

  onStateChange(state: PlayerState) {
    console.log(111, state);
    this.dataManager.push([{ type: DataType.STATE, data: { ...state } }]);
  }

  onDragStart(event: InteractionEvent): void {
    let { x, y } = event.data.getLocalPosition(this.stage);
    this.dataManager.push([
      {
        type: DataType.INTERACT,
        data: { subType: InteractType.DRAG_START, x, y },
      },
    ]);
  }
  onDragMove(event: InteractionEvent): void {
    let { x, y } = event.data.getLocalPosition(this.stage);
    this.dataManager.push([
      {
        type: DataType.INTERACT,
        data: { subType: InteractType.DRAG, x, y },
      },
    ]);
  }
  onDragEnd(event: InteractionEvent): void {
    let { x, y } = event.data.getLocalPosition(this.stage);
    this.dataManager.push([
      {
        type: DataType.INTERACT,
        data: { subType: InteractType.DRAG_END, x, y },
      },
    ]);
  }
  onUndo(event: any): void {}
  onRedo(event: any): void {}
  onClick(event: any): void {}
  onInput(event: any): void {}
}
