// 全局变量
let currentImage = null;
let reminderInterval = null;

// DOM元素
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const caption = document.getElementById('caption');
const saveBtn = document.getElementById('saveBtn');
const historyList = document.getElementById('historyList');
const exportBtn = document.getElementById('exportBtn');
const reminderToggle = document.getElementById('reminderToggle');
const nextReminder = document.getElementById('nextReminder').querySelector('span');
const reminderDialog = document.getElementById('reminderDialog');
const dialogClose = document.getElementById('dialogClose');
const dialogUpload = document.getElementById('dialogUpload');
const restStartTime = document.getElementById('restStartTime');
const restEndTime = document.getElementById('restEndTime');
const requestPermissionBtn = document.getElementById('requestPermissionBtn');
const permissionStatus = document.getElementById('permissionStatus').querySelector('span');

// 初始化
function init() {
    loadHistory();
    setupEventListeners();
    setupReminder();
    updatePermissionStatus();
}

// 请求通知权限
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            updatePermissionStatus();
        });
    }
}

// 更新权限状态显示
function updatePermissionStatus() {
    if ('Notification' in window) {
        const status = Notification.permission;
        switch (status) {
            case 'granted':
                permissionStatus.textContent = '已允许';
                permissionStatus.style.color = '#27ae60';
                break;
            case 'denied':
                permissionStatus.textContent = '已拒绝';
                permissionStatus.style.color = '#e74c3c';
                break;
            default:
                permissionStatus.textContent = '未请求';
                permissionStatus.style.color = '#f39c12';
        }
    } else {
        permissionStatus.textContent = '不支持';
        permissionStatus.style.color = '#95a5a6';
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 图片上传
    fileInput.addEventListener('change', handleFileUpload);
    
    // 保存记录
    saveBtn.addEventListener('click', saveRecord);
    
    // 导出PDF
    exportBtn.addEventListener('click', exportPDF);
    
    // 提醒设置
    reminderToggle.addEventListener('change', toggleReminder);
    
    // 休息时间设置
    restStartTime.addEventListener('change', setupReminder);
    restEndTime.addEventListener('change', setupReminder);
    
    // 通知权限
    requestPermissionBtn.addEventListener('click', requestNotificationPermission);
    
    // 对话框
    dialogClose.addEventListener('click', () => reminderDialog.classList.add('hidden'));
    dialogUpload.addEventListener('click', () => {
        reminderDialog.classList.add('hidden');
        fileInput.click();
    });
}

// 处理文件上传
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImage = e.target.result;
            imagePreview.innerHTML = `<img src="${currentImage}" alt="预览">`;
        };
        reader.readAsDataURL(file);
    }
}

// 保存记录
function saveRecord() {
    if (!currentImage) {
        alert('请先选择图片');
        return;
    }
    
    const record = {
        id: Date.now(),
        image: currentImage,
        caption: caption.value,
        timestamp: new Date().toISOString()
    };
    
    // 获取现有记录
    const records = JSON.parse(localStorage.getItem('diaryRecords') || '[]');
    records.push(record);
    
    // 保存到本地存储
    localStorage.setItem('diaryRecords', JSON.stringify(records));
    
    // 更新历史记录
    loadHistory();
    
    // 重置表单
    resetForm();
    
    // 重置提醒
    setupReminder();
}

// 重置表单
function resetForm() {
    currentImage = null;
    imagePreview.innerHTML = '';
    caption.value = '';
    fileInput.value = '';
}

// 加载历史记录
function loadHistory() {
    const records = JSON.parse(localStorage.getItem('diaryRecords') || '[]');
    historyList.innerHTML = '';
    
    records.forEach(record => {
        const item = document.createElement('div');
        item.className = 'history-item';
        
        const date = new Date(record.timestamp);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        item.innerHTML = `
            <img src="${record.image}" alt="记录">
            <div class="item-content">
                <p class="item-caption">${record.caption || '无描述'}</p>
                <p class="item-time">${formattedDate}</p>
                <button class="delete-btn" data-id="${record.id}">删除</button>
            </div>
        `;
        
        historyList.appendChild(item);
    });
    
    // 添加删除按钮事件监听器
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const recordId = parseInt(this.getAttribute('data-id'));
            deleteRecord(recordId);
        });
    });
}

// 删除记录
function deleteRecord(id) {
    if (confirm('确定要删除这条记录吗？')) {
        const records = JSON.parse(localStorage.getItem('diaryRecords') || '[]');
        const updatedRecords = records.filter(record => record.id !== id);
        localStorage.setItem('diaryRecords', JSON.stringify(updatedRecords));
        loadHistory();
    }
}

// 设置提醒
function setupReminder() {
    // 清除现有提醒
    if (reminderInterval) {
        clearInterval(reminderInterval);
    }
    
    if (reminderToggle.checked) {
        // 计算下次提醒时间，跳过休息时间
        const now = new Date();
        let nextReminderTime = new Date(now);
        nextReminderTime.setHours(now.getHours() + 1);
        nextReminderTime.setMinutes(0);
        nextReminderTime.setSeconds(0);
        
        // 检查下次提醒时间是否在休息时间内
        while (isInRestTimeForDate(nextReminderTime)) {
            // 如果在休息时间内，顺延到下一个小时
            nextReminderTime.setHours(nextReminderTime.getHours() + 1);
        }
        
        // 更新下次提醒时间显示
        const formattedTime = `${nextReminderTime.getHours().toString().padStart(2, '0')}:${nextReminderTime.getMinutes().toString().padStart(2, '0')}`;
        nextReminder.textContent = formattedTime;
        
        // 计算时间差（毫秒）
        const timeUntilNextReminder = nextReminderTime - now;
        
        // 延迟执行第一次提醒
        setTimeout(() => {
            showReminder();
            
            // 之后每小时检查一次
            reminderInterval = setInterval(() => {
                // 检查当前时间是否在休息时间内
                if (!isInRestTime()) {
                    showReminder();
                }
            }, 60 * 60 * 1000);
        }, timeUntilNextReminder);
    } else {
        nextReminder.textContent = '已关闭';
    }
}

// 检查指定日期是否在休息时间内
function isInRestTimeForDate(date) {
    const currentHour = date.getHours();
    const currentMinute = date.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const [startHour, startMinute] = restStartTime.value.split(':').map(Number);
    const [endHour, endMinute] = restEndTime.value.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    // 处理跨天的情况（例如22:00到08:00）
    if (startTime > endTime) {
        return currentTime >= startTime || currentTime <= endTime;
    } else {
        return currentTime >= startTime && currentTime <= endTime;
    }
}

// 切换提醒
function toggleReminder() {
    setupReminder();
}

// 检查是否在休息时间内
function isInRestTime() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const [startHour, startMinute] = restStartTime.value.split(':').map(Number);
    const [endHour, endMinute] = restEndTime.value.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    // 处理跨天的情况（例如22:00到08:00）
    if (startTime > endTime) {
        return currentTime >= startTime || currentTime <= endTime;
    } else {
        return currentTime >= startTime && currentTime <= endTime;
    }
}

// 显示提醒
function showReminder() {
    // 检查是否在休息时间内
    if (isInRestTime()) {
        // 在休息时间内，不显示提醒
        console.log('当前在休息时间内，跳过提醒');
        return;
    }
    
    reminderDialog.classList.remove('hidden');
    
    // 发送浏览器通知
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('每日日记提醒', {
            body: '该上传图片了！记得记录你此刻的生活瞬间',
            icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAgNWMxMy44IDAgMjUgMTEuMiAyNSAyNXYyNWMwIDEzLjgtMTEuMiAyNS0yNSAyNVMyNSA1MCAxMiA1MC0yNSA0Mi44LTI1IDMwVjI5YzAtMTMuOCAxMS4yLTI1IDI1LTI1eiIgZmlsbD0iIzY2N2VlYSIvPjwvc3ZnPg=='
        });
    }
    
    // 播放提示音（如果需要）
    // const audio = new Audio('notification.mp3');
    // audio.play();
}

// 导出PDF
function exportPDF() {
    const records = JSON.parse(localStorage.getItem('diaryRecords') || '[]');
    
    if (records.length === 0) {
        alert('没有可导出的记录');
        return;
    }
    
    // 创建导出容器
    const exportContainer = document.createElement('div');
    exportContainer.style.cssText = `
        width: 700px;
        padding: 50px;
        background: white;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.8;
    `;
    
    // 添加标题
    const title = document.createElement('h1');
    title.textContent = '每日日记';
    title.style.cssText = `
        text-align: center;
        color: #667eea;
        margin-bottom: 50px;
        font-size: 2.8em;
        font-weight: bold;
    `;
    exportContainer.appendChild(title);
    
    // 添加记录
    records.forEach(record => {
        const recordElement = document.createElement('div');
        recordElement.style.cssText = `
            margin-bottom: 60px;
            padding-bottom: 30px;
            border-bottom: 2px solid #eee;
        `;
        
        const date = new Date(record.timestamp);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        recordElement.innerHTML = `
            <p style="color: #666; margin-bottom: 20px; font-size: 1.2em; font-weight: 500;">${formattedDate}</p>
            <img src="${record.image}" alt="记录" style="max-width: 100%; height: auto; max-height: 400px; margin-bottom: 25px; border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <p style="line-height: 1.8; font-size: 1.1em; color: #333;">${record.caption || '无描述'}</p>
        `;
        
        exportContainer.appendChild(recordElement);
    });
    
    // 添加到页面
    document.body.appendChild(exportContainer);
    
    // 使用html2canvas和jsPDF生成PDF
    html2canvas(exportContainer).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        pdf.save(`daily-diary-${new Date().toISOString().split('T')[0]}.pdf`);
        
        // 移除临时容器
        document.body.removeChild(exportContainer);
    });
}

// 初始化应用
init();