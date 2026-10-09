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
  Clock, 
  RotateCcw, 
  Play, 
  Pause, 
  ChevronRight
} from 'lucide-react';
import { SchemeEvolutionSnapshot } from '../../types';

interface TemporalBurstSpiral3DProps {
  history?: SchemeEvolutionSnapshot[] | any[];
  className?: string;
}

export const TemporalBurstSpiral3D: React.FC<TemporalBurstSpiral3DProps> = ({
  history: directHistory,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { formatMoney } = useCurrency();

  const history: SchemeEvolutionSnapshot[] = useMemo(() => {
    if (directHistory && Array.isArray(directHistory) && directHistory.length > 0) {
      return directHistory.map((item: any, idx: number) => {
        const rawLabel = item.epoch_label || (item.epoch ? `${item.epoch} - Evolution` : `Epoch ${idx + 1} - Timeline`);
        const riskScore = typeof item.risk_score === 'number'
          ? item.risk_score
          : (typeof item.avg_risk === 'number'
            ? item.avg_risk
            : (typeof item.composite_risk_score === 'number' ? item.composite_risk_score : 50.0));
        const financialExposure = typeof item.financial_exposure === 'number'
          ? item.financial_exposure
          : (typeof item.exposure_usd === 'number'
            ? item.exposure_usd
            : (typeof item.potential_financial_exposure === 'number' ? item.potential_financial_exposure : 25000 * (idx + 1)));
        const claimVolume = typeof item.claim_volume === 'number'
          ? item.claim_volume
          : (((item.normal_volume || 0) + (item.flagged_volume || 0)) || (45 * (idx + 1)));
        const activeProviders = typeof item.active_providers_count === 'number'
          ? item.active_providers_count
          : Math.max(1, idx + 1);
        const activeFacilities = typeof item.active_facilities_count === 'number'
          ? item.active_facilities_count
          : Math.max(1, Math.floor(idx / 2) + 1);
        const activeMembers = typeof item.active_members_count === 'number'
          ? item.active_members_count
          : Math.max(10, 35 * (idx + 1));
        const dateStart = item.date_start || `2025-${String(Math.min(12, 10 + idx)).padStart(2, '0')}-01`;
        const dateEnd = item.date_end || `2025-${String(Math.min(12, 10 + idx)).padStart(2, '0')}-28`;
        const dominantSchemes = Array.isArray(item.dominant_schemes) && item.dominant_schemes.length > 0
          ? item.dominant_schemes
          : (item.dominant_fwa_pattern ? [item.dominant_fwa_pattern] : ['Volume Surge & Scheme Evolution']);

        return {
          epoch_label: rawLabel,
          epoch_index: typeof item.epoch_index === 'number' ? item.epoch_index : idx,
          date_start: dateStart,
          date_end: dateEnd,
          active_providers_count: activeProviders,
          active_facilities_count: activeFacilities,
          active_members_count: activeMembers,
          claim_volume: claimVolume,
          financial_exposure: financialExposure,
          risk_score: riskScore,
          dominant_schemes: dominantSchemes,
        };
      });
    }

    return [
      {
        epoch_label: 'Day 0 - Baseline',
        epoch_index: 0,
        date_start: '2025-10-01',
        date_end: '2025-10-31',
        active_providers_count: 1,
        active_facilities_count: 1,
        active_members_count: 38,
        claim_volume: 42,
        financial_exposure: 12400,
        risk_score: 18.5,
        dominant_schemes: ['Normal Baseline Practice'],
      },
      {
        epoch_label: 'Day 30 - Emerging',
        epoch_index: 1,
        date_start: '2025-11-01',
        date_end: '2025-11-30',
        active_providers_count: 2,
        active_facilities_count: 2,
        active_members_count: 85,
        claim_volume: 98,
        financial_exposure: 41200,
        risk_score: 46.2,
        dominant_schemes: ['Modifier-25 Inception'],
      },
      {
        epoch_label: 'Day 60 - Accelerating',
        epoch_index: 2,
        date_start: '2025-12-01',
        date_end: '2025-12-31',
        active_providers_count: 3,
        active_facilities_count: 2,
        active_members_count: 194,
        claim_volume: 247,
        financial_exposure: 118500,
        risk_score: 76.7,
        dominant_schemes: ['High-Volume Upcoding'],
      },
      {
        epoch_label: 'Day 90 - High Risk Burst',
        epoch_index: 3,
        date_start: '2026-01-01',
        date_end: '2026-01-31',
        active_providers_count: 4,
        active_facilities_count: 3,
        active_members_count: 342,
        claim_volume: 412,
        financial_exposure: 215400,
        risk_score: 89.4,
        dominant_schemes: ['Collusive Ring Burst'],
      },
    ];
  }, [directHistory]);

  const [activeEpochIndex, setActiveEpochIndex] = useState<number>(() => Math.max(0, history.length - 1));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(false);

  useEffect(() => {
    if (activeEpochIndex >= history.length) {
      setActiveEpochIndex(Math.max(0, history.length - 1));
    }
  }, [history.length, activeEpochIndex]);

  const activeSnapshot: SchemeEvolutionSnapshot = history[activeEpochIndex] || history[0] || {
    epoch_label: 'Day 0 - Baseline',
    epoch_index: 0,
    date_start: '2025-10-01',
    date_end: '2025-10-31',
    active_providers_count: 1,
    active_facilities_count: 1,
    active_members_count: 38,
    claim_volume: 42,
    financial_exposure: 12400,
    risk_score: 18.5,
    dominant_schemes: ['Normal Baseline Practice'],
  };

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const epochPositionsRef = useRef<THREE.Vector3[]>([]);
  const targetCamPosRef = useRef<THREE.Vector3 | null>(null);
  const targetControlsTargetRef = useRef<THREE.Vector3 | null>(null);
  const shockwaveRingsRef = useRef<THREE.Mesh[]>([]);

  // Auto timeline player
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setActiveEpochIndex((prev) => (prev + 1) % history.length);
    }, 2800);

    return () => clearInterval(interval);
  }, [isPlaying, history.length]);

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
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(45, 38, 70);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 20;
    controls.maxDistance = 250;
    controls.target.set(0, 10, 0);
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const redLight = new THREE.PointLight(CYBER_THEME.patientRed, 3.5, 180);
    redLight.position.set(0, 30, 0);
    scene.add(redLight);

    const blueLight = new THREE.PointLight(CYBER_THEME.doctorBlue, 2.5, 180);
    blueLight.position.set(-30, -10, 30);
    scene.add(blueLight);

    // 6. Ambient Starfield Dust
    const starfield = createStarfield(850, 300);
    scene.add(starfield);

    // 7. Base Grid Floor
    const gridHelper = new THREE.GridHelper(120, 20, 0x3186FF, 0x1E293B);
    gridHelper.position.y = -18;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.3;
    scene.add(gridHelper);

    // 8. Construct 3D Helical Spiral Path
    const curvePoints: THREE.Vector3[] = [];
    const numPoints = 240;
    const turns = 2.8;
    const heightSpan = 42;
    const baseRadius = 24;

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const angle = t * Math.PI * 2 * turns;
      // Radius expands as time goes forward (expanding risk vortex)
      const radius = baseRadius * (0.5 + t * 0.75);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = -14 + t * heightSpan;
      curvePoints.push(new THREE.Vector3(x, y, z));
    }

    const spiralCurve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeo = new THREE.TubeGeometry(spiralCurve, 180, 0.8, 12, false);

    // Dynamic Gradient Tube Material
    const tubeMat = new THREE.MeshStandardMaterial({
      color: CYBER_THEME.doctorBlue,
      emissive: CYBER_THEME.doctorBlue,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.75,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(tubeMesh);

    // 9. Calculate Epoch Milestone Anchors on the Spiral
    const epochPositions: THREE.Vector3[] = [];
    const interactiveEpochSpheres: THREE.Mesh[] = [];

    history.forEach((epoch, idx) => {
      const t = idx / Math.max(1, history.length - 1);
      const point = spiralCurve.getPointAt(Math.min(0.98, t));
      epochPositions.push(point);

      const isBurst = idx === history.length - 1;
      const riskVal = typeof epoch.risk_score === 'number' ? epoch.risk_score : 50;
      const isCritical = riskVal >= 75;

      const sphereGeo = new THREE.SphereGeometry(isBurst ? 4.2 : 3.0, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: isCritical ? CYBER_THEME.patientRed : isBurst ? CYBER_THEME.clinicAmber : CYBER_THEME.compliantGreen,
        emissive: isCritical ? CYBER_THEME.patientRed : isBurst ? CYBER_THEME.clinicAmber : CYBER_THEME.compliantGreen,
        emissiveIntensity: isCritical ? 0.9 : 0.6,
        roughness: 0.2,
        metalness: 0.8,
      });

      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.copy(point);
      sphere.userData = { epochIndex: idx, epoch };
      scene.add(sphere);
      interactiveEpochSpheres.push(sphere);

      // Add Glow Rings around Epoch Milestones
      const ring = createGlowRing(isBurst ? 4.8 : 3.4, isCritical ? CYBER_THEME.patientRed : CYBER_THEME.doctorBlue, 0.6);
      ring.position.copy(point);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);

      // Billboard Text Pin for Epoch
      const shortLabel = (epoch.epoch_label || `Epoch ${idx + 1}`).split(' - ')[0];
      const sprite = createTextSprite(
        `${shortLabel} • ${riskVal.toFixed(0)} Risk`,
        {
          fontSize: 20,
          fontColor: '#FFFFFF',
          bgColor: 'rgba(5, 8, 17, 0.85)',
          borderColor: isCritical ? '#EF4444' : '#3186FF',
          scale: 0.1,
        }
      );
      sprite.position.copy(point).add(new THREE.Vector3(0, 5.5, 0));
      scene.add(sprite);
    });

    epochPositionsRef.current = epochPositions;

    // 10. Expanding 3D Shockwave Rings at Day 90 Burst
    const burstPos = epochPositions[epochPositions.length - 1] || new THREE.Vector3(0, 20, 0);
    const shockwaves: THREE.Mesh[] = [];

    for (let k = 0; k < 3; k++) {
      const ringGeo = new THREE.TorusGeometry(6 + k * 4, 0.4, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: CYBER_THEME.patientRed,
        transparent: true,
        opacity: 0.7 - k * 0.2,
        blending: THREE.AdditiveBlending,
      });
      const shockRing = new THREE.Mesh(ringGeo, ringMat);
      shockRing.position.copy(burstPos);
      shockRing.rotation.x = Math.PI / 2;
      scene.add(shockRing);
      shockwaves.push(shockRing);
    }
    shockwaveRingsRef.current = shockwaves;

    // 11. Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveEpochSpheres);

      if (intersects.length > 0) {
        const idx = intersects[0].object.userData.epochIndex;
        if (typeof idx === 'number') {
          setActiveEpochIndex(idx);
          setIsPlaying(false);
        }
      }
    };

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

      // Smooth camera flying to target epoch position
      if (targetCamPosRef.current && targetControlsTargetRef.current) {
        camera.position.lerp(targetCamPosRef.current, 0.06);
        controls.target.lerp(targetControlsTargetRef.current, 0.06);

        if (camera.position.distanceTo(targetCamPosRef.current) < 0.2) {
          targetCamPosRef.current = null;
          targetControlsTargetRef.current = null;
        }
      }

      if (isAutoRotate) {
        scene.rotation.y += 0.0025;
      }

      starfield.rotation.y = elapsedTime * 0.01;

      // Animate expanding shockwave rings
      shockwaves.forEach((sw, idx) => {
        const scale = 1.0 + ((elapsedTime * 1.5 + idx * 0.8) % 3.0);
        sw.scale.set(scale, scale, scale);
        const mat = sw.material as THREE.Material;
        mat.opacity = Math.max(0, 0.8 - scale * 0.25);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('click', handleClick);
      resizeObserver.disconnect();
      disposeThreeHierarchy(scene);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [history, isAutoRotate]);

  // Handle active epoch camera fly-to
  useEffect(() => {
    const pos = epochPositionsRef.current[activeEpochIndex];
    if (pos && cameraRef.current && controlsRef.current) {
      targetControlsTargetRef.current = pos.clone();
      targetCamPosRef.current = pos.clone().add(new THREE.Vector3(18, 14, 28));
    }
  }, [activeEpochIndex]);

  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    targetControlsTargetRef.current = new THREE.Vector3(0, 10, 0);
    targetCamPosRef.current = new THREE.Vector3(45, 38, 70);
  };

  return (
    <div className={`relative w-full h-[580px] rounded-2xl overflow-hidden border border-[#042126]/20 bg-[#050811] shadow-2xl font-sans select-none ${className}`}>
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Top-Left Cyber Studio Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#050811]/85 border border-[#3186FF]/30 backdrop-blur-md text-xs font-semibold text-white shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3186FF] animate-ping" />
          <span className="tracking-wide uppercase font-mono text-[11px] text-[#ACF2E5]">3D Temporal Burst Spiral</span>
          <span className="text-white/30">•</span>
          <span className="text-white/70 font-mono text-[11px]">{history.length} Epoch Windows</span>
        </div>

        {/* Play/Pause & Reset Controls */}
        <div className="flex items-center space-x-1 bg-[#050811]/85 p-1 rounded-xl border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause Timeline' : 'Play Timeline'}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#3186FF] hover:bg-[#2563EB] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={handleResetCamera}
            title="Reset Camera Angle"
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-[#ACF2E5]" />
          </button>
        </div>
      </div>

      {/* Bottom Epoch Scrubber Buttons */}
      <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-10 flex items-center space-x-1 bg-[#050811]/90 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md overflow-x-auto shadow-2xl">
        {history.map((ep, idx) => {
          const shortLabel = (ep.epoch_label || `Epoch ${idx + 1}`).split(' - ')[0];
          return (
            <button
              key={idx}
              onClick={() => {
                setActiveEpochIndex(idx);
                setIsPlaying(false);
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeEpochIndex === idx
                  ? 'bg-[#3186FF] text-white shadow-lg font-bold border border-[#38BDF8]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{shortLabel}</span>
              {idx === history.length - 1 && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#EF4444] text-white">
                  BURST
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Top-Right Floating Velocity HUD Inspector */}
      {activeSnapshot && (
        <div className="absolute top-4 right-4 z-10 w-80 max-w-[calc(100vw-2rem)] p-4 rounded-2xl bg-[#050811]/90 border border-[#3186FF]/40 backdrop-blur-xl text-xs text-white shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2.5">
            <div>
              <div className="flex items-center space-x-1.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  (activeSnapshot.risk_score ?? 0) >= 75
                    ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
                    : (activeSnapshot.risk_score ?? 0) >= 45
                    ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                    : 'bg-[#209B47]/20 text-[#209B47] border border-[#209B47]/40'
                }`}>
                  {(activeSnapshot.epoch_label || 'EPOCH').split(' - ')[1] || (activeSnapshot.epoch_label || 'EPOCH WINDOW')}
                </span>
              </div>
              <h3 className="font-bold text-sm text-white mt-1">{activeSnapshot.epoch_label || 'Epoch Window'}</h3>
              <p className="text-[11px] text-[#ACF2E5] font-mono mt-0.5">
                {activeSnapshot.date_start || '2025-10-01'} &rarr; {activeSnapshot.date_end || '2026-01-31'}
              </p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
              <span className="text-[10px] text-white/50 uppercase font-semibold">Cumulative Exposure</span>
              <p className="text-base font-bold font-mono text-[#FBBF24] tabular-nums">
                {formatMoney(activeSnapshot.financial_exposure || 0)}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
              <span className="text-[10px] text-white/50 uppercase font-semibold">Risk Level</span>
              <p className="text-base font-bold font-mono text-[#EF4444] tabular-nums">
                {(activeSnapshot.risk_score ?? 0).toFixed(1)} <span className="text-[10px] text-white/40">/ 100</span>
              </p>
            </div>
          </div>

          {/* Entity & Volume Breakdown */}
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Encounter Volume:</span>
              <span className="font-mono font-bold text-white tabular-nums">{activeSnapshot.claim_volume ?? 0} Claims</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Linked Network Entities:</span>
              <span className="font-mono font-bold text-[#ACF2E5] tabular-nums">
                {activeSnapshot.active_providers_count ?? 0} Prov • {activeSnapshot.active_facilities_count ?? 0} Fac
              </span>
            </div>
          </div>

          {/* Dominant Scheme Badge */}
          <div className="p-2.5 rounded-xl bg-[#3186FF]/10 border border-[#3186FF]/30 text-[11px] space-y-1">
            <span className="text-[10px] font-bold text-[#38BDF8] uppercase tracking-wider block">
              Dominant Scheme Evolution
            </span>
            <p className="text-white/90 font-medium">
              {activeSnapshot.dominant_schemes?.join(', ') || (activeSnapshot as any)?.dominant_fwa_pattern || 'Collusive Ring Burst'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
