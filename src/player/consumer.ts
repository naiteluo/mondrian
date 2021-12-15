import { DataType, IData, InteractType } from "../data-manager";
import { ModrianRenderer } from "../renderer/modrian-renderer";
import { Player } from "./player";
import { PluginManager } from "../plugin/plugin-manager";
import { PencilBrushPlugin } from "../plugin/pencil-plugin";
import { CursorPlugin } from "../plugin/cursor-plugin";

export class Consumer extends Player {
  private pluginManager: PluginManager;

  constructor(id: string, private renderer: ModrianRenderer) {
    super();
    this.id = id;
    this.pluginManager = new PluginManager(this.renderer);
    this.pluginManager.loadPlugin(CursorPlugin.PID);
  }

  consume(datas: IData[]) {
    datas.forEach((data) => {
      if (data.type === DataType.STATE) {
        this.pluginManager.loadPlugin(PencilBrushPlugin.PID);
        this.pluginManager.interateInstances((plugin) => {
          plugin.reactStateChange(data);
        });
        return;
      }
      if (data.type === DataType.INTERACT) {
        const subType = data.data.subType;
        this.pluginManager.interateInstances((plugin) => {
          switch (subType) {
            case InteractType.DRAG_START:
              plugin.reactDragStart(data);
              break;
            case InteractType.DRAG:
              plugin.reactDragMove(data);
              break;
            case InteractType.DRAG_END:
              plugin.reactDragEnd(data);
              break;
            default:
              break;
          }
        });
      }
    });
  }
}
