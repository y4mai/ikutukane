// main.js：カメラの設定、全体の処理
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let session;

// YOLOの入力及びカメラのサイズ
const inputWidth = 416;
const inputHeight = 416;

// YOLOv8のクラス名（6クラス程度）
const classNames = ['50', '5', '500', '1', '100', '10'];

const confidenceThreshold = 0.7;
const iouThreshold = 0.4;

//　カメラ設定
async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: inputWidth, height: inputHeight,
            facingMode: "environment"
        } 
    });
    video.srcObject = stream;
    return new Promise(resolve => {
        video.onloadedmetadata = () => {
            video.play();
            canvas.width = inputWidth;
            canvas.height = inputHeight;
            resolve();
        };
    });
}

// 全体の処理：ループ処理
async function detect() {    
    if (!session) {
        requestAnimationFrame(detect);
        return;
    }
    
    // 前処理
    const inputTensor = await preprocess(video);
    
    // YOLOの推論
    const feeds = { images: inputTensor };
    const output = await session.run(feeds);
    const outputData = output['output0'];

    // 後処理（描画）
    const [Indices, classIds] = draw(outputData);
    
    // 結果を表示
    result(Indices, classIds);

    //繰り返し
    requestAnimationFrame(detect);
}

(async () => {
    await loadModel();
    await setupCamera();
    
    detect();
})();