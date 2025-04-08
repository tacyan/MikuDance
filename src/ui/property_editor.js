import React, { useState } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from 'components/ui/ui_components';

const PropertyEditor: React.FC = () => {
  const [propertyName, setPropertyName] = useState('');
  const [propertyValue, setPropertyValue] = useState('');

  return (
    <Card className="w-full bg-card">
      <CardHeader className="bg-card">
        <CardTitle className="bg-card">プロパティエディター</CardTitle>
        <CardDescription className="bg-card">モデル/アニメーション属性を編集します。</CardDescription>
      </CardHeader>
      <CardContent className="bg-card">
        <div className="grid gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              プロパティ名
            </Label>
            <Input id="name" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">
              値
            </Label>
            <Input id="value" value={propertyValue} onChange={(e) => setPropertyValue(e.target.value)} className="col-span-3" />
          </div>
          <div className="flex justify-end">
            <Button>更新</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default PropertyEditor;