import { ModrianRenderer } from "../renderer/renderer";
import { CursorPlugin } from "./cursor-plugin";
import { HistoryPlugin } from "./history-plugin";
import { PencilBrushPlugin, PencilBrushPluginPID } from "./pencil-plugin";
import { IModrianPlugin, IPluginConfig, ModrianPlugin } from "./plugin";

interface PluginConstructor {
  new (...args: any[]): ModrianPlugin;
}

export interface IPluginRegisterConfig {
  pid: symbol;
  matcher: (ptype: string) => boolean;
  c: PluginConstructor;
}

const PluginList: IPluginRegisterConfig[] = [
  {
    pid: PencilBrushPlugin.PID,
    matcher: () => {
      return true;
    },
    c: PencilBrushPlugin,
  },
  {
    pid: CursorPlugin.PID,
    matcher: () => {
      return true;
    },
    c: CursorPlugin,
  },
  {
    pid: HistoryPlugin.PID,
    matcher: () => {
      return true;
    },
    c: HistoryPlugin,
  },
];

export class ModrianPluginManager {
  constructor(private _renderer: ModrianRenderer) {}

  private _instancesMap: Map<symbol, ModrianPlugin> = new Map();

  private _instancesList: ModrianPlugin[] = [];

  private findPluginConfig(type: symbol): IPluginRegisterConfig {
    const config = PluginList.find((v) => {
      return v.pid === type;
    });
    if (!config)
      throw new Error(
        "Fail to find plugin config of: Symbol" + type.description
      );
    return config;
  }

  loadPlugin<T extends ModrianPlugin>(type: symbol) {
    let plugin = this._instancesMap.get(type);
    if (!plugin) {
      const config = this.findPluginConfig(type);
      plugin = new config.c(this._renderer);
      this._instancesMap.set(type, plugin);
      this._instancesList.push(plugin);
    }
    return plugin as T;
  }

  unloadPlugin<T extends IModrianPlugin>(type: symbol) {
    this._instancesMap.delete(type);
    const i = this._instancesList.findIndex((instance) => {
      return instance.PID === type;
    });
    if (i >= 0) {
      this._instancesList.splice(i, 1);
    }
  }

  get instancesList() {
    return this._instancesList;
  }

  interateInstances(cb: (plugin: ModrianPlugin) => void) {
    this.instancesList.forEach((p) => {
      cb(p);
    });
  }
}
