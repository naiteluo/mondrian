export const enum ModrianDataType {
  INTERACT = "i",
  STATE = "s",
  ACTION = "a",
}

export const enum ModrianInteractType {
  DRAG_START = "ds",
  DRAG = "d",
  DRAG_END = "de",
}

interface IModrianCommonData {
  seq?: number;
  playerID?: string;
}

interface IModrianInteractData extends IModrianCommonData {
  type: ModrianDataType.INTERACT;
  data: {
    subType: ModrianInteractType;
    x: number;
    y: number;
  };
}

interface IModrianStateData extends IModrianCommonData {
  type: ModrianDataType.STATE;
  data: {
    [key: string]: any;
  };
}

interface IModrianActionData extends IModrianCommonData {
  type: ModrianDataType.ACTION;
  data: {
    [key: string]: any;
  };
}

export type IModrianData = IModrianInteractData | IModrianStateData | IModrianActionData;
