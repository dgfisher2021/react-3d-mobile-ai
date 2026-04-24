import { Html } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import type { MeshLayerMap } from './MeshLayerTree';
import { getMeshColor } from './MeshLayerTree';

const MONO = "'JetBrains Mono', monospace";

interface BBoxData {
  uuid: string;
  box: THREE.Box3;
  color: string;
  size: THREE.Vector3;
  center: THREE.Vector3;
}

/** Build wireframe edge vertices from a Box3 */
function buildBoxEdges(box: THREE.Box3): Float32Array {
  const { min, max } = box;
  // 12 edges, 2 vertices each, 3 floats each = 72 floats
  const edges: [THREE.Vector3Like, THREE.Vector3Like][] = [
    // Bottom face
    [
      { x: min.x, y: min.y, z: min.z },
      { x: max.x, y: min.y, z: min.z },
    ],
    [
      { x: max.x, y: min.y, z: min.z },
      { x: max.x, y: min.y, z: max.z },
    ],
    [
      { x: max.x, y: min.y, z: max.z },
      { x: min.x, y: min.y, z: max.z },
    ],
    [
      { x: min.x, y: min.y, z: max.z },
      { x: min.x, y: min.y, z: min.z },
    ],
    // Top face
    [
      { x: min.x, y: max.y, z: min.z },
      { x: max.x, y: max.y, z: min.z },
    ],
    [
      { x: max.x, y: max.y, z: min.z },
      { x: max.x, y: max.y, z: max.z },
    ],
    [
      { x: max.x, y: max.y, z: max.z },
      { x: min.x, y: max.y, z: max.z },
    ],
    [
      { x: min.x, y: max.y, z: max.z },
      { x: min.x, y: max.y, z: min.z },
    ],
    // Vertical edges
    [
      { x: min.x, y: min.y, z: min.z },
      { x: min.x, y: max.y, z: min.z },
    ],
    [
      { x: max.x, y: min.y, z: min.z },
      { x: max.x, y: max.y, z: min.z },
    ],
    [
      { x: max.x, y: min.y, z: max.z },
      { x: max.x, y: max.y, z: max.z },
    ],
    [
      { x: min.x, y: min.y, z: max.z },
      { x: min.x, y: max.y, z: max.z },
    ],
  ];

  const arr = new Float32Array(72);
  let i = 0;
  for (const [a, b] of edges) {
    arr[i++] = a.x;
    arr[i++] = a.y;
    arr[i++] = a.z;
    arr[i++] = b.x;
    arr[i++] = b.y;
    arr[i++] = b.z;
  }
  return arr;
}

function BBoxWireframe({ data }: { data: BBoxData }) {
  const positions = useMemo(() => buildBoxEdges(data.box), [data.box]);

  const labelPos: [number, number, number] = [data.center.x, data.box.max.y + 0.05, data.center.z];

  const w = data.size.x;
  const h = data.size.y;
  const d = data.size.z;

  return (
    <>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} count={24} />
        </bufferGeometry>
        <lineBasicMaterial color={data.color} transparent opacity={0.7} depthTest={false} />
      </lineSegments>

      <Html position={labelPos} center style={{ pointerEvents: 'none' }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: '9px',
            color: data.color,
            background: 'rgba(0,0,0,0.7)',
            padding: '2px 5px',
            borderRadius: 3,
            whiteSpace: 'nowrap',
            border: `1px solid ${data.color}40`,
            lineHeight: 1.3,
          }}
        >
          {w.toFixed(2)} x {h.toFixed(2)} x {d.toFixed(2)}
        </div>
      </Html>
    </>
  );
}

interface MeshBoundingBoxesProps {
  scene: THREE.Object3D;
  layerState: MeshLayerMap;
}

export function MeshBoundingBoxes({ scene, layerState }: MeshBoundingBoxesProps) {
  const bboxes = useMemo(() => {
    const result: BBoxData[] = [];

    scene.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const state = layerState[obj.uuid];
      if (!state?.showBBox) return;

      const box = new THREE.Box3().setFromObject(obj);
      if (box.isEmpty()) return;

      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      const color = getMeshColor(scene, obj.uuid);
      console.log(
        `[BBox] "${obj.name}" size: ${size.x.toFixed(4)} x ${size.y.toFixed(4)} x ${size.z.toFixed(4)} | center: ${center.x.toFixed(4)}, ${center.y.toFixed(4)}, ${center.z.toFixed(4)}`,
      );
      result.push({ uuid: obj.uuid, box, color, size, center });
    });

    return result;
  }, [scene, layerState]);

  return (
    <group>
      {bboxes.map((data) => (
        <BBoxWireframe key={data.uuid} data={data} />
      ))}
    </group>
  );
}
