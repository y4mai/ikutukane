// WebGLサポートチェック関数
function checkWebGLSupport() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return gl !== null;
    } catch (e) {
        console.warn('WebGL check failed:', e);
        return false;
    }
}

// WebGL2サポートチェック関数
function checkWebGL2Support() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2');
        return gl !== null;
    } catch (e) {
        console.warn('WebGL2 check failed:', e);
        return false;
    }
}

//モデルのインストール
async function loadModel() {
    try {
        // ローカルWASMファイルのパスを設定
        ort.env.wasm.wasmPaths = {
            'ort-wasm.wasm': './lib/ort-wasm.wasm',
            'ort-wasm-simd.wasm': './lib/ort-wasm-simd.wasm',
            'ort-wasm-threaded.wasm': './lib/ort-wasm-threaded.wasm',
            'ort-wasm-simd-threaded.wasm': './lib/ort-wasm-simd-threaded.wasm'
        };
        
        // WASM設定の追加オプション
        ort.env.wasm.numThreads = navigator.hardwareConcurrency || 4;
        ort.env.wasm.simd = true;
        
        console.log('WASM paths configured');
        
        // 各バックエンドの対応状況をチェック
        const supportsWebGPU = 'gpu' in navigator;
        const supportsWebGL2 = checkWebGL2Support();
        const supportsWebGL = checkWebGLSupport();
        
        console.log('Backend support:', {
            WebGPU: supportsWebGPU,
            WebGL2: supportsWebGL2,
            WebGL: supportsWebGL
        });
        
        // 実行プロバイダーの設定（優先度順）
        const executionProviders = [];
        
        // 1. WebGPUが利用可能な場合のみ追加（最高性能）
        if (supportsWebGPU) {
            try {
                executionProviders.push({
                    name: 'webgpu',
                    deviceType: 'gpu',
                    powerPreference: 'high-performance'
                });
                console.log('WebGPU provider added');
            } catch (e) {
                console.warn('WebGPU provider not available:', e);
            }
        }
        
        // 2. WebGL2が利用可能な場合に追加（高性能）
        if (supportsWebGL2) {
            try {
                executionProviders.push({
                    name: 'webgl',
                    contextId: 'webgl2'
                });
                console.log('WebGL2 provider added');
            } catch (e) {
                console.warn('WebGL2 provider not available:', e);
            }
        }
        
        // 3. WebGLが利用可能な場合に追加（中程度性能）
        if (supportsWebGL && !supportsWebGL2) {
            try {
                executionProviders.push({
                    name: 'webgl',
                    contextId: 'webgl'
                });
                console.log('WebGL provider added');
            } catch (e) {
                console.warn('WebGL provider not available:', e);
            }
        }
        
        // 4. WASMプロバイダーは常に追加（フォールバック）
        executionProviders.push({
            name: 'wasm',
            numThreads: navigator.hardwareConcurrency || 4,
            simd: true
        });
        
        // 5. CPUプロバイダーも追加（最後のフォールバック）
        executionProviders.push('cpu');
        
        console.log('Using execution providers:', executionProviders.map(p => typeof p === 'string' ? p : p.name));
        
        // セッション作成オプション
        const sessionOptions = {
            executionProviders: executionProviders,
            graphOptimizationLevel: 'all',
            executionMode: 'parallel',
            logSeverityLevel: 2,
            enableMemPattern: true,
            enableCpuMemArena: true,
            enableProfiling: false
        };
        
        try {
            session = await ort.InferenceSession.create('./model/best416.onnx', sessionOptions);
        } catch (sessionError) {
            console.warn('Failed with all providers, trying WASM only:', sessionError);
            // GPU providers failed, try WASM only
            session = await ort.InferenceSession.create('./model/best416.onnx', {
                executionProviders: ['wasm'],
                graphOptimizationLevel: 'all',
                executionMode: 'parallel',
                logSeverityLevel: 2
            });
        }
        
        console.log('Model loaded successfully');
        console.log('Input names:', session.inputNames);
        console.log('Output names:', session.outputNames);
        
        // 使用されたプロバイダーを確認
        const providers = session.getProviders();
        console.log('Active execution providers:', providers);
        
    } catch (error) {
        console.error('モデル読み込み失敗:', error);
        
        // より基本的な設定で再試行（WebGLなし）
        try {
            console.log('Retrying with basic configuration (no WebGL)...');
            session = await ort.InferenceSession.create('./model/best416.onnx', {
                executionProviders: ['wasm', 'cpu'],
                graphOptimizationLevel: 'basic',
                logSeverityLevel: 2
            });
            console.log('Model loaded with basic configuration');
        } catch (retryError) {
            console.error('再試行も失敗:', retryError);
            throw retryError;
        }
    }
}