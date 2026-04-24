import { useCallback, useMemo, useState } from 'react';
import * as THREE from 'three';

const MONO = "'JetBrains Mono', monospace";
const TEAL = '#319795';
const DIM = '#718096';
const TEXT = '#CBD5E0';

const PALETTE = [
  '#E53E3E',
  '#38A169',
  '#3182CE',
  '#9F7AEA',
  '#ECC94B',
  '#ED8936',
  '#38B2AC',
  '#FC8181',
];

export interface MeshLayerState {
  visible: boolean;
  showBBox: boolean;
}

export type MeshLayerMap = Record<string, MeshLayerState>;

/* ---------- styles ---------- */

const sectionHeader: React.CSSProperties = {
  fontSize: '0.6rem',
  fontWeight: 600,
  color: TEAL,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  fontFamily: MONO,
  marginBottom: 8,
  marginTop: 16,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  userSelect: 'none',
};

const rowBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '3px 0',
  fontSize: '0.6rem',
  fontFamily: MONO,
  color: TEXT,
};

const checkboxStyle: React.CSSProperties = {
  width: 14,
  height: 14,
  accentColor: TEAL,
  cursor: 'pointer',
  flexShrink: 0,
};

const swatchStyle = (color: string): React.CSSProperties => ({
  width: 10,
  height: 10,
  borderRadius: 2,
  background: color,
  flexShrink: 0,
  border: '1px solid rgba(255,255,255,0.15)',
});

const bboxBtnStyle = (active: boolean): React.CSSProperties => ({
  fontSize: '0.5rem',
  fontFamily: MONO,
  padding: '1px 4px',
  border: `1px solid ${active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
  borderRadius: 3,
  background: active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
  color: active ? TEXT : DIM,
  cursor: 'pointer',
  lineHeight: 1.4,
  flexShrink: 0,
  transition: 'all 0.15s',
});

const caretStyle = (expanded: boolean): React.CSSProperties => ({
  display: 'inline-block',
  transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
  transition: 'transform 0.2s',
  fontSize: '0.45rem',
  flexShrink: 0,
  cursor: 'pointer',
  userSelect: 'none',
});

const nameStyle: React.CSSProperties = {
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: '0.55rem',
};

/* ---------- helpers ---------- */

/** Collect all mesh UUIDs under an object (recursive). */
function collectMeshUuids(obj: THREE.Object3D): string[] {
  const uuids: string[] = [];
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      uuids.push(child.uuid);
    }
  });
  return uuids;
}

/** Assign palette colors to meshes in traversal order. */
function buildColorMap(scene: THREE.Object3D): Map<string, string> {
  const map = new Map<string, string>();
  let idx = 0;
  scene.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      map.set(obj.uuid, PALETTE[idx % PALETTE.length]);
      idx++;
    }
  });
  return map;
}

/** Count total meshes in a scene. */
function countMeshes(scene: THREE.Object3D): number {
  let count = 0;
  scene.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) count++;
  });
  return count;
}

/** Determine whether an object is a "group" node (non-mesh with children). */
function isGroup(obj: THREE.Object3D): boolean {
  return !(obj as THREE.Mesh).isMesh && obj.children.length > 0;
}

/** Check if all descendant meshes under an object are visible in the layer state. */
function areAllDescendantsVisible(obj: THREE.Object3D, layerState: MeshLayerMap): boolean {
  const uuids = collectMeshUuids(obj);
  if (uuids.length === 0) return true;
  return uuids.every((uuid) => (layerState[uuid] ?? { visible: true }).visible);
}

/** Check if some (but not all) descendant meshes are visible — for indeterminate state. */
function areSomeDescendantsVisible(obj: THREE.Object3D, layerState: MeshLayerMap): boolean {
  const uuids = collectMeshUuids(obj);
  if (uuids.length === 0) return false;
  const visibleCount = uuids.filter(
    (uuid) => (layerState[uuid] ?? { visible: true }).visible,
  ).length;
  return visibleCount > 0 && visibleCount < uuids.length;
}

/* ---------- TreeNode ---------- */

interface TreeNodeProps {
  object: THREE.Object3D;
  depth: number;
  layerState: MeshLayerMap;
  colorMap: Map<string, string>;
  collapsedSet: Set<string>;
  onToggleCollapse: (uuid: string) => void;
  onToggleVisible: (uuid: string) => void;
  onToggleGroupVisible: (obj: THREE.Object3D) => void;
  onToggleBBox: (uuid: string) => void;
}

function TreeNode({
  object,
  depth,
  layerState,
  colorMap,
  collapsedSet,
  onToggleCollapse,
  onToggleVisible,
  onToggleGroupVisible,
  onToggleBBox,
}: TreeNodeProps) {
  const isMesh = (object as THREE.Mesh).isMesh;
  const isGroupNode = isGroup(object);

  // Skip leaf non-mesh objects with no mesh descendants
  if (!isMesh && !isGroupNode) {
    const hasMeshDescendants = collectMeshUuids(object).length > 0;
    if (!hasMeshDescendants) return null;
  }

  const name =
    object.name ||
    (isMesh ? `mesh_${object.uuid.slice(0, 6)}` : `group_${object.uuid.slice(0, 6)}`);

  if (isMesh) {
    const state = layerState[object.uuid] ?? { visible: true, showBBox: false };
    const color = colorMap.get(object.uuid) ?? PALETTE[0];

    return (
      <div
        style={{
          ...rowBase,
          paddingLeft: depth * 12,
          opacity: state.visible ? 1 : 0.45,
        }}
      >
        <input
          type="checkbox"
          checked={state.visible}
          onChange={() => onToggleVisible(object.uuid)}
          style={checkboxStyle}
          title="Toggle visibility"
        />
        <div style={swatchStyle(color)} />
        <span style={nameStyle} title={name}>
          {name}
        </span>
        <button
          style={bboxBtnStyle(state.showBBox)}
          onClick={() => onToggleBBox(object.uuid)}
          title="Toggle bounding box"
        >
          bbox
        </button>
      </div>
    );
  }

  // Group node
  const expanded = !collapsedSet.has(object.uuid);
  const allVisible = areAllDescendantsVisible(object, layerState);
  const someVisible = areSomeDescendantsVisible(object, layerState);

  return (
    <div>
      <div
        style={{
          ...rowBase,
          paddingLeft: depth * 12,
          opacity: allVisible ? 1 : someVisible ? 0.7 : 0.45,
        }}
      >
        <span style={caretStyle(expanded)} onClick={() => onToggleCollapse(object.uuid)}>
          &#9660;
        </span>
        <input
          type="checkbox"
          checked={allVisible}
          ref={(el) => {
            if (el) el.indeterminate = someVisible && !allVisible;
          }}
          onChange={() => onToggleGroupVisible(object)}
          style={checkboxStyle}
          title="Toggle group visibility"
        />
        <span
          style={{
            ...nameStyle,
            cursor: 'pointer',
            fontWeight: 500,
          }}
          title={name}
          onClick={() => onToggleCollapse(object.uuid)}
        >
          {name}
        </span>
      </div>

      {expanded && (
        <div>
          {object.children.map((child) => (
            <TreeNode
              key={child.uuid}
              object={child}
              depth={depth + 1}
              layerState={layerState}
              colorMap={colorMap}
              collapsedSet={collapsedSet}
              onToggleCollapse={onToggleCollapse}
              onToggleVisible={onToggleVisible}
              onToggleGroupVisible={onToggleGroupVisible}
              onToggleBBox={onToggleBBox}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- MeshLayerTree ---------- */

interface MeshLayerTreeProps {
  scene: THREE.Object3D;
  layerState: MeshLayerMap;
  onLayerChange: (next: MeshLayerMap) => void;
}

export function MeshLayerTree({ scene, layerState, onLayerChange }: MeshLayerTreeProps) {
  const [sectionCollapsed, setSectionCollapsed] = useState(false);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  const meshCount = useMemo(() => countMeshes(scene), [scene]);
  const colorMap = useMemo(() => buildColorMap(scene), [scene]);

  const toggleCollapse = useCallback((uuid: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) {
        next.delete(uuid);
      } else {
        next.add(uuid);
      }
      return next;
    });
  }, []);

  const toggleVisible = useCallback(
    (uuid: string) => {
      const prev = layerState[uuid] ?? { visible: true, showBBox: false };
      onLayerChange({ ...layerState, [uuid]: { ...prev, visible: !prev.visible } });
    },
    [layerState, onLayerChange],
  );

  const toggleGroupVisible = useCallback(
    (obj: THREE.Object3D) => {
      const uuids = collectMeshUuids(obj);
      const allVisible = uuids.every((uuid) => (layerState[uuid] ?? { visible: true }).visible);
      const newVisible = !allVisible;
      const next = { ...layerState };
      for (const uuid of uuids) {
        const prev = next[uuid] ?? { visible: true, showBBox: false };
        next[uuid] = { ...prev, visible: newVisible };
      }
      onLayerChange(next);
    },
    [layerState, onLayerChange],
  );

  const toggleBBox = useCallback(
    (uuid: string) => {
      const prev = layerState[uuid] ?? { visible: true, showBBox: false };
      onLayerChange({ ...layerState, [uuid]: { ...prev, showBBox: !prev.showBBox } });
    },
    [layerState, onLayerChange],
  );

  return (
    <div>
      <div style={sectionHeader} onClick={() => setSectionCollapsed(!sectionCollapsed)}>
        <span
          style={{
            display: 'inline-block',
            transform: sectionCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            fontSize: '0.5rem',
          }}
        >
          &#9660;
        </span>
        Mesh Layers ({meshCount})
      </div>

      {!sectionCollapsed && (
        <div
          style={{
            maxHeight: 300,
            overflowY: 'auto',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 6,
            padding: '4px 6px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {scene.children.map((child) => (
            <TreeNode
              key={child.uuid}
              object={child}
              depth={0}
              layerState={layerState}
              colorMap={colorMap}
              collapsedSet={collapsedNodes}
              onToggleCollapse={toggleCollapse}
              onToggleVisible={toggleVisible}
              onToggleGroupVisible={toggleGroupVisible}
              onToggleBBox={toggleBBox}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Build initial state map for all meshes in a scene */
export function buildInitialLayerState(scene: THREE.Object3D): MeshLayerMap {
  const map: MeshLayerMap = {};
  scene.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      map[obj.uuid] = { visible: true, showBBox: false };
    }
  });
  return map;
}

/** Get the color assigned to a mesh by its index in traversal order */
export function getMeshColor(scene: THREE.Object3D, uuid: string): string {
  let idx = 0;
  let found = '';
  scene.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      if (obj.uuid === uuid) {
        found = PALETTE[idx % PALETTE.length];
      }
      idx++;
    }
  });
  return found || PALETTE[0];
}
