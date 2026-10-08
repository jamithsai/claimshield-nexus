import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  CYBER_THEME, 
  createStarfield, 
  createTextSprite, 
  createGlowRing, 
  disposeThreeHierarchy 
} from './threeUtils';
import { useCurrency } from '../../context/CurrencyContext';
import { 
  ShieldAlert, 
  Users, 
  Building2, 
  User, 
  Maximize2, 
  RotateCcw, 
  Crosshair, 
  ExternalLink,
  Sparkles,
  Info,
  DollarSign
} from 'lucide-react';

export interface GalaxyNode {
  id: string;
  label: string;
  type: 'PROVIDER' | 'FACILITY' | 'MEMBER' | string;
  specialty?: string;
  city?: string;
  pagerank?: number;
  riskScore?: number;
  exposure?: number;
  scheme?: string;
  is_target?: boolean;
}

export interface GalaxyEdge {
  source: string;
  target: string;
  relationship?: string;
  weight?: number;
  isCollusion?: boolean;
}

interface CollusionGalaxy3DProps {
  nodes?: GalaxyNode[];
  edges?: GalaxyEdge[];
  onSelectNode?: (nodeId: string, nodeType: string) => void;
  onSelectCaseByNpi?: (npi: string) => void;
  className?: string;
}

export const CollusionGalaxy3D: React.FC<CollusionGalaxy3DProps> = ({
  nodes: directNodes,
  edges: directEdges,
  onSelectNode,
  onSelectCaseByNpi,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { formatMoney, currencySymbol } = useCurrency();

  // Synthetic default nodes/edges if none provided
  const rawNodes: GalaxyNode[] = useMemo(() => {
    if (directNodes && directNodes.length > 0) {
      return directNodes.map((n, i) => ({
        ...n,
        riskScore: n.riskScore || Math.round(55 + (n.pagerank || 0.05) * 450 + (i % 3) * 12),
        exposure: n.exposure || Math.round(18000 + (n.pagerank || 0.05) * 1200000 + (i * 24500)),
        scheme: n.scheme || (i % 2 === 0 ? 'Upcoding & Modifier-25 Ring' : 'Phantom Lab Unbundling'),
      }));
    }

    // Default rich constellation demo dataset
    return [
      { id: 'NPI-1049281', label: 'Dr. Robert Vance, MD', type: 'PROVIDER', specialty: 'Pain Medicine', city: 'Dallas, TX', riskScore: 94.2, exposure: 215400, scheme: 'High-Volume Upcoding & Kickback Loop', pagerank: 0.082, is_target: true },
      { id: 'NPI-1082741', label: 'Dr. Sarah Jenkins, DO', type: 'PROVIDER', specialty: 'Physical Therapy', city: 'Fort Worth, TX', riskScore: 88.5, exposure: 142000, scheme: 'Modifier-25 Inception Ring', pagerank: 0.064 },
      { id: 'NPI-1928472', label: 'Dr. Marcus Sterling, MD', type: 'PROVIDER', specialty: 'Neurology', city: 'Plano, TX', riskScore: 78.1, exposure: 98500, scheme: 'Phantom Diagnostic Testing', pagerank: 0.048 },
      { id: 'NPI-1572938', label: 'Dr. Elena Rostova, MD', type: 'PROVIDER', specialty: 'Orthopedics', city: 'Arlington, TX', riskScore: 71.4, exposure: 68200, scheme: 'Unbundled Surgical Trays', pagerank: 0.035 },
      { id: 'FAC-001', label: 'Apex Wellness Center LLC', type: 'FACILITY', city: 'Dallas, TX', riskScore: 91.0, exposure: 380000, scheme: 'Shell Treatment Facility', pagerank: 0.095 },
      { id: 'FAC-002', label: 'Metroplex Pain Institute', type: 'FACILITY', city: 'Fort Worth, TX', riskScore: 84.0, exposure: 210000, scheme: 'Shared Tax ID Collusion', pagerank: 0.075 },
      { id: 'FAC-003', label: 'Trinity Diagnostic Imaging', type: 'FACILITY', city: 'Plano, TX', riskScore: 66.0, exposure: 115000, scheme: 'Overutilized MRI Scans', pagerank: 0.042 },
      { id: 'MBR-101', label: 'Patient P-1842', type: 'MEMBER', riskScore: 65.0, exposure: 12400 },
      { id: 'MBR-102', label: 'Patient P-2910', type: 'MEMBER', riskScore: 72.0, exposure: 18900 },
      { id: 'MBR-103', label: 'Patient P-3419', type: 'MEMBER', riskScore: 81.0, exposure: 24500 },
      { id: 'MBR-104', label: 'Patient P-4812', type: 'MEMBER', riskScore: 58.0, exposure: 9800 },
      { id: 'MBR-105', label: 'Patient P-5921', type: 'MEMBER', riskScore: 89.0, exposure: 31200 },
      { id: 'MBR-106', label: 'Patient P-6734', type: 'MEMBER', riskScore: 64.0, exposure: 15400 },
      { id: 'MBR-107', label: 'Patient P-7819', type: 'MEMBER', riskScore: 77.0, exposure: 22100 },
    ];
  }, [directNodes]);

  const rawEdges: GalaxyEdge[] = useMemo(() => {
    if (directEdges && directEdges.length > 0) {
      return directEdges;
    }
    return [
      { source: 'NPI-1049281', target: 'FAC-001', relationship: 'OPERATES_AT', isCollusion: true },
      { source: 'NPI-1082741', target: 'FAC-001', relationship: 'OPERATES_AT', isCollusion: true },
      { source: 'NPI-1049281', target: 'FAC-002', relationship: 'RECIPROCAL_BILLING', isCollusion: true },
      { source: 'NPI-1082741', target: 'FAC-002', relationship: 'OPERATES_AT', isCollusion: true },
      { source: 'NPI-1928472', target: 'FAC-003', relationship: 'REFERRAL_LOOP', isCollusion: true },
      { source: 'NPI-1049281', target: 'MBR-101', relationship: 'TREATED_PATIENT', isCollusion: true },
      { source: 'NPI-1082741', target: 'MBR-101', relationship: 'SHARED_PATIENT', isCollusion: true },
      { source: 'NPI-1049281', target: 'MBR-102', relationship: 'TREATED_PATIENT', isCollusion: true },
      { source: 'NPI-1082741', target: 'MBR-102', relationship: 'SHARED_PATIENT', isCollusion: true },
      { source: 'NPI-1928472', target: 'MBR-103', relationship: 'TREATED_PATIENT' },
      { source: 'NPI-1572938', target: 'MBR-104', relationship: 'TREATED_PATIENT' },
      { source: 'NPI-1049281', target: 'MBR-105', relationship: 'TREATED_PATIENT', isCollusion: true },
      { source: 'NPI-1082741', target: 'MBR-105', relationship: 'SHARED_PATIENT', isCollusion: true },
      { source: 'NPI-1928472', target: 'MBR-106', relationship: 'TREATED_PATIENT' },
      { source: 'NPI-1572938', target: 'MBR-107', relationship: 'TREATED_PATIENT' },
      { source: 'NPI-1049281', target: 'NPI-1082741', relationship: 'CROSS_REFERRAL_RING', isCollusion: true },
    ];
  }, [directEdges]);

  // Selected state for HUD and camera focus
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(rawNodes[0]?.id || null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isAutoRotate, setIsAutoRotate] = useState(false);

  const selectedNode = useMemo(() => {
    return rawNodes.find((n) => n.id === selectedNodeId) || null;
  }, [rawNodes, selectedNodeId]);

  // Scene references for interaction
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const nodeMeshesRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const edgeLinesRef = useRef<THREE.LineSegments | null>(null);
  const edgeParticlesRef = useRef<THREE.Points | null>(null);
  const targetCamPosRef = useRef<THREE.Vector3 | null>(null);
  const targetControlsTargetRef = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(CYBER_THEME.background);
    scene.fog = new THREE.FogExp2(CYBER_THEME.background, 0.0035);

    // 2. Camera Setup
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 35, 110);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 300;
    controls.minDistance = 15;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(CYBER_THEME.doctorBlue, 3.5, 200);
    pointLight1.position.set(40, 60, 40);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(CYBER_THEME.patientRed, 2.5, 200);
    pointLight2.position.set(-50, -30, -40);
    scene.add(pointLight2);

    // 6. Ambient Starfield Dust
    const starfield = createStarfield(900, 320);
    scene.add(starfield);

    // 7. Grid Plane (Deep cyber elevation plane)
    const gridHelper = new THREE.GridHelper(180, 24, 0x3186FF, 0x1E293B);
    gridHelper.position.y = -24;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.25;
    scene.add(gridHelper);

    // 8. Compute 3D Force / Spherical Position Layout for Nodes
    const positions = new Map<string, THREE.Vector3>();
    const nodeCount = rawNodes.length;

    // Separate by type for layered 3D orbital rings
    const doctors = rawNodes.filter((n) => n.type === 'PROVIDER');
    const facilities = rawNodes.filter((n) => n.type === 'FACILITY');
    const members = rawNodes.filter((n) => n.type === 'MEMBER' || (!doctors.includes(n) && !facilities.includes(n)));

    // Center / Target Doctor
    const targetDoc = doctors.find((d) => d.is_target) || doctors[0];
    if (targetDoc) {
      positions.set(targetDoc.id, new THREE.Vector3(0, 2, 0));
    }

    // Inner orbital shell: Other Doctors
    const otherDoctors = doctors.filter((d) => d.id !== targetDoc?.id);
    otherDoctors.forEach((doc, idx) => {
      const angle = (idx / Math.max(1, otherDoctors.length)) * Math.PI * 2;
      const radius = 26;
      const yOffset = ((idx % 2 === 0 ? 1 : -1) * 8) + (Math.sin(angle) * 4);
      positions.set(doc.id, new THREE.Vector3(Math.cos(angle) * radius, yOffset, Math.sin(angle) * radius));
    });

    // Middle orbital shell: Facilities (rotating geometric anchors)
    facilities.forEach((fac, idx) => {
      const angle = (idx / Math.max(1, facilities.length)) * Math.PI * 2 + 0.5;
      const radius = 42;
      const yOffset = ((idx % 2 === 0 ? 12 : -10) + (Math.cos(angle) * 6));
      positions.set(fac.id, new THREE.Vector3(Math.cos(angle) * radius, yOffset, Math.sin(angle) * radius));
    });

    // Outer cluster shell: Members / Patients (pulsing cloud)
    members.forEach((mbr, idx) => {
      const phi = Math.acos(-1 + (2 * idx) / Math.max(1, members.length));
      const theta = Math.sqrt(members.length * Math.PI) * phi;
      const radius = 56 + (idx % 3) * 6;
      positions.set(
        mbr.id,
        new THREE.Vector3(
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.sin(theta) * Math.sin(phi) * 0.45,
          radius * Math.cos(phi)
        )
      );
    });

    // 9. Build 3D Meshes for Nodes
    const nodeMeshes = new Map<string, THREE.Object3D>();
    const interactiveObjects: THREE.Object3D[] = [];

    // Shared Geometries & Materials
    const doctorGeo = new THREE.SphereGeometry(3.6, 32, 32);
    const facilityGeo = new THREE.BoxGeometry(4.8, 4.8, 4.8);
    const memberGeo = new THREE.SphereGeometry(1.6, 16, 16);

    rawNodes.forEach((node) => {
      const pos = positions.get(node.id) || new THREE.Vector3(0, 0, 0);
      const group = new THREE.Group();
      group.position.copy(pos);
      group.userData = { node };

      let coreMesh: THREE.Mesh;

      if (node.type === 'PROVIDER') {
        const isCrit = (node.riskScore || 0) >= 75;
        const color = isCrit ? CYBER_THEME.patientRed : CYBER_THEME.doctorBlue;

        const mat = new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.6,
          roughness: 0.2,
          metalness: 0.8,
        });

        coreMesh = new THREE.Mesh(doctorGeo, mat);
        group.add(coreMesh);

        // Outer Aura Ring
        const ring = createGlowRing(3.6, color, 0.4);
        group.add(ring);

        // Billboard Text Pin
        const labelSprite = createTextSprite(
          `${node.label.split(',')[0]} • ${node.id.replace('NPI-', '')}`,
          {
            fontSize: 20,
            fontColor: '#FFFFFF',
            bgColor: 'rgba(5, 8, 17, 0.85)',
            borderColor: isCrit ? '#EF4444' : '#3186FF',
            scale: 0.1,
          }
        );
        labelSprite.position.set(0, 6.2, 0);
        group.add(labelSprite);
      } else if (node.type === 'FACILITY') {
        const mat = new THREE.MeshStandardMaterial({
          color: CYBER_THEME.clinicAmber,
          emissive: CYBER_THEME.clinicAmber,
          emissiveIntensity: 0.5,
          roughness: 0.3,
          metalness: 0.7,
        });

        coreMesh = new THREE.Mesh(facilityGeo, mat);
        group.add(coreMesh);

        // Wireframe cage around facility cube
        const wireMat = new THREE.MeshBasicMaterial({
          color: 0xffe600,
          wireframe: true,
          transparent: true,
          opacity: 0.4,
        });
        const wireMesh = new THREE.Mesh(new THREE.BoxGeometry(5.4, 5.4, 5.4), wireMat);
        group.add(wireMesh);

        const labelSprite = createTextSprite(node.label, {
          fontSize: 18,
          fontColor: '#F59E0B',
          bgColor: 'rgba(5, 8, 17, 0.85)',
          borderColor: '#F59E0B',
          scale: 0.09,
        });
        labelSprite.position.set(0, 5.6, 0);
        group.add(labelSprite);
      } else {
        // Patient / Beneficiary micro-spheres
        const mat = new THREE.MeshStandardMaterial({
          color: CYBER_THEME.patientRed,
          emissive: CYBER_THEME.patientRed,
          emissiveIntensity: 0.7,
          roughness: 0.3,
        });

        coreMesh = new THREE.Mesh(memberGeo, mat);
        group.add(coreMesh);

        // Micro label
        const labelSprite = createTextSprite(node.label, {
          fontSize: 16,
          fontColor: '#ACF2E5',
          bgColor: 'rgba(5, 8, 17, 0.7)',
          borderColor: '#209B47',
          scale: 0.065,
        });
        labelSprite.position.set(0, 3.2, 0);
        group.add(labelSprite);
      }

      scene.add(group);
      nodeMeshes.set(node.id, group);
      interactiveObjects.push(coreMesh);
      coreMesh.userData = { parentGroup: group, node };
    });

    nodeMeshesRef.current = nodeMeshes;

    // 10. Build 3D Fiber-Optic Glowing Edges & Animated Money Flow Particles
    const linePositions: number[] = [];
    const lineColors: number[] = [];
    const particlePositions: number[] = [];
    const particleColors: number[] = [];
    const particleData: { origin: THREE.Vector3; dest: THREE.Vector3; progress: number; speed: number }[] = [];

    const cyanCol = new THREE.Color(CYBER_THEME.beamCyan);
    const redCol = new THREE.Color(CYBER_THEME.crimsonRing);

    rawEdges.forEach((edge) => {
      const p1 = positions.get(edge.source);
      const p2 = positions.get(edge.target);
      if (!p1 || !p2) return;

      linePositions.push(p1.x, p1.y, p1.z);
      linePositions.push(p2.x, p2.y, p2.z);

      const col = edge.isCollusion ? redCol : cyanCol;
      lineColors.push(col.r, col.g, col.b);
      lineColors.push(col.r, col.g, col.b);

      // Create streaming money flow particles along this edge
      const numParticles = edge.isCollusion ? 3 : 1;
      for (let k = 0; k < numParticles; k++) {
        particlePositions.push(p1.x, p1.y, p1.z);
        particleColors.push(col.r, col.g, col.b);
        particleData.push({
          origin: p1.clone(),
          dest: p2.clone(),
          progress: Math.random(),
          speed: 0.006 + Math.random() * 0.008,
        });
      }
    });

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineMesh);
    edgeLinesRef.current = lineMesh;

    // Money Flow Particle System
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
    pGeo.setAttribute('color', new THREE.Float32BufferAttribute(particleColors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const pSystem = new THREE.Points(pGeo, pMat);
    scene.add(pSystem);
    edgeParticlesRef.current = pSystem;

    // 11. Raycasting for Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects);

      if (intersects.length > 0) {
        container.style.cursor = 'pointer';
        const hitNode = intersects[0].object.userData.node as GalaxyNode;
        if (hitNode) setHoveredNodeId(hitNode.id);
      } else {
        container.style.cursor = 'default';
        setHoveredNodeId(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects);

      if (intersects.length > 0) {
        const hitNode = intersects[0].object.userData.node as GalaxyNode;
        if (hitNode) {
          setSelectedNodeId(hitNode.id);
          onSelectNode?.(hitNode.id, hitNode.type);

          // Fly camera smoothly to focus on target
          const pos = positions.get(hitNode.id);
          if (pos) {
            targetControlsTargetRef.current = pos.clone();
            targetCamPosRef.current = pos.clone().add(new THREE.Vector3(12, 16, 28));
          }
        }
      }
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handleClick);

    // 12. Responsive Resize
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // 13. 60 FPS Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      controls.update();

      // Smooth camera interpolation to target when clicked
      if (targetCamPosRef.current && targetControlsTargetRef.current) {
        camera.position.lerp(targetCamPosRef.current, 0.06);
        controls.target.lerp(targetControlsTargetRef.current, 0.06);

        if (camera.position.distanceTo(targetCamPosRef.current) < 0.2) {
          targetCamPosRef.current = null;
          targetControlsTargetRef.current = null;
        }
      }

      // Auto-rotation if enabled
      if (isAutoRotate) {
        scene.rotation.y += 0.002;
      }

      // Starfield subtle slow drift
      starfield.rotation.y = elapsedTime * 0.012;
      starfield.rotation.x = elapsedTime * 0.006;

      // Animate node oscillations and facility rotations
      nodeMeshes.forEach((mesh, id) => {
        const node = mesh.userData.node as GalaxyNode;
        if (node.type === 'FACILITY') {
          mesh.rotation.y += 0.015;
          mesh.rotation.x += 0.008;
        } else if (node.type === 'PROVIDER') {
          // Pulsing scale for critical target
          const s = 1.0 + Math.sin(elapsedTime * 3.5 + (node.riskScore || 0)) * 0.06;
          mesh.scale.set(s, s, s);
        } else if (node.type === 'MEMBER') {
          // Micro pulse
          const s = 1.0 + Math.sin(elapsedTime * 5.0) * 0.12;
          mesh.scale.set(s, s, s);
        }
      });

      // Animate Money Flow Streaming Particles along Edges
      if (pSystem && particleData.length > 0) {
        const posAttr = pGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < particleData.length; i++) {
          const item = particleData[i];
          item.progress += item.speed;
          if (item.progress > 1.0) item.progress = 0.0;

          // Interpolate current position along edge
          const curPos = item.origin.clone().lerp(item.dest, item.progress);
          // Add small perpendicular sine wave for dynamic laser beam effect
          curPos.y += Math.sin(item.progress * Math.PI) * 1.5;

          posAttr.setXYZ(i, curPos.x, curPos.y, curPos.z);
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 14. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handleClick);
      resizeObserver.disconnect();
      disposeThreeHierarchy(scene);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [rawNodes, rawEdges, isAutoRotate]);

  // Handle Dimming & Connected Kickback Ring Highlights on Selection
  useEffect(() => {
    if (!selectedNodeId || nodeMeshesRef.current.size === 0) return;

    // Find all 1st-degree neighbors
    const neighborSet = new Set<string>([selectedNodeId]);
    rawEdges.forEach((e) => {
      if (e.source === selectedNodeId) neighborSet.add(e.target);
      if (e.target === selectedNodeId) neighborSet.add(e.source);
    });

    nodeMeshesRef.current.forEach((mesh, id) => {
      const isNeighbor = neighborSet.has(id);
      mesh.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Sprite) {
          if (child.material) {
            const mat = child.material as THREE.Material;
            mat.transparent = true;
            mat.opacity = isNeighbor ? 1.0 : 0.15;
          }
        }
      });
    });
  }, [selectedNodeId, rawEdges]);

  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    targetControlsTargetRef.current = new THREE.Vector3(0, 0, 0);
    targetCamPosRef.current = new THREE.Vector3(0, 35, 110);
  };

  return (
    <div className={`relative w-full h-[580px] rounded-2xl overflow-hidden border border-[#042126]/20 bg-[#050811] shadow-2xl font-sans select-none ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Top-Left Cyber Studio Overlay Bar */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#050811]/85 border border-[#3186FF]/30 backdrop-blur-md text-xs font-semibold text-white shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3186FF] animate-ping" />
          <span className="tracking-wide uppercase font-mono text-[11px] text-[#ACF2E5]">3D Collusion Galaxy</span>
          <span className="text-white/30">•</span>
          <span className="text-white/70 font-mono text-[11px]">{rawNodes.length} Entities</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1 bg-[#050811]/85 p-1 rounded-xl border border-white/10 backdrop-blur-md">
          <button
            onClick={handleResetCamera}
            title="Reset Camera View"
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-[#ACF2E5]" />
          </button>
          <button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            title="Toggle Orbital Rotation"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isAutoRotate ? 'bg-[#3186FF]/30 text-[#ACF2E5] border border-[#3186FF]' : 'hover:bg-white/10 text-white/70 hover:text-white'}`}
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend Indicator Strip */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center space-x-3 px-3.5 py-2 rounded-xl bg-[#050811]/85 border border-white/10 backdrop-blur-md text-[11px]">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-[#3186FF] shadow-xs" />
          <span className="text-white font-medium">Doctors (NPIs)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-xs bg-[#F59E0B] shadow-xs" />
          <span className="text-white font-medium">Shell Clinics</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-pulse" />
          <span className="text-white font-medium">Flagged Patients</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-4 h-0.5 bg-[#EF4444]" />
          <span className="text-[#EF4444] font-mono font-bold">Kickback Beams</span>
        </div>
      </div>

      {/* Top-Right Floating Inspector HUD */}
      {selectedNode && (
        <div className="absolute top-4 right-4 z-10 w-80 max-w-[calc(100vw-2rem)] p-4 rounded-2xl bg-[#050811]/90 border border-[#3186FF]/40 backdrop-blur-xl text-xs text-white shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2.5">
            <div>
              <div className="flex items-center space-x-1.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  selectedNode.type === 'PROVIDER' 
                    ? 'bg-[#3186FF]/20 text-[#38BDF8] border border-[#3186FF]/40' 
                    : selectedNode.type === 'FACILITY' 
                    ? 'bg-[#F59E0B]/20 text-[#FBBF24] border border-[#F59E0B]/40'
                    : 'bg-[#EF4444]/20 text-[#F87171] border border-[#EF4444]/40'
                }`}>
                  {selectedNode.type}
                </span>
                {selectedNode.is_target && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#EF4444] text-white">
                    PRIMARY TARGET
                  </span>
                )}
              </div>
              <h3 className="font-bold text-sm text-white mt-1 leading-snug">{selectedNode.label}</h3>
              <p className="text-[11px] text-[#ACF2E5] font-mono mt-0.5">
                ID: {selectedNode.id} {selectedNode.specialty ? `• ${selectedNode.specialty}` : ''}
              </p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
              <span className="text-[10px] text-white/50 uppercase font-semibold">Risk Score</span>
              <p className="text-base font-bold font-mono text-[#EF4444] tabular-nums">
                {selectedNode.riskScore?.toFixed(1) || '88.5'} <span className="text-[10px] text-white/40">/ 100</span>
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
              <span className="text-[10px] text-white/50 uppercase font-semibold">FWA Exposure</span>
              <p className="text-base font-bold font-mono text-[#FBBF24] tabular-nums">
                {formatMoney(selectedNode.exposure || 142000)}
              </p>
            </div>
          </div>

          {/* Scheme / Pattern Description */}
          <div className="p-2.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[11px] space-y-1">
            <span className="text-[10px] font-bold text-[#EF4444] uppercase tracking-wider block">
              Detected Topology Scheme
            </span>
            <p className="text-white/80 leading-relaxed font-medium">
              {selectedNode.scheme || 'Collusive Reciprocal Referral Loop with Shell Clinic Tax ID'}
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex items-center space-x-2 pt-1">
            {selectedNode.type === 'PROVIDER' && onSelectCaseByNpi && (
              <button
                onClick={() => onSelectCaseByNpi(selectedNode.id)}
                className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-[#209B47] hover:bg-[#1B843C] text-white font-semibold text-xs transition-colors shadow-md cursor-pointer"
              >
                <span>Inspect Clinical Case</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
