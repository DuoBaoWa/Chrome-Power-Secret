document.addEventListener('DOMContentLoaded', function() {
    // 元素引用
    const passwordEl = document.getElementById('password');
    const lengthSlider = document.getElementById('lengthSlider');
    const lengthValue = document.getElementById('lengthValue');
    const upperCaseEl = document.getElementById('upperCase');
    const lowerCaseEl = document.getElementById('lowerCase');
    const numbersEl = document.getElementById('numbers');
    const symbolsEl = document.getElementById('symbols');
    const excludeSimilarEl = document.getElementById('excludeSimilar');
    const avoidAmbiguousEl = document.getElementById('avoidAmbiguous');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const strengthMeter = document.getElementById('strengthMeter');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const toast = document.getElementById('toast');
    const presetButtons = document.querySelectorAll('.preset-btn');

    // 字符集
    const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    const similarChars = /[1lI0O]/g;
    const ambiguousChars = /[{}[\]()<>/\\'"]/g;
    
    // 易记密码单词库
    const commonWords = [
        'apple', 'book', 'cat', 'dog', 'earth', 'fire', 'gold', 
        'happy', 'jump', 'king', 'love', 'moon', 'night', 'ocean', 
        'people', 'queen', 'river', 'sun', 'time', 'up', 'voice', 
        'water', 'xray', 'yellow', 'zebra', 'air', 'bird', 'cloud',
        'dance', 'echo', 'friend', 'garden', 'home', 'ice', 'joy',
        'kite', 'light', 'music', 'nature', 'orange', 'paper', 'quick',
        'rain', 'smile', 'tree', 'umbrella', 'violet', 'wind', 'box',
        'year', 'zone', 'star', 'planet', 'flower', 'forest', 'mountain'
    ];

    // 更新密码长度显示
    lengthSlider.addEventListener('input', function() {
        lengthValue.textContent = this.value;
        updateStrengthMeter();
    });

    // 更新密码强度计
    function updateStrengthMeter(password = '') {
        let strength = 0;
        const maxStrength = 100;
        
        if (password) {
            // 基于实际密码的强度计算
            const length = password.length;
            strength += Math.min(length * 2, 30); // 长度贡献最多30分
            
            // 检查字符多样性
            if (/[A-Z]/.test(password)) strength += 15;
            if (/[a-z]/.test(password)) strength += 15;
            if (/[0-9]/.test(password)) strength += 15;
            if (/[^A-Za-z0-9]/.test(password)) strength += 25;
            
            // 检查混合性
            const hasGoodMix = (
                /[A-Z].*[a-z]|[a-z].*[A-Z]/.test(password) && 
                /[A-Za-z].*[0-9]|[0-9].*[A-Za-z]/.test(password)
            );
            if (hasGoodMix) strength += 10;
            
            // 检查是否全是同一类型
            if (/^[A-Z]+$|^[a-z]+$|^[0-9]+$|^[^A-Za-z0-9]+$/.test(password)) {
                strength = Math.max(strength - 30, 10);
            }
        } else {
            // 基于设置的预估强度
            const length = parseInt(lengthSlider.value);
            strength += Math.min(length * 2, 30);
            
            let charTypes = 0;
            if (upperCaseEl.checked) charTypes++;
            if (lowerCaseEl.checked) charTypes++;
            if (numbersEl.checked) charTypes++;
            if (symbolsEl.checked) charTypes++;
            
            strength += charTypes * 15;
            
            if (charTypes >= 3) strength += 10;
            
            if (charTypes === 1) {
                strength = Math.max(strength - 30, 10);
            }
        }
        
        // 确保强度在有效范围内
        strength = Math.max(0, Math.min(strength, maxStrength));
        
        // 更新UI
        strengthMeter.style.width = `${strength}%`;
        
        // 根据强度设置颜色
        if (strength < 30) {
            strengthMeter.style.backgroundColor = '#ea4335'; // 红色 - 弱
        } else if (strength < 60) {
            strengthMeter.style.backgroundColor = '#fbbc05'; // 黄色 - 中
        } else if (strength < 80) {
            strengthMeter.style.backgroundColor = '#34a853'; // 绿色 - 强
        } else {
            strengthMeter.style.backgroundColor = '#4285f4'; // 蓝色 - 极强
        }
    }

    // 生成随机密码
    function generatePassword() {
        const length = parseInt(lengthSlider.value);
        let charset = '';
        
        // 至少需要选择一种字符类型
        if (!upperCaseEl.checked && !lowerCaseEl.checked && 
            !numbersEl.checked && !symbolsEl.checked) {
            showToast('请至少选择一种字符类型');
            return '';
        }
        
        // 构建字符集
        if (upperCaseEl.checked) charset += upperCaseChars;
        if (lowerCaseEl.checked) charset += lowerCaseChars;
        if (numbersEl.checked) charset += numberChars;
        if (symbolsEl.checked) charset += symbolChars;
        
        // 排除相似字符
        if (excludeSimilarEl.checked) {
            charset = charset.replace(similarChars, '');
        }
        
        // 避免可能引起混淆的字符
        if (avoidAmbiguousEl.checked) {
            charset = charset.replace(ambiguousChars, '');
        }
        
        if (charset.length === 0) {
            showToast('没有可用的字符来生成密码');
            return '';
        }
        
        // 生成密码
        let password = '';
        const charsetLength = charset.length;
        for (let i = 0; i < length; i++) {
            // 使用更安全的随机数生成
            const randomIndex = Math.floor(Math.random() * charsetLength);
            password += charset.charAt(randomIndex);
        }
        
        return password;
    }

    // 生成易记密码
    function generateMemorablePassword() {
        const useCaps = upperCaseEl.checked;
        const useNumbers = numbersEl.checked;
        const useSymbols = symbolsEl.checked;
        
        // 选择1-3个随机单词
        const wordCount = Math.floor(Math.random() * 2) + 1;
        let words = [];
        
        for (let i = 0; i < wordCount; i++) {
            const randomIndex = Math.floor(Math.random() * commonWords.length);
            let word = commonWords[randomIndex];
            
            // 随机大写首字母
            if (useCaps && Math.random() > 0.5) {
                word = word.charAt(0).toUpperCase() + word.slice(1);
            }
            
            words.push(word);
        }
        
        // 添加数字
        if (useNumbers) {
            const num = Math.floor(Math.random() * 1000);
            words.push(num.toString());
        }
        
        // 添加符号
        if (useSymbols) {
            const symbols = '!@#$%^&*';
            const randomSymbol = symbols.charAt(Math.floor(Math.random() * symbols.length));
            
            // 随机插入符号
            const randomPosition = Math.floor(Math.random() * (words.length + 1));
            words.splice(randomPosition, 0, randomSymbol);
        }
        
        return words.join('');
    }

    // 生成PIN码
    function generatePinCode() {
        const length = parseInt(lengthSlider.value);
        let pin = '';
        
        for (let i = 0; i < length; i++) {
            pin += Math.floor(Math.random() * 10).toString();
        }
        
        return pin;
    }

    // 应用预设
    function applyPreset(preset) {
        switch (preset) {
            case 'pin':
                lengthSlider.value = 6;
                lengthValue.textContent = '6';
                upperCaseEl.checked = false;
                lowerCaseEl.checked = false;
                numbersEl.checked = true;
                symbolsEl.checked = false;
                excludeSimilarEl.checked = false;
                avoidAmbiguousEl.checked = false;
                passwordEl.value = generatePinCode();
                break;
            case 'memorable':
                lengthSlider.value = 12;
                lengthValue.textContent = '12';
                upperCaseEl.checked = true;
                lowerCaseEl.checked = true;
                numbersEl.checked = true;
                symbolsEl.checked = true;
                excludeSimilarEl.checked = false;
                avoidAmbiguousEl.checked = false;
                passwordEl.value = generateMemorablePassword();
                break;
            case 'strong':
                lengthSlider.value = 16;
                lengthValue.textContent = '16';
                upperCaseEl.checked = true;
                lowerCaseEl.checked = true;
                numbersEl.checked = true;
                symbolsEl.checked = true;
                excludeSimilarEl.checked = false;
                avoidAmbiguousEl.checked = false;
                passwordEl.value = generatePassword();
                break;
            case 'super':
                lengthSlider.value = 32;
                lengthValue.textContent = '32';
                upperCaseEl.checked = true;
                lowerCaseEl.checked = true;
                numbersEl.checked = true;
                symbolsEl.checked = true;
                excludeSimilarEl.checked = false;
                avoidAmbiguousEl.checked = false;
                passwordEl.value = generatePassword();
                break;
        }
        
        updateStrengthMeter(passwordEl.value);
        saveToHistory(passwordEl.value);
    }

    // 显示提示消息
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    // 复制密码到剪贴板
    function copyPassword() {
        const password = passwordEl.value;
        
        if (!password) {
            showToast('没有密码可复制');
            return;
        }
        
        // 使用标准DOM API复制
        const textArea = document.createElement('textarea');
        textArea.value = password;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            showToast('密码已复制到剪贴板');
        } catch (err) {
            showToast('复制失败，请手动复制');
            console.error('无法复制: ', err);
        }
        
        document.body.removeChild(textArea);
    }

    // 从本地存储加载历史记录
    function loadHistory() {
        let history = [];
        try {
            history = JSON.parse(localStorage.getItem('passwordHistory')) || [];
        } catch (e) {
            console.error('加载历史记录失败:', e);
            history = [];
        }
        
        historyList.innerHTML = '';
        
        if (history.length === 0) {
            historyList.innerHTML = '<div class="history-item">暂无历史记录</div>';
            return;
        }
        
        history.forEach((password, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <span class="history-password" title="${password}">${password}</span>
                <div class="history-actions">
                    <button class="history-btn" data-action="use" data-index="${index}" title="使用此密码">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="9 11 12 14 22 4"></polyline>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                    </button>
                    <button class="history-btn" data-action="copy" data-password="${password}" title="复制密码">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                </div>
            `;
            historyList.appendChild(historyItem);
        });
    }

    // 保存密码到历史记录
    function saveToHistory(password) {
        if (!password) return;
        
        let history = [];
        try {
            history = JSON.parse(localStorage.getItem('passwordHistory')) || [];
        } catch (e) {
            console.error('加载历史记录失败:', e);
            history = [];
        }
        
        // 如果已存在相同密码，则移除
        history = history.filter(p => p !== password);
        
        // 添加到历史记录开头
        history.unshift(password);
        
        // 只保留最近10条历史记录
        if (history.length > 10) {
            history = history.slice(0, 10);
        }
        
        try {
            localStorage.setItem('passwordHistory', JSON.stringify(history));
        } catch (e) {
            console.error('保存历史记录失败:', e);
        }
        
        loadHistory();
    }

    // 清空历史记录
    function clearHistory() {
        try {
            localStorage.removeItem('passwordHistory');
        } catch (e) {
            console.error('清空历史记录失败:', e);
        }
        
        loadHistory();
        showToast('历史记录已清空');
    }

    // 处理历史记录按钮点击
    historyList.addEventListener('click', function(e) {
        const target = e.target.closest('.history-btn');
        if (!target) return;
        
        const action = target.dataset.action;
        
        if (action === 'use') {
            const index = parseInt(target.dataset.index);
            let history = [];
            
            try {
                history = JSON.parse(localStorage.getItem('passwordHistory')) || [];
            } catch (e) {
                console.error('加载历史记录失败:', e);
                history = [];
            }
            
            if (history[index]) {
                passwordEl.value = history[index];
                updateStrengthMeter(history[index]);
                showToast('已加载密码');
            }
        } else if (action === 'copy') {
            const password = target.dataset.password;
            
            // 使用标准DOM API复制
            const textArea = document.createElement('textarea');
            textArea.value = password;
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                showToast('密码已复制到剪贴板');
            } catch (err) {
                showToast('复制失败，请手动复制');
            }
            
            document.body.removeChild(textArea);
        }
    });

    // 绑定事件处理
    generateBtn.addEventListener('click', function() {
        const password = generatePassword();
        if (password) {
            passwordEl.value = password;
            updateStrengthMeter(password);
            saveToHistory(password);
        }
    });
    
    copyBtn.addEventListener('click', copyPassword);
    
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    presetButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            applyPreset(this.dataset.preset);
        });
    });
    
    // 密码设置变更时更新强度计
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateStrengthMeter);
    });

    // 初始化
    updateStrengthMeter();
    loadHistory();
    
    // 初始生成一个密码 - 确保这段代码正确执行
    try {
        const initialPassword = generatePassword();
        if (initialPassword) {
            passwordEl.value = initialPassword;
            updateStrengthMeter(initialPassword);
            saveToHistory(initialPassword);
        }
    } catch (e) {
        console.error('初始密码生成失败:', e);
        // 确保至少有一个默认密码
        passwordEl.value = 'Pb4$KmZx9LwQ';
        updateStrengthMeter('Pb4$KmZx9LwQ');
    }
});