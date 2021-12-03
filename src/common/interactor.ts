import { InteractionEvent } from "@pixi/interaction";

export interface Interactor {
  onDragStart(event: InteractionEvent): void;
  onDragMove(event: InteractionEvent): void;
  onDragEnd(event: InteractionEvent): void;
  onStateChange(event: InteractionEvent): void;
  onUndo(event: any): void;
  onRedo(event: any): void;
  onClick(event: any): void;
  onInput(event: any): void;
}
