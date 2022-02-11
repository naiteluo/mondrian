/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { IMondrianReactor } from "../../common/reactor";
import { IMondrianData } from "../../data-manager";
import { MondrianRenderer } from "../../renderer/renderer";
import { MondrianShared } from "../../shared";
import { MondrianPluginManager } from "../plugin-manager";

export enum PluginType {
  Global = 0,
  /**
   * clear all activated plugin and load
   */
  ConsumerExcludesive = 1,
  /**
   * record last activated plugin and load,
   * unload and replace self with last activated plugin
   */
  ConsumerTemp = 2,
}

export abstract class AbstractMondrianPlugin {
  static Type: PluginType;

  static PID: symbol;

  static predicate(data: IMondrianData | null, shared?: MondrianShared) {
    return false;
  }
}

export interface IMondrianPluginConstructor {
  new (
    renderer: MondrianRenderer,
    shared: MondrianShared,
    manager: MondrianPluginManager,
    ...args: unknown[]
  ): MondrianPlugin;

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

  constructor(
    protected readonly renderer: MondrianRenderer,
    protected readonly shared: MondrianShared,
    protected manager: MondrianPluginManager
  ) {}

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

  reactUndo(event: unknown): boolean {
    return true;
  }

  reactRedo(event: unknown): boolean {
    return true;
  }

  reactKeyDown(data: IMondrianData): boolean {
    return true;
  }

  reactKeyUp(data: IMondrianData): boolean {
    return true;
  }

  reactClear(event: unknown): boolean {
    return true;
  }

  reactClick(event: unknown): boolean {
    return true;
  }

  reactInput(event: unknown): boolean {
    return true;
  }
}
