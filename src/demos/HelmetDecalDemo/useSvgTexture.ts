import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const TEX_SIZE = 512;

/**
 * Converts a container element's first child SVG into a THREE.CanvasTexture.
 * Re-renders whenever `deps` changes (color, selected SVG, etc.).
 */
export function useSvgTexture(
  containerRef: React.RefObject<HTMLDivElement | null>,
  deps: unknown[],
): THREE.CanvasTexture | null {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevTexRef = useRef<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const svgEl = container.querySelector('svg');
    if (!svgEl) {
      setTexture(null);
      return;
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = TEX_SIZE;
      canvasRef.current.height = TEX_SIZE;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    // Serialize SVG → blob → Image → Canvas → Texture
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) {
        URL.revokeObjectURL(url);
        return;
      }
      ctx.clearRect(0, 0, TEX_SIZE, TEX_SIZE);
      ctx.drawImage(img, 0, 0, TEX_SIZE, TEX_SIZE);
      URL.revokeObjectURL(url);

      // Dispose previous texture to avoid GPU leak
      prevTexRef.current?.dispose();

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      prevTexRef.current = tex;
      setTexture(tex);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
    };
    img.src = url;

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      prevTexRef.current?.dispose();
    };
  }, []);

  return texture;
}
