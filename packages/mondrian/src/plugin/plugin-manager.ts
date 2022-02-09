import { IMondrianData } from "../data-manager";
import { MondrianRenderer } from "../renderer/renderer";
import { MondrianShared } from "../shared";
import {
  IMondrianPluginConstructor,
  MondrianPlugin,
  PluginType,
} from "./plugin";
import { CirclePlugin } from "./circle-plugin";
import { ClearPlugin } from "./clear-plugin";
import { CursorPlugin } from "./cursor-plugin";
import { EraserBrushPlugin } from "./eraser-plugin";
import { HighlighterBrushPlugin } from "./highlighter-plugin";
import { HistoryPlugin } from "./history-plugin";
import { PencilBrushPlugin } from "./pencil-plugin";
import { RectanglePlugin } from "./rectangle-plugin";
import { TrianglePlugin } from "./triangle-plugin";
import { StrokePlugin } from "./stroke-plugin";
import { ViewportPlugin } from "./viewport-plugin";
import { RightAngleTrianglePlugin } from "./right-angle-trianle-plugin";

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
    this.register(CirclePlugin);
    this.register(TrianglePlugin);
    this.register(StrokePlugin);
    this.register(ViewportPlugin);
    this.register(RightAngleTrianglePlugin);
  }

  private _instanceRecordMap: {
    [PluginType.Global]: Map<symbol, IMondrianPluginInstanceRecord>;
    [PluginType.ConsumerExcludesive]?: IMondrianPluginInstanceRecord;
  } = {
    [PluginType.Global]: new Map(),
    [PluginType.ConsumerExcludesive]: undefined,
  };

  private _suspendedInstanceRecord?: IMondrianPluginInstanceRecord;

  private _pluginClassRefList: IMondrianPluginConstructor[] = [];

  // todo #12 if priority do matters, replace array with link list
  private _instanceRecordList: IMondrianPluginInstanceRecord[] = [];

  load(pluginClassRef: IMondrianPluginConstructor) {
    // clear excludesive plugin before loading
    if (
      pluginClassRef.Type === PluginType.ConsumerExcludesive ||
      pluginClassRef.Type === PluginType.ConsumerTemp
    ) {
      const record = this._instanceRecordMap[PluginType.ConsumerExcludesive];
      if (record) {
        const i = this._instanceRecordList.findIndex((instanceRecord) => {
          return instanceRecord.classRef === record.classRef;
        });
        const [removed] = this._instanceRecordList.splice(i, 1);
        this._instanceRecordMap[PluginType.ConsumerExcludesive] = undefined;
        if (pluginClassRef.Type === PluginType.ConsumerTemp) {
          this._suspendedInstanceRecord = removed;
        }
      }
    }
    const instance = new pluginClassRef(this._renderer, this.shared, this);
    const instanceRecord = {
      classRef: pluginClassRef,
      instance: instance,
    };
    this._instanceRecordList.push(instanceRecord);
    if (
      pluginClassRef.Type === PluginType.ConsumerExcludesive ||
      pluginClassRef.Type === PluginType.ConsumerTemp
    ) {
      this._instanceRecordMap[PluginType.ConsumerExcludesive] = instanceRecord;
    } else {
      this._instanceRecordMap[pluginClassRef.Type].set(
        pluginClassRef.PID,
        instanceRecord
      );
    }
  }

  restore() {
    if (this._suspendedInstanceRecord) {
      const current = this._instanceRecordMap[PluginType.ConsumerExcludesive];
      if (current) {
        const i = this._instanceRecordList.findIndex((instanceRecord) => {
          return instanceRecord.classRef === current.classRef;
        });
        this._instanceRecordList.splice(i, 1, this._suspendedInstanceRecord);
        this._instanceRecordMap[PluginType.ConsumerExcludesive] =
          this._suspendedInstanceRecord;
        this._suspendedInstanceRecord = undefined;
      }
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
    try {
      this._pluginClassRefList
        .filter((ref) => {
          return ref.predicate(data, this.shared);
        })
        .forEach((ref) => {
          this.load(ref);
        });
    } catch (error) {
      console.log(error);
      alert("todo: handle dirty data. Temporarily, try to clear channel data.");
    }
  }
}
