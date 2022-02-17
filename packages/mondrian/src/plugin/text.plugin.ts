import {
  IMondrianData,
  IMondrianInteractData,
  IMondrianStateData,
  MondrianDataType,
} from "../data-manager";
import { BrushPlugin } from "./base/brush.plugin";
import { BrushName } from "./base/brush-common";
import { PluginType } from "./base/plugin";
import { TextInput } from "../common/pixi-text-input";

export class TextPlugin extends BrushPlugin {
  private get interaction() {
    return this.renderer.pixiApp.renderer.plugins.interaction;
  }

  static override Type = PluginType.ConsumerExcludesive;

  static override PID = Symbol("text-plugin");

  private hasFocus = false;

  static override predicate(data: IMondrianData | null): boolean {
    if (data === null) return false;
    if (data.type === MondrianDataType.SET_STATE) {
      if (data as IMondrianStateData) {
        if (data.data.player.brush.brushName === BrushName.Text) {
          return true;
        }
      }
    }
    return false;
  }

  override reactDragStart(data: IMondrianInteractData): boolean {
    if (this.hasFocus) {
      return false;
    }
    this.handler = this.renderer.startGraphicsHandler({
      // text cache as bitmap do not work
      canCacheAsBitmap: false,
      lineStyle: this.lineStyle,
    });
    this.handler.lineStyle = this.lineStyle;
    const input = new TextInput({
      input: {
        fontSize: "36px",
        padding: "2px 4px",
        // width: "200px",
        color: "#26272E",
        multiline: true,
      },
      box: {
        default: {
          stroke: { color: 0xcbaaaa, width: 1 },
        },
        focused: {
          stroke: { color: 0xaacbaa, width: 1 },
        },
        disabled: {
          stroke: { color: 0xaaaacb, width: 1 },
        },
      },
    });
    input.x = data.data.x;
    input.y = data.data.y;

    this.handler.c.addChild(input);
    if (this.shared.MID === data.playerID) {
      input.on("input", (value) => {
        this.renderer.pixiApp.renderer.plugins.interaction.emit("input", {
          value,
          targetID: input.inputID,
        });
      });
      input.on("blur", () => {
        this.renderer.pixiApp.renderer.plugins.interaction.emit("blur", {
          targetID: input.inputID,
        });
      });
      input.on("focus", () => {
        this.renderer.pixiApp.renderer.plugins.interaction.emit("focus", {
          targetID: input.inputID,
        });
      });
      input.focus();
    }
    this.handler.texts["text"] = input;
    return true;
  }

  override reactInput(data: IMondrianInteractData): boolean {
    const input = this.handler.texts["text"];
    if (input) {
      if (input.inputID === data.data.targetID) {
        input.text = data.data.value || "";
      }
    }
    return true;
  }

  override reactFocus(data: IMondrianInteractData): boolean {
    const input = this.handler.texts["text"];
    if (input && input.inputID === data.data.targetID) {
      this.hasFocus = true;
    }
    return true;
  }

  override reactBlur(data: IMondrianInteractData): boolean {
    const input = this.handler.texts["text"];
    if (input && input.inputID === data.data.targetID) {
      input.disabled = true;
      this.handler.stop();
      this.hasFocus = false;
    }
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override reactDragEnd(_data: IMondrianInteractData): boolean {
    return true;
  }
}
