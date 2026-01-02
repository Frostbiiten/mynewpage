import { Application, RendererType } from 'pixi.js';

export async function createPixiApp({ canvas, resizeTo }) {
    if (typeof window === 'undefined') return;

    const app = new Application();
    
    await app.init({
        canvas,
        resizeTo,
        preference: 'webgpu', 
        backgroundAlpha: 0,
        antialias: true,
        powerPreference: 'high-performance'
    });

    const RENDERER_LABELS = {
      [RendererType.WEBGL]: 'webgl',
      [RendererType.WEBGPU]: 'webgpu',
      [RendererType.CANVAS]: 'canvas',
    };

    const backendLabel = RENDERER_LABELS[app.renderer.type]?? 'unknown';
    console.log(`Rendering with ${backendLabel} backend`);

    return { app };
}