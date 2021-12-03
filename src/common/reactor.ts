import { IData } from "../data-manager";

export interface Reactor {
  reactDragStart(data: IData): void;
  reactDragMove(data: IData): void;
  reactDragEnd(data: IData): void;
  reactStateChange(data: IData): void;
  reactUndo(event: any): void;
  reactRedo(event: any): void;
  reactClick(event: any): void;
  reactInput(event: any): void;
}
