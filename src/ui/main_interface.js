/**
 * @fileoverview メインインターフェースコンポーネント
 * @description アプリケーションのメインユーザーインターフェース
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Separator } from './ui_components';
import DanceView from './dance_view';

/**
 * メインインターフェースコンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {Object} props.modelManager - モデル管理モジュール
 * @param {Object} props.motionController - モーション制御モジュール
 * @param {Object} props.renderer - レンダリングモジュール
 * @param {Object} props.projectManager - プロジェクト管理モジュール
 * @returns {React.ReactElement} メインインターフェースコンポーネント
 */
const MainInterface = ({ modelManager, motionController, renderer, projectManager }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4">
      <div className="grid grid-cols-1 gap-4">
        <DanceView 
          modelManager={modelManager}
          motionController={motionController}
          renderer={renderer}
        />
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl font-bold">機能メニュー</CardTitle>
            <CardDescription>
              システムの各種機能にアクセスできます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                モデルを読み込む
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                モーションを変更
              </button>
              <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded">
                カメラ設定
              </button>
              <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded">
                照明効果
              </button>
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                プロジェクト保存
              </button>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-2">システム情報</h3>
              <p>初音ミクPMXモデルダンスシステム v1.0</p>
              <p>WebGL対応ブラウザでご利用ください</p>
              <p>© 2023 MikuDance System</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MainInterface;