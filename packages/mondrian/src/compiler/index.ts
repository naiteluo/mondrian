import {
  IMondrianData,
  MondrianDataType,
  MondrianDataSubType,
} from "../data-manager/data";

enum MondrianActionType {
  Add = "i",
  SetState = "s",
  Command = "",
}

class MondrianAction {
  constructor(public type: MondrianActionType) {}
}

class MondrianActionNode {
  prev?: MondrianAction;

  next?: MondrianAction;

  id?: MondrianActionID;

  constructor(public action: MondrianAction) {}
}

class MondrianActionID {
  constructor(public player: number, clock: number) {}
}

export class MondrianCompiler {
  counter = 0;

  globalList?: MondrianActionNode;

  processingPatternMap: Map<string, MondrianCompilerPattern> = new Map();

  compile(datas: IMondrianData[]) {
    datas.forEach((data) => {
      if (!data.playerID) {
        return;
      }
      const pid = data.playerID;
      let currentPattern = this.processingPatternMap.get(pid);
      if (!currentPattern) {
        currentPattern = MondrianCompilerPattern.Create(data);
        if (currentPattern) {
          this.processingPatternMap.set(pid, currentPattern);
        }
      }
      if (currentPattern) {
        if (currentPattern.patch(data)) {
          // todo
        }
      } else {
        console.log("data not matching any pattern, ignore");
        return;
      }
    });
    return true;
  }

  private addAction(action: MondrianAction) {
    // todo
  }
}

export class MondrianCompilerPattern {
  public ok = false;

  public error = false;

  public list: IMondrianData[] = [];

  constructor(public actionType: MondrianActionType) {}

  patch(data: IMondrianData): boolean {
    return this.ok;
  }

  static Create(data: IMondrianData): MondrianCompilerPattern | undefined {
    const actionType = MondrianCompilerPattern.PredicateActionType(data);
    if (actionType) {
      return new MondrianCompilerPattern(actionType);
    } else {
      return undefined;
    }
  }

  static PredicateActionType(
    data: IMondrianData
  ): MondrianActionType | undefined {
    let actionType: MondrianActionType | undefined;
    const dataType = data.type;
    switch (dataType) {
      case MondrianDataType.INTERACT:
        if (data.data.subType === MondrianDataSubType.POINTER_DOWN) {
          actionType = MondrianActionType.Add;
        }
        break;
    }
    return actionType;
  }

  static PredicateIsOk() {
    // todo
  }

  pack(): MondrianAction {
    return new MondrianAction(this.actionType);
  }
}
