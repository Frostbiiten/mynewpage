struct KawaseBlurUniforms {
  uOffset: vec2<f32>,
  uGamma: vec2<f32>,
};

@group(0) @binding(1) var uTexture: texture_2d<f32>; 
@group(0) @binding(2) var uSampler: sampler;
@group(1) @binding(0) var<uniform> kawaseBlurUniforms : KawaseBlurUniforms;

fn toLinearPremul(c: vec4<f32>, gamma: f32) -> vec4<f32> {
  let a = c.a;
  var rgb = c.rgb;
  if (a > 0.0) { rgb = rgb / a; }
  rgb = pow(rgb, vec3<f32>(gamma));
  if (a > 0.0) { rgb = rgb * a; }
  return vec4<f32>(rgb, a);
}

fn toGammaPremul(c: vec4<f32>, invGamma: f32) -> vec4<f32> {
  let a = c.a;
  var rgb = c.rgb;
  if (a > 0.0) { rgb = rgb / a; }
  rgb = pow(max(rgb, vec3<f32>(0.0)), vec3<f32>(invGamma));
  if (a > 0.0) { rgb = rgb * a; }
  return vec4<f32>(rgb, a);
}

@fragment
fn mainFragment(
  @builtin(position) position: vec4<f32>,
  @location(0) uv : vec2<f32>
) -> @location(0) vec4<f32> {

  let uOffset = kawaseBlurUniforms.uOffset;
  let gamma = kawaseBlurUniforms.uGamma.x;
  let invGamma = kawaseBlurUniforms.uGamma.y;

  var color: vec4<f32> = vec4<f32>(0.0);

  color += toLinearPremul(textureSample(uTexture, uSampler, vec2<f32>(uv.x - uOffset.x, uv.y + uOffset.y)), gamma);
  color += toLinearPremul(textureSample(uTexture, uSampler, vec2<f32>(uv.x + uOffset.x, uv.y + uOffset.y)), gamma);
  color += toLinearPremul(textureSample(uTexture, uSampler, vec2<f32>(uv.x + uOffset.x, uv.y - uOffset.y)), gamma);
  color += toLinearPremul(textureSample(uTexture, uSampler, vec2<f32>(uv.x - uOffset.x, uv.y - uOffset.y)), gamma);

  color *= 0.25;

  return toGammaPremul(color, invGamma);
}