import { IMondrianData } from "../data-manager";

export interface IMondrianReactor {
  reactDragStart(data: IMondrianData): boolean;
  reactDragMove(data: IMondrianData): boolean;
  reactDragEnd(data: IMondrianData): boolean;
  reactStateChange(data: IMondrianData): boolean;
  reactUndo(event: any): boolean;
  reactRedo(event: any): boolean;
  reactClear(event: any): boolean;
  reactClick(event: any): boolean;
  reactInput(event: any): boolean;
}
