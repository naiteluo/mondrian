import { InteractionEvent } from "@pixi/interaction";
import { IMondrianState } from "../data-manager";

export type IMondrianMockInteractionEvent = InteractionEvent & {
  mock?: boolean;
  mockX: number;
  mockY: number;
};

export interface IMondrianInteractor {
  onStateChange(states: IMondrianState): void;
  onDragStart(event: IMondrianMockInteractionEvent): void;
  onDragMove(event: IMondrianMockInteractionEvent): void;
  onDragEnd(event: IMondrianMockInteractionEvent): void;
  onUndo(event: any): void;
  onRedo(event: any): void;
  onClear(event: any): void;

  onKeyDown(event: any): void;
  onKeyUp(event: any): void;

  onClick(event: any): void;
  onInput(event: any): void;
}
