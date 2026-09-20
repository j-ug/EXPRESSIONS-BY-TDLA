import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { BotanicalArtwork } from '../types';
import { BOTANICAL_ARTWORKS } from '../data/artworks';
import {
  createArtworkTexture,
  createPlasterTexture,
  createFloorTexture,
  createBiasLightGlowTexture,
  createLeafParticleTexture,
  createMuseumPlaqueTexture,
} from '../utils/textureGenerator';

// Procedural 3D Character "Trevor from GTA"
function createTrevorCharacter() {
  const group = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({
    color: '#d4a27e', // Weathered tan skin
    roughness: 0.65,
    metalness: 0.05,
  });

  const shirtMat = new THREE.MeshStandardMaterial({
    color: '#dad6c9', // Dirty white/grey tank top
    roughness: 0.85,
    metalness: 0.0,
  });

  const jeansMat = new THREE.MeshStandardMaterial({
    color: '#28384d', // Blue denim jeans
    roughness: 0.8,
    metalness: 0.05,
  });

  const bootMat = new THREE.MeshStandardMaterial({
    color: '#2b1f18', // Dark brown leather boots
    roughness: 0.7,
    metalness: 0.1,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: '#382b20', // Receding hair
    roughness: 0.9,
  });

  const stubbleMat = new THREE.MeshStandardMaterial({
    color: '#6e5a4a', // 5 o'clock shadow
    roughness: 0.9,
  });

  const tattooMat = new THREE.MeshStandardMaterial({
    color: '#8f7768', // Arm tattoo tint
    roughness: 0.7,
  });

  const eyeMat = new THREE.MeshBasicMaterial({ color: '#1a1816' });

  // 1. Torso & Chest
  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = 0.95;
  group.add(torsoGroup);

  // Tank top body box
  const chestGeo = new THREE.BoxGeometry(0.46, 0.58, 0.26);
  const chestMesh = new THREE.Mesh(chestGeo, shirtMat);
  chestMesh.position.y = 0.29;
  chestMesh.castShadow = true;
  torsoGroup.add(chestMesh);

  // Neck
  const neckGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.12, 12);
  const neckMesh = new THREE.Mesh(neckGeo, skinMat);
  neckMesh.position.y = 0.62;
  torsoGroup.add(neckMesh);

  // 2. Head & Facial Features
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.72, 0);
  torsoGroup.add(headGroup);

  // Head base
  const headGeo = new THREE.BoxGeometry(0.24, 0.28, 0.25);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.position.y = 0.14;
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Receding hairline & side hair
  const sideHairLeft = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.14, 0.22), hairMat);
  sideHairLeft.position.set(-0.12, 0.18, -0.01);
  headGroup.add(sideHairLeft);

  const sideHairRight = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.14, 0.22), hairMat);
  sideHairRight.position.set(0.12, 0.18, -0.01);
  headGroup.add(sideHairRight);

  const backHair = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.04), hairMat);
  backHair.position.set(0, 0.17, -0.12);
  headGroup.add(backHair);

  // Stubble / jaw
  const jawStubble = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.22), stubbleMat);
  jawStubble.position.set(0, 0.06, 0.01);
  headGroup.add(jawStubble);

  // Nose
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.06), skinMat);
  nose.position.set(0, 0.14, 0.13);
  headGroup.add(nose);

  // Brow ridge (Trevor's intense scowl)
  const brow = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.05), skinMat);
  brow.position.set(0, 0.21, 0.12);
  brow.rotation.x = 0.15;
  headGroup.add(brow);

  // Eyes
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.02), eyeMat);
  eyeL.position.set(-0.06, 0.17, 0.125);
  headGroup.add(eyeL);

  const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.02), eyeMat);
  eyeR.position.set(0.06, 0.17, 0.125);
  headGroup.add(eyeR);

  // 3. Arms (Sleeveless / Tank top exposes muscular tattooed arms)
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.27, 0.52, 0);
  torsoGroup.add(leftArmGroup);

  const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.48, 0.12), tattooMat);
  leftArmMesh.position.y = -0.22;
  leftArmMesh.castShadow = true;
  leftArmGroup.add(leftArmMesh);

  const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), skinMat);
  leftHand.position.y = -0.48;
  leftArmGroup.add(leftHand);

  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.27, 0.52, 0);
  torsoGroup.add(rightArmGroup);

  const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.48, 0.12), tattooMat);
  rightArmMesh.position.y = -0.22;
  rightArmMesh.castShadow = true;
  rightArmGroup.add(rightArmMesh);

  const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), skinMat);
  rightHand.position.y = -0.48;
  rightArmGroup.add(rightHand);

  // 4. Legs & Boots
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(-0.13, 0.92, 0);
  group.add(leftLegGroup);

  const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.75, 0.16), jeansMat);
  leftLegMesh.position.y = -0.37;
  leftLegMesh.castShadow = true;
  leftLegGroup.add(leftLegMesh);

  const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.24), bootMat);
  leftBoot.position.set(0, -0.78, 0.03);
  leftBoot.castShadow = true;
  leftLegGroup.add(leftBoot);

  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(0.13, 0.92, 0);
  group.add(rightLegGroup);

  const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.75, 0.16), jeansMat);
  rightLegMesh.position.y = -0.37;
  rightLegMesh.castShadow = true;
  rightLegGroup.add(rightLegMesh);

  const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.24), bootMat);
  rightBoot.position.set(0, -0.78, 0.03);
  rightBoot.castShadow = true;
  rightLegGroup.add(rightBoot);

  // State for walking physics
  let walkPhase = 0;
  let targetRotY = Math.PI / 2 - 0.2;

  const update = (delta: number, currentX: number, targetX: number, isZooming: boolean) => {
    const dx = targetX - currentX;
    const moveDist = Math.abs(dx);

    if (moveDist > 0.005 && !isZooming) {
      // Trevor is walking!
      walkPhase += delta * Math.min(18, Math.max(6, moveDist * 12));

      // Facing direction
      if (dx > 0.02) {
        targetRotY = Math.PI / 2 - 0.25; // Walking right
      } else if (dx < -0.02) {
        targetRotY = -Math.PI / 2 + 0.25; // Walking left
      }

      // Leg swing
      const legSwing = Math.sin(walkPhase) * 0.55;
      leftLegGroup.rotation.x = legSwing;
      rightLegGroup.rotation.x = -legSwing;

      // Arm swing (opposite of legs)
      leftArmGroup.rotation.x = -legSwing * 0.85;
      rightArmGroup.rotation.x = legSwing * 0.85;

      // Vertical stride bounce
      torsoGroup.position.y = 0.95 + Math.abs(Math.sin(walkPhase * 2)) * 0.04;
      headGroup.rotation.y = Math.sin(walkPhase) * 0.06;
      torsoGroup.rotation.y = Math.sin(walkPhase) * 0.05;
    } else {
      // Idle pose
      leftLegGroup.rotation.x *= 0.85;
      rightLegGroup.rotation.x *= 0.85;
      leftArmGroup.rotation.x *= 0.85;
      rightArmGroup.rotation.x *= 0.85;

      torsoGroup.position.y = 0.95 + Math.sin(Date.now() * 0.003) * 0.01;
      headGroup.rotation.y *= 0.85;
      torsoGroup.rotation.y *= 0.85;

      if (isZooming) {
        targetRotY = 0; // Turn facing the artwork wall
      } else {
        targetRotY = Math.PI / 2 - 0.2;
      }
    }

    // Smooth body rotation transition
    group.rotation.y += (targetRotY - group.rotation.y) * 0.1;
  };

  const dispose = () => {
    skinMat.dispose();
    shirtMat.dispose();
    jeansMat.dispose();
    bootMat.dispose();
    hairMat.dispose();
    stubbleMat.dispose();
    tattooMat.dispose();
    eyeMat.dispose();
  };

  return { group, update, dispose };
}

interface Gallery3DProps {
  scrollProgress: number; // 0 to 1
  activeArtworkIndex: number;
  onArtworkChange: (index: number) => void;
  onGalleryEnter: () => void;
  onGalleryExit: () => void;
  onArtworkClick?: (artwork: BotanicalArtwork) => void;
  artworks?: BotanicalArtwork[];
}

export const Gallery3D: React.FC<Gallery3DProps> = ({
  scrollProgress,
  activeArtworkIndex,
  onArtworkChange,
  onGalleryEnter,
  onGalleryExit,
  onArtworkClick,
  artworks = BOTANICAL_ARTWORKS,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [hoveredArtwork, setHoveredArtwork] = useState<BotanicalArtwork | null>(null);

  // Keep callbacks fresh in refs to avoid tearing down the WebGL scene
  const callbacksRef = useRef({
    onArtworkChange,
    onGalleryEnter,
    onGalleryExit,
    onArtworkClick,
  });

  useEffect(() => {
    callbacksRef.current = {
      onArtworkChange,
      onGalleryEnter,
      onGalleryExit,
      onArtworkClick,
    };
  }, [onArtworkChange, onGalleryEnter, onGalleryExit, onArtworkClick]);

  // References to keep across re-renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Gallery dynamic elements
  const wallsGroupRef = useRef<THREE.Group | null>(null);
  const leftWallRef = useRef<THREE.Mesh | null>(null);
  const rightWallRef = useRef<THREE.Mesh | null>(null);
  const backWallRef = useRef<THREE.Mesh | null>(null);
  const frontWallRef = useRef<THREE.Mesh | null>(null);
  const skylightLightRef = useRef<THREE.DirectionalLight | null>(null);
  const plaquesRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Artworks 3D objects & disintegration particle systems
  interface ArtworkObject {
    artwork: BotanicalArtwork;
    group: THREE.Group;
    canvasMesh: THREE.Mesh;
    canvasMaterial: THREE.MeshLambertMaterial; // Updated to Lambert
    texture: THREE.Texture; // Store texture reference
    haloMesh: THREE.Mesh;
    biasPointLight: THREE.PointLight;
    spotLight: THREE.SpotLight; // Added spotLight
    particleSystem: THREE.Points;
    particlePositions: Float32Array;
    particleVelocities: Float32Array;
    particleOriginals: Float32Array;
    xStation: number;
  }
  const artworkObjectsRef = useRef<ArtworkObject[]>([]);

  // Mouse parallax interpolation
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const mouseCurrentRef = useRef({ x: 0, y: 0 });
  const scrollSmoothRef = useRef(scrollProgress);

  // Zoom / Fly-over transition state when clicking an artwork
  const zoomingArtRef = useRef<BotanicalArtwork | null>(null);
  const zoomProgressRef = useRef<number>(0);
  const modalOpenedRef = useRef<boolean>(false);

  // Check WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
      }
    } catch {
      setWebglSupported(false);
    }
  }, []);

  // Update target scroll progress
  useEffect(() => {
    scrollSmoothRef.current = scrollProgress;
  }, [scrollProgress]);

  // Main Three.js Scene Setup (mounts once and stays alive)
  useEffect(() => {
    if (!containerRef.current || !webglSupported) return;

    const container = containerRef.current;
    const width = Math.max(10, container.clientWidth || window.innerWidth);
    const height = Math.max(10, container.clientHeight || window.innerHeight);

    let isDisposed = false;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    // Bright sunlit beige-brown daytime atmosphere
    scene.background = new THREE.Color('#f5eee4');
    scene.fog = new THREE.FogExp2('#f5eee4', 0.015);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 120);
    camera.position.set(0, 2.4, 26);
    cameraRef.current = camera;

    // 2. WebGL Renderer with graceful settings
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch (e) {
      console.warn('WebGL initialization fallback', e);
      setWebglSupported(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Instantiate Trevor from GTA 3D Character
    const trevor = createTrevorCharacter();
    scene.add(trevor.group);

    // Ensure canvas element is block-level to avoid ResizeObserver feedback loops
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lighting: Warm bright Tamil Nadu daytime sunlight through museum skylight
    const ambientLight = new THREE.AmbientLight('#fffbf3', 1.35);
    scene.add(ambientLight);

    const skylightLight = new THREE.DirectionalLight('#fff2d4', 2.2);
    skylightLight.position.set(4, 18, 6);
    skylightLight.castShadow = true;
    skylightLight.shadow.mapSize.width = 1024;
    skylightLight.shadow.mapSize.height = 1024;
    skylightLight.shadow.bias = -0.0005;
    scene.add(skylightLight);
    skylightLightRef.current = skylightLight;

    // Warm earthen sandstone bounce light from floor
    const bounceLight = new THREE.DirectionalLight('#e2cfb7', 0.7);
    bounceLight.position.set(0, -5, 0);
    scene.add(bounceLight);

    // 4. Materials in warm architectural beige and limestone
    const plasterTexture = createPlasterTexture();
    const floorTexture = createFloorTexture();

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: '#f3eae0',
      roughness: 0.88,
      metalness: 0.02,
    });

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: '#ded1bf',
      roughness: 0.58,
      metalness: 0.08,
    });

    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: '#faf4ec',
      roughness: 0.95,
      metalness: 0.01,
    });

    // 5. Architecture: The Gallery Hall & Four Dynamic Walls
    const wallsGroup = new THREE.Group();
    scene.add(wallsGroup);
    wallsGroupRef.current = wallsGroup;

    const wallHeight = 8.5;
    const galleryLength = Math.max(68, artworks.length * 12 + 15); // Length along which artworks are placed
    const initialWidth = 14;

    // Floor
    const floorGeo = new THREE.PlaneGeometry(galleryLength + 30, 40);
    const floorMesh = new THREE.Mesh(floorGeo, floorMaterial);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(16, 0, 0);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Ceiling with architectural skylight louvers
    const ceilingGeo = new THREE.PlaneGeometry(galleryLength + 30, 40);
    const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMaterial);
    ceilingMesh.rotation.x = Math.PI / 2;
    ceilingMesh.position.set(16, wallHeight, 0);
    scene.add(ceilingMesh);

    // Skylight glass aperture
    const skylightGeo = new THREE.PlaneGeometry(galleryLength, 3);
    const skylightMat = new THREE.MeshBasicMaterial({
      color: '#fffae8',
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const skylightMesh = new THREE.Mesh(skylightGeo, skylightMat);
    skylightMesh.rotation.x = Math.PI / 2;
    skylightMesh.position.set(16, wallHeight - 0.05, 0);
    scene.add(skylightMesh);

    // Dynamic Back Wall (where artworks hang)
    const backWallGeo = new THREE.PlaneGeometry(galleryLength + 30, wallHeight);
    const backWall = new THREE.Mesh(backWallGeo, wallMaterial);
    backWall.position.set(16, wallHeight / 2, -initialWidth / 2);
    backWall.receiveShadow = true;
    wallsGroup.add(backWall);
    backWallRef.current = backWall;

    // Dynamic Front Wall (opposite the artworks)
    const frontWallGeo = new THREE.PlaneGeometry(galleryLength + 30, wallHeight);
    const frontWall = new THREE.Mesh(frontWallGeo, wallMaterial);
    frontWall.rotation.y = Math.PI;
    frontWall.position.set(16, wallHeight / 2, initialWidth / 2);
    frontWall.receiveShadow = true;
    wallsGroup.add(frontWall);
    frontWallRef.current = frontWall;

    // Dynamic Left Wall (with entrance doorway)
    const leftWallGeo = new THREE.PlaneGeometry(initialWidth, wallHeight);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-8, wallHeight / 2, 0);
    leftWall.receiveShadow = true;
    wallsGroup.add(leftWall);
    leftWallRef.current = leftWall;

    // Dynamic Right Wall (with exit archway leading to sunny Tamil pavilion)
    const rightWallGeo = new THREE.PlaneGeometry(initialWidth, wallHeight);
    const rightWall = new THREE.Mesh(rightWallGeo, wallMaterial);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(galleryLength + 8, wallHeight / 2, 0);
    rightWall.receiveShadow = true;
    wallsGroup.add(rightWall);
    rightWallRef.current = rightWall;

    // Entrance portal frame outside (warm architectural teak wood)
    const portalMat = new THREE.MeshStandardMaterial({ color: '#5c422c', roughness: 0.65 });
    const portalLeft = new THREE.Mesh(new THREE.BoxGeometry(0.5, wallHeight, 0.5), portalMat);
    portalLeft.position.set(-2, wallHeight / 2, 12);
    scene.add(portalLeft);
    const portalRight = new THREE.Mesh(new THREE.BoxGeometry(0.5, wallHeight, 0.5), portalMat);
    portalRight.position.set(2, wallHeight / 2, 12);
    scene.add(portalRight);
    const portalLintel = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.6, 0.6), portalMat);
    portalLintel.position.set(0, wallHeight - 0.3, 12);
    scene.add(portalLintel);

    // 6. Build Artwork Stations & Disintegration Particle Systems
    const leafParticleTex = createLeafParticleTexture();
    const artworkObjects: ArtworkObject[] = [];

    // Artwork station X coordinates along the gallery wall
    const stationPositions = artworks.map((_, i) => -1 + i * 10);

    artworks.forEach((art, index) => {
      const xPos = stationPositions[index];
      const artGroup = new THREE.Group();
      artGroup.position.set(xPos, 3.2, -initialWidth / 2 + 0.15);
      scene.add(artGroup);

      // Artwork Canvas Texture with 16x anisotropic filtering for razor-sharp botanical veins
      const artTexture = createArtworkTexture(art.textureTheme, art.customImageData);
      if (renderer) {
        artTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 16);
      }
      artTexture.generateMipmaps = true;
      artTexture.minFilter = THREE.LinearMipmapLinearFilter;
      artTexture.magFilter = THREE.LinearFilter;
      artTexture.needsUpdate = true;

      // Frame Dimensions based on artwork frameShape (minimized so entire frame is properly visible)
      let frameW = 2.0;
      let frameH = 2.7;
      let frameGeometry: THREE.BufferGeometry;

      if (art.frameShape === 'square') {
        frameW = 2.1;
        frameH = 2.1;
        frameGeometry = new THREE.BoxGeometry(frameW, frameH, 0.08);
      } else if (art.frameShape === 'leaf' || art.frameShape === 'arched') {
        frameW = 1.95;
        frameH = 2.7;
        frameGeometry = new THREE.BoxGeometry(frameW, frameH, 0.08);
      } else if (art.frameShape === 'circular') {
        frameW = 2.2;
        frameH = 2.2;
        frameGeometry = new THREE.CylinderGeometry(frameW / 2, frameW / 2, 0.08, 48);
        frameGeometry.rotateX(Math.PI / 2);
      } else {
        frameW = 2.0;
        frameH = 2.7;
        frameGeometry = new THREE.BoxGeometry(frameW, frameH, 0.08);
      }

      // Canvas Face Mesh with pristine botanical clarity & subtle self-illumination
      const canvasMat = new THREE.MeshLambertMaterial({
        map: artTexture,
        emissive: new THREE.Color('#ffffff'),
        emissiveIntensity: 0.15,
      });

      const canvasMesh = new THREE.Mesh(frameGeometry, canvasMat);
      canvasMesh.castShadow = true;
      canvasMesh.receiveShadow = true;
      canvasMesh.userData = { artworkIndex: index, artwork: art };
      artGroup.add(canvasMesh);

      // Dedicated warm front illumination fill light so botanical details pop clearly in motion
      const frontFillLight = new THREE.PointLight('#fffbf0', 1.25, 7.5, 1.2);
      frontFillLight.position.set(0, 0, 2.2);
      artGroup.add(frontFillLight);

      // 1. Handcrafted Futuristic Y2K Plastic Outer Frame
      const frameMat = new THREE.MeshPhysicalMaterial({
        color: '#ff00ff', // Y2K neon pink
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.5,
        thickness: 0.5,
        side: THREE.DoubleSide
      });

      // 2. Neon Cyan Fillet Liner
      const filletMat = new THREE.MeshStandardMaterial({
        color: '#00ffff', // Y2K neon cyan
        emissive: '#00ffff',
        emissiveIntensity: 0.5,
        roughness: 0.2,
      });

      if (art.frameShape === 'circular') {
        // Outer Y2K frame torus molding
        const outerTorus = new THREE.TorusGeometry(frameW / 2 + 0.1, 0.08, 24, 96);
        const outerMesh = new THREE.Mesh(outerTorus, frameMat);
        outerMesh.position.z = 0.01;
        artGroup.add(outerMesh);

        // Inner neon fillet liner ring
        const innerTorus = new THREE.TorusGeometry(frameW / 2 + 0.02, 0.04, 24, 96);
        const innerMesh = new THREE.Mesh(innerTorus, filletMat);
        innerMesh.position.z = 0.03;
        artGroup.add(innerMesh);
      } else {
        // Outer Y2K frame box
        const outerFrame = new THREE.Mesh(
          new THREE.BoxGeometry(frameW + 0.28, frameH + 0.28, 0.1),
          frameMat
        );
        outerFrame.position.z = -0.02;
        artGroup.add(outerFrame);

        // Inner neon fillet liner
        const innerFillet = new THREE.Mesh(
          new THREE.BoxGeometry(frameW + 0.08, frameH + 0.08, 0.11),
          filletMat
        );
        innerFillet.position.z = 0.01;
        artGroup.add(innerFillet);
      }

      // Soft Wall Cast Shadow Behind Frame
      const shadowMat = new THREE.MeshBasicMaterial({
        color: '#000000',
        transparent: true,
        opacity: 0.4, // Slightly deeper shadow
      });
      const shadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(frameW + 0.6, frameH + 0.6),
        shadowMat
      );
      shadowPlane.position.set(0.05, -0.08, -0.08);
      artGroup.add(shadowPlane);

      // Dedicated Bias Lighting (Glow Halo mesh + PointLight behind canvas)
      // RECTANGULAR STRIP LIGHTING CONCEPT
      const glowGeo = new THREE.PlaneGeometry(frameW + 0.6, frameH + 0.6);
      const glowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(art.biasLightColor),
        transparent: true,
        opacity: 0.2, // Subtle glow
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const glowPlane = new THREE.Mesh(glowGeo, glowMat);
      glowPlane.position.set(0, 0, -0.1); // Slightly behind frame
      artGroup.add(glowPlane);

      // Bias light point light cast onto the wall behind
      const biasLight = new THREE.PointLight(
        new THREE.Color(art.biasLightColor),
        art.biasLightIntensity * 1.2,
        4.0, // Tighter radius
        2.0
      );
      biasLight.position.set(0, 0, 0.1);
      artGroup.add(biasLight);

      // Small Museum Spotlight directed at artwork position (independent target)
      const spotTarget = new THREE.Object3D();
      spotTarget.position.set(xPos, 3.2, -initialWidth / 2 + 0.15);
      scene.add(spotTarget);

      const spotLight = new THREE.SpotLight('#fff4e0', 1.8, 12, Math.PI / 6, 0.45, 1.2);
      spotLight.position.set(xPos, wallHeight - 0.4, -initialWidth / 2 + 3.2);
      spotLight.target = spotTarget;
      // Do not cast shadows on per-artwork spotlights to keep texture units well under WebGL limit (16)
      spotLight.castShadow = false;
      scene.add(spotLight);

      // Disintegration Particle System (leaves and floral petals)
      const particleCount = 650;
      const particleGeo = new THREE.BufferGeometry();
      const pPositions = new Float32Array(particleCount * 3);
      const pOriginals = new Float32Array(particleCount * 3);
      const pVelocities = new Float32Array(particleCount * 3);

      for (let p = 0; p < particleCount; p++) {
        // Distribute across the surface of the canvas
        const px = (Math.random() - 0.5) * (frameW * 0.95);
        const py = (Math.random() - 0.5) * (frameH * 0.95);
        const pz = 0.04 + (Math.random() - 0.5) * 0.04;

        pPositions[p * 3] = px;
        pPositions[p * 3 + 1] = py;
        pPositions[p * 3 + 2] = pz;

        pOriginals[p * 3] = px;
        pOriginals[p * 3 + 1] = py;
        pOriginals[p * 3 + 2] = pz;

        // Dispersal velocity: gentle floating upward & rightward breeze
        pVelocities[p * 3] = 0.4 + Math.random() * 1.2;
        pVelocities[p * 3 + 1] = 0.2 + Math.random() * 0.8;
        pVelocities[p * 3 + 2] = 0.5 + Math.random() * 1.5;
      }

      particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

      const particleMat = new THREE.PointsMaterial({
        size: 0.14,
        map: leafParticleTex,
        transparent: true,
        opacity: 0.0,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });

      const particleSystem = new THREE.Points(particleGeo, particleMat);
      particleSystem.visible = false;
      artGroup.add(particleSystem);

      artworkObjects.push({
        artwork: art,
        group: artGroup,
        canvasMesh,
        canvasMaterial: canvasMat,
        texture: artTexture,
        haloMesh: glowPlane,
        biasPointLight: biasLight,
        spotLight: spotLight,
        particleSystem,
        particlePositions: pPositions,
        particleVelocities: pVelocities,
        particleOriginals: pOriginals,
        xStation: xPos,
      });
    });

    artworkObjectsRef.current = artworkObjects;

    // 7. Sunny Exit Pavilion at the end of the gallery corridor
    const exitSun = new THREE.PointLight('#ffd58c', 2.8, 25, 1.2);
    exitSun.position.set(galleryLength + 10, 5, 0);
    scene.add(exitSun);

    // Mouse Move Parallax & Raycast Listener (on container element, not window)
    const onPointerMove = (e: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseTargetRef.current = { x: normX, y: normY };

      // Raycast for hover state on artworks
      try {
        const mouseVector = new THREE.Vector2(normX, normY);
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouseVector, cameraRef.current);

        const meshesToTest = artworkObjectsRef.current.map((o) => o.canvasMesh);
        const intersects = raycaster.intersectObjects(meshesToTest);

        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const artIndex = hit.userData.artworkIndex;
          if (artIndex !== undefined && artworks[artIndex]) {
            setHoveredArtwork(artworks[artIndex]);
            if (containerRef.current) containerRef.current.style.cursor = 'pointer';
          }
        } else {
          setHoveredArtwork(null);
          if (containerRef.current) containerRef.current.style.cursor = 'default';
        }
      } catch {
        // Suppress any raycaster edge errors
      }
    };

    const onPointerClick = (e: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      try {
        const mouseVector = new THREE.Vector2(normX, normY);
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouseVector, cameraRef.current);

        const meshesToTest = artworkObjectsRef.current.map((o) => o.canvasMesh);
        const intersects = raycaster.intersectObjects(meshesToTest);
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const art = hit.userData.artwork as BotanicalArtwork;
          if (art) {
            zoomingArtRef.current = art;
            zoomProgressRef.current = 0;
            modalOpenedRef.current = false;
          }
        } else if (zoomingArtRef.current) {
          zoomingArtRef.current = null;
        }
      } catch {
        // Suppress
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0 && containerRef.current) {
        const touch = e.touches[0];
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const normX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
          const normY = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
          mouseTargetRef.current = { x: normX * 0.5, y: normY * 0.5 };
        }
      }
    };

    // Attach listeners directly to container
    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('click', onPointerClick);
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    // Resize Observer with debounce and without recursive style triggers
    let lastW = width;
    let lastH = height;
    const resizeObserver = new ResizeObserver((entries) => {
      if (isDisposed) return;
      for (const entry of entries) {
        const newW = Math.floor(entry.contentRect.width);
        const newH = Math.floor(entry.contentRect.height);
        if (newW > 0 && newH > 0 && (Math.abs(newW - lastW) > 2 || Math.abs(newH - lastH) > 2)) {
          lastW = newW;
          lastH = newH;
          if (cameraRef.current && rendererRef.current) {
            cameraRef.current.aspect = newW / newH;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(newW, newH, false);
          }
        }
      }
    });
    resizeObserver.observe(container);

    // Tab Visibility Handler
    let isTabVisible = true;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 8. Animation & Render Loop
    let clock = new THREE.Clock();
    let lastAnnouncedIndex = -1;
    let hasEntered = false;
    let hasExited = false;

    const animate = () => {
      if (isDisposed) return;
      animFrameId.current = requestAnimationFrame(animate);
      if (!isTabVisible) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth mouse parallax interpolation
      mouseCurrentRef.current.x += (mouseTargetRef.current.x - mouseCurrentRef.current.x) * 0.05;
      mouseCurrentRef.current.y += (mouseTargetRef.current.y - mouseCurrentRef.current.y) * 0.05;

      const p = Math.max(0, Math.min(1, scrollSmoothRef.current || 0)); // 0.0 to 1.0

      // 8a. Gallery Doorway Entry Logic
      if (p > 0.08 && !hasEntered) {
        hasEntered = true;
        callbacksRef.current.onGalleryEnter();
      }
      if (p >= 0.92 && !hasExited) {
        hasExited = true;
        callbacksRef.current.onGalleryExit();
      }
      if (p < 0.90 && hasExited) {
        hasExited = false;
      }

      // 8b. Wall Closing-In Animation
      const wallNarrowFactor = Math.min(1.0, Math.max(0.0, (p - 0.08) / 0.22));
      const currentWidth = THREE.MathUtils.lerp(initialWidth, 10.5, wallNarrowFactor);

      if (backWallRef.current && frontWallRef.current) {
        backWallRef.current.position.z = -currentWidth / 2;
        frontWallRef.current.position.z = currentWidth / 2;
      }
      if (leftWallRef.current && rightWallRef.current) {
        leftWallRef.current.scale.set(currentWidth / initialWidth, 1, 1);
        rightWallRef.current.scale.set(currentWidth / initialWidth, 1, 1);
      }

      // 8c. Camera POV, Trevor Position & Path:
      let targetWalkX = 0;
      let targetCamX = 0;
      let targetCamY = 2.45;
      let targetCamZ = 24;
      let targetLookX = 0;
      let targetLookY = 2.1;
      let targetLookZ = -currentWidth / 2;

      const numArtworks = artworkObjects.length;

      if (p <= 0.14) {
        // Approaching & entering through doorway
        const t = p / 0.14;
        targetWalkX = THREE.MathUtils.lerp(0, -1, t);
        targetCamX = THREE.MathUtils.lerp(0, -1.2, t);
        targetCamY = THREE.MathUtils.lerp(2.4, 2.45, t);
        targetCamZ = THREE.MathUtils.lerp(24, -currentWidth / 2 + 3.8, t);
        targetLookX = targetWalkX + 0.3;
        targetLookY = 2.1;
        targetLookZ = -currentWidth / 2 + 0.1;
      } else if (p < 0.88 && numArtworks > 0) {
        // Scrolling along gallery wall
        const galleryT = Math.max(0, Math.min(1, (p - 0.14) / (0.88 - 0.14)));
        const rawArtworkPos = galleryT * (numArtworks - 1);
        const currIndex = Math.max(0, Math.min(Math.floor(rawArtworkPos), numArtworks - 1));
        const nextIndex = Math.max(0, Math.min(currIndex + 1, numArtworks - 1));
        const fraction = rawArtworkPos - Math.floor(rawArtworkPos);

        const currentArt = artworkObjects[currIndex];
        const nextArt = artworkObjects[nextIndex];

        if (currentArt && nextArt) {
          let smoothFraction = fraction;
          if (fraction < 0.22) {
            const t = fraction / 0.22;
            smoothFraction = 0.04 * (t * t);
          } else if (fraction > 0.78) {
            const t = (fraction - 0.78) / 0.22;
            smoothFraction = 0.96 + 0.04 * (1 - (1 - t) * (1 - t));
          } else {
            const t = (fraction - 0.22) / 0.56;
            smoothFraction = 0.04 + 0.92 * (t * t * (3 - 2 * t));
          }

          targetWalkX = THREE.MathUtils.lerp(currentArt.xStation, nextArt.xStation, smoothFraction);
          targetCamX = targetWalkX - 0.2;
          targetCamY = 2.45;
          targetCamZ = -currentWidth / 2 + 3.85;

          targetLookX = targetWalkX + 0.4;
          targetLookY = 2.2;
          targetLookZ = -currentWidth / 2 + 0.15;
        }

        const activeIdx = numArtworks > 0 ? Math.max(0, Math.min(Math.round(rawArtworkPos), numArtworks - 1)) : 0;
        if (activeIdx !== lastAnnouncedIndex) {
          lastAnnouncedIndex = activeIdx;
          callbacksRef.current.onArtworkChange(activeIdx);
        }
      } else {
        // Exiting to sunlit veranda
        const exitT = Math.max(0, Math.min(1, (p - 0.88) / 0.12));
        const lastStationX = artworkObjects.length > 0 ? artworkObjects[artworkObjects.length - 1].xStation : 39;
        targetWalkX = THREE.MathUtils.lerp(lastStationX, lastStationX + 9, exitT);
        targetCamX = targetWalkX - 0.2;
        targetCamY = 2.45;
        targetCamZ = THREE.MathUtils.lerp(-currentWidth / 2 + 3.85, 6, exitT);

        targetLookX = targetWalkX + 2;
        targetLookY = 2.4;
        targetLookZ = -currentWidth / 2 + 1;
      }

      // Update Trevor 3D Character Position & Stride Animation
      trevor.group.position.x += (targetWalkX - trevor.group.position.x) * 0.08;
      trevor.group.position.y = 0;
      trevor.group.position.z = -currentWidth / 2 + 1.8;

      const isCurrentlyZooming = zoomingArtRef.current !== null;
      trevor.update(delta, trevor.group.position.x, targetWalkX, isCurrentlyZooming);

      // Mouse Parallax
      const parallaxX = (mouseCurrentRef.current.x || 0) * 0.45;
      const parallaxY = (mouseCurrentRef.current.y || 0) * 0.25;

      // Handle POV camera behavior (Walking vs. Zooming Fly-Over over Trevor's head)
      if (zoomingArtRef.current) {
        zoomProgressRef.current = Math.min(1.0, zoomProgressRef.current + delta * 1.8);
        const t = zoomProgressRef.current;
        const smoothT = t * t * (3 - 2 * t);

        // Arc UP over Trevor's head!
        const arcY = Math.sin(smoothT * Math.PI) * 1.7;

        const activeObj = artworkObjects.find((o) => o.artwork.id === zoomingArtRef.current?.id);
        const artX = activeObj ? activeObj.xStation : targetCamX;

        const flyCamX = THREE.MathUtils.lerp(targetCamX, artX, smoothT);
        const flyCamY = THREE.MathUtils.lerp(targetCamY, 3.08, smoothT) + arcY;
        const flyCamZ = THREE.MathUtils.lerp(targetCamZ, -currentWidth / 2 + 1.35, smoothT);

        const flyLookX = THREE.MathUtils.lerp(targetLookX, artX, smoothT);
        const flyLookY = THREE.MathUtils.lerp(targetLookY, 3.08, smoothT);
        const flyLookZ = THREE.MathUtils.lerp(targetLookZ, -currentWidth / 2 + 0.15, smoothT);

        camera.position.set(flyCamX, flyCamY, flyCamZ);
        camera.lookAt(flyLookX, flyLookY, flyLookZ);

        if (t >= 1.0 && !modalOpenedRef.current) {
          modalOpenedRef.current = true;
          if (callbacksRef.current.onArtworkClick && zoomingArtRef.current) {
            callbacksRef.current.onArtworkClick(zoomingArtRef.current);
          }
        }
      } else {
        // Normal 3rd person POV behind Trevor
        zoomProgressRef.current = Math.max(0.0, zoomProgressRef.current - delta * 2.5);
        modalOpenedRef.current = false;

        camera.position.x += (targetCamX + parallaxX - camera.position.x) * 0.05;
        camera.position.y += (targetCamY + parallaxY - camera.position.y) * 0.05;
        camera.position.z += (targetCamZ - camera.position.z) * 0.05;

        camera.lookAt(targetLookX + parallaxX * 0.4, targetLookY + parallaxY * 0.4, targetLookZ);
      }

      // 8d. Update Artworks: Permanent 100% Solid Canvases with Ambient Botanical Petals
      artworkObjects.forEach((item, idx) => {
        // Update plaque DOM element directly
        const plaque = plaquesRef.current[item.artwork.id];
        if (plaque) {
          const vector = new THREE.Vector3(item.group.position.x, item.group.position.y - 1.8, item.group.position.z);
          vector.project(camera);
          
          if (vector.z < 1) {
            const x = (vector.x + 1) / 2 * (containerRef.current?.clientWidth || 0);
            const y = -(vector.y - 1) / 2 * (containerRef.current?.clientHeight || 0);
            plaque.style.left = `${x}px`;
            plaque.style.top = `${y}px`;
            plaque.style.display = 'flex';
          } else {
            plaque.style.display = 'none';
          }
        }

        // Position on wall adjusts if wall moves
        item.group.position.z = -currentWidth / 2 + 0.14;

        // Ensure canvas material map stays assigned
        if (!item.canvasMaterial.map) {
          item.canvasMaterial.map = item.texture;
          item.canvasMaterial.needsUpdate = true;
        }

        // Keep all canvases completely solid, fully opaque, and crisp at all times!
        item.canvasMaterial.opacity = 1.0;
        item.canvasMaterial.transparent = false;

        // Ambient botanical petals & pollen drifting gently around active artwork
        const isCurrentlyActive = idx === activeArtworkIndex;
        if (isCurrentlyActive) {
          item.particleSystem.visible = true;
          const pMat = item.particleSystem.material as THREE.PointsMaterial;
          pMat.opacity = 0.65;

          const positions = item.particlePositions;
          const originals = item.particleOriginals;
          const count = positions.length / 3;

          for (let i = 0; i < count; i++) {
            const ix = i * 3;
            const iy = ix + 1;
            const iz = ix + 2;

            positions[ix] = originals[ix] + Math.sin(time * 1.5 + i * 0.3) * 0.25;
            positions[iy] = originals[iy] + Math.cos(time * 1.2 + i * 0.2) * 0.2;
            positions[iz] = originals[iz] + 0.35 + Math.sin(time * 0.8 + i) * 0.15;
          }
          item.particleSystem.geometry.attributes.position.needsUpdate = true;
        } else {
          item.particleSystem.visible = false;
        }

        // Subtle bias light breathing pulse
        const pulse = 1.0 + Math.sin(time * 2.0 + idx) * 0.08;
        const hoverBoost = hoveredArtwork?.id === item.artwork.id ? 1.4 : 1.0;
        item.biasPointLight.intensity = item.artwork.biasLightIntensity * pulse * hoverBoost * (isCurrentlyActive ? 1.2 : 0.85);

        // Dynamic Spotlight: Adjust intensity & temperature (color) based on scroll
        // Warmer for early scroll (approaching), cooler for exit
        const spotlightIntensity = isCurrentlyActive ? 2.2 : 0.8;
        item.spotLight.intensity = THREE.MathUtils.lerp(item.spotLight.intensity, spotlightIntensity, 0.1);
        
        // Color transition: warm -> white -> cool
        const scrollArtT = Math.max(0, Math.min(1, (p - 0.14) / 0.74));
        item.spotLight.color.set(new THREE.Color().setHSL(0.08 + scrollArtT * 0.05, 0.6, 0.9));

        // Soft tilt on hovered canvas
        if (hoveredArtwork?.id === item.artwork.id) {
          item.canvasMesh.rotation.y = THREE.MathUtils.lerp(item.canvasMesh.rotation.y, (mouseCurrentRef.current.x || 0) * 0.06, 0.1);
          item.canvasMesh.rotation.x = THREE.MathUtils.lerp(item.canvasMesh.rotation.x, -(mouseCurrentRef.current.y || 0) * 0.06, 0.1);
        } else {
          item.canvasMesh.rotation.y = THREE.MathUtils.lerp(item.canvasMesh.rotation.y, 0, 0.1);
          item.canvasMesh.rotation.x = THREE.MathUtils.lerp(item.canvasMesh.rotation.x, 0, 0.1);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      isDisposed = true;
      trevor.dispose();
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('click', onPointerClick);
      window.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();
      if (rendererRef.current && container.contains(rendererRef.current.domElement)) {
        container.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, [webglSupported, artworks]);

  if (!webglSupported) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#f7efe3] text-[#2d1f14]">
        <div className="w-16 h-16 rounded-full bg-[#ebdccb] flex items-center justify-center mb-4 text-[#85582f]">
          🌿
        </div>
        <h3 className="font-serif text-2xl mb-2 text-[#2d1f14]">Botanical Art Gallery</h3>
        <p className="text-sm text-[#735840] max-w-md mb-4">
          WebGL hardware acceleration is unavailable in this environment. Showing our curated high-resolution 2D gallery experience.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden select-none" ref={containerRef}>
      {artworks.map((art) => (
        <div
          key={art.id}
          ref={(el) => { plaquesRef.current[art.id] = el; }}
          className="absolute z-20 flex flex-col items-center bg-[#fffbf9]/90 backdrop-blur-sm p-3 rounded-sm border border-[#e0d0c0] shadow-md pointer-events-none text-center transform -translate-x-1/2 -translate-y-full"
          style={{ display: 'none' }}
        >
          <h4 className="font-serif text-sm font-bold text-[#1a120b] mb-0.5">{art.title}</h4>
          <p className="text-[10px] text-[#4a3a2a] uppercase tracking-wide">{art.tamilTitle}</p>
          <div className="w-full h-[1px] bg-[#d0c0b0] my-1.5" />
          <p className="text-[10px] text-[#2d1f14] font-semibold">{art.medium} • {art.year}</p>
        </div>
      ))}
      {/* Floating subtle hover tooltip when hovering artwork in 3D */}
      {hoveredArtwork && (
        <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-[#fffdf9]/95 backdrop-blur-md border border-[#ded0be] text-xs tracking-wider uppercase text-[#2d1f14] shadow-xl flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#85582f] animate-ping" />
          Click to inspect “{hoveredArtwork.title}”
        </div>
      )}
    </div>
  );
};
