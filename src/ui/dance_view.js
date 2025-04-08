/**
 * @fileoverview ダンスビューコンポーネント
 * @description PMXモデルを表示し、ダンスモーションを適用するコンポーネント
 */

import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Separator } from './ui_components';
import { WebGLRenderer } from '../render/webgl_renderer';
import { ModelManager } from '../models/model_manager';
import { MotionController } from '../animation/motion_controller';
import './dance_view.css';

/**
 * ダンスビューコンポーネント
 * @returns {React.ReactElement} ダンスビューコンポーネント
 */
const DanceView = () => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDance, setCurrentDance] = useState(null);
  const [dances, setDances] = useState([]);
  const [models, setModels] = useState([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [modelName, setModelName] = useState('初音ミク (Hatsune Miku)');
  const [isLoading, setIsLoading] = useState(false);
  const [modelManager, setModelManager] = useState(null);
  const [motionController, setMotionController] = useState(null);
  const [renderer, setRenderer] = useState(null);

  // キャンバスのサイズ設定
  useLayoutEffect(() => {
    if (canvasRef.current) {
      // キャンバスの明示的なサイズ設定
      canvasRef.current.width = canvasRef.current.clientWidth;
      canvasRef.current.height = canvasRef.current.clientHeight;
      console.log('キャンバスサイズを設定しました:', {
        width: canvasRef.current.width,
        height: canvasRef.current.height,
        clientWidth: canvasRef.current.clientWidth,
        clientHeight: canvasRef.current.clientHeight
      });
    }
  }, []);

  // 初期化処理
  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      try {
        if (!canvasRef.current) {
          console.error('キャンバス要素が見つかりません');
          setError('キャンバス要素が見つかりません');
          return;
        }

        // レイアウト計算が完了するのを待つ
        await new Promise(resolve => setTimeout(resolve, 200));

        if (!isMounted) return;

        console.log('初期化処理を開始します...');
        setIsLoading(true);

        // キャンバスサイズを明示的に設定（幅を広めに）
        const parentWidth = canvasRef.current.parentElement?.clientWidth || 800;
        canvasRef.current.width = parentWidth;
        canvasRef.current.height = Math.max(500, parentWidth * 0.6);
        
        console.log('キャンバスサイズを再設定しました:', {
          width: canvasRef.current.width,
          height: canvasRef.current.height
        });

        // モデルマネージャーとモーションコントローラーの初期化
        console.log('ModelManagerを初期化します...');
        const newModelManager = new ModelManager();
        if (isMounted) setModelManager(newModelManager);
        
        console.log('MotionControllerを初期化します...');
        const newMotionController = new MotionController();
        newMotionController.setModelManager(newModelManager);
        if (isMounted) setMotionController(newMotionController);

        // WebGLレンダラーの初期化
        console.log('WebGLRendererを作成します...');
        const newRenderer = new WebGLRenderer();
        
        // キャンバスサイズが正しく設定されているか再確認
        if (canvasRef.current) {
          if (canvasRef.current.width === 0) {
            canvasRef.current.width = canvasRef.current.clientWidth || 800;
          }
          if (canvasRef.current.height === 0) {
            canvasRef.current.height = canvasRef.current.clientHeight || 600;
          }
          
          console.log('キャンバスサイズ (初期化前):', {
            width: canvasRef.current.width,
            height: canvasRef.current.height,
            clientWidth: canvasRef.current.clientWidth,
            clientHeight: canvasRef.current.clientHeight,
            offsetWidth: canvasRef.current.offsetWidth,
            offsetHeight: canvasRef.current.offsetHeight
          });
        }
        
        console.log('WebGLRendererをキャンバスに初期化します...');
        const initResult = await newRenderer.initialize(canvasRef.current);
        
        if (!isMounted) return;
        
        if (!initResult) {
          console.error('WebGLレンダラーの初期化に失敗しました');
          setError('WebGLレンダラーの初期化に失敗しました');
          setIsLoading(false);
          return;
        }
        
        console.log('WebGLレンダラーの初期化に成功しました');
        setRenderer(newRenderer);
        
        // モデルマネージャーにレンダラーを設定
        console.log('ModelManagerにレンダラーを設定します...');
        newModelManager.setRenderer(newRenderer);

        // レンダリング開始（モデルがロードされる前に開始）
        console.log('レンダリングを開始します...');
        newRenderer.startRendering();

        // 初期回転を設定（モデルが正面を向くように）
        newRenderer.setRotation(0, Math.PI);

        try {
          // サンプルモデルをロード
          console.log('サンプルモデルをロードします...');
          const model = await newModelManager.loadSampleModel();
          
          if (!isMounted) return;
          
          console.log('サンプルモデルのロードに成功しました', model);
          
          if (model) {
            // レンダラーにモデルを設定（もう一度レンダラーが初期化されているか確認）
            console.log('モデルをレンダラーに設定します...');
            
            // この時点でrendererが初期化されているか確認
            if (newRenderer.gl) {
              const renderResult = newRenderer.setPMXModel(model);
              if (renderResult) {
                console.log('モデルのレンダリング設定に成功しました');
                setIsModelLoaded(true);
              } else {
                console.error('モデルのレンダリング設定に失敗しました');
              }
            } else {
              console.error('レンダラーのWebGLコンテキストが初期化されていません');
              setError('WebGLレンダラーのコンテキストが初期化されていません');
            }
          }
        } catch (modelError) {
          console.error('モデルのロードに失敗しました:', modelError);
          // エラーは表示するがレンダラーは初期化済み
        }

        // ダンスの初期化
        const availableDances = newMotionController.getAvailableDances();
        if (isMounted) setDances(availableDances);
        
        if (availableDances.length > 0 && isMounted) {
          setCurrentDance(availableDances[0]);
        }
        
        // デバッグ情報の定期更新
        const debugInterval = setInterval(() => {
          if (newRenderer && newRenderer.pmxModel) {
            console.log('レンダリング状態:', {
              hasWebGLContext: !!newRenderer.gl,
              modelLoaded: !!newRenderer.pmxModel,
              buffers: !!newRenderer.buffers,
              canvasSize: newRenderer.canvas ? {
                width: newRenderer.canvas.width,
                height: newRenderer.canvas.height
              } : null
            });
          }
        }, 3000);
        
        // クリーンアップでインターバル解除
        setTimeout(() => {
          clearInterval(debugInterval);
        }, 15000);
        
        if (isMounted) setIsLoading(false);
      } catch (err) {
        console.error('初期化中にエラーが発生しました:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : '初期化中にエラーが発生しました');
          setIsLoading(false);
        }
      }
    };

    initialize();
    
    // クリーンアップ
    return () => {
      isMounted = false;
      try {
        if (renderer && typeof renderer.stopRendering === 'function') {
          renderer.stopRendering();
        }
        
        if (motionController && typeof motionController.stop === 'function') {
          motionController.stop();
        }
      } catch (error) {
        console.error('クリーンアップ中にエラーが発生しました:', error);
      }
    };
  }, []);

  // PMXファイルのアップロード処理
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // PMXファイルかどうかの簡易チェック
    if (!file.name.toLowerCase().endsWith('.pmx')) {
      setError('PMXファイル(.pmx)を選択してください');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // ファイル名をモデル名として使用
      const modelId = 'custom_model';
      const fileName = file.name.replace('.pmx', '');
      setModelName(fileName);
      
      // デバッグ情報
      console.log('modelManagerが存在するか:', !!modelManager);
      console.log('modelManager.loadModelが関数か:', typeof modelManager.loadModel === 'function');
      console.log('ファイル情報:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // modelManagerを使ってPMXモデルをロード
      if (!modelManager || typeof modelManager.loadModel !== 'function') {
        const errorMsg = 'PMXモデルをロードする機能が利用できません';
        console.error(errorMsg, {
          modelManagerExists: !!modelManager,
          loadModelMethod: modelManager ? typeof modelManager.loadModel : 'undefined'
        });
        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      console.log('modelManager.loadModelを呼び出します...');
      let model;
      try {
        model = await modelManager.loadModel(file, modelId);
        console.log('モデルデータ:', model);
      } catch (innerError) {
        console.error('modelManager.loadModel内部エラー:', innerError);
        setError('モデルのロード中に内部エラーが発生しました: ' + innerError.message);
        setIsLoading(false);
        return;
      }
      
      // レンダラーにモデルを設定
      console.log('rendererが存在するか:', !!renderer);
      console.log('renderer.setPMXModelが関数か:', typeof renderer.setPMXModel === 'function');
      
      if (!renderer || typeof renderer.setPMXModel !== 'function') {
        const errorMsg = 'レンダラーでモデルを設定できません';
        console.error(errorMsg, {
          rendererExists: !!renderer,
          setPMXModelMethod: renderer ? typeof renderer.setPMXModel : 'undefined'
        });
        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      // レンダラーのWebGLコンテキストが初期化されているか確認
      if (!renderer.gl) {
        console.error('レンダラーのWebGLコンテキストが初期化されていません');
        setError('WebGLレンダラーのコンテキストが初期化されていません。ページを再読み込みしてください。');
        setIsLoading(false);
        return;
      }
      
      console.log('renderer.setPMXModelを呼び出します...');
      const renderResult = renderer.setPMXModel(model);
      
      if (renderResult) {
        // モデルのロードが完了したらフラグを更新
        setIsModelLoaded(true);
        console.log(`モデル "${fileName}" がロードされました`);
      } else {
        const errorMsg = 'レンダラーでモデルを設定できませんでした';
        console.error(errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      console.error('PMXファイルのロードに失敗しました:', error);
      setError('PMXファイルのロードに失敗しました: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ダンスの変更処理
  const handleDanceChange = (e) => {
    const selectedDanceId = e.target.value;
    const selectedDance = dances.find(dance => dance.id === selectedDanceId);
    
    if (selectedDance) {
      console.log(`ダンス「${selectedDance.name}」を選択しました`, selectedDance);
      setCurrentDance(selectedDance);
      
      if (motionController) {
        // 再生停止
        if (isPlaying) {
          motionController.stop();
          setIsPlaying(false);
        }
        
        // 新しいダンスを設定
        motionController.setAnimation(selectedDance.id);
      }
    }
  };

  // 再生/停止の切り替え
  const togglePlayback = () => {
    if (!motionController || !currentDance) {
      console.error('モーションコントローラーまたはダンスが設定されていません');
      return;
    }
    
    if (isPlaying) {
      console.log('ダンスを停止します...');
      motionController.pause();
      setIsPlaying(false);
    } else {
      console.log(`ダンス「${currentDance.name}」を再生します...`);
      
      // 必要に応じてダンスを再設定
      if (currentDance && currentDance.id) {
        motionController.setAnimation(currentDance.id);
      }
      
      motionController.play();
      setIsPlaying(true);
    }
  };

  // モデルリストの更新
  useEffect(() => {
    try {
      if (modelManager && modelManager.getModelList && typeof modelManager.getModelList === 'function') {
        const modelList = modelManager.getModelList();
        setModels(modelList);
      }
    } catch (err) {
      console.error('モデルリストの取得中にエラーが発生しました:', err);
    }
  }, [modelManager]);

  // モデルの選択
  const handleModelSelect = (event) => {
    try {
      const modelId = event.target.value;
      
      if (modelManager && modelManager.setActiveModel) {
        modelManager.setActiveModel(modelId);
      }
    } catch (err) {
      setError(`モデル選択中にエラーが発生しました: ${err.message}`);
      console.error('モデル選択エラー:', err);
    }
  };

  // モデルの回転
  const rotateModel = (x, y) => {
    try {
      // レンダラーに回転を設定
      if (renderer && renderer.setRotation) {
        renderer.setRotation(x, y);
      }
      
      // モデルマネージャーに回転を設定
      if (modelManager && modelManager.setRotation) {
        modelManager.setRotation([x, y, 0]);
      }
    } catch (err) {
      console.error('モデル回転エラー:', err);
    }
  };

  // マウスドラッグによるモデル回転
  const handleMouseDrag = (() => {
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let rotationX = 0;
    let rotationY = 0;
    
    const onMouseDown = (e) => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };
    
    const onMouseMove = (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      
      // Y軸回転（左右ドラッグ）
      rotationY += deltaX * 0.01;
      
      // X軸回転（上下ドラッグ）- 上下反転を防ぐため制限を設ける
      rotationX += deltaY * 0.01;
      rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationX));
      
      rotateModel(rotationX, rotationY);
      
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };
    
    const onMouseUp = () => {
      isDragging = false;
    };
    
    // イベントハンドラーをオブジェクトとして返す
    return {
      onMouseDown,
      onMouseMove,
      onMouseUp
    };
  })();

  return (
    <div className="flex flex-col space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>初音ミクダンスビュー</CardTitle>
          <CardDescription>
            PMXモデルダンスシステム - {isModelLoaded ? '準備完了' : 'ロード中...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">エラーが発生しました</p>
              <p>{error}</p>
            </div>
          )}
          
          <div className="relative">
            <canvas 
              ref={canvasRef} 
              className="w-full h-96 rounded bg-gray-900"
              style={{ touchAction: 'none' }}
              onMouseDown={handleMouseDrag.onMouseDown}
              onMouseMove={handleMouseDrag.onMouseMove}
              onMouseUp={handleMouseDrag.onMouseUp}
              onMouseLeave={handleMouseDrag.onMouseUp}
            />
            
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
              </div>
            )}
            
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 p-2 rounded">
              <div className="flex items-center justify-between">
                <button 
                  onClick={togglePlayback}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  disabled={!isModelLoaded || isLoading}
                >
                  {isPlaying ? '一時停止' : '再生'}
                </button>
                
                <select 
                  value={currentDance?.id || ''} 
                  onChange={handleDanceChange}
                  className="bg-gray-700 text-white px-2 py-1 rounded"
                  disabled={!isModelLoaded || isLoading}
                >
                  {dances.map(dance => (
                    <option key={dance.id} value={dance.id}>
                      {dance.name} ({dance.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">PMXモデルをロード</h3>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".pmx"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                disabled={isLoading}
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                disabled={isLoading}
              >
                PMXファイルを選択
              </button>
              <span className="text-sm text-gray-500">
                {isLoading ? 'ロード中...' : 'miku.pmxなどのPMXファイルを選択してください'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">モデル情報</h3>
              <p>モデル: {modelName}</p>
              <p>ポリゴン数: 約14,000</p>
              <p>テクスチャ: 標準セット</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">ダンス情報</h3>
              <p>現在のダンス: {currentDance?.name || 'なし'}</p>
              <p>カテゴリ: {currentDance?.category || '-'}</p>
              <p>フレーム数: {currentDance?.frameCount || 0}</p>
            </div>
          </div>
          
          {models.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">モデルを選択</h3>
              <select
                className="w-full bg-gray-700 text-white px-2 py-1 rounded"
                onChange={handleModelSelect}
                disabled={!modelManager}
              >
                <option value="" disabled>モデルを選択</option>
                {models.map(modelId => (
                  <option key={modelId} value={modelId}>
                    {modelId}
                  </option>
                ))}
              </select>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DanceView; 