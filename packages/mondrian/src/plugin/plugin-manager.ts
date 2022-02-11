import { IMondrianData } from "../data-manager";
import { MondrianRenderer } from "../renderer/renderer";
import { MondrianShared } from "../shared";
import { IMondrianPluginConstructor, MondrianPlugin, PluginType } from "./base";

/**
 * import global plugins
 */
import { CursorPlugin } from "./global/cursor.plugin";
import { ViewportPlugin } from "./global/viewport.plugin";
/**
 * import commands plugins
 */
import { ClearPlugin } from "./commands/clear.plugin";
import { HistoryPlugin } from "./commands/history.plugin";
/**
 * import shapes plugins
 */
import { RectanglePlugin } from "./shapes/rectangle-plugin";
import { StrokePlugin } from "./shapes/stroke-plugin";
import { CirclePlugin } from "./shapes/circle.plugin";
import { TrianglePlugin } from "./shapes/triangle.plugin";
import { RightAngleTrianglePlugin } from "./shapes/right-angle-trianle.plugin";
import { ParallelogramPlugin } from "./shapes/parallelogram.plugin";
import { RightAngleTrapezoidPlugin } from "./shapes/right-angle-trapezoid.plugin";
import { TrapezoidPlugin } from "./shapes/trapezoid.plugin";
import { SemiCirclePlugin } from "./shapes/semi-circle.plugin";
import { CuboidPlugin } from "./shapes/cuboid.plugin";
import { CubePlugin } from "./shapes/cube.plugin";
import { SpherePlugin } from "./shapes/sphere.plugin";
import { CylinderPlugin } from "./shapes/cylinder.plugin";
import { ConePlugin } from "./shapes/cone.plugin";
/**
 * import brushwork plugins
 */
import { EraserBrushPlugin } from "./brushworks/eraser.plugin";
import { HighlighterBrushPlugin } from "./brushworks/highlighter.plugin";
import { PencilBrushPlugin } from "./brushworks/pencil.plugin";

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
    this.register(ParallelogramPlugin);
    this.register(RightAngleTrapezoidPlugin);
    this.register(TrapezoidPlugin);
    this.register(SemiCirclePlugin);
    this.register(CubePlugin);
    this.register(CuboidPlugin);
    this.register(SpherePlugin);
    this.register(CylinderPlugin);
    this.register(ConePlugin);
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
