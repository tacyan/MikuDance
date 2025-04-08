import React, { useState } from 'react';

const TimelineEditor: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedTrack, setSelectedTrack] = useState('track1');
  const [keyframes, setKeyframes] = useState([
    { time: 0, track: 'track1', value: 0 },
    { time: 10, track: 'track1', value: 1 },
    { time: 5, track: 'track2', value: 0.5 },
  ]);

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(parseFloat(event.target.value));
  };

  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setZoomLevel(parseFloat(event.target.value));
  };

  const handleTrackChange = (trackName: string) => {
    setSelectedTrack(trackName);
  };

  return (
    <Card className="w-full bg-card">
      <CardHeader className="bg-card">
        <CardTitle className="bg-card">タイムラインエディター</CardTitle>
        <CardDescription className="bg-card">ダンスモーションの時系列編集を行います。</CardDescription>
      </CardHeader>
      <CardContent className="bg-card">
        <div className="flex flex-col space-y-4">
          {/* タイムコントロール */}
          <div className="flex items-center space-x-4">
            <Label htmlFor="currentTime" className="text-sm font-medium">
              時間:
            </Label>
            <Input
              type="number"
              id="currentTime"
              value={currentTime}
              onChange={handleTimeChange}
              className="w-24 text-sm"
            />
            <Button variant="outline" size="sm">
              再生
            </Button>
            <Button variant="outline" size="sm">
              停止
            </Button>
          </div>

          {/* タイムラインウィジェット (簡易的な表示) */}
          <div className="border p-2 rounded-md bg-white dark:bg-gray-700">
            <div className="relative h-10 bg-gray-200 dark:bg-gray-600 rounded-md">
              <div
                className="absolute top-0 left-0 h-full bg-accent"
                style={{ width: `${currentTime * 10}%` }} // 簡易的な時間表示
              ></div>
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm">
                タイムライン (簡易表示)
              </div>
            </div>
          </div>

          {/* ズームコントロール */}
          <div className="flex items-center space-x-4">
            <Label htmlFor="zoomLevel" className="text-sm font-medium">
              ズーム:
            </Label>
            <Input
              type="range"
              id="zoomLevel"
              min="0.1"
              max="2"
              step="0.1"
              value={zoomLevel}
              onChange={handleZoomChange}
              className="w-48"
            />
            <span className="text-sm">{zoomLevel}x</span>
          </div>

          {/* トラック管理パネル */}
          <div>
            <Tabs defaultValue="track1" className="w-full">
              <TabsList>
                <TabsTrigger value="track1" onClick={() => handleTrackChange('track1')}>
                  トラック 1
                </TabsTrigger>
                <TabsTrigger value="track2" onClick={() => handleTrackChange('track2')}>
                  トラック 2
                </TabsTrigger>
                <TabsTrigger value="track3" onClick={() => handleTrackChange('track3')}>
                  トラック 3
                </TabsTrigger>
              </TabsList>
              <TabsContent value="track1">
                <div>トラック 1 のコンテンツ (キーフレームリストなど)</div>
              </TabsContent>
              <TabsContent value="track2">
                <div>トラック 2 のコンテンツ (キーフレームリストなど)</div>
              </TabsContent>
              <TabsContent value="track3">
                <div>トラック 3 のコンテンツ (キーフレームリストなど)</div>
              </TabsContent>
            </Tabs>
          </div>

          {/* プロパティエディタ (プレースホルダー) */}
          <div className="border p-2 rounded-md bg-white dark:bg-gray-700">
            <div className="text-sm font-medium mb-2">プロパティエディタ (選択中のキーフレーム)</div>
            <div>
              {/* プロパティ編集UIをここに配置 (例: Input, ColorPicker) */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                プロパティを選択して編集
              </p>
            </div>
          </div>

          {/* キーフレームセレクター (簡易的なボタン) */}
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              キーフレーム追加
            </Button>
            <Button variant="outline" size="sm">
              キーフレーム削除
            </Button>
            <Button variant="outline" size="sm">
              キーフレーム編集
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default TimelineEditor;