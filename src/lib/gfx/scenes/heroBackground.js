import {
  BlurFilter,
  Container,
  Sprite,
  TilingSprite,
  Texture,
  Assets,
  Graphics,
  HardMixBlend,
  ExclusionBlend,
  RenderTexture,
  Rectangle,
} from "pixi.js";
import {
  AdjustmentFilter,
  RadialBlurFilter,
  ZoomBlurFilter,
} from "pixi-filters";
import { KawaseBlurFilter } from "$lib/gfx/shaders/LensBlur/KawaseBlurFilter";
import { DisplacementFilter } from "pixi.js";
//import bg from "$lib/img/outside.webp";
import bg from "$lib/img/bg.webp";
import { scale } from "svelte/transition";

const Dist = (x1, y1, x2, y2) =>
  Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
const easeInOutCubic = (x) => {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
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
  return x < 0.5
    ? Math.pow(2, 20 * x - 10) / 2
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
  const newScale = (width / source.width) * scale;
  sprite.scale.set(newScale);
}

function matchHeight(sprite, height, scale) {
  if (!sprite.texture || !sprite.texture.source) return;

  const source = sprite.texture.source;
  const newScale = (height / source.height) * scale;
  sprite.scale.set(newScale);
}

export function mountHeroBackground(app, mouseState) {
  const gradeFilter = new AdjustmentFilter({
    gamma: 0.45,
    brightness: 0.6,
    saturation: 0.7,
  });
  const ringFilter = new ZoomBlurFilter({ quality: 3, center: [35, 35] });
  const bgBlurFilter = new KawaseBlurFilter({ quality: 4 });

  let sketchFilter;
  let hover;

  const updateMouse = () => {
    const pointer = app.renderer.events.pointer;

    const relativeX = pointer.screen.x;
    const relativeY = pointer.screen.y;

    // [-1, 1]
    const tx = (relativeX / app.screen.width - 0.5) * 2;
    const ty = (relativeY / app.screen.height - 0.5) * 2;

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

  const ringGraphics = new Graphics();
  app.stage.addChild(backgroundLayer);
  let defaultBackgroundSprite = null;
  let backgroundBlurSprite = null;
  let ringContainer = null;
  let grainSprite = null;
  let displacementSprite = null;
  let gridSprite = null;

  // Petals
  const petalBlur = new KawaseBlurFilter({ quality: 2 });
  let petalRT = null;
  let petalSource = null;
  let petalDispSprite = null;
  let petalDispFilter = null;
  let petalRing = null;

  const squigglyPath =
    "M20.8202 45.0001C18.4702 45.4801 16.1202 46.0001 13.7602 46.4501C11.3124 47.0029 8.80953 47.2746 6.30015 47.2601C5.74571 47.2583 5.2006 47.1173 4.71486 46.85C4.22912 46.5826 3.81831 46.1976 3.52016 45.7301C2.69418 44.6045 2.17083 43.2858 2.00016 41.9001C1.77542 40.0839 1.40761 38.2884 0.900157 36.5301C0.785356 36.072 0.784576 35.5927 0.897891 35.1342C1.01121 34.6757 1.23516 34.252 1.55015 33.9001C1.73015 33.6301 1.92016 33.3801 2.04016 33.2001C5.35016 32.7101 8.59016 32.2001 11.8202 31.7301C14.1502 31.3601 16.4702 30.9101 18.8202 30.5601C19.8202 30.4101 20.8202 30.4501 21.8202 30.3601C22.5702 30.2901 23.3102 30.1601 24.2402 30.0301C23.3502 29.1201 22.6102 28.3901 21.8902 27.6401C17.8902 23.4501 13.8902 19.2501 9.89015 15.0801C9.71432 14.9344 9.59363 14.733 9.54815 14.5092C9.50267 14.2854 9.53514 14.0529 9.64015 13.8501C10.0002 12.5201 11.0002 11.6001 11.7202 10.5001C12.4407 9.70899 13.4338 9.2196 14.5002 9.1301C15.9102 8.8201 17.3502 8.6201 18.7302 8.2301C19.239 8.0432 19.7901 8.00317 20.3206 8.11457C20.851 8.22597 21.3395 8.48431 21.7302 8.8601C22.8902 9.9501 23.9902 11.1001 25.1002 12.2501C25.4189 12.608 25.7193 12.9818 26.0002 13.3701L26.3002 13.2101C26.3002 12.9601 26.3602 12.7201 26.3502 12.4701C26.1743 9.38478 26.3049 6.28963 26.7402 3.2301C26.798 2.72042 26.7572 2.20438 26.6202 1.7101C26.5877 1.62098 26.5739 1.52612 26.5798 1.43145C26.5856 1.33678 26.6109 1.24433 26.6541 1.15988C26.6972 1.07542 26.7574 1.00077 26.8307 0.94059C26.904 0.880408 26.9889 0.835987 27.0802 0.810101C27.5002 0.620101 27.8902 0.360098 28.3602 0.100098L36.4502 1.1001C36.9265 1.16758 37.3976 1.26783 37.8602 1.4001C38.28 1.51599 38.6647 1.73356 38.9804 2.03356C39.2961 2.33356 39.533 2.70675 39.6702 3.1201C40.2209 4.82589 40.4316 6.62319 40.2902 8.4101C40.2902 12.7501 40.2902 17.0901 40.2202 21.4101C40.2202 21.7401 40.2202 22.0801 40.2202 22.6401C40.4983 22.45 40.7593 22.2358 41.0002 22.0001C43.8468 18.5934 46.6868 15.1801 49.5202 11.7601L58.0002 1.5901C59.1202 2.1701 60.3202 2.0801 61.2302 2.9601C61.6094 3.2595 61.898 3.65827 62.064 4.11203C62.2299 4.56578 62.2667 5.05669 62.1702 5.5301C62.0938 5.8523 62.0882 6.18723 62.1539 6.5118C62.2195 6.83636 62.3547 7.14284 62.5502 7.4101C62.73 7.69627 62.8775 8.00146 62.9902 8.3201C63.0482 8.43824 63.0823 8.56668 63.0906 8.69805C63.0989 8.82941 63.0811 8.96112 63.0384 9.08561C62.9957 9.2101 62.9288 9.32494 62.8415 9.42352C62.7543 9.5221 62.6485 9.6025 62.5302 9.6601C61.8488 10.1191 61.2096 10.6378 60.6202 11.2101C60.2905 11.4903 60.0158 11.8294 59.8102 12.2101C58.1102 15.7301 55.4402 18.5601 53.1102 21.6301C52.4102 22.5501 51.6402 23.4201 50.9402 24.3401C50.6584 24.7856 50.4078 25.25 50.1902 25.7301C51.3302 25.6001 52.1902 25.5201 53.0802 25.3901L69.8202 22.8501C70.2802 22.7801 70.8202 22.4901 71.1602 22.6701C71.8247 23.0297 72.3832 23.5572 72.7802 24.2001C72.8642 24.3958 73.0036 24.5625 73.1813 24.6798C73.359 24.7971 73.5672 24.8598 73.7802 24.8601C74.4058 24.9531 74.991 25.2256 75.4649 25.6444C75.9388 26.0633 76.281 26.6106 76.4501 27.2201C76.9137 28.7402 77.2877 30.2862 77.5702 31.8501C77.6902 32.4101 77.7502 32.9901 77.8302 33.5501C78.0402 34.9201 77.5302 35.4601 76.1602 35.6101C73.7202 35.8701 71.2702 36.1201 68.8602 36.6101C63.7502 37.6101 58.6702 38.6701 53.5702 39.7101C53.4101 39.7569 53.2531 39.8137 53.1002 39.8801C53.29 40.2324 53.5109 40.567 53.7602 40.8801C57.3798 44.7109 61.2231 48.3239 65.2701 51.7001C66.3601 52.5701 67.4902 53.4001 68.5302 54.3301C68.9715 54.7694 69.3305 55.2842 69.5901 55.8501C69.6627 56.0068 69.7003 56.1774 69.7003 56.3501C69.7003 56.5228 69.6627 56.6934 69.5901 56.8501C68.2801 59.3401 66.8202 61.7501 64.3502 63.2601C63.7867 63.6624 63.1378 63.9286 62.4542 64.0379C61.7706 64.1473 61.0709 64.0967 60.4102 63.8901C59.8573 63.7367 59.273 63.7367 58.7202 63.8901C58.4428 63.9632 58.15 63.9518 57.8792 63.8573C57.6084 63.7629 57.3719 63.5898 57.2002 63.3601C54.5702 60.6001 52.0002 57.8501 49.3202 55.2001C47.3202 53.2701 45.3202 51.4701 43.2602 49.6101C42.6002 49.0001 42.0002 48.3801 41.0702 47.5501C41.0702 48.8101 41.0002 49.7501 41.0702 50.6801C41.5102 55.4801 41.9902 60.2801 42.4602 65.0901C42.5668 65.5527 42.6238 66.0254 42.6302 66.5001C42.5354 66.9491 42.3164 67.3624 41.9981 67.693C41.6799 68.0237 41.2752 68.2583 40.8302 68.3701C39.2702 69.0001 37.6402 69.4701 36.1002 70.1201C35.6831 70.304 35.2276 70.3837 34.7729 70.3524C34.3182 70.321 33.878 70.1795 33.4902 69.9401C33.0302 69.6901 32.6002 69.4001 32.1102 69.1101L30.1102 51.7501C29.8541 51.9842 29.6136 52.2348 29.3902 52.5001C27.0568 55.7601 24.7235 59.0234 22.3902 62.2901C20.7768 64.5768 19.1835 66.8768 17.6102 69.1901C17.2704 69.8321 16.6968 70.319 16.0081 70.5498C15.3193 70.7806 14.5682 70.7378 13.9102 70.4301C11.7035 69.7001 9.64947 68.5714 7.85015 67.1001C7.57895 66.898 7.3278 66.6703 7.10015 66.4201C6.90191 66.2331 6.74397 66.0076 6.63601 65.7574C6.52806 65.5072 6.47237 65.2376 6.47237 64.9651C6.47237 64.6926 6.52806 64.423 6.63601 64.1728C6.74397 63.9226 6.90191 63.6971 7.10015 63.5101C9.07508 61.2864 10.9182 58.9491 12.6202 56.5101C14.4402 53.8001 16.5402 51.2901 18.4902 48.6701C19.3202 47.5601 20.0802 46.4101 20.8702 45.2801L20.8202 45.0001ZM36.5702 61.8201C36.323 63.1073 36.5429 64.4404 37.1902 65.5801L36.5702 61.8201Z";
  const SVG_RASTER = 512;
  const squigglySVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
	<svg xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 80 80"
		width="${SVG_RASTER}" height="${SVG_RASTER}">
		<path fill="white" d="${squigglyPath}" />
	</svg>
	`)}`;
  const squigglyContainer = new Container();
  const petals = [];

  const RT_SIZE = 220;
  const RING_RADIUS = 185;
  const PETAL_COUNT = 7;

  const renderPetalRT = () => {
    if (!petalRT || !petalSource) return;

    app.renderer.render({
      container: petalSource,
      target: petalRT,
      clear: true,
    });
  };

  const setupBackground = async () => {
    Assets.load(bg).then((tex) => {
      backgroundBlurSprite = new Sprite(tex);
      backgroundBlurSprite.filters = [gradeFilter, bgBlurFilter];
      backgroundLayer.addChildAt(backgroundBlurSprite, 0);
      resize();
    });

    Assets.load(bg).then((tex) => {
      defaultBackgroundSprite = new Sprite(tex);
      backgroundLayer.addChild(defaultBackgroundSprite);
      resize();

      // PETALS
      backgroundLayer.addChild(squigglyContainer);
      squigglyContainer.scale.set(2.2);
      squigglyContainer.filters = [new ExclusionBlend(), petalBlur];

      const multiNoiseSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E
			<filter id='combinedNoise'>
			<feTurbulence type='turbulence' baseFrequency='0.007' numOctaves='2' result='coarse' />
			<feTurbulence type='fractalNoise' baseFrequency='0.030' numOctaves='3' result='fine' />
			<feComposite in='coarse' in2='fine' operator='arithmetic' k1='0' k2='1.0' k3='0.65' k4='0' />
			</filter>
			<rect width='100%25' height='100%25' filter='url(%23combinedNoise)' />
			%3C/svg%3E`;

      let petalDispFilter = null;
      let petalRing = null;

      // todo: descrease this
      const RT_SIZE = 128;
      const RING_RADIUS = 175;
      const PETAL_COUNT = 7;

      Promise.all([Assets.load(squigglySVG), Assets.load(multiNoiseSVG)]).then(
        ([squigTex, noiseTex]) => {
          noiseTex.source.addressMode = "repeat";

          petalDispSprite = new Sprite(noiseTex);
          petalDispSprite.visible = false;
          petalDispSprite.renderable = false;
          app.stage.addChild(petalDispSprite);

          petalDispFilter = new DisplacementFilter(petalDispSprite);
          petalDispFilter.scale.set(7, 7);

          petalRT = RenderTexture.create({
            width: RT_SIZE,
            height: RT_SIZE,
            resolution: 1,
          });

          petalSource = new Container();
          petalSource.filters = [petalDispFilter];
          petalSource.filterArea = new Rectangle(0, 0, RT_SIZE, RT_SIZE);

          const s = new Sprite(squigTex);
          s.anchor.set(0.5);
          s.position.set(RT_SIZE * 0.5, RT_SIZE * 0.5);
          s.tint = 0xf0dca0;
          s.scale.set(0.2);
          //s.y += 30;
          petalSource.addChild(s);

          renderPetalRT();

          petalRing = new Container();
          squigglyContainer.addChild(petalRing);

          const step = (Math.PI * 2) / PETAL_COUNT;
          for (let i = 0; i < PETAL_COUNT; i++) {
            const a = i * step;

            const spr = new Sprite(petalRT);
            spr.anchor.set(0.5);
            spr.x = Math.cos(a) * RING_RADIUS;
            spr.y = Math.sin(a) * RING_RADIUS;
            spr.scale.set(0.5);

            spr.rotation = a + Math.PI / 2;

            petalRing.addChild(spr);
            petals.push(spr);
          }
        },
      );
    });

    // ensure right order
    const svgNoise =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E";
    Assets.load(svgNoise).then((grainTex) => {
      grainTex.source.addressMode = "repeat";
      grainSprite = new TilingSprite({
        texture: grainTex,
        width: app.screen.width * 2,
        height: app.screen.height * 2,
        blendMode: "multiply",
        alpha: 0.5,
      });
      grainSprite.tileScale.set(0.5);

      app.stage.addChild(grainSprite);

      // GRID
      const gridSize = 38;
      const graphics = new Graphics();

      graphics.rect(0, 0, gridSize, gridSize);
      graphics.stroke({ width: 1, color: 0x808080, alpha: 0.07 });

      const gridTexture = app.renderer.generateTexture({ target: graphics });

      gridSprite = new TilingSprite({
        texture: gridTexture,
        width: app.screen.width * 1.2,
        height: app.screen.height * 1.2,
      });

      gridSprite.anchor.set(1, 1);
      gridSprite.x = app.screen.width;
      gridSprite.y = app.screen.height;
      app.stage.addChild(gridSprite);

      // RINGS
      app.stage.addChild(ringGraphics);
      ringGraphics.position.set(35, 35);

      const circleCount = 12;
      const ringRadius = 70 * 2;
      const strokeWidth = 1 * 2;
      const strokeColor = 0x1e3a8a;

      const step = (1 / circleCount) * Math.PI * 2;
      let angle = 0;
      for (let i = 0; i < circleCount; i++) {
        angle += step;
        const x = Math.sin(angle) * ringRadius;
        const y = -Math.cos(angle) * ringRadius;
        ringGraphics.circle(x, y, ringRadius);
      }

      ringGraphics.stroke({
        width: strokeWidth,
        color: strokeColor,
        alpha: 0.9,
      });
      ringGraphics.filters = [ringFilter];
    });
  };

  setupBackground();

  const updateParallax = () => {
    backgroundLayer.pivot.set(backgroundLayer.width, backgroundLayer.height);
    backgroundLayer.x = mouseState.smoothX * 6 + backgroundLayer.width - 120;
    backgroundLayer.y = mouseState.smoothY * 4 + backgroundLayer.height - 700;

    if (gridSprite) {
      gridSprite.x = app.screen.width + mouseState.smoothX * -3;
      gridSprite.y = app.screen.height + mouseState.smoothY * -1;
    }

    if (squigglyContainer) {
      squigglyContainer.x =
        1212 * 0.85 + app.screen.width * 0.15 + mouseState.smoothX * -13 - 60;
      squigglyContainer.y = 1150 + mouseState.smoothY * -8;
    }
  };

  const resize = () => {
    const scaleFactor = 2.18;
    if (backgroundBlurSprite) {
      matchHeight(backgroundBlurSprite, app.screen.height, scaleFactor);
    }
    if (defaultBackgroundSprite) {
      matchHeight(defaultBackgroundSprite, app.screen.height, scaleFactor);
    }

    if (gridSprite) {
      gridSprite.width = app.screen.width;
      gridSprite.height = app.screen.height;
    }

    if (grainSprite) {
      grainSprite.width = app.screen.width * 2;
      grainSprite.height = app.screen.height * 2;
    }
  };

  app.renderer.on("resize", resize);

  let frame = 0;
  let blurLerp = 0;
  let curScale = 0.5;
  const jitterInterval = 13;
  let jitterTimer = 0;

  const tick = (time) => {
    updateMouse();

    const blurFactor = 1 - mouseState.dist01;
    blurLerp =
      blurLerp +
      (blurFactor - blurLerp) * (blurLerp > blurFactor ? 0.05 : 0.05);
    const normalizedBlur = Math.max(easeInOut(blurLerp, 2) - 0.001, 0);
    bgBlurFilter.strength = normalizedBlur * 8;
    bgBlurFilter.gamma = normalizedBlur * 5 + 6;
    bgBlurFilter.quality = normalizedBlur < 0.1 ? 1 : 4;

    // Background
    if (defaultBackgroundSprite) {
      defaultBackgroundSprite.alpha = 0;
      if (backgroundLayer) {
        const s = 0.98;
        defaultBackgroundSprite.alpha =
          Math.max(1 - normalizedBlur - s, 0) / (1 - s);
      }
    }

    // Grain
    if (frame % 24 == 0 && grainSprite) {
      grainSprite.tilePosition.x = Math.random() * 600;
      grainSprite.tilePosition.y = Math.random() * 600;
    }

    // Petals
    if (jitterTimer > jitterInterval && petalDispSprite) {
      const step = 4;
      petalDispSprite.x = Math.floor((Math.random() * 100) / step) * step;
      petalDispSprite.y = Math.floor((Math.random() * 100) / step) * step;
      renderPetalRT();

      jitterTimer %= jitterInterval;
    }

    if (squigglyContainer) {
      squigglyContainer.rotation += time.deltaTime * 0.0006;
      const targetBlur = easeInOutCubic(Math.abs(1 - mouseState.dist01)) * 2;
      petalBlur.enabled = targetBlur > 0.01;
      petalBlur.strength = targetBlur;
    }

    // Ring Graphics
    ringGraphics.rotation += time.deltaTime * 0.002;

    const targetScale = hover ? 1 : 0;
    const delta = 0.01 * time.deltaTime;
    curScale = curScale + (targetScale - curScale) * 0.06;

    ringGraphics.scale.set((Math.exp(curScale) / Math.E) * 1.5);
    ringGraphics.alpha = 1 - curScale * 0.5;

    if (ringFilter) {
      const v = curScale;
      const dist =
        easeInOut(
          Math.min(1, Math.abs(mouseState.screenDist01 * 3 - 0.05)),
          2,
        ) * 0.1;
      const str = v * 0.2 + dist;
      ringFilter.strength = str;
      ringFilter.enabled = str > 0.01;
    }

    // Grade
    if (gradeFilter) {
      const adjustedT = Math.min(curScale * 2, 1);
      gradeFilter.gamma = 1 - 0.7 * adjustedT;
      gradeFilter.brightness = 1 - 0.3 * adjustedT;
      gradeFilter.saturation = 1 - 0.3 * adjustedT;
    }

    jitterTimer += time.deltaTime;
    updateParallax();
    ++frame;
  };
  app.ticker.add(tick);

  return {
    setHover(v) {
      hover = !!v;
    },
    destroy() {
      app.ticker.remove(tick);
      app.renderer.off("resize", resize);
      backgroundLayer.destroy({ children: true });
    },
  };
}
