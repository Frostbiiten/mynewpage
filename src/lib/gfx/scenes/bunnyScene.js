import { BlurFilter, Container, Sprite, Assets } from "pixi.js";
import { AdjustmentFilter } from "pixi-filters";
import { KawaseBlurFilter } from "$lib/gfx/shaders/LensBlur/KawaseBlurFilter"
import { DisplacementFilter } from "pixi.js";
import bg from "$lib/img/bg.webp";
import bgBokeh from "$lib/img/bgbokeh.webp";

const Dist = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
const easeInOutCubic = (x) => { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const easeIn = (x, n = 2) => Math.pow(x, n);
const easeOut = (x, n = 2) => 1 - Math.pow(1 - x, n);

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

export function mountBunnyScene(app) {

	//const toLinear = new GammaFilter(2.2);
	//const blur = new BlurFilter({quality: 1});
	const blur = new KawaseBlurFilter({quality: 3, gamma: 16});
	const darken = new AdjustmentFilter({gamma: 1 / 5});
	const lighten = new AdjustmentFilter({gamma: 5});
	//const toSRGB = new GammaFilter(1.0 / 2.2);

	const mouseState = {
		smoothX: 0,
		smoothY: 0,
		targetX: 0,
		targetY: 0,
		dist01: 1,
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
		mouseState.smoothX += (tx - mouseState.smoothX) * 0.039;
		mouseState.smoothY += (ty - mouseState.smoothY) * 0.039;
	};

	// Background layer
	const backgroundLayer = new Container();
	app.stage.addChild(backgroundLayer);
	let backgroundSprite = null;
	let backgroundBokehSprite = null;

	const setupBackground = async () => {

		Assets.load(bg).then((tex) =>
		{
			backgroundSprite = new Sprite(tex);
			backgroundSprite.filters = [blur];
			//backgroundSprite.filters = [darken, blur, lighten];
			//backgroundSprite.filters = [toLinear, blur, toSRGB];
			backgroundLayer.addChildAt(backgroundSprite, 0);
			fitCover(backgroundSprite, app.screen.width, app.screen.height);
		});

		Assets.load(bgBokeh).then((tex) =>
		{
			backgroundBokehSprite = new Sprite(tex);
			backgroundLayer.addChild(backgroundBokehSprite);
			fitCover(backgroundBokehSprite, app.screen.width, app.screen.height);
		});

	};
	setupBackground();

	const updateParallax = () => {
		backgroundLayer.pivot.set(backgroundLayer.width * 0.5, backgroundLayer.height * 1.0);
		backgroundLayer.x = mouseState.smoothX * 3 + backgroundLayer.width * 0.5 + 100;
		backgroundLayer.y = mouseState.smoothY * 1.5 + backgroundLayer.height - 250;
		backgroundLayer.scale = 1.3;
	}

	const resize = () => {
		if (backgroundSprite) {
			fitCover(backgroundSprite, app.screen.width, app.screen.height);
		}
		if (backgroundBokehSprite) {
			fitCover(backgroundBokehSprite, app.screen.width, app.screen.height);
		}
	};
	app.renderer.on("resize", resize);

	const tick = (time) => {
		updateMouse();

		const blurFactor = 1 - mouseState.dist01;
		blur.strength = blurFactor * 5;
		
		if (backgroundBokehSprite)
		{
			//backgroundBokehSprite.alpha = easeOut(Math.min(1, Math.max(blurFactor - 0.3, 0) * 1.2), 2);
			backgroundBokehSprite.alpha = 0;
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