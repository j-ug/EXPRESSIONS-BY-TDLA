import * as THREE from 'three';

// Cache generated textures so we don't recreate them needlessly
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates a high-resolution procedural botanical artwork texture
 */
export function createArtworkTexture(theme: string, customImageData?: string): THREE.CanvasTexture {
  const cacheKey = customImageData ? `custom_${customImageData.slice(0, 40)}` : theme;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Base handmade paper background
  const grad = ctx.createRadialGradient(512, 512, 50, 512, 512, 700);
  grad.addColorStop(0, '#f7f4ec');
  grad.addColorStop(0.7, '#ede7dc');
  grad.addColorStop(1, '#dfd6c4');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Add subtle organic paper fibers & noise
  ctx.fillStyle = 'rgba(90, 75, 55, 0.035)';
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const w = 1 + Math.random() * 4;
    const h = 0.5 + Math.random() * 1.5;
    ctx.fillRect(x, y, w, h);
  }

  // Draw organic deckled paper border
  ctx.strokeStyle = 'rgba(120, 105, 80, 0.18)';
  ctx.lineWidth = 14;
  ctx.strokeRect(30, 30, 964, 964);
  ctx.strokeStyle = 'rgba(120, 105, 80, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(42, 42, 940, 940);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 16;

  // If user provided a custom image, draw it onto the deckled canvas
  if (customImageData) {
    const img = new Image();
    img.src = customImageData;
    if (img.complete && img.naturalWidth > 0) {
      // Draw centered with contain aspect ratio
      const pad = 60;
      const targetW = 1024 - pad * 2;
      const targetH = 1024 - pad * 2;
      const imgAspect = img.naturalWidth / img.naturalHeight;
      let drawW = targetW;
      let drawH = targetH;
      if (imgAspect > 1) {
        drawH = targetW / imgAspect;
      } else {
        drawW = targetH * imgAspect;
      }
      const drawX = (1024 - drawW) / 2;
      const drawY = (1024 - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      texture.needsUpdate = true;
    } else {
      // Setup onload for asynchronous image loading
      img.onload = () => {
        const pad = 60;
        const targetW = 1024 - pad * 2;
        const targetH = 1024 - pad * 2;
        const imgAspect = img.naturalWidth / img.naturalHeight;
        let drawW = targetW;
        let drawH = targetH;
        if (imgAspect > 1) {
          drawH = targetW / imgAspect;
        } else {
          drawW = targetH * imgAspect;
        }
        const drawX = (1024 - drawW) / 2;
        const drawY = (1024 - drawH) / 2;
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        texture.needsUpdate = true;
      };
      // Fallback texture while loading
      renderPeepalTheme(ctx);
    }
  } else if (theme === 'peepal_sacred') {
    renderPeepalTheme(ctx);
  } else if (theme === 'lotus_kaveri') {
    renderLotusTheme(ctx);
  } else if (theme === 'palmyra_sun') {
    renderPalmyraTheme(ctx);
  } else if (theme === 'vilvam_monsoon') {
    renderVilvamTheme(ctx);
  } else {
    renderGulmoharTheme(ctx);
  }

  // Subtle artist signature & botanical plate tag in corner
  ctx.font = 'italic 16px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = 'rgba(60, 50, 40, 0.55)';
  ctx.fillText('Herbarium Tamilnadu • Atelier Specimen', 60, 970);
  ctx.textAlign = 'right';
  ctx.fillText('Dr. G. Ophylia Vinodhini • Trichy', 964, 970);

  texture.needsUpdate = true;
  textureCache.set(cacheKey, texture);
  return texture;
}

function renderPeepalTheme(ctx: CanvasRenderingContext2D) {
  // Center main Peepal leaf (Ficus religiosa)
  const cx = 512;
  const cy = 480;

  // Background botanical wash
  const wash = ctx.createRadialGradient(cx, cy, 20, cx, cy, 380);
  wash.addColorStop(0, 'rgba(100, 128, 80, 0.18)');
  wash.addColorStop(0.6, 'rgba(140, 120, 80, 0.08)');
  wash.addColorStop(1, 'rgba(237, 231, 220, 0)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, 1024, 1024);

  // Draw characteristic heart-shaped Peepal leaf with long extended tail tip
  ctx.save();
  ctx.translate(cx, cy);

  // Leaf shadow/halo
  ctx.shadowColor = 'rgba(40, 50, 30, 0.2)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 6;

  ctx.beginPath();
  ctx.moveTo(0, 260); // leaf base
  // Right lobe
  ctx.bezierCurveTo(180, 220, 280, 50, 240, -120);
  ctx.bezierCurveTo(210, -220, 100, -280, 0, -380); // extended tail
  // Left lobe
  ctx.bezierCurveTo(-100, -280, -210, -220, -240, -120);
  ctx.bezierCurveTo(-280, 50, -180, 220, 0, 260);
  ctx.closePath();

  // Leaf fill with semi-transparent pressed texture
  const leafGrad = ctx.createLinearGradient(0, -350, 0, 250);
  leafGrad.addColorStop(0, '#5f754b');
  leafGrad.addColorStop(0.5, '#788e5d');
  leafGrad.addColorStop(0.85, '#8fa068');
  leafGrad.addColorStop(1, '#a68c5b');
  ctx.fillStyle = leafGrad;
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // Draw primary midrib vein with golden highlight
  ctx.beginPath();
  ctx.moveTo(0, 265);
  ctx.quadraticCurveTo(8, -50, 0, -375);
  ctx.strokeStyle = 'rgba(235, 215, 140, 0.85)';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Lateral secondary veins
  for (let i = -14; i <= 14; i++) {
    const yPos = i * 22;
    const side = i % 2 === 0 ? 1 : -1;
    const length = Math.max(30, 220 - Math.abs(i) * 14);

    ctx.beginPath();
    ctx.moveTo(0, yPos);
    ctx.quadraticCurveTo(side * (length * 0.4), yPos - 15, side * length, yPos - 35);
    ctx.strokeStyle = 'rgba(240, 230, 175, 0.7)';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Micro tertiary veins (mesh lattice)
    for (let j = 1; j <= 5; j++) {
      const vx = side * (length * (j / 6));
      const vy = yPos - 25 * (j / 6);
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.lineTo(vx + (side * 12), vy + (j % 2 === 0 ? 10 : -10));
      ctx.strokeStyle = 'rgba(230, 220, 160, 0.35)';
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }
  }

  // Small companion pressed autumn leaves
  ctx.restore();

  // Botanical pressed leaf annotations
  ctx.font = '400 18px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = 'rgba(70, 60, 45, 0.8)';
  ctx.fillText('Ficus religiosa L. — Sacred Peepal Venation', 280, 890);
  ctx.font = 'italic 14px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = 'rgba(100, 90, 70, 0.7)';
  ctx.fillText('Preserved rain-skeletonized leaf collected along Kaveri banks, Tiruchy', 280, 915);
}

function renderLotusTheme(ctx: CanvasRenderingContext2D) {
  const cx = 512;
  const cy = 490;

  // Soft rosy ochre halo
  const wash = ctx.createRadialGradient(cx, cy, 30, cx, cy, 420);
  wash.addColorStop(0, 'rgba(195, 115, 130, 0.22)');
  wash.addColorStop(0.5, 'rgba(215, 150, 130, 0.1)');
  wash.addColorStop(1, 'rgba(237, 231, 220, 0)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, 1024, 1024);

  // Radial layered pressed lotus petals
  ctx.save();
  ctx.translate(cx, cy);

  const petalLayers = [
    { count: 14, radius: 240, scale: 1.15, alpha: 0.7, color1: '#c46979', color2: '#e59fa7' },
    { count: 10, radius: 180, scale: 0.95, alpha: 0.82, color1: '#d67484', color2: '#f3b6bd' },
    { count: 7,  radius: 120, scale: 0.75, alpha: 0.92, color1: '#df7e8f', color2: '#fcd3d8' }
  ];

  petalLayers.forEach((layer) => {
    for (let i = 0; i < layer.count; i++) {
      const angle = (i * (Math.PI * 2)) / layer.count + (layer.scale * 0.4);
      ctx.save();
      ctx.rotate(angle);

      // Single pressed petal shape
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(45 * layer.scale, -60 * layer.scale, 50 * layer.scale, -layer.radius, 0, -layer.radius * 1.1);
      ctx.bezierCurveTo(-50 * layer.scale, -layer.radius, -45 * layer.scale, -60 * layer.scale, 0, 0);
      ctx.closePath();

      const pGrad = ctx.createLinearGradient(0, 0, 0, -layer.radius * 1.1);
      pGrad.addColorStop(0, '#f9e7b2'); // golden base
      pGrad.addColorStop(0.4, layer.color2);
      pGrad.addColorStop(1, layer.color1);

      ctx.fillStyle = pGrad;
      ctx.globalAlpha = layer.alpha;
      ctx.fill();

      // Petal translucent rib lines
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -layer.radius * 1.05);
      ctx.strokeStyle = 'rgba(255, 235, 220, 0.45)';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.restore();
    }
  });

  // Center lotus seed carpel (circular golden torus with holes)
  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  const seedGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 48);
  seedGrad.addColorStop(0, '#f7d358');
  seedGrad.addColorStop(0.7, '#cca128');
  seedGrad.addColorStop(1, '#8f6815');
  ctx.fillStyle = seedGrad;
  ctx.globalAlpha = 0.95;
  ctx.fill();

  // Small seed nodules
  ctx.fillStyle = '#4a3205';
  for (let k = 0; k < 12; k++) {
    const sAngle = (k * Math.PI * 2) / 12;
    const sx = Math.cos(sAngle) * 28;
    const sy = Math.sin(sAngle) * 28;
    ctx.beginPath();
    ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Caption
  ctx.font = '400 18px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = 'rgba(70, 50, 50, 0.8)';
  ctx.fillText('Nelumbo nucifera — Sun-Cured Lotus Corollas', 310, 890);
  ctx.font = 'italic 14px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = 'rgba(110, 80, 80, 0.7)';
  ctx.fillText('Dawn harvest from temple waters, pressed between unbleached cotton', 280, 915);
}

function renderPalmyraTheme(ctx: CanvasRenderingContext2D) {
  const cx = 512;
  const cy = 520;

  // Golden amber wash
  const wash = ctx.createRadialGradient(cx, cy, 30, cx, cy, 450);
  wash.addColorStop(0, 'rgba(215, 165, 55, 0.22)');
  wash.addColorStop(0.6, 'rgba(180, 130, 40, 0.08)');
  wash.addColorStop(1, 'rgba(237, 231, 220, 0)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, 1024, 1024);

  // Radiating palmyra palm fronds
  ctx.save();
  ctx.translate(cx, cy);

  const frondCount = 28;
  for (let i = 0; i < frondCount; i++) {
    const angle = -Math.PI * 0.95 + (i * (Math.PI * 0.9)) / (frondCount - 1);
    ctx.save();
    ctx.rotate(angle);

    const length = 320 + Math.sin(i * 0.8) * 45;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(0, -length);
    ctx.lineTo(10, 0);
    ctx.closePath();

    const frondGrad = ctx.createLinearGradient(0, 0, 0, -length);
    frondGrad.addColorStop(0, '#594413');
    frondGrad.addColorStop(0.3, '#8e7123');
    frondGrad.addColorStop(0.7, '#c9a13b');
    frondGrad.addColorStop(1, '#617a3a');

    ctx.fillStyle = frondGrad;
    ctx.globalAlpha = 0.85;
    ctx.fill();

    // Frond center spine
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -length);
    ctx.strokeStyle = 'rgba(255, 235, 170, 0.6)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.restore();
  }

  // Intertwined indigo cord accent
  ctx.beginPath();
  ctx.arc(0, 0, 65, -Math.PI * 0.9, 0);
  ctx.strokeStyle = '#2b4763';
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.restore();

  // Caption
  ctx.font = '400 18px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = 'rgba(75, 60, 30, 0.8)';
  ctx.fillText('Borassus flabellifer — Palmyra Architectural Radial', 290, 890);
  ctx.font = 'italic 14px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = 'rgba(110, 90, 50, 0.7)';
  ctx.fillText('Scored and heat-pressed young leaflets with natural indigo stain', 300, 915);
}

function renderVilvamTheme(ctx: CanvasRenderingContext2D) {
  const cx = 512;
  const cy = 480;

  // Deep temple teal wash
  const wash = ctx.createRadialGradient(cx, cy, 30, cx, cy, 400);
  wash.addColorStop(0, 'rgba(50, 115, 95, 0.22)');
  wash.addColorStop(0.6, 'rgba(40, 80, 70, 0.08)');
  wash.addColorStop(1, 'rgba(237, 231, 220, 0)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, 1024, 1024);

  // Draw 3 clusters of trifoliate Vilvam leaves arranged in a circular sacred wreath
  ctx.save();
  ctx.translate(cx, cy);

  for (let c = 0; c < 3; c++) {
    const clusterAngle = (c * Math.PI * 2) / 3;
    ctx.save();
    ctx.rotate(clusterAngle);
    ctx.translate(0, -140);

    // Center terminal leaflet
    drawSingleLeaf(ctx, 0, -60, 55, 140, '#2f5b49', '#467b64');
    // Left leaflet
    ctx.save();
    ctx.rotate(-0.5);
    drawSingleLeaf(ctx, -25, 0, 48, 115, '#285040', '#3b6e58');
    ctx.restore();
    // Right leaflet
    ctx.save();
    ctx.rotate(0.5);
    drawSingleLeaf(ctx, 25, 0, 48, 115, '#285040', '#3b6e58');
    ctx.restore();

    ctx.restore();
  }

  // Delicate white star jasmine florets interspersed
  for (let j = 0; j < 9; j++) {
    const jAngle = (j * Math.PI * 2) / 9 + 0.3;
    const jx = Math.cos(jAngle) * 160;
    const jy = Math.sin(jAngle) * 160;

    ctx.save();
    ctx.translate(jx, jy);
    ctx.rotate(jAngle);

    // 5 white petals
    for (let p = 0; p < 5; p++) {
      ctx.rotate((Math.PI * 2) / 5);
      ctx.beginPath();
      ctx.ellipse(0, -18, 6, 16, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 252, 240, 0.9)';
      ctx.fill();
    }
    // Jasmine yellow pip
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#e5b839';
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();

  // Caption
  ctx.font = '400 18px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = 'rgba(40, 60, 50, 0.8)';
  ctx.fillText('Aegle marmelos & Jasminum — The Sacred Triad', 300, 890);
  ctx.font = 'italic 14px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = 'rgba(60, 90, 80, 0.7)';
  ctx.fillText('Twilight-gathered Bael foliage pressed with night-blooming Madurai jasmine', 260, 915);
}

function renderGulmoharTheme(ctx: CanvasRenderingContext2D) {
  const cx = 512;
  const cy = 490;

  // Warm terracotta scarlet wash
  const wash = ctx.createRadialGradient(cx, cy, 30, cx, cy, 420);
  wash.addColorStop(0, 'rgba(215, 80, 45, 0.22)');
  wash.addColorStop(0.6, 'rgba(190, 110, 50, 0.08)');
  wash.addColorStop(1, 'rgba(237, 231, 220, 0)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, 1024, 1024);

  // Dynamic sweeping cascade of scarlet gulmohar petals & tamarind feathery leaves
  ctx.save();
  ctx.translate(cx, cy);

  // Draw 8 large pressed petals
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8 + 0.2;
    const dist = 120 + (i % 2) * 50;
    const px = Math.cos(angle) * dist;
    const py = Math.sin(angle) * dist;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle + Math.PI / 2);

    ctx.beginPath();
    ctx.moveTo(0, 40);
    ctx.bezierCurveTo(45, 10, 60, -60, 0, -80);
    ctx.bezierCurveTo(-60, -60, -45, 10, 0, 40);
    ctx.closePath();

    const petalGrad = ctx.createRadialGradient(0, -30, 5, 0, -30, 75);
    petalGrad.addColorStop(0, '#f9db56'); // yellow center flare
    petalGrad.addColorStop(0.35, '#d94126');
    petalGrad.addColorStop(0.9, '#a32014');
    petalGrad.addColorStop(1, '#66120c');

    ctx.fillStyle = petalGrad;
    ctx.globalAlpha = 0.88;
    ctx.fill();

    ctx.restore();
  }

  // Draw ferny micro-compound leaves curving across
  for (let c = -1; c <= 1; c += 2) {
    ctx.save();
    ctx.scale(c, 1);
    ctx.beginPath();
    ctx.moveTo(0, 220);
    ctx.quadraticCurveTo(150, 0, 240, -180);
    ctx.strokeStyle = '#4a592e';
    ctx.lineWidth = 3;
    ctx.stroke();

    for (let f = 0; f < 18; f++) {
      const t = f / 18;
      const lx = 150 * t * 1.5;
      const ly = 220 - t * 400;
      ctx.beginPath();
      ctx.ellipse(lx + 14, ly, 10, 4, 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#657e3c';
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore();

  // Caption
  ctx.font = '400 18px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = 'rgba(80, 40, 30, 0.8)';
  ctx.fillText('Delonix regia — Cantonment Monsoon Flame', 300, 890);
  ctx.font = 'italic 14px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = 'rgba(120, 70, 50, 0.7)';
  ctx.fillText('Summer post-thunderstorm canopy petals paired with tamarind foliage', 270, 915);
}

function drawSingleLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  length: number,
  colorDark: string,
  colorLight: string
) {
  ctx.save();
  ctx.translate(x, y);

  ctx.beginPath();
  ctx.moveTo(0, length / 2);
  ctx.bezierCurveTo(width / 2, length * 0.2, width / 2, -length * 0.3, 0, -length / 2);
  ctx.bezierCurveTo(-width / 2, -length * 0.3, -width / 2, length * 0.2, 0, length / 2);
  ctx.closePath();

  const leafGrad = ctx.createLinearGradient(0, -length / 2, 0, length / 2);
  leafGrad.addColorStop(0, colorLight);
  leafGrad.addColorStop(1, colorDark);

  ctx.fillStyle = leafGrad;
  ctx.globalAlpha = 0.9;
  ctx.fill();

  // Midrib
  ctx.beginPath();
  ctx.moveTo(0, length / 2);
  ctx.lineTo(0, -length / 2);
  ctx.strokeStyle = 'rgba(230, 240, 200, 0.5)';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.restore();
}

/**
 * Creates subtle plaster wall texture for minimal museum gallery
 */
export function createPlasterTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm sunlit beige lime-plaster
  ctx.fillStyle = '#ece4d6';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle lime-wash mottling
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 20 + Math.random() * 80;
    const g = ctx.createRadialGradient(x, y, 1, x, y, r);
    const alpha = 0.03 + Math.random() * 0.04;
    g.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fine warm plaster grain
  ctx.fillStyle = 'rgba(110, 85, 60, 0.04)';
  for (let j = 0; j < 3000; j++) {
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

/**
 * Creates soft museum polished stone / concrete floor texture
 */
export function createFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm sandstone / beige terracotta tile
  ctx.fillStyle = '#dfd1bf';
  ctx.fillRect(0, 0, 512, 512);

  // Large gallery stone slab grid lines
  ctx.strokeStyle = 'rgba(155, 130, 105, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 256, 256);
  ctx.strokeRect(256, 0, 256, 256);
  ctx.strokeRect(0, 256, 256, 256);
  ctx.strokeRect(256, 256, 256, 256);

  // Gentle sunny daytime sheen
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 40 + Math.random() * 100;
    const g = ctx.createRadialGradient(x, y, 5, x, y, r);
    g.addColorStop(0, 'rgba(255, 250, 235, 0.04)');
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

/**
 * Creates glowing bias light halo mask for museum rim lighting behind frames
 */
export function createBiasLightGlowTexture(colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const g = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
  g.addColorStop(0, colorHex);
  g.addColorStop(0.4, colorHex);
  g.addColorStop(0.8, `${colorHex}44`);
  g.addColorStop(1, `${colorHex}00`);

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);

  return new THREE.CanvasTexture(canvas);
}

/**
 * Creates organic botanical particle texture for disintegration effect (leaves/petals)
 */
export function createLeafParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  // Leaf flake shape
  ctx.beginPath();
  ctx.moveTo(32, 6);
  ctx.bezierCurveTo(56, 18, 54, 48, 32, 58);
  ctx.bezierCurveTo(10, 48, 8, 18, 32, 6);
  ctx.closePath();

  const g = ctx.createLinearGradient(32, 6, 32, 58);
  g.addColorStop(0, '#98aa74');
  g.addColorStop(0.6, '#6b824b');
  g.addColorStop(1, '#44572c');
  ctx.fillStyle = g;
  ctx.fill();

  // Leaf vein
  ctx.beginPath();
  ctx.moveTo(32, 6);
  ctx.lineTo(32, 56);
  ctx.strokeStyle = 'rgba(240, 235, 180, 0.6)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  return new THREE.CanvasTexture(canvas);
}

/**
 * Creates an authentic high-resolution vellum and brass museum wall plaque texture
 */
export function createMuseumPlaqueTexture(art: {
  title: string;
  tamilTitle?: string;
  medium: string;
  year: number | string;
  dimensions: string;
  price?: string;
}): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Elegant warm ivory vellum background with subtle brushed metallic rim
    const grad = ctx.createLinearGradient(0, 0, 512, 256);
    grad.addColorStop(0, '#fdfbf7');
    grad.addColorStop(0.5, '#f6efe4');
    grad.addColorStop(1, '#ebe0cf');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Antiqued brass frame border
    ctx.strokeStyle = '#8f6f47';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 244);

    ctx.strokeStyle = '#c9a877';
    ctx.lineWidth = 2;
    ctx.strokeRect(14, 14, 484, 228);

    // Title
    ctx.fillStyle = '#26190f';
    ctx.font = 'bold 24px Georgia, "Cormorant Garamond", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(art.title, 256, 26);

    let currentY = 58;
    if (art.tamilTitle) {
      ctx.fillStyle = '#6e5138';
      ctx.font = '16px serif';
      ctx.fillText(art.tamilTitle, 256, currentY);
      currentY += 26;
    }

    // Medium & Year
    ctx.fillStyle = '#523c2a';
    ctx.font = 'italic 14px Georgia, serif';
    const shortMedium = art.medium.length > 44 ? art.medium.substring(0, 42) + '…' : art.medium;
    ctx.fillText(`${shortMedium} • ${art.year}`, 256, currentY);
    currentY += 26;

    // Price & Dimensions
    ctx.fillStyle = '#85582f';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`${art.dimensions}  |  ${art.price || '₹18,500'}`, 256, currentY);
    currentY += 28;

    // Museum Provenance Seal
    ctx.fillStyle = '#9e8164';
    ctx.font = '10px monospace';
    ctx.fillText('HERBARIUM ARCHIVE • TIRUCHIRAPPALLI', 256, currentY + 4);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  return tex;
}

