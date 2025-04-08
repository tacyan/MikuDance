import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

const WebGLRenderer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const composerRef = useRef<EffectComposer>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // シーン初期化
    sceneRef.current = new THREE.Scene();
    sceneRef.current.background = new THREE.Color('#1a1a1a');

    // カメラ設定
    cameraRef.current = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current.position.z = 5;

    // レンダラー設定
    rendererRef.current = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current.shadowMap.enabled = true;

    // ポストプロセス設定
    composerRef.current = new EffectComposer(rendererRef.current);
    const renderPass = new RenderPass(sceneRef.current, cameraRef.current);
    composerRef.current.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    composerRef.current.addPass(bloomPass);

    // カメラコントロール
    const controls = new OrbitControls(cameraRef.current, canvasRef.current);
    controls.enableDamping = true;

    // ライティング
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.5);
    sceneRef.current.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight('#ffffff', 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    sceneRef.current.add(directionalLight);

    // アニメーションループ
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      composerRef.current?.render();
    };
    animate();

    // リサイズ対応
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current || !composerRef.current) return;
      
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      composerRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-full bg-[#1a1a1a]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default WebGLRenderer;