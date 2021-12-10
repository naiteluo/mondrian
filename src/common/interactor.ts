import { InteractionEvent } from "@pixi/interaction";
import { PlayerState } from "../player";

export interface IInteractor {
  onStateChange(state: PlayerState): void;
  onDragStart(event: InteractionEvent): void;
  onDragMove(event: InteractionEvent): void;
  onDragEnd(event: InteractionEvent): void;
  onUndo(event: any): void;
  onRedo(event: any): void;
  onClick(event: any): void;
  onInput(event: any): void;
}
