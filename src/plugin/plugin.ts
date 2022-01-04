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

  reactDragStart(data: IMondrianData): boolean {
    return true;
  }

  reactDragMove(data: IMondrianData): boolean {
    return true;
  }

  reactDragEnd(data: IMondrianData): boolean {
    return true;
  }

  reactStateChange(data: IMondrianData): boolean {
    return true;
  }

  reactUndo(event: any): boolean {
    return true;
  }

  reactRedo(event: any): boolean {
    return true;
  }

  reactClear(event: any): boolean {
    return true;
  }

  reactClick(event: any): boolean {
    return true;
  }

  reactInput(event: any): boolean {
    return true;
  }
}
