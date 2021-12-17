export const enum MondrianDataType {
  INTERACT = "i",
  SET_STATE = "s",
  COMMAND = "a",
}

export const enum MondrianInteractType {
  POINTER_DOWN = "pd",
  POINTER_MOVE = "pm",
  POINTER_UP = "pu",
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
  type: MondrianDataType.SET_STATE;
  data: {
    [key: string]: any;
  };
}

interface IMondrianActionData extends IMondrianCommonData {
  type: MondrianDataType.COMMAND;
  data: {
    subType: MondrianActionType;
    [key: string]: any;
  };
}

export type IMondrianData =
  | IMondrianInteractData
  | IMondrianStateData
  | IMondrianActionData;
