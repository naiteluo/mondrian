import { InteractionEvent } from "@pixi/interaction";
import { IModrianPlayerState } from "../player";

export interface IModrianInteractor {
  onStateChange(state: IModrianPlayerState): void;
  onDragStart(event: InteractionEvent): void;
  onDragMove(event: InteractionEvent): void;
  onDragEnd(event: InteractionEvent): void;
  onUndo(event: any): void;
  onRedo(event: any): void;
  onClick(event: any): void;
  onInput(event: any): void;
}
