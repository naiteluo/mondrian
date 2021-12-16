import { InteractionEvent } from "@pixi/interaction";
import { IModrianPlayerState } from "../player";

export type IModrianMockInteractionEvent = InteractionEvent & {
  mock?: boolean;
  mockX: number;
  mockY: number;
};

export interface IModrianInteractor {
  onStateChange(state: IModrianPlayerState): void;
  onDragStart(event: IModrianMockInteractionEvent): void;
  onDragMove(event: IModrianMockInteractionEvent): void;
  onDragEnd(event: IModrianMockInteractionEvent): void;
  onUndo(event: any): void;
  onRedo(event: any): void;
  onClick(event: any): void;
  onInput(event: any): void;
}
