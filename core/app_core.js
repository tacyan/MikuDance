import React, { useEffect, useRef, useState } from 'react';
import { ModelManager } from '../models/model_manager';
import { MotionController } from '../animation/motion_controller';
import { WebGLRenderer } from '../rendering/webgl_renderer';
import { MainInterface } from '../ui/main_interface';
import { ProjectManager } from '../data/project_manager';

const AppCore: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const modelManagerRef = useRef<ModelManager>(null);
  const motionControllerRef = useRef<MotionController>(null);
  const rendererRef = useRef<WebGLRenderer>(null);
  const projectManagerRef = useRef<ProjectManager>(null);

  useEffect(() => {
    const initializeCore = async () => {
      try {
        setIsLoading(true);

        // システムコンポーネントの初期化
        modelManagerRef.current = new ModelManager();
        motionControllerRef.current = new MotionController();
        rendererRef.current = new WebGLRenderer();
        projectManagerRef.current = new ProjectManager();

        // モジュール間の連携設定
        await Promise.all([
          modelManagerRef.current.initialize(),
          motionControllerRef.current.initialize(),
          rendererRef.current.initialize(),
          projectManagerRef.current.initialize()
        ]);

        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : '初期化中にエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    initializeCore();

    return () => {
      // クリーンアップ処理
      modelManagerRef.current?.dispose();
      motionControllerRef.current?.dispose();
      rendererRef.current?.dispose();
      projectManagerRef.current?.dispose();
    };
  }, []);

  return (
    <Card className="w-full bg-[#ffffff] dark:bg-[#1a1a1a]">
      <CardHeader className="bg-[#ffffff] dark:bg-[#1a1a1a]">
        <CardTitle className="text-[#333333] dark:text-[#ffffff]">
          初音ミクダンスシステム
        </CardTitle>
        <CardDescription className="text-[#666666] dark:text-[#cccccc]">
          システムステータス: {isInitialized ? '起動完了' : '初期化中'}
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-[#ffffff] dark:bg-[#1a1a1a]">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c5a572]" />
          </div>
        ) : error ? (
          <div className="text-[#ff0000] dark:text-[#ff6666] p-4 rounded-lg bg-[#ffeeee] dark:bg-[#330000]">
            {error}
          </div>
        ) : (
          <MainInterface
            modelManager={modelManagerRef.current}
            motionController={motionControllerRef.current}
            renderer={rendererRef.current}
            projectManager={projectManagerRef.current}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AppCore;