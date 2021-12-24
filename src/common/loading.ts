import { MondrianContainerManager } from "../container-manager";
import { MondrianShared } from "../shared";

export class MondrianLoading {
  private styleCreated = false;
  private wrapClassName;
  private $dom: HTMLDivElement;
  constructor(
    private containerManager: MondrianContainerManager,
    private shared: MondrianShared
  ) {
    this.wrapClassName = `mondrian-loading-${shared.MID}`;
    this.insertStyle();
    this.createDom();
    this.containerManager.$container.appendChild(this.$dom);
  }

  private insertStyle() {
    if (this.styleCreated) return;
    this.styleCreated = true;
    const css = `
    .${this.wrapClassName} {
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
    .${this.wrapClassName}.show {
        visibility: visible;
        opacity: 1;
    }
    .${this.wrapClassName} .lds-ripple {
        display: inline-block;
        position: relative;
        margin-bottom: 30px;
        width: 80px;
        height: 80px;
    }
    .${this.wrapClassName} .lds-ripple div {
        position: absolute;
        border: 4px solid #fff;
        opacity: 1;
        border-radius: 50%;
        animation: ${this.wrapClassName}-lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
    }
    .${this.wrapClassName} .lds-ripple div:nth-child(2) {
        animation-delay: -0.5s;
    }
    @keyframes ${this.wrapClassName}-lds-ripple {
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
        <span id="${this.wrapClassName}-message">Network...</span>
        `;
    this.$dom.classList.add(this.wrapClassName);
    // this.$dom.style.display = "none";
  }

  show() {
    this.$dom.classList.add("show");
  }

  hide() {
    this.$dom.classList.remove("show");
  }

  setText(message: string) {
    document.getElementById(`${this.wrapClassName}-message`).innerText =
      message;
  }
}
