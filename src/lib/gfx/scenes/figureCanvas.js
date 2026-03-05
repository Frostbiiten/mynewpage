import {
  Container,
  Sprite,
  Assets,
  DisplacementFilter,
  Filter,
  Texture,
  GlProgram,
  GpuProgram,
  UniformGroup,
} from "pixi.js";
import { KawaseBlurFilter } from "$lib/gfx/shaders/LensBlur/KawaseBlurFilter";
import figure0 from "$lib/img/figure/0.webp";
import figure1 from "$lib/img/figure/1.webp";

const easeInOutCubic = (x) => {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

const easeOutCubic = (x) => {
  return 1 - Math.pow(1 - x, 3);
};

const easeOutExpo = (x) => {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
};

function createBlendFilter() {
  const glVertex = `
  in vec2 aPosition;
  out vec2 vTextureCoord;

  uniform vec4 uInputSize;
  uniform vec4 uOutputFrame;
  uniform vec4 uOutputTexture;

  vec4 filterVertexPosition(void) {
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
    return vec4(position, 0.0, 1.0);
  }

  vec2 filterTextureCoord(void) {
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
  }

  void main(void) {
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
  }
  `;

  const glFragment = `
  precision highp float;

  in vec2 vTextureCoord;
  out vec4 finalColor;

  uniform sampler2D uTexture;
  uniform vec4 uParams;
  uniform vec4 uInputSize;

  float gradT(vec2 uv, float widthMult)
  {
    float w = uInputSize.x;
    float h = uInputSize.y;
    float w2 = w * w;
    float h2 = h * h;

    // see old createLinearGradient(0,h, w*widthMult, 0)
    float t = (uv.x * w2 * widthMult + (1.0 - uv.y) * h2) / (w2 * widthMult * widthMult + h2);
    return clamp(t, 0.0, 1.0);
  }

  void main() {
    vec4 base = texture(uTexture, vTextureCoord);

    if (base.a <= 0.0) {
      finalColor = vec4(0.0);
      return;
    }

    vec3 color = base.rgb / base.a;

    float tMul = gradT(vTextureCoord, 2.0);
    float tScr = gradT(vTextureCoord, 1.0);

    vec3 mul1 = vec3(0.0078, 0.0235, 0.0902);
    vec3 mul2 = vec3(0.9137, 0.8627, 0.5020);
    float mStep = clamp((tMul - 0.2) / 0.4, 0.0, 1.0);
    vec3 mulRGB = mix(mul1, mul2, mStep);
    float mulA = mix(1.0, 0.7, mStep);
    vec3 blendedMul = mix(color, color * mulRGB, mulA);

    vec3 scr1 = vec3(0.1137, 0.1020, 0.2706);
    vec3 scr2 = vec3(0.9490, 0.5137, 0.0392);
    float sStep = clamp((tScr - 0.6) / 0.31, 0.0, 1.0);
    vec3 scrRGB = mix(scr1, scr2, sStep);
    float scrA = mix(0.4, 1.0, sStep);
    vec3 screenBlend = 1.0 - (1.0 - color) * (1.0 - scrRGB);
    vec3 blendedScr = mix(color, screenBlend, scrA);

    float mulAlpha = uParams.x;
    float scrAlpha = uParams.y;

    vec3 result = mix(color, blendedMul, mulAlpha);
    result = mix(result, blendedScr, scrAlpha);

    finalColor = vec4(result * base.a, base.a);
  }
  `;

  const wgslSource = `
  struct GlobalFilterUniforms {
    uInputSize: vec4<f32>,
    uInputPixel: vec4<f32>,
    uInputClamp: vec4<f32>,
    uOutputFrame: vec4<f32>,
    uGlobalFrame: vec4<f32>,
    uOutputTexture: vec4<f32>,
  };

  struct BlendUniforms {
    uParams: vec4<f32>,
  };

  @group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
  @group(0) @binding(1) var uTexture: texture_2d<f32>;
  @group(0) @binding(2) var uSampler: sampler;

  @group(1) @binding(0) var<uniform> blendUniforms: BlendUniforms;

  struct VSOut {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
  };

  fn filterVertexPosition(aPosition: vec2<f32>) -> vec4<f32> {
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4<f32>(position, 0.0, 1.0);
  }

  fn filterTextureCoord(aPosition: vec2<f32>) -> vec2<f32> {
    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
  }

  fn mix1(a: f32, b: f32, t: f32) -> f32 { return a * (1.0 - t) + b * t; }
  fn mix3(a: vec3<f32>, b: vec3<f32>, t: f32) -> vec3<f32> { return a * (1.0 - t) + b * t; }

  fn gradT(uv: vec2<f32>, widthMult: f32) -> f32 {
    let w = gfu.uInputSize.x;
    let h = gfu.uInputSize.y;
    let w2 = w * w;
    let h2 = h * h;

    let t = (uv.x * w2 * widthMult + (1.0 - uv.y) * h2) / (w2 * widthMult * widthMult + h2);
    return clamp(t, 0.0, 1.0);
  }

  @vertex
  fn mainVertex(
    @location(0) aPosition: vec2<f32>,
  ) -> VSOut {
    return VSOut(
      filterVertexPosition(aPosition),
      filterTextureCoord(aPosition),
    );
  }

  @fragment
  fn mainFragment(
    @location(0) uvIn: vec2<f32>,
  ) -> @location(0) vec4<f32> {
    let uv = clamp(uvIn, gfu.uInputClamp.xy, gfu.uInputClamp.zw);
    let base = textureSample(uTexture, uSampler, uv);

    if (base.a <= 0.0) { return vec4<f32>(0.0); }

    let color = base.rgb / base.a;

    let tMul = gradT(uv, 2.0);
    let tScr = gradT(uv, 1.0);

    let mul1 = vec3<f32>(0.0078, 0.0235, 0.0902);
    let mul2 = vec3<f32>(0.9137, 0.8627, 0.5020);
    let mStep = clamp((tMul - 0.2) / 0.4, 0.0, 1.0);
    let mulRGB = mix3(mul1, mul2, mStep);
    let mulA = mix1(1.0, 0.7, mStep);
    let blendedMul = mix3(color, color * mulRGB, mulA);

    let scr1 = vec3<f32>(0.1137, 0.1020, 0.2706);
    let scr2 = vec3<f32>(0.9490, 0.5137, 0.0392);
    let sStep = clamp((tScr - 0.6) / 0.31, 0.0, 1.0);
    let scrRGB = mix3(scr1, scr2, sStep);
    let scrA = mix1(0.4, 1.0, sStep);
    let screenBlend = vec3<f32>(1.0) - (vec3<f32>(1.0) - color) * (vec3<f32>(1.0) - scrRGB);
    let blendedScr = mix3(color, screenBlend, scrA);

    var result = mix3(color, blendedMul, blendUniforms.uParams.x);
    result = mix3(result, blendedScr, blendUniforms.uParams.y);

    return vec4<f32>(result * base.a, base.a);
  }
  `;

  const glProgram = GlProgram.from({
    vertex: glVertex,
    fragment: glFragment,
    name: "hero-blend-filter",
  });

  const gpuProgram = GpuProgram.from({
    vertex: { source: wgslSource, entryPoint: "mainVertex" },
    fragment: { source: wgslSource, entryPoint: "mainFragment" },
  });

  const blendUniforms = new UniformGroup({
    uParams: { value: new Float32Array([0, 0, 0, 0]), type: "vec4<f32>" },
  });

  return new Filter({
    glProgram,
    gpuProgram,
    resources: {
      blendUniforms,
    },
  });
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
  baseSpriteContainer.alpha = 0;

  let fadeT = 0;
  let fading = false;

  let spriteBase0, spriteBase1;
  const blendFilter = createBlendFilter();

  const setupFigure = async () => {
    const [t0, t1] = await Promise.all([
      Assets.load(figure0),
      Assets.load(figure1),
    ]);

    spriteBase0 = new Sprite(t0);
    spriteBase0.visible = !hover;
    baseSpriteContainer.addChild(spriteBase0);

    spriteBase1 = new Sprite(t1);
    spriteBase1.visible = hover;
    baseSpriteContainer.addChild(spriteBase1);

    const multiNoiseSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E
                          <filter id='combinedNoise'>
                            <feTurbulence type='turbulence' baseFrequency='0.0030' numOctaves='2' result='coarse' />
                            <feTurbulence type='fractalNoise' baseFrequency='0.030' numOctaves='3' result='fine' />
                            <feComposite in='coarse' in2='fine' operator='arithmetic' k1='0' k2='1.0' k3='0.15' k4='0' />
                          </filter>
                          <rect width='100%25' height='100%25' filter='url(%23combinedNoise)' />
                          %3C/svg%3E`;

    const noiseAsset = await Assets.load(multiNoiseSVG);
    const noiseTex =
      noiseAsset instanceof Texture ? noiseAsset : Texture.from(noiseAsset);

    const s = noiseTex.source;
    if (s && s.style) {
      s.style.addressModeU = "repeat";
      s.style.addressModeV = "repeat";
      s.style.magFilter = "nearest";
      s.style.minFilter = "nearest";
    }

    const displacementSprite = new Sprite(noiseTex);
    displacementSprite.visible = false;
    displacementSprite.renderable = false;
    app.stage.addChild(displacementSprite);

    const sketchFilter = new DisplacementFilter(displacementSprite);
    sketchFilter.scale.set(11, 10);

    baseSpriteContainer.filters = [blendFilter, sketchFilter];
    baseSpriteContainer.displacementMap = displacementSprite;

    await new Promise(requestAnimationFrame);

    fading = true;
    fadeT = 0;
  };

  setupFigure();

  const updateParallax = () => {
    baseSpriteContainer.x = mouseState.smoothX * 6;
    baseSpriteContainer.y = mouseState.smoothY * 4;
  };

  const jitterInterval = 24;
  let jitterTimer = 0;

  const tick = (time) => {
    if (fading && baseSpriteContainer.alpha < 1) {
      fadeT += time.deltaTime;
      const x = Math.min(fadeT / 30, 1);
      const eased = easeOutExpo(x);
      baseSpriteContainer.alpha = eased;
      baseSpriteContainer.scale.set(1, 0.95 + 0.05 * eased)
    }

    updateParallax();

    const d = mouseState.dist01;
    const alphaMul = Math.max(Math.min(d * 0.6 + 0.3, 1), 0);
    const alphaOvr = 1 - Math.max(0, d * 1.5);

    const p = blendFilter.resources.blendUniforms.uniforms.uParams;
    p[0] = alphaMul * 0.7;
    p[1] = alphaOvr;

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

    jitterTimer += time.deltaTime;
  };

  app.ticker.add(tick);

  return {
    setHover(v) {
      hover = !!v;
      if (!spriteBase0 || !spriteBase1) return;

      spriteBase0.visible = !hover;
      spriteBase1.visible = hover;
    },
    destroy() {
      app.ticker.remove(tick);
      baseSpriteContainer.destroy({ children: true });
    },
  };
}
