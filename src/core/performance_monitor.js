import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

const PerformanceMonitor: React.FC = () => {
  const [fps, setFps] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);

  useEffect(() => {
    let lastTime = performance.now();
    let frameCount = 0;

    const updateFPS = () => {
      const now = performance.now();
      const deltaTime = now - lastTime;
      frameCount++;

      if (deltaTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      requestAnimationFrame(updateFPS);
    };

    updateFPS();

    const updateMemoryUsage = () => {
      if (performance.memory) {
        setMemoryUsage(performance.memory.usedJSHeapSize / 1048576); // bytes to MB
      }
      setTimeout(updateMemoryUsage, 1000); // Update every 1 second
    };

    updateMemoryUsage();
  }, []);

  return (
    <Card className="w-full bg-card">
      <CardHeader className="bg-card">
        <CardTitle className="bg-card">パフォーマンスモニタリング</CardTitle>
        <CardDescription className="bg-card">FPSとメモリ使用量を表示します。</CardDescription>
      </CardHeader>
      <CardContent className="bg-card">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>FPS (フレーム/秒)</Label>
            <Input type="text" value={fps.toFixed(2)} readOnly />
          </div>
          <div>
            <Label>メモリ使用量 (MB)</Label>
            <Input type="text" value={memoryUsage.toFixed(2)} readOnly />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default PerformanceMonitor;