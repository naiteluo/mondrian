/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { IMondrianReactor } from "../common/reactor";
import { IMondrianData } from "../data-manager";
import { MondrianRenderer } from "../renderer/renderer";
import { MondrianShared } from "../shared";

export enum PluginType {
  Global = 0,
  ConsumerExcludesive = 1,
}

export abstract class AbstractMondrianPlugin {
  static Type: PluginType;

  static PID: symbol;

  static predicate(data: IMondrianData | null, shared?: MondrianShared) {
    return false;
  }
}

export interface IMondrianPluginConstructor {
  new (renderer: MondrianRenderer, ...args: unknown[]): MondrianPlugin;

  /**
   * static members
   */
  Type: PluginType;
  PID: symbol;
  predicate(data: IMondrianData | null, shared?: MondrianShared): boolean;
}

export class MondrianPlugin
  implements AbstractMondrianPlugin, IMondrianReactor
{
  static PID = Symbol("plugin");

  static predicate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: IMondrianData | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shared?: MondrianShared
  ): boolean {
    throw new Error("Base Plugin Class can't be registered to plugin list.");
  }

  constructor(private _renderer: MondrianRenderer) {}

  get renderer() {
    return this._renderer;
  }

  reactDragStart(data: IMondrianData): void {}

  reactDragMove(data: IMondrianData): void {}

  reactDragEnd(data: IMondrianData): void {}

  reactStateChange(data: IMondrianData): void {}

  reactUndo(event: any): void {}

  reactRedo(event: any): void {}

  reactClear(event: any): void {}

  reactClick(event: any): void {}

  reactInput(event: any): void {}
}
