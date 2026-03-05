import { Filter, GlProgram } from "pixi.js";

const vertex = `
  in vec2 aPosition;
  out vec2 vTextureCoord;

  uniform vec4 uInputSize;
  uniform vec4 uOutputFrame;
  uniform vec4 uOutputTexture;

  vec4 filterVertexPosition( void )
  {
      vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
      position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
      position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
      return vec4(position, 0.0, 1.0);
  }

  vec2 filterTextureCoord( void )
  {
      return aPosition * (uOutputFrame.zw * uInputSize.zw);
  }

  void main(void)
  {
      gl_Position = filterVertexPosition();
      vTextureCoord = filterTextureCoord();
  }
`;

const fragment = `
  precision mediump float;
  in vec2 vTextureCoord;
  out vec4 finalColor; // V8 requires 'out' variable

  uniform sampler2D uTexture;
  uniform float uGamma;

  void main(void)
  {
      vec4 color = texture(uTexture, vTextureCoord); // V8 uses 'texture()'
      
      // Apply Gamma
      if (color.a > 0.0) {
          color.rgb = pow(color.rgb, vec3(uGamma));
      }
      
      finalColor = color;
  }
`;

export class GammaFilter extends Filter {
  constructor(gamma = 1.0) {
    super({
      glProgram: new GlProgram({
        vertex,
        fragment,
        name: "gamma-filter",
      }),
      resources: {
        gammaUniforms: {
          uGamma: { value: gamma, type: "f32" },
        },
      },
    });
  }
}
