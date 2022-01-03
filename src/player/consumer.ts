import {
  MondrianDataType,
  IMondrianData,
  MondrianInteractType,
  MondrianActionType,
  IMondrianInteractData,
  IMondrianStateData,
} from "../data-manager";
import { MondrianRenderer } from "../renderer/renderer";
import { MondrianPlayer } from "./player";
import { MondrianPluginManager } from "../plugin/plugin-manager";
import { PencilBrushPlugin } from "../plugin/pencil-plugin";
import { CursorPlugin } from "../plugin/cursor-plugin";
import { HistoryPlugin } from "../plugin/history-plugin";
import { MondrianShared } from "../shared";
import { EraserBrushPlugin } from "../plugin/eraser-plugin";
import { IMondrianPlayerState } from ".";
import { BrushName } from "../plugin/brush-plugin";
import { HighlighterBrushPlugin } from "../plugin/highlighter-plugin";

export class MondrianConsumer extends MondrianPlayer {
  private pluginManager: MondrianPluginManager;

  constructor(
    id: string,
    private renderer: MondrianRenderer,
    private shared: MondrianShared
  ) {
    super();
    this.id = id;
    this.pluginManager = new MondrianPluginManager(this.renderer);
    if (!this.shared.settings.disableCursor) {
      this.pluginManager.loadPlugin(CursorPlugin.PID);
    }
    this.pluginManager.loadPlugin(HistoryPlugin.PID);
  }

  consume(datas: IMondrianData[]) {
    datas.forEach((data) => {
      // todo: need refactor, plugin load and datas dispatch logic here is confusing.

      if (data.type === MondrianDataType.COMMAND) {
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

      if (data.type === MondrianDataType.SET_STATE) {
        this.__delete_this_method_later_removeAllBrushPlugin();
        const brushType = (data as IMondrianStateData).data.player.brush
          .brushName;
        if (brushType === BrushName.PENCIL) {
          this.pluginManager.loadPlugin(PencilBrushPlugin.PID);
        }
        if (brushType === BrushName.Eraser) {
          this.pluginManager.loadPlugin(EraserBrushPlugin.PID);
        }
        if (brushType === BrushName.Highlighter) {
          this.pluginManager.loadPlugin(HighlighterBrushPlugin.PID);
        }
        this.pluginManager.interateInstances((plugin) => {
          plugin.reactStateChange(data);
        });
        return;
      }

      if (data.type === MondrianDataType.INTERACT) {
        const subType = data.data.subType;
        this.dataXyToLeftTop(data);
        this.pluginManager.interateInstances((plugin) => {
          switch (subType) {
            case MondrianInteractType.POINTER_DOWN:
              plugin.reactDragStart(data);
              break;
            case MondrianInteractType.POINTER_MOVE:
              plugin.reactDragMove(data);
              break;
            case MondrianInteractType.POINTER_UP:
              plugin.reactDragEnd(data);
              break;
            default:
              break;
          }
        });
        return;
      }
    });
  }

  // todo move this coord operation together for flexibility
  // warning:  override the origin data
  private dataXyToLeftTop(data: IMondrianInteractData) {
    const { width, height } = this.renderer.pixiApp.screen;
    data.data.x = width / 2 + data.data.x;
    data.data.y = height / 2 + data.data.y;
  }

  private __delete_this_method_later_removeAllBrushPlugin() {
    this.pluginManager.unloadPlugin(PencilBrushPlugin.PID);
    this.pluginManager.unloadPlugin(EraserBrushPlugin.PID);
    this.pluginManager.unloadPlugin(HighlighterBrushPlugin.PID);
  }
}
