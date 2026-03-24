// 全局变量
let currentUser = null;
let groups = [];
let currentGroup = null;
let messages = [];
let images = [];

// 模拟用户数据
let users = [
    { id: 1, username: 'user1', password: '123456' },
    { id: 2, username: 'user2', password: '123456' },
    { id: 3, username: 'user3', password: '123456' }
];

// 模拟群聊数据
const initialGroups = [
    { id: 1, name: '默认群聊', members: [1, 2, 3] }
];

// 初始化应用
function initApp() {
    // 从localStorage加载数据
    loadData();
    
    // 初始化事件监听器
    initEventListeners();
    
    // 渲染初始数据
    renderGroups();
    renderChatMessages();
    renderImagesByDate();
    
    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date-select').value = today;
}

// 从localStorage加载数据
function loadData() {
    const savedUsers = localStorage.getItem('users');
    const savedGroups = localStorage.getItem('groups');
    const savedMessages = localStorage.getItem('messages');
    const savedImages = localStorage.getItem('images');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    } else {
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    if (savedGroups) {
        groups = JSON.parse(savedGroups);
    } else {
        groups = initialGroups;
        localStorage.setItem('groups', JSON.stringify(groups));
    }
    
    if (savedMessages) {
        messages = JSON.parse(savedMessages);
    } else {
        messages = [];
        localStorage.setItem('messages', JSON.stringify(messages));
    }
    
    if (savedImages) {
        images = JSON.parse(savedImages);
    } else {
        images = [];
        localStorage.setItem('images', JSON.stringify(images));
    }
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateLoginStatus();
    }
}

// 保存数据到localStorage
function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('groups', JSON.stringify(groups));
    localStorage.setItem('messages', JSON.stringify(messages));
    localStorage.setItem('images', JSON.stringify(images));
    if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

// 初始化事件监听器
function initEventListeners() {
    // 登录按钮点击事件
    document.getElementById('login-btn').addEventListener('click', () => {
        document.getElementById('login-modal').classList.remove('hidden');
    });
    
    // 关闭登录模态框
    document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('login-modal').classList.add('hidden');
    });
    
    // 登录提交
    document.getElementById('login-submit').addEventListener('click', login);
    
    // 切换到注册
    document.getElementById('switch-to-register').addEventListener('click', () => {
        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('register-modal').classList.remove('hidden');
    });
    
    // 关闭注册模态框
    document.getElementById('close-register-modal').addEventListener('click', () => {
        document.getElementById('register-modal').classList.add('hidden');
    });
    
    // 切换到登录
    document.getElementById('switch-to-login').addEventListener('click', () => {
        document.getElementById('register-modal').classList.add('hidden');
        document.getElementById('login-modal').classList.remove('hidden');
    });
    
    // 注册提交
    document.getElementById('register-submit').addEventListener('click', register);
    
    // 创建群聊按钮点击事件
    document.getElementById('create-group-btn').addEventListener('click', () => {
        if (!currentUser) {
            alert('请先登录！');
            return;
        }
        document.getElementById('create-group-modal').classList.remove('hidden');
    });
    
    // 关闭创建群聊模态框
    document.getElementById('close-create-group-modal').addEventListener('click', () => {
        document.getElementById('create-group-modal').classList.add('hidden');
    });
    
    // 创建群聊提交
    document.getElementById('create-group-submit').addEventListener('click', createGroup);
    
    // 发送消息
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    
    // 回车发送消息
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // 图片上传
    document.getElementById('image-upload').addEventListener('change', handleImageUpload);
    
    // 日期选择
    document.getElementById('date-select').addEventListener('change', renderImagesByDate);
    
    // 功能导航切换
    document.getElementById('nav-chat').addEventListener('click', () => {
        document.getElementById('chat-content').classList.remove('hidden');
        document.getElementById('images-content').classList.add('hidden');
        document.getElementById('nav-chat').classList.add('bg-blue-100', 'text-blue-600');
        document.getElementById('nav-chat').classList.remove('text-gray-600');
        document.getElementById('nav-images').classList.remove('bg-blue-100', 'text-blue-600');
        document.getElementById('nav-images').classList.add('text-gray-600');
    });
    
    document.getElementById('nav-images').addEventListener('click', () => {
        document.getElementById('chat-content').classList.add('hidden');
        document.getElementById('images-content').classList.remove('hidden');
        document.getElementById('nav-images').classList.add('bg-blue-100', 'text-blue-600');
        document.getElementById('nav-images').classList.remove('text-gray-600');
        document.getElementById('nav-chat').classList.remove('bg-blue-100', 'text-blue-600');
        document.getElementById('nav-chat').classList.add('text-gray-600');
    });
    
    // 关闭通知
    document.getElementById('close-notification').addEventListener('click', () => {
        document.getElementById('notification').classList.remove('show');
    });
}

// 登录功能
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        updateLoginStatus();
        document.getElementById('login-modal').classList.add('hidden');
        saveData();
        showNotification('登录成功', `欢迎回来，${username}！`);
    } else {
        alert('用户名或密码错误！');
    }
}

// 注册功能
function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (username.trim() === '') {
        alert('用户名不能为空！');
        return;
    }
    
    if (password.length < 6) {
        alert('密码长度不能少于6位！');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('两次输入的密码不一致！');
        return;
    }
    
    if (users.some(u => u.username === username)) {
        alert('用户名已存在！');
        return;
    }
    
    const newUser = {
        id: users.length + 1,
        username: username,
        password: password
    };
    
    users.push(newUser);
    currentUser = newUser;
    updateLoginStatus();
    document.getElementById('register-modal').classList.add('hidden');
    saveData();
    showNotification('注册成功', `欢迎加入，${username}！`);
}

// 更新登录状态
function updateLoginStatus() {
    if (currentUser) {
        document.getElementById('login-btn').textContent = `欢迎，${currentUser.username}`;
        document.getElementById('login-btn').classList.remove('bg-blue-600');
        document.getElementById('login-btn').classList.add('bg-gray-200', 'text-gray-800');
        document.getElementById('login-btn').disabled = true;
    }
}

// 创建群聊
function createGroup() {
    const groupName = document.getElementById('group-name').value;
    const inviteUserIds = document.getElementById('invite-user-ids').value
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));
    
    if (groupName.trim() === '') {
        alert('群聊名称不能为空！');
        return;
    }
    
    // 确保创建者在群聊中
    if (!inviteUserIds.includes(currentUser.id)) {
        inviteUserIds.push(currentUser.id);
    }
    
    const newGroup = {
        id: groups.length + 1,
        name: groupName,
        members: inviteUserIds
    };
    
    groups.push(newGroup);
    currentGroup = newGroup;
    document.getElementById('create-group-modal').classList.add('hidden');
    saveData();
    renderGroups();
    renderChatMessages();
    showNotification('群聊创建成功', `成功创建群聊：${groupName}`);
}

// 渲染群聊列表
function renderGroups() {
    const groupList = document.getElementById('group-list');
    groupList.innerHTML = '';
    
    groups.forEach(group => {
        // 只显示用户所在的群聊
        if (currentUser && group.members.includes(currentUser.id)) {
            const groupItem = document.createElement('li');
            groupItem.className = `group-item ${currentGroup?.id === group.id ? 'active' : ''}`;
            groupItem.textContent = group.name;
            groupItem.addEventListener('click', () => {
                currentGroup = group;
                document.getElementById('current-group-name').textContent = group.name;
                renderGroups();
                renderChatMessages();
            });
            groupList.appendChild(groupItem);
        }
    });
}

// 发送消息
function sendMessage() {
    if (!currentUser) {
        alert('请先登录！');
        return;
    }
    
    if (!currentGroup) {
        alert('请先选择群聊！');
        return;
    }
    
    const input = document.getElementById('chat-input');
    const content = input.value.trim();
    
    if (content) {
        const newMessage = {
            id: Date.now(),
            groupId: currentGroup.id,
            sender: currentUser.username,
            content: content,
            timestamp: new Date().toISOString()
        };
        
        messages.push(newMessage);
        renderChatMessages();
        input.value = '';
        saveData();
        
        // 通知其他群成员
        currentGroup.members.forEach(memberId => {
            if (memberId !== currentUser.id) {
                const member = users.find(u => u.id === memberId);
                if (member) {
                    // 这里只是模拟通知，实际项目中需要实时推送
                    console.log(`通知 ${member.username}：${currentUser.username} 在群聊 ${currentGroup.name} 中发送了消息`);
                }
            }
        });
    }
}

// 渲染聊天消息
function renderChatMessages() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    
    if (!currentGroup) {
        chatMessages.innerHTML = '<div class="text-center text-gray-500 py-8">请先选择一个群聊</div>';
        return;
    }
    
    const groupMessages = messages.filter(msg => msg.groupId === currentGroup.id);
    
    groupMessages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${message.sender === currentUser?.username ? 'own' : 'other'} fade-in`;
        
        const senderElement = document.createElement('div');
        senderElement.className = 'sender';
        senderElement.textContent = `${message.sender} ${formatTime(message.timestamp)}`;
        
        const contentElement = document.createElement('div');
        contentElement.className = 'content';
        contentElement.textContent = message.content;
        
        messageElement.appendChild(senderElement);
        messageElement.appendChild(contentElement);
        chatMessages.appendChild(messageElement);
    });
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 处理图片上传
function handleImageUpload(e) {
    if (!currentUser) {
        alert('请先登录！');
        return;
    }
    
    const file = e.target.files[0];
    if (file) {
        // 这里使用模拟的图片URL，实际项目中应该上传到服务器
        const imageUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20uploaded%20image&image_size=square`;
        
        const newImage = {
            id: Date.now(),
            user: currentUser.username,
            userId: currentUser.id,
            url: imageUrl,
            timestamp: new Date().toISOString()
        };
        
        images.push(newImage);
        renderImagesByDate();
        saveData();
        
        // 显示上传成功提示
        showNotification('图片上传成功', '您的图片已成功上传！');
        
        // 同步到所有群聊
        groups.forEach(group => {
            if (group.members.includes(currentUser.id)) {
                const imageMessage = {
                    id: Date.now() + 1,
                    groupId: group.id,
                    sender: currentUser.username,
                    content: `上传了一张图片`,
                    timestamp: new Date().toISOString(),
                    imageUrl: imageUrl
                };
                messages.push(imageMessage);
                if (currentGroup?.id === group.id) {
                    renderChatMessages();
                }
            }
        });
        saveData();
    }
}

// 按日期渲染图片
function renderImagesByDate() {
    const imageGallery = document.getElementById('image-gallery');
    imageGallery.innerHTML = '';
    
    const selectedDate = document.getElementById('date-select').value;
    const filteredImages = images.filter(image => {
        const imageDate = new Date(image.timestamp).toISOString().split('T')[0];
        return imageDate === selectedDate;
    });
    
    if (filteredImages.length === 0) {
        imageGallery.innerHTML = '<div class="text-center text-gray-500 py-8">该日期没有上传的图片</div>';
        return;
    }
    
    // 按时间排序
    filteredImages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // 按用户分组
    const imagesByUser = {};
    filteredImages.forEach(image => {
        if (!imagesByUser[image.user]) {
            imagesByUser[image.user] = [];
        }
        imagesByUser[image.user].push(image);
    });
    
    // 渲染每个用户的图片
    Object.entries(imagesByUser).forEach(([user, userImages]) => {
        const userSection = document.createElement('div');
        userSection.className = 'mb-6';
        
        const userHeader = document.createElement('h3');
        userHeader.className = 'text-md font-semibold mb-2 text-gray-700';
        userHeader.textContent = `${user} 的图片`;
        
        const imagesContainer = document.createElement('div');
        imagesContainer.className = 'timeline-images';
        
        userImages.forEach(image => {
            const imageCard = document.createElement('div');
            imageCard.className = 'image-card fade-in';
            
            const imgElement = document.createElement('img');
            imgElement.src = image.url;
            imgElement.alt = `上传者：${image.user}`;
            
            const imageInfo = document.createElement('div');
            imageInfo.className = 'image-info';
            imageInfo.textContent = `${formatTime(image.timestamp)}`;
            
            imageCard.appendChild(imgElement);
            imageCard.appendChild(imageInfo);
            imagesContainer.appendChild(imageCard);
        });
        
        userSection.appendChild(userHeader);
        userSection.appendChild(imagesContainer);
        imageGallery.appendChild(userSection);
    });
}

// 显示通知
function showNotification(title, message) {
    const notification = document.getElementById('notification');
    const notificationTitle = document.getElementById('notification-title');
    const notificationMessage = document.getElementById('notification-message');
    
    notificationTitle.textContent = title;
    notificationMessage.textContent = message;
    
    notification.classList.add('show');
    
    // 3秒后自动关闭
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// 格式化时间
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

// 初始化应用
initApp();