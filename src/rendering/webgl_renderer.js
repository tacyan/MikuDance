/**
 * @fileoverview WebGLレンダラー
 * @description 3Dモデルをレンダリングするためのモジュール
 */

/**
 * WebGLレンダラークラス
 * @class
 */
export class WebGLRenderer {
  /**
   * コンストラクタ
   */
  constructor() {
    this.canvas = null;
    this.gl = null;
    this.program = null;
    this.animationFrameId = null;
    this.model = null;
    this.rotationY = 0;
    this.shaderProgram = null;
    this.vertexPositionAttribute = null;
    this.vertexBuffer = null;
    this.indexBuffer = null;
    this.mvMatrix = null;
    this.pMatrix = null;
  }

  /**
   * 初期化処理
   * @param {HTMLCanvasElement} canvas - レンダリングに使用するキャンバス要素
   * @returns {Promise<void>}
   */
  async initialize(canvas) {
    this.canvas = canvas;
    
    try {
      // WebGLコンテキストの取得
      this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
      
      if (!this.gl) {
        throw new Error('WebGLがサポートされていません');
      }
      
      // シェーダーの初期化
      await this._initShaders();
      
      // バッファの初期化
      this._initBuffers();
      
      // 初期設定
      this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
      this.gl.enable(this.gl.DEPTH_TEST);
      this.gl.depthFunc(this.gl.LEQUAL);
      
      // ビューポートの設定
      this._resizeViewport();
      
      console.log('WebGLレンダラーが初期化されました');
      return Promise.resolve();
    } catch (error) {
      console.error('WebGLレンダラーの初期化に失敗しました:', error);
      return Promise.reject(error);
    }
  }

  /**
   * シェーダーを初期化する
   * @private
   */
  async _initShaders() {
    // 頂点シェーダーコード
    const vsSource = `
      attribute vec3 aVertexPosition;
      
      uniform mat4 uMVMatrix;
      uniform mat4 uPMatrix;
      
      void main(void) {
        gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
      }
    `;
    
    // フラグメントシェーダーコード
    const fsSource = `
      precision mediump float;
      
      void main(void) {
        gl_FragColor = vec4(0.0, 0.7, 1.0, 1.0); // ミクブルー
      }
    `;
    
    // シェーダーのコンパイル
    const vertexShader = this._compileShader(vsSource, this.gl.VERTEX_SHADER);
    const fragmentShader = this._compileShader(fsSource, this.gl.FRAGMENT_SHADER);
    
    // シェーダープログラムの作成
    this.shaderProgram = this.gl.createProgram();
    this.gl.attachShader(this.shaderProgram, vertexShader);
    this.gl.attachShader(this.shaderProgram, fragmentShader);
    this.gl.linkProgram(this.shaderProgram);
    
    if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
      throw new Error('シェーダープログラムの初期化に失敗しました');
    }
    
    this.gl.useProgram(this.shaderProgram);
    
    // 頂点位置属性の取得
    this.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition');
    this.gl.enableVertexAttribArray(this.vertexPositionAttribute);
    
    // シェーダーのuniform変数の取得
    this.pMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, 'uPMatrix');
    this.mvMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, 'uMVMatrix');
  }

  /**
   * シェーダーをコンパイルする
   * @param {string} source - シェーダーコード
   * @param {number} type - シェーダータイプ
   * @returns {WebGLShader} コンパイルされたシェーダー
   * @private
   */
  _compileShader(source, type) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const error = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`シェーダーのコンパイルに失敗しました: ${error}`);
    }
    
    return shader;
  }

  /**
   * バッファを初期化する
   * @private
   */
  _initBuffers() {
    // ダミーの頂点データ（単純な立方体）
    const vertices = [
      // 前面
      -1.0, -1.0,  1.0,
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,
      
      // 背面
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0, -1.0, -1.0,
      
      // 上面
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
       1.0,  1.0, -1.0,
      
      // 底面
      -1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,
      
      // 右面
       1.0, -1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0,  1.0,  1.0,
       1.0, -1.0,  1.0,
      
      // 左面
      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0
    ];
    
    // インデックスデータ
    const indices = [
      0,  1,  2,      0,  2,  3,    // 前面
      4,  5,  6,      4,  6,  7,    // 背面
      8,  9,  10,     8,  10, 11,   // 上面
      12, 13, 14,     12, 14, 15,   // 底面
      16, 17, 18,     16, 18, 19,   // 右面
      20, 21, 22,     20, 22, 23    // 左面
    ];
    
    // 頂点バッファの作成
    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
    
    // インデックスバッファの作成
    this.indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
    
    this.vertexBuffer.itemSize = 3;
    this.vertexBuffer.numItems = vertices.length / 3;
    this.indexBuffer.numItems = indices.length;
  }

  /**
   * ビューポートのサイズを調整する
   * @private
   */
  _resizeViewport() {
    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;
    
    if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /**
   * モデルをレンダリングする
   * @param {Object} model - レンダリングするモデルデータ
   */
  setModel(model) {
    this.model = model;
    // 本来はここでモデルデータを解析し、頂点バッファなどを設定する
    console.log('モデルがセットされました', model);
  }

  /**
   * アニメーションを開始する
   */
  startAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    const animate = () => {
      this.render();
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
  }

  /**
   * アニメーションを停止する
   */
  stopAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * レンダリングを実行する
   */
  render() {
    this._resizeViewport();
    
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    
    // プロジェクション行列の設定
    const pMatrix = this._createPerspectiveMatrix(45, this.canvas.width / this.canvas.height, 0.1, 100.0);
    
    // モデルビュー行列の設定
    const mvMatrix = this._createIdentityMatrix();
    this._translateMatrix(mvMatrix, [0.0, 0.0, -5.0]);
    this._rotateMatrix(mvMatrix, this.rotationY, [0, 1, 0]);
    
    // シェーダーに行列を送信
    this.gl.uniformMatrix4fv(this.pMatrixUniform, false, pMatrix);
    this.gl.uniformMatrix4fv(this.mvMatrixUniform, false, mvMatrix);
    
    // バッファをバインド
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.vertexAttribPointer(
      this.vertexPositionAttribute,
      this.vertexBuffer.itemSize,
      this.gl.FLOAT,
      false,
      0,
      0
    );
    
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    
    // 描画
    this.gl.drawElements(this.gl.TRIANGLES, this.indexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
    
    // 回転を更新
    this.rotationY += 0.01;
  }

  /**
   * 単位行列を作成する
   * @returns {Float32Array} 4x4単位行列
   * @private
   */
  _createIdentityMatrix() {
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }

  /**
   * 透視投影行列を作成する
   * @param {number} fov - 視野角（度）
   * @param {number} aspect - アスペクト比
   * @param {number} near - ニアクリップ面
   * @param {number} far - ファークリップ面
   * @returns {Float32Array} 透視投影行列
   * @private
   */
  _createPerspectiveMatrix(fov, aspect, near, far) {
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fov * Math.PI / 180);
    const rangeInv = 1.0 / (near - far);
    
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ]);
  }

  /**
   * 行列を平行移動する
   * @param {Float32Array} matrix - 変換する行列
   * @param {Array<number>} translation - 平行移動量 [x, y, z]
   * @private
   */
  _translateMatrix(matrix, translation) {
    const [x, y, z] = translation;
    
    matrix[12] = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12];
    matrix[13] = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13];
    matrix[14] = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14];
    matrix[15] = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
  }

  /**
   * 行列を回転する
   * @param {Float32Array} matrix - 変換する行列
   * @param {number} angle - 回転角（ラジアン）
   * @param {Array<number>} axis - 回転軸 [x, y, z]
   * @private
   */
  _rotateMatrix(matrix, angle, axis) {
    let [x, y, z] = axis;
    const len = Math.sqrt(x * x + y * y + z * z);
    
    if (len === 0) {
      return;
    }
    
    x /= len;
    y /= len;
    z /= len;
    
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    const t = 1 - c;
    
    const a00 = matrix[0], a01 = matrix[1], a02 = matrix[2], a03 = matrix[3];
    const a10 = matrix[4], a11 = matrix[5], a12 = matrix[6], a13 = matrix[7];
    const a20 = matrix[8], a21 = matrix[9], a22 = matrix[10], a23 = matrix[11];
    
    // 回転行列の計算
    const b00 = x * x * t + c;
    const b01 = y * x * t + z * s;
    const b02 = z * x * t - y * s;
    const b10 = x * y * t - z * s;
    const b11 = y * y * t + c;
    const b12 = z * y * t + x * s;
    const b20 = x * z * t + y * s;
    const b21 = y * z * t - x * s;
    const b22 = z * z * t + c;
    
    // 行列の乗算
    matrix[0] = a00 * b00 + a10 * b01 + a20 * b02;
    matrix[1] = a01 * b00 + a11 * b01 + a21 * b02;
    matrix[2] = a02 * b00 + a12 * b01 + a22 * b02;
    matrix[3] = a03 * b00 + a13 * b01 + a23 * b02;
    matrix[4] = a00 * b10 + a10 * b11 + a20 * b12;
    matrix[5] = a01 * b10 + a11 * b11 + a21 * b12;
    matrix[6] = a02 * b10 + a12 * b11 + a22 * b12;
    matrix[7] = a03 * b10 + a13 * b11 + a23 * b12;
    matrix[8] = a00 * b20 + a10 * b21 + a20 * b22;
    matrix[9] = a01 * b20 + a11 * b21 + a21 * b22;
    matrix[10] = a02 * b20 + a12 * b21 + a22 * b22;
    matrix[11] = a03 * b20 + a13 * b21 + a23 * b22;
  }

  /**
   * リソースの解放
   */
  dispose() {
    this.stopAnimation();
    
    if (this.gl) {
      // シェーダープログラムの削除
      if (this.shaderProgram) {
        this.gl.deleteProgram(this.shaderProgram);
        this.shaderProgram = null;
      }
      
      // バッファの削除
      if (this.vertexBuffer) {
        this.gl.deleteBuffer(this.vertexBuffer);
        this.vertexBuffer = null;
      }
      
      if (this.indexBuffer) {
        this.gl.deleteBuffer(this.indexBuffer);
        this.indexBuffer = null;
      }
    }
    
    this.canvas = null;
    this.gl = null;
  }
}