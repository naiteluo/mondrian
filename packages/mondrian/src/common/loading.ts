import { MondrianContainerManager } from "../container-manager";
import { MondrianShared } from "../shared";

export class MondrianLoading {
  private styleCreated = false;

  private wrapClassName = "mondrian-loading";

  private wrapClassNameWithMid;

  private $dom!: HTMLDivElement;

  constructor(
    private containerManager: MondrianContainerManager,
    private shared: MondrianShared
  ) {
    this.wrapClassNameWithMid = `${this.wrapClassName}-${shared.MID}`;
    this.insertStyle();
    this.createDom();
    this.containerManager.$container.appendChild(this.$dom);
  }

  private insertStyle() {
    if (this.styleCreated) return;
    this.styleCreated = true;
    const css = `
    .${this.wrapClassNameWithMid} {
        visibility: hidden;
        opacity: 0;
        transition:visibility 0.3s linear,opacity 0.3s linear;
        background: #c6c6c6;
        position: fixed;
        top: 0;
        left: 0;
        width:100%;
        height: 100%;
        display:flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        flex-direction: column;
    }
    .${this.wrapClassNameWithMid}.show {
        visibility: visible;
        opacity: 1;
    }
    .${this.wrapClassNameWithMid}.hide {
        display: none;
    }
    .${this.wrapClassNameWithMid} .lds-ripple {
        display: inline-block;
        position: relative;
        margin-bottom: 30px;
        width: 80px;
        height: 80px;
    }
    .${this.wrapClassNameWithMid} .lds-ripple div {
        position: absolute;
        border: 4px solid #fff;
        opacity: 1;
        border-radius: 50%;
        animation: ${this.wrapClassNameWithMid}-lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
    }
    .${this.wrapClassNameWithMid} .lds-ripple div:nth-child(2) {
        animation-delay: -0.5s;
    }
    @keyframes ${this.wrapClassNameWithMid}-lds-ripple {
        0% {
            top: 36px;
            left: 36px;
            width: 0;
            height: 0;
            opacity: 1;
        }
        100% {
            top: 0px;
            left: 0px;
            width: 72px;
            height: 72px;
            opacity: 0;
        }
    }
    `;
    const style = document.createElement("style");
    style.type = "text/css";
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  private createDom() {
    this.$dom = document.createElement("div");
    this.$dom.innerHTML = `
        <div class="lds-ripple">
            <div></div>
            <div></div>
        </div>
        <span id="${this.wrapClassNameWithMid}-message">Network...</span>
        `;
    this.$dom.classList.add(this.wrapClassName);
    this.$dom.classList.add(this.wrapClassNameWithMid);
    // this.$dom.style.display = "none";
  }

  show() {
    this.$dom.classList.add("show");
    // set modal display none when transition done,
    // prevent css animation trigger css recalcations
    this.$dom.ontransitionend = () => {
      this.$dom.classList.add("hide");
    };
  }

  hide() {
    this.$dom.classList.remove("show");
  }

  setText(message: string) {
    const $msg = document.getElementById(
      `${this.wrapClassNameWithMid}-message`
    );
    if ($msg) $msg.innerText = message;
  }
}
