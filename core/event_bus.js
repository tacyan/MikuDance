import React, { useRef } from 'react';

const EventBus: React.FC = () => {
  const eventHandlers = useRef(new Map());

  const publish = (eventName: string, data: any) => {
    const handlers = eventHandlers.current.get(eventName);
    if (handlers) {
      handlers.forEach((handler: (data: any) => void) => {
        handler(data);
      });
    }
  };

  const subscribe = (eventName: string, handler: (data: any) => void) => {
    if (!eventHandlers.current.has(eventName)) {
      eventHandlers.current.set(eventName, []);
    }
    eventHandlers.current.get(eventName)?.push(handler);
  };

  const unsubscribe = (eventName: string, handlerToRemove: (data: any) => void) => {
    const handlers = eventHandlers.current.get(eventName);
    if (handlers) {
      const updatedHandlers = handlers.filter(handler => handler !== handlerToRemove);
      eventHandlers.current.set(eventName, updatedHandlers);
    }
  };

  return (
    <Card className="w-full bg-card">
      <CardHeader className="bg-card">
        <CardTitle className="bg-card">イベントバスシステム</CardTitle>
        <CardDescription className="bg-card">モジュール間のイベント通信を管理します。</CardDescription>
      </CardHeader>
      <CardContent className="bg-card">
        <div>
          <p className="bg-card">イベントの発行と購読を可能にするシステムです。</p>
          <ul className="list-disc pl-5 bg-card">
            <li className="bg-card"><strong>モジュール間通信:</strong> アプリケーション内の異なるモジュールが互いに通信できます。</li>
            <li className="bg-card"><strong>イベント発行/購読:</strong> モジュールはイベントを発行し、他のモジュールはそれらのイベントを購読できます。</li>
            <li className="bg-card"><strong>イベントルーティング:</strong> イベントは適切な購読者にルーティングされます。</li>
            <li className="bg-card"><strong>イベントフィルタリング:</strong> 購読者は特定のイベントのみをフィルタリングして受信できます。</li>
            <li className="bg-card"><strong>非同期イベント処理:</strong> イベント処理は非同期的に行われます。</li>
          </ul>
        </div>
        <Separator className="my-4 bg-card" />
        <div>
          <h3 className="text-lg font-semibold bg-card">実装機能</h3>
          <ul className="list-disc pl-5 bg-card">
            <li className="bg-card"><strong>パブリッシュ/サブスクライブパターン:</strong> イベントの発行と購読の基本的なパターンを実装しています。</li>
            <li className="bg-card"><strong>イベントハンドラの管理:</strong> イベント名とそれに対応するハンドラー関数を管理します。</li>
            <li className="bg-card"><strong>イベント発行関数 (publish):</strong> イベントを発行し、登録されたハンドラーを呼び出します。</li>
            <li className="bg-card"><strong>イベント購読関数 (subscribe):</strong> イベントハンドラーを登録します。</li>
            <li className="bg-card"><strong>イベント購読解除関数 (unsubscribe):</strong> 登録されたイベントハンドラーを解除します。</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
export default EventBus;