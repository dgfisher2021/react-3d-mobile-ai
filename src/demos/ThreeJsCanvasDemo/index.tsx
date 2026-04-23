import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { DemoOverlay } from '../../components/DemoOverlay';
import { buildPhone } from './buildPhone';
import { drawScreen } from './drawScreen';

interface OrbitState {
  isDragging: boolean;
  prev: { x: number; y: number };
  targetRot: { x: number; y: number };
  currentRot: { x: number; y: number };
  velocity: { x: number; y: number };
  autoRotate: boolean;
  zoom: number;
  targetZoom: number;
}

/**
 * Demo 1: pure THREE.js. The phone is a mesh group, the screen is a
 * CanvasTexture painted by `drawScreen`. Inputs are hand-rolled; orbit
 * has inertia, auto-rotate, and preset view buttons.
 */
export default function ThreeJsCanvasDemo() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<OrbitState>({
    isDragging: false,
    prev: { x: 0, y: 0 },
    targetRot: { x: -0.15, y: 0.3 },
    currentRot: { x: -0.15, y: 0.3 },
    velocity: { x: 0, y: 0 },
    autoRotate: true,
    zoom: 5.2,
    targetZoom: 5.2,
  });
  const [hint, setHint] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const { clientWidth: CW, clientHeight: CH } = container;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, CW / CH, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(CW, CH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 512;
    screenCanvas.height = 1024;
    drawScreen(screenCanvas);
    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    // The 2D canvas was painted in sRGB — tag it so the renderer decodes it
    // correctly, otherwise the output is double-gamma-lifted and the dashboard
    // looks washed out as if a white film is over it.
    screenTexture.colorSpace = THREE.SRGBColorSpace;
    screenTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    screenTexture.needsUpdate = true;
    screenTexture.minFilter = THREE.LinearFilter;
    screenTexture.magFilter = THREE.LinearFilter;

    const phone = buildPhone(screenTexture);
    scene.add(phone);

    // Image-based lighting. The titanium frame and camera hardware are
    // metallic (metalness ~0.85); metals get ~100% of their colour from
    // reflections, so without an environment to reflect they render as a
    // flat dark grey — that was the "no shine" issue. A PMREM-prefiltered
    // RoomEnvironment gives every MeshStandardMaterial in the scene
    // proper studio-style reflections, instantly making the phone look
    // like shot-on-a-product-shoot hardware.
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envMap;

    // Direct lights on top of the IBL — these give directional specular
    // streaks that sell the "polished edge" feel on the bevels and
    // camera rings, which pure IBL alone tends to average out.
    scene.add(new THREE.AmbientLight(0xffffff, 0.15));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x8ecdf7, 0.5);
    fillLight.position.set(-3, 2, 4);
    scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0x5eead4, 0.9);
    rimLight.position.set(-2, -1, -3);
    scene.add(rimLight);
    const topLight = new THREE.PointLight(0xfff0e0, 0.4);
    topLight.position.set(0, 4, 2);
    scene.add(topLight);
    const accentLeft = new THREE.PointLight(0x3182ce, 0.3);
    accentLeft.position.set(-3, 0, 1);
    scene.add(accentLeft);
    const accentRight = new THREE.PointLight(0x9f7aea, 0.25);
    accentRight.position.set(3, -1, 1);
    scene.add(accentRight);

    // Floor grid
    const gridHelper = new THREE.GridHelper(12, 24, 0x1a2744, 0x0f1a2e);
    gridHelper.position.y = -2.2;
    const gridMat = gridHelper.material as THREE.Material;
    gridMat.opacity = 0.3;
    gridMat.transparent = true;
    scene.add(gridHelper);

    // Floating particles
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x319795,
      size: 0.02,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const st = stateRef.current;
      const elapsed = clock.getElapsedTime();

      if (st.autoRotate && !st.isDragging) {
        st.targetRot.y += 0.002;
      }

      if (!st.isDragging) {
        st.targetRot.x += st.velocity.x;
        st.targetRot.y += st.velocity.y;
        st.velocity.x *= 0.95;
        st.velocity.y *= 0.95;
      }

      st.targetRot.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, st.targetRot.x));
      st.currentRot.x += (st.targetRot.x - st.currentRot.x) * 0.08;
      st.currentRot.y += (st.targetRot.y - st.currentRot.y) * 0.08;

      phone.rotation.x = st.currentRot.x;
      phone.rotation.y = st.currentRot.y;
      phone.position.y = Math.sin(elapsed * 0.8) * 0.03;

      st.zoom += (st.targetZoom - st.zoom) * 0.08;
      camera.position.z = st.zoom;

      const pPositions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        pPositions[i * 3 + 1] += Math.sin(elapsed + i) * 0.0005;
      }
      particleGeo.attributes.position.needsUpdate = true;
      particleMat.opacity = 0.3 + Math.sin(elapsed * 0.5) * 0.15;

      renderer.render(scene, camera);
    };
    animate();

    const getPos = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      const me = e as MouseEvent;
      return { x: me.clientX, y: me.clientY };
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const st = stateRef.current;
      st.isDragging = true;
      st.autoRotate = false;
      st.prev = getPos(e);
      st.velocity = { x: 0, y: 0 };
      setHint(false);
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const st = stateRef.current;
      if (!st.isDragging) return;
      const pos = getPos(e);
      const dx = pos.x - st.prev.x;
      const dy = pos.y - st.prev.y;
      st.targetRot.y += dx * 0.006;
      st.targetRot.x += dy * 0.004;
      st.velocity.x = dy * 0.001;
      st.velocity.y = dx * 0.001;
      st.prev = pos;
    };

    const onPointerUp = () => {
      stateRef.current.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      const st = stateRef.current;
      st.targetZoom = Math.max(2.5, Math.min(7, st.targetZoom + e.deltaY * 0.003));
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('mouseleave', onPointerUp);
    canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    canvas.addEventListener('touchmove', onPointerMove, { passive: true });
    canvas.addEventListener('touchend', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: true });

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('mousedown', onPointerDown);
      canvas.removeEventListener('mousemove', onPointerMove);
      canvas.removeEventListener('mouseup', onPointerUp);
      canvas.removeEventListener('mouseleave', onPointerUp);
      canvas.removeEventListener('touchstart', onPointerDown);
      canvas.removeEventListener('touchmove', onPointerMove);
      canvas.removeEventListener('touchend', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      envMap.dispose();
      pmrem.dispose();
      renderer.dispose();
      screenTexture.dispose();
      if (container.contains(canvas)) container.removeChild(canvas);
    };
  }, []);

  const resetView = useCallback(() => {
    const st = stateRef.current;
    st.targetRot = { x: -0.15, y: 0.3 };
    st.velocity = { x: 0, y: 0 };
    st.targetZoom = 5.2;
    st.autoRotate = true;
  }, []);

  const viewFront = useCallback(() => {
    const st = stateRef.current;
    st.targetRot = { x: 0, y: 0 };
    st.velocity = { x: 0, y: 0 };
    st.autoRotate = false;
  }, []);

  const viewAngled = useCallback(() => {
    const st = stateRef.current;
    st.targetRot = { x: -0.2, y: 0.6 };
    st.velocity = { x: 0, y: 0 };
    st.autoRotate = false;
  }, []);

  const viewBack = useCallback(() => {
    const st = stateRef.current;
    st.targetRot = { x: -0.1, y: Math.PI };
    st.velocity = { x: 0, y: 0 };
    st.autoRotate = false;
  }, []);

  const buttons = [
    { label: 'Front', action: viewFront },
    { label: 'Angle', action: viewAngled },
    { label: 'Back', action: viewBack },
    { label: 'Auto', action: resetView },
  ];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #0a0f1a 0%, #0d1b2e 40%, #0a1628 100%)',
      }}
    >
      <div
        ref={mountRef}
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      />
      <DemoOverlay
        subtitle="3D Prototype"
        hint="Drag to rotate • Scroll to zoom"
        showHint={hint}
        badges={[
          { label: `Three.js r${THREE.REVISION}`, color: '#319795' },
          { label: 'iPhone 15 Pro', color: '#718096' },
          { label: 'Real-time 3D', color: '#9F7AEA' },
        ]}
      />

      <div
        style={{
          position: 'absolute',
          right: 24,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 10,
          animation: 'slideInRight 0.6s ease 0.6s both',
        }}
      >
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              padding: '10px 14px',
              color: '#CBD5E0',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '0.3px',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
