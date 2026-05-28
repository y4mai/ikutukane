// preprocess.js：YOLOv8nの推論のための前処理(Tensor形式への変換)

async function preprocess(video) {
    // 一時的なキャンバスを作成してフレームを取得
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = inputWidth;
    tempCanvas.height = inputHeight;

    // ビデオフレームをYOLOの入力サイズにリサイズ
    tempCtx.drawImage(video, 0, 0, inputWidth, inputHeight);
    
    // ImageDataを取得
    const imageData = tempCtx.getImageData(0, 0, inputWidth, inputHeight);
    const data = imageData.data;
    
    // RGB値を正規化してFloat32Arrayに変換（0-255 → 0-1）
    const input = new Float32Array(3 * inputWidth * inputHeight);
    
    for (let i = 0; i < data.length; i += 4) {
        const pixelIndex = i / 4;
        const r = data[i] / 255.0;
        const g = data[i + 1] / 255.0;
        const b = data[i + 2] / 255.0;
        
        // CHW形式（Channel, Height, Width）に変換
        const row = Math.floor(pixelIndex / inputWidth);
        const col = pixelIndex % inputWidth;
        
        input[0 * inputWidth * inputHeight + row * inputWidth + col] = r; // R channel
        input[1 * inputWidth * inputHeight + row * inputWidth + col] = g; // G channel
        input[2 * inputWidth * inputHeight + row * inputWidth + col] = b; // B channel
    }
    
    // Tensorを作成 - 正しい次元順序：[batch, channel, height, width]
    return new ort.Tensor('float32', input, [1, 3, inputHeight, inputWidth]);
}