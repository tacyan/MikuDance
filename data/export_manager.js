import React, { useState, useRef } from 'react';
import { WebGLRenderer } from 'three';

const ExportManager: React.FC = () => {
  const [exportFormat, setExportFormat] = useState('webm');
  const [resolution, setResolution] = useState({ width: 1920, height: 1080 });
  const [frameRate, setFrameRate] = useState(30);
  const [progress, setProgress] = useState(0);
  const rendererRef = useRef<WebGLRenderer | null>(null);

  const exportOptions = {
    video: ['webm', 'mp4', 'gif'],
    image: ['png', 'jpeg', 'webp'],
    motion: ['vmd', 'bvh']
  };

  const handleExport = async () => {
    if (!rendererRef.current) return;

    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 100));
    }, 500);

    try {
      await processExport();
    } finally {
      clearInterval(progressInterval);
      setProgress(100);
    }
  };

  const processExport = async () => {
    // エクスポート処理の実装
  };

  return (
    <Card className="w-full bg-[#ffffff] dark:bg-[#1a1a1a]">
      <CardHeader>
        <CardTitle className="text-[#000000] dark:text-[#ffffff]">エクスポート設定</CardTitle>
        <CardDescription className="text-[#666666] dark:text-[#cccccc]">
          出力フォーマットと設定を選択してください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label className="text-[#000000] dark:text-[#ffffff]">出力形式</Label>
            <Tabs defaultValue="video" className="mt-2">
              <TabsList>
                <TabsTrigger value="video">動画</TabsTrigger>
                <TabsTrigger value="image">画像</TabsTrigger>
                <TabsTrigger value="motion">モーション</TabsTrigger>
              </TabsList>
              <TabsContent value="video">
                <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
                  {exportOptions.video.map(format => (
                    <div key={format} className="flex items-center space-x-2">
                      <RadioGroupItem value={format} id={format} />
                      <Label htmlFor={format} className="uppercase">{format}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </TabsContent>
              {/* 他のTabsContent省略 */}
            </Tabs>
          </div>

          <div className="space-y-4">
            <div>
              <Label>解像度</Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  value={resolution.width}
                  onChange={e => setResolution(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                />
                <span className="text-[#000000] dark:text-[#ffffff]">×</span>
                <Input
                  type="number"
                  value={resolution.height}
                  onChange={e => setResolution(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label>フレームレート</Label>
              <Input
                type="number"
                value={frameRate}
                onChange={e => setFrameRate(parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[#000000] dark:text-[#ffffff]">進行状況</span>
              <span className="text-[#000000] dark:text-[#ffffff]">{progress}%</span>
            </div>
            <div className="w-full bg-[#f0f0f0] dark:bg-[#333333] rounded-full h-2">
              <div
                className="bg-[#4a90e2] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Button
            onClick={handleExport}
            className="w-full bg-[#4a90e2] hover:bg-[#357abd] text-white"
          >
            エクスポート開始
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportManager;