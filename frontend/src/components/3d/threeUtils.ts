import * as THREE from 'three';

/**
 * ClaimShield Nexus — 3D WebGL Visualization Utilities & Theme Tokens
 * Deep cyber-space institutional styling for healthcare fraud intelligence.
 */

export const CYBER_THEME = {
  background: 0x050811, // Slate-950 deep space
  doctorBlue: 0x3186ff, // Glowing Cyan/Blue for Doctors / Providers
  clinicAmber: 0xf59e0b, // Amber for Shell Clinics / Facilities
  patientRed: 0xef4444, // Neon Crimson for Flagged Patients / High Risk
  compliantGreen: 0x209b47, // Emerald Green for Compliant Baseline
  mintAqua: 0xacf2e5, // Mint accent
  gridLine: 0x1e293b, // Subtle grid
  beamCyan: 0x38bdf8, // Particle beam
  crimsonRing: 0xff2a5f, // Collusion ring pulse
};

/**
 * Creates an ambient starfield particle dust system
 */
export function createStarfield(count: number = 800, radius: number = 250): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const colorPool = [
    new THREE.Color('#3186FF'),
    new THREE.Color('#ACF2E5'),
    new THREE.Color('#38BDF8'),
    new THREE.Color('#FFFFFF'),
    new THREE.Color('#64748B'),
  ];

  for (let i = 0; i < count; i++) {
    const r = radius * (0.3 + 0.7 * Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const c = colorPool[Math.floor(Math.random() * colorPool.length)];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 1.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}

/**
 * Creates a high-DPI canvas billboard sprite for crisp 3D labels
 */
export function createTextSprite(
  text: string,
  options?: {
    fontSize?: number;
    fontColor?: string;
    bgColor?: string;
    borderColor?: string;
    scale?: number;
    padding?: number;
    isMono?: boolean;
  }
): THREE.Sprite {
  const fontSize = options?.fontSize || 22;
  const fontColor = options?.fontColor || '#FFFFFF';
  const bgColor = options?.bgColor || 'rgba(5, 8, 17, 0.85)';
  const borderColor = options?.borderColor || '#3186FF';
  const scale = options?.scale || 0.12;
  const padding = options?.padding || 12;
  const isMono = options?.isMono !== false;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const emptyGeo = new THREE.SpriteMaterial();
    return new THREE.Sprite(emptyGeo);
  }

  // Set font to measure
  const fontFace = isMono ? '"JetBrains Mono", monospace' : '"Plus Jakarta Sans", sans-serif';
  ctx.font = `600 ${fontSize}px ${fontFace}`;
  const metrics = ctx.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = Math.ceil(fontSize * 1.3);

  canvas.width = (textWidth + padding * 2) * 2;
  canvas.height = (textHeight + padding * 1.5) * 2;
  ctx.scale(2, 2);

  // Draw rounded pill background
  const x = 0;
  const y = 0;
  const w = textWidth + padding * 2;
  const h = textHeight + padding * 1.5;
  const radius = 6;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();

  ctx.fillStyle = bgColor;
  ctx.fill();

  if (borderColor) {
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = borderColor;
    ctx.stroke();
  }

  // Draw text
  ctx.font = `600 ${fontSize}px ${fontFace}`;
  ctx.fillStyle = fontColor;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(text, padding, h / 2 + 1);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });

  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set((canvas.width / 2) * scale, (canvas.height / 2) * scale, 1);
  return sprite;
}

/**
 * Creates a glowing aura ring around nodes
 */
export function createGlowRing(radius: number, color: number, opacity: number = 0.5): THREE.Mesh {
  const geometry = new THREE.RingGeometry(radius * 1.1, radius * 1.3, 32);
  const material = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  return new THREE.Mesh(geometry, material);
}

/**
 * Recursively disposes of Three.js objects to prevent memory leaks
 */
export function disposeThreeHierarchy(root: THREE.Object3D): void {
  root.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Points || child instanceof THREE.Sprite || child instanceof THREE.Line) {
      if (child.geometry) {
        child.geometry.dispose();
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => mat.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
  });
}
