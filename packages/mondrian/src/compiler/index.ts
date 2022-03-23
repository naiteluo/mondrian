import { IMondrianData, MondrianDataSubType } from "../data-manager/data";
import { IsStateStable, MondrianPatternStates, ShiftState } from "./state";

class MondrianAction {
  constructor(
    public type: MondrianPatternStates,
    public list: IMondrianData[]
  ) {}
}

class MondrianActionNode {
  prev?: MondrianActionNode;

  next?: MondrianActionNode;

  // todo
  id?: MondrianActionID;

  constructor(public action: MondrianAction | null) {}

  connect(prev: MondrianActionNode) {
    this.prev = prev;
    if (prev.next) {
      prev.next.prev = this;
    }
    this.next = prev.next;
    prev.next = this;
  }
}

class MondrianActionID {
  constructor(public player: number, clock: number) {}
}

/**
 * todo not ready to be used
 * 
 */
export class MondrianCompiler {
  counter = 0;

  // action link list head node
  head: MondrianActionNode;

  processingPatternMap: Map<string, MondrianCompilerPattern> = new Map();

  constructor() {
    this.head = new MondrianActionNode(null);
  }

  compile(datas: IMondrianData[]) {
    datas.forEach((data) => {
      if (!data.playerID) {
        return;
      }
      if (data.subType === MondrianDataSubType.POINTER_DOWN) {
        console.log(123);
      }
      const pid = data.playerID;
      let currentPattern = this.processingPatternMap.get(pid);
      if (!currentPattern) {
        currentPattern = new MondrianCompilerPattern();
        if (currentPattern) {
          this.processingPatternMap.set(pid, currentPattern);
        }
      }
      if (currentPattern) {
        currentPattern.patch(data);
        if (currentPattern.isStable()) {
          this.addAction(currentPattern.pack());
          this.processingPatternMap.delete(pid);
          currentPattern.destroy();
        } else {
          if (currentPattern.isDiscardable()) {
            currentPattern.reset();
          }
        }
      } else {
        console.log("data not matching any pattern, ignore");
        return;
      }
    });
    return true;
  }

  private addAction(action: MondrianAction) {
    const node = new MondrianActionNode(action);
    let current = this.head?.next;
    let prev = this.head;
    if (!current) {
      node.connect(prev);
    } else {
      while (current) {
        prev = current;
        current = current.next;
      }
      if (!node.prev) {
        node.connect(prev);
      }
    }
  }
}

export class MondrianCompilerPattern {
  public state = MondrianPatternStates.Initial;

  public list: IMondrianData[] = [];

  isStable() {
    return IsStateStable(this.state);
  }

  isDiscardable() {
    return this.state === MondrianPatternStates.Discarded;
  }

  patch(data: IMondrianData) {
    this.list.push(data);
    this.state = ShiftState(this.state, data.subType);
  }

  pack(): MondrianAction {
    return new MondrianAction(this.state, this.list);
  }

  destroy() {
    this.list = [];
  }

  reset() {
    this.list = [];
    this.state = MondrianPatternStates.Initial;
  }
}
