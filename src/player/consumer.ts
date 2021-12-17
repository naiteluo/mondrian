import {
  MondrianDataType,
  IMondrianData,
  MondrianInteractType,
  MondrianActionType,
} from "../data-manager";
import { MondrianRenderer } from "../renderer/renderer";
import { MondrianPlayer } from "./player";
import { MondrianPluginManager } from "../plugin/plugin-manager";
import { PencilBrushPlugin } from "../plugin/pencil-plugin";
import { CursorPlugin } from "../plugin/cursor-plugin";
import { HistoryPlugin } from "../plugin/history-plugin";

export class MondrianConsumer extends MondrianPlayer {
  private pluginManager: MondrianPluginManager;

  constructor(id: string, private renderer: MondrianRenderer) {
    super();
    this.id = id;
    this.pluginManager = new MondrianPluginManager(this.renderer);
    this.pluginManager.loadPlugin(CursorPlugin.PID);
    this.pluginManager.loadPlugin(HistoryPlugin.PID);
  }

  consume(datas: IMondrianData[]) {
    datas.forEach((data) => {
      if (data.type === MondrianDataType.STATE) {
        this.pluginManager.loadPlugin(PencilBrushPlugin.PID);
        this.pluginManager.interateInstances((plugin) => {
          plugin.reactStateChange(data);
        });
        return;
      }
      if (data.type === MondrianDataType.INTERACT) {
        const subType = data.data.subType;
        this.pluginManager.interateInstances((plugin) => {
          switch (subType) {
            case MondrianInteractType.DRAG_START:
              plugin.reactDragStart(data);
              break;
            case MondrianInteractType.DRAG:
              plugin.reactDragMove(data);
              break;
            case MondrianInteractType.DRAG_END:
              plugin.reactDragEnd(data);
              break;
            default:
              break;
          }
        });
      }
      if (data.type === MondrianDataType.ACTION) {
        const subType = data.data.subType;
        this.pluginManager.interateInstances((plugin) => {
          switch (subType) {
            case MondrianActionType.UNDO:
              plugin.reactUndo(undefined);
              break;
            case MondrianActionType.REDO:
              plugin.reactRedo(undefined);
              break;
            default:
              break;
          }
        });
      }
    });
  }
}
