import * as PIXI from "pixi.js";
import {
	Application,
	Container,
	InteractionEvent,
	IPointData,
	Sprite,
	Graphics,
} from "pixi.js";
import { drawDashLine } from "./dash-line";
import { sharedAlphaFilter } from "./filters";
import * as dat from "dat.gui";
import { BaseBrush, BrushManager, BrushType, BrushPencil, BrushCircle, BrushRectangle, BrushName, ExtendedLineStyle } from './brush';
import { DataCenter, SignalType, SignalData, DragType, SignalDragData, SignalStatusData, PadAction, SignalActionData } from './data-center';
import { GraphicsPool } from './graphics-pool';
import { LocalStorageService, LocalStorageClient } from './signal-storage';
import { Utils } from './utils';

interface IPadState {
	isStartPlay: boolean;
	histroyLength: number;
	histroyIndex: number;
	brushName: BrushName;
}

const defaultState: IPadState = {
	isStartPlay: false,
	histroyLength: 20,	//历史栈长度
	histroyIndex: 0,	//当前历史指针
	brushName: BrushName.PENCIL,	//默认画笔类型
};

const PadRecordDataStorageKey = "__drawing_board_record_data";

enum PadMode {
	SERVICE,	//信令发送者
	RECIVER,	//信令接收者
}

class Pad {
	// static BASE_WIDTH = 1280;
	// static BASE_HEIGHT = 720;

	private gui;
	private app: Application;
	private $main: HTMLElement;
	private $canvas: HTMLCanvasElement;
	private rootLayer: Container;
	private dynamicLayer: Container;
	private staticLayer: Sprite;
	private brushManager: BrushManager;
	private brush: BaseBrush;
	private gpool: GraphicsPool;
	private state: IPadState = { ...defaultState };
	private isDrawing: Boolean;
	private tempGraphicsList: Graphics[];
	private mode: PadMode;
	private signalService: LocalStorageService;
	private signalClient: LocalStorageClient;

	constructor(mode: PadMode = PadMode.SERVICE) {

		this.mode = mode;

		const isService: Boolean = this.mode === PadMode.SERVICE;

		PIXI.utils.sayHello("WebGL");
		// initial web page
		this.initialPage();
		// initial app
		this.initialPixiApp();
		//矫正尺寸
		this.transformCanvaAndPage();

		if(isService) {
			// bind events
			this.initialDrawEvents();
			//GUI
			setTimeout(() => this.initialGUI(), 1000);
			//信令发送端
			this.signalService = LocalStorageService.getInstance();
			this.signalService.localListener = this._signalRouterAction;
			this.signalService.start();
		} else {
			//信令接收端
			this.signalClient = new LocalStorageClient();
			this.signalClient.addListener(this._signalRouterAction);
			this.signalClient.start();
		}
		// start loop
		this.start();

	}

	private initialPage() {
		const html = document.getElementsByTagName('html')[0];
		const body = document.body;
		html.style.margin = `0px`;
		html.style.padding = `0px`;
		html.style.height = '100%';
		body.style.margin = `0px`;
		body.style.padding = `0px`;
		body.style.height = `100%`;
		body.style.lineHeight = `0px`;
		body.style.overflow = `hidden`;

		this.$main = document.createElement("div");
		this.$main.style.position = "absolute";
		this.$main.style.zIndex = "0";
		this.$main.id = "main-container";
		this.$main.style.margin = "0px 0px";
		// 设置外层容器，乘以固定测试缩放比
		this.$main.style.backgroundImage = "url(assets/white-page-16b9.png)";
		// this.$main.style.border = "1px solid red";
		document.body.appendChild(this.$main);
	}

	private transformCanvaAndPage() {
		const wh = Utils.getScreenWH();
		this.$main.style.width = `${wh.w}px`;
		this.$main.style.height = `${wh.h}px`;
		this.$canvas.style.width = `${wh.w}px`;
		this.$canvas.style.height = `${wh.h}px`;
		this.app.renderer.resize(wh.w, wh.h);
	}

	private initialPixiApp() {
		//Create a Pixi Application
		this.app = new Application({
			antialias: true,
			backgroundAlpha: 0,
			autoDensity: true,
			resolution: 1,
			autoStart: true,
		});
		//Add the canvas that Pixi automatically created for you to the HTML document
		this.$canvas = this.app.view;
		this.$main.appendChild(this.$canvas);

		window.addEventListener("resize", () => {
			this.transformCanvaAndPage();
		});

		this.app.stage.interactive = true;
		this.rootLayer = new Container();
		this.dynamicLayer = new Container();
		this.staticLayer = new Sprite();
		// container of drawing area
		this.rootLayer.addChild(
			this.staticLayer,
			this.dynamicLayer,
		);
		this.app.stage.addChild(this.rootLayer);

		this.brushManager = BrushManager.getInstance();
		this.gpool = GraphicsPool.getInstance(this.state.histroyLength);
		this.tempGraphicsList = [];
	}

	private initialGUI() {
		this.gui = new dat.GUI();
		this.gui.domElement.parentElement.style.zIndex = "1";
		this.gui.domElement.style.transformOrigin = "top right";
		// this.gui.add(this.state, "testScale", 0.3, 1.5).onChange(() => {
		// 	this.transformCanvaAndPage();
		// });
		// this.gui.add(this, "onToggleGUISize").name("Toggle GUI Size");
		// this.gui.add(this.state, "debugDoTexturize");

		const brushStyleFolder = this.gui.addFolder("Brush Style");

		brushStyleFolder.open();
		brushStyleFolder
			.add(this, "brushType", [
				BrushType.Normal,
				BrushType.Eraser,
				// BrushType.Highlighter,
			])
			.name("BrushType")
			.onChange(this._onConfigChange);
		brushStyleFolder
			.add(this, "brushName", [
				BrushName.PENCIL,
				BrushName.CIRCLE,
				BrushName.RECTANGLE,
			])
			.name("BrushName")
			.onChange(this._onConfigChange);
		brushStyleFolder
			.add(this, "brushWidth", 1, 50)
			.onChange(this._onConfigChange);
		brushStyleFolder
			.add(this, "brushAlpha", 0, 1)
			.onChange(this._onConfigChange);
		brushStyleFolder
			.addColor(this, "brushColor")
			.onChange(this._onConfigChange);

		const controlsFolder = this.gui.addFolder("Controls");

		controlsFolder.open();
		controlsFolder.add(this, "undo").name("undo");
		controlsFolder.add(this, "redo").name("redo");
		controlsFolder.add(this, "clearAll").name("clear all");
		// controlsFolder.add(this, "onRecord").name("Record Data");
		// controlsFolder.add(this, "onTestNativeCall").name("Draw Loop");
		// controlsFolder.add(this, "onTestNativeCallOnce").name("Draw Once");
		// controlsFolder.add(this, "onClear").name("Clear");
	}


	private start() {
		this.startTicker();
	}

	private stop() {
		this.stopTicker();
		this.signalClient && this.signalClient.destroy();
		this.signalService && this.signalService.destroy();
	}

	private startTicker() {
		// this.app.ticker.add(this.run);
		this.app.ticker.add(this._tickerHandler);
	}

	private stopTicker() {
		// this.app.ticker.remove(this.run);
		this.app.ticker.remove(this._tickerHandler);
	}

	private _tickerHandler = () => {
		this._mergeStaticLayer();
	}

	private initialDrawEvents() {
		this.app.renderer.plugins.interaction.on("pointerdown", this.onDragStart);
		this.app.renderer.plugins.interaction.on("pointermove", this.onDragMove);
		this.app.renderer.plugins.interaction.on("pointerup", this.onDragEnd);
	}

	private onDragStart = (event: InteractionEvent) => {
		
		this.isDrawing = true;
		let pos = event.data.getLocalPosition(this.dynamicLayer);
		this.signalService.send(
			DataCenter.createDragSignalData(DragType.DRAG_START, pos.x, pos.y)
		);
	};

	private onDragEnd = (event: InteractionEvent) => {
		this.isDrawing = false;
		let pos = event.data.getLocalPosition(this.dynamicLayer);
		this.signalService.send(
			DataCenter.createDragSignalData(DragType.DRAG_END, pos.x, pos.y)
		);
	};

	private onDragMove = (event: InteractionEvent) => {
		if (!this.isDrawing) return;
		let pos = event.data.getLocalPosition(this.dynamicLayer);
		this.signalService.send(
			DataCenter.createDragSignalData(DragType.DRAG, pos.x, pos.y)
		);
	}

	private set brushType(brushType: BrushType) {
		this.signalService.send(
			DataCenter.createBrushTypeData({ 
				__brushType: brushType,
			 })
		);
	}

	private get brushType(): BrushType {
		return this.brushManager.lineStyle.__brushType;
	}

	private set brushName(brushName: BrushName) {
		this.signalService.send(
			DataCenter.createBrushTypeData({
				__brushName: brushName,
			})
		);
	}

	private get brushName(): BrushName {
		return this.brushManager.lineStyle.__brushName;
	}

	private set brushWidth(width: number) {
		this.signalService.send(
			DataCenter.createBrushTypeData({
				width: width
			})
		);
	}

	private get brushWidth(): number {
		return this.brushManager.lineStyle.width;
	}

	private set brushColor(color: number) {
		this.signalService.send(
			DataCenter.createBrushTypeData({
				color: color
			})
		);
	}

	private get brushColor(): number {
		return this.brushManager.lineStyle.color;
	}

	private set brushAlpha(alpha: number) {
		this.signalService.send(
			DataCenter.createBrushTypeData({
				alpha: alpha
			})
		);
	}

	private get brushAlpha(): number {
		return this.brushManager.lineStyle.alpha;
	} 

	private _clearAllHandler() {
		this._resetHistry();

		const g: Graphics = this.gpool.getNewGraphics();
		this.dynamicLayer.addChild(g);
		g.x = g.y = 0;
		g.blendMode = PIXI.BLEND_MODES.ERASE;
		g.beginFill(0x000000, 1)
			.drawRect(0, 0, this.$canvas.width, this.$canvas.height)
			.endFill();
	}
	
	private _drawStart(p: IPointData) {
		this._resetHistry();
		this.brush = this.brushManager.createBursh(this.gpool.getNewGraphics());
		this.dynamicLayer.addChild(this.brush.graphics);
		this.brush.graphics.x = this.brush.graphics.y = 0;
		this.brush.drawStart(p);
		this.state.histroyIndex = Math.min(this.dynamicLayer.children.length - 1, this.state.histroyLength - 1);
	}

	private _drawMove(p: IPointData) {
		this.brush.drawMove(p);
	}

	private _drawEnd(p: IPointData) {
		this.brush.drawEnd(p);
	}

	private _seekHistroy(backIndex: number) {
		if (this.state.histroyIndex === backIndex) return;
		this.state.histroyIndex = backIndex;
		let i: number = backIndex;

		if(i < this.dynamicLayer.children.length - 1) {
			while(i < this.dynamicLayer.children.length - 1) {
				let o: Graphics = this.dynamicLayer.removeChildAt(this.dynamicLayer.children.length - 1) as Graphics;
				this.tempGraphicsList.unshift(o);
			}
		} else {
			while(i >= this.dynamicLayer.children.length && this.tempGraphicsList.length > 0) {
				let o: Graphics = this.tempGraphicsList.shift() as Graphics;
				this.dynamicLayer.addChild(o);
			}
		}
	}

	private _resetHistry() {
		if (this.tempGraphicsList.length <= 0) return;
		this.tempGraphicsList.forEach(v => v.visible = false);
		this.tempGraphicsList = [];
	}

	private _signalRouterAction = (data: SignalData) => {
		if (data.type == SignalType.DRAG_EVENT) {
			const d: SignalDragData = data.data as SignalDragData;
			const p: IPointData = { x: d.x, y: d.y };
			switch (d.type) {
				case DragType.DRAG_START:
					this._drawStart(p);
					break;
				case DragType.DRAG_END:
					this._drawEnd(p);
					break;
				default:
					this._drawMove(p);
					break;
			}
		} else if (data.type == SignalType.STATUS) {
			const d: SignalStatusData = data.data as SignalStatusData;
			if (d.hasOwnProperty('histroyBackIndex')
				&& typeof (d.histroyBackIndex) == 'number'
				&& d.histroyBackIndex != this.state.histroyIndex) {
				this._seekHistroy(d.histroyBackIndex);
			}

			if(d.hasOwnProperty('brushOption')) {
				this.brushManager.lineStyle = d.brushOption;
			}
		} else if(data.type == SignalType.ACTION) {
			const action: PadAction = (data.data as SignalActionData).action;
			switch(action) {
				case PadAction.CLEAR_ALL:
					this._clearAllHandler();
					break;
				default:
					break;
			}
		}
	}

	private _mergeStaticLayer() {
		if (this.dynamicLayer == undefined || this.dynamicLayer.children.length <= this.state.histroyLength) return;
		while(this.dynamicLayer.children.length > this.state.histroyLength) {
			let o: Graphics = this.dynamicLayer.removeChildAt(0) as Graphics;
			this.staticLayer.addChild(o);
		}
		//截图
		const padWH = { w: this.$canvas.clientWidth, h: this.$canvas.clientHeight };
		let texture: PIXI.Texture = this.app.renderer.generateTexture(this.staticLayer, { region: new PIXI.Rectangle(0, 0, padWH.w, padWH.h) });

		this.staticLayer.removeChildren().forEach(v => v.visible = false);	//标记可回收
		this.staticLayer.texture.destroy(true);
		this.staticLayer.texture = texture;

		//回收
		this.gpool.recover();
	}

	private _onConfigChange = (evt) => {
		console.log(evt);
	}

	public undo() {
		console.log('undo');
		const curr = this.state.histroyIndex;
		if(curr >= 0) {
			this.signalService.send(
				DataCenter.createHistroyIndexData(curr - 1)
			);
		}
	}

	public redo() {
		console.log('redo');
		const curr = this.state.histroyIndex;
		if (this.tempGraphicsList.length > 0) {
			this.signalService.send(
				DataCenter.createHistroyIndexData(curr + 1)
			);
		}
	}

	public clearAll() {
		console.log('clear all');
		this.signalService.send(
			DataCenter.createActionData(PadAction.CLEAR_ALL)
		);
	}

}


const padMode: PadMode = (Utils.getQueryString('mode') == 'reciver') ? PadMode.RECIVER : PadMode.SERVICE;
const pad = new Pad(padMode);

