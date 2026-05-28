// quiz.js：クイズ機能の実装

let quizMode = false;
let targetAmount = 0;
let quizActive = false;

// クイズモーダルの開閉
function toggleQuizModal() {
    const modal = document.getElementById('quiz-modal');
    const overlay = document.getElementById('quiz-overlay');
    
    if (modal.classList.contains('show')) {
        modal.classList.remove('show');
        overlay.classList.remove('show');
    } else {
        modal.classList.add('show');
        overlay.classList.add('show');
        // モーダルを開いたときに入力フィールドをクリア
        document.getElementById('target-amount-input').value = '';
        document.getElementById('quiz-result').textContent = '';
        document.getElementById('quiz-result').className = 'quiz-result';
    }
}

// 目標金額を設定
function setTargetAmount() {
    const input = document.getElementById('target-amount-input');
    const amount = parseInt(input.value);
    
    if (isNaN(amount) || amount <= 0) {
        alert('正しい金額を入力してください（1円以上）');
        return;
    }
    
    targetAmount = amount;
    quizMode = true;
    quizActive = true;
    
    // 目標金額を表示
    document.getElementById('target-display').textContent = targetAmount;
    document.getElementById('quiz-info').classList.add('show');
    
    // 結果表示をリセット
    document.getElementById('quiz-result').textContent = '';
    document.getElementById('quiz-result').className = 'quiz-result';
    
    // モーダルを閉じる
    toggleQuizModal();
    
    console.log(`クイズ開始: 目標金額 ${targetAmount}円`);
}

// 答え合わせ
function checkAnswer() {
    if (!quizActive) {
        alert('先に目標金額を設定してください');
        return;
    }
    
    const resultElement = document.getElementById('quiz-result');
    
    if (currentTotal === targetAmount) {
        // 正解
        resultElement.textContent = '🎉 せいかい！';
        resultElement.className = 'quiz-result correct';
        
        // 正解時のアニメーション効果
        confettiEffect();
    } else {
        // 不正解
        const difference = Math.abs(currentTotal - targetAmount);
        if (currentTotal > targetAmount) {
            resultElement.textContent = `❌ ふせいかい（${difference}えんおおいです）`;
        } else {
            resultElement.textContent = `❌ ふせいかい（${difference}えんすくないです）`;
        }
        resultElement.className = 'quiz-result incorrect';
    }
}

// クイズをリセット
function resetQuiz() {
    quizMode = false;
    quizActive = false;
    targetAmount = 0;
    
    document.getElementById('quiz-info').classList.remove('show');
    document.getElementById('quiz-result').textContent = '';
    document.getElementById('quiz-result').className = 'quiz-result';
    
    console.log('クイズをリセットしました');
}

// 正解時の紙吹雪エフェクト（簡易版）
function confettiEffect() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            
            document.body.appendChild(confetti);
            
            // アニメーション終了後に要素を削除
            setTimeout(() => {
                confetti.remove();
            }, 4000);
        }, i * 20);
    }
}

// Enterキーで目標金額を設定
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('target-amount-input');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                setTargetAmount();
            }
        });
    }
    
    // オーバーレイクリックでモーダルを閉じる
    const overlay = document.getElementById('quiz-overlay');
    if (overlay) {
        overlay.addEventListener('click', toggleQuizModal);
    }
});