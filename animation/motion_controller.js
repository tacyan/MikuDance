import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const MotionController: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);

  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const modelRef = useRef<THREE.Group>();
  const animationMixerRef = useRef<THREE.AnimationMixer>();

  useEffect(() => {
    if (!canvasRef.current) return;

    // シーン初期化
    sceneRef.current = new THREE.Scene();
    sceneRef.current.background = new THREE.Color(0x2a2a2a);

    // カメラ設定
    cameraRef.current = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current.position.set(0, 1.5, 3);

    // レンダラー設定
    rendererRef.current = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true
    });
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current.setPixelRatio(window.devicePixelRatio);

    // ライト設定
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    sceneRef.current.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 2, 3);
    sceneRef.current.add(directionalLight);

    // OrbitControls
    const controls = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // アニメーションループ
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (animationMixerRef.current && isPlaying) {
        animationMixerRef.current.update(1/60);
      }

      controls.update();
      rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
    };
    animate();

    return () => {
      rendererRef.current?.dispose();
    };
  }, [isPlaying]);

  return (
    <div className="w-full h-full bg-[#1a1a1a] text-white">
      <div className="absolute top-4 left-4 z-10">
        <div className="flex flex-col gap-4">
          <Button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-[#c5a572] hover:bg-[#b39362] text-white"
          >
            {isPlaying ? '一時停止' : '再生'}
          </Button>
          
          <div className="flex items-center gap-2">
            <Input
              type="range"
              min={0}
              max={totalFrames}
              value={currentFrame}
              onChange={(e) => setCurrentFrame(parseInt(e.target.value))}
              className="w-48"
            />
            <span>{`${currentFrame} / ${totalFrames}`}</span>
          </div>
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
};

export default MotionController;