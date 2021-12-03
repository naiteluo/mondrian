import { InteractionEvent } from "pixi.js";
import { DataManager } from "src/data-manager";
import { IData } from "src/data-manager/data";
import { Player, PlayerState } from "./player";

export class Producer extends Player {
  constructor(private dataManager: DataManager) {
    super();
  }

  consume(datas: IData[]) {
    super.consume(datas);
    this.dataManager.push(datas);
  }

  onDragStart(event: InteractionEvent): void {}
  onDragMove(event: InteractionEvent): void {}
  onDragEnd(event: InteractionEvent): void {}
  onStateChange(event: InteractionEvent): void {}
  onUndo(event: any): void {}
  onRedo(event: any): void {}
  onClick(event: any): void {}
  onInput(event: any): void {}
}
