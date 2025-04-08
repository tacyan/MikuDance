/**
 * @fileoverview メインアプリケーションコンポーネント
 * @description アプリケーションのメインコンテナコンポーネント
 */

import React from 'react';
import AppCore from './core/app_core';

/**
 * アプリケーションのメインコンポーネント
 * @returns {React.ReactElement} アプリケーションのルートコンポーネント
 */
const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="container mx-auto max-w-6xl">
        <AppCore />
      </div>
    </div>
  );
};

export default App; 