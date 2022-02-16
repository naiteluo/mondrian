import { InteractionEvent } from "@pixi/interaction";
import { IMondrianState } from "../data-manager";

export interface IMondrianMockInteractionEvent extends InteractionEvent {
  mock?: boolean;
  mockX: number;
  mockY: number;
}

export interface IMondrianInteractor {
  onStateChange(states: IMondrianState): void;
  onDragStart(event: IMondrianMockInteractionEvent): void;
  onDragMove(event: IMondrianMockInteractionEvent): void;
  onDragEnd(event: IMondrianMockInteractionEvent): void;
  onUndo(event: unknown): void;
  onRedo(event: unknown): void;
  onClear(event: unknown): void;

  onKeyDown(event: unknown): void;
  onKeyUp(event: unknown): void;

  onClick(event: unknown): void;
  onInput(event: unknown): void;
  onFocus(event: unknown): void;
  onBlur(event: unknown): void;
}
