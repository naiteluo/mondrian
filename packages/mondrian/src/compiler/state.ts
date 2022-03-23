import { MondrianDataSubType } from "../data-manager/data";

export enum MondrianPatternStates {
  Initial = "i",

  DragStarted = "ds",

  Dragging = "dg",

  ExecDrag = "ed",

  Discarded = "d",

  ExecSetState = "es",

  ExecCommand = "ec",
}

export const MondrianPatternStatesTranstitions: {
  [key1 in MondrianPatternStates]?: {
    [key2 in MondrianDataSubType]?: MondrianPatternStates;
  };
} = {
  [MondrianPatternStates.Initial]: {
    [MondrianDataSubType.POINTER_DOWN]: MondrianPatternStates.DragStarted,
    [MondrianDataSubType.SET_STATE]: MondrianPatternStates.ExecSetState,
    [MondrianDataSubType.UNDO]: MondrianPatternStates.ExecCommand,
    [MondrianDataSubType.REDO]: MondrianPatternStates.ExecCommand,
    [MondrianDataSubType.CLEAR]: MondrianPatternStates.ExecCommand,
    [MondrianDataSubType.SYSTEM]: MondrianPatternStates.ExecCommand,
  },
  [MondrianPatternStates.DragStarted]: {
    [MondrianDataSubType.POINTER_MOVE]: MondrianPatternStates.Dragging,
  },

  [MondrianPatternStates.Dragging]: {
    [MondrianDataSubType.POINTER_MOVE]: MondrianPatternStates.Dragging,
    [MondrianDataSubType.POINTER_UP]: MondrianPatternStates.ExecDrag,
  },
};

export function IsStateStable(state: MondrianPatternStates) {
  return (
    state === MondrianPatternStates.ExecDrag ||
    state === MondrianPatternStates.ExecSetState ||
    state === MondrianPatternStates.ExecCommand
  );
}

export function ShiftState(
  state: MondrianPatternStates,
  directive: MondrianDataSubType
): MondrianPatternStates {
  try {
    return (
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      MondrianPatternStatesTranstitions[state]![directive]! ||
      MondrianPatternStates.Discarded
    );
  } catch (e) {
    return MondrianPatternStates.Discarded;
  }
}
