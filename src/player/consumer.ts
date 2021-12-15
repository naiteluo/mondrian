import {
  ModrianDataType,
  IModrianData,
  ModrianInteractType,
} from "../data-manager";
import { ModrianRenderer } from "../renderer/renderer";
import { ModrianPlayer } from "./player";
import { ModrianPluginManager } from "../plugin/plugin-manager";
import { PencilBrushPlugin } from "../plugin/pencil-plugin";
import { CursorPlugin } from "../plugin/cursor-plugin";

export class ModrianConsumer extends ModrianPlayer {
  private pluginManager: ModrianPluginManager;

  constructor(id: string, private renderer: ModrianRenderer) {
    super();
    this.id = id;
    this.pluginManager = new ModrianPluginManager(this.renderer);
    this.pluginManager.loadPlugin(CursorPlugin.PID);
  }

  consume(datas: IModrianData[]) {
    datas.forEach((data) => {
      if (data.type === ModrianDataType.STATE) {
        this.pluginManager.loadPlugin(PencilBrushPlugin.PID);
        this.pluginManager.interateInstances((plugin) => {
          plugin.reactStateChange(data);
        });
        return;
      }
      if (data.type === ModrianDataType.INTERACT) {
        const subType = data.data.subType;
        this.pluginManager.interateInstances((plugin) => {
          switch (subType) {
            case ModrianInteractType.DRAG_START:
              plugin.reactDragStart(data);
              break;
            case ModrianInteractType.DRAG:
              plugin.reactDragMove(data);
              break;
            case ModrianInteractType.DRAG_END:
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
