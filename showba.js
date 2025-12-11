// showba.js - 小北百貨大掃除轉盤抽獎
// 功能：每次進入網站只有一次抽獎機會，隨機中獎但依權重比例

// ==================== 設定區 ====================
const INITIAL_SPIN_COUNT = 1;
// ===============================================

// 獎項配置（順序必須與轉盤上的順序一致）
// 現在調整為：頭獎(1), 二獎(2), 三獎(3), 四獎(4), 五獎(5), 安慰獎
// 獎項配置（順序必須與轉盤上的順序一致）
// 現在調整為：頭獎(1), 二獎(2), 三獎(3), 四獎(4), 安慰獎
const prizes = [
    { 
        name: "好神拖 免手洗旋轉拖把組（含雙拖布）",
        value: "NT$1,099", 
        color: "#e60012",  // 紅色
        rank: "頭獎",
        index: 0,
        weight: 1,  
        probability: 4.76  
    },
    { 
        name: "3M 除塵紙拖把 + 補充包超值組",
        value: "NT$899", 
        color: "#FFD700",  // 金色
        rank: "二獎",
        index: 1,
        weight: 2,
        probability: 9.52  
    },
    { 
        name: "伸縮多功能掃天花板除塵刷（清潔神器）",
        value: "NT$699", 
        color: "#66BB6A",  // 綠色
        rank: "三獎",
        index: 2,
        weight: 5,
        probability: 23.81  
    },
    { 
        name: "妙管家 超強清潔組（廚房+浴室去汙大禮包）",
        value: "NT$599", 
        color: "#42A5F5",  // 藍色
        rank: "四獎",
        index: 3,
        weight: 4,
        probability: 19.05  
    },
    { 
        name: "浴室瓷磚去垢海綿組（4入）",
        value: "NT$129", 
        color: "#AB47BC",  // 紫色
        rank: "安慰獎",
        index: 4,
        weight: 6,
        probability: 28.57  
    }
];


// 根據權重隨機選擇獎項（權重越大，中獎機率越高）
function getRandomPrizeIndex() {
    // 創建權重陣列
    const weights = prizes.map(prize => prize.weight);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    
    // 生成隨機數
    let random = Math.random() * totalWeight;
    
    // 根據權重選擇獎項
    for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return i;
        }
    }
    
    // 默認返回最後一個獎項（安慰獎）
    return prizes.length - 1;
}

// 計算每個獎項的角度範圍（順時針方向）
function calculateAngles(prizes) {
    const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);
    const angles = [];
    let currentAngle = 0; // 從0度（3點鐘方向）開始，順時針
    
    prizes.forEach((prize) => {
        const angle = (prize.weight / totalWeight) * (2 * Math.PI);
        angles.push({
            startAngle: currentAngle,
            endAngle: currentAngle + angle,
            centerAngle: currentAngle + (angle / 2),
            prize: prize
        });
        currentAngle += angle;
    });
    
    return angles;
}

// 根據當前旋轉角度找到指針指向的獎項（指針在12點鐘方向）
function getPrizeAtPointer(currentRotation) {
    const angles = calculateAngles(prizes);
    
    // 重要：指針固定在12點鐘方向（-90度或270度）
    const pointerAngleRad = -Math.PI / 2; // -90度
    
    // 計算每個扇形旋轉後的中心角度
    for (let i = 0; i < angles.length; i++) {
        const angle = angles[i];
        // 扇形旋轉後的中心角度
        const rotatedCenterAngle = (angle.centerAngle + currentRotation) % (2 * Math.PI);
        
        // 計算與指針的角度差
        let angleDiff = Math.abs(rotatedCenterAngle - pointerAngleRad);
        // 確保角度差在0~π範圍
        if (angleDiff > Math.PI) {
            angleDiff = 2 * Math.PI - angleDiff;
        }
        
        // 如果角度差小於扇形角度的一半，則認為指向該扇形
        const sliceAngle = angle.endAngle - angle.startAngle;
        if (angleDiff <= sliceAngle / 2) {
            return i;
        }
    }
    
    // 如果沒找到，使用更精確的方法
    return getExactPrizeAtPointer(currentRotation);
}

// 更精確的指針指向計算
function getExactPrizeAtPointer(currentRotation) {
    const angles = calculateAngles(prizes);
    const pointerAngleRad = -Math.PI / 2; // 12點鐘方向
    
    // 正規化轉盤旋轉角度到0~2π範圍
    let normalizedRotation = currentRotation % (2 * Math.PI);
    if (normalizedRotation < 0) normalizedRotation += 2 * Math.PI;
    
    // 計算每個扇形旋轉後的起點和終點
    for (let i = 0; i < angles.length; i++) {
        const angle = angles[i];
        let startAngle = (angle.startAngle + normalizedRotation) % (2 * Math.PI);
        let endAngle = (angle.endAngle + normalizedRotation) % (2 * Math.PI);
        
        if (startAngle < 0) startAngle += 2 * Math.PI;
        if (endAngle < 0) endAngle += 2 * Math.PI;
        
        // 檢查指針是否在這個扇形範圍內
        if (startAngle <= endAngle) {
            // 正常情況：startAngle <= pointerAngleRad <= endAngle
            if (pointerAngleRad >= startAngle && pointerAngleRad <= endAngle) {
                return i;
            }
        } else {
            // 跨過0度的情況：扇形包含0度
            if (pointerAngleRad >= startAngle || pointerAngleRad <= endAngle) {
                return i;
            }
        }
    }
    
    return 0; // 默認返回頭獎
}

// 狀態變數
let spinCount = INITIAL_SPIN_COUNT;
let isSpinning = false;
let currentRotation = 0;
let currentPrizeIndex = null; // 儲存這次的中獎結果

// DOM 元素
const wheelCanvas = document.getElementById('wheelCanvas');
const spinButton = document.getElementById('spinButton');
const resultDisplay = document.getElementById('result');
const remainingSpinsDisplay = document.getElementById('remainingSpins');
const ctx = wheelCanvas.getContext('2d');

// ==================== 繪製轉盤函數 ====================
function drawWheel() {
    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    const radius = Math.min(centerX, centerY) - 25;
    const angles = calculateAngles(prizes);
    
    // 清除畫布
    ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
    
    // 繪製外圓
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();
    
    // 繪製每個獎項扇形
    prizes.forEach((prize, index) => {
        const angleInfo = angles[index];
        const startAngle = angleInfo.startAngle;
        const endAngle = angleInfo.endAngle;
        const centerAngle = angleInfo.centerAngle;
        const sliceAngle = endAngle - startAngle;
        
        // 繪製扇形
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        // 創建漸層效果
        const gradient = ctx.createRadialGradient(
            centerX, centerY, radius * 0.3,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, lightenColor(prize.color, 40));
        gradient.addColorStop(1, prize.color);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 繪製扇形邊框
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 繪製分隔線
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + radius * Math.cos(startAngle),
            centerY + radius * Math.sin(startAngle)
        );
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 繪製文字 - 只顯示獎項等級（頭獎、二獎等）
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(centerAngle);
        
        // 調整文字大小
        let fontSize = Math.max(14, Math.min(18, sliceAngle * 60));
        
        // 特殊處理頭獎 - 確保字體夠大
        if (prize.rank === "頭獎") {
            fontSize = Math.max(16, fontSize);
        }
        
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${fontSize}px "Noto Sans TC", sans-serif`;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // 只顯示獎項等級（頭獎、二獎等）
        const textRadius = radius - 35;
        
        // 如果扇形太小，稍微調整位置
        if (sliceAngle < 0.4) {
            // 對於小扇形，把文字放在更靠近外緣的位置
            ctx.fillText(prize.rank, textRadius + 10, 0);
        } else {
            ctx.fillText(prize.rank, textRadius, 0);
        }
        
        ctx.restore();
    });
    
    // 繪製中心圓
    drawCenterCircle(centerX, centerY);
}

// 繪製中心圓
function drawCenterCircle(centerX, centerY) {
    // 外圓
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    const centerGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 30
    );
    centerGradient.addColorStop(0, '#FFFFFF');
    centerGradient.addColorStop(1, '#FF6B6B');
    ctx.fillStyle = centerGradient;
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // 內圓
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    
    // 小北圖標
    ctx.fillStyle = '#e60012';
    ctx.font = 'bold 20px "Poppins"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('北', centerX, centerY);
}

// 輔助函數：變淡顏色
function lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, ((num >> 16) + amt));
    const G = Math.min(255, ((num >> 8 & 0x00FF) + amt));
    const B = Math.min(255, ((num & 0x0000FF) + amt));
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

// ==================== 旋轉轉盤函數 ====================
function spinWheel() {
    if (spinCount <= 0) {
        alert('今日抽獎次數已用完！');
        return;
    }
    
    if (isSpinning) return;
    
    // 隨機選擇獎項（權重越高機率越大）
    currentPrizeIndex = getRandomPrizeIndex();
    console.log('🎯 預定中獎:', prizes[currentPrizeIndex].rank, 
                '機率:', prizes[currentPrizeIndex].probability + '%');
    
    isSpinning = true;
    spinButton.disabled = true;
    spinButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>抽獎中...</span>';
    
    // 添加旋轉動畫類
    wheelCanvas.parentElement.classList.add('spinning');
    
    // 計算目標角度
    const angles = calculateAngles(prizes);
    const targetAngle = angles[currentPrizeIndex].centerAngle;
    
    // 重要：我們要讓目標扇形的中心旋轉到12點鐘方向（-90度）
    const twelveOclock = -Math.PI / 2; // 12點鐘方向
    const neededRotation = twelveOclock - targetAngle;
    
    // 加上多圈旋轉效果（順時針為負）
    const totalSpins = 5 + Math.floor(Math.random() * 3); // 5-7圈隨機
    const extraRotation = -(totalSpins * 2 * Math.PI); // 順時針旋轉為負角度
    
    // 總旋轉角度 = 多圈旋轉 + 需要的旋轉角度
    const totalRotation = extraRotation + neededRotation;
    
    const duration = 3500 + Math.random() * 1500; // 3.5-5秒隨機
    const startTime = Date.now();
    const startRotation = currentRotation;
    
    console.log(`旋轉參數: 目標=${prizes[currentPrizeIndex].rank}, 中心角=${(targetAngle * 180 / Math.PI).toFixed(1)}°, 需要旋轉=${(neededRotation * 180 / Math.PI).toFixed(1)}°, 總旋轉=${(totalRotation * 180 / Math.PI).toFixed(1)}°`);
    
    // 精確的動畫函數
    function animate() {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // 使用緩動函數（先快後慢）
        const easeOutProgress = 1 - Math.pow(1 - progress, 3);
        currentRotation = startRotation + (easeOutProgress * totalRotation);
        
        // 應用旋轉
        wheelCanvas.style.transform = `rotate(${currentRotation}rad)`;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            finishSpin();
        }
    }
    
    requestAnimationFrame(animate);
}

// ==================== 完成旋轉函數 ====================
function finishSpin() {
    // 移除旋轉動畫類
    wheelCanvas.parentElement.classList.remove('spinning');
    
    // 檢查實際指針指向的獎項
    const actualPrizeIndex = getPrizeAtPointer(currentRotation);
    
    console.log('====================');
    console.log('轉盤旋轉完成！');
    console.log('總旋轉角度:', (currentRotation * 180 / Math.PI).toFixed(1) + '°');
    console.log('預定中獎:', prizes[currentPrizeIndex].rank);
    console.log('實際指向:', prizes[actualPrizeIndex].rank);
    console.log('====================');
    
    // 使用實際指向的獎項作為結果
    const finalPrizeIndex = actualPrizeIndex;
    
    // 顯示結果
    showResult(finalPrizeIndex);
    
    // 更新狀態
    spinCount = 0;
    remainingSpinsDisplay.textContent = '0';
    spinButton.disabled = true;
    spinButton.innerHTML = '<i class="fas fa-check"></i><span>已抽獎</span>';
    isSpinning = false;
    
    // 播放慶祝效果
    playCelebration();
}

// ==================== 顯示結果函數 ====================
function showResult(prizeIndex) {
    const prize = prizes[prizeIndex];
    
    // 更新結果顯示
    resultDisplay.innerHTML = `
        <div class="result-icon" style="color: ${prize.color};">
            <i class="fas fa-trophy"></i>
        </div>
        <div class="result-text">
            <h3>🎉 恭喜獲得 ${prize.rank}！</h3>
            <p class="prize-name">${prize.name}</p>
            <p class="prize-value">${prize.value}</p>
            <p class="prize-probability">中獎機率: ${prize.probability}%</p>
            <div class="confetti">✨</div>
        </div>
    `;
    
    // 添加獲獎特效
    resultDisplay.classList.add('winning');
    
    // 播放音效
    playSuccessSound();
    
    // 顯示詳細中獎通知
    setTimeout(() => {
        alert(`🎊 恭喜您！\n\n您抽中了：${prize.rank}\n獎品：${prize.name}\n價值：${prize.value}\n理論機率：${prize.probability}%\n\n請憑此畫面至櫃台兌換！`);
    }, 800);
}

// ==================== 音效函數 ====================
function playSuccessSound() {
    try {
        // 創建音頻上下文
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 創建主音量節點
        const gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);
        gainNode.gain.value = 0.1;
        
        // 播放成功音調
        const playTone = (frequency, startTime, duration) => {
            const oscillator = audioContext.createOscillator();
            const toneGain = audioContext.createGain();
            
            oscillator.connect(toneGain);
            toneGain.connect(gainNode);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            toneGain.gain.setValueAtTime(0, startTime);
            toneGain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
            toneGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        };
        
        // 播放音階：C5, E5, G5, C6
        const now = audioContext.currentTime;
        playTone(523.25, now, 0.2);    // C5
        playTone(659.25, now + 0.1, 0.2); // E5
        playTone(783.99, now + 0.2, 0.2); // G5
        playTone(1046.50, now + 0.3, 0.3); // C6
        
    } catch (error) {
        console.log('音效功能無法使用，但不影響抽獎功能');
    }
}

// ==================== 慶祝效果函數 ====================
function playCelebration() {
    // 創建彩色紙屑效果
    for (let i = 0; i < 30; i++) {
        createConfetti();
    }
}

function createConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.innerHTML = ['🎉', '✨', '🎊', '🏆', '🎁', '🥇'][Math.floor(Math.random() * 6)];
    
    // 隨機位置
    const startX = Math.random() * window.innerWidth;
    const startY = -50;
    
    // 隨機顏色
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#FFA726', '#AB47BC', '#42A5F5'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // 設置初始樣式
    confetti.style.cssText = `
        position: fixed;
        left: ${startX}px;
        top: ${startY}px;
        font-size: ${15 + Math.random() * 10}px;
        color: ${color};
        z-index: 9999;
        pointer-events: none;
        opacity: 0.9;
        transform: rotate(${Math.random() * 360}deg);
    `;
    
    document.body.appendChild(confetti);
    
    // 動畫參數
    const duration = 1500 + Math.random() * 1000;
    const endX = startX + (Math.random() - 0.5) * 200;
    const endY = window.innerHeight + 100;
    const rotation = Math.random() * 720 - 360;
    
    // 執行動畫
    confetti.animate([
        {
            transform: `translate(0, 0) rotate(0deg)`,
            opacity: 1
        },
        {
            transform: `translate(${endX - startX}px, ${endY - startY}px) rotate(${rotation}deg)`,
            opacity: 0
        }
    ], {
        duration: duration,
        easing: 'cubic-bezier(0.1, 0.8, 0.9, 0.1)'
    });
    
    // 移除元素
    setTimeout(() => {
        confetti.remove();
    }, duration);
}

// ==================== 初始化函數 ====================
function init() {
    console.log('=== 小北百貨抽獎系統初始化 ===');
    console.log('每次訪問抽獎次數:', spinCount);
    console.log('所有獎項及機率:');
    prizes.forEach((prize, index) => {
        console.log(`${index}: ${prize.rank} - 權重: ${prize.weight} - 機率: ${prize.probability}%`);
    });
    
    // 初始化剩餘次數顯示
    remainingSpinsDisplay.textContent = spinCount;
    
    // 繪製轉盤
    drawWheel();
    
    // 綁定抽獎按鈕事件
    spinButton.addEventListener('click', spinWheel);
    
    // 初始結果顯示
    resultDisplay.innerHTML = `
        <div class="result-icon">
            <i class="fas fa-gift"></i>
        </div>
        <div class="result-text">
            <p>準備抽獎中...</p>
            <p class="hint">（每次訪問皆有一次機會）</p>
        </div>
    `;
    
}

// ==================== 開發者控制函數 ====================
window.controlLottery = {
    // 查看當前設定
    getSettings: function() {
        return {
            剩餘抽獎次數: spinCount,
            所有獎項: prizes.map((p, i) => `${i}: ${p.rank} - 權重: ${p.weight} - 機率: ${p.probability}%`)
        };
    },
    
    // 測試用：重置抽獎次數
    resetSpins: function() {
        if (confirm('確定要重置抽獎次數嗎？（僅供測試使用）')) {
            spinCount = INITIAL_SPIN_COUNT;
            remainingSpinsDisplay.textContent = spinCount;
            spinButton.disabled = false;
            spinButton.innerHTML = '<i class="fas fa-redo"></i><span>開始抽獎</span>';
            
            // 重置轉盤位置
            wheelCanvas.style.transform = 'rotate(0deg)';
            currentRotation = 0;
            currentPrizeIndex = null;
            
            resultDisplay.innerHTML = `
                <div class="result-icon">
                    <i class="fas fa-gift"></i>
                </div>
                <div class="result-text">
                    <p>抽獎次數已重置！</p>
                    <p class="hint">（您有 ${spinCount} 次抽獎機會）</p>
                </div>
            `;
            
            // 重繪轉盤
            drawWheel();
            
            console.log('抽獎次數已重置為:', spinCount);
        }
    },
    
    // 測試特定獎項
    testPrize: function(index) {
        if (index >= 0 && index < prizes.length) {
            // 直接計算旋轉到該獎項的角度
            const angles = calculateAngles(prizes);
            const targetAngle = angles[index].centerAngle;
            const twelveOclock = -Math.PI / 2;
            const neededRotation = twelveOclock - targetAngle;
            
            currentRotation = neededRotation;
            wheelCanvas.style.transform = `rotate(${currentRotation}rad)`;
            
            // 顯示結果
            showResult(index);
            
            console.log(`測試：${prizes[index].rank}`);
            console.log(`旋轉到: ${(neededRotation * 180 / Math.PI).toFixed(1)}°`);
        } else {
            alert('錯誤：獎項索引必須在 0-5 之間！');
        }
    },
    
    // 重新繪製轉盤
    redrawWheel: function() {
        drawWheel();
        console.log('轉盤已重新繪製');
    },
    
    // 查看當前角度計算
    showAngles: function() {
        const angles = calculateAngles(prizes);
        console.log('\n詳細角度資訊:');
        angles.forEach((angle, index) => {
            const startDeg = (angle.startAngle * 180 / Math.PI).toFixed(1);
            const endDeg = (angle.endAngle * 180 / Math.PI).toFixed(1);
            const centerDeg = (angle.centerAngle * 180 / Math.PI).toFixed(1);
            const rangeDeg = ((angle.endAngle - angle.startAngle) * 180 / Math.PI).toFixed(1);
            console.log(`${prizes[index].rank}: ${rangeDeg}° (${startDeg}° ~ ${endDeg}°) 中心: ${centerDeg}°`);
        });
        return angles;
    },
    
    // 檢查當前指針指向
    checkPointer: function() {
        const prizeIndex = getPrizeAtPointer(currentRotation);
        console.log(`當前旋轉: ${(currentRotation * 180 / Math.PI).toFixed(1)}°`);
        console.log(`指針指向: ${prizes[prizeIndex].rank}`);
        console.log(`獎項中心角度: ${(calculateAngles(prizes)[prizeIndex].centerAngle * 180 / Math.PI).toFixed(1)}°`);
        return prizeIndex;
    },
    
    // 模擬隨機抽獎
    simulateRandom: function() {
        const randomIndex = getRandomPrizeIndex();
        console.log(`隨機抽獎結果: ${prizes[randomIndex].rank} (機率: ${prizes[randomIndex].probability}%)`);
        
        // 直接旋轉到該獎項
        this.testPrize(randomIndex);
        return randomIndex;
    }
};

// ==================== 頁面載入完成後初始化 ====================
document.addEventListener('DOMContentLoaded', init);

// ==================== 視窗大小改變時重新繪製轉盤 ====================
window.addEventListener('resize', () => {
    drawWheel();
});

// ==================== 防止快速點擊 ====================
let lastClickTime = 0;
spinButton.addEventListener('click', (e) => {
    const currentTime = Date.now();
    if (currentTime - lastClickTime < 1000) {
        e.preventDefault();
        return;
    }
    lastClickTime = currentTime;
});