export const enum DataType {
  INTERACT = "i",
  STATE = "s",
  ACTION = "a",
}

export const enum InteractType {
  DRAG_START = "ds",
  DRAG = "d",
  DRAG_END = "de",
}

interface ICommonData {
  playerID?: string;
}

interface IInteractData extends ICommonData {
  type: DataType.INTERACT;
  data: {
    subType: InteractType;
    x: number;
    y: number;
  };
}

interface IStateData extends ICommonData {
  type: DataType.STATE;
  data: {
    [key: string]: any;
  };
}

interface IActionData extends ICommonData {
  type: DataType.ACTION;
  data: {
    [key: string]: any;
  };
}

export type IData = IInteractData | IStateData | IActionData;
