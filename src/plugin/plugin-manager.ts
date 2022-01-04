import { IMondrianData } from "../data-manager";
import { MondrianRenderer } from "../renderer/renderer";
import { MondrianShared } from "../shared";
import { ClearPlugin } from "./clear-plugin";
import { CursorPlugin } from "./cursor-plugin";
import { EraserBrushPlugin } from "./eraser-plugin";
import { HighlighterBrushPlugin } from "./highlighter-plugin";
import { HistoryPlugin } from "./history-plugin";
import { PencilBrushPlugin } from "./pencil-plugin";
import {
  IMondrianPluginConstructor,
  MondrianPlugin,
  PluginType,
} from "./plugin";
import { RectanglePlugin } from "./rectangle-plugin";

interface IMondrianPluginInstanceRecord {
  classRef: IMondrianPluginConstructor;
  instance: MondrianPlugin;
}

export class MondrianPluginManager {
  constructor(
    private _renderer: MondrianRenderer,
    private shared: MondrianShared
  ) {
    this.register(HistoryPlugin);
    this.register(ClearPlugin);
    this.register(CursorPlugin);
    this.register(PencilBrushPlugin);
    this.register(EraserBrushPlugin);
    this.register(HighlighterBrushPlugin);
    this.register(RectanglePlugin);
  }

  private _instanceRecordMap: {
    [PluginType.Global]: Map<symbol, IMondrianPluginInstanceRecord>;
    [PluginType.ConsumerExcludesive]?: IMondrianPluginInstanceRecord;
  } = {
    [PluginType.Global]: new Map(),
    [PluginType.ConsumerExcludesive]: null,
  };

  private _pluginClassRefList: IMondrianPluginConstructor[] = [];

  // todo if priority do matters, replace array with link list
  private _instanceRecordList: IMondrianPluginInstanceRecord[] = [];

  load(pluginClassRef: IMondrianPluginConstructor) {
    // clear excludesive plugin before loading
    if (pluginClassRef.Type === PluginType.ConsumerExcludesive) {
      if (this._instanceRecordMap[PluginType.ConsumerExcludesive]) {
        const i = this._instanceRecordList.findIndex((instanceRecord) => {
          return (
            instanceRecord.classRef ===
            this._instanceRecordMap[PluginType.ConsumerExcludesive].classRef
          );
        });
        if (i >= 0) {
          this._instanceRecordList.splice(i, 1);
        }
        this._instanceRecordMap[PluginType.ConsumerExcludesive] = null;
      }
    }
    const instance = new pluginClassRef(this._renderer);
    const instanceRecord = {
      classRef: pluginClassRef,
      instance: instance,
    };
    this._instanceRecordList.push(instanceRecord);
    if (pluginClassRef.Type === PluginType.ConsumerExcludesive) {
      this._instanceRecordMap[PluginType.ConsumerExcludesive] = instanceRecord;
    } else {
      this._instanceRecordMap[pluginClassRef.Type].set(
        pluginClassRef.PID,
        instanceRecord
      );
    }
  }

  interateInstances(cb: (plugin: MondrianPlugin) => void) {
    this._instanceRecordList.forEach((p) => {
      cb(p.instance);
    });
  }

  register(pluginClassRef: IMondrianPluginConstructor) {
    if (this._pluginClassRefList.includes(pluginClassRef)) {
      throw new Error("duplicated plugin registered.");
    }
    this._pluginClassRefList.push(pluginClassRef);
  }

  predicateAndLoad(data: IMondrianData | null) {
    this._pluginClassRefList
      .filter((ref) => {
        return ref.predicate(data, this.shared);
      })
      .forEach((ref) => {
        this.load(ref);
      });
  }
}
