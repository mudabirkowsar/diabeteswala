"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import {
  Sparkles,
  Leaf,
  ArrowRight,
  Flame,
  Dna,
  Wheat,
  Carrot,
  Salad,
  Zap,
  RotateCw,
  Eye,
  Activity,
  ShieldCheck
} from "lucide-react";

// Ingredient Phase Metadata
const INGREDIENT_PHASES = [
  {
    id: "phase-1",
    name: "Crisp Organic Romaine & Lacinato Greens",
    role: "Hydration & Chlorophyll Base",
    macros: "6g Prebiotic Fiber",
    badge: "Phase 01 • Greens Foundation",
    icon: Leaf,
    threshold: [0.05, 0.28],
    accentColor: "#22C55E",
    side: "left"
  },
  {
    id: "phase-2",
    name: "Cucumber Discs, Carrots & Avocado",
    role: "Cellular Hydration & Healthy Lipids",
    macros: "9g Oleic Acid & Potassium",
    badge: "Phase 02 • Fresh Harvest",
    icon: Salad,
    threshold: [0.28, 0.52],
    accentColor: "#84CC16",
    side: "right"
  },
  {
    id: "phase-3",
    name: "Vine-Ripened Tomatoes & Sweet Potatoes",
    role: "Lycopene & Resistant Prebiotic Starches",
    macros: "450% Daily Beta-Carotene",
    badge: "Phase 03 • Antioxidant Core",
    icon: Carrot,
    threshold: [0.52, 0.76],
    accentColor: "#EF4444",
    side: "left"
  },
  {
    id: "phase-4",
    name: "Kalamata Olives, Sweet Corn & Spiced Chickpeas",
    role: "Polyphenols & Complex Plant Protein",
    macros: "16g Bioavailable Protein",
    badge: "Phase 04 • Superfood Finishing",
    icon: Wheat,
    threshold: [0.76, 0.96],
    accentColor: "#EAB308",
    side: "right"
  }
];

// Helper: Generate procedural noise canvas texture in memory
function generateNoiseTexture(baseColor = "#FFFFFF", grainColor = "#E2E8F0") {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 128, 128);

  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = grainColor;
    ctx.globalAlpha = Math.random() * 0.25;
    ctx.fillRect(Math.random() * 128, Math.random() * 128, 1.5, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export default function Scroll3DSaladBowl() {
  const mountRef = useRef(null);
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. Scene, Camera, Renderer Setup ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 5.2, 7.8);
    camera.lookAt(0, 0.3, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.appendChild(renderer.domElement);

    // --- 2. Studio Lighting Rig ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Warm Key Light (Main Sunlight)
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.4);
    keyLight.position.set(6, 12, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    // Cool Cyan Fill Light (Depth)
    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.8);
    fillLight.position.set(-7, 5, -3);
    scene.add(fillLight);

    // Emerald Freshness Rim Light (Highlighting leaf edges)
    const rimLight = new THREE.SpotLight(0x34d399, 3.2);
    rimLight.position.set(0, 9, -6);
    rimLight.angle = Math.PI / 3.5;
    rimLight.penumbra = 0.8;
    scene.add(rimLight);

    // Soft Shadow Floor Catcher
    const shadowPlaneGeo = new THREE.PlaneGeometry(30, 30);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.18 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.82;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // --- 3. Realistic Ceramic Stoneware Bowl ---
    const bowlGroup = new THREE.Group();

    const points = [];
    points.push(new THREE.Vector2(0, 0));
    points.push(new THREE.Vector2(0.9, 0.05));
    points.push(new THREE.Vector2(1.9, 0.35));
    points.push(new THREE.Vector2(2.65, 1.15));
    points.push(new THREE.Vector2(2.7, 1.3));
    points.push(new THREE.Vector2(2.58, 1.3));
    points.push(new THREE.Vector2(2.5, 1.15));
    points.push(new THREE.Vector2(1.8, 0.38));
    points.push(new THREE.Vector2(0.8, 0.12));
    points.push(new THREE.Vector2(0, 0.12));

    const bowlGeo = new THREE.LatheGeometry(points, 72);
    const ceramicNoise = generateNoiseTexture("#FAF7F2", "#D4C7B5");

    const bowlMat = new THREE.MeshPhysicalMaterial({
      color: 0xfcfbf9,
      roughness: 0.18,
      metalness: 0.02,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
      map: ceramicNoise,
      reflectivity: 0.95
    });

    const bowlMesh = new THREE.Mesh(bowlGeo, bowlMat);
    bowlMesh.castShadow = true;
    bowlMesh.receiveShadow = true;
    bowlMesh.position.y = -0.8;
    bowlGroup.add(bowlMesh);

    scene.add(bowlGroup);

    // --- 4. High-Fidelity Procedural Food Mesh Generators ---

    // 1. Organic Deformed Lettuce Leaf
    function createRealisticLettuce() {
      const geo = new THREE.PlaneGeometry(1.4, 1.4, 24, 24);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        // Multi-frequency organic curl
        const z =
          Math.sin(x * 2.8) * 0.18 +
          Math.cos(y * 3.2) * 0.16 +
          Math.sin((x + y) * 4) * 0.08;
        pos.setZ(i, z);
      }
      geo.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        color: 0x4ade80,
        roughness: 0.45,
        metalness: 0.05,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      return mesh;
    }

    // 2. Realistic Sliced Heirloom Tomato (Rind + Translucent Jelly + Seeds)
    function createRealisticTomato() {
      const group = new THREE.Group();

      // Outer Crimson Rind
      const outerGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.1, 36);
      const outerMat = new THREE.MeshPhysicalMaterial({
        color: 0xdc2626,
        roughness: 0.2,
        clearcoat: 0.85,
        clearcoatRoughness: 0.1
      });
      const outer = new THREE.Mesh(outerGeo, outerMat);
      outer.castShadow = true;
      group.add(outer);

      // Translucent Seed Gel Layer
      const gelGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.105, 32);
      const gelMat = new THREE.MeshPhysicalMaterial({
        color: 0x991b1b,
        roughness: 0.1,
        transmission: 0.45,
        thickness: 0.2
      });
      const gel = new THREE.Mesh(gelGeo, gelMat);
      group.add(gel);

      // Tiny Golden Seeds
      const seedGeo = new THREE.SphereGeometry(0.038, 8, 8);
      const seedMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        roughness: 0.3
      });
      for (let i = 0; i < 5; i++) {
        const seed = new THREE.Mesh(seedGeo, seedMat);
        const angle = (i * (Math.PI * 2)) / 5;
        seed.position.set(Math.cos(angle) * 0.24, 0.055, Math.sin(angle) * 0.24);
        group.add(seed);
      }
      return group;
    }

    // 3. Crisp Cucumber Wheel with Ribbed Skin
    function createRealisticCucumber() {
      const group = new THREE.Group();
      // Outer Dark Green Skin
      const skinGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.09, 32);
      const skinMat = new THREE.MeshStandardMaterial({
        color: 0x166534,
        roughness: 0.38
      });
      const skin = new THREE.Mesh(skinGeo, skinMat);
      skin.castShadow = true;
      group.add(skin);

      // Pale Watery Flesh
      const fleshGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.095, 32);
      const fleshMat = new THREE.MeshPhysicalMaterial({
        color: 0xa7f3d0,
        roughness: 0.2,
        clearcoat: 0.7
      });
      const flesh = new THREE.Mesh(fleshGeo, fleshMat);
      group.add(flesh);
      return group;
    }

    // 4. Creamy Hass Avocado Slice Fan
    function createRealisticAvocado() {
      const shape = new THREE.Shape();
      shape.absarc(0, 0, 0.38, 0, Math.PI, false);
      const extrudeSettings = {
        depth: 0.12,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 1,
        bevelSize: 0.03,
        bevelThickness: 0.03
      };
      const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0x84cc16,
        roughness: 0.25,
        clearcoat: 0.8,
        clearcoatRoughness: 0.15
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      return mesh;
    }

    // 5. Roasted Caramelized Sweet Potato Cube
    function createRoastedSweetPotato() {
      const geo = new THREE.BoxGeometry(0.35, 0.28, 0.35);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xea580c,
        roughness: 0.35
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      return mesh;
    }

    // 6. Glossy Kalamata Olive Ring
    function createKalamataOlive() {
      const geo = new THREE.TorusGeometry(0.18, 0.09, 16, 28);
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0x2e1065,
        roughness: 0.15,
        clearcoat: 0.9
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      return mesh;
    }

    // 7. Golden Sweet Corn Kernel
    function createSweetCorn() {
      const geo = new THREE.BoxGeometry(0.12, 0.16, 0.12);
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0xfacc15,
        roughness: 0.2,
        clearcoat: 0.6
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      return mesh;
    }

    // 8. Spiced Golden Chickpea
    function createSpicedChickpea() {
      const geo = new THREE.SphereGeometry(0.13, 14, 14);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        // Subtle organic dimple
        if (x > 0.04) pos.setX(i, x * 1.15);
      }
      geo.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.45
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      return mesh;
    }

    // --- 5. Layered Ingredient Sequence & Target Positions ---
    const ingredientFactories = [
      // Base Layer: Organic Crisp Greens (0.05 -> 0.28)
      { type: "lettuce", create: createRealisticLettuce, target: [-0.65, -0.38, -0.4], rot: [0.35, 0.6, -0.2], range: [0.05, 0.20] },
      { type: "lettuce", create: createRealisticLettuce, target: [0.75, -0.32, 0.35], rot: [-0.4, 1.3, 0.25], range: [0.08, 0.22] },
      { type: "lettuce", create: createRealisticLettuce, target: [0.1, -0.42, -0.75], rot: [0.55, -0.7, 0.15], range: [0.12, 0.25] },
      { type: "lettuce", create: createRealisticLettuce, target: [-0.8, -0.28, 0.55], rot: [-0.25, -0.5, 0.6], range: [0.15, 0.28] },

      // Mid Layer 1: Cucumbers, Avocado, Carrots (0.28 -> 0.52)
      { type: "cucumber", create: createRealisticCucumber, target: [-0.55, -0.15, 0.25], rot: [0.4, 0.3, -0.5], range: [0.28, 0.42] },
      { type: "cucumber", create: createRealisticCucumber, target: [0.45, -0.12, -0.35], rot: [-0.3, 0.9, 0.2], range: [0.32, 0.45] },
      { type: "avocado", create: createRealisticAvocado, target: [0.65, 0.05, 0.15], rot: [1.1, -0.2, 0.45], range: [0.36, 0.48] },
      { type: "avocado", create: createRealisticAvocado, target: [-0.25, 0.02, 0.6], rot: [-0.8, 0.4, 0.3], range: [0.40, 0.52] },

      // Mid Layer 2: Roasted Sweet Potato & Heirloom Tomatoes (0.52 -> 0.76)
      { type: "potato", create: createRoastedSweetPotato, target: [0.15, -0.05, 0.4], rot: [0.6, -0.4, 0.2], range: [0.52, 0.64] },
      { type: "potato", create: createRoastedSweetPotato, target: [-0.65, -0.02, -0.25], rot: [-0.5, 0.7, -0.3], range: [0.55, 0.67] },
      { type: "tomato", create: createRealisticTomato, target: [-0.3, 0.12, 0.15], rot: [0.35, -0.3, 0.25], range: [0.60, 0.72] },
      { type: "tomato", create: createRealisticTomato, target: [0.35, 0.18, -0.12], rot: [-0.25, 0.55, -0.4], range: [0.64, 0.76] },

      // Top Layer: Kalamata Olives, Corn & Chickpeas (0.76 -> 0.96)
      { type: "chickpea", create: createSpicedChickpea, target: [0.05, 0.22, -0.4], rot: [0.2, 0.5, 0.1], range: [0.76, 0.86] },
      { type: "chickpea", create: createSpicedChickpea, target: [-0.45, 0.25, -0.15], rot: [-0.4, 0.3, 0.6], range: [0.78, 0.88] },
      { type: "olive", create: createKalamataOlive, target: [0.22, 0.3, 0.32], rot: [-0.55, 0.85, -0.1], range: [0.82, 0.92] },
      { type: "corn", create: createSweetCorn, target: [-0.12, 0.32, 0.22], rot: [0.15, 0.35, 0.2], range: [0.85, 0.94] },
      { type: "corn", create: createSweetCorn, target: [0.38, 0.32, -0.32], rot: [0.4, -0.25, 0.5], range: [0.88, 0.96] }
    ];

    const ingredientItems = ingredientFactories.map((item) => {
      const mesh = item.create();
      mesh.position.set(item.target[0], 12, item.target[2]);
      mesh.visible = false;
      scene.add(mesh);
      return { ...item, mesh };
    });

    // --- 6. Interactive Orbit Drag ---
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      rotationVelocity.x = deltaY * 0.0035;
      rotationVelocity.y = deltaX * 0.0035;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Touch support for mobile
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const handleTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;

      rotationVelocity.x = deltaY * 0.0035;
      rotationVelocity.y = deltaX * 0.0035;

      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const handleTouchEnd = () => {
      isDragging = false;
    };

    domEl.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    // --- 7. Main Animation Loop with Physics Dropping ---
    let animationFrameId;
    let currentScroll = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth scroll interpolation
      const targetScroll = scrollProgress;
      currentScroll += (targetScroll - currentScroll) * 0.085;

      // Orbit physics
      if (autoRotate) {
        bowlGroup.rotation.y += 0.004;
      } else {
        bowlGroup.rotation.y += rotationVelocity.y;
        bowlGroup.rotation.x += rotationVelocity.x;
        rotationVelocity.x *= 0.92;
        rotationVelocity.y *= 0.92;
      }

      // Synchronized Parabolic Dropping Animation
      ingredientItems.forEach(({ mesh, target, rot, range }) => {
        const [start, end] = range;
        if (currentScroll < start) {
          mesh.visible = false;
          mesh.position.set(target[0], 12, target[2]);
        } else {
          mesh.visible = true;
          const progress = Math.min(Math.max((currentScroll - start) / (end - start), 0), 1);

          // Parabolic gravity drop with damped spring bounce
          const dropY = 12 - (12 - target[1]) * Math.sin((progress * Math.PI) / 2);
          const bounceFactor = Math.sin(progress * Math.PI * 2.8) * 0.18 * (1 - progress);

          mesh.position.x = target[0];
          mesh.position.y = dropY + bounceFactor;
          mesh.position.z = target[2];

          // Realistic tumbling rotation
          mesh.rotation.x = rot[0] * progress + (1 - progress) * 2;
          mesh.rotation.y = rot[1] * progress + (1 - progress) * 3;
          mesh.rotation.z = rot[2] * progress;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      domEl.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      domEl.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [scrollProgress, autoRotate]);

  // Track global window scroll progression
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalHeight = containerRef.current.clientHeight - window.innerHeight;
      const progress = Math.min(Math.max(-rect.top / totalHeight, 0), 1);
      setScrollProgress(progress);

      // Determine active ingredient phase
      if (progress < 0.28) setActivePhaseIndex(0);
      else if (progress < 0.52) setActivePhaseIndex(1);
      else if (progress < 0.76) setActivePhaseIndex(2);
      else setActivePhaseIndex(3);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fillPercentage = Math.round(scrollProgress * 100);
  const activePhase = INGREDIENT_PHASES[activePhaseIndex];

  return (
    <div className="relative bg-[#FAF8F5] text-slate-900 font-sans select-none selection:bg-[#3D3F96] selection:text-white">
      
      {/* 450vh Scroll Runway */}
      <div ref={containerRef} className="relative h-[450vh] w-full">
        
        {/* Sticky Fullscreen 3D Viewport */}
        <div className="sticky top-0 h-screen w-full flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
          
          {/* TOP HEADER CONTROLS */}
          <header className="z-20 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-6xl mx-auto w-full shrink-0">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3D3F96]/10 text-[#3D3F96] text-xs font-black uppercase tracking-widest border border-[#3D3F96]/15 shadow-sm">
                <Sparkles size={13} className="text-[#3D3F96] animate-pulse" />
                Real-Time 3D Salad Studio
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 mt-1">
                Clinical Precision in Every Layer.
              </h2>
            </div>

            {/* Quick 3D Interaction Toggles */}
            <div className="flex items-center gap-2.5 bg-white/90 p-1.5 rounded-2xl border border-slate-200/80 backdrop-blur-md shadow-md">
              <button
                type="button"
                onClick={() => setAutoRotate(!autoRotate)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  autoRotate
                    ? "bg-[#3D3F96] text-white shadow-md shadow-[#3D3F96]/20"
                    : "text-slate-600 hover:text-slate-900 bg-slate-100"
                }`}
              >
                <RotateCw size={13} />
                {autoRotate ? "Auto-Orbiting" : "360° Rotate"}
              </button>

              <div className="px-3 py-1.5 text-xs font-mono font-bold text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
                {fillPercentage}% Built
              </div>
            </div>
          </header>

          {/* MIDDLE: 3D THREE.JS CANVAS WITH TURN-BY-TURN LASER HUD CARDS */}
          <div className="relative flex-1 w-full max-w-6xl mx-auto flex items-center justify-center my-auto">
            
            {/* LEFT ACTIVE LASER CARD */}
            <div className="hidden lg:block relative h-[380px] w-80 z-20 pointer-events-none">
              {activePhase.side === "left" && (
                <div className="pointer-events-auto h-fit my-auto p-6 rounded-3xl bg-white/95 backdrop-blur-xl border-2 border-[#3D3F96] shadow-2xl shadow-indigo-950/15 animate-fadeIn">
                  
                  {/* Directional Optical Laser Pointer (Points Right into 3D Bowl) */}
                  <div className="absolute top-1/2 -right-14 -translate-y-1/2 flex items-center pointer-events-none">
                    <div className="relative flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-[#3D3F96]" />
                      <div className="absolute w-6 h-6 rounded-full bg-[#3D3F96]/30 animate-ping" />
                    </div>
                    <div className="w-8 h-[2px] bg-gradient-to-r from-[#3D3F96] to-[#3D3F96]/60" />
                    <svg className="w-5 h-5 text-[#3D3F96] -ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Card Content */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#3D3F96] px-3 py-1 rounded-full shadow-sm">
                      {activePhase.badge}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-[#3D3F96]/10 flex items-center justify-center text-[#3D3F96]">
                      <activePhase.icon size={16} />
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {activePhase.name}
                  </h3>

                  <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
                    {activePhase.benefits}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">Potency</span>
                    <span className="text-[#3D3F96] font-black">{activePhase.macros}</span>
                  </div>
                </div>
              )}
            </div>

            {/* THREE.JS 3D CANVAS MOUNT */}
            <div
              ref={mountRef}
              className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing flex items-center justify-center"
            />

            {/* RIGHT ACTIVE LASER CARD */}
            <div className="hidden lg:block relative h-[380px] w-80 z-20 pointer-events-none">
              {activePhase.side === "right" && (
                <div className="pointer-events-auto h-fit my-auto p-6 rounded-3xl bg-white/95 backdrop-blur-xl border-2 border-[#3D3F96] shadow-2xl shadow-indigo-950/15 animate-fadeIn">
                  
                  {/* Directional Optical Laser Pointer (Points Left into 3D Bowl) */}
                  <div className="absolute top-1/2 -left-14 -translate-y-1/2 flex items-center flex-row-reverse pointer-events-none">
                    <div className="relative flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-[#3D3F96]" />
                      <div className="absolute w-6 h-6 rounded-full bg-[#3D3F96]/30 animate-ping" />
                    </div>
                    <div className="w-8 h-[2px] bg-gradient-to-l from-[#3D3F96] to-[#3D3F96]/60" />
                    <svg className="w-5 h-5 text-[#3D3F96] -mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </div>

                  {/* Card Content */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#3D3F96] px-3 py-1 rounded-full shadow-sm">
                      {activePhase.badge}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-[#3D3F96]/10 flex items-center justify-center text-[#3D3F96]">
                      <activePhase.icon size={16} />
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {activePhase.name}
                  </h3>

                  <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
                    {activePhase.benefits}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">Potency</span>
                    <span className="text-[#3D3F96] font-black">{activePhase.macros}</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* BOTTOM TELEMETRY HUD & COMPLETION ACTION */}
          <footer className="z-20 max-w-xl mx-auto w-full bg-white/95 border border-slate-200/90 rounded-3xl p-4 sm:p-5 backdrop-blur-2xl shadow-xl flex flex-col gap-3">
            
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                {activePhase.name}
              </span>
              <span className="text-[#3D3F96] font-mono font-black text-sm">
                {fillPercentage}% Assembled
              </span>
            </div>

            {/* 4-Step Milestone Scrubber */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="bg-gradient-to-r from-emerald-500 via-[#3D3F96] to-indigo-600 h-full rounded-full transition-all duration-200"
                style={{ width: `${fillPercentage}%` }}
              />
            </div>

            {/* Dynamic CTA at 85%+ completion */}
            {fillPercentage >= 85 ? (
              <Link
                href="/food/programs"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-[#3D3F96] hover:bg-[#303277] text-white font-black text-xs sm:text-sm shadow-xl shadow-[#3D3F96]/25 transition-all transform hover:-translate-y-0.5"
              >
                <span>Order This Chef-Crafted Bowl</span>
                <ArrowRight size={15} />
              </Link>
            ) : (
              <p className="text-[11px] text-center text-slate-400 font-medium">
                📜 Scroll down to drop 3D ingredients into the ceramic bowl
              </p>
            )}

          </footer>

        </div>

      </div>

    </div>
  );
}