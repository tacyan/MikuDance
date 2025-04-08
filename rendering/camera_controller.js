import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const CameraController: React.FC = () => {
  const [cameraMode, setCameraMode] = useState('orbit');
  const [zoomSpeed, setZoomSpeed] = useState(1);
  const [panSpeed, setPanSpeed] = useState(1);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [fov, setFov] = useState(75);
  const [near, setNear] = useState(0.1);
  const [far, setFar] = useState(1000);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameIdRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // シーン、カメラ、レンダラーの初期化
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(fov, container.clientWidth / container.clientHeight, near, far);
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0xaaaaaa); // 背景色を設定
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // OrbitControls の初期化
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // smooth camera movement
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // ライトの追加
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1).normalize();
    scene.add(directionalLight);

    // 立方体の追加
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // アニメーションループ
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      // コントロールの更新
      controls.update();

      // レンダリング
      renderer.render(scene, camera);
    };

    animate();

    // リサイズ処理
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // クリーンアップ関数
    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      scene.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [fov, near, far]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.zoomSpeed = zoomSpeed;
      controlsRef.current.panSpeed = panSpeed;
      controlsRef.current.rotateSpeed = rotationSpeed;
    }
  }, [zoomSpeed, panSpeed, rotationSpeed]);

  const handleCameraModeChange = (mode: string) => {
    setCameraMode(mode);
    if (!cameraRef.current || !controlsRef.current) return;

    switch (mode) {
      case 'orbit':
        controlsRef.current.reset();
        controlsRef.current.enableRotate = true;
        controlsRef.current.enablePan = true;
        controlsRef.current.enableZoom = true;
        break;
      case 'free':
        controlsRef.current.reset();
        controlsRef.current.enableRotate = true;
        controlsRef.current.enablePan = true;
        controlsRef.current.enableZoom = true;
        break;
      case 'target':
        controlsRef.current.reset();
        controlsRef.current.enableRotate = true;
        controlsRef.current.enablePan = true;
        controlsRef.current.enableZoom = true;
        break;
      case 'scripted':
        controlsRef.current.reset();
        controlsRef.current.enableRotate = false;
        controlsRef.current.enablePan = false;
        controlsRef.current.enableZoom = false;
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-800">
      <Card className="w-full max-w-2xl bg-card">
        <CardHeader className="bg-card">
          <CardTitle className="text-2xl font-bold bg-card">カメラコントローラー</CardTitle>
          <CardDescription className="bg-card">視点操作、カメラアニメーション、プリセットアングルなどを設定します。</CardDescription>
        </CardHeader>
        <CardContent className="bg-card">
          <div className="mb-4">
            <Label htmlFor="cameraMode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              カメラモード
            </Label>
            <RadioGroup defaultValue={cameraMode} className="flex space-x-4 mt-2" onValueChange={handleCameraModeChange}>
              <RadioGroupItem value="orbit" id="orbit" className="peer sr-only" />
              <Label htmlFor="orbit" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 peer-checked:bg-blue-500 peer-checked:text-white px-4 py-2 rounded-md cursor-pointer transition-colors duration-200">
                オービット
              </Label>
              <RadioGroupItem value="free" id="free" className="peer sr-only" />
              <Label htmlFor="free" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 peer-checked:bg-blue-500 peer-checked:text-white px-4 py-2 rounded-md cursor-pointer transition-colors duration-200">
                フリー
              </Label>
              <RadioGroupItem value="target" id="target" className="peer sr-only" />
              <Label htmlFor="target" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 peer-checked:bg-blue-500 peer-checked:text-white px-4 py-2 rounded-md cursor-pointer transition-colors duration-200">
                ターゲット追従
              </Label>
              <RadioGroupItem value="scripted" id="scripted" className="peer sr-only" />
              <Label htmlFor="scripted" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 peer-checked:bg-blue-500 peer-checked:text-white px-4 py-2 rounded-md cursor-pointer transition-colors duration-200">
                スクリプト制御
              </Label>
            </RadioGroup>
          </div>

          <div className="mb-4">
            <Label htmlFor="zoomSpeed" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              ズーム速度
            </Label>
            <Input
              type="number"
              id="zoomSpeed"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={zoomSpeed}
              onChange={(e) => setZoomSpeed(parseFloat(e.target.value))}
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="panSpeed" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              パン速度
            </Label>
            <Input
              type="number"
              id="panSpeed"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={panSpeed}
              onChange={(e) => setPanSpeed(parseFloat(e.target.value))}
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="rotationSpeed" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              回転速度
            </Label>
            <Input
              type="number"
              id="rotationSpeed"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={rotationSpeed}
              onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="fov" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              視野角 (FOV)
            </Label>
            <Input
              type="number"
              id="fov"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={fov}
              onChange={(e) => setFov(parseFloat(e.target.value))}
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="near" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Near
            </Label>
            <Input
              type="number"
              id="near"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={near}
              onChange={(e) => setNear(parseFloat(e.target.value))}
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="far" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Far
            </Label>
            <Input
              type="number"
              id="far"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={far}
              onChange={(e) => setFar(parseFloat(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 w-full max-w-2xl" ref={containerRef} style={{ height: '500px' }}>
        {/* Three.js レンダリング領域 */}
      </div>
    </div>
  );
};

export default CameraController;
