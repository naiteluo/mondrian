import { IMondrianData } from "../data-manager";

export interface IMondrianReactor {
  reactDragStart(data: IMondrianData): boolean;
  reactDragMove(data: IMondrianData): boolean;
  reactDragEnd(data: IMondrianData): boolean;
  reactStateChange(data: IMondrianData): boolean;
  reactUndo(event: unknown): boolean;
  reactRedo(event: unknown): boolean;
  reactClear(event: unknown): boolean;
  reactKeyDown(event: IMondrianData): boolean;
  reactKeyUp(event: IMondrianData): boolean;
  reactClick(event: unknown): boolean;
  reactInput(event: unknown): boolean;
}
