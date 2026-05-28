// 配色テーマの定義
const colorThemes = {
    standard: {
        name: 'スタンダード',
        colors: {
        '500': '#ffd90092',  // 500円 - 黄
        '100': '#FF6B35',  // 100円 - オレンジ
        '50': '#82ff4cff',   // 50円 - 緑
        '10': '#2196F3',   // 10円 - 青
        '5': '#ff000063',    // 5円 - ピンク
        '1': '#00e5ff6d'     // 1円 - 空色
        }
    },
    warm: {
        name: 'ウォーム',
        colors: {
            '500': '#FF6B6B',  // 500円 - 明るい赤
            '100': '#FF8E53',  // 100円 - オレンジ
            '50': '#FF6B35',   // 50円 - 濃いオレンジ
            '10': '#FFA726',   // 10円 - 黄オレンジ
            '5': '#FFCA28',    // 5円 - 黄色
            '1': '#FFD54F'     // 1円 - 明るい黄色
        }
    },
    cool: {
        name: 'クール',
        colors: {
            '500': '#1976D2',  // 500円 - 濃い青
            '100': '#1E88E5',  // 100円 - 青
            '50': '#42A5F5',   // 50円 - 明るい青
            '10': '#26C6DA',   // 10円 - シアン
            '5': '#26A69A',    // 5円 - ティール
            '1': '#66BB6A'     // 1円 - 緑
        }
    },
    pastel: {
        name: 'パステル',
        colors: {
            '500': '#FFB3BA',  // 500円 - パステルピンク
            '100': '#FFDFBA',  // 100円 - パステルオレンジ
            '50': '#FFFFBA',   // 50円 - パステル黄色
            '10': '#BAFFC9',   // 10円 - パステル緑
            '5': '#BAE1FF',    // 5円 - パステル青
            '1': '#E1BAFF'     // 1円 - パステル紫
        }
    },
    neon: {
        name: 'ネオン',
        colors: {
            '500': '#FF073A',  // 500円 - ネオンレッド
            '100': '#FF8C00',  // 100円 - ネオンオレンジ
            '50': '#FFD700',   // 50円 - ネオンゴールド
            '10': '#00FF7F',   // 10円 - ネオングリーン
            '5': '#00BFFF',    // 5円 - ネオンブルー
            '1': '#FF1493'     // 1円 - ネオンピンク
        }
    },
    rainbow: {
        name: 'レインボー',
        colors: {
            '500': '#FF0000',  // 500円 - 赤
            '100': '#FF8000',  // 100円 - オレンジ
            '50': '#FFFF00',   // 50円 - 黄色
            '10': '#00FF00',   // 10円 - 緑
            '5': '#0080FF',    // 5円 - 青
            '1': '#8000FF'     // 1円 - 紫
        }
    }
}

// 現在選択されているテーマ
let currentTheme = 'standard';
let isThemeSelectorMinimized = true; // 初期状態は最小化

const ANIMATION_DURATION = 300; // アニメーションの継続時間(ミリ秒)

// テーマを変更する関数
function changeColorTheme(themeName) {
    if (colorThemes[themeName]) {
        currentTheme = themeName;
        // テーマ選択ボタンの表示を更新
        updateThemeButtonDisplay();
        console.log(`配色テーマを "${colorThemes[themeName].name}" に変更しました`);
    }
}

// テーマ選択ボタンの表示を更新
function updateThemeButtonDisplay() {
    const buttons = document.querySelectorAll('.theme-button');
    buttons.forEach(button => {
        if (button.dataset.theme === currentTheme) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// テーマセレクターの表示・非表示を切り替え
function toggleThemeSelector() {
    const themeSelector = document.getElementById('theme-selector');
    const overlay = document.getElementById('theme-overlay');
    const toggleButton = document.querySelector('.toggle-button');
    
    if (themeSelector) {
        isThemeSelectorMinimized = !isThemeSelectorMinimized;
        
        if (isThemeSelectorMinimized) {
            // 最小化
            themeSelector.classList.add('minimized');
            overlay.classList.remove('show');
            toggleButton.textContent = '⚙';
        } else {
            // 展開
            themeSelector.classList.remove('minimized');
            overlay.classList.add('show');
            toggleButton.textContent = '×';
        }
    }
}

// オーバーレイクリックで最小化
function handleOverlayClick() {
    if (!isThemeSelectorMinimized) {
        toggleThemeSelector();
    }
}

// 硬貨の種類に応じた色の取得（現在のテーマを使用）
function getCoinColor(className) {
    const theme = colorThemes[currentTheme];
    return theme.colors[className] || '#808080'; // デフォルトは灰色
}

// テーマ選択UIを初期化
function initializeThemeSelector() {
    // オーバーレイを作成
    if (!document.getElementById('theme-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'theme-overlay';
        overlay.className = 'theme-overlay';
        overlay.addEventListener('click', handleOverlayClick);
        document.body.appendChild(overlay);
    }
    
    // テーマ選択パネルが存在しない場合は作成
    if (!document.getElementById('theme-selector')) {
        const themePanel = document.createElement('div');
        themePanel.id = 'theme-selector';
        themePanel.className = 'theme-selector minimized'; // 初期状態は最小化
        
        // ヘッダー部分（タイトルと切り替えボタン）
        const header = document.createElement('div');
        header.className = 'theme-header';
        
        const title = document.createElement('h3');
        title.textContent = '配色テーマ';
        title.className = 'theme-title';
        
        // 切り替えボタン
        const toggleButton = document.createElement('button');
        toggleButton.className = 'toggle-button';
        toggleButton.textContent = '⚙'; // 初期状態は最小化なので歯車アイコン
        toggleButton.addEventListener('click', toggleThemeSelector);
        
        header.appendChild(title);
        header.appendChild(toggleButton);
        themePanel.appendChild(header);
        
        // テーマボタンコンテナ
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'theme-buttons';
        
        // 各テーマのボタンを作成
        Object.keys(colorThemes).forEach(themeKey => {
            const button = document.createElement('button');
            button.textContent = colorThemes[themeKey].name;
            button.className = 'theme-button';
            button.dataset.theme = themeKey;
            
            // プレビュー用の色サンプルを追加
            const colorPreview = document.createElement('div');
            colorPreview.className = 'color-preview';
            const coins = ['500', '100', '50', '10', '5', '1'];
            coins.forEach(coin => {
                const colorSample = document.createElement('span');
                colorSample.className = 'color-sample';
                colorSample.style.backgroundColor = colorThemes[themeKey].colors[coin];
                colorPreview.appendChild(colorSample);
            });
            
            button.appendChild(colorPreview);
            
            button.addEventListener('click', () => {
                changeColorTheme(themeKey);
            });
            
            buttonContainer.appendChild(button);
        });
        
        themePanel.appendChild(buttonContainer);
        
        // テーマパネルをbody要素に追加
        document.body.appendChild(themePanel);
    }
    
    updateThemeButtonDisplay();
}

// ページ読み込み時にテーマセレクターを初期化
document.addEventListener('DOMContentLoaded', () => {
    initializeThemeSelector();
});