import { IMondrianData } from "../data-manager";

export interface IMondrianReactor {
  reactDragStart(data: IMondrianData): void;
  reactDragMove(data: IMondrianData): void;
  reactDragEnd(data: IMondrianData): void;
  reactStateChange(data: IMondrianData): void;
  reactUndo(event: any): void;
  reactRedo(event: any): void;
  reactClear(event: any): void;
  reactClick(event: any): void;
  reactInput(event: any): void;
}
