import { InteractionEvent } from "@pixi/interaction";
import { IMondrianPlayerState } from "../player";

export type IMondrianMockInteractionEvent = InteractionEvent & {
  mock?: boolean;
  mockX: number;
  mockY: number;
};

export interface IMondrianInteractor {
  onStateChange(state: IMondrianPlayerState): void;
  onDragStart(event: IMondrianMockInteractionEvent): void;
  onDragMove(event: IMondrianMockInteractionEvent): void;
  onDragEnd(event: IMondrianMockInteractionEvent): void;
  onUndo(event: any): void;
  onRedo(event: any): void;
  onClick(event: any): void;
  onInput(event: any): void;
}
