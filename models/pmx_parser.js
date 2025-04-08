import React, { useState } from 'react';

const PmxParser: React.FC = () => {
  return (
    <Card className="w-full bg-card">
      <CardHeader className="bg-card">
        <CardTitle className="bg-card">PMXファイル形式パーサー</CardTitle>
        <CardDescription className="bg-card">
          PMXファイルのバイナリデータを解析し、モデル構造、ボーン階層、頂点データ、マテリアル情報を抽出します。低レベル処理として、エンディアン処理、文字コード変換（UTF-16/Shift-JIS対応）、インデックスデータの最適化を行います。
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-card">
        <div>
          <p className="mb-4"><strong>機能:</strong></p>
          <ul className="list-disc pl-5">
            <li>バイナリデータ解析</li>
            <li>モデル構造マッピング</li>
            <li>ボーン階層構築</li>
            <li>頂点データ処理</li>
            <li>マテリアル情報抽出</li>
          </ul>
        </div>
        <Separator className="my-4 bg-gray-300 dark:bg-gray-700" />
        <div>
          <p className="mb-4"><strong>低レベル処理:</strong></p>
          <ul className="list-disc pl-5">
            <li>バイナリデータ読み取り</li>
            <li>エンディアン処理</li>
            <li>文字コード変換 (UTF-16/Shift-JIS)</li>
            <li>インデックスデータ最適化</li>
          </ul>
        </div>
        <Separator className="my-4 bg-gray-300 dark:bg-gray-700" />
        <div>
          <p className="mb-4"><strong>依存関係:</strong></p>
          <ul className="list-disc pl-5">
            <li>src/models/miku_pmx_loader.js</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
export default PmxParser;