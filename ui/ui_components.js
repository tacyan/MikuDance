import React, { useState } from 'react';

const UIComponents: React.FC = () => {
  const [sliderValue, setSliderValue] = useState(50);
  const [color, setColor] = useState('#ffffff');
  const [treeData, setTreeData] = useState([
    {
      label: '親ノード1',
      children: [
        { label: '子ノード1-1' },
        { label: '子ノード1-2' },
      ],
    },
    { label: '親ノード2' },
  ]);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(parseInt(event.target.value));
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4">
      <Card className="w-full bg-card mb-4">
        <CardHeader className="bg-card">
          <CardTitle className="bg-card">スライダー</CardTitle>
          <CardDescription className="bg-card">値を調整するためのスライダーコンポーネント。</CardDescription>
        </CardHeader>
        <CardContent className="bg-card">
          <Label htmlFor="slider" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            値: {sliderValue}
          </Label>
          <Input
            type="range"
            id="slider"
            min="0"
            max="100"
            value={sliderValue}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </CardContent>
      </Card>

      <Card className="w-full bg-card mb-4">
        <CardHeader className="bg-card">
          <CardTitle className="bg-card">カラーピッカー</CardTitle>
          <CardDescription className="bg-card">色を選択するためのカラーピッカーコンポーネント。</CardDescription>
        </CardHeader>
        <CardContent className="bg-card">
          <Label htmlFor="colorPicker" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            色: {color}
          </Label>
          <Input
            type="color"
            id="colorPicker"
            value={color}
            onChange={handleColorChange}
            className="w-full h-10 appearance-none cursor-pointer"
          />
          <div className="w-full h-10" style={{ backgroundColor: color }}></div>
        </CardContent>
      </Card>

      <Card className="w-full bg-card mb-4">
        <CardHeader className="bg-card">
          <CardTitle className="bg-card">ツリービュー</CardTitle>
          <CardDescription className="bg-card">階層構造を表示するツリービューコンポーネント。</CardDescription>
        </CardHeader>
        <CardContent className="bg-card">
          <ul>
            {treeData.map((node, index) => (
              <li key={index}>
                {node.label}
                {node.children && (
                  <ul>
                    {node.children.map((child, childIndex) => (
                      <li key={childIndex}>{child.label}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
export default UIComponents;
