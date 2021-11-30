import { ExtendedLineStyle } from './brush';

export class DataCenter {

    public static createDragSignalData(dragType: DragType, x: number, y: number): SignalData {
        const data: SignalDragData = {
            type: dragType,
            x: x,
            y: y,
        };
        const result: SignalData = {
            type: SignalType.DRAG_EVENT,
            data: data,
            timestamp: new Date().getTime(),
        }
        return result;
    }

    public static createHistroyIndexData(backIndex: number): SignalData {
        const statusData: SignalStatusData = {
            histroyBackIndex: backIndex
        };
        const data: SignalData = {
            type: SignalType.STATUS,
            timestamp: new Date().getTime(),
            data: statusData
        }
        return data;
    }  

    public static createBrushTypeData(option: ExtendedLineStyle): SignalData {
        const statusData: SignalStatusData = {
            brushOption: option,
        };
        const data: SignalData = {
            type: SignalType.STATUS,
            timestamp: new Date().getTime(),
            data: statusData
        };
        return data;
    }

    public static createActionData(action: PadAction): SignalData {
        const actionData: SignalActionData = {
            action: action
        };
        const data: SignalData = {
            type: SignalType.ACTION,
            timestamp: new Date().getTime(),
            data: actionData,
        };
        return data;
    }
}

export enum SignalType {
    DRAG_EVENT,
    STATUS,
    ACTION,
}

export enum DragType {
    DRAG_START,
    DRAG,
    DRAG_END,
}

export enum PadAction {
    CLEAR_ALL,
}

export interface SignalDragData {
    type: DragType,
    x: number,
    y: number,
}

export interface SignalStatusData {
    histroyLength?: number,
    histroyBackIndex?: number,
    brushOption?: ExtendedLineStyle,
}

export interface SignalActionData {
    action: PadAction
}

export interface SignalData {
    type: SignalType,
    data: SignalDragData | SignalStatusData | SignalActionData,
    timestamp: number,
    delay?: number,
}