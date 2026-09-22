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
  const [loading, setLoading] = useState<boolean>(true);

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Keep callbacks fresh in refs
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
    canvasMaterial: THREE.MeshStandardMaterial;
    texture: THREE.Texture;
    spotLight?: THREE.SpotLight;
    xStation: number;
    zStation: number;
    isOnBackWall: boolean;
  }
  const artworkObjectsRef = useRef<ArtworkObject[]>([]);
  const loadingPlaquesRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Mouse parallax interpolation
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const mouseCurrentRef = useRef({ x: 0, y: 0 });
  const scrollSmoothRef = useRef(scrollProgress);

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
    if (!canvasContainerRef.current || !webglSupported) return;

    const container = canvasContainerRef.current;
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
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;

    // Ensure canvas element is block-level to avoid ResizeObserver feedback loops
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

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
    const maxStation = artworks.reduce((acc, art, idx) => {
      const st = art.hallwayStation ?? (idx + 1);
      return Math.max(acc, st);
    }, artworks.length);
    const galleryLength = Math.max(75, maxStation * 15 + 25); // Length along which artworks are placed
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

    // --- Build Trevor (GTA Style) 3D Primitive Character ---
    const trevorGroup = new THREE.Group();
    
    // Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: '#f1c27d', roughness: 0.8 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: '#e8e4d9', roughness: 0.9 }); // Dirty white
    const jeansMat = new THREE.MeshStandardMaterial({ color: '#3a5a78', roughness: 0.8 }); // Denim blue
    const shoeMat = new THREE.MeshStandardMaterial({ color: '#3d2b1f', roughness: 0.9 });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.4), shirtMat);
    torso.position.y = 2.4;
    trevorGroup.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.5, 0.45), skinMat);
    head.position.y = 3.3;
    trevorGroup.add(head);

    // Arms
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.1, 0.25), skinMat);
    const armLGroup = new THREE.Group();
    armLGroup.add(armL);
    armL.position.y = -0.5; // Pivot from top
    armLGroup.position.set(-0.55, 3.0, 0);
    trevorGroup.add(armLGroup);

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.1, 0.25), skinMat);
    const armRGroup = new THREE.Group();
    armRGroup.add(armR);
    armR.position.y = -0.5; 
    armRGroup.position.set(0.55, 3.0, 0);
    trevorGroup.add(armRGroup);

    // Legs
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.4, 0.35), jeansMat);
    const legLGroup = new THREE.Group();
    legLGroup.add(legL);
    legL.position.y = -0.7;
    legLGroup.position.set(-0.25, 1.8, 0);
    trevorGroup.add(legLGroup);

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.4, 0.35), jeansMat);
    const legRGroup = new THREE.Group();
    legRGroup.add(legR);
    legR.position.y = -0.7;
    legRGroup.position.set(0.25, 1.8, 0);
    trevorGroup.add(legRGroup);

    scene.add(trevorGroup);
    // --- End Trevor Build ---

    // 6. Build Artwork Stations with admin-controlled ordering & wall placements
    const artworkObjects: ArtworkObject[] = [];

    // Sort artworks by viewOrder so that the viewing sequence strictly follows admin configuration
    const sortedArtworks = [...artworks].sort((a, b) => {
      const orderA = a.viewOrder ?? 999;
      const orderB = b.viewOrder ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return 0;
    });

    sortedArtworks.forEach((art, index) => {
      // Wall placement: 'left' = Left Wall (z < 0), 'right' = Right Wall (z > 0), default alternates
      let isOnBackWall: boolean;
      if (art.wallSide === 'left') {
        isOnBackWall = true;
      } else if (art.wallSide === 'right') {
        isOnBackWall = false;
      } else {
        isOnBackWall = index % 2 === 0;
      }

      // Station X along corridor: station 1 = -1, station 2 = 13, station 3 = 27...
      const stationNumber = (art.hallwayStation !== undefined && art.hallwayStation > 0)
        ? art.hallwayStation
        : index + 1;
      const xPos = -1 + (stationNumber - 1) * 14;
      const zPos = isOnBackWall ? -initialWidth / 2 + 0.15 : initialWidth / 2 - 0.15;

      const artGroup = new THREE.Group();
      artGroup.position.set(xPos, 3.2, zPos);
      if (!isOnBackWall) {
        artGroup.rotation.y = Math.PI; // Face inward into hallway
      }
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
        frameGeometry = new THREE.BoxGeometry(frameW, frameH, 0.06);
      } else if (art.frameShape === 'leaf' || art.frameShape === 'arched') {
        frameW = 1.95;
        frameH = 2.7;
        frameGeometry = new THREE.BoxGeometry(frameW, frameH, 0.06);
      } else if (art.frameShape === 'circular') {
        frameW = 2.2;
        frameH = 2.2;
        frameGeometry = new THREE.CylinderGeometry(frameW / 2, frameW / 2, 0.06, 48);
        frameGeometry.rotateX(Math.PI / 2);
      } else {
        frameW = 2.0;
        frameH = 2.7;
        frameGeometry = new THREE.BoxGeometry(frameW, frameH, 0.06);
      }

      // Canvas Face Mesh with 100% true color fidelity, zero foggy emissive wash
      const canvasMat = new THREE.MeshStandardMaterial({
        map: artTexture,
        roughness: 0.25,
        metalness: 0.0,
        emissive: new THREE.Color(0x000000), // NO foggy white emission
        emissiveIntensity: 0.0,
        transparent: false,
        opacity: 1.0,
      });

      const canvasMesh = new THREE.Mesh(frameGeometry, canvasMat);
      canvasMesh.castShadow = true;
      canvasMesh.receiveShadow = true;
      canvasMesh.userData = { artworkIndex: index, artwork: art };
      canvasMesh.position.z = 0.02;
      artGroup.add(canvasMesh);

      // Minimal, sleek museum frame molding
      const frameMat = new THREE.MeshStandardMaterial({
        color: '#1a1816', // Sleek gallery dark walnut / charcoal
        roughness: 0.55,
        metalness: 0.1,
      });

      if (art.frameShape === 'circular') {
        const outerTorus = new THREE.TorusGeometry(frameW / 2 + 0.025, 0.025, 20, 72);
        const outerMesh = new THREE.Mesh(outerTorus, frameMat);
        outerMesh.position.z = 0.015;
        artGroup.add(outerMesh);
      } else {
        const railThick = 0.035; // Minimal 3.5cm sleek border
        const railDepth = 0.03;  // Minimal 3cm depth

        // Top Rail
        const topRail = new THREE.Mesh(new THREE.BoxGeometry(frameW + railThick * 2, railThick, railDepth), frameMat);
        topRail.position.set(0, frameH / 2 + railThick / 2, 0.01);
        artGroup.add(topRail);

        // Bottom Rail
        const bottomRail = new THREE.Mesh(new THREE.BoxGeometry(frameW + railThick * 2, railThick, railDepth), frameMat);
        bottomRail.position.set(0, -frameH / 2 - railThick / 2, 0.01);
        artGroup.add(bottomRail);

        // Left Rail
        const leftRail = new THREE.Mesh(new THREE.BoxGeometry(railThick, frameH, railDepth), frameMat);
        leftRail.position.set(-frameW / 2 - railThick / 2, 0, 0.01);
        artGroup.add(leftRail);

        // Right Rail
        const rightRail = new THREE.Mesh(new THREE.BoxGeometry(railThick, frameH, railDepth), frameMat);
        rightRail.position.set(frameW / 2 + railThick / 2, 0, 0.01);
        artGroup.add(rightRail);
      }

      // Minimal lighting: Clean focused museum gallery spotlight directly onto canvas
      const spotTarget = new THREE.Object3D();
      spotTarget.position.set(xPos, 3.2, zPos);
      scene.add(spotTarget);

      const spotLight = new THREE.SpotLight('#ffffff', 1.8, 14, Math.PI / 6, 0.35, 1.2);
      const spotZOffset = isOnBackWall ? 3.0 : -3.0;
      spotLight.position.set(xPos, wallHeight - 0.8, zPos + spotZOffset);
      spotLight.target = spotTarget;
      spotLight.castShadow = false;
      scene.add(spotLight);

      artworkObjects.push({
        artwork: art,
        group: artGroup,
        canvasMesh,
        canvasMaterial: canvasMat,
        texture: artTexture,
        spotLight: spotLight,
        xStation: xPos,
        zStation: zPos,
        isOnBackWall: isOnBackWall,
      });
    });

    artworkObjectsRef.current = artworkObjects;

    // 7. Sunny Exit Pavilion at the end of the gallery corridor
    const exitSun = new THREE.PointLight('#ffd58c', 2.8, 25, 1.2);
    exitSun.position.set(galleryLength + 10, 5, 0);
    scene.add(exitSun);

    // Mouse Move Parallax & Raycast Listener (on container element, not window)
    const onPointerMove = (e: MouseEvent) => {
      if (!canvasContainerRef.current) return;
      const rect = canvasContainerRef.current.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseTargetRef.current = { x: normX, y: normY };
    };

    const onPointerClick = (e: MouseEvent) => {
      if (!canvasContainerRef.current || !cameraRef.current) return;
      const rect = canvasContainerRef.current.getBoundingClientRect();
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
          if (art && callbacksRef.current.onArtworkClick) {
            callbacksRef.current.onArtworkClick(art);
          }
        }
      } catch {
        // Suppress
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0 && canvasContainerRef.current) {
        const touch = e.touches[0];
        const rect = canvasContainerRef.current.getBoundingClientRect();
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

    // Reuse objects in animate loop
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    // 8. Animation & Render Loop
    let clock = new THREE.Clock();
    let lastAnnouncedIndex = -1;
    let hasEntered = false;
    let hasExited = false;
    let lastP = -1;

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

      // Only update shadow map when scroll progress changes (i.e. when walls move)
      if (Math.abs(p - lastP) > 0.0001) {
        renderer.shadowMap.needsUpdate = true;
        lastP = p;
      }

      // Run hover raycaster once per frame in animate loop
      try {
        mouseVector.set(mouseCurrentRef.current.x, mouseCurrentRef.current.y);
        raycaster.setFromCamera(mouseVector, camera);

        const meshesToTest = artworkObjects.map((o) => o.canvasMesh);
        const intersects = raycaster.intersectObjects(meshesToTest);

        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const hitArt = hit.userData.artwork;
          if (hitArt) {
            setHoveredArtwork(hitArt);
            if (canvasContainerRef.current) canvasContainerRef.current.style.cursor = 'pointer';
          }
        } else {
          setHoveredArtwork(null);
          if (canvasContainerRef.current) canvasContainerRef.current.style.cursor = 'default';
        }
      } catch {
        // Suppress
      }

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

      // 8c. Camera POV & Path:
      let targetCamX = 0;
      let targetCamY = 2.4;
      let targetCamZ = 24;
      let targetLookX = 0;
      let targetLookY = 2.8;
      let targetLookZ = 0;

      const numArtworks = artworkObjects.length;

      if (p <= 0.14) {
        // Approaching & entering through the doorway
        const t = p / 0.14;
        targetCamX = THREE.MathUtils.lerp(0, -1, t);
        targetCamY = THREE.MathUtils.lerp(2.4, 3.0, t);
        targetCamZ = THREE.MathUtils.lerp(24, 2.5, t);
        targetLookX = THREE.MathUtils.lerp(0, -1, t);
        targetLookY = THREE.MathUtils.lerp(2.8, 3.2, t);
        targetLookZ = 0;
      } else if (p < 0.88 && numArtworks > 0) {
        // Scrolling along the gallery wall
        const galleryT = Math.max(0, Math.min(1, (p - 0.14) / (0.88 - 0.14)));
        const rawArtworkPos = galleryT * (numArtworks - 1);
        const currIndex = Math.max(0, Math.min(Math.floor(rawArtworkPos), numArtworks - 1));
        const nextIndex = Math.max(0, Math.min(currIndex + 1, numArtworks - 1));
        const fraction = rawArtworkPos - Math.floor(rawArtworkPos);

        const currentArt = artworkObjects[currIndex];
        const nextArt = artworkObjects[nextIndex];

        if (currentArt && nextArt) {
          // Smooth plateau easing so camera pauses stably in front of each artwork while walking
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

          // Camera moves squarely in front of each canvas:
          // Left Wall canvas is at z = -currentWidth / 2 + 0.15. Viewing position is at z = -currentWidth / 2 + 3.8
          // Right Wall canvas is at z = currentWidth / 2 - 0.15. Viewing position is at z = currentWidth / 2 - 3.8
          const viewDist = 3.8;
          const camZA = currentArt.isOnBackWall ? -currentWidth / 2 + viewDist : currentWidth / 2 - viewDist;
          const lookZA = currentArt.isOnBackWall ? -currentWidth / 2 + 0.15 : currentWidth / 2 - 0.15;

          const camZB = nextArt.isOnBackWall ? -currentWidth / 2 + viewDist : currentWidth / 2 - viewDist;
          const lookZB = nextArt.isOnBackWall ? -currentWidth / 2 + 0.15 : currentWidth / 2 - 0.15;

          targetCamX = THREE.MathUtils.lerp(currentArt.xStation, nextArt.xStation, smoothFraction);
          targetCamY = 3.2;
          targetCamZ = THREE.MathUtils.lerp(camZA, camZB, smoothFraction);

          targetLookX = THREE.MathUtils.lerp(currentArt.xStation, nextArt.xStation, smoothFraction);
          targetLookY = 3.2;
          targetLookZ = THREE.MathUtils.lerp(lookZA, lookZB, smoothFraction);

          // Trevor position update & animation
          const walkSpeed = 5.0;
          const walkCycle = Math.sin(time * walkSpeed);

          trevorGroup.position.x = targetCamX + 2.4;
          trevorGroup.position.z = THREE.MathUtils.lerp(0, Math.sin(time * 0.5) * 1.2, 0.4);
          trevorGroup.position.y = Math.abs(Math.cos(time * walkSpeed * 2)) * 0.08; // Vertical bounce

          // Leg swing
          legLGroup.rotation.x = walkCycle * 0.45;
          legRGroup.rotation.x = -walkCycle * 0.45;
          // Arm swing (opposite to legs)
          armLGroup.rotation.x = -walkCycle * 0.35;
          armRGroup.rotation.x = walkCycle * 0.35;

          // Trevor turns slightly toward the active artwork
          trevorGroup.rotation.y = (targetLookZ < targetCamZ ? -Math.PI / 4 : Math.PI / 4);
        }

        // Trigger active artwork index callback
        const activeIdx = numArtworks > 0 ? Math.max(0, Math.min(Math.round(rawArtworkPos), numArtworks - 1)) : 0;
        if (activeIdx !== lastAnnouncedIndex) {
          lastAnnouncedIndex = activeIdx;
          const activeArt = artworkObjects[activeIdx]?.artwork;
          const origIndex = activeArt ? artworks.findIndex(a => a.id === activeArt.id) : activeIdx;
          callbacksRef.current.onArtworkChange(origIndex >= 0 ? origIndex : activeIdx);
        }
      } else {
        // Exiting to the sunlit veranda / About the Artist space
        const exitT = Math.max(0, Math.min(1, (p - 0.88) / 0.12));
        const lastStationX = artworkObjects.length > 0 ? artworkObjects[artworkObjects.length - 1].xStation : 39;
        targetCamX = THREE.MathUtils.lerp(lastStationX, lastStationX + 9, exitT);
        targetCamY = THREE.MathUtils.lerp(3.2, 3.2, exitT);
        targetCamZ = THREE.MathUtils.lerp(-currentWidth / 2 + 3.25, 6, exitT);

        targetLookX = targetCamX + 4;
        targetLookY = 3.2;
        targetLookZ = -currentWidth / 2 + 2;
      }

      // Add gentle, non-jarring mouse parallax
      const parallaxX = (mouseCurrentRef.current.x || 0) * 0.45;
      const parallaxY = (mouseCurrentRef.current.y || 0) * 0.25;

      // Responsive interpolation factor (0.055) provides smooth responsive camera movement
      camera.position.x += (targetCamX + parallaxX - camera.position.x) * 0.055;
      camera.position.y += (targetCamY + parallaxY - camera.position.y) * 0.055;
      camera.position.z += (targetCamZ - camera.position.z) * 0.055;

      camera.lookAt(targetLookX + parallaxX * 0.4, targetLookY + parallaxY * 0.4, targetLookZ);

      // 8d. Update Artworks: Permanent 100% Solid Canvases with Ambient Botanical Petals
      artworkObjects.forEach((item, idx) => {
        // Update plaque DOM element directly
        const plaque = plaquesRef.current[item.artwork.id];
        if (plaque) {
          const vector = new THREE.Vector3(item.group.position.x, item.group.position.y - 1.8, item.group.position.z);
          vector.project(camera);
          
          if (vector.z < 1) {
            const x = (vector.x + 1) / 2 * (canvasContainerRef.current?.clientWidth || 0);
            const y = -(vector.y - 1) / 2 * (canvasContainerRef.current?.clientHeight || 0);
            plaque.style.left = `${x}px`;
            plaque.style.top = `${y}px`;
            plaque.style.display = 'flex';
          } else {
            plaque.style.display = 'none';
          }
        }

        // Keep position on appropriate wall side
        item.group.position.z = item.isOnBackWall ? -currentWidth / 2 + 0.15 : currentWidth / 2 - 0.15;

        const isCurrentlyActive = item.artwork.id === artworks[activeArtworkIndex]?.id;

        // Handle per-artwork loading spinner
        const loadingPlaque = loadingPlaquesRef.current[item.artwork.id];
        const isTexLoading = (item.texture as any).isLoading === true;

        if (loadingPlaque) {
          if (isTexLoading) {
            const vector = new THREE.Vector3(item.group.position.x, item.group.position.y, item.group.position.z);
            vector.project(camera);
            if (vector.z < 1) {
              const x = (vector.x + 1) / 2 * (canvasContainerRef.current?.clientWidth || 0);
              const y = -(vector.y - 1) / 2 * (canvasContainerRef.current?.clientHeight || 0);
              loadingPlaque.style.left = `${x}px`;
              loadingPlaque.style.top = `${y}px`;
              loadingPlaque.style.display = 'flex';
            } else {
              loadingPlaque.style.display = 'none';
            }
          } else {
            loadingPlaque.style.display = 'none';
          }
        }

        // Ensure canvas material map stays assigned
        if (!item.canvasMaterial.map) {
          item.canvasMaterial.map = item.texture;
          item.canvasMaterial.needsUpdate = true;
        }

        // Keep all canvases completely sharp, solid, fully opaque, with zero foggy emissive wash
        item.canvasMaterial.emissiveIntensity = 0.0;
        item.canvasMaterial.roughness = 0.25;
        item.canvasMaterial.opacity = 1.0;
        item.canvasMaterial.transparent = false;

        // Dynamic Spotlight: Clean focused museum lighting on active artwork
        if (item.spotLight) {
          const targetIntensity = isCurrentlyActive ? 2.2 : 1.0;
          item.spotLight.intensity = THREE.MathUtils.lerp(item.spotLight.intensity, targetIntensity, 0.1);
        }

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

    // Signal loading finished after scene setup
    setLoading(false);

    // Cleanup on unmount
    return () => {
      isDisposed = true;
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
      {/* Three.js Canvas Container */}
      <div className="absolute inset-0 z-10" ref={canvasContainerRef} />

      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#f7efe3]/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#85582f]/30 border-t-[#85582f] rounded-full animate-spin" />
            <p className="font-serif text-sm text-[#85582f] animate-pulse">Mounting Exhibition...</p>
          </div>
        </div>
      )}
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
      {artworks.map((art) => (
        <div
          key={`loader-${art.id}`}
          ref={(el) => { loadingPlaquesRef.current[art.id] = el; }}
          className="absolute z-30 flex flex-col items-center justify-center pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
          style={{ display: 'none' }}
        >
          <div className="w-8 h-8 border-2 border-[#85582f]/20 border-t-[#85582f] rounded-full animate-spin" />
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
