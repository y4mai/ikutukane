// result.js：硬貨の枚数、合計金額を表示する（5枚束ね機能付き）
async function result(keepIndices, classIds){
    let total = 0;
    const coinTypes = [
        { value: 50, id: '50yen' },
        { value: 5, id: '5yen' },
        { value: 500, id: '500yen' },
        { value: 1, id: '1yen' },
        { value: 100, id: '100yen' },
        { value: 10, id: '10yen' }
    ];

    const counts = new Array(6).fill(0);

    // 硬貨の枚数をカウント
    for (const idx of keepIndices) {
        const classId = classIds[idx];
        counts[classId]++;
    }

    // 硬貨の枚数・合計金額を更新
    coinTypes.forEach((coin, index) => {
        const count = counts[index];
        
        // 前回のカウントと比較して変更があった場合のみ更新
        if (currentCounts[coin.id] !== count) {
            currentCounts[coin.id] = count;

            // 文字情報の更新（表示状態に応じて）
            updateCoinCount(coin.id, count);

            // 画像で枚数を表示（5枚束ね機能付き）
            updateCoinImagesWithBundling(coin.id, count);
            
            // 硬貨情報エリアの表示/非表示を制御
            updateCoinInfoVisibility(coin.id, count);
        }
        
        total += count * coin.value;
    });
    
    // 合計金額が変更された場合のみ更新
    if (currentTotal !== total) {
        updateTotalAmount(total);
    }
}

// 合計金額の表示状態を管理する変数
let isTotalVisible = true;
let currentTotal = 0;

// 各硬貨枚数の表示状態を独立して管理する変数
let coinCountVisibility = {
    '1yen': true,
    '5yen': true,
    '10yen': true,
    '50yen': true,
    '100yen': true,
    '500yen': true
};
let currentCounts = { '1yen': 0, '5yen': 0, '10yen': 0, '50yen': 0, '100yen': 0, '500yen': 0 };

// DOM要素をキャッシュして毎回の検索を回避
let totalElement = null;
let totalDisplayElement = null;
let coinImageContainers = {};
let coinCountElements = {};
let coinInfoElements;

// DOM要素を初期化時に一度だけ取得
document.addEventListener('DOMContentLoaded', function() {
    totalElement = document.getElementById('total');
    totalDisplayElement = document.getElementById('totalDisplay');

    // 硬貨画像コンテナをキャッシュ
    coinImageContainers = {
        '1yen': document.getElementById('1yen-images'),
        '5yen': document.getElementById('5yen-images'),
        '10yen': document.getElementById('10yen-images'),
        '50yen': document.getElementById('50yen-images'),
        '100yen': document.getElementById('100yen-images'),
        '500yen': document.getElementById('500yen-images')
    };

    // 硬貨枚数要素をキャッシュ
    coinCountElements = {
        '1yen': document.getElementById('1yen'),
        '5yen': document.getElementById('5yen'),
        '10yen': document.getElementById('10yen'),
        '50yen': document.getElementById('50yen'),
        '100yen': document.getElementById('100yen'),
        '500yen': document.getElementById('500yen')
    };

    // 硬貨情報エリア全体(.coin_info)をキャッシュ
    coinInfoElements = {
        '1yen': document.getElementById('1yen-images').closest('.coin_info'),
        '5yen': document.getElementById('5yen-images').closest('.coin_info'),
        '10yen': document.getElementById('10yen-images').closest('.coin_info'),
        '50yen': document.getElementById('50yen-images').closest('.coin_info'),
        '100yen': document.getElementById('100yen-images').closest('.coin_info'),
        '500yen': document.getElementById('500yen-images').closest('.coin_info')
    };
});

/*/ 硬貨IDから価格番号を取得するヘルパー関数
function getCoinValue(coinId) {
    const valueMap = {
        '1yen': '1',
        '5yen': '5',
        '10yen': '10',
        '50yen': '50',
        '100yen': '100',
        '500yen': '500'
    };
    return valueMap[coinId];
}*/

// 硬貨IDからクラスIDを取得するヘルパー関数（main.jsのclassNames配列に対応）
function getClassIdFromCoinId(coinId) {
    // main.jsのclassNames = ['50', '5', '500', '1', '100', '10'];
    const classIdMap = {
        '50yen': 0,   // classNames[0] = '50'
        '5yen': 1,    // classNames[1] = '5'
        '500yen': 2,  // classNames[2] = '500'
        '1yen': 3,    // classNames[3] = '1'
        '100yen': 4,  // classNames[4] = '100'
        '10yen': 5    // classNames[5] = '10'
    };
    return classIdMap[coinId];
}

// 硬貨情報エリア全体の表示/非表示を制御する関数
function updateCoinInfoVisibility(coinId, count) {
    const coinInfoElement = coinInfoElements[coinId];
    if (!coinInfoElement) return;
    
    if (count === 0) {
        coinInfoElement.classList.add('hidden');
    } else {
        coinInfoElement.classList.remove('hidden');
    }
}

// 合計金額の表示・非表示を切り替える関数
function toggleTotalDisplay() {
    if (isTotalVisible) {
        totalElement.textContent = '???';
        totalDisplayElement.classList.add('total-hidden');
    } else {
        totalElement.textContent = currentTotal;
        totalDisplayElement.classList.remove('total-hidden');
    }
    isTotalVisible = !isTotalVisible;
}

// 特定の硬貨の枚数表示・非表示を切り替える関数（独立切り替え）
function toggleCoinCountDisplay(coinId) {
    // 指定された硬貨の表示状態を反転
    coinCountVisibility[coinId] = !coinCountVisibility[coinId];
    
    // 該当する硬貨の枚数表示を更新
    updateCoinCount(coinId, currentCounts[coinId]);
}

// 個別の硬貨枚数を更新する関数
function updateCoinCount(coinId, count) {
    const element = coinCountElements[coinId];
    if (!element) return;
    
    if (coinCountVisibility[coinId]) {
        element.textContent = count;
    } else {
        element.textContent = '?';
    }
}

// result.jsで使用する合計金額更新関数（最適化版）
function updateTotalAmount(total) {
    currentTotal = total;
    // 表示状態の時のみDOM更新
    if (isTotalVisible && totalElement) {
        totalElement.textContent = total;
    }
}

// 硬貨画像を表示する関数（5枚囲い機能付き、テーマ対応）
function updateCoinImagesWithBundling(coinId, count) {
    const container = coinImageContainers[coinId];
    if (!container) return;

    // 既存の画像をクリア
    container.innerHTML = '';

    // 硬貨が0枚の場合は空白クラスを追加して非表示に
    if (count === 0) {
        container.classList.add('empty');
        container.classList.remove('many-coins', 'has-five-group');
        return;
    }

    // 空白クラスを削除
    container.classList.remove('empty');

    // 5枚以上の場合は5枚ずつグループ化して囲う
    if (count >= 5) {
        container.classList.add('has-five-group');
        container.classList.remove('many-coins');
        
        const groups = Math.floor(count / 5);
        const remainder = count % 5;
        
        // 硬貨の種類に応じた色を取得（draw.jsと同じ方式で取得）
        const className = classNames[getClassIdFromCoinId(coinId)];
        const borderColor = getCoinColor(className);
        
        // 5枚グループを表示
        for (let g = 0; g < groups; g++) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'five-coin-group';
            
            // 硬貨の種類に応じて枠線の色を設定（現在のテーマの色を使用）
            groupDiv.style.border = `3px solid ${borderColor}`;
            groupDiv.style.borderRadius = '12px';
            groupDiv.style.backgroundColor = `${borderColor}1a`; // 透明度を追加
            groupDiv.style.boxShadow = `0 2px 8px ${borderColor}4d`; // 影の色も同じ色に
            
            for (let i = 0; i < 5; i++) {
                const img = document.createElement('img');
                img.src = `images/${coinId}.jpg`;
                img.alt = `${coinId} coin`;
                img.className = 'coin_image';
                groupDiv.appendChild(img);
            }
            
            container.appendChild(groupDiv);
        }
        
        // 余りの硬貨を個別に表示
        for (let i = 0; i < remainder; i++) {
            const img = document.createElement('img');
            img.src = `images/${coinId}.jpg`;
            img.alt = `${coinId} coin`;
            img.className = 'coin_image';
            container.appendChild(img);
        }
        
    } else {
        // 5枚未満の場合は従来通り個別表示
        container.classList.remove('many-coins', 'has-five-group');
        
        for (let i = 0; i < count; i++) {
            const img = document.createElement('img');
            img.src = `images/${coinId}.jpg`;
            img.alt = `${coinId} coin`;
            img.className = 'coin_image';
            container.appendChild(img);
        }
    }
}