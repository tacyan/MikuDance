import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Input,
  Label,
  Separator,
  Button,
} from 'src/components/ui/shadcn';

const ModelManager: React.FC = () => {
  const [models, setModels] = useState([
    { id: 1, name: '初音ミク', visible: true, scale: 1.0 },
    { id: 2, name: '巡音ルカ', visible: false, scale: 0.8 },
  ]);
  const [selectedModelId, setSelectedModelId] = useState(1);
  const [scale, setScale] = useState(1.0);

  const selectedModel = models.find((model) => model.id === selectedModelId);

  const handleModelChange = (id: number) => {
    setSelectedModelId(id);
    setScale(models.find((model) => model.id === id)?.scale || 1.0);
  };

  const handleVisibilityChange = (id: number, visible: boolean) => {
    setModels((prevModels) =>
      prevModels.map((model) =>
        model.id === id ? { ...model, visible: visible } : model
      )
    );
  };

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
    setModels((prevModels) =>
      prevModels.map((model) =>
        model.id === selectedModelId ? { ...model, scale: newScale } : model
      )
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 flex justify-center">
      <Card className="w-full max-w-2xl bg-card">
        <CardHeader className="bg-card">
          <CardTitle className="text-2xl font-bold bg-card">モデル管理システム</CardTitle>
          <CardDescription className="bg-card">
            複数PMXモデルの管理、モデル切り替え、プロパティ編集など
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-card">
          <Tabs defaultValue="models" className="bg-card">
            <TabsList className="bg-card">
              <TabsTrigger value="models" className="bg-card">
                モデルリスト
              </TabsTrigger>
              <TabsTrigger value="properties" className="bg-card">
                プロパティ
              </TabsTrigger>
            </TabsList>
            <TabsContent value="models" className="bg-card">
              <ul className="bg-card">
                {models.map((model) => (
                  <li key={model.id} className="py-2 bg-card">
                    <Button
                      variant={selectedModelId === model.id ? 'secondary' : 'outline'}
                      onClick={() => handleModelChange(model.id)}
                      className="w-full justify-start bg-card"
                    >
                      {model.name}
                    </Button>
                    <div className="mt-2 bg-card">
                      <Label htmlFor={`visibility-${model.id}`} className="inline-flex items-center bg-card">
                        <Input
                          type="checkbox"
                          id={`visibility-${model.id}`}
                          checked={model.visible}
                          onChange={(e) => handleVisibilityChange(model.id, e.target.checked)}
                          className="mr-2 bg-card"
                        />
                        表示
                      </Label>
                    </div>
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="properties" className="bg-card">
              {selectedModel && (
                <div className="bg-card">
                  <div className="mb-4 bg-card">
                    <Label htmlFor="scale" className="block text-sm font-medium text-gray-700 dark:text-gray-300 bg-card">
                      スケール
                    </Label>
                    <Input
                      type="number"
                      id="scale"
                      value={scale}
                      onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                      className="mt-1 bg-card"
                    />
                  </div>
                  <Separator className="bg-card" />
                  <div className="mt-4 bg-card">
                    <h3 className="text-lg font-semibold mb-2 bg-card">モデル状態</h3>
                    <p className="bg-card">モデル名: {selectedModel.name}</p>
                    <p className="bg-card">表示: {selectedModel.visible ? 'はい' : 'いいえ'}</p>
                    <p className="bg-card">スケール: {selectedModel.scale}</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelManager;
