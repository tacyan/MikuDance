/**
 * @fileoverview モデルマネージャー
 * @description PMXモデルの管理と操作を行うモジュール
 */

import { PMXLoader } from './pmx_loader.js';

/**
 * モデル管理クラス
 * @class
 */
export class ModelManager {
  /**
   * コンストラクタ
   */
  constructor() {
    this.pmxLoader = new PMXLoader();
    this.models = {}; // モデルを保持する連想配列
    this.activeModelId = null; // 現在アクティブなモデルID
    this.defaultScale = 1.0;
    this.defaultPosition = [0, 0, 0];
    this.defaultRotation = [0, 0, 0];
    this.renderer = null;
  }

  /**
   * レンダラーを設定
   * @param {WebGLRenderer} renderer - WebGLレンダラー
   */
  setRenderer(renderer) {
    this.renderer = renderer;
  }

  /**
   * サンプルモデルをロードする（デモ用）
   * @returns {Promise<Object>} ロードされたモデルデータ
   */
  async loadSampleModel() {
    try {
      console.log('サンプルモデルを生成します...');
      
      // PMXローダーからサンプルデータを取得
      const dummyArrayBuffer = this.pmxLoader.createSamplePMXData();
      console.log('サンプルPMXデータを生成しました');
      
      // サンプルモデルをロード
      return await this.loadModel(dummyArrayBuffer, 'miku');
    } catch (error) {
      console.error('サンプルモデルのロードに失敗しました:', error);
      throw error;
    }
  }

  /**
   * PMXモデルをロードする
   * @param {string|File} fileOrPath - PMXファイルのパスまたはFileオブジェクト
   * @param {string} [modelId] - モデルID（省略時はファイル名がIDとなる）
   * @returns {Promise<Object>} ロードされたモデルデータ
   */
  async loadModel(fileOrPath, modelId = null) {
    try {
      // ファイル名からIDを生成
      if (!modelId) {
        if (typeof fileOrPath === 'string') {
          const pathParts = fileOrPath.split(/[/\\]/);
          modelId = pathParts[pathParts.length - 1].replace('.pmx', '');
        } else if (fileOrPath instanceof File) {
          modelId = fileOrPath.name.replace('.pmx', '');
        } else {
          modelId = 'model_' + Date.now();
        }
      }
      
      console.log(`モデル「${modelId}」の読み込みを開始します...`);
      
      // PMXモデルを読み込む
      const modelData = await this.pmxLoader.loadModel(fileOrPath);
      
      // モデル情報を保存
      this.models[modelId] = {
        data: modelData,
        position: [...this.defaultPosition],
        rotation: [...this.defaultRotation],
        scale: this.defaultScale,
        visible: true,
        bones: this._createBoneMap(modelData.bones),
        morphs: this._createMorphMap(modelData.morphs || [])
      };
      
      // アクティブモデルに設定
      this.activeModelId = modelId;
      
      // レンダラーへのモデル設定
      if (this.renderer) {
        this.renderer.setPMXModel(modelData);
      }
      
      console.log(`モデル「${modelId}」の読み込みが完了しました`);
      return this.models[modelId].data;
    } catch (error) {
      console.error('モデルのロードに失敗しました:', error);
      throw error;
    }
  }

  /**
   * ボーンマップを作成
   * @param {Array} bones - ボーン配列
   * @returns {Object} ボーンマップ
   * @private
   */
  _createBoneMap(bones) {
    const boneMap = {};
    
    if (!bones || !Array.isArray(bones)) {
      return boneMap;
    }
    
    bones.forEach((bone, index) => {
      boneMap[bone.name] = {
        index: index,
        originalPosition: [...bone.position],
        position: [...bone.position],
        rotation: [0, 0, 0], // 初期回転は0
        parent: bone.parentBoneIndex,
        children: []
      };
    });
    
    // 親子関係を設定
    for (const boneName in boneMap) {
      const bone = boneMap[boneName];
      if (bone.parent >= 0 && bones[bone.parent]) {
        const parentName = bones[bone.parent].name;
        if (boneMap[parentName]) {
          boneMap[parentName].children.push(boneName);
        }
      }
    }
    
    return boneMap;
  }

  /**
   * モーフマップを作成
   * @param {Array} morphs - モーフ配列
   * @returns {Object} モーフマップ
   * @private
   */
  _createMorphMap(morphs) {
    const morphMap = {};
    
    morphs.forEach((morph, index) => {
      morphMap[morph.name] = {
        index: index,
        weight: 0, // 初期ウェイトは0
        type: morph.type
      };
    });
    
    return morphMap;
  }

  /**
   * アクティブなモデルを設定
   * @param {string} modelId - モデルID
   * @returns {boolean} 成功したかどうか
   */
  setActiveModel(modelId) {
    if (!this.models[modelId]) {
      console.error(`モデル「${modelId}」が見つかりません`);
      return false;
    }
    
    this.activeModelId = modelId;
    
    // レンダラーへのモデル設定
    if (this.renderer) {
      this.renderer.setPMXModel(this.models[modelId].data);
    }
    
    console.log(`モデル「${modelId}」をアクティブに設定しました`);
    return true;
  }

  /**
   * モデルの位置を設定
   * @param {Array} position - 位置 [x, y, z]
   * @param {string} [modelId] - モデルID（省略時はアクティブモデル）
   * @returns {boolean} 成功したかどうか
   */
  setPosition(position, modelId = null) {
    const targetId = modelId || this.activeModelId;
    
    if (!this.models[targetId]) {
      return false;
    }
    
    this.models[targetId].position = [...position];
    return true;
  }

  /**
   * モデルの回転を設定
   * @param {Array} rotation - 回転 [x, y, z]（ラジアン）
   * @param {string} [modelId] - モデルID（省略時はアクティブモデル）
   * @returns {boolean} 成功したかどうか
   */
  setRotation(rotation, modelId = null) {
    const targetId = modelId || this.activeModelId;
    
    if (!this.models[targetId]) {
      return false;
    }
    
    this.models[targetId].rotation = [...rotation];
    
    // レンダラーに回転を適用
    if (this.renderer && targetId === this.activeModelId) {
      this.renderer.setRotation(rotation[0], rotation[1]);
    }
    
    return true;
  }

  /**
   * モデルのスケールを設定
   * @param {number} scale - スケール
   * @param {string} [modelId] - モデルID（省略時はアクティブモデル）
   * @returns {boolean} 成功したかどうか
   */
  setScale(scale, modelId = null) {
    const targetId = modelId || this.activeModelId;
    
    if (!this.models[targetId]) {
      return false;
    }
    
    this.models[targetId].scale = scale;
    return true;
  }

  /**
   * モデルの可視性を設定
   * @param {boolean} visible - 表示するかどうか
   * @param {string} [modelId] - モデルID（省略時はアクティブモデル）
   * @returns {boolean} 成功したかどうか
   */
  setVisible(visible, modelId = null) {
    const targetId = modelId || this.activeModelId;
    
    if (!this.models[targetId]) {
      return false;
    }
    
    this.models[targetId].visible = visible;
    return true;
  }

  /**
   * ボーンの位置と回転を設定
   * @param {string} boneName - ボーン名
   * @param {Array} position - 位置 [x, y, z]
   * @param {Array} rotation - 回転 [x, y, z]（ラジアン）
   * @param {string} [modelId] - モデルID（省略時はアクティブモデル）
   * @returns {boolean} 成功したかどうか
   */
  setBonePose(boneName, position, rotation, modelId = null) {
    const targetId = modelId || this.activeModelId;
    
    if (!this.models[targetId] || !this.models[targetId].bones[boneName]) {
      return false;
    }
    
    const bone = this.models[targetId].bones[boneName];
    
    if (position) {
      bone.position = [...position];
    }
    
    if (rotation) {
      bone.rotation = [...rotation];
    }
    
    return true;
  }

  /**
   * モーフのウェイトを設定
   * @param {string} morphName - モーフ名
   * @param {number} weight - ウェイト（0.0〜1.0）
   * @param {string} [modelId] - モデルID（省略時はアクティブモデル）
   * @returns {boolean} 成功したかどうか
   */
  setMorphWeight(morphName, weight, modelId = null) {
    const targetId = modelId || this.activeModelId;
    
    if (!this.models[targetId] || !this.models[targetId].morphs[morphName]) {
      return false;
    }
    
    // ウェイトを0.0〜1.0の範囲に制限
    const clampedWeight = Math.max(0.0, Math.min(1.0, weight));
    this.models[targetId].morphs[morphName].weight = clampedWeight;
    
    return true;
  }

  /**
   * モデルを破棄
   * @param {string} modelId - モデルID
   * @returns {boolean} 成功したかどうか
   */
  disposeModel(modelId) {
    if (!this.models[modelId]) {
      return false;
    }
    
    delete this.models[modelId];
    
    // アクティブモデルが破棄された場合、別のモデルをアクティブに設定
    if (this.activeModelId === modelId) {
      const modelIds = Object.keys(this.models);
      this.activeModelId = modelIds.length > 0 ? modelIds[0] : null;
      
      // レンダラーにモデルを設定
      if (this.renderer && this.activeModelId) {
        this.renderer.setPMXModel(this.models[this.activeModelId].data);
      }
    }
    
    return true;
  }

  /**
   * モデルのボーン構造を取得
   * @param {string} [modelId] - モデルID（省略時はアクティブモデル）
   * @returns {Object|null} ボーン構造
   */
  getBoneStructure(modelId = null) {
    const targetId = modelId || this.activeModelId;
    
    if (!this.models[targetId]) {
      return null;
    }
    
    return this.models[targetId].bones;
  }

  /**
   * モデルのモーフリストを取得
   * @param {string} [modelId] - モデルID（省略時はアクティブモデル）
   * @returns {Object|null} モーフリスト
   */
  getMorphList(modelId = null) {
    const targetId = modelId || this.activeModelId;
    
    if (!this.models[targetId]) {
      return null;
    }
    
    return this.models[targetId].morphs;
  }

  /**
   * 利用可能なモデルのIDリストを取得
   * @returns {Array<string>} モデルIDのリスト
   */
  getModelList() {
    return Object.keys(this.models);
  }

  /**
   * モデルの詳細情報を取得
   * @param {string} [modelId] - モデルID（省略時はアクティブモデル）
   * @returns {Object|null} モデル情報
   */
  getModelInfo(modelId = null) {
    const targetId = modelId || this.activeModelId;
    
    if (!this.models[targetId]) {
      return null;
    }
    
    const model = this.models[targetId];
    
    return {
      id: targetId,
      name: model.data.model.name,
      nameEn: model.data.model.nameEn,
      position: [...model.position],
      rotation: [...model.rotation],
      scale: model.scale,
      visible: model.visible,
      vertexCount: model.data.vertices.length,
      faceCount: model.data.faces.length,
      boneCount: Object.keys(model.bones).length,
      morphCount: Object.keys(model.morphs).length
    };
  }

  /**
   * リソースの解放
   */
  dispose() {
    this.models = {};
    this.activeModelId = null;
    this.renderer = null;
  }
}
