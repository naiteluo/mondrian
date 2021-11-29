import { IPoint, IPointData } from "@pixi/math";

export class DataCenter {
    private _queue: SignalData[] = [];
    private _fn: Function;
    private static _instance: DataCenter;
    constructor(consumeCallback: Function) {
        this._fn = consumeCallback;
    }

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

    public static getInstance(consumeCallback: Function): DataCenter {
        if(this._instance instanceof DataCenter) {
            return this._instance;
        } else {
            this._instance = new DataCenter(consumeCallback);
            return this._instance;
        }
    }

    public pushData(...args: SignalData[]) {
        this._queue.push(...args);
    }

    public consume() {
        while(this._queue.length > 0) {
            this._fn(this._queue.shift());
        }
    }
}

export enum SignalType {
    DRAG_EVENT,
    STATUS,
}

export enum DragType {
    DRAG_START,
    DRAG,
    DRAG_END,
}

export interface SignalDragData {
    type: DragType,
    x: number,
    y: number,
}

export interface SignalStatusData {
    isStartPlay?: Boolean,
    histroyLength?: number,
    histroyBackIndex?: number,
}

export interface SignalData {
    type: SignalType,
    data: SignalDragData | SignalStatusData,
    timestamp: number,
}