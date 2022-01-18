import { MondrianShared } from "../shared";
import {
  IMondrianInteractor,
  IMondrianMockInteractionEvent,
} from "../common/interactor";
import {
  MondrianDataType,
  IMondrianData,
  MondrianDataManager,
  MondrianInteractType,
  MondrianActionType,
  IMondrianState,
} from "../data-manager";
import { MondrianPlayer } from "./player";
import { MondrianRenderer } from "../renderer/renderer";

export class MondrianProducer
  extends MondrianPlayer
  implements IMondrianInteractor
{
  private get root() {
    return this.renderer.rootLayer;
  }

  constructor(
    id: string,
    private dataManager: MondrianDataManager,
    private renderer: MondrianRenderer,
    private shared: MondrianShared
  ) {
    super();
    this.id = id;
  }

  override consume(datas: IMondrianData[]) {
    super.consume(datas);
  }

  onStateChange(states: IMondrianState) {
    this.dataManager.push([
      {
        playerID: this.id,
        type: MondrianDataType.SET_STATE,
        data: { ...states },
      },
    ]);
  }

  onDragStart(event: IMondrianMockInteractionEvent): void {
    this.dataManager.push([
      this.packEvent(MondrianInteractType.POINTER_DOWN, event),
    ]);
  }

  onDragMove(event: IMondrianMockInteractionEvent): void {
    this.dataManager.push([
      this.packEvent(MondrianInteractType.POINTER_MOVE, event),
    ]);
  }

  onDragEnd(event: IMondrianMockInteractionEvent): void {
    this.dataManager.push([
      this.packEvent(MondrianInteractType.POINTER_UP, event),
    ]);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onUndo(_event: unknown): void {
    this.dataManager.push([
      {
        playerID: this.id,
        type: MondrianDataType.COMMAND,
        data: { subType: MondrianActionType.UNDO },
      },
    ]);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onRedo(_event: unknown): void {
    this.dataManager.push([
      {
        playerID: this.id,
        type: MondrianDataType.COMMAND,
        data: { subType: MondrianActionType.REDO },
      },
    ]);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClear(_event: unknown): void {
    this.dataManager.push([
      {
        playerID: this.id,
        type: MondrianDataType.COMMAND,
        data: { subType: MondrianActionType.CLEAR },
      },
    ]);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.code === "Space") {
      this.dataManager.push([
        {
          playerID: this.id,
          type: MondrianDataType.INTERACT,
          data: {
            subType: MondrianInteractType.KEY_DOWN,
            x: 0,
            y: 0,
            code: event.code,
          },
        },
      ]);
    }
  }

  onKeyUp(event: KeyboardEvent): void {
    if (event.code === "Space") {
      this.dataManager.push([
        {
          playerID: this.id,
          type: MondrianDataType.INTERACT,
          data: {
            subType: MondrianInteractType.KEY_UP,
            x: 0,
            y: 0,
            code: event.code,
          },
        },
      ]);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClick(_event: unknown): void {
    console.log("implement it");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onInput(_event: unknown): void {
    console.log("implement it");
  }

  private packEvent(
    subType: MondrianInteractType,
    event: IMondrianMockInteractionEvent
  ): IMondrianData {
    const newEvent: IMondrianData = {
      playerID: this.id,
      type: MondrianDataType.INTERACT,
      data: {
        subType,
        ...this.getXyFromEvent(event),
      },
    };
    if (event?.data?.originalEvent) {
      if (event.data.originalEvent.shiftKey) {
        newEvent.data.shiftKey = event.data.originalEvent.shiftKey;
      }
      if (event.data.originalEvent.altKey) {
        newEvent.data.altKey = event.data.originalEvent.altKey;
      }
      if (event.data.originalEvent.ctrlKey) {
        newEvent.data.ctrlKey = event.data.originalEvent.ctrlKey;
      }
    }
    return newEvent;
  }

  // todo move this coord operation together for flexibility
  // todo event point can reuse
  private getXyFromEvent(event: IMondrianMockInteractionEvent) {
    return this.xyToCenter(
      event.mock
        ? { x: event.mockX, y: event.mockY }
        : event.data.getLocalPosition(this.root)
    );
  }

  // todo optimize
  private xyToCenter({ x, y }: { x: number; y: number }) {
    return {
      x: x - this.renderer.worldRect.width / 2,
      y: y - this.renderer.worldRect.height / 2,
    };
  }
}
