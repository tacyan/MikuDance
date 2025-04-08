/**
 * @fileoverview アプリケーションエントリーポイント
 * @description Reactアプリケーションのマウントポイント
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Reactアプリケーションをマウント
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />); 