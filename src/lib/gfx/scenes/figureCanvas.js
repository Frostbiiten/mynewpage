import {
  Container,
  Sprite,
  Texture,
  Assets,
  DisplacementFilter,
} from "pixi.js";
import { KawaseBlurFilter } from "$lib/gfx/shaders/LensBlur/KawaseBlurFilter";
import figure0 from "$lib/img/figure/0.webp";
import figure1 from "$lib/img/figure/1.webp";

const GRAD_STOPS_MULTIPLY = [
  { offset: 0.2, color: "rgba(2, 6, 23, 1.0)" },
  { offset: 0.6, color: "rgba(233, 220, 128, 0.7)" },
];

const GRAD_STOPS_OVERLAY = [
  { offset: 0.6, color: "rgba(29, 26, 69, 0.4)" },
  { offset: 0.91, color: "rgba(242, 131, 10, 1.0)" },
];

const easeInOutCubic = (x) => {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

function createBakedBlendTexture(
  sourceTexture,
  width,
  height,
  colorStops,
  blendMode,
  widthMult = 1.0,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const image = sourceTexture.source.resource;

  ctx.drawImage(image, 0, 0, width, height);
  ctx.globalCompositeOperation = blendMode;

  const virtualWidth = width * widthMult;
  const grad = ctx.createLinearGradient(0, height, virtualWidth, 0);
  colorStops.forEach((stop) => grad.addColorStop(stop.offset, stop.color));

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(image, 0, 0, width, height);

  return Texture.from(canvas);
}

export function mountHeroFigure(app, mouseState, characterHover) {
  let hover = !!characterHover;

  const blur = new KawaseBlurFilter({ quality: 4 });

  const preblurContainer = new Container();
  preblurContainer.filters = [blur];
  app.stage.addChild(preblurContainer);
  preblurContainer.scale.set(1.5);

  const baseSpriteContainer = new Container();
  preblurContainer.addChild(baseSpriteContainer);

  let spriteBase0, spriteMul0, spriteOvr0;
  let spriteBase1, spriteMul1, spriteOvr1;

  const setupFigure = async () => {
    const t0 = await Assets.load(figure0);
    const t1 = await Assets.load(figure1);

    spriteBase0 = new Sprite(t0);
    spriteBase0.visible = !hover;
    baseSpriteContainer.addChild(spriteBase0);

    const texMul0 = createBakedBlendTexture(
      t0,
      t0.width,
      t0.height,
      GRAD_STOPS_MULTIPLY,
      "multiply",
      2,
    );
    spriteMul0 = new Sprite(texMul0);
    spriteMul0.alpha = 0;
    spriteMul0.visible = !hover;
    baseSpriteContainer.addChild(spriteMul0);

    const texOvr0 = createBakedBlendTexture(
      t0,
      t0.width,
      t0.height,
      GRAD_STOPS_OVERLAY,
      "screen",
      1,
    );
    spriteOvr0 = new Sprite(texOvr0);
    spriteOvr0.alpha = 0;
    spriteOvr0.visible = !hover;
    baseSpriteContainer.addChild(spriteOvr0);

    // next pose
    spriteBase1 = new Sprite(t1);
    spriteBase1.visible = hover;
    baseSpriteContainer.addChild(spriteBase1);

    const texMul1 = createBakedBlendTexture(
      t1,
      t1.width,
      t1.height,
      GRAD_STOPS_MULTIPLY,
      "multiply",
      2,
    );
    spriteMul1 = new Sprite(texMul1);
    spriteMul1.alpha = 0;
    spriteMul1.visible = hover;
    baseSpriteContainer.addChild(spriteMul1);

    const texOvr1 = createBakedBlendTexture(
      t1,
      t1.width,
      t1.height,
      GRAD_STOPS_OVERLAY,
      "screen",
      1,
    );
    spriteOvr1 = new Sprite(texOvr1);
    spriteOvr1.alpha = 0;
    spriteOvr1.visible = hover;
    baseSpriteContainer.addChild(spriteOvr1);

    const multiNoiseSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E
        <filter id='combinedNoise'>
			<feTurbulence type='turbulence' baseFrequency='0.0030' numOctaves='2' result='coarse' />
			<feTurbulence type='fractalNoise' baseFrequency='0.030' numOctaves='3' result='fine' />
			<feComposite in='coarse' in2='fine' operator='arithmetic' k1='0' k2='1.0' k3='0.15' k4='0' />
        </filter>
        <rect width='100%25' height='100%25' filter='url(%23combinedNoise)' />
        %3C/svg%3E`;

    Assets.load(multiNoiseSVG).then((noiseTex) => {
      noiseTex.source.addressMode = "repeat";
      noiseTex.source.scaleMode = "nearest";

      const displacementSprite = new Sprite(noiseTex);
      displacementSprite.visible = false;
      app.stage.addChild(displacementSprite);

      const sketchFilter = new DisplacementFilter(displacementSprite);
      sketchFilter.scale.set(11, 10);

      baseSpriteContainer.filters = [sketchFilter];
      baseSpriteContainer.displacementMap = displacementSprite;
    });
  };

  setupFigure();

  const updateParallax = () => {
    baseSpriteContainer.x = mouseState.smoothX * 6;
    baseSpriteContainer.y = mouseState.smoothY * 4;
  };

  let frame = 0;
  const jitterInterval = 24;
  let jitterTimer = 0;

  const tick = (time) => {
    updateParallax();

    const d = mouseState.dist01;
    const alphaMul = Math.max(Math.min(d * 0.6 + 0.3, 1), 0);
    const alphaOvr = 1 - Math.max(0, d * 1.5);

    if (spriteMul0) {
      spriteMul0.alpha = alphaMul;
      spriteOvr0.alpha = alphaOvr;

      spriteMul1.alpha = alphaMul;
      spriteOvr1.alpha = alphaOvr;
    }

    blur.gamma = 2;
    blur.strength =
      easeInOutCubic(Math.max(0, mouseState.dist01 - 0.6) * 2) * 5;

    if (jitterTimer > jitterInterval && baseSpriteContainer.displacementMap) {
      const step = 4;
      baseSpriteContainer.displacementMap.x =
        Math.floor((Math.random() * 600) / step) * step;
      baseSpriteContainer.displacementMap.y =
        Math.floor((Math.random() * 600) / step) * step;
      jitterTimer %= jitterInterval;
    }

    ++frame;
    jitterTimer += time.deltaTime;
  };
  app.ticker.add(tick);

  return {
    setHover(v) {
      hover = !!v;
      if (!spriteBase0 || !spriteBase1) return;

      spriteBase0.visible = !hover;
      spriteMul0.visible = !hover;
      spriteOvr0.visible = !hover;

      spriteBase1.visible = hover;
      spriteMul1.visible = hover;
      spriteOvr1.visible = hover;
    },
    destroy() {
      app.ticker.remove(tick);
      baseSpriteContainer.destroy({ children: true });
    },
  };
}
