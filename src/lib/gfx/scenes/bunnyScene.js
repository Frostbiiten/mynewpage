import { BlurFilter, Container, Sprite, TilingSprite, Texture, Assets } from "pixi.js";
import { AdjustmentFilter } from "pixi-filters";
import { KawaseBlurFilter } from "$lib/gfx/shaders/LensBlur/KawaseBlurFilter"
import { DisplacementFilter } from "pixi.js";
//import bg from "$lib/img/outside.webp";
import bg from "$lib/img/bg.webp";

const Dist = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
const easeInOutCubic = (x) => { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const easeIn = (x, n = 2) => Math.pow(x, n);
const easeOut = (x, n = 2) => 1 - easeIn(1 - x, n);
const easeInOut = (x, n = 2) => {
	x = Math.min(Math.max(x, 0), 1);
	const easingOut = x > 0.5;
	let progress = easeIn(Math.pow(2, 1 - 1 / n) * (easingOut ? 1 - x : x), n);
	if (easingOut) progress = 1 - progress;
	return progress;
};
function easeInOutExpo(x) {
	x = Math.min(Math.max(x, 0), 1);
	return  x < 0.5 ? Math.pow(2, 20 * x - 10) / 2
			: (2 - Math.pow(2, -20 * x + 10)) / 2;
}

function fitCover(sprite, width, height) {
	if (!sprite.texture || !sprite.texture.source) return;

	const source = sprite.texture.source;
	const targetRatio = width / height;
	const sourceRatio = source.width / source.height;

	let scale;
	if (targetRatio > sourceRatio) {
		scale = width / source.width;
	} else {
		scale = height / source.height;
	}

	sprite.scale.set(scale);
	sprite.anchor.set(0.5);
	sprite.position.set(width / 2, height / 2);
}

function matchWidth(sprite, width, scale) {
	if (!sprite.texture || !sprite.texture.source) return;

	const source = sprite.texture.source;
	const newScale = width / source.width * scale;
	sprite.scale.set(newScale);
}

export function mountBunnyScene(app) {

	const blur = new KawaseBlurFilter({quality: 4});
	//const grade = new AdjustmentFilter({gamma: 0.95, contrast: 1.1, saturation: 1.12});

	const mouseState = {
		smoothX: 0,
		smoothY: 0,
		targetX: 0,
		targetY: 0,
		dist01: 1,
		screenDist01: 1,
	};

	const updateMouse = () => {
		const rect = app.canvas.getBoundingClientRect();
		const pointer = app.renderer.events.pointer;

		const relativeX = pointer.x - rect.left;
		const relativeY = pointer.y - rect.top;

		// [-1, 1]
		const tx = (relativeX / rect.width - 0.5) * 2;
		const ty = (relativeY / rect.height - 0.5) * 2;

		// goofy [0, 1]
		const dist = Math.abs(tx - 0.5);

		mouseState.targetX = tx;
		mouseState.targetY = ty;
		mouseState.dist01 = Math.min(dist, 1);
		mouseState.screenDist01 = relativeX / app.screen.width;
		mouseState.smoothX += (tx - mouseState.smoothX) * 0.039;
		mouseState.smoothY += (ty - mouseState.smoothY) * 0.039;
	};

	// Background layer
	const backgroundLayer = new Container();
	// backgroundLayer.filters = [grade];
	app.stage.addChild(backgroundLayer);
	let backgroundBlurSprite = null;
	let defaultBackgroundLayer = null;
	let grainSprite = null;

	const setupBackground = async () => {

		Assets.load(bg).then((tex) =>
		{
			backgroundBlurSprite = new Sprite(tex);
			backgroundBlurSprite.filters = [blur];
			backgroundLayer.addChildAt(backgroundBlurSprite, 0);
			resize();
		});

		Assets.load(bg).then((tex) =>
		{
			defaultBackgroundLayer = new Sprite(tex);
			backgroundLayer.addChild(defaultBackgroundLayer);
			resize();

			// ensure right order
			const svgNoise = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E";
			Assets.load(svgNoise).then((grainTex) => {
				grainTex.source.addressMode = 'repeat';

				grainSprite = new TilingSprite({
					texture: grainTex,
					width: app.screen.width * 2,
					height: app.screen.height * 2,
					blendMode: 'multiply',
					alpha: 0.65
				});

				backgroundLayer.addChild(grainSprite);
			});
		});
	};

	setupBackground();

	const updateParallax = () => {
		backgroundLayer.pivot.set(backgroundLayer.width * 1.0, backgroundLayer.height * 1.0);
		//backgroundLayer.x = mouseState.smoothX * 6 + backgroundLayer.width - 40;
		//backgroundLayer.y = mouseState.smoothY * 4 + backgroundLayer.height;
		backgroundLayer.x = mouseState.smoothX * 6 + backgroundLayer.width - 40;
		backgroundLayer.y = mouseState.smoothY * 4 + backgroundLayer.height - 700;
	}

	const resize = () => {
		if (backgroundBlurSprite) {
			matchWidth(backgroundBlurSprite, app.screen.width, 1.2)
		}
		if (defaultBackgroundLayer) {
			matchWidth(defaultBackgroundLayer, app.screen.width, 1.2)
		}
	};
	app.renderer.on("resize", resize);

	let blurLerp = 0;
	let frame = 0;
	const tick = (time) => {
		++frame;
		updateMouse();

		const blurFactor = 1 - mouseState.dist01;
		blurLerp = blurLerp + (blurFactor - blurLerp) * (blurLerp > blurFactor ? 0.015 : 0.05);
		//blur.strength = easeOut(Math.min(blurFactor, 1), 2) * 20;
		//blur.strength = Math.max(easeInOut(blurLerp, 7) - 0.01, 0) * 20;
		const normalizedBlur = Math.max(easeInOut(blurLerp, 2) - 0.001, 0);
		blur.strength = normalizedBlur * 8;
		blur.gamma = normalizedBlur * 5 + 6;
		blur.quality = normalizedBlur < 0.1 ? 1 : 4;

		if (defaultBackgroundLayer)
		{
			defaultBackgroundLayer.alpha = 0;
			if (backgroundLayer)
			{
				/*
				const start = 0.7;
				defaultBackgroundLayer.alpha = Math.max(Math.abs(mouseState.screenDist01 - 0.75) * 1.2 - start, 0) / (1 - start) ;
				*/
				const s = 0.98;
				defaultBackgroundLayer.alpha = Math.max((1 - normalizedBlur) - s, 0) / (1 - s);
			}
		}

		if (frame % 24 == 0 && grainSprite)
		{
			grainSprite.tilePosition.x = Math.random() * 600;
			grainSprite.tilePosition.y = Math.random() * 600;
			console.log(grainSprite.tilePosition.x)
		}

		updateParallax();
	};
	app.ticker.add(tick);

	return () => {
		app.ticker.remove(tick);
		app.renderer.off("resize", resize);
		backgroundLayer.destroy({ children: true });
	};
}