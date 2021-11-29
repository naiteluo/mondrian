import { Graphics } from 'pixi.js';

export class GraphicsPool {
    private _pool: Graphics[];
    private _maxLength: number;
    private static _instance: GraphicsPool;

    constructor(maxLength: number = 0) {
        this._pool = [];
        this._maxLength = maxLength;
    }

    public static getInstance(maxLength: number): GraphicsPool {
        if(this._instance == undefined) {
            this._instance = new GraphicsPool(maxLength);
        }

        return this._instance;
    }

    public getNewGraphics(): Graphics {
        let g: Graphics = new Graphics();
        this._pool.push(g);
        return g;
    }

    /**
     * 回收visible标记为false的graphics
     */
    public recover() {
        let i: number = 0;
        while(i < this._pool.length) {
            if(this._pool[i].visible === false) {
                this._pool[i].clear().destroy({ texture: true, baseTexture: true, children: true });
                this._pool.splice(i, 1);
            } else {
                i ++;
            }
        }
    }
}