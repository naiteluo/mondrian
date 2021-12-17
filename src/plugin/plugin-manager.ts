import { MondrianRenderer } from "../renderer/renderer";
import { CursorPlugin } from "./cursor-plugin";
import { HistoryPlugin } from "./history-plugin";
import { PencilBrushPlugin, PencilBrushPluginPID } from "./pencil-plugin";
import { IMondrianPlugin, IPluginConfig, MondrianPlugin } from "./plugin";

interface PluginConstructor {
  new (...args: any[]): MondrianPlugin;
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

export class MondrianPluginManager {
  constructor(private _renderer: MondrianRenderer) {}

  private _instancesMap: Map<symbol, MondrianPlugin> = new Map();

  private _instancesList: MondrianPlugin[] = [];

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

  loadPlugin<T extends MondrianPlugin>(type: symbol) {
    let plugin = this._instancesMap.get(type);
    if (!plugin) {
      const config = this.findPluginConfig(type);
      plugin = new config.c(this._renderer);
      this._instancesMap.set(type, plugin);
      this._instancesList.push(plugin);
    }
    return plugin as T;
  }

  unloadPlugin<T extends IMondrianPlugin>(type: symbol) {
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

  interateInstances(cb: (plugin: MondrianPlugin) => void) {
    this.instancesList.forEach((p) => {
      cb(p);
    });
  }
}
