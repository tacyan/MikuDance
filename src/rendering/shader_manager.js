import React, { useEffect, useState } from 'react';
import * as THREE from 'three';

const ShaderManager: React.FC = () => {
  const [activeShader, setActiveShader] = useState('phong');
  const [shaderParams, setShaderParams] = useState({
    roughness: 0.5,
    metalness: 0.5,
    toonSteps: 4,
    outlineWidth: 1.0,
    bloomIntensity: 1.0,
    focusDistance: 10.0,
  });

  const shaderTypes = [
    { id: 'phong', name: 'フォン/ブリンシェーディング' },
    { id: 'pbr', name: '物理ベースレンダリング' },
    { id: 'toon', name: 'トゥーンシェーディング' },
    { id: 'outline', name: 'アウトライン' },
    { id: 'bloom', name: 'ブルーム' },
    { id: 'dof', name: '被写界深度' },
  ];

  return (
    <Card className="w-full bg-[#1a1a1a] text-white">
      <CardHeader>
        <CardTitle>シェーダーマネージャー</CardTitle>
        <CardDescription className="text-gray-300">
          シェーダープログラムとエフェクトの管理
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeShader} onValueChange={setActiveShader}>
          <TabsList className="grid grid-cols-3 gap-2">
            {shaderTypes.map(shader => (
              <TabsTrigger 
                key={shader.id} 
                value={shader.id}
                className="bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
              >
                {shader.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6 space-y-4">
            {activeShader === 'pbr' && (
              <>
                <Label>ラフネス</Label>
                <Input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={shaderParams.roughness}
                  onChange={(e) => setShaderParams({
                    ...shaderParams,
                    roughness: parseFloat(e.target.value)
                  })}
                  className="w-full"
                />

                <Label>メタルネス</Label>
                <Input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={shaderParams.metalness}
                  onChange={(e) => setShaderParams({
                    ...shaderParams,
                    metalness: parseFloat(e.target.value)
                  })}
                  className="w-full"
                />
              </>
            )}

            {activeShader === 'toon' && (
              <>
                <Label>トゥーンステップ数</Label>
                <Input
                  type="number"
                  min="2"
                  max="8"
                  value={shaderParams.toonSteps}
                  onChange={(e) => setShaderParams({
                    ...shaderParams,
                    toonSteps: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
              </>
            )}

            {activeShader === 'outline' && (
              <>
                <Label>アウトライン幅</Label>
                <Input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={shaderParams.outlineWidth}
                  onChange={(e) => setShaderParams({
                    ...shaderParams,
                    outlineWidth: parseFloat(e.target.value)
                  })}
                  className="w-full"
                />
              </>
            )}
          </div>
        </Tabs>

        <div className="mt-6">
          <Button 
            onClick={() => console.log('シェーダーを再コンパイル')}
            className="bg-[#4a4a4a] hover:bg-[#5a5a5a]"
          >
            シェーダーを再読み込み
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShaderManager;