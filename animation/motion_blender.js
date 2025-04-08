import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const MotionBlender = () => {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const mixerRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());

  const [blendWeight, setBlendWeight] = useState(0.5);
  const [transitionDuration, setTransitionDuration] = useState(1.0);
  const [partialBlending, setPartialBlending] = useState(false);

  useEffect(() => {
    const init = () => {
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 5;
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      rendererRef.current = renderer;

      const animate = () => {
        requestAnimationFrame(animate);
        const delta = clockRef.current.getDelta();
        if (mixerRef.current) {
          mixerRef.current.update(delta);
        }
        renderer.render(scene, camera);
      };
      animate();
    };

    init();
  }, []);

  const blendMotions = (motionA, motionB, weight) => {
    const quaternionA = new THREE.Quaternion();
    const quaternionB = new THREE.Quaternion();
    return THREE.Quaternion.slerp(quaternionA, quaternionB, weight);
  };

  const applyPartialBlending = (targetBone, motionA, motionB, weight) => {
    const blendedQuaternion = blendMotions(motionA, motionB, weight);
    targetBone.quaternion.copy(blendedQuaternion);
  };

  return (
    <Card className="w-full bg-[#1a1a1a] text-white">
      <CardHeader className="bg-[#1a1a1a]">
        <CardTitle className="text-2xl">モーションブレンダー</CardTitle>
        <CardDescription className="text-gray-300">
          モーションの合成とブレンド制御
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-[#1a1a1a]">
        <div className="space-y-4">
          <div>
            <Label htmlFor="blendWeight">ブレンド比率</Label>
            <Input
              id="blendWeight"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={blendWeight}
              onChange={(e) => setBlendWeight(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="transitionDuration">トランジション時間</Label>
            <Input
              id="transitionDuration"
              type="number"
              min="0.1"
              max="5.0"
              step="0.1"
              value={transitionDuration}
              onChange={(e) => setTransitionDuration(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="partialBlending"
              checked={partialBlending}
              onCheckedChange={(checked) => setPartialBlending(checked)}
            />
            <Label htmlFor="partialBlending">パーツ別ブレンド</Label>
          </div>

          <canvas
            ref={canvasRef}
            className="w-full h-[400px] rounded-lg bg-[#2a2a2a]"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MotionBlender;