import { Mondrian } from "mondrian/lib/index";
import { ClientApplication } from "./app";

export class AutoDrawController {
  constructor(
    private mondrian: Mondrian,
    private application: ClientApplication
  ) {}

  isAutoOn = false;

  private lastPoint = { x: 0, y: 0 };

  private autoStepLength = 80;

  private autoStepIndex = 0;

  private autoStepCountPerTick = 20;

  autoStepTimeSpan = 100;

  private screenWidth = 0;

  private screenHeight = 0;

  private lt = 0;

  private step = (nt: number) => {
    if (this.isAutoOn) {
      if (nt - this.lt > this.autoStepTimeSpan) {
        this.lt = nt;
        switch (this.autoStepIndex) {
          case 0:
            // simulate self drag
            this.mondrian.interaction.emit("state:change", {
              player: {
                brush: {
                  ...this.application.brushConfig,
                  brushColor: (Math.random() * 0xffffff) << 0,
                },
              },
            });
            this.mondrian.interaction.emit("interaction:pointerdown", {
              mock: true,
              mockX: this.lastPoint.x,
              mockY: this.lastPoint.y,
            });
            break;
          case this.autoStepCountPerTick:
            this.mondrian.interaction.emit("interaction:pointerup", {
              mock: true,
              mockX: this.lastPoint.x,
              mockY: this.lastPoint.y,
            });
            break;
          default:
            this.randomUpdatePoint();
            this.mondrian.interaction.emit("interaction:pointermove", {
              mock: true,
              mockX: this.lastPoint.x,
              mockY: this.lastPoint.y,
            });
            break;
        }
        this.autoStepIndex =
          this.autoStepIndex === this.autoStepCountPerTick
            ? 0
            : this.autoStepIndex + 1;
      }
    }
    requestAnimationFrame(this.step);
  };

  private forcePointerUp() {
    this.mondrian.interaction.emit("interaction:pointerup", {
      mock: true,
      mockX: this.lastPoint.x,
      mockY: this.lastPoint.y,
    });
  }

  private randomUpdatePoint() {
    this.lastPoint.x +=
      Math.random() * this.autoStepLength * 2 - this.autoStepLength;
    this.lastPoint.y +=
      Math.random() * this.autoStepLength * 2 - this.autoStepLength;
    this.lastPoint.x =
      this.lastPoint.x < 0 ? this.screenWidth / 2 : this.lastPoint.x;
    this.lastPoint.y =
      this.lastPoint.y < 0 ? this.screenHeight / 2 : this.lastPoint.y;
    this.lastPoint.x =
      this.lastPoint.x > this.screenWidth
        ? this.screenWidth / 2
        : this.lastPoint.x;
    this.lastPoint.y =
      this.lastPoint.y > this.screenHeight
        ? this.screenHeight / 2
        : this.lastPoint.y;
  }

  toggle() {
    if (this.isAutoOn) {
      this.isAutoOn = false;
      this.forcePointerUp();
      this.mondrian.interaction.startPixiEventWatch();
      return;
    }
    // update view size
    this.screenWidth = this.mondrian.__debugPixiApp.screen.width;
    this.screenHeight = this.mondrian.__debugPixiApp.screen.height;
    this.lastPoint = { x: this.screenWidth / 2, y: this.screenHeight / 2 };
    this.isAutoOn = true;
    // stop real mouse events watching
    this.mondrian.interaction.stopPixiEventWatch();
    requestAnimationFrame(this.step);
  }
}
