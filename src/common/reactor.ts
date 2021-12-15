import { IModrianData } from "../data-manager";

export interface IModrianReactor {
  reactDragStart(data: IModrianData): void;
  reactDragMove(data: IModrianData): void;
  reactDragEnd(data: IModrianData): void;
  reactStateChange(data: IModrianData): void;
  reactUndo(event: any): void;
  reactRedo(event: any): void;
  reactClick(event: any): void;
  reactInput(event: any): void;
}
