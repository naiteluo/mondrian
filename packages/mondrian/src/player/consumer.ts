import {
  MondrianDataType,
  IMondrianData,
  MondrianDataSubType,
  IMondrianInteractData,
} from "../data-manager";
import { MondrianRenderer } from "../renderer/renderer";
import { MondrianPlayer } from "./player";
import { MondrianPluginManager } from "../plugin/plugin-manager";
import { MondrianShared } from "../shared";

export class MondrianConsumer extends MondrianPlayer {
  private pluginManager: MondrianPluginManager;

  constructor(
    id: string,
    private renderer: MondrianRenderer,
    private shared: MondrianShared
  ) {
    super();
    this.id = id;
    this.pluginManager = new MondrianPluginManager(this.renderer, this.shared);
    /**
     * load global plugins
     */
    this.pluginManager.predicateAndLoad(null);
  }

  override consume(datas: IMondrianData[]) {
    datas.forEach((data) => {
      /**
       * predicate plugin to be load
       * and load plugin
       */
      if (data.type === MondrianDataType.SET_STATE) {
        this.pluginManager.predicateAndLoad(data);
        this.pluginManager.interateInstances((plugin) => {
          plugin.reactStateChange(data);
        });
        return;
      }

      /**
       * handle COMMAND
       * pass data to current loaded plugins
       */
      if (data.type === MondrianDataType.COMMAND) {
        const subType = data.data.subType;
        this.pluginManager.interateInstances((plugin) => {
          switch (subType) {
            case MondrianDataSubType.UNDO:
              plugin.reactUndo(undefined);
              break;
            case MondrianDataSubType.REDO:
              plugin.reactRedo(undefined);
              break;
            case MondrianDataSubType.CLEAR:
              plugin.reactClear(undefined);
              break;
            default:
              break;
          }
        });
        return;
      }

      /**
       * handle INTERACT
       * pass data to current loaded plugins
       */
      if (data.type === MondrianDataType.INTERACT) {
        const subType = data.data.subType;
        this.dataXyToLeftTop(data);
        if (data.data.subType === MondrianDataSubType.KEY_DOWN) {
          this.pluginManager.predicateAndLoad(data);
        }
        this.pluginManager.interateInstances((plugin) => {
          switch (subType) {
            case MondrianDataSubType.KEY_DOWN:
              plugin.reactKeyDown(data);
              break;
            case MondrianDataSubType.KEY_UP:
              plugin.reactKeyUp(data);
              break;
            case MondrianDataSubType.POINTER_DOWN:
              plugin.reactDragStart(data);
              break;
            case MondrianDataSubType.POINTER_MOVE:
              plugin.reactDragMove(data);
              break;
            case MondrianDataSubType.POINTER_UP:
              plugin.reactDragEnd(data);
              break;
            case MondrianDataSubType.INPUT:
              plugin.reactInput(data);
              break;
            case MondrianDataSubType.FOCUS:
              plugin.reactFocus(data);
              break;
            case MondrianDataSubType.BLUR:
              plugin.reactBlur(data);
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
    data.data.x = this.renderer.worldRect.width / 2 + data.data.x;
    data.data.y = this.renderer.worldRect.height / 2 + data.data.y;

    if (this.shared.settings.debug) {
      this.shared.logXY(data.data.x, data.data.y);
    }
  }
}
