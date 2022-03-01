import { MondrianDataSubType } from "../data-manager/data";

export enum MondrianPatternStates {
  Initial = "0",

  DragStarted = "1",

  Dragging = "2",

  ExecDrag = "3",

  Discarded = "4",

  ExecSetState = "5",

  ExecCommand = "6",
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
    state === MondrianPatternStates.Discarded ||
    state === MondrianPatternStates.ExecSetState ||
    state === MondrianPatternStates.ExecCommand
  );
}

export function ShiftState(
  state: MondrianPatternStates,
  directive: MondrianDataSubType
): MondrianPatternStates {
  try {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return MondrianPatternStatesTranstitions[state]![directive]!;
  } catch (e) {
    return MondrianPatternStates.Discarded;
  }
}
