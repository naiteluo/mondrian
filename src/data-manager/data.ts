export const enum MondrianDataType {
  INTERACT = "i",
  STATE = "s",
  ACTION = "a",
}

export const enum MondrianInteractType {
  DRAG_START = "ds",
  DRAG = "d",
  DRAG_END = "de",
}

export const enum MondrianActionType {
  UNDO = "ud",
  REDO = "rd",
  CLEAR = "clear",
}

interface IMondrianCommonData {
  seq?: number;
  playerID?: string;
}

interface IMondrianInteractData extends IMondrianCommonData {
  type: MondrianDataType.INTERACT;
  data: {
    subType: MondrianInteractType;
    x: number;
    y: number;
  };
}

interface IMondrianStateData extends IMondrianCommonData {
  type: MondrianDataType.STATE;
  data: {
    [key: string]: any;
  };
}

interface IMondrianActionData extends IMondrianCommonData {
  type: MondrianDataType.ACTION;
  data: {
    subType: MondrianActionType;
    [key: string]: any;
  };
}

export type IMondrianData =
  | IMondrianInteractData
  | IMondrianStateData
  | IMondrianActionData;
