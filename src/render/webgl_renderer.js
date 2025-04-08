/**
 * @fileoverview WebGLレンダラー
 * @description 3Dモデルの描画を担当するWebGLレンダラーモジュール
 */

/**
 * WebGLで3Dモデルを描画するクラス
 * @class
 */
export class WebGLRenderer {
  /**
   * コンストラクタ
   * @param {HTMLCanvasElement} canvas - 描画対象のキャンバス要素
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = null;
    this.program = null;
    this.shaders = {};
    this.buffers = {};
    this.textures = {};
    this.uniforms = {};
    this.modelMatrix = null;
    this.viewMatrix = null;
    this.projectionMatrix = null;
    this.rotationX = 0;
    this.rotationY = 0;
    this.pmxModel = null;
    this.renderLoopActive = false;
    this.animationFrameId = null;
    
    // 初期化はinitializeメソッドで行うようにする
  }

  /**
   * レンダラーの初期化
   * @param {HTMLCanvasElement} customCanvas - 外部から渡されるキャンバス要素（オプション）
   * @returns {Promise<boolean>} 初期化の成功・失敗
   */
  async initialize(customCanvas) {
    // customCanvasが渡された場合は上書き
    if (customCanvas) {
      this.canvas = customCanvas;
    }

    if (!this.canvas) {
      console.error('キャンバス要素が設定されていません');
      return false;
    }
    
    try {
      // キャンバスサイズの確認と修正
      if (this.canvas.width === 0 || this.canvas.height === 0) {
        console.warn('キャンバスのサイズが0です。自動的に調整します。');
        this.canvas.width = this.canvas.clientWidth || 800;
        this.canvas.height = this.canvas.clientHeight || 600;
      }
      
      console.log('WebGLコンテキストを取得します... キャンバスサイズ:', {
        width: this.canvas.width,
        height: this.canvas.height,
        clientWidth: this.canvas.clientWidth,
        clientHeight: this.canvas.clientHeight,
        offsetWidth: this.canvas.offsetWidth,
        offsetHeight: this.canvas.offsetHeight
      });
      
      // WebGLコンテキストのオプションを設定
      const contextOptions = { 
        alpha: true,
        depth: true,
        stencil: false,
        antialias: true,
        premultipliedAlpha: true,
        preserveDrawingBuffer: true,
        powerPreference: 'default'
      };
      
      // まずWebGL2を試し、次にWebGL1を試す
      this.gl = this.canvas.getContext('webgl2', contextOptions) || 
                this.canvas.getContext('webgl', contextOptions) || 
                this.canvas.getContext('experimental-webgl', contextOptions);
      
      if (!this.gl) {
        // WebGLサポートチェック - 詳細なエラー情報を提供
        const details = this._checkWebGLSupport();
        console.error('WebGLコンテキストを取得できませんでした。', details);
        throw new Error(`WebGLがサポートされていません: ${details.reason}`);
      }
      
      console.log('WebGLコンテキスト取得成功:', {
        version: this._getWebGLVersion(),
        vendor: this.gl.getParameter(this.gl.VENDOR),
        renderer: this.gl.getParameter(this.gl.RENDERER)
      });
      
      // キャンバスサイズの設定
      this.resize();
      
      // シェーダーの初期化
      console.log('シェーダーを初期化します...');
      this._initShaders();
      
      // 行列の初期化
      console.log('行列を初期化します...');
      this._initMatrices();
      
      // デフォルトの設定
      this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
      this.gl.enable(this.gl.DEPTH_TEST);
      this.gl.depthFunc(this.gl.LEQUAL);
      this.gl.enable(this.gl.CULL_FACE);
      this.gl.cullFace(this.gl.BACK);
      
      console.log('WebGLレンダラーの初期化が完了しました', {
        gl: !!this.gl, 
        program: !!this.program,
        canvas: !!this.canvas
      });
      return true;
    } catch (error) {
      console.error('WebGLレンダラーの初期化に失敗しました:', error);
      // 失敗した場合は、glをnullにリセット
      this.gl = null;
      return false;
    }
  }

  /**
   * ブラウザのWebGLサポート状況をチェック
   * @returns {Object} サポート情報
   * @private
   */
  _checkWebGLSupport() {
    const result = {
      supported: false,
      reason: ''
    };
    
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        const testCanvas = document.createElement('canvas');
        const testContext = testCanvas.getContext('2d');
        
        if (!testContext) {
          result.reason = 'Canvas APIが利用できません。ブラウザがサポートしていない可能性があります。';
        } else {
          result.reason = 'WebGLがサポートされていません。グラフィックドライバの更新またはハードウェアアクセラレーションの有効化が必要かもしれません。';
        }
      } else {
        result.supported = true;
      }
    } catch (e) {
      result.reason = `例外が発生しました: ${e.message}`;
    }
    
    return result;
  }
  
  /**
   * 使用中のWebGLバージョンを取得
   * @returns {string} WebGLバージョン
   * @private
   */
  _getWebGLVersion() {
    if (!this.gl) return 'unknown';
    
    if (this.gl instanceof WebGL2RenderingContext) {
      return 'WebGL 2.0';
    } else {
      return 'WebGL 1.0';
    }
  }

  /**
   * キャンバスのリサイズ
   */
  resize() {
    if (!this.canvas || !this.gl) return;
    
    // ディスプレイサイズに合わせる
    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;
    
    // キャンバスの実サイズがディスプレイサイズと異なる場合に調整
    if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
      this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
      
      // 射影行列の更新
      if (this.projectionMatrix) {
        this._updateProjectionMatrix();
      }
    }
  }

  /**
   * PMXモデルの設定
   * @param {Object} model - PMXモデルデータ
   */
  setPMXModel(model) {
    try {
      // WebGLコンテキストが初期化されているか確認
      if (!this.gl) {
        console.error('WebGLコンテキストが初期化されていません。initialize()メソッドが正常に完了したか確認してください。');
        return false;
      }

      this.pmxModel = model;
      
      // モデルデータからバッファを作成
      this._createBuffersFromModel(model);
      
      console.log('PMXモデルがWebGLレンダラーに設定されました');
      return true;
    } catch (error) {
      console.error('PMXモデルの設定に失敗しました:', error);
      return false;
    }
  }

  /**
   * 描画ループの開始
   */
  startRendering() {
    if (this.renderLoopActive) return;
    
    console.log('WebGLレンダラーの描画ループを開始します');
    this.renderLoopActive = true;
    this.animationFrameId = requestAnimationFrame((timestamp) => {
      this._renderLoop(timestamp);
    });
  }

  /**
   * 描画ループの停止
   */
  stopRendering() {
    this.renderLoopActive = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    console.log('WebGLレンダラーの描画ループを停止しました');
  }

  /**
   * レンダリングループ
   * @param {number} timestamp - タイムスタンプ
   * @private
   */
  _renderLoop(timestamp) {
    if (!this.renderLoopActive) return;
    
    // 最初の数フレームでログを出力（デバッグ用）
    if (timestamp < 1000) {
      // デバッグ情報（10フレームごと）
      if (Math.floor(timestamp) % 100 === 0) {
        console.log(`レンダリング中... timestamp: ${timestamp}`);
      }
    }
    
    // 毎秒1回程度のペースでレンダリング状態のデバッグ出力（開発時のみ）
    if (timestamp % 1000 < 16) {
      this._logRenderingState();
    }
    
    this.render(timestamp);
    
    this.animationFrameId = requestAnimationFrame((ts) => {
      this._renderLoop(ts);
    });
  }
  
  /**
   * レンダリング状態をログ出力
   * @private
   */
  _logRenderingState() {
    if (!this.gl || !this.program) return;
    
    console.debug('レンダリング状態：', {
      gl: !!this.gl,
      program: !!this.program,
      pmxModel: !!this.pmxModel,
      viewport: this.gl ? {
        width: this.gl.drawingBufferWidth,
        height: this.gl.drawingBufferHeight
      } : null,
      uniforms: this.uniforms ? Object.keys(this.uniforms).length : 0,
      buffers: this.buffers ? {
        vertices: !!this.buffers.vertices,
        normals: !!this.buffers.normals,
        indices: !!this.buffers.indices,
        indexCount: this.buffers.indexCount
      } : null
    });
  }

  /**
   * 描画ループ
   * @param {number} timestamp - タイムスタンプ
   */
  render(timestamp) {
    if (!this.gl || !this.program) {
      console.warn('WebGLコンテキストまたはシェーダープログラムがないため描画をスキップします');
      return;
    }
    
    try {
      // キャンバスのサイズをリサイズ
      this.resize();
      
      // キャンバスのクリア
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      
      // モデルがない場合はここで終了
      if (!this.pmxModel) {
        return;
      }
      
      // バッファがない場合は終了
      if (!this.buffers || !this.buffers.vertices || !this.buffers.indices) {
        console.warn('描画用バッファが初期化されていません');
        return;
      }
      
      // モデル行列の更新
      this._updateModelMatrix(timestamp);
      
      // 行列をシェーダーに送信
      this.gl.uniformMatrix4fv(this.uniforms.uModel, false, this._flattenMatrix(this.modelMatrix));
      this.gl.uniformMatrix4fv(this.uniforms.uView, false, this._flattenMatrix(this.viewMatrix));
      this.gl.uniformMatrix4fv(this.uniforms.uProjection, false, this._flattenMatrix(this.projectionMatrix));
      
      // 頂点バッファのバインド
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.vertices);
      
      // 頂点属性の有効化
      const positionAttrib = this.gl.getAttribLocation(this.program, 'aPosition');
      this.gl.enableVertexAttribArray(positionAttrib);
      this.gl.vertexAttribPointer(positionAttrib, 3, this.gl.FLOAT, false, 0, 0);
      
      // 法線バッファのバインド（あれば）
      if (this.buffers.normals) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.normals);
        const normalAttrib = this.gl.getAttribLocation(this.program, 'aNormal');
        
        if (normalAttrib >= 0) {
          this.gl.enableVertexAttribArray(normalAttrib);
          this.gl.vertexAttribPointer(normalAttrib, 3, this.gl.FLOAT, false, 0, 0);
        }
      }
      
      // インデックスバッファのバインド
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
      
      // 描画
      this.gl.drawElements(this.gl.TRIANGLES, this.buffers.indexCount, this.gl.UNSIGNED_SHORT, 0);
    } catch (error) {
      console.error('レンダリング中にエラーが発生しました:', error);
    }
  }

  /**
   * モデルの回転を設定
   * @param {number} x - X軸回りの回転角（ラジアン）
   * @param {number} y - Y軸回りの回転角（ラジアン）
   */
  setRotation(x, y) {
    this.rotationX = x;
    this.rotationY = y;
  }

  /**
   * シェーダーの初期化
   * @private
   */
  _initShaders() {
    // 頂点シェーダー
    const vertexShader = this._createShader(this.gl.VERTEX_SHADER, `
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      
      uniform mat4 uModel;
      uniform mat4 uView;
      uniform mat4 uProjection;
      
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main(void) {
        vec4 worldPosition = uModel * vec4(aPosition, 1.0);
        gl_Position = uProjection * uView * worldPosition;
        vNormal = (uModel * vec4(aNormal, 0.0)).xyz;
        vPosition = worldPosition.xyz;
      }
    `);
    
    // フラグメントシェーダー
    const fragmentShader = this._createShader(this.gl.FRAGMENT_SHADER, `
      precision mediump float;
      
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main(void) {
        // 光源の設定
        vec3 lightDir1 = normalize(vec3(0.5, 1.0, 0.8)); // 主光源
        vec3 lightDir2 = normalize(vec3(-0.5, 0.2, 0.2)); // 補助光源
        
        // 正規化された法線
        vec3 normal = normalize(vNormal);
        
        // 拡散反射の計算（複数の光源）
        float diffuse1 = max(dot(normal, lightDir1), 0.0);
        float diffuse2 = max(dot(normal, lightDir2), 0.0) * 0.3; // 補助光は弱め
        
        // ベース色（初音ミクのテーマカラー）
        vec3 baseColor = vec3(0.1, 0.8, 0.7); // ミクグリーン
        
        // 環境光
        float ambient = 0.4;
        
        // 最終的な色の計算
        vec3 color = baseColor * (diffuse1 + diffuse2 + ambient);
        
        // リムライト（輪郭を強調）
        vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0) - vPosition);
        float rimFactor = 1.0 - max(dot(viewDir, normal), 0.0);
        rimFactor = pow(rimFactor, 3.0) * 0.5;
        color += vec3(0.3, 0.8, 0.9) * rimFactor; // リムライトの色
        
        gl_FragColor = vec4(color, 1.0);
      }
    `);
    
    // シェーダープログラムの作成
    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);
    
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      const info = this.gl.getProgramInfoLog(this.program);
      throw new Error('シェーダープログラムのリンクに失敗しました: ' + info);
    }
    
    this.gl.useProgram(this.program);
    
    // ユニフォーム変数の位置を取得
    this.uniforms.uModel = this.gl.getUniformLocation(this.program, 'uModel');
    this.uniforms.uView = this.gl.getUniformLocation(this.program, 'uView');
    this.uniforms.uProjection = this.gl.getUniformLocation(this.program, 'uProjection');
    
    // 背景色を明るめのグラデーションに
    this.gl.clearColor(0.2, 0.3, 0.4, 1.0);
  }

  /**
   * シェーダーの作成
   * @param {number} type - シェーダータイプ
   * @param {string} source - シェーダーソースコード
   * @returns {WebGLShader} コンパイルされたシェーダー
   * @private
   */
  _createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error('シェーダーのコンパイルに失敗しました: ' + info);
    }
    
    return shader;
  }

  /**
   * 行列の初期化
   * @private
   */
  _initMatrices() {
    // モデル行列（単位行列から開始）
    this.modelMatrix = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
    
    // ビュー行列（モデルがよく見えるように調整）
    this.viewMatrix = this._createLookAtMatrix(
      [0, 15, 30],  // カメラ位置 - 高さと距離を調整
      [0, 10, 0],   // 注視点
      [0, 1, 0]     // 上方向ベクトル
    );
    
    // 射影行列
    this._updateProjectionMatrix();
    
    console.log('行列を初期化しました', {
      cameraPosition: [0, 15, 30],
      lookAt: [0, 10, 0]
    });
  }

  /**
   * 射影行列の更新
   * @private
   */
  _updateProjectionMatrix() {
    const aspect = this.canvas.width / this.canvas.height;
    this.projectionMatrix = this._createPerspectiveMatrix(
      45 * Math.PI / 180,  // 視野角（ラジアン）
      aspect,              // アスペクト比
      0.1,                 // ニアクリップ面
      1000.0               // ファークリップ面
    );
  }

  /**
   * モデル行列の更新
   * @param {number} timestamp - タイムスタンプ
   * @private
   */
  _updateModelMatrix(timestamp) {
    // 自動回転を無効化（ユーザーが回転させられるように）
    // const autoRotateY = timestamp * 0.001 * 0.2;
    const autoRotateY = 0;
    
    // ユーザー制御の回転
    const totalRotationY = this.rotationY;
    
    // 回転行列の計算
    const cosX = Math.cos(this.rotationX);
    const sinX = Math.sin(this.rotationX);
    const cosY = Math.cos(totalRotationY);
    const sinY = Math.sin(totalRotationY);
    
    // Y軸回りの回転
    const rotateY = [
      cosY, 0, sinY, 0,
      0, 1, 0, 0,
      -sinY, 0, cosY, 0,
      0, 0, 0, 1
    ];
    
    // X軸回りの回転
    const rotateX = [
      1, 0, 0, 0,
      0, cosX, -sinX, 0,
      0, sinX, cosX, 0,
      0, 0, 0, 1
    ];
    
    // 回転行列の結合（Y回転 * X回転）
    this.modelMatrix = this._multiplyMatrices(rotateY, rotateX);
    
    // モデルを上に少し移動（必要に応じて調整）
    this.modelMatrix[13] = 8; // Y軸方向に移動
    
    // スケール（大きくして見やすく）
    const scale = 2.0;
    this.modelMatrix[0] *= scale;
    this.modelMatrix[5] *= scale;
    this.modelMatrix[10] *= scale;
  }

  /**
   * モデルデータからバッファを作成
   * @param {Object} model - PMXモデルデータ
   * @private
   */
  _createBuffersFromModel(model) {
    if (!this.gl) {
      console.error('WebGLコンテキストが初期化されていません (_createBuffersFromModel)');
      throw new Error('WebGLコンテキストが初期化されていません');
    }
    
    if (!model || !model.vertices || !model.faces) {
      console.error('無効なモデルデータが渡されました:', model);
      throw new Error('無効なモデルデータが渡されました');
    }
    
    const vertices = model.vertices;
    const faces = model.faces;
    
    try {
      // 頂点座標配列の作成
      const positions = new Float32Array(vertices.length * 3);
      for (let i = 0; i < vertices.length; i++) {
        const pos = vertices[i].position;
        positions[i * 3] = pos[0];
        positions[i * 3 + 1] = pos[1];
        positions[i * 3 + 2] = pos[2];
      }
      
      // 法線配列の作成
      const normals = new Float32Array(vertices.length * 3);
      for (let i = 0; i < vertices.length; i++) {
        const normal = vertices[i].normal;
        normals[i * 3] = normal[0];
        normals[i * 3 + 1] = normal[1];
        normals[i * 3 + 2] = normal[2];
      }
      
      // インデックス配列の作成
      const indices = [];
      for (let i = 0; i < faces.length; i++) {
        const face = faces[i];
        indices.push(face[0], face[1], face[2]);
      }
      
      const indexArray = new Uint16Array(indices);
      
      // 頂点バッファの作成
      console.log('頂点バッファを作成します...');
      const positionBuffer = this.gl.createBuffer();
      if (!positionBuffer) {
        throw new Error('頂点バッファの作成に失敗しました');
      }
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
      
      // 法線バッファの作成
      console.log('法線バッファを作成します...');
      const normalBuffer = this.gl.createBuffer();
      if (!normalBuffer) {
        throw new Error('法線バッファの作成に失敗しました');
      }
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, normals, this.gl.STATIC_DRAW);
      
      // インデックスバッファの作成
      console.log('インデックスバッファを作成します...');
      const indexBuffer = this.gl.createBuffer();
      if (!indexBuffer) {
        throw new Error('インデックスバッファの作成に失敗しました');
      }
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indexArray, this.gl.STATIC_DRAW);
      
      // バッファ情報の保存
      this.buffers = {
        vertices: positionBuffer,
        normals: normalBuffer,
        indices: indexBuffer,
        indexCount: indices.length
      };
      
      console.log('バッファの作成が完了しました', {
        vertexCount: vertices.length,
        faceCount: faces.length,
        indexCount: indices.length
      });
    } catch (error) {
      console.error('バッファの作成中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * 透視投影行列を作成
   * @param {number} fov - 視野角（ラジアン）
   * @param {number} aspect - アスペクト比
   * @param {number} near - ニアクリップ面
   * @param {number} far - ファークリップ面
   * @returns {Array} 透視投影行列
   * @private
   */
  _createPerspectiveMatrix(fov, aspect, near, far) {
    const f = 1.0 / Math.tan(fov / 2);
    const nf = 1 / (near - far);
    
    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0
    ];
  }

  /**
   * 視点行列を作成
   * @param {Array} eye - カメラ位置 [x, y, z]
   * @param {Array} center - 注視点 [x, y, z]
   * @param {Array} up - 上方向ベクトル [x, y, z]
   * @returns {Array} 視点行列
   * @private
   */
  _createLookAtMatrix(eye, center, up) {
    const z = this._normalizeVector([
      eye[0] - center[0],
      eye[1] - center[1],
      eye[2] - center[2]
    ]);
    
    const x = this._normalizeVector(this._crossProduct(up, z));
    const y = this._crossProduct(z, x);
    
    return [
      x[0], y[0], z[0], 0,
      x[1], y[1], z[1], 0,
      x[2], y[2], z[2], 0,
      -this._dotProduct(x, eye), -this._dotProduct(y, eye), -this._dotProduct(z, eye), 1
    ];
  }

  /**
   * ベクトルの内積
   * @param {Array} a - ベクトルA
   * @param {Array} b - ベクトルB
   * @returns {number} 内積
   * @private
   */
  _dotProduct(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  /**
   * ベクトルの外積
   * @param {Array} a - ベクトルA
   * @param {Array} b - ベクトルB
   * @returns {Array} 外積ベクトル
   * @private
   */
  _crossProduct(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  }

  /**
   * ベクトルの正規化
   * @param {Array} v - 入力ベクトル
   * @returns {Array} 正規化されたベクトル
   * @private
   */
  _normalizeVector(v) {
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (length === 0) {
      return [0, 0, 0];
    }
    
    return [v[0] / length, v[1] / length, v[2] / length];
  }

  /**
   * 行列の乗算
   * @param {Array} a - 行列A
   * @param {Array} b - 行列B
   * @returns {Array} 結果行列
   * @private
   */
  _multiplyMatrices(a, b) {
    const result = new Array(16);
    
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result[i * 4 + j] = 0;
        for (let k = 0; k < 4; k++) {
          result[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
        }
      }
    }
    
    return result;
  }

  /**
   * 行列を1次元配列に変換
   * @param {Array} matrix - 入力行列
   * @returns {Float32Array} 変換された行列
   * @private
   */
  _flattenMatrix(matrix) {
    return new Float32Array(matrix);
  }
} 