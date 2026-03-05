import { Application, RendererType } from "pixi.js";

export async function createPixiApp({ canvas, resizeTo }) {
  if (typeof window === "undefined") return;

  const app = new Application();

  const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");

  await app.init({
    canvas,
    resizeTo,
    preference: isFirefox ? "webgl" : "webgpu",
    backgroundAlpha: 0,
    antialias: false,
    powerPreference: "high-performance",
    useBackBuffer: true,
    preserveDrawingBuffer: false,
  });

  const RENDERER_LABELS = {
    [RendererType.WEBGL]: "webgl",
    [RendererType.WEBGPU]: "webgpu",
    [RendererType.CANVAS]: "canvas",
  };

  const backendLabel = RENDERER_LABELS[app.renderer.type] ?? "unknown";
  console.log(`Rendering with ${backendLabel} backend`);

  return { app };
}
