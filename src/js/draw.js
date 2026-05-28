// 重複処理
function nonMaxSuppression(boxes, scores, iouThreshold) {
    const indices = Array.from({length: boxes.length}, (_, i) => i);
    indices.sort((a, b) => scores[b] - scores[a]);
    
    const keep = [];
    const suppressed = new Set();
    
    for (const i of indices) {
        if (suppressed.has(i)) continue;
        keep.push(i);
        
        const box1 = boxes[i];
        for (const j of indices) {
            if (i === j || suppressed.has(j)) continue;
            
            const box2 = boxes[j];
            const iou = calculateIoU(box1, box2);
            
            if (iou > iouThreshold) {
                suppressed.add(j);
            }
        }
    }
    
    return keep;
}

function calculateIoU(box1, box2) {
    const [x1, y1, w1, h1] = box1;
    const [x2, y2, w2, h2] = box2;
    
    const x1_min = x1 - w1 / 2;
    const y1_min = y1 - h1 / 2;
    const x1_max = x1 + w1 / 2;
    const y1_max = y1 + h1 / 2;
    
    const x2_min = x2 - w2 / 2;
    const y2_min = y2 - h2 / 2;
    const x2_max = x2 + w2 / 2;
    const y2_max = y2 + h2 / 2;
    
    const intersectX1 = Math.max(x1_min, x2_min);
    const intersectY1 = Math.max(y1_min, y2_min);
    const intersectX2 = Math.min(x1_max, x2_max);
    const intersectY2 = Math.min(y1_max, y2_max);
    
    const intersectArea = Math.max(0, intersectX2 - intersectX1) * Math.max(0, intersectY2 - intersectY1);
    const area1 = w1 * h1;
    const area2 = w2 * h2;
    const unionArea = area1 + area2 - intersectArea;
    
    return intersectArea / unionArea;
}

// 背景の明るさに基づいてテキストの色を決定する関数
function getTextColor(bgColor) {
    const r = parseInt(bgColor.substr(1, 2), 16);
    const g = parseInt(bgColor.substr(3, 2), 16);
    const b = parseInt(bgColor.substr(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
}

// 推論結果の保存～描画まで
function draw(outputData) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const outputs = outputData.data;
    
    // 一般的にYOLOv8は [1, 4+classes, anchors] の形式
    // outputData.dimsを確認して正確な形式を判定
    const [batch, dim1, dim2] = outputData.dims;
        
    // [1, 10, anchors] 形式 (4 + 6クラス = 10)
    let numDetections = dim2;
    let numClasses = dim1 - 4;
    
    const boxes = [];
    const scores = [];
    const classIds = [];
    
    // スケーリング係数
    const scaleX = canvas.width / inputWidth;
    const scaleY = canvas.height / inputHeight;
    
    // 出力形式に応じた処理
    for (let i = 0; i < numDetections; i++) {
        let x, y, w, h;
        let classScores = [];
        
        // [1, 10, anchors] 形式の場合
        x = outputs[i];
        y = outputs[i + numDetections];
        w = outputs[i + numDetections * 2];
        h = outputs[i + numDetections * 3];
            
        for (let j = 0; j < numClasses; j++) {
            classScores.push(outputs[i + numDetections * (4 + j)]);
        }
        
        // 最大スコアとクラスIDを取得
        let maxScore = 0;
        let maxClassId = 0;
        
        for (let j = 0; j < numClasses; j++) {
            if (classScores[j] > maxScore) {
                maxScore = classScores[j];
                maxClassId = j;
            }
        }

        if (maxScore > confidenceThreshold) {
            boxes.push([x * scaleX, y * scaleY, w * scaleX, h * scaleY]);
            scores.push(maxScore);
            classIds.push(maxClassId);
        }
    }
    
    // NMS適用
    const keepIndices = nonMaxSuppression(boxes, scores, iouThreshold);
    
    // バウンディングボックスを描画（現在のテーマの色で）
    ctx.lineWidth = 3;
    ctx.font = '16px Arial';
    
    for (const idx of keepIndices) {
        const [x, y, w, h] = boxes[idx];
        const classId = classIds[idx];
        const className = classNames[classId] || 'unknown';
        
        // 現在のテーマから硬貨の色を取得
        const coinColor = getCoinColor(className);
        
        // バウンディングボックス描画
        const boxX = x - w / 2;
        const boxY = y - h / 2;
        ctx.strokeStyle = coinColor;
        ctx.strokeRect(boxX, boxY, w, h);
        
        // ラベル描画
        const label = `${className}`;
        const textWidth = ctx.measureText(label).width;
        
        // ラベル背景
        ctx.fillStyle = coinColor;
        ctx.fillRect(boxX, boxY - 25, textWidth + 10, 25);
        
        // ラベルテキスト（背景色に応じて白か黒を選択）
        ctx.fillStyle = getTextColor(coinColor);
        ctx.fillText(label, boxX + 5, boxY - 5);
    }

    return [keepIndices, classIds];
}