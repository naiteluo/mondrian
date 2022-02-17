import {
  Container,
  Graphics,
  Text,
  TextStyle,
  Renderer,
  InteractionEvent,
  Matrix,
  IDestroyOptions,
  TextStyleAlign,
  TextStyleFontWeight,
  TextStyleFontVariant,
  TextStyleFontStyle,
  TextMetrics,
} from "pixi.js";

// todo delete debug code
let inputID = 0;
(window as any)["inputs"] = [];

interface IFontMetrics {
  ascent: number;
  descent: number;
  fontSize: number;
}

export enum TextInputState {
  DEFAULT = "default",
  FOCUSED = "focused",
  DISABLED = "disabled",
}

export type ICssStyle = {
  [key: string]: number | string | boolean;
};

export type ITextInputBoxOption = {
  /**
   * The fill color of the box
   */
  fill?: number;
  /**
   * The border-radius
   */
  rounded?: number;
  /**
   * The style of the box's stroke
   */
  stroke?: {
    /**
     * the color of the stroke
     */
    color?: number;
    /**
     * the width of the stroke
     */
    width?: number;
    /**
     * the alpha of the stroke
     */
    alpha?: number;
  };
};

export interface ITextInputBoxOptions {
  [TextInputState.DEFAULT]: ITextInputBoxOption;
  [TextInputState.FOCUSED]: ITextInputBoxOption;
  [TextInputState.DISABLED]: ITextInputBoxOption;
}

interface IBoxBound {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type IBoxPool = Partial<{
  [TextInputState.DEFAULT]: Graphics;
  [TextInputState.FOCUSED]: Graphics;
  [TextInputState.DISABLED]: Graphics;
}>;

export type IBoxInfoSnapshot = {
  state?: TextInputState;
  canvas_bounds?: IBoxBound;
  world_transform?: Matrix;
  world_alpha?: number;
  world_visible?: boolean;
  input_bounds?: DOMRect;
};

export type ITextInputBoxGeneratorFunc = (
  w: number,
  h: number,
  state: TextInputState
) => Graphics;

export interface ITextInputOptions {
  input: ICssStyle;
  box: Partial<ITextInputBoxOptions> | ITextInputBoxGeneratorFunc;
}

export class TextInput extends Container {
  inputID = 0;

  // input css style
  private inputStyle: { [key: string]: number | string | boolean };

  private boxGenerator?: ITextInputBoxGeneratorFunc;

  private isMultiline: boolean;

  private boxCache: IBoxPool = {};

  private previousBoxInfoSnapshot: IBoxInfoSnapshot;

  private isDomAdded: boolean;

  private isDomVisible: boolean;

  private _placeholder: string;

  private placeholderColor: number;

  private selection: (number | null)[];

  private restrictValue: string;

  private substituted = false;

  domInput!: HTMLInputElement | HTMLTextAreaElement;

  private _disabled: any;

  private _maxLength: any;

  restrictRegex: any;

  _last_renderer: any;

  state: TextInputState = TextInputState.DEFAULT;

  _resolution: any;

  _canvas_bounds!: IBoxBound;

  _box: any;

  /**
   * text body in canvas
   */
  private surrogate?: Text;

  /**
   * text hitbox in canvas
   */
  private surrogateHitbox?: Graphics;

  /**
   * todo what for?
   */
  private surrogateMask?: Graphics;

  private fontMetrics?: IFontMetrics;

  private textMetrics?: TextMetrics;

  constructor(styles: ITextInputOptions) {
    super();
    this.inputID = inputID++;
    (window as any)["inputs"].push(this);
    this.inputStyle = Object.assign(
      {
        position: "absolute",
        background: "none",
        border: "none",
        outline: "none",
        transformOrigin: "0 0",
        lineHeight: "1",
      },
      styles.input
    );

    if (styles.box) {
      this.boxGenerator =
        typeof styles.box === "function"
          ? styles.box
          : DefaultBoxGenerator(styles.box);
    } else this.boxGenerator = undefined;

    if (Object.getOwnPropertyDescriptor(this.inputStyle, "multiline")) {
      this.isMultiline = !!this.inputStyle.multiline;
      delete this.inputStyle.multiline;
    } else this.isMultiline = false;

    this.boxCache = {};
    this.previousBoxInfoSnapshot = {};
    this.isDomAdded = false;
    this.isDomVisible = true;
    this._placeholder = "";
    this.placeholderColor = 0xa9a9a9;
    this.selection = [0, 0];
    this.restrictValue = "";
    this._createDOMInput();
    this.substituteText = true;
    this._setState(TextInputState.DEFAULT);
    this._addListeners();
  }

  // GETTERS & SETTERS

  get substituteText() {
    return this.substituted;
  }

  set substituteText(substitute) {
    if (this.substituted == substitute) return;

    this.substituted = substitute;

    if (substitute) {
      this._createSurrogate();
      this.isDomVisible = false;
    } else {
      // this._destroySurrogate();
      this.isDomVisible = true;
    }
    this.placeholder = this._placeholder;
    this._update();
  }

  get placeholder() {
    return this._placeholder;
  }

  set placeholder(text) {
    this._placeholder = text;
    if (this.substituted) {
      this._updateSurrogate();
      this.domInput.placeholder = "";
    } else {
      this.domInput.placeholder = text;
    }
  }

  get disabled() {
    return this._disabled;
  }

  set disabled(disabled) {
    this._disabled = disabled;
    this.domInput.disabled = disabled;
    this._setState(disabled ? TextInputState.DISABLED : TextInputState.DEFAULT);
  }

  get maxLength() {
    return this._maxLength;
  }

  set maxLength(length) {
    this._maxLength = length;
    this.domInput.setAttribute("maxlength", length);
  }

  get restrict() {
    return this.restrictRegex;
  }

  set restrict(regex) {
    if (regex instanceof RegExp) {
      regex = regex.toString().slice(1, -1);

      if (regex.charAt(0) !== "^") regex = "^" + regex;

      if (regex.charAt(regex.length - 1) !== "$") regex = regex + "$";

      regex = new RegExp(regex);
    } else {
      regex = new RegExp("^[" + regex + "]*$");
    }

    this.restrictRegex = regex;
  }

  get text() {
    return this.domInput.value;
  }

  set text(text) {
    this.domInput.value = text;
    this._updateFontMetrics();
    this._updateBox();
    this._updateSubstitution();
    if (this.substituted) this._updateSurrogate();
  }

  get htmlInput() {
    return this.domInput;
  }

  focus() {
    if (this.substituted && !this.isDomVisible) this._setDOMInputVisible(true);

    this.domInput.focus();
  }

  blur() {
    this.domInput.blur();
  }

  select() {
    this.focus();
    this.domInput.select();
  }

  setInputStyle(key: string, value: number | string | boolean) {
    this.inputStyle[key] = value;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.domInput.style as any)[key] = `${value}`;

    if (this.substituted && (key === "fontFamily" || key === "fontSize"))
      this._updateFontMetrics();

    if (this._last_renderer) this._update();
  }

  override destroy(options?: boolean | IDestroyOptions | undefined) {
    this._destroyBoxCache();
    super.destroy(options);
  }

  // SETUP

  _createDOMInput() {
    if (this.isMultiline) {
      this.domInput = document.createElement("textarea");
      this.domInput.style.resize = "none";
    } else {
      this.domInput = document.createElement("input");
      this.domInput.type = "text";
    }

    for (const key in this.inputStyle) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.domInput.style as any)[key] = `${this.inputStyle[key]}`;
    }

    // set the same default font family as pixi text style
    // to keep bound rect same
    if (!this.inputStyle.fontFamily) {
      this.domInput.style.fontFamily = "Arial";
    }
  }

  _addListeners() {
    this.on("added", this._onAdded);
    this.on("removed", this._onRemoved);
    this.domInput.addEventListener("keydown", this._onInputKeyDown);
    this.domInput.addEventListener("input", this._onInputInput);
    this.domInput.addEventListener("keyup", this._onInputKeyUp);
    this.domInput.addEventListener("focus", this._onFocused);
    this.domInput.addEventListener("blur", this._onBlurred);
  }

  _onInputKeyDown = (e: Event) => {
    const keyboardEvent = e as KeyboardEvent;
    this.selection = [this.domInput.selectionStart, this.domInput.selectionEnd];
    this.emit("keydown", keyboardEvent.code);
  };

  _onInputInput = () => {
    if (this.restrictRegex) this._applyRestriction();

    if (this.substituted) this._updateSubstitution();

    this.emit("input", this.text);
  };

  _onInputKeyUp = (e: Event) => {
    const keyboardEvent = e as KeyboardEvent;
    this._updateFontMetrics();
    this._updateBox();
    this.emit("keyup", keyboardEvent.code);
  };

  _onFocused = () => {
    this._setState(TextInputState.FOCUSED);
    this.emit("focus");
  };

  _onBlurred = () => {
    this._setState(TextInputState.DEFAULT);
    this.emit("blur");
  };

  _onAdded = () => {
    document.body.appendChild(this.domInput);
    this.domInput.style.display = "none";
    this.isDomAdded = true;
  };

  _onRemoved = () => {
    document.body.removeChild(this.domInput);
    this.isDomAdded = false;
  };

  _setState(state: TextInputState) {
    this.state = state;
    this._updateBox();
    if (this.substituted) this._updateSubstitution();
  }

  // RENDER & UPDATE
  override render(renderer: Renderer) {
    super.render(renderer);
    this._renderInternal(renderer);
  }

  _renderInternal(renderer: Renderer) {
    this._resolution = renderer.resolution;
    this._last_renderer = renderer;
    this._canvas_bounds = this._getCanvasBounds();
    if (this._needsUpdate()) this._update();
  }

  _update() {
    this._updateDOMInput();
    if (this.substituted) this._updateSurrogate();
    this._updateBox();
  }

  _updateBox() {
    if (!this.boxGenerator) return;

    if (this._needsNewBoxCache()) this._buildBoxCache();

    if (
      this.state &&
      this.state == this.previousBoxInfoSnapshot.state &&
      this._box == this.boxCache[this.state]
    ) {
      return;
    }

    if (this._box) this.removeChild(this._box);

    this._box = this.boxCache[this.state];
    this.addChildAt(this._box, 0);
    this.previousBoxInfoSnapshot.state = this.state;
  }

  _updateSubstitution() {
    if (this.state === TextInputState.FOCUSED) {
      this.isDomVisible = true;
      if (this.surrogate) {
        this.surrogate.visible = this.text.length === 0;
      }
    } else {
      this.isDomVisible = false;
      if (this.surrogate) {
        this.surrogate.visible = true;
      }
    }
    this._updateDOMInput();
    this._updateSurrogate();
  }

  _updateDOMInput() {
    if (!this._canvas_bounds) return;

    this.domInput.style.top = (this._canvas_bounds.top || 0) + "px";
    this.domInput.style.left = (this._canvas_bounds.left || 0) + "px";
    this.domInput.style.transform = this._pixiMatrixToCSS(
      this._getDOMRelativeWorldTransform()
    );
    this.domInput.style.opacity = `${this.worldAlpha}`;
    this._setDOMInputVisible(this.worldVisible && this.isDomVisible);
    // todo make fluid input width a configurable option
    this.domInput.style.width =
      (this.textMetrics?.width ||
        0 + this._deriveSurrogatePadding()[3] * 2 ||
        this.text.length * parseFloat(this.inputStyle.fontSize as string)) +
      "px";
    this.previousBoxInfoSnapshot.canvas_bounds = this._canvas_bounds;
    this.previousBoxInfoSnapshot.world_transform = this.worldTransform.clone();
    this.previousBoxInfoSnapshot.world_alpha = this.worldAlpha;
    this.previousBoxInfoSnapshot.world_visible = this.worldVisible;
  }

  _applyRestriction() {
    if (this.restrictRegex.test(this.text)) {
      this.restrictValue = this.text;
    } else {
      this.text = this.restrictValue;
      this.domInput.setSelectionRange(this.selection[0], this.selection[1]);
    }
  }

  // STATE COMPAIRSON (FOR PERFORMANCE BENEFITS)

  _needsUpdate() {
    return (
      !this._comparePixiMatrices(
        this.worldTransform,
        this.previousBoxInfoSnapshot.world_transform
      ) ||
      !this._compareClientRects(
        this._canvas_bounds,
        this.previousBoxInfoSnapshot.canvas_bounds
      ) ||
      this.worldAlpha != this.previousBoxInfoSnapshot.world_alpha ||
      this.worldVisible != this.previousBoxInfoSnapshot.world_visible
    );
  }

  _needsNewBoxCache() {
    const input_bounds = this._getDOMInputBounds();
    return (
      !this.previousBoxInfoSnapshot.input_bounds ||
      input_bounds.width != this.previousBoxInfoSnapshot.input_bounds.width ||
      input_bounds.height != this.previousBoxInfoSnapshot.input_bounds.height
    );
  }

  // INPUT SUBSTITUTION

  _createSurrogate() {
    this.surrogateHitbox = new Graphics();
    this.surrogateHitbox.alpha = 0;
    this.surrogateHitbox.interactive = true;
    this.surrogateHitbox.cursor = "text";

    this.surrogateHitbox.on("pointerdown", this._onSurrogateFocus);
    this.addChild(this.surrogateHitbox);

    this.surrogateMask = new Graphics();
    this.addChild(this.surrogateMask);

    this.surrogate = new Text("", {});
    this.addChild(this.surrogate);

    this.surrogate.mask = this.surrogateMask;

    this._updateFontMetrics();
    this._updateSurrogate();
  }

  _updateSurrogate() {
    if (!this.surrogate) return;
    const padding = this._deriveSurrogatePadding();
    const input_bounds = this._getDOMInputBounds();

    this.surrogate.style = this._deriveSurrogateStyle();
    this.surrogate.style.padding = Math.max(...padding);
    this.surrogate.y = this.isMultiline
      ? padding[0]
      : (input_bounds.height - this.surrogate.height) / 2;
    this.surrogate.x = padding[3];
    this.surrogate.text = this._deriveSurrogateText();

    switch (this.surrogate.style.align) {
      case "left":
        this.surrogate.x = padding[3];
        break;

      case "center":
        this.surrogate.x =
          input_bounds.width * 0.5 - this.surrogate.width * 0.5;
        break;

      case "right":
        this.surrogate.x =
          input_bounds.width - padding[1] - this.surrogate.width;
        break;
    }

    this._updateSurrogateHitbox(input_bounds);
    this._updateSurrogateMask(input_bounds, padding);
  }

  _updateSurrogateHitbox(bounds: DOMRect) {
    if (!this.surrogateHitbox) return;
    this.surrogateHitbox.clear();
    this.surrogateHitbox.beginFill(0);
    this.surrogateHitbox.drawRect(0, 0, bounds.width, bounds.height);
    this.surrogateHitbox.endFill();
    this.surrogateHitbox.interactive = !this._disabled;
  }

  _updateSurrogateMask(bounds: DOMRect, padding: number[]) {
    if (!this.surrogateMask) return;
    this.surrogateMask.clear();
    this.surrogateMask.beginFill(0);
    this.surrogateMask.drawRect(
      padding[3],
      0,
      bounds.width - padding[3] - padding[1],
      bounds.height
    );
    this.surrogateMask.endFill();
  }

  _destroySurrogate() {
    if (!this.surrogate) return;

    this.removeChild(this.surrogate);

    if (!this.surrogateHitbox) return;

    this.removeChild(this.surrogateHitbox);

    this.surrogate.destroy();
    this.surrogateHitbox.destroy();

    this.surrogate = undefined;
    this.surrogateHitbox = undefined;
  }

  _onSurrogateFocus = (e: InteractionEvent) => {
    e.stopPropagation();
    this._setDOMInputVisible(true);
    this._ensureFocus();
    //sometimes the input is not being focused by the mouseclick
    // setTimeout(this._ensureFocus.bind(this), 10);
  };

  _ensureFocus() {
    if (!this._hasFocus()) this.focus();
  }

  _deriveSurrogateStyle() {
    const style = new TextStyle();

    // todo explictly define inputstyle options
    for (const key in this.inputStyle) {
      switch (key) {
        case "color":
          style.fill = this.inputStyle.color as number | string;
          break;

        case "fontFamily":
          style.fontFamily = this.inputStyle.fontFamily as string;
          break;
        case "fontSize":
          style.fontSize = this.inputStyle.fontSize as string | number;
          break;
        case "fontWeight":
          style.fontWeight = this.inputStyle.fontWeight as TextStyleFontWeight;
          break;
        case "fontVariant":
          style.fontVariant = this.inputStyle
            .fontVariant as TextStyleFontVariant;
          break;
        case "fontStyle":
          style.fontStyle = this.inputStyle.fontStyle as TextStyleFontStyle;
          break;
        case "letterSpacing":
          style.letterSpacing = parseFloat(
            this.inputStyle.letterSpacing as string
          );
          break;
        case "textAlign":
          style.align = this.inputStyle.textAlign as TextStyleAlign;
          break;
      }
    }

    if (this.isMultiline) {
      style.lineHeight = parseFloat(style.fontSize as string);
      style.wordWrap = true;
      style.wordWrapWidth = this._getDOMInputBounds().width;
    }

    if (this.domInput.value.length === 0) style.fill = this.placeholderColor;

    return style;
  }

  _deriveSurrogatePadding() {
    const indent = this.inputStyle.textIndent
      ? parseFloat(this.inputStyle.textIndent as string)
      : 0;

    const tempPadding = this.inputStyle.padding as string;
    if (tempPadding && tempPadding.length > 0) {
      const components = tempPadding.trim().split(" ");

      if (components.length == 1) {
        const padding = parseFloat(components[0]);
        return [padding, padding, padding, padding + indent];
      } else if (components.length == 2) {
        const paddingV = parseFloat(components[0]);
        const paddingH = parseFloat(components[1]);
        return [paddingV, paddingH, paddingV, paddingH + indent];
      } else if (components.length == 4) {
        const padding = components.map((component) => {
          return parseFloat(component);
        });
        padding[3] += indent;
        return padding;
      }
    }

    return [0, 0, 0, indent];
  }

  _deriveSurrogateText() {
    if (this.domInput.value.length === 0) return this._placeholder;

    if (this.domInput.type == "password")
      return "•".repeat(this.domInput.value.length);

    return this.domInput.value;
  }

  _updateFontMetrics() {
    const style = this._deriveSurrogateStyle();
    const font = style.toFontString();

    this.fontMetrics = TextMetrics.measureFont(font);
    this.textMetrics = TextMetrics.measureText(this.text, style);
  }

  // CACHING OF INPUT BOX GRAPHICS

  _buildBoxCache() {
    this._destroyBoxCache();

    const states: TextInputState[] = [
      TextInputState.DEFAULT,
      TextInputState.FOCUSED,
      TextInputState.DISABLED,
    ];
    const input_bounds = this._getDOMInputBounds();

    states.forEach((state) => {
      if (this.boxGenerator) {
        this.boxCache[state] = this.boxGenerator(
          input_bounds.width,
          input_bounds.height,
          state
        );
      }
    });

    this.previousBoxInfoSnapshot.input_bounds = input_bounds;
  }

  _destroyBoxCache() {
    if (this._box) {
      this.removeChild(this._box);
      this._box = null;
    }

    for (const i in this.boxCache) {
      const state = i as TextInputState;
      if (this.boxCache[state]) {
        this.boxCache[state]?.destroy();
        this.boxCache[state] = undefined;
        delete this.boxCache[state];
      }
    }
  }

  // HELPER FUNCTIONS

  _hasFocus() {
    return document.activeElement === this.domInput;
  }

  _setDOMInputVisible(visible: boolean) {
    this.domInput.style.display = visible ? "block" : "none";
  }

  _getCanvasBounds() {
    const rect = this._last_renderer.view.getBoundingClientRect();
    const bounds = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
    bounds.left += window.scrollX;
    bounds.top += window.scrollY;
    return bounds;
  }

  _getDOMInputBounds() {
    let remove_after = false;

    if (!this.isDomAdded) {
      document.body.appendChild(this.domInput);
      remove_after = true;
    }

    const org_transform = this.domInput.style.transform;
    const org_display = this.domInput.style.display;
    this.domInput.style.transform = "";
    this.domInput.style.display = "block";
    const bounds = this.domInput.getBoundingClientRect();
    this.domInput.style.transform = org_transform;
    this.domInput.style.display = org_display;

    if (remove_after) document.body.removeChild(this.domInput);

    return bounds;
  }

  _getDOMRelativeWorldTransform() {
    const canvas_bounds = this._last_renderer.view.getBoundingClientRect();
    const matrix = this.worldTransform.clone();

    matrix.scale(this._resolution, this._resolution);
    matrix.scale(
      canvas_bounds.width / this._last_renderer.width,
      canvas_bounds.height / this._last_renderer.height
    );
    return matrix;
  }

  _pixiMatrixToCSS(m: Matrix) {
    return "matrix(" + [m.a, m.b, m.c, m.d, m.tx, m.ty].join(",") + ")";
  }

  _comparePixiMatrices(m1?: Matrix, m2?: Matrix) {
    if (!m1 || !m2) return false;
    return (
      m1.a == m2.a &&
      m1.b == m2.b &&
      m1.c == m2.c &&
      m1.d == m2.d &&
      m1.tx == m2.tx &&
      m1.ty == m2.ty
    );
  }

  _compareClientRects(r1?: IBoxBound, r2?: IBoxBound) {
    if (!r1 || !r2) return false;
    return (
      r1.left == r2.left &&
      r1.top == r2.top &&
      r1.width == r2.width &&
      r1.height == r2.height
    );
  }
}

function DefaultBoxGenerator(styles: Partial<ITextInputBoxOptions>) {
  if (styles.default) {
    styles.focused = styles.focused || styles.default;
    styles.disabled = styles.disabled || styles.default;
  } else {
    const defaultStyle = { fill: 0xcccccc };
    styles.default = styles.focused = styles.disabled = defaultStyle;
  }

  /**
   * generator of out box
   */
  return (w: number, h: number, state: TextInputState) => {
    const style = styles[state];
    const box = new Graphics();

    if (!style) return box;

    if (style.fill) box.beginFill(style.fill);

    if (style.stroke)
      box.lineStyle(
        style.stroke.width || 1,
        style.stroke.color || 0,
        style.stroke.alpha || 1
      );

    if (style.rounded) {
      box.drawRoundedRect(0, 0, w, h, style.rounded);
    } else {
      box.drawRect(0, 0, w, h);
    }

    box.endFill();
    box.closePath();

    return box;
  };
}
