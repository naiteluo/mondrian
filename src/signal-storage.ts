import { Utils } from './utils';

const SIGNAL_KEY: string = 'signal';
const SIGNAL_INDEX: string = 'signal-index';

export class LocalStorageService {

    private _buffer: any[];
    private _maxLenght: 10000;
    
    private static _instance: LocalStorageService;

    constructor() {
        this._buffer = [];
        const r = Utils.storageGet(SIGNAL_KEY);
        if(r === null || r instanceof Array != true) {
            Utils.storageSet(SIGNAL_KEY, []);
        }

        const i = Utils.storageGet(SIGNAL_INDEX);
        if(i === null || i.index === undefined) {
            Utils.storageSet(SIGNAL_INDEX, { index: 0 });
        }
    }

    public static getInstance(): LocalStorageService {
        if(this._instance instanceof LocalStorageService === false) {
            this._instance = new LocalStorageService();
        }
        return this._instance;
    }

    public send(data: any) {
        this._buffer.push(data);
        this._sendToStorage();
    }

    public clear() {
        this._buffer = [];
        Utils.storageSet(SIGNAL_INDEX, { index: 0 });
        Utils.storageSet(SIGNAL_KEY, []);
    }

    private _sendToStorage() {
        let data: any[] = Utils.storageGet(SIGNAL_KEY);
        let idx: number = Utils.storageGet(SIGNAL_INDEX).index;
        while(this._buffer.length > 0) {
            data.push(this._buffer.shift());
            idx ++;
        }

        if(data.length > this._maxLenght) {
            data.splice(0, data.length - this._maxLenght);
        }

        Utils.storageSet(SIGNAL_KEY, data);
        Utils.storageSet(SIGNAL_INDEX, { index: idx });

        data = null;
    }

}

export class LocalStorageClient {
    private _buffer: any[] = [];
    private _reciveIndex: number = 0;
    private _listenerlist: Function[] = [];
    private _animate;
    constructor() {
        
    }

    public start() {
        this.recive();
    }

    public stop() {
        cancelAnimationFrame(this._animate);
    }

    public addListener(listener: Function) {
        this._listenerlist.push(listener);
    }

    public removeListener(listener: Function) {
        const i: number = this._listenerlist.findIndex(v => v == listener);
        this._listenerlist.splice(i, 1);
    }

    private recive = () => {
        const idx: number = Utils.storageGet(SIGNAL_INDEX).index;
        if(idx > this._reciveIndex) {
            const data: any[] = Utils.storageGet(SIGNAL_KEY) as any[];
            this._buffer.push(...data.slice(this._reciveIndex));
            this._reciveIndex = idx;
            this._consume();
        }

        this._animate = requestAnimationFrame(this.recive);
    }

    private _consume() {
        while(this._buffer.length > 0) {
            let data: any = this._buffer.shift();
            this._listenerlist.forEach(fn => fn(data));
        }
        this._buffer = [];
    }
}