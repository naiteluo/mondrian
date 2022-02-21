import { IMondrianPlayerState } from "../player";

export const enum MondrianDataType {
  INTERACT = "i",
  SET_STATE = "s",
  COMMAND = "a",
}

export const enum MondrianInteractType {
  POINTER_DOWN = "pd",
  POINTER_MOVE = "pm",
  POINTER_UP = "pu",
  KEY_DOWN = "kd",
  KEY_UP = "ku",
  INPUT = "i",
  INPUT_ADD = "ia",
  FOCUS = "f",
  BLUR = "b",
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
  local?: boolean;
}

export interface IMondrianInteractData extends IMondrianCommonData {
  type: MondrianDataType.INTERACT;
  data: {
    subType: MondrianInteractType;
    x: number;
    y: number;
    code?: string;
    shiftKey?: boolean;
    altKey?: boolean;
    ctrlKey?: boolean;
    spaceKey?: boolean;
    value?: string;
    targetID?: number;
  };
}

export interface IMondrianState {
  player: IMondrianPlayerState;
  [key: string]: string | number | boolean | object;
}

export interface IMondrianStateData extends IMondrianCommonData {
  type: MondrianDataType.SET_STATE;
  data: IMondrianState;
}

export interface IMondrianActionData extends IMondrianCommonData {
  type: MondrianDataType.COMMAND;
  data: {
    subType: MondrianActionType;
    [key: string]: string | number | boolean | object;
  };
}

export type IMondrianData =
  | IMondrianInteractData
  | IMondrianStateData
  | IMondrianActionData;
