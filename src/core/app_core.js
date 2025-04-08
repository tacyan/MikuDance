/**
 * @fileoverview アプリケーションコアモジュール
 * @description アプリケーションの中心的な機能と初期化処理を提供します
 */

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/ui_components';
import MainInterface from '../ui/main_interface';
import { WebGLRenderer } from '../render/webgl_renderer.js';
import { PMXLoader } from '../models/pmx_loader.js';
import { ModelManager } from '../models/model_manager.js';
import { MotionController } from '../animation/motion_controller.js';
import DanceView from '../ui/dance_view';

/**
 * アプリケーションのコア機能を管理するクラス
 * @class
 */
export class AppCore {
  /**
   * コンストラクタ
   */
  constructor() {
    this.initialized = false;
    this.pmxLoader = null;
    this.modelManager = null;
    this.motionController = null;
    this.renderer = null;
  }

  /**
   * 初期化処理
   * @param {HTMLCanvasElement} canvas - 描画対象のキャンバス要素
   * @returns {Promise<boolean>} 初期化が成功したかどうか
   */
  async initialize(canvas) {
    if (this.initialized) {
      console.log('AppCore is already initialized.');
      return true;
    }

    try {
      console.log('AppCore initializing...');

      // PMXローダーの初期化
      this.pmxLoader = new PMXLoader();

      // モデルマネージャーの初期化
      this.modelManager = new ModelManager();

      // モーションコントローラーの初期化
      this.motionController = new MotionController();

      // WebGLレンダラーの初期化
      this.renderer = new WebGLRenderer();
      
      if (!canvas) {
        console.warn('Canvas element is not provided.');
      } else {
        // レンダラーを初期化
        await this.renderer.initialize(canvas);
      }

      // モーションコントローラーにモデルマネージャーを接続
      this.motionController.setModelManager(this.modelManager);

      // モデルマネージャーにレンダラーを設定
      this.modelManager.setRenderer(this.renderer);

      this.initialized = true;
      console.log('AppCore initialized successfully.');
      return true;
    } catch (error) {
      console.error('Failed to initialize AppCore:', error);
      return false;
    }
  }

  /**
   * サンプルダンスを開始
   * @returns {Promise<boolean>} 開始が成功したかどうか
   */
  async startSampleDance() {
    if (!this.initialized) {
      console.error('AppCore is not initialized.');
      return false;
    }

    try {
      // サンプルモデルのロード
      await this.loadSampleModel();

      // ダンスアニメーションを設定
      const dances = this.motionController.getAvailableDances();
      if (dances.length > 0) {
        this.motionController.setAnimation(dances[0].id);
      }

      // ダンスの再生
      this.motionController.play();
      
      // レンダリング開始
      this.renderer.startRendering();

      console.log('Sample dance started.');
      return true;
    } catch (error) {
      console.error('Failed to start sample dance:', error);
      return false;
    }
  }

  /**
   * サンプルモデルをロード
   * @returns {Promise<Object>} ロードされたモデルデータ
   */
  async loadSampleModel() {
    try {
      // ダミーのモデルデータを生成
      const dummyArrayBuffer = new ArrayBuffer(1024);
      
      // サンプルモデルをロード
      const modelData = await this.modelManager.loadModel(dummyArrayBuffer, 'miku');
      
      console.log('サンプルモデルをロードしました');
      return modelData;
    } catch (error) {
      console.error('サンプルモデルのロードに失敗しました:', error);
      throw error;
    }
  }

  /**
   * リソースの解放
   */
  dispose() {
    if (this.motionController) {
      this.motionController.stop();
    }
    
    if (this.renderer) {
      this.renderer.stopRendering();
    }
    
    if (this.modelManager) {
      this.modelManager.dispose();
    }
    
    this.initialized = false;
    console.log('AppCore disposed.');
  }

  /**
   * レンダリング
   * @returns {React.ReactElement} アプリケーションUI
   */
  render() {
    const { isInitialized, isLoading, error } = this.state;
    
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>初音ミクダンスシステム</h1>
        </header>
        
        <main className="app-content">
          {error && (
            <div className="error-message">
              <h2>エラーが発生しました</h2>
              <p>{error}</p>
            </div>
          )}
          
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>ロード中...</p>
            </div>
          ) : (
            isInitialized && (
              <DanceView />
            )
          )}
        </main>
        
        <footer className="app-footer">
          <p>Copyright © 2025 初音ミクプロジェクト</p>
        </footer>
      </div>
    );
  }
}

/**
 * アプリケーションのコアコンポーネント
 * @returns {React.ReactElement} アプリケーションのコアコンポーネント
 */
const AppCoreComponent = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const modelManagerRef = useRef(null);
  const motionControllerRef = useRef(null);
  const rendererRef = useRef(null);
  const projectManagerRef = useRef(null);

  useEffect(() => {
    const initializeCore = async () => {
      try {
        setIsLoading(true);

        console.log('AppCore初期化を開始します...');

        // 実際のモジュールを初期化
        modelManagerRef.current = new ModelManager();
        motionControllerRef.current = new MotionController();
        rendererRef.current = new WebGLRenderer();

        // モジュール間の連携設定
        motionControllerRef.current.setModelManager(modelManagerRef.current);
        modelManagerRef.current.setRenderer(rendererRef.current);

        console.log('AppCoreの初期化が完了しました');
        setIsInitialized(true);
        setIsLoading(false);
      } catch (err) {
        console.error('AppCoreの初期化中にエラーが発生しました:', err);
        setError(err instanceof Error ? err.message : '初期化中にエラーが発生しました');
        setIsLoading(false);
      }
    };

    initializeCore();

    return () => {
      // クリーンアップ処理
      if (rendererRef.current) {
        rendererRef.current.stopRendering();
      }
      if (motionControllerRef.current) {
        motionControllerRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="container mx-auto p-4">
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-lg">システムを初期化中...</p>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle>エラーが発生しました</CardTitle>
            <CardDescription>初期化中に問題が発生しました</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </CardContent>
        </Card>
      ) : (
        <MainInterface 
          modelManager={modelManagerRef.current}
          motionController={motionControllerRef.current}
          renderer={rendererRef.current}
        />
      )}
    </div>
  );
};

export default AppCoreComponent;