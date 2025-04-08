/**
 * @fileoverview モーションコントローラー
 * @description PMXモデルのダンスモーションを制御するモジュール
 */

/**
 * ダンスモーションを制御するクラス
 * @class
 */
export class MotionController {
  /**
   * コンストラクタ
   */
  constructor() {
    this.currentAnimation = null;
    this.animationData = {};
    this.isPlaying = false;
    this.currentFrame = 0;
    this.frameRate = 30;
    this.lastFrameTime = 0;
    this.loop = true;
    this.modelManager = null;
    this.frameUpdateCallback = null;
    
    // デモ用のダンスモーションを初期化
    this._initializeDemoMotions();
  }

  /**
   * モデルマネージャーを設定
   * @param {ModelManager} manager - モデルマネージャーインスタンス
   */
  setModelManager(manager) {
    this.modelManager = manager;
  }

  /**
   * フレーム更新コールバックを設定
   * @param {Function} callback - フレーム更新時に呼び出されるコールバック関数
   */
  setFrameUpdateCallback(callback) {
    this.frameUpdateCallback = callback;
  }

  /**
   * ダンスモーションを再生
   */
  play() {
    if (!this.currentAnimation) {
      console.error('アニメーションが設定されていません');
      return;
    }
    
    this.isPlaying = true;
    this.lastFrameTime = performance.now();
    
    // アニメーションIDを取得
    const animationId = this.currentAnimation ? this.currentAnimation.id : 'unknown';
    
    console.log(`ダンスモーション「${animationId}」を再生します`, {
      frameCount: this.currentAnimation.frameCount,
      currentFrame: this.currentFrame
    });
    
    // アニメーションループの開始
    this._animationLoop();
  }

  /**
   * ダンスモーションを一時停止
   */
  pause() {
    this.isPlaying = false;
    console.log('ダンスモーションを一時停止しました');
  }

  /**
   * ダンスモーションを停止（最初のフレームに戻る）
   */
  stop() {
    this.isPlaying = false;
    this.currentFrame = 0;
    
    if (this.modelManager) {
      this._applyFrameToModel(0);
    }
    
    console.log('ダンスモーションを停止しました');
  }

  /**
   * アニメーションを設定
   * @param {string} danceId - ダンスのID
   * @returns {boolean} 成功したかどうか
   */
  setAnimation(danceId) {
    if (!this.animationData[danceId]) {
      console.error(`ダンス「${danceId}」が見つかりません`);
      return false;
    }
    
    this.currentAnimation = {
      id: danceId,
      ...this.animationData[danceId]
    };
    
    // フレームを最初からスタート
    this.currentFrame = 0;
    this.frameTime = 0;
    
    console.log(`アニメーション「${danceId}」を設定しました`, {
      animation: this.currentAnimation
    });
    
    return true;
  }

  /**
   * 利用可能なダンスモーションのリストを取得
   * @returns {Array} ダンスモーションのリスト
   */
  getAvailableDances() {
    const dances = [];
    
    for (const id in this.animationData) {
      dances.push({
        id: id,
        name: this.animationData[id].name,
        category: this.animationData[id].category,
        frameCount: this.animationData[id].frameCount
      });
    }
    
    return dances;
  }

  /**
   * フレームレートを設定
   * @param {number} fps - フレームレート（FPS）
   */
  setFrameRate(fps) {
    this.frameRate = fps;
  }

  /**
   * ループ再生を設定
   * @param {boolean} loop - ループ再生するかどうか
   */
  setLoop(loop) {
    this.loop = loop;
  }

  /**
   * 現在のフレームを設定
   * @param {number} frame - フレーム番号
   */
  setCurrentFrame(frame) {
    if (!this.currentAnimation) return;
    
    const animation = this.animationData[this.currentAnimation];
    if (!animation) return;
    
    // フレーム範囲をチェック
    const frameIndex = Math.max(0, Math.min(frame, animation.frameCount - 1));
    this.currentFrame = frameIndex;
    
    // モデルに適用
    if (this.modelManager) {
      this._applyFrameToModel(frameIndex);
    }
  }

  /**
   * アニメーションループ
   * @private
   */
  _animationLoop() {
    if (!this.isPlaying) return;
    
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;
    
    // フレームを進める（30FPSを想定）
    this.frameTime += deltaTime;
    if (this.frameTime >= 33.33) { // 約30FPS
      const frameAdvance = Math.floor(this.frameTime / 33.33);
      this.currentFrame = (this.currentFrame + frameAdvance) % this.currentAnimation.frameCount;
      this.frameTime %= 33.33;
      
      // 10フレームごとにログ出力
      if (this.currentFrame % 10 === 0) {
        console.log(`ダンスアニメーション実行中 - フレーム: ${this.currentFrame}/${this.currentAnimation.frameCount}`);
      }
      
      // ボーンの姿勢を更新
      this._updateBonePoses();
    }
    
    // 次のフレームをリクエスト
    this.animationFrameId = requestAnimationFrame(() => this._animationLoop());
  }

  /**
   * ボーンの姿勢を更新
   * @private
   */
  _updateBonePoses() {
    if (!this.modelManager || !this.currentAnimation) return;
    
    const frameData = this._generateFrameData(this.currentFrame, this.currentAnimation);
    
    try {
      // モデルのボーンに姿勢を適用
      for (const boneName in frameData.bones) {
        const boneData = frameData.bones[boneName];
        
        // ModelManagerのボーン操作メソッドを呼び出す
        if (typeof this.modelManager.setBonePose === 'function') {
          this.modelManager.setBonePose(
            boneName,
            boneData.position,
            boneData.rotation,
            this.modelManager.activeModelId
          );
        }
      }
      
      // モーフの適用（表情変化など）
      for (const morphName in frameData.morphs) {
        const weight = frameData.morphs[morphName];
        
        // ModelManagerのモーフ操作メソッドを呼び出す
        if (typeof this.modelManager.setMorphWeight === 'function') {
          this.modelManager.setMorphWeight(
            morphName,
            weight,
            this.modelManager.activeModelId
          );
        }
      }
      
      // 表示を更新
      if (typeof this.modelManager.updateModel === 'function') {
        this.modelManager.updateModel();
      }
    } catch (error) {
      console.error('ボーンの姿勢更新中にエラーが発生しました:', error);
    }
  }

  /**
   * フレームデータをモデルに適用
   * @param {number} frameIndex - フレーム番号
   * @private
   */
  _applyFrameToModel(frameIndex) {
    if (!this.currentAnimation || !this.modelManager) return;
    
    const animation = this.animationData[this.currentAnimation];
    if (!animation) return;
    
    // フレームデータを取得
    const frameData = this._generateFrameData(frameIndex, animation);
    
    // ボーンポーズを適用
    if (frameData.bones) {
      for (const boneId in frameData.bones) {
        const pose = frameData.bones[boneId];
        this.modelManager.setBonePose(boneId, pose.position, pose.rotation);
      }
    }
    
    // モーフを適用
    if (frameData.morphs) {
      for (const morphId in frameData.morphs) {
        const weight = frameData.morphs[morphId];
        this.modelManager.setMorphWeight(morphId, weight);
      }
    }
  }

  /**
   * フレームデータを生成
   * @param {number} frameIndex - フレーム番号
   * @param {Object} animation - アニメーションデータ
   * @returns {Object} フレームデータ
   * @private
   */
  _generateFrameData(frameIndex, animation) {
    // 実際のVMDファイルからフレームデータを生成する代わりに、
    // 簡易的なダンスモーションをシミュレート
    const frameData = {
      bones: {},
      morphs: {}
    };
    
    // アニメーションタイプに基づいて動きを生成
    const t = frameIndex / animation.frameCount;
    const phase = t * Math.PI * 2;
    
    // 基本的なダンスモーションをシミュレート
    switch (animation.type) {
      case 'wave':
        // 波のような動き
        this._generateWaveDance(frameData, phase, t);
        break;
      
      case 'twist':
        // ねじれるような動き
        this._generateTwistDance(frameData, phase, t);
        break;
      
      case 'hop':
        // ホップするような動き
        this._generateHopDance(frameData, phase, t);
        break;
      
      case 'spin':
        // 回転するような動き
        this._generateSpinDance(frameData, phase, t);
        break;
      
      default:
        // デフォルトの動き
        this._generateDefaultDance(frameData, phase, t);
        break;
    }
    
    return frameData;
  }

  /**
   * 波のようなダンスモーションを生成
   * @param {Object} frameData - フレームデータ
   * @param {number} phase - 位相（ラジアン）
   * @param {number} t - 正規化された時間（0～1）
   * @private
   */
  _generateWaveDance(frameData, phase, t) {
    // 体の動き
    frameData.bones['センター'] = {
      position: [Math.sin(phase) * 2, Math.abs(Math.sin(phase * 0.5)) * 1 + 8, 0],
      rotation: [0, Math.sin(phase * 0.5) * 0.1, 0]
    };
    
    frameData.bones['上半身'] = {
      position: [0, 0, 0],
      rotation: [Math.sin(phase) * 0.1, Math.sin(phase * 0.7) * 0.1, Math.sin(phase * 1.3) * 0.1]
    };
    
    frameData.bones['頭'] = {
      position: [0, 0, 0],
      rotation: [Math.sin(phase * 0.8) * 0.15, Math.sin(phase * 0.6) * 0.1, 0]
    };
    
    // 腕の動き
    frameData.bones['左腕'] = {
      position: [0, 0, 0],
      rotation: [Math.sin(phase) * 0.2 + 0.3, Math.sin(phase * 1.2) * 0.2, Math.sin(phase * 0.8) * 0.5 + 0.2]
    };
    
    frameData.bones['右腕'] = {
      position: [0, 0, 0],
      rotation: [Math.sin(phase + Math.PI) * 0.2 + 0.3, Math.sin(phase * 1.2 + Math.PI) * 0.2, Math.sin(phase * 0.8 + Math.PI) * 0.5 - 0.2]
    };
    
    // 足の動き
    frameData.bones['左足'] = {
      position: [0, 0, 0],
      rotation: [Math.sin(phase) * 0.1, 0, Math.sin(phase * 0.9) * 0.1]
    };
    
    frameData.bones['右足'] = {
      position: [0, 0, 0],
      rotation: [Math.sin(phase + Math.PI) * 0.1, 0, Math.sin(phase * 0.9 + Math.PI) * 0.1]
    };
    
    // 表情
    frameData.morphs['笑顔'] = Math.sin(phase * 0.5) * 0.5 + 0.5;
    frameData.morphs['まばたき'] = Math.pow(Math.sin(phase * 0.1 + 1), 12);
  }

  /**
   * ねじれるようなダンスモーションを生成
   * @param {Object} frameData - フレームデータ
   * @param {number} phase - 位相（ラジアン）
   * @param {number} t - 正規化された時間（0～1）
   * @private
   */
  _generateTwistDance(frameData, phase, t) {
    // 体のねじれ
    frameData.bones['センター'] = {
      position: [Math.sin(phase * 2) * 1, Math.abs(Math.sin(phase)) * 0.5 + 8, 0],
      rotation: [0, Math.sin(phase) * 0.3, 0]
    };
    
    frameData.bones['上半身'] = {
      position: [0, 0, 0],
      rotation: [0, Math.sin(phase) * 0.2, Math.sin(phase * 2) * 0.05]
    };
    
    frameData.bones['下半身'] = {
      position: [0, 0, 0],
      rotation: [0, Math.sin(phase + Math.PI) * 0.15, 0]
    };
    
    frameData.bones['頭'] = {
      position: [0, 0, 0],
      rotation: [Math.sin(phase * 0.7) * 0.1, Math.sin(phase * 1.5) * 0.1, Math.sin(phase * 0.5) * 0.05]
    };
    
    // 腕を広げる動き
    frameData.bones['左腕'] = {
      position: [0, 0, 0],
      rotation: [Math.sin(phase) * 0.3 + 0.4, Math.sin(phase * 0.8) * 0.2, Math.sin(phase * 1.2) * 0.4 + 0.3]
    };
    
    frameData.bones['右腕'] = {
      position: [0, 0, 0],
      rotation: [Math.sin(phase + Math.PI) * 0.3 + 0.4, Math.sin(phase * 0.8 + Math.PI) * 0.2, Math.sin(phase * 1.2 + Math.PI) * 0.4 - 0.3]
    };
    
    // 膝の曲げ伸ばし
    frameData.bones['左ひざ'] = {
      position: [0, 0, 0],
      rotation: [Math.max(0, Math.sin(phase)) * 0.3, 0, 0]
    };
    
    frameData.bones['右ひざ'] = {
      position: [0, 0, 0],
      rotation: [Math.max(0, Math.sin(phase + Math.PI)) * 0.3, 0, 0]
    };
    
    // 表情
    frameData.morphs['笑顔'] = 0.8;
    frameData.morphs['ウィンク'] = Math.pow(Math.sin(phase * 0.2 + 2), 20);
  }

  /**
   * ホップするようなダンスモーションを生成
   * @param {Object} frameData - フレームデータ
   * @param {number} phase - 位相（ラジアン）
   * @param {number} t - 正規化された時間（0～1）
   * @private
   */
  _generateHopDance(frameData, phase, t) {
    // ジャンプするような動き
    const jump = Math.max(0, Math.sin(phase));
    
    frameData.bones['センター'] = {
      position: [0, jump * 3 + 8, 0],
      rotation: [0, Math.sin(phase * 0.7) * 0.1, 0]
    };
    
    // 体をやや前傾させる
    frameData.bones['上半身'] = {
      position: [0, 0, 0],
      rotation: [Math.sin(phase * 0.5) * 0.05 + 0.05, 0, 0]
    };
    
    // 頭を少し動かす
    frameData.bones['頭'] = {
      position: [0, 0, 0],
      rotation: [-Math.sin(phase) * 0.05, Math.sin(phase * 2) * 0.1, 0]
    };
    
    // 腕を振る動き
    frameData.bones['左腕'] = {
      position: [0, 0, 0],
      rotation: [-Math.sin(phase) * 0.2 - 0.1, 0, Math.sin(phase) * 0.3 + 0.3]
    };
    
    frameData.bones['右腕'] = {
      position: [0, 0, 0],
      rotation: [-Math.sin(phase) * 0.2 - 0.1, 0, Math.sin(phase) * 0.3 - 0.3]
    };
    
    // 膝の曲げ伸ばし
    const kneeAngle = Math.sin(phase + Math.PI * 1.5) * 0.4;
    
    frameData.bones['左ひざ'] = {
      position: [0, 0, 0],
      rotation: [Math.max(0, kneeAngle), 0, 0]
    };
    
    frameData.bones['右ひざ'] = {
      position: [0, 0, 0],
      rotation: [Math.max(0, kneeAngle), 0, 0]
    };
    
    // 表情
    frameData.morphs['笑顔'] = 1.0;
    frameData.morphs['まばたき'] = Math.pow(Math.sin(phase * 0.1 + 3), 12);
  }

  /**
   * 回転するようなダンスモーションを生成
   * @param {Object} frameData - フレームデータ
   * @param {number} phase - 位相（ラジアン）
   * @param {number} t - 正規化された時間（0～1）
   * @private
   */
  _generateSpinDance(frameData, phase, t) {
    // 体を回転させる
    const spinPhase = phase * 4;
    const spinAmount = Math.sin(spinPhase) * 2 * Math.PI;
    
    frameData.bones['センター'] = {
      position: [Math.sin(spinPhase) * 3, Math.abs(Math.sin(phase * 0.5)) * 1 + 8, Math.cos(spinPhase) * 3],
      rotation: [0, spinAmount, 0]
    };
    
    // 遠心力による体の傾き
    frameData.bones['上半身'] = {
      position: [0, 0, 0],
      rotation: [0, 0, -Math.sin(spinPhase) * 0.2]
    };
    
    frameData.bones['頭'] = {
      position: [0, 0, 0],
      rotation: [Math.sin(phase * 0.5) * 0.1, 0, -Math.sin(spinPhase) * 0.1]
    };
    
    // 腕を広げる
    frameData.bones['左腕'] = {
      position: [0, 0, 0],
      rotation: [0, 0, Math.sin(phase * 0.5) * 0.2 + 0.8]
    };
    
    frameData.bones['右腕'] = {
      position: [0, 0, 0],
      rotation: [0, 0, Math.sin(phase * 0.5) * 0.2 - 0.8]
    };
    
    // 足の動き
    frameData.bones['左足'] = {
      position: [0, 0, 0],
      rotation: [Math.sin(phase) * 0.2, 0, 0]
    };
    
    frameData.bones['右足'] = {
      position: [0, 0, 0],
      rotation: [Math.sin(phase + Math.PI) * 0.2, 0, 0]
    };
    
    // 表情
    frameData.morphs['驚き'] = Math.sin(spinPhase) * 0.3 + 0.3;
    frameData.morphs['笑顔'] = Math.cos(spinPhase) * 0.3 + 0.3;
    frameData.morphs['まばたき'] = Math.pow(Math.sin(phase * 0.05 + 5), 20);
  }

  /**
   * デフォルトのダンスモーションを生成
   * @param {Object} frameData - フレームデータ
   * @param {number} phase - 位相（ラジアン）
   * @param {number} t - 正規化された時間（0～1）
   * @private
   */
  _generateDefaultDance(frameData, phase, t) {
    // 軽い上下運動とウェーブ
    frameData.bones['センター'] = {
      position: [Math.sin(phase) * 1, Math.sin(phase * 2) * 0.5 + 8, 0],
      rotation: [0, Math.sin(phase) * 0.05, 0]
    };
    
    frameData.bones['上半身'] = {
      position: [0, 0, 0],
      rotation: [Math.sin(phase * 0.5) * 0.05, Math.sin(phase) * 0.05, Math.sin(phase * 0.7) * 0.03]
    };
    
    frameData.bones['頭'] = {
      position: [0, 0, 0],
      rotation: [Math.sin(phase * 0.6) * 0.1, Math.sin(phase * 0.5) * 0.1, 0]
    };
    
    // 腕を振る
    frameData.bones['左腕'] = {
      position: [0, 0, 0],
      rotation: [Math.sin(phase) * 0.2, 0, Math.sin(phase) * 0.1 + 0.2]
    };
    
    frameData.bones['右腕'] = {
      position: [0, 0, 0],
      rotation: [Math.sin(phase + Math.PI) * 0.2, 0, Math.sin(phase + Math.PI) * 0.1 - 0.2]
    };
    
    // 足踏み
    frameData.bones['左足'] = {
      position: [0, 0, 0],
      rotation: [Math.max(0, Math.sin(phase)) * 0.1, 0, 0]
    };
    
    frameData.bones['右足'] = {
      position: [0, 0, 0],
      rotation: [Math.max(0, Math.sin(phase + Math.PI)) * 0.1, 0, 0]
    };
    
    // 表情
    frameData.morphs['笑顔'] = Math.sin(phase * 0.25) * 0.3 + 0.7;
    frameData.morphs['まばたき'] = Math.pow(Math.sin(phase * 0.1), 12);
  }

  /**
   * デモ用のダンスモーションを初期化
   * @private
   */
  _initializeDemoMotions() {
    this.animationData = {
      'wave_dance': {
        name: 'ウェーブダンス',
        category: 'ポップ',
        type: 'wave',
        frameCount: 120
      },
      'twist_dance': {
        name: 'ツイストダンス',
        category: 'ポップ',
        type: 'twist',
        frameCount: 90
      },
      'hop_dance': {
        name: 'ホップダンス',
        category: 'アップテンポ',
        type: 'hop',
        frameCount: 60
      },
      'spin_dance': {
        name: 'スピンダンス',
        category: 'アクロバット',
        type: 'spin',
        frameCount: 180
      },
      'default_dance': {
        name: 'デフォルトダンス',
        category: '基本',
        type: 'default',
        frameCount: 120
      }
    };
    
    // デフォルトのダンスを設定
    this.setAnimation('wave_dance');
  }
}