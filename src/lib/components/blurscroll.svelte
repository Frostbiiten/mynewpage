<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  // Props: Allow customization
  let {imageSrc, scrollSpeed, blurRadius, width, height} = $props(); // Default image

  let canvas: HTMLCanvasElement;
  let gl: WebGLRenderingContext | null = null;
  let program: WebGLProgram | null = null;
  let positionBuffer: WebGLBuffer | null = null;
  let texCoordBuffer: WebGLBuffer | null = null;
  let texture: WebGLTexture | null = null;
  let requestId: number;

  let timeLocation: WebGLUniformLocation | null = null;
  let resolutionLocation: WebGLUniformLocation | null = null;
  let imageLocation: WebGLUniformLocation | null = null;
  let sampleOffsetsLocation: WebGLUniformLocation | null = null;
  let speedLocation: WebGLUniformLocation | null = null;

  // Blur sample offsets (adjustable based on blurRadius)
  let OFFSETS = [
    [ 0.0,  0.0], [ 0.0,  1.0], [ 0.0, -1.0],
    [ 1.0,  0.0], [-1.0,  0.0], [ 0.7,  0.7],
    [-0.7,  0.7], [ 0.7, -0.7], [-0.7, -0.7]
  ];

  let startTime: number | null = null;

  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;
    uniform sampler2D u_image;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_speed;
    uniform vec2 u_sampleOffsets[9];

    varying vec2 v_texCoord;

    void main() {
      float scrollOffset = -u_time * u_speed;
      vec2 baseUV = vec2(fract(v_texCoord.x + scrollOffset), v_texCoord.y);
      vec4 color = vec4(0.0);

      for (int i = 0; i < 9; i++) {
        vec2 offsetUV = baseUV + u_sampleOffsets[i];
        offsetUV.x = fract(offsetUV.x);
        color += texture2D(u_image, offsetUV);
      }
      color /= 9.0;
      gl_FragColor = color;
    }
  `;

  onMount(() => {
    if (!canvas) return;
    gl = canvas.getContext('webgl');
    if (!gl) return console.error('WebGL not supported');

    const vShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    program = createProgram(gl, vShader, fShader);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);

    texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1
    ]), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    imageLocation = gl.getUniformLocation(program, 'u_image');
    timeLocation = gl.getUniformLocation(program, 'u_time');
    resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    sampleOffsetsLocation = gl.getUniformLocation(program, 'u_sampleOffsets[0]');
    speedLocation = gl.getUniformLocation(program, 'u_speed');

    loadTexture(gl, imageSrc).then((tex) => {
      texture = tex;
      startTime = performance.now();
      requestId = requestAnimationFrame(renderLoop);
    });

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
    const elapsed = (now - (startTime ?? now)) * 0.001;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    gl.uniform1f(timeLocation, elapsed);
    gl.uniform1f(speedLocation, scrollSpeed);
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    const blurOffsets = OFFSETS.map(([x, y]) => [x * blurRadius, y * blurRadius]).flat();
    gl.uniform2fv(sampleOffsetsLocation, new Float32Array(blurOffsets));

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(imageLocation, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestId = requestAnimationFrame(renderLoop);
  }

  function createShader(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  function createProgram(gl: WebGLRenderingContext, vShader: WebGLShader, fShader: WebGLShader) {
    const program = gl.createProgram()!;
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    return program;
  }

  function loadTexture(gl: WebGLRenderingContext, url: string): Promise<WebGLTexture> {
    return new Promise((resolve, reject) => {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

      const image = new Image();
      image.crossOrigin = '';
      image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        resolve(tex);
      };
      image.onerror = reject;
      image.src = url;
    });
  }
</script>

<canvas bind:this={canvas} style="width: {width}; height: {height};"></canvas>