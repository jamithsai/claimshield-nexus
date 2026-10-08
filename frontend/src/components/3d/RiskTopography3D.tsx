import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  CYBER_THEME, 
  createStarfield, 
  createTextSprite, 
  disposeThreeHierarchy 
} from './threeUtils';
import { useCurrency } from '../../context/CurrencyContext';
import { 
  BarChart2, 
  RotateCcw, 
  Filter, 
  TrendingUp, 
  ShieldAlert, 
  DollarSign, 
  Layers, 
  Sparkles,
  Zap
} from 'lucide-react';

export interface TopographyDataPoint {
  specialty: string;
  epoch: string;
  billedAmount: number;
  flaggedExposure: number;
  riskScore: number;
  providerCount: number;
  anomalyTier: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

interface RiskTopography3DProps {
  data?: TopographyDataPoint[];
  className?: string;
}

export const RiskTopography3D: React.FC<RiskTopography3DProps> = ({
  data: customData,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { formatMoney, currencySymbol } = useCurrency();

  // Presets & Filter states
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'BURST' | 'HIGH_EXPOSURE'>('ALL');
  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<TopographyDataPoint | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<TopographyDataPoint | null>(null);

  // Specialties & Epochs axes
  const specialties = useMemo(() => [
    'Pain Medicine',
    'Orthopedics',
    'Neurology',
    'Physical Therapy',
    'Radiology',
    'Cardiology',
    'Internal Med',
    'General Surgery'
  ], []);

  const epochs = useMemo(() => [
    'Day 0 Baseline',
    'Day 30 Emerging',
    'Day 60 Accelerating',
    'Day 90 High Risk Burst'
  ], []);

  // Generate complete 8x4 matrix of 3D data points
  const gridData: TopographyDataPoint[] = useMemo(() => {
    if (customData && customData.length > 0) return customData;

    const points: TopographyDataPoint[] = [];

    specialties.forEach((spec, sIdx) => {
      epochs.forEach((ep, eIdx) => {
        // Higher values for Pain Med, Orthopedics, and later epochs
        const isSpikeSpec = spec === 'Pain Medicine' || spec === 'Physical Therapy' || spec === 'Orthopedics';
        const isBurstEpoch = ep.includes('90') || ep.includes('60');

        let baseExposure = 8000 + (sIdx * 4500) + (eIdx * 12000);
        let risk = 20 + (sIdx * 5) + (eIdx * 18);

        if (isSpikeSpec && isBurstEpoch) {
          baseExposure *= 2.8;
          risk = Math.min(96, risk * 1.65);
        }

        let tier: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
        if (risk >= 75) tier = 'CRITICAL';
        else if (risk >= 50) tier = 'HIGH';
        else if (risk >= 30) tier = 'MEDIUM';

        points.push({
          specialty: spec,
          epoch: ep,
          billedAmount: Math.round(baseExposure * 1.4),
          flaggedExposure: Math.round(baseExposure),
          riskScore: Math.round(risk * 10) / 10,
          providerCount: Math.round(3 + (sIdx * 2) + (eIdx * 4)),
          anomalyTier: tier,
        });
      });
    });

    return points;
  }, [customData, specialties, epochs]);

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const pillarsGroupRef = useRef<THREE.Group | null>(null);
  const highlightBeaconRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Setup Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(CYBER_THEME.background);
    scene.fog = new THREE.FogExp2(CYBER_THEME.background, 0.004);

    // 2. Setup Camera
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(65, 55, 75);
    cameraRef.current = camera;

    // 3. Setup Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Do not go below floor
    controls.minDistance = 25;
    controls.maxDistance = 250;
    controls.target.set(0, 10, 0);
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x3186ff, 1.8);
    dirLight1.position.set(40, 80, 40);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xef4444, 1.2);
    dirLight2.position.set(-40, 40, -40);
    scene.add(dirLight2);

    // 6. Ambient Dust Starfield
    const starfield = createStarfield(800, 300);
    scene.add(starfield);

    // 7. Base Holographic Grid Terrain Floor
    const gridHelper = new THREE.GridHelper(100, 20, 0x3186FF, 0x1E293B);
    gridHelper.position.y = 0;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.4;
    scene.add(gridHelper);

    // 8. Axis Labels along the Grid Floor
    const xSpacing = 9;
    const zSpacing = 16;
    const xStart = -((specialties.length - 1) * xSpacing) / 2;
    const zStart = -((epochs.length - 1) * zSpacing) / 2;

    // Specialty axis billboard text labels
    specialties.forEach((spec, sIdx) => {
      const x = xStart + sIdx * xSpacing;
      const sprite = createTextSprite(spec, {
        fontSize: 18,
        fontColor: '#ACF2E5',
        bgColor: 'rgba(5, 8, 17, 0.8)',
        borderColor: '#005F68',
        scale: 0.08,
      });
      sprite.position.set(x, 0.5, zStart - 10);
      scene.add(sprite);
    });

    // Epoch axis billboard text labels
    epochs.forEach((ep, eIdx) => {
      const z = zStart + eIdx * zSpacing;
      const sprite = createTextSprite(ep.split(' ')[0] + ' ' + (ep.split(' ')[1] || ''), {
        fontSize: 18,
        fontColor: '#F59E0B',
        bgColor: 'rgba(5, 8, 17, 0.8)',
        borderColor: '#F59E0B',
        scale: 0.08,
      });
      sprite.position.set(xStart - 12, 0.5, z);
      scene.add(sprite);
    });

    // 9. Build 3D Volumetric Columns (Pillars)
    const pillarsGroup = new THREE.Group();
    scene.add(pillarsGroup);
    pillarsGroupRef.current = pillarsGroup;

    const interactivePillars: THREE.Mesh[] = [];
    const maxExposure = Math.max(...gridData.map((d) => d.flaggedExposure), 1);
    const maxColumnHeight = 36;

    gridData.forEach((point) => {
      const sIdx = specialties.indexOf(point.specialty);
      const eIdx = epochs.indexOf(point.epoch);
      if (sIdx === -1 || eIdx === -1) return;

      const x = xStart + sIdx * xSpacing;
      const z = zStart + eIdx * zSpacing;

      // Height proportional to Flagged Exposure
      const height = Math.max(1.5, (point.flaggedExposure / maxExposure) * maxColumnHeight);

      // Color based on risk tier
      let pillarColor = new THREE.Color(CYBER_THEME.compliantGreen);
      let emissiveIntensity = 0.35;

      if (point.anomalyTier === 'CRITICAL') {
        pillarColor = new THREE.Color(CYBER_THEME.patientRed);
        emissiveIntensity = 0.75;
      } else if (point.anomalyTier === 'HIGH') {
        pillarColor = new THREE.Color(CYBER_THEME.clinicAmber);
        emissiveIntensity = 0.55;
      } else if (point.anomalyTier === 'MEDIUM') {
        pillarColor = new THREE.Color(CYBER_THEME.doctorBlue);
        emissiveIntensity = 0.45;
      }

      // 3D Pillar Geometry
      const colWidth = 5.2;
      const colGeo = new THREE.BoxGeometry(colWidth, height, colWidth);
      const colMat = new THREE.MeshStandardMaterial({
        color: pillarColor,
        emissive: pillarColor,
        emissiveIntensity,
        roughness: 0.25,
        metalness: 0.75,
        transparent: true,
        opacity: 0.88,
      });

      const pillarMesh = new THREE.Mesh(colGeo, colMat);
      pillarMesh.position.set(x, height / 2, z);
      pillarMesh.userData = { point };
      pillarsGroup.add(pillarMesh);
      interactivePillars.push(pillarMesh);

      // Glowing Cap Mesh
      const capGeo = new THREE.BoxGeometry(colWidth * 1.05, 0.4, colWidth * 1.05);
      const capMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
      });
      const capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.set(x, height, z);
      pillarsGroup.add(capMesh);

      // Add Flashing Alert Beacon over Critical Peaks
      if (point.anomalyTier === 'CRITICAL') {
        const beaconGeo = new THREE.SphereGeometry(0.9, 16, 16);
        const beaconMat = new THREE.MeshBasicMaterial({
          color: CYBER_THEME.patientRed,
          transparent: true,
          opacity: 0.95,
        });
        const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
        beaconMesh.position.set(x, height + 2.2, z);
        pillarsGroup.add(beaconMesh);
      }
    });

    // 10. Selection / Hover Laser Highlight Cylinder
    const beaconGeo = new THREE.CylinderGeometry(3.2, 3.2, 50, 24, 1, true);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 25, 0);
    scene.add(beacon);
    highlightBeaconRef.current = beacon;

    // 11. Raycasting for Hover & Click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactivePillars);

      if (intersects.length > 0) {
        container.style.cursor = 'pointer';
        const hit = intersects[0].object;
        const pt = hit.userData.point as TopographyDataPoint;
        if (pt) {
          setHoveredPoint(pt);
          if (highlightBeaconRef.current) {
            highlightBeaconRef.current.position.x = hit.position.x;
            highlightBeaconRef.current.position.z = hit.position.z;
            (highlightBeaconRef.current.material as THREE.Material).opacity = 0.35;
          }
        }
      } else {
        container.style.cursor = 'default';
        setHoveredPoint(null);
        if (highlightBeaconRef.current && !selectedPoint) {
          (highlightBeaconRef.current.material as THREE.Material).opacity = 0.0;
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactivePillars);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const pt = hit.userData.point as TopographyDataPoint;
        if (pt) {
          setSelectedPoint(pt);
          if (highlightBeaconRef.current) {
            highlightBeaconRef.current.position.x = hit.position.x;
            highlightBeaconRef.current.position.z = hit.position.z;
            (highlightBeaconRef.current.material as THREE.Material).opacity = 0.6;
          }
        }
      }
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handleClick);

    // 12. Resize
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // 13. Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      controls.update();

      if (isAutoRotate) {
        scene.rotation.y += 0.0025;
      }

      starfield.rotation.y = elapsedTime * 0.01;

      // Pulse highlight beacon if active
      if (highlightBeaconRef.current && (highlightBeaconRef.current.material as THREE.Material).opacity > 0) {
        highlightBeaconRef.current.rotation.y += 0.02;
      }

      renderer.render(scene, camera);
    };

    animate();

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
  }, [gridData, specialties, epochs, isAutoRotate]);

  // Filter Pillars Visibility / Highlight based on Active Preset
  useEffect(() => {
    if (!pillarsGroupRef.current) return;

    pillarsGroupRef.current.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.userData.point) {
        const pt = child.userData.point as TopographyDataPoint;
        let isMatch = true;

        if (activeFilter === 'CRITICAL') {
          isMatch = pt.anomalyTier === 'CRITICAL';
        } else if (activeFilter === 'BURST') {
          isMatch = pt.epoch.includes('90') || pt.epoch.includes('60');
        } else if (activeFilter === 'HIGH_EXPOSURE') {
          isMatch = pt.flaggedExposure >= 100000;
        }

        const mat = child.material as THREE.Material;
        mat.transparent = true;
        mat.opacity = isMatch ? 0.9 : 0.12;
      }
    });
  }, [activeFilter]);

  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(65, 55, 75);
    controlsRef.current.target.set(0, 10, 0);
  };

  const activeDisplayPoint = hoveredPoint || selectedPoint || gridData[0];

  return (
    <div className={`relative w-full h-[580px] rounded-2xl overflow-hidden border border-[#042126]/20 bg-[#050811] shadow-2xl font-sans select-none ${className}`}>
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Top-Left Cyber Studio Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#050811]/85 border border-[#3186FF]/30 backdrop-blur-md text-xs font-semibold text-white shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-ping" />
          <span className="tracking-wide uppercase font-mono text-[11px] text-[#ACF2E5]">3D Risk Topography</span>
          <span className="text-white/30">•</span>
          <span className="text-white/70 font-mono text-[11px]">8 Specialties × 4 Epochs</span>
        </div>

        {/* Filter Presets */}
        <div className="flex items-center space-x-1 bg-[#050811]/85 p-1 rounded-xl border border-white/10 backdrop-blur-md">
          {[
            { id: 'ALL', label: 'All Specialties' },
            { id: 'CRITICAL', label: 'Critical Peaks' },
            { id: 'BURST', label: 'Day 90 Bursts' },
            { id: 'HIGH_EXPOSURE', label: 'High Exposure' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-[#3186FF] text-white shadow-xs font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}

          <button
            onClick={handleResetCamera}
            title="Reset Camera Angle"
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-[#ACF2E5]" />
          </button>
        </div>
      </div>

      {/* Elevation Color Legend */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center space-x-3 px-3.5 py-2 rounded-xl bg-[#050811]/85 border border-white/10 backdrop-blur-md text-[11px]">
        <span className="text-white/60 font-semibold uppercase text-[10px]">Elevation / Risk:</span>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-xs bg-[#209B47]" />
          <span className="text-white">Compliant Baseline</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-xs bg-[#3186FF]" />
          <span className="text-white">Medium</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-xs bg-[#F59E0B]" />
          <span className="text-white">High</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-xs bg-[#EF4444]" />
          <span className="text-[#EF4444] font-bold">Critical Peak</span>
        </div>
      </div>

      {/* Top-Right Floating Volumetric HUD Inspector */}
      {activeDisplayPoint && (
        <div className="absolute top-4 right-4 z-10 w-80 max-w-[calc(100vw-2rem)] p-4 rounded-2xl bg-[#050811]/90 border border-[#3186FF]/40 backdrop-blur-xl text-xs text-white shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2.5">
            <div>
              <div className="flex items-center space-x-1.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  activeDisplayPoint.anomalyTier === 'CRITICAL'
                    ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
                    : activeDisplayPoint.anomalyTier === 'HIGH'
                    ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                    : 'bg-[#209B47]/20 text-[#209B47] border border-[#209B47]/40'
                }`}>
                  {activeDisplayPoint.anomalyTier} SEVERITY PEAK
                </span>
              </div>
              <h3 className="font-bold text-sm text-white mt-1">{activeDisplayPoint.specialty}</h3>
              <p className="text-[11px] text-[#ACF2E5] font-mono mt-0.5">
                Cohort: {activeDisplayPoint.epoch}
              </p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
              <span className="text-[10px] text-white/50 uppercase font-semibold">Flagged Exposure</span>
              <p className="text-base font-bold font-mono text-[#FBBF24] tabular-nums">
                {formatMoney(activeDisplayPoint.flaggedExposure)}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
              <span className="text-[10px] text-white/50 uppercase font-semibold">Avg Risk Score</span>
              <p className="text-base font-bold font-mono text-[#EF4444] tabular-nums">
                {activeDisplayPoint.riskScore.toFixed(1)} <span className="text-[10px] text-white/40">/ 100</span>
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-white/60">Total Billed Volume:</span>
            <span className="font-mono font-bold text-white tabular-nums">
              {formatMoney(activeDisplayPoint.billedAmount)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-white/60">Monitored Providers:</span>
            <span className="font-mono font-bold text-[#ACF2E5] tabular-nums">
              {activeDisplayPoint.providerCount} Billing NPIs
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#3186FF]/10 border border-[#3186FF]/30 text-[11px] text-white/80">
            <p>
              Volumetric Y-elevation reflects relative potential financial exposure across specialty cohort clusters.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
