'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Eye,
  Navigation,
  Sparkles,
  Compass,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Flame,
  RotateCcw,
  MapPin,
  ExternalLink,
  Sliders
} from 'lucide-react';
import Link from 'next/link';

interface Braj3DBackgroundProps {
  onSelectDestination?: (slug: string) => void;
  initialMode?: 'dawn' | 'aarti' | 'day';
}

export default function Braj3DBackground({ onSelectDestination, initialMode = 'dawn' }: Braj3DBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeLandmark, setActiveLandmark] = useState<string>('Overview');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [lightingMode, setLightingMode] = useState<'dawn' | 'aarti' | 'day'>(initialMode);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [bgVividness, setBgVividness] = useState<'subtle' | 'vivid'>('vivid');
  const [selectedPinInfo, setSelectedPinInfo] = useState<{
    name: string;
    slug: string;
    description: string;
    aarti: string;
  } | null>(null);

  // References for Three.js state preserved across renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const brajWorldRef = useRef<THREE.Group | null>(null);
  const lightsRef = useRef<{
    ambient: THREE.AmbientLight;
    sun: THREE.DirectionalLight;
    rim: THREE.DirectionalLight;
    pointLights: THREE.PointLight[];
  } | null>(null);

  // Orbit camera state
  const sphericalRef = useRef({
    radius: 46,
    theta: 0.1,
    phi: Math.PI / 4,
  });
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAtRef = useRef(new THREE.Vector3(0, 0, 0));
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const isRotatingRef = useRef(isRotating);
  isRotatingRef.current = isRotating;

  // FlyTo Animation State
  const targetSphericalRef = useRef({
    radius: 46,
    theta: 0.1,
    phi: Math.PI / 4,
  });

  // Landmark data for 3D exploration
  const landmarks = [
    {
      name: 'Vrindavan',
      slug: 'vrindavan',
      tagline: 'Banke Bihari & Prem Mandir',
      pos: [-6, 0.5, -8],
      cam: { radius: 24, theta: -0.4, phi: Math.PI / 3.5 },
      lookAt: [-6, 3, -8],
      description: 'The supreme realm of Bhakti, famous for Banke Bihari, Prem Mandir, and evening Keshi Ghat Yamuna Aarti.',
      aarti: 'Mangala: 07:45 AM | Shayan: 08:30 PM'
    },
    {
      name: 'Mathura',
      slug: 'mathura',
      tagline: 'Krishna Janmasthan & Vishram Ghat',
      pos: [8, 0.5, 12],
      cam: { radius: 26, theta: 0.8, phi: Math.PI / 3.8 },
      lookAt: [8, 3, 12],
      description: 'Mokshadayi holy city where Bhagwan Krishna manifested inside the prison cell. Famed for Vishram Ghat Yamuna snan.',
      aarti: 'Janmasthan: 05:30 AM | Yamuna: 07:00 PM'
    },
    {
      name: 'Barsana',
      slug: 'barsana',
      tagline: 'Shriji Mandir Bhanugarh Hill',
      pos: [-18, 6.5, -16],
      cam: { radius: 28, theta: -1.2, phi: Math.PI / 3.2 },
      lookAt: [-18, 7, -16],
      description: 'The celestial abode of Shri Radha Rani perched atop Bhanugarh hills, home to Rangeeli Mahal and divine Lathmar Holi.',
      aarti: 'Mangala: 05:00 AM | Shayan: 08:30 PM'
    },
    {
      name: 'Govardhan',
      slug: 'govardhan',
      tagline: 'Giriraj Parvat & 21-km Parikrama',
      pos: [16, 4.5, 0],
      cam: { radius: 27, theta: 1.6, phi: Math.PI / 3.5 },
      lookAt: [16, 5, 0],
      description: 'The living form of Lord Krishna that gave shelter to Brajwasis. Millions walk the sacred 21km Parikrama barefoot.',
      aarti: 'Dan Ghati Dudh Abhishek: 05:00 AM - 10:00 PM'
    }
  ];

  // Fly-to smooth camera handler
  const flyTo = useCallback((landmarkName: string) => {
    setActiveLandmark(landmarkName);
    const target = landmarks.find((l) => l.name === landmarkName);
    if (target) {
      targetSphericalRef.current = { ...target.cam };
      targetLookAtRef.current.set(target.lookAt[0], target.lookAt[1], target.lookAt[2]);
      setSelectedPinInfo({
        name: target.name,
        slug: target.slug,
        description: target.description,
        aarti: target.aarti
      });
      if (onSelectDestination) onSelectDestination(target.slug);
    } else {
      // Overview
      targetSphericalRef.current = { radius: 46, theta: 0.1, phi: Math.PI / 4 };
      targetLookAtRef.current.set(0, 0, 0);
      setSelectedPinInfo(null);
    }
  }, [landmarks, onSelectDestination]);

  // Main Three.js Initialization
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Fog color depends on mode
    const fogColor = lightingMode === 'aarti' ? 0x160d26 : 0xfff6e5;
    scene.fog = new THREE.FogExp2(fogColor, lightingMode === 'aarti' ? 0.012 : 0.010);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = lightingMode === 'aarti' ? 1.4 : 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting Setup
    const ambientLight = new THREE.AmbientLight(
      lightingMode === 'aarti' ? 0x3d265a : 0xffebd2,
      lightingMode === 'aarti' ? 0.9 : 1.5
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(
      lightingMode === 'aarti' ? 0xf59e0b : lightingMode === 'day' ? 0xffffff : 0xff9933,
      lightingMode === 'aarti' ? 1.2 : 2.4
    );
    sunLight.position.set(30, 45, 25);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(
      lightingMode === 'aarti' ? 0x9333ea : 0x0284c7,
      lightingMode === 'aarti' ? 1.5 : 0.8
    );
    rimLight.position.set(-30, 20, -25);
    scene.add(rimLight);

    // Point lights for illuminated temples in Aarti mode
    const pointLights: THREE.PointLight[] = [];
    const templePoints = [
      [-6, 3, -8],
      [8, 3, 12],
      [-18, 8, -16],
      [16, 6, 0]
    ];
    templePoints.forEach(([x, y, z]) => {
      const pl = new THREE.PointLight(0xffa200, lightingMode === 'aarti' ? 2.5 : 0.6, 18);
      pl.position.set(x, y + 2, z);
      scene.add(pl);
      pointLights.push(pl);
    });

    lightsRef.current = { ambient: ambientLight, sun: sunLight, rim: rimLight, pointLights };

    // 5. Main 3D Braj World Group
    const brajWorld = new THREE.Group();
    brajWorldRef.current = brajWorld;
    scene.add(brajWorld);

    // --- Sacred Undulating Terrain (Braj Bhoomi) ---
    const terrainGeo = new THREE.PlaneGeometry(90, 90, 80, 80);
    terrainGeo.rotateX(-Math.PI / 2);
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      // Gentle rolls of Braj pastoral land
      let y = Math.sin(vx * 0.08) * Math.cos(vz * 0.08) * 1.6;
      // Barsana Bhanugarh Ridge
      if (vx < -10 && vz < -8) {
        y += Math.exp(-((vx + 18) ** 2 + (vz + 16) ** 2) / 65) * 8.5;
      }
      // Govardhan Giriraj Hill Ridge
      if (vx > 8 && vz < 7) {
        y += Math.exp(-((vx - 16) ** 2 + (vz - 0) ** 2) / 75) * 6.5;
        // Parikrama trail indent
        const distFromCrest = Math.abs(Math.sqrt((vx - 16) ** 2 + vz ** 2) - 4.5);
        if (distFromCrest < 1.2) y -= 0.6;
      }
      // Sacred River Yamuna Meander Bed
      const riverDist = Math.abs(vx - Math.sin(vz * 0.11) * 9);
      if (riverDist < 7) {
        y -= Math.cos((riverDist / 7) * (Math.PI / 2)) * 2.2;
      }
      pos.setY(i, y);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: lightingMode === 'aarti' ? 0x543324 : 0xdfbc8d,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.position.y = -2;
    terrainMesh.receiveShadow = true;
    brajWorld.add(terrainMesh);

    // --- Sacred Yamuna River (Kalindi) ---
    const riverCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.sin(-40 * 0.11) * 9, -2.6, -40),
      new THREE.Vector3(Math.sin(-20 * 0.11) * 9, -2.5, -20),
      new THREE.Vector3(Math.sin(0 * 0.11) * 9, -2.6, 0),
      new THREE.Vector3(Math.sin(20 * 0.11) * 9, -2.5, 20),
      new THREE.Vector3(Math.sin(40 * 0.11) * 9, -2.6, 40)
    ]);
    const riverGeo = new THREE.TubeGeometry(riverCurve, 80, 5.2, 10, false);
    const riverMat = new THREE.MeshStandardMaterial({
      color: lightingMode === 'aarti' ? 0x0f3460 : 0x0284c7,
      roughness: 0.12,
      metalness: 0.85,
      transparent: true,
      opacity: 0.88,
    });
    const riverMesh = new THREE.Mesh(riverGeo, riverMat);
    riverMesh.scale.set(1, 0.14, 1);
    brajWorld.add(riverMesh);

    // --- Helper to build Sacred Hindu Temple Shikhara ---
    const templeFlags: THREE.Mesh[] = [];
    const createTemple = (
      name: string,
      baseColor = 0xd97706,
      shikharaColor = 0xf59e0b,
      flagColor = 0xe05a10,
      scale = 1
    ) => {
      const templeGroup = new THREE.Group();
      templeGroup.name = name;

      // Tiered Stone Jagati (Plinth base)
      const baseGeo1 = new THREE.BoxGeometry(4.8, 1.2, 4.8);
      const baseMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.65,
        metalness: 0.1
      });
      const base1 = new THREE.Mesh(baseGeo1, baseMat);
      base1.position.y = 0.6;
      base1.castShadow = true;
      base1.receiveShadow = true;
      templeGroup.add(base1);

      const baseGeo2 = new THREE.BoxGeometry(4.0, 1.0, 4.0);
      const base2 = new THREE.Mesh(baseGeo2, baseMat);
      base2.position.y = 1.6;
      templeGroup.add(base2);

      // Mandapa (Pillared Hall with carved arched doorway)
      const mandapaGeo = new THREE.BoxGeometry(3.2, 2.4, 3.2);
      const mandapaMat = new THREE.MeshStandardMaterial({
        color: shikharaColor,
        roughness: 0.45,
        metalness: 0.2
      });
      const mandapa = new THREE.Mesh(mandapaGeo, mandapaMat);
      mandapa.position.y = 3.1;
      mandapa.castShadow = true;
      templeGroup.add(mandapa);

      // Curvilinear Rekha Shikhara (Soaring Tower)
      const shikharaGeo = new THREE.ConeGeometry(2.1, 5.8, 8);
      const shikharaMat = new THREE.MeshStandardMaterial({
        color: shikharaColor,
        roughness: 0.35,
        metalness: 0.35
      });
      const shikhara = new THREE.Mesh(shikharaGeo, shikharaMat);
      shikhara.position.y = 6.8;
      shikhara.castShadow = true;
      templeGroup.add(shikhara);

      // Amalaka & Kalash (Golden Finial & Sacred Pot)
      const amalakaGeo = new THREE.SphereGeometry(0.75, 16, 16);
      amalakaGeo.scale(1, 0.45, 1);
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.95,
        roughness: 0.15,
        emissive: 0xffb703,
        emissiveIntensity: lightingMode === 'aarti' ? 0.7 : 0.3
      });
      const amalaka = new THREE.Mesh(amalakaGeo, goldMat);
      amalaka.position.y = 9.8;
      templeGroup.add(amalaka);

      const kalashGeo = new THREE.ConeGeometry(0.35, 1.2, 8);
      const kalash = new THREE.Mesh(kalashGeo, goldMat);
      kalash.position.y = 10.6;
      templeGroup.add(kalash);

      // Sacred Temple Dhwaja (Flag Pole and Waving Flag)
      const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.2);
      const pole = new THREE.Mesh(poleGeo, goldMat);
      pole.position.y = 11.4;
      templeGroup.add(pole);

      const flagGeo = new THREE.ConeGeometry(0.65, 1.4, 3);
      flagGeo.rotateZ(Math.PI / 2);
      const flagMat = new THREE.MeshBasicMaterial({ color: flagColor });
      const flag = new THREE.Mesh(flagGeo, flagMat);
      flag.position.set(0.7, 12.0, 0);
      templeGroup.add(flag);
      templeFlags.push(flag);

      // Golden Halo Ring
      const haloGeo = new THREE.RingGeometry(0.9, 2.5, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xffe082,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: lightingMode === 'aarti' ? 0.65 : 0.35
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = Math.PI / 2;
      halo.position.y = 10.0;
      templeGroup.add(halo);

      templeGroup.scale.set(scale, scale, scale);
      return templeGroup;
    };

    // 1. Vrindavan - Banke Bihari & Prem Mandir Shikhara
    const vrindavanTemple = createTemple('Vrindavan', 0xd97706, 0xfef08a, 0xe05a10, 1.15);
    vrindavanTemple.position.set(-6, -0.4, -8);
    brajWorld.add(vrindavanTemple);

    // 2. Mathura - Shri Krishna Janmasthan & Sandstone Shikhara
    const mathuraTemple = createTemple('Mathura', 0xc2410c, 0xfb923c, 0xd97706, 1.25);
    mathuraTemple.position.set(8, -0.4, 12);
    brajWorld.add(mathuraTemple);

    // 3. Barsana - Shriji Mandir atop Bhanugarh Hill
    const barsanaTemple = createTemple('Barsana', 0xbe185d, 0xf472b6, 0xe11d48, 1.1);
    barsanaTemple.position.set(-18, 5.8, -16);
    brajWorld.add(barsanaTemple);

    // 4. Govardhan - Giriraj Dan Ghati & Mukharvind Mandir
    const govardhanTemple = createTemple('Govardhan', 0x047857, 0x34d399, 0x059669, 1.15);
    govardhanTemple.position.set(16, 4.0, 0);
    brajWorld.add(govardhanTemple);

    // --- Sacred Kadamba & Tulsi Tree Clusters ---
    const treeGroup = new THREE.Group();
    const treePoints = [
      [-10, -0.5, -4], [-4, -0.5, -14], [-12, -0.3, -10], // Vrindavan Groves (Nidhivan / Seva Kunj)
      [4, -0.5, 8], [12, -0.5, 16],                        // Mathura gardens
      [-14, 3.2, -12], [-22, 4.0, -18],                   // Barsana hillside flora
      [12, 2.5, -4], [20, 2.8, 4]                          // Govardhan foothills
    ];
    treePoints.forEach(([tx, ty, tz]) => {
      const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, 1.6, 6);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(tx, ty + 0.8, tz);
      treeGroup.add(trunk);

      const foliageGeo = new THREE.DodecahedronGeometry(1.0, 1);
      const foliageMat = new THREE.MeshStandardMaterial({
        color: lightingMode === 'aarti' ? 0x1e3a1e : 0x2e7d32,
        roughness: 0.8
      });
      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.set(tx, ty + 2.0, tz);
      treeGroup.add(foliage);
    });
    brajWorld.add(treeGroup);

    // --- Floating Diya & River Deepam System ---
    const diyasGroup = new THREE.Group();
    const diyaCount = lightingMode === 'aarti' ? 36 : 18;
    for (let i = 0; i < diyaCount; i++) {
      const diyaBowlGeo = new THREE.CylinderGeometry(0.3, 0.15, 0.15, 8);
      const diyaBowlMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.8 });
      const diya = new THREE.Mesh(diyaBowlGeo, diyaBowlMat);

      // Flame
      const flameGeo = new THREE.ConeGeometry(0.15, 0.45, 6);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xffd54f });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.y = 0.25;
      diya.add(flame);

      const t = (i / diyaCount);
      const pt = riverCurve.getPoint(t);
      diya.position.set(pt.x + (Math.sin(i * 3) * 2.2), -2.3, pt.z);
      diyasGroup.add(diya);
    }
    brajWorld.add(diyasGroup);

    // --- Golden Temple Sparkles / Blessing Particles ---
    const particlesCount = lightingMode === 'aarti' ? 240 : 160;
    const pGeometry = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 70;
      pPositions[i * 3 + 1] = Math.random() * 26;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 70;
    }
    pGeometry.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

    const pMaterial = new THREE.PointsMaterial({
      color: lightingMode === 'aarti' ? 0xffb703 : 0xff9900,
      size: lightingMode === 'aarti' ? 0.65 : 0.45,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(pGeometry, pMaterial);
    brajWorld.add(particleSystem);

    // --- Interactive Mouse Orbit & Drag Listeners ---
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      targetSphericalRef.current.theta -= deltaX * 0.008;
      targetSphericalRef.current.phi = Math.max(
        0.15,
        Math.min(Math.PI / 2.2, targetSphericalRef.current.phi - deltaY * 0.008)
      );

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      targetSphericalRef.current.radius = Math.max(
        16,
        Math.min(65, targetSphericalRef.current.radius + e.deltaY * 0.035)
      );
    };

    // Touch support for mobile devices
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

      targetSphericalRef.current.theta -= deltaX * 0.008;
      targetSphericalRef.current.phi = Math.max(
        0.15,
        Math.min(Math.PI / 2.2, targetSphericalRef.current.phi - deltaY * 0.008)
      );

      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: true });
    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // --- Window Resize handler ---
    const onResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      cameraRef.current.aspect = container.clientWidth / container.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // --- Animation Loop ---
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Continuous slow rotation when enabled and user not dragging
      if (isRotatingRef.current && !isDraggingRef.current) {
        targetSphericalRef.current.theta += delta * 0.05;
      }

      // Smooth lerp spherical camera coords
      sphericalRef.current.radius += (targetSphericalRef.current.radius - sphericalRef.current.radius) * 0.06;
      sphericalRef.current.theta += (targetSphericalRef.current.theta - sphericalRef.current.theta) * 0.06;
      sphericalRef.current.phi += (targetSphericalRef.current.phi - sphericalRef.current.phi) * 0.06;

      currentLookAtRef.current.lerp(targetLookAtRef.current, 0.06);

      // Convert spherical to Cartesian position
      const r = sphericalRef.current.radius;
      const theta = sphericalRef.current.theta;
      const phi = sphericalRef.current.phi;

      camera.position.x = currentLookAtRef.current.x + r * Math.sin(phi) * Math.sin(theta);
      camera.position.y = currentLookAtRef.current.y + r * Math.cos(phi);
      camera.position.z = currentLookAtRef.current.z + r * Math.sin(phi) * Math.cos(theta);

      camera.lookAt(currentLookAtRef.current);

      // Rise floating golden particles
      const posAttr = pGeometry.attributes.position;
      for (let i = 0; i < particlesCount; i++) {
        let py = posAttr.getY(i) + 0.035;
        if (py > 28) py = 0;
        posAttr.setY(i, py);
      }
      posAttr.needsUpdate = true;

      // Floating / bobbing river deepams
      diyasGroup.children.forEach((diya, idx) => {
        diya.position.y = -2.3 + Math.sin(elapsedTime * 2.2 + idx) * 0.09;
        diya.rotation.y = elapsedTime * 0.4 + idx;
      });

      // Temple flags waving gently in divine breeze
      templeFlags.forEach((flag, idx) => {
        flag.rotation.z = Math.PI / 2 + Math.sin(elapsedTime * 4 + idx) * 0.12;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      if (domElement && container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, [lightingMode]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 bg-neutral-950' : 'z-0'
      }`}
    >
      {/* Three.js Canvas Container (Interactive Orbit Area) */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing pointer-events-auto"
      />

      {/* Atmospheric Vignette & Contrast Control (subtle / vivid) */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
          bgVividness === 'vivid'
            ? lightingMode === 'aarti'
              ? 'bg-gradient-to-t from-neutral-950/80 via-transparent to-neutral-950/50'
              : 'bg-gradient-to-t from-[#fffaf0]/60 via-transparent to-amber-950/20'
            : lightingMode === 'aarti'
            ? 'bg-neutral-950/70'
            : 'bg-[#fffaf0]/80'
        }`}
      />

      {/* Radial soft spotlight behind center search box */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_40%,rgba(255,250,240,0.45)_90%)] pointer-events-none" />

      {/* ═══════════════════════════════════════════════════════════════
         INTERACTIVE SELECTED PIN INFO CARD (Bottom Left)
         ═══════════════════════════════════════════════════════════════ */}
      {selectedPinInfo && (
        <div className="absolute bottom-6 left-6 pointer-events-auto z-20 max-w-sm bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-temple-lg border-2 border-amber-400 animate-subtle-float">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                Active 3D Destination
              </span>
              <h3 className="text-xl font-black font-serif text-neutral-900 mt-1">
                {selectedPinInfo.name}
              </h3>
            </div>
            <button
              onClick={() => flyTo('Overview')}
              className="text-neutral-400 hover:text-neutral-700 p-1 text-xs"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
            {selectedPinInfo.description}
          </p>

          <div className="mt-3 bg-amber-50/70 p-2.5 rounded-2xl border border-amber-200/80 text-[11px] text-amber-950 font-medium">
            <span className="font-bold text-amber-900 block mb-0.5">Temple Aarti &amp; Darshan:</span>
            {selectedPinInfo.aarti}
          </div>

          <div className="mt-3 flex items-center space-x-2">
            <Link
              href={`/brijnidhi/${selectedPinInfo.slug}`}
              className="flex-1 btn-primary text-xs py-2"
            >
              <span>Explore {selectedPinInfo.name} Stays</span>
              <ExternalLink className="w-3 h-3 ml-1.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Floating 3D Interaction Tip Pill (Bottom Right) */}
      <div className="absolute bottom-4 right-6 pointer-events-auto hidden md:flex items-center space-x-2 text-[11px] font-bold text-amber-950/90 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-300/60 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
        <span>Click &amp; drag to rotate 360° • Scroll wheel to zoom in/out</span>
      </div>
    </div>
  );
}
