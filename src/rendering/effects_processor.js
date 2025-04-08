import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

const EffectsProcessor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const composerRef = useRef<EffectComposer>();

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setSize(800, 600);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(800, 600),
      1.5,  // strength
      0.4,  // radius
      0.85  // threshold
    );
    composer.addPass(bloomPass);
    composerRef.current = composer;

    camera.position.z = 5;

    const geometry = new THREE.IcosahedronGeometry(1, 2);
    const material = new THREE.MeshStandardMaterial({
      color: '#c5a572',
      metalness: 0.9,
      roughness: 0.1,
      emissive: '#c5a572',
      emissiveIntensity: 0.5
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const ambientLight = new THREE.AmbientLight('#ffffff', 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight('#ffffff', 1);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);

    const animate = () => {
      requestAnimationFrame(animate);
      mesh.rotation.x += 0.01;
      mesh.rotation.y += 0.01;
      composerRef.current?.render();
    };

    animate();

    return () => {
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <Card className="w-full bg-[#1a1a1a]">
      <CardHeader className="bg-[#1a1a1a]">
        <CardTitle className="text-[#ffffff]">エフェクトプロセッサー</CardTitle>
        <CardDescription className="text-[#a0a0a0]">
          高度なビジュアルエフェクトとポストプロセス処理
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-[#1a1a1a]">
        <canvas
          ref={canvasRef}
          className="w-full h-[600px] rounded-lg"
        />
      </CardContent>
    </Card>
  );
};

export default EffectsProcessor;