<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let gl: WebGLRenderingContext | null = null;

  let program: WebGLProgram | null = null;
  let positionBuffer: WebGLBuffer | null = null;
  let texCoordBuffer: WebGLBuffer | null = null;
  let texture: WebGLTexture | null = null;

  // Uniform locations
  let timeLocation: WebGLUniformLocation | null = null;
  let resolutionLocation: WebGLUniformLocation | null = null;
  let imageLocation: WebGLUniformLocation | null = null;

  // We'll define how many blur samples we want
  const SAMPLE_COUNT = 9;
  let sampleOffsetsLocation: WebGLUniformLocation | null = null;

  // We'll store an array of offsets for a simple blur
  // (You could do a 2-pass blur or a better kernel in production.)
  // These offsets are around the current pixel to produce a basic blur.
  const OFFSETS = [
    [ 0.0,  0.0],
    [ 0.0,  0.002],
    [ 0.0, -0.002],
    [ 0.002,  0.0],
    [-0.002,  0.0],
    [ 0.001,  0.001],
    [-0.001,  0.001],
    [ 0.001, -0.001],
    [-0.001, -0.001]
  ];

  // Animation
  let startTime: number | null = null;
  const speed = 0.1; // how fast to scroll
  let requestId: number;

  // Vertex shader
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;

    varying vec2 v_texCoord;

    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `;

  // Fragment shader
  // - We sample the texture multiple times for blur.
  // - We also shift the UV coordinate by time to scroll horizontally.
  // - We'll wrap (repeat) the texture with fract().
  const fragmentShaderSource = `
    precision mediump float;

    // Our texture
    uniform sampler2D u_image;
    // Canvas (render) resolution
    uniform vec2 u_resolution;
    // Time uniform
    uniform float u_time;
    // Offsets for blur
    uniform vec2 u_sampleOffsets[${SAMPLE_COUNT}];

    varying vec2 v_texCoord;

    void main() {
      // Convert speed to negative direction: move right->left
      float scrollOffset = -u_time * ${speed.toFixed(1)};

      // We “scroll” in x by adding scrollOffset,
      // then wrap with fract() to repeat horizontally.
      vec2 baseUV = vec2(fract(v_texCoord.x + scrollOffset), v_texCoord.y);

      vec4 color = vec4(0.0);
      // Simple box-blur style: just sample around baseUV
      for (int i = 0; i < ${SAMPLE_COUNT}; i++) {
        vec2 offsetUV = baseUV + u_sampleOffsets[i];
        // Wrap horizontally, but you can also wrap vertically if you like
        offsetUV.x = fract(offsetUV.x);
        offsetUV.y = fract(offsetUV.y);
        color += texture2D(u_image, offsetUV);
      }
      color /= float(${SAMPLE_COUNT});

      gl_FragColor = color;
    }
  `;

  onMount(() => {
    if (!canvas) return;

    // 1. Get WebGL context
    gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // 2. Create & compile shaders
    const vShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // 3. Link them into a program
    program = createProgram(gl, vShader, fShader);
    gl.useProgram(program);

    // 4. Look up attribute locations
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

    // 5. Create buffers for quad data
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // A full-screen quad in clip space:
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    // UV coordinates for the quad (0..1)
    const texCoords = new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    // Enable and set up position attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Enable and set up texCoord attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // 6. Get uniform locations
    imageLocation = gl.getUniformLocation(program, 'u_image');
    timeLocation = gl.getUniformLocation(program, 'u_time');
    resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    sampleOffsetsLocation = gl.getUniformLocation(program, 'u_sampleOffsets[0]');

    // 7. Load texture from image
    loadTexture(gl, '/images/your_image.jpg').then((tex) => {
      texture = tex;
      // Start the render loop once texture is loaded
      startTime = performance.now();
      requestId = requestAnimationFrame(renderLoop);
    });

    // Clean up on unmount
    return () => {
      cancelAnimationFrame(requestId);
      if (gl) {
        gl.deleteTexture(texture);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texCoordBuffer);
        gl.deleteProgram(program);
      }
    };
  });

  function renderLoop(now: number) {
    if (!gl || !program) return;

    const elapsed = (now - (startTime ?? now)) * 0.001; // seconds

    // Resize canvas to match display size (for crisp rendering).
    resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

    // Set viewport
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    // Pass in time uniform
    gl.uniform1f(timeLocation, elapsed);

    // Pass in resolution
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    // Pass in sample offsets for blur
    // In a real blur, you might scale these offsets by 1 / resolution
    // so that "0.002" is in normalized screen space or something else.
    // We'll just use them as-is for demonstration.
    const flatOffsets = OFFSETS.flat(); // Flatten to [x1,y1, x2,y2, ...]
    gl.uniform2fv(sampleOffsetsLocation, new Float32Array(flatOffsets));

    // Set texture uniform to texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(imageLocation, 0);

    // Draw the quad
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestId = requestAnimationFrame(renderLoop);
  }

  // Helper: create shader
  function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      throw new Error('Shader compilation failed');
    }
    return shader;
  }

  // Helper: create program
  function createProgram(gl: WebGLRenderingContext, vShader: WebGLShader, fShader: WebGLShader): WebGLProgram {
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);
    gl.linkProgram(prog);
    const success = gl.getProgramParameter(prog, gl.LINK_STATUS);
    if (!success) {
      console.error(gl.getProgramInfoLog(prog));
      gl.deleteProgram(prog);
      throw new Error('Program linking failed');
    }
    return prog;
  }

  // Helper: load an image into a texture
  function loadTexture(gl: WebGLRenderingContext, url: string): Promise<WebGLTexture> {
    return new Promise((resolve, reject) => {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      // Temporary pixel while image loads
      const level = 0;
      const internalFormat = gl.RGBA;
      const width = 1;
      const height = 1;
      const border = 0;
      const srcFormat = gl.RGBA;
      const srcType = gl.UNSIGNED_BYTE;
      const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

      // Load actual image
      const image = new Image();
      image.crossOrigin = '';
      image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

        // set the texture parameters so we can render any size image
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        resolve(tex);
      };
      image.onerror = reject;
      image.src = url;
    });
  }

  // Helper: resize canvas to display size
  function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }
  }
</script>

<style>
  /* Make canvas fill the window or set your own dimensions */
  canvas {
    display: block;
    width: 100vw;
    height: 100vh;
    background: #000;
  }
</style>

<canvas bind:this={canvas}></canvas>