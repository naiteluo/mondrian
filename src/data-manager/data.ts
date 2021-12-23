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
  CLEAR = "cl",
  SYSTEM = "sy",
}

interface IMondrianCommonData {
  seq?: number;
  playerID?: string;
  extra?: {
    last: boolean;
  };
}

export interface IMondrianInteractData extends IMondrianCommonData {
  type: MondrianDataType.INTERACT;
  data: {
    subType: MondrianInteractType;
    x: number;
    y: number;
  };
}

export interface IMondrianStateData extends IMondrianCommonData {
  type: MondrianDataType.SET_STATE;
  data: {
    [key: string]: any;
  };
}

export interface IMondrianActionData extends IMondrianCommonData {
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
