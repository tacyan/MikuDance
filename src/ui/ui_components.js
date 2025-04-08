/**
 * @fileoverview UIコンポーネントライブラリ
 * @description アプリケーション全体で使用するUIコンポーネント
 */

import React from 'react';

/**
 * カードコンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {React.ReactNode} props.children - 子要素
 * @param {string} props.className - 追加のクラス名
 * @returns {React.ReactElement} カードコンポーネント
 */
export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`rounded-lg shadow-md overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * カードヘッダーコンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {React.ReactNode} props.children - 子要素
 * @param {string} props.className - 追加のクラス名
 * @returns {React.ReactElement} カードヘッダーコンポーネント
 */
export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-4 border-b ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * カードタイトルコンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {React.ReactNode} props.children - 子要素
 * @param {string} props.className - 追加のクラス名
 * @returns {React.ReactElement} カードタイトルコンポーネント
 */
export const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 className={`text-xl font-bold ${className}`} {...props}>
      {children}
    </h3>
  );
};

/**
 * カード説明コンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {React.ReactNode} props.children - 子要素
 * @param {string} props.className - 追加のクラス名
 * @returns {React.ReactElement} カード説明コンポーネント
 */
export const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={`text-sm text-gray-500 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
};

/**
 * カードコンテンツコンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {React.ReactNode} props.children - 子要素
 * @param {string} props.className - 追加のクラス名
 * @returns {React.ReactElement} カードコンテンツコンポーネント
 */
export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * セパレーターコンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {string} props.className - 追加のクラス名
 * @returns {React.ReactElement} セパレーターコンポーネント
 */
export const Separator = ({ className = '', ...props }) => {
  return (
    <hr className={`border-t my-2 ${className}`} {...props} />
  );
};

const MainInterface = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4">
      <Card className="w-full bg-card">
        <CardHeader className="bg-card">
          <CardTitle className="text-xl font-bold bg-card">メインユーザーインターフェース</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400 bg-card">
            アプリケーション全体のレイアウト、各種パネル配置と管理を行います。
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-card space-y-4">
          <div className="mb-4 bg-card">
            <h2 className="text-lg font-semibold mb-2 bg-card">メインメニュー</h2>
            {/* メインメニューのコンテンツをここに配置 */}
            <p className="text-gray-700 dark:text-gray-300 bg-card">
              メインメニューは、ファイル操作、編集、設定などのアプリケーションの主要な機能にアクセスするためのメニューバーです。
            </p>
          </div>

          <Separator className="bg-gray-200 dark:bg-gray-700" />

          <div className="mb-4 bg-card">
            <h2 className="text-lg font-semibold mb-2 bg-card">ツールバー</h2>
            {/* ツールバーのコンテンツをここに配置 */}
            <p className="text-gray-700 dark:text-gray-300 bg-card">
              ツールバーは、頻繁に使用する機能へのショートカットを提供するアイコンベースのインターフェースです。
            </p>
          </div>

          <Separator className="bg-gray-200 dark:bg-gray-700" />

          <div className="mb-4 bg-card">
            <h2 className="text-lg font-semibold mb-2 bg-card">ステータスバー</h2>
            {/* ステータスバーのコンテンツをここに配置 */}
            <p className="text-gray-700 dark:text-gray-300 bg-card">
              ステータスバーは、アプリケーションの状態、進行状況、エラーメッセージなどの情報を表示します。
            </p>
          </div>

          <Separator className="bg-gray-200 dark:bg-gray-700" />

          <div className="mb-4 bg-card">
            <h2 className="text-lg font-semibold mb-2 bg-card">コンテキストメニュー</h2>
            {/* コンテキストメニューのコンテンツをここに配置 */}
            <p className="text-gray-700 dark:text-gray-300 bg-card">
              コンテキストメニューは、右クリックで表示されるメニューで、選択された要素に特有の操作を提供します。
            </p>
          </div>

          <Separator className="bg-gray-200 dark:bg-gray-700" />

          <div className="mb-4 bg-card">
            <h2 className="text-lg font-semibold mb-2 bg-card">モーダルダイアログ</h2>
            {/* モーダルダイアログのコンテンツをここに配置 */}
            <p className="text-gray-700 dark:text-gray-300 bg-card">
              モーダルダイアログは、ユーザーに重要な情報を提供したり、特定のアクションを要求したりするために、メインウィンドウの上に表示されるダイアログボックスです。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MainInterface;
