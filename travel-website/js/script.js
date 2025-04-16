document.addEventListener('DOMContentLoaded', () => {
    const destinations = document.querySelectorAll('.destination');
    let currentIndex = 0;
    let isScrolling = false;
    let isDetailsView = false; // 记录是否处于详情页面
    let currentScrollPosition = 0; // 记录图片滚动位置
    
    // 设置滚动冷却时间，防止连续触发
    const scrollCooldown = 1000; // 1秒
    
    // 处理鼠标滚轮事件
    function handleScroll(event) {
        // 如果正在滚动动画中，不处理新的滚动
        if (isScrolling) return;
        
        // 确定滚动方向
        const delta = Math.sign(event.deltaY);
        
        // 如果当前处于详情页面模式，则滚动图片集
        if (isDetailsView) {
            scrollGallery(delta);
            return;
        }
        
        // 当前处于首页模式，切换目的地
        // 向下滚动 -> 下一个目的地
        if (delta > 0 && currentIndex < destinations.length - 1) {
            currentIndex++;
            switchDestination();
        }
        // 向上滚动 -> 上一个目的地
        else if (delta < 0 && currentIndex > 0) {
            currentIndex--;
            switchDestination();
        }
    }
    
    // 切换到目标目的地
    function switchDestination() {
        isScrolling = true;
        
        // 移除所有 active 类
        destinations.forEach(dest => {
            dest.classList.remove('active');
        });
        
        // 添加 active 类到当前目的地
        destinations[currentIndex].classList.add('active');
        
        // 设置滚动冷却时间
        setTimeout(() => {
            isScrolling = false;
        }, scrollCooldown);
    }
    
    // 处理图片集滚动
    function scrollGallery(direction) {
        const destination = destinations[currentIndex];
        const galleryContainer = destination.querySelector('.gallery-container');
        const galleryItems = destination.querySelectorAll('.gallery-item');
        const itemWidth = galleryItems[0].offsetWidth + 30; // 增加边距计算
        
        // 设置滑动范围限制 - 因为现在可以同时显示两张图片，所以需要调整计算方式
        // 设置最大滑动范围为图片目录的一半，这样即使到达最后也能显示至少两张图片
        const maxScroll = Math.max(0, (galleryItems.length - 2) * itemWidth);
        
        // 设置在滚动中状态
        isScrolling = true;
        
        // 根据滚动方向调整位置
        currentScrollPosition += direction * itemWidth * -1; // 向下滚动是正值，所以乘-1使其向右移动
        
        // 限制范围
        if (currentScrollPosition > 0) {
            currentScrollPosition = 0;
        } else if (currentScrollPosition < -maxScroll) {
            currentScrollPosition = -maxScroll;
        }
        
        // 应用滑动效果，使用更平滑的过渡
        galleryContainer.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)';
        galleryContainer.style.transform = `translateY(-50%) translateX(${currentScrollPosition}px)`;
        
        // 高亮当前可见的图片 - 现在可能同时看到多张图片，需要调整高亮逻辑
        const visibleItemIndex = Math.abs(Math.round(currentScrollPosition / itemWidth));
        galleryItems.forEach((item, index) => {
            // 添加鼠标事件监听
            item.addEventListener('mouseenter', () => {
                if (!isScrolling) {
                    item.style.transform = 'scale(1.15) translateZ(0)';
                    item.style.zIndex = '15'; // 提升悬停层级
                }
            });
            
            item.addEventListener('mouseleave', () => {
                if (!isScrolling) {
                    item.style.transform = index === visibleItemIndex ? 'scale(1.15)' : 'scale(1)';
                    item.style.zIndex = index === visibleItemIndex ? '10' : '1';
                }
            });
            
            // 当前图片及下一张图片都会高亮
            if (index === visibleItemIndex || index === visibleItemIndex + 1) {
                // 当前的主图片效果更强
                if (index === visibleItemIndex) {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1.15)';
                    item.style.filter = 'brightness(1.1)';
                    item.style.boxShadow = '0 15px 35px rgba(0,0,0,0.6)';
                    item.style.border = '2px solid rgba(255, 255, 255, 0.7)';
                    item.style.zIndex = '10';
                } else {
                    // 次要图片有较轻微的高亮效果
                    item.style.opacity = '0.9';
                    item.style.transform = 'scale(1.05)';
                    item.style.filter = 'brightness(1)';
                    item.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
                    item.style.zIndex = '5';
                }
            } else {
                // 非高亮图片的样式
                item.style.opacity = '0.6';
                item.style.transform = 'scale(1)';
                item.style.filter = 'brightness(0.9)';
                item.style.boxShadow = '0 8px 20px rgba(0,0,0,0.4)';
                item.style.border = 'none';
                item.style.zIndex = '1';
            }
        });
        
        // 设置滚动冷却时间
        setTimeout(() => {
            isScrolling = false;
        }, 800); // 与过渡时间相同
    }
    
    // 显示详情页面
    function showDetails(destination) {
        destination.classList.add('show-details');
        isDetailsView = true;
        
        // 重置图片滚动位置
        currentScrollPosition = 0;
        const galleryContainer = destination.querySelector('.gallery-container');
        galleryContainer.style.transition = 'none'; // 先关闭过渡动画
        galleryContainer.style.transform = 'translateY(-50%) translateX(0)';
        
        // 现在可以同时看到多张图片，所以调整高亮逻辑
        const galleryItems = destination.querySelectorAll('.gallery-item');
        galleryItems.forEach((item, index) => {
            // 对于第一张和第二张图片，设置为高亮状态
            if (index === 0 || index === 1) {
                // 第一张图片效果更强
                if (index === 0) {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1.15)';
                    item.style.filter = 'brightness(1.1)';
                    item.style.boxShadow = '0 15px 35px rgba(0,0,0,0.6)';
                    item.style.border = '2px solid rgba(255, 255, 255, 0.7)';
                    item.style.zIndex = '10';
                } else {
                    // 次要图片有较轻微的高亮效果
                    item.style.opacity = '0.9';
                    item.style.transform = 'scale(1.05)';
                    item.style.filter = 'brightness(1)';
                    item.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
                    item.style.zIndex = '5';
                }
            } else {
                // 非高亮图片的样式
                item.style.opacity = '0.6';
                item.style.transform = 'scale(1)';
                item.style.filter = 'brightness(0.9)';
                item.style.boxShadow = '0 8px 20px rgba(0,0,0,0.4)';
                item.style.border = 'none';
                item.style.zIndex = '1';
            }
        });
        
        // 重新启用过渡动画
        setTimeout(() => {
            galleryContainer.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)';
        }, 50);
    }
    
    // 隐藏详情页面
    function hideDetails(destination) {
        destination.classList.remove('show-details');
        isDetailsView = false;
    }
    
    // 点击"查看详情"按钮的效果
    const detailsButtons = document.querySelectorAll('.details-btn');
    detailsButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const destination = btn.closest('.destination');
            showDetails(destination);
        });
    });
    
    // 点击"返回"按钮的效果
    const backButtons = document.querySelectorAll('.back-btn');
    backButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const destination = btn.closest('.destination');
            hideDetails(destination);
        });
    });
    
    // 定制行程按钮事件
    const customButtons = document.querySelectorAll('.custom-btn');
    customButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const customPage = createCustomPage();
            showCustomPage(customPage);
        });
    });
    
    // 监听滚轮事件
    window.addEventListener('wheel', handleScroll);
    
    // 添加键盘控制支持
    document.addEventListener('keydown', (e) => {
        if (isScrolling) return;
        
        // 如果处于详情页面模式
        if (isDetailsView) {
            if (e.key === 'Escape') {
                // Esc键返回主页面
                hideDetails(destinations[currentIndex]);
            } else if (e.key === 'ArrowDown') {
                // 向下键滚动图片集
                scrollGallery(1);
            } else if (e.key === 'ArrowUp') {
                // 向上键滚动图片集
                scrollGallery(-1);
            }
            return;
        }
        
        // 在主页面上切换目的地
        if (e.key === 'ArrowDown' && currentIndex < destinations.length - 1) {
            currentIndex++;
            switchDestination();
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
            currentIndex--;
            switchDestination();
        }
        
        // 在键盘事件监听器中添加关闭逻辑：
        if (document.querySelector('.custom-plan-page.active')) {
            if (e.key === 'Escape') {
                document.querySelector('.custom-plan-page').remove();
            }
        }
    });

    // 客服窗口功能
    const customerServiceBtn = document.getElementById('customerServiceBtn');
    const customerServiceWindow = document.getElementById('customerServiceWindow');
    const csCloseBtn = document.getElementById('csCloseBtn');
    const csInput = document.querySelector('.cs-input');
    const csSendBtn = document.querySelector('.cs-send-btn');

    // 打开客服窗口
    customerServiceBtn.addEventListener('click', () => {
        customerServiceWindow.classList.add('active');
        customerServiceBtn.style.display = 'none'; // 隐藏按钮
    });

    // 关闭客服窗口
    csCloseBtn.addEventListener('click', () => {
        customerServiceWindow.classList.remove('active');
        
        // 延迟显示按钮，等待窗口关闭动画完成
        setTimeout(() => {
            customerServiceBtn.style.display = 'flex';
        }, 300);
    });

    // 发送消息功能
    csSendBtn.addEventListener('click', sendMessage);
    csInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // 发送消息函数
    function sendMessage() {
        const message = csInput.value.trim();
        if (message) {
            // 添加用户消息
            const messagesContainer = document.querySelector('.cs-messages');
            
            const userMessage = document.createElement('div');
            userMessage.className = 'cs-message cs-message-sent';
            userMessage.innerHTML = `
                <div class="cs-bubble">
                    <p>${message}</p>
                    <span class="cs-time">刚刚</span>
                </div>
            `;
            
            messagesContainer.appendChild(userMessage);
            
            // 滚动到底部
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // 清空输入框
            csInput.value = '';
            
            // 模拟客服回复（实际项目中这里会连接到真实的客服系统）
            setTimeout(() => {
                const reply = document.createElement('div');
                reply.className = 'cs-message cs-message-received';
                reply.innerHTML = `
                    <div class="cs-avatar">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M7 20.662V19c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v1.662"></path></svg>
                    </div>
                    <div class="cs-bubble">
                        <p>感谢您的咨询，我们的客服人员会尽快回复您。</p>
                        <span class="cs-time">刚刚</span>
                    </div>
                `;
                
                messagesContainer.appendChild(reply);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 1000);
        }
    }
});

function createCustomPage() {
    const page = document.createElement('div');
    page.className = 'custom-plan-page';
    
    // 图片集部分
    const gallery = document.createElement('div');
    gallery.className = 'custom-gallery';
    gallery.innerHTML = `
        <div class="gallery-container">
            <div class="gallery-item" style="background-image: url('img/专家/高佳颖1.jpg');"></div>
            <div class="gallery-item" style="background-image: url('img/专家/高佳颖2.jpg');"></div>
            <div class="gallery-item" style="background-image: url('img/专家/高佳颖3.jpg');"></div>
        </div>
    `;
    
    // 专家介绍部分
    const profile = document.createElement('div');
    profile.className = 'expert-profile';
    profile.innerHTML = `
        <h2 class="expert-title">高佳颖</h2>
        <p class="expert-description">
            资深旅行规划师，拥有10年深度旅行定制经验。毕业于复旦大学旅游管理专业，曾为《国家地理》特约撰稿人。擅长将文化体验与自然探索完美融合，独创的"五感旅行法"已帮助3000+旅行者获得独特体验。
        </p>
        <p class="expert-description">
            旅行理念：<br>
            "真正的旅行不是到达某个地点，而是打开新的感知维度。我致力于为每位旅行者创造独一无二的心灵共振之旅。"
        </p>
        <button class="custom-back-btn">返回</button>
    `;
    
    // 添加返回按钮事件
    const backBtn = profile.querySelector('.custom-back-btn');
    backBtn.addEventListener('click', () => {
        page.style.left = '-100%';
        setTimeout(() => page.remove(), 800); // 等待动画完成再移除
    });

    page.appendChild(gallery);
    page.appendChild(profile);
    document.body.appendChild(page);
    return page;
}

function showCustomPage(page) {
    page.classList.add('active');
    // 初始化图片集交互
    const galleryItems = page.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            item.style.transform = `scale(1.15) translateZ(0)`;
            item.style.zIndex = 15;
        });
    });
}