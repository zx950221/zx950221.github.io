document.addEventListener('DOMContentLoaded', () => {
    const destinations = document.querySelectorAll('.destination');
    let currentIndex = 0;
    let isScrolling = false;
    let isDetailsView = false; // 记录是否处于详情页面
    let currentScrollPosition = 0; // 记录图片滚动位置
    
    // 设置滚动冷却时间，防止连续触发
    const scrollCooldown = 1000; // 1秒
    
    // 处理滚动指示器
    function handleScrollIndicators() {
        // 获取所有滚动指示器
        const scrollIndicators = document.querySelectorAll('.scroll-indicator');
        
        // 只显示当前激活页面的滚动指示器
        scrollIndicators.forEach((indicator, index) => {
            if (index === currentIndex) {
                indicator.style.opacity = "0.8";
            } else {
                indicator.style.opacity = "0";
            }
        });
        
        // 如果在详情页面，隐藏所有滚动指示器
        if (isDetailsView) {
            scrollIndicators.forEach(indicator => {
                indicator.style.opacity = "0";
            });
        }
    }
    
    // 初始化视频背景
    const videos = document.querySelectorAll('.bg-video');
    videos.forEach(video => {
        // 确保视频加载完成后播放
        video.addEventListener('loadeddata', () => {
            video.play().catch(error => {
                console.log("视频自动播放失败:", error);
            });
        });
        
        // 视频结束时重新播放
        video.addEventListener('ended', () => {
            video.play().catch(error => {
                console.log("视频重新播放失败:", error);
            });
        });
    });
    
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
        
        // 处理滚动指示器的显示
        handleScrollIndicators();
        
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
        
        // 处理滚动指示器
        handleScrollIndicators();
        
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
        
        // 处理滚动指示器
        handleScrollIndicators();
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
            // 提供默认数据
            const defaultData = {
                expert: {
                    name: "Gao Jiaying",
                    title: "Senior Travel Planner",
                    desc: "With a decade of travel planning expertise, Jiaying crafts immersive cultural experiences through her profound understanding and unique insights into Chinese culture. She specializes in discovering hidden gems and authentic cultural experiences. Jiaying excels at seamlessly blending traditional and modern elements, creating personalized itineraries that have delivered unforgettable Chinese journeys for over 2,000 domestic and international travelers.",
                    image: "高佳颖1.jpg"
                }
            };
            const customPage = createCustomPage(defaultData);
            showCustomPage(customPage);
        });
    });
    
    // 页面加载后初始化滚动指示器
    handleScrollIndicators();
    
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

    // 添加悬停效果
    customerServiceBtn.addEventListener('mouseenter', () => {
        customerServiceBtn.style.backgroundColor = 'rgba(255, 255, 255)';
    });
    
    customerServiceBtn.addEventListener('mouseleave', () => {
        customerServiceBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    });

    // 打开客服窗口
    customerServiceBtn.addEventListener('click', () => {
        customerServiceWindow.classList.add('active');
        // 不再隐藏按钮，而是改变其样式和文本
        customerServiceBtn.querySelector('span').textContent = 'Talking...';
        //customerServiceBtn.style.backgroundColor = 'rgba(243, 166, 66, 0.3)';
        customerServiceBtn.style.pointerEvents = 'none'; // 禁用点击
    });

    // 关闭客服窗口
    csCloseBtn.addEventListener('click', () => {
        customerServiceWindow.classList.remove('active');
        
        // 恢复按钮状态
        setTimeout(() => {
            customerServiceBtn.querySelector('span').textContent = 'Customer Service';
            customerServiceBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            customerServiceBtn.style.pointerEvents = 'auto'; // 启用点击
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

    // 价格窗口功能
    const priceMenuBtn = document.getElementById('priceMenuBtn');
    const priceWindow = document.getElementById('priceWindow');
    const priceCloseBtn = document.getElementById('priceCloseBtn');
    const priceContent = document.querySelector('.price-content');

    // 打开价格窗口
    priceMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        priceWindow.classList.add('active');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
        
        // 添加动画延迟，确保过渡效果平滑
        setTimeout(() => {
            priceContent.style.transform = 'translateY(0)';
            priceContent.style.opacity = '1';
        }, 100);
    });

    // 关闭价格窗口
    priceCloseBtn.addEventListener('click', () => {
        priceContent.style.transform = 'translateY(-50px)';
        priceContent.style.opacity = '0';
        
        setTimeout(() => {
            priceWindow.classList.remove('active');
            document.body.style.overflow = ''; // 恢复背景滚动
        }, 500);
    });

    // 点击窗口外部关闭
    priceWindow.addEventListener('click', (e) => {
        if (e.target === priceWindow && !priceWindow.classList.contains('collapsed')) {
            priceContent.style.transform = 'translateY(-50px)';
            priceContent.style.opacity = '0';
            
            setTimeout(() => {
                priceWindow.classList.remove('active');
                document.body.style.overflow = '';
            }, 500);
        }
    });
    
    // 点击半隐藏的价格窗口恢复展开
    priceWindow.addEventListener('click', (e) => {
        // 只有当价格窗口处于折叠状态，且点击的是窗口本身而不是内部元素时
        if (priceWindow.classList.contains('collapsed') && e.target === priceWindow) {
            // 恢复价格窗口
            priceWindow.classList.remove('collapsed');
            
            // 隐藏服务详情窗口
            const serviceDetailWindow = document.getElementById('serviceDetailWindow');
            serviceDetailWindow.classList.remove('active');
            
            // 确保价格窗口可见
            priceContent.style.transform = 'translateY(0)';
            priceContent.style.opacity = '1';
        }
    });
    
    // 添加返回价格卡片按钮的功能
    const returnToPriceBtn = document.getElementById('returnToPriceBtn');
    returnToPriceBtn.addEventListener('click', () => {
        // 添加动画效果
        const iconElement = returnToPriceBtn.querySelector('.return-price-icon');
        const textElement = returnToPriceBtn.querySelector('.return-price-text');
        
        // 创建点击动画效果
        iconElement.style.transform = 'scale(0.85) rotate(-30deg)';
        iconElement.style.boxShadow = '0 0 30px rgba(243, 166, 66, 0.8)';
        textElement.style.transform = 'scale(0.9)';
        
        // 先隐藏服务详情窗口
        const serviceDetailWindow = document.getElementById('serviceDetailWindow');
        serviceDetailWindow.classList.remove('active');
        
        // 短暂延迟后恢复价格窗口，确保动画流畅
        setTimeout(() => {
            // 确保价格窗口处于活跃状态
            if (!priceWindow.classList.contains('active')) {
                priceWindow.classList.add('active');
            }
            
            // 恢复价格窗口
            priceWindow.classList.remove('collapsed');
            
            // 重置返回按钮动画
            iconElement.style.transform = '';
            iconElement.style.boxShadow = '';
            textElement.style.transform = '';
            
            // 确保价格窗口可见
            priceContent.style.transform = 'translateY(0)';
            priceContent.style.opacity = '1';
        }, 300);
    });

    // 价格卡片的预订按钮点击事件
    const priceActionBtns = document.querySelectorAll('.price-action-btn');
    priceActionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 获取服务名称
            const serviceName = btn.closest('.price-card').querySelector('h3').textContent;
            const priceText = btn.closest('.price-card').querySelector('.price').innerHTML;
            const features = [];
            
            // 获取服务特点
            const featureItems = btn.closest('.price-card').querySelectorAll('.price-features li');
            featureItems.forEach(item => {
                features.push(item.textContent);
            });
            
            // 切换价格窗口状态
            priceWindow.classList.add('collapsed');
            
            // 更新服务详情
            updateServiceDetail(serviceName, priceText, features);
            
            // 显示服务详情窗口
            const serviceDetailWindow = document.getElementById('serviceDetailWindow');
            serviceDetailWindow.classList.add('active');
        });
    });
    
    // 更新服务详情内容
    function updateServiceDetail(name, price, features) {
        document.getElementById('serviceDetailTitle').textContent = 'Service Details - ' + name;
        document.getElementById('serviceSubtitle').textContent = name;
        document.getElementById('serviceDetailPrice').innerHTML = price;
        
        // 根据服务类型更新详细描述
        let description = '';
        let audienceText = '';
        let processText = '';
        
        if (name === 'Leisure Experience') {
            description = 'Our leisure experience service provides you with a basic but comprehensive travel planning support, allowing you to enjoy a high-quality travel experience at the lowest price.';
            audienceText = 'This service is especially suitable for travelers with limited budgets but who hope to get a high-quality travel experience, first-time explorers to the destination, and people who like self-travel but need some professional guidance.';
            processText = `<ol>
                <li>Tell us your needs, contact us via email at <a href="mailto:xtavellab@gmail.com" style="color:#e8af4e;text-decoration:underline;">xtavellab@gmail.com</a></li>
                <li>Within 24 hours, our travel planner will contact you and inquire about your detailed requirements</li>
                <li>Our travel planner will guide you to choose the suitable travel package based on your needs</li>
                <li>After selection, we will create a planned route for you and help you choose hotels, transportation and other convenient services</li>
                <li>If you are not satisfied with the planning, we will modify it for you free of charge</li>
            </ol>`;
        } else if (name === 'Cultural Exploration') {
            description = 'Our cultural exploration service helps you deeply explore the cultural essence of the destination, allowing you to experience the most authentic cultural activities and lifestyles.';
            audienceText = 'This service is especially suitable for travelers who have a deep understanding of the destination culture, cultural experience enthusiasts, and explorers who hope to get a deep social experience.';
            processText = `<ol>
                <li>Learn about your expectations for cultural experience</li>
                <li>Professional cultural consultant will communicate with you one-on-one</li>
                <li>You will receive a deep cultural experience plan within 72 hours</li>
                <li>Professional guide and cultural experience activities will be arranged in priority</li>
                <li>Get local cultural depth interpretation and interactive experience</li>
            </ol>`;
        } else if (name === 'Luxury Custom Tour') {
            description = 'Our luxury customization service provides a full range of private customization services for travelers who pursue the ultimate travel experience, from private car transfer to Michelin dining, every detail is carefully arranged.';
            audienceText = 'This service is especially suitable for high-end travelers, business people, and families or groups who hope to get a worry-free travel experience.';
            processText = `<ol>
                <li>Communicate with your private travel concierge via video about your needs</li>
                <li>Get exclusive customization plan and enjoy special privileges</li>
                <li>Enjoy daily itinerary confirmation and adjustment service</li>
                <li>24/7 all-day support</li>
                <li>Provide personalized souvenirs after the trip</li>
            </ol>`;
        }
        
        // 更新HTML内容
        const detailDescriptionEl = document.getElementById('serviceDetailDescription');
        
        // 构建服务内容列表
        let featuresHtml = '<ul>';
        features.forEach(feature => {
            featuresHtml += `<li><strong>${feature}</strong></li>`;
        });
        featuresHtml += '</ul>';
        
        // 只在"休闲体验"服务类型下添加特色内容
        let specialFeatureHtml = '';
        if (name === 'Leisure Experience') {
            specialFeatureHtml = `
                <h4>Unlock High-Value Chinese Wisdom Traveling Method</h4>
                <div class="feature-box">
                    <p class="feature-slogan">【Savings ≠ Settling, Time Savings ≠ Sightseeing】</p>
                    <ul class="feature-list">
                        <li><strong>VIP Travel Plan Calculation System:</strong> Based on the design of <span class="highlight-num">5000+</span> tourist routes, it helps you avoid peak season premium and hidden consumption, averaging savings of <span class="highlight-num">28%</span> on travel expenses!</li>
                        <li><strong>Dual-Thread Time-Saving Engine:</strong>
                            <ul>
                                <li>Before Travel: Local expert <span class="highlight-num">72 hours</span> to customize the entire plan, saving you <span class="highlight-num">30 hours</span> for price comparison</li>
                                <li>During Travel: Exclusive Concierge Realtime Optimizes Queue/Traffic/Dining Time Sequence, Daily Releases <span class="highlight-num">2.5 hours</span> Immersion Experience Time</li>
                            </ul>
                        </li>
                        <li><strong>Anti-Routine Depth Formula:</strong><br>
                            (Hutong Breakfast Meeting × Non-Inherit Artisan Workshop) - Shopping Trap + Community Banquet = Textbook Local Experience</li>
                        <li><strong>Quantifiable Authentic Commitment:</strong><br>
                            Each experience project has been rated with a score of > <span class="highlight-num">4.5/5</span> by local residents and tourists, Guaranteed Real!</li>
                    </ul>
                </div>`;
        }
        
        detailDescriptionEl.innerHTML = `
            <p>${description}</p>
            ${specialFeatureHtml}
            <h4>Service Content</h4>
            ${featuresHtml}
            <h4>Suitable Audience</h4>
            <p>${audienceText}</p>
            <h4>Service Process</h4>
            ${processText}
        `;
    }
    
    // 服务详情窗口关闭按钮
    const detailCloseBtn = document.getElementById('detailCloseBtn');
    detailCloseBtn.addEventListener('click', () => {
        const serviceDetailWindow = document.getElementById('serviceDetailWindow');
        serviceDetailWindow.classList.remove('active');
        
        // 恢复价格窗口
        setTimeout(() => {
            priceWindow.classList.remove('collapsed');
        }, 300);
    });
    
    // 点击立即购买按钮
    const buyNowBtn = document.querySelector('.service-detail-window .action-btn');
    // if (buyNowBtn) {
    //     buyNowBtn.addEventListener('click', () => {
    //         alert('Purchase function is coming soon, please look forward to it!');
    //     });
    // }

    // Pre-Trip Help窗口功能
    const preTripHelpBtn = document.getElementById('preTripHelpBtn');
    const pretripWindow = document.getElementById('pretripWindow');
    const pretripCloseBtn = document.getElementById('pretripCloseBtn');
    const pretripContent = document.querySelector('.pretrip-content');
    
    if (preTripHelpBtn && pretripWindow && pretripCloseBtn) {
        preTripHelpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            pretripWindow.classList.add('active');
            document.body.style.overflow = 'hidden'; // 防止背景滚动
            
            setTimeout(() => {
                pretripContent.style.transform = 'translateY(0)';
                pretripContent.style.opacity = '1';
            }, 100);
        });
        
        pretripCloseBtn.addEventListener('click', () => {
            pretripContent.style.transform = 'translateY(-30px)';
            pretripContent.style.opacity = '0';
            
            setTimeout(() => {
                pretripWindow.classList.remove('active');
                document.body.style.overflow = ''; // 恢复背景滚动
            }, 500);
        });
        
        // 点击窗口外部关闭
        pretripWindow.addEventListener('click', (e) => {
            if (e.target === pretripWindow) {
                pretripContent.style.transform = 'translateY(-30px)';
                pretripContent.style.opacity = '0';
                
                setTimeout(() => {
                    pretripWindow.classList.remove('active');
                    document.body.style.overflow = '';
                }, 500);
            }
        });
    }
    
    // About Us窗口功能
    const aboutUsBtn = document.querySelector('.menu li:nth-child(3) a');
    const aboutWindow = document.getElementById('aboutWindow');
    const aboutCloseBtn = document.getElementById('aboutCloseBtn');
    const aboutContent = document.querySelector('.about-content');
    const aboutCustomBtn = document.getElementById('aboutCustomBtn');
    
    if (aboutUsBtn && aboutWindow && aboutCloseBtn) {
        aboutUsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            aboutWindow.classList.add('active');
            document.body.style.overflow = 'hidden'; // 防止背景滚动
            
            // 添加动画延迟，确保过渡效果平滑
            setTimeout(() => {
                aboutContent.style.transform = 'translateY(0)';
                aboutContent.style.opacity = '1';
            }, 100);
        });
        
        aboutCloseBtn.addEventListener('click', () => {
            aboutContent.style.transform = 'translateY(-30px)';
            aboutContent.style.opacity = '0';
            
            setTimeout(() => {
                aboutWindow.classList.remove('active');
                document.body.style.overflow = ''; // 恢复背景滚动
            }, 500);
        });
        
        // 点击窗口外部关闭
        aboutWindow.addEventListener('click', (e) => {
            if (e.target === aboutWindow) {
                aboutContent.style.transform = 'translateY(-30px)';
                aboutContent.style.opacity = '0';
                
                setTimeout(() => {
                    aboutWindow.classList.remove('active');
                    document.body.style.overflow = '';
                }, 500);
            }
        });
        
        // About Us中的"设计你的旅程"按钮事件
        if (aboutCustomBtn) {
            aboutCustomBtn.addEventListener('click', () => {
                // 关闭About Us窗口
                aboutContent.style.transform = 'translateY(-30px)';
                aboutContent.style.opacity = '0';
                
                setTimeout(() => {
                    aboutWindow.classList.remove('active');
                    
                    // 提供默认数据
                    const defaultData = {
                        expert: {
                            name: "Gao Jiaying",
                            title: "Senior Travel Planner",
                            desc: "With a decade of travel planning expertise, Jiaying crafts immersive cultural experiences through her profound understanding and unique insights into Chinese culture. She specializes in discovering hidden gems and authentic cultural experiences. Jiaying excels at seamlessly blending traditional and modern elements, creating personalized itineraries that have delivered unforgettable Chinese journeys for over 2,000 domestic and international travelers.",
                            image: "高佳颖1.jpg"
                        }
                    };
                    
                    // 创建并显示自定义页面
                    const customPage = createCustomPage(defaultData);
                    showCustomPage(customPage);
                }, 500);
            });
        }
    }
    
    // Contact Us窗口功能
    const contactUsBtn = document.querySelector('.menu li:nth-child(4) a');
    const contactWindow = document.getElementById('contactWindow');
    const contactCloseBtn = document.getElementById('contactCloseBtn');
    const contactContent = document.querySelector('.contact-content');
    const contactForm = document.getElementById('contactForm');
    
    if (contactUsBtn && contactWindow && contactCloseBtn) {
        contactUsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            contactWindow.classList.add('active');
            document.body.style.overflow = 'hidden'; // 防止背景滚动
            
            setTimeout(() => {
                contactContent.style.opacity = '1';
                contactContent.style.transform = 'translateY(0) scale(1)';
            }, 100);
        });
        
        contactCloseBtn.addEventListener('click', () => {
            contactContent.style.opacity = '0';
            contactContent.style.transform = 'translateY(-30px) scale(0.95)';
            
            setTimeout(() => {
                contactWindow.classList.remove('active');
                document.body.style.overflow = ''; // 恢复背景滚动
            }, 500);
        });
        
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                // 获取表单数据
                const successMessage = document.querySelector('.form-message.success');
                const errorMessage = document.querySelector('.form-message.error');
                const submitButton = contactForm.querySelector('.form-submit');
                
                // 隐藏之前的消息
                successMessage.style.display = 'none';
                errorMessage.style.display = 'none';
                
                // 获取表单数据
                const name = document.getElementById('name').value.trim();
                const email = document.getElementById('email').value.trim();
                const subject = document.getElementById('subject').value.trim();
                const message = document.getElementById('message').value.trim();
                
                // 验证表单
                if (name && email && message) {
                    // 显示提交中状态
                    submitButton.innerHTML = 'Sending...';
                    submitButton.disabled = true;
                    submitButton.style.opacity = '0.7';
                    submitButton.style.cursor = 'wait';
                    
                    // 表单将通过原生方式提交
                    return true;
                } else {
                    // 如果表单验证失败，阻止提交
                    e.preventDefault();
                    
                    // 显示错误消息
                    errorMessage.style.display = 'block';
                    
                    // 3秒后自动隐藏错误消息
                    setTimeout(() => {
                        errorMessage.style.display = 'none';
                    }, 3000);
                    
                    return false;
                }
            });
        }
        
        // 点击窗口外部关闭
        contactWindow.addEventListener('click', (e) => {
            if (e.target === contactWindow) {
                contactContent.style.opacity = '0';
                contactContent.style.transform = 'translateY(-30px) scale(0.95)';
                
                setTimeout(() => {
                    contactWindow.classList.remove('active');
                    document.body.style.overflow = ''; // 恢复背景滚动
                }, 500);
            }
        });
        
        // 为社交媒体图标添加点击事件
        const twitterIcon = document.querySelector('.social-icon.twitter');
        if (twitterIcon) {
            twitterIcon.addEventListener('click', () => {
                window.open('https://twitter.com/X_Travel_Lab', '_blank');
            });
        }
        
        const instagramIcon = document.querySelector('.social-icon.instagram');
        if (instagramIcon) {
            instagramIcon.addEventListener('click', () => {
                window.open('https://www.instagram.com/xtravellab/', '_blank');
            });
        }
    }
});

function createCustomPage(data) {
    // 如果没有提供数据，使用默认值
    if (!data) {
        data = {
            expert: {
                name: "Gao Jiaying",
                title: "Senior Travel Planner",
                desc: "With a decade of travel planning expertise, Jiaying crafts immersive cultural experiences through her profound understanding and unique insights into Chinese culture. A graduate from a prestigious tourism management institute and recipient of multiple international travel planning awards, she specializes in discovering hidden gems and authentic cultural experiences. Jiaying excels at seamlessly blending traditional and modern elements, creating personalized itineraries that have delivered unforgettable Chinese journeys for over 2,000 domestic and international travelers.",
                image: "高佳颖1.jpg"
            }
        };
    }
    
    const page = document.createElement('div');
    page.className = 'custom-plan-page';
    
    // 专家介绍部分
    const profile = document.createElement('div');
    profile.className = 'expert-profile';
    
    const expertTitle = document.createElement('h2');
    expertTitle.className = 'expert-title';
    expertTitle.textContent = 'Exclusive Travel Consultant';
    
    const expertDescription = document.createElement('p');
    expertDescription.className = 'expert-description';
    expertDescription.textContent = 'Our professional travel consultant will tailor a perfect travel experience for you based on your preferences and needs.';
    
    // 专家信息区域
    const expertInfo = document.createElement('div');
    expertInfo.className = 'expert-info';
    
    const expertImage = document.createElement('img');
    expertImage.src = `img/专家/${data.expert.image}`;
    expertImage.alt = data.expert.name;
    expertImage.style.width = '120px';
    expertImage.style.height = '120px';
    expertImage.style.borderRadius = '50%';
    expertImage.style.objectFit = 'cover';
    expertImage.style.border = '3px solid #f3a642';
    expertImage.style.marginRight = '20px';
    
    const expertDetails = document.createElement('div');
    
    const expertName = document.createElement('h3');
    expertName.textContent = data.expert.name;
    expertName.style.fontSize = '1.8rem';
    expertName.style.marginBottom = '10px';
    expertName.style.color = '#333';
    
    const expertPosition = document.createElement('p');
    expertPosition.textContent = data.expert.title;
    expertPosition.style.fontSize = '1.2rem';
    expertPosition.style.color = '#666';
    expertPosition.style.marginBottom = '15px';
    
    const expertBio = document.createElement('p');
    expertBio.textContent = data.expert.desc;
    expertBio.style.fontSize = '1rem';
    expertBio.style.lineHeight = '1.5';
    expertBio.style.color = '#444';
    
    // 创建按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'custom-buttons';
    buttonContainer.style.marginTop = '30px';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '15px';
    
    // 返回按钮
    const backButton = document.createElement('button');
    backButton.className = 'custom-back-btn';
    backButton.textContent = 'Return';
    backButton.style.background = 'transparent';
    backButton.style.color = '#4a4a4a';
    backButton.style.border = '1px solid #4a4a4a';
    backButton.style.padding = '10px 25px';
    backButton.style.borderRadius = '30px';
    backButton.style.fontSize = '16px';
    backButton.style.cursor = 'pointer';
    backButton.style.transition = 'all 0.3s ease';
    
    // 添加选择套餐按钮
    const choosePackageBtn = document.createElement('button');
    choosePackageBtn.className = 'choose-package-btn';
    choosePackageBtn.textContent = 'Choose Package';
    choosePackageBtn.style.background = '#e8af4e';
    choosePackageBtn.style.color = '#333';
    choosePackageBtn.style.border = 'none';
    choosePackageBtn.style.padding = '10px 25px';
    choosePackageBtn.style.borderRadius = '30px';
    choosePackageBtn.style.fontSize = '16px';
    choosePackageBtn.style.fontWeight = 'bold';
    choosePackageBtn.style.cursor = 'pointer';
    choosePackageBtn.style.transition = 'all 0.3s ease';
    
    // 将按钮添加到容器
    buttonContainer.appendChild(backButton);
    buttonContainer.appendChild(choosePackageBtn);
    
    // 返回按钮点击事件
    backButton.addEventListener('click', () => {
        page.style.left = '100%';
        document.body.style.overflow = 'auto';
        setTimeout(() => {
            document.body.removeChild(page);
        }, 800);
    });
    
    // 选择套餐按钮点击事件
    choosePackageBtn.addEventListener('click', () => {
        // 隐藏自定义页面
        page.style.left = '100%';
        
        // 设置body滚动为hidden
        document.body.style.overflow = 'hidden';
        
        // 移除自定义页面
        setTimeout(() => {
            document.body.removeChild(page);
            
            // 激活价格窗口
            const priceWindow = document.getElementById('priceWindow');
            priceWindow.classList.add('active');
            
            // 设置价格内容动画
            setTimeout(() => {
                const priceContent = document.querySelector('.price-content');
                priceContent.style.transform = 'translateY(0)';
                priceContent.style.opacity = '1';
            }, 300);
        }, 800);
    });
    
    // 组装专家信息区域
    expertDetails.appendChild(expertName);
    expertDetails.appendChild(expertPosition);
    expertDetails.appendChild(expertBio);
    
    const expertRow = document.createElement('div');
    expertRow.style.display = 'flex';
    expertRow.style.alignItems = 'center';
    expertRow.style.marginTop = '30px';
    expertRow.style.marginBottom = '20px'; // 增加底部间距
    
    expertRow.appendChild(expertImage);
    expertRow.appendChild(expertDetails);
    
    // 添加各元素到信息栏
    profile.appendChild(expertTitle);
    profile.appendChild(expertDescription);
    profile.appendChild(expertRow);
    
    // 添加定制路线步骤指南
    const customStepsContainer = document.createElement('div');
    customStepsContainer.className = 'custom-steps-container';
    customStepsContainer.style.marginTop = '30px'; // 减小顶部间距
    customStepsContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    customStepsContainer.style.padding = '20px 25px';
    customStepsContainer.style.borderRadius = '12px';
    customStepsContainer.style.boxShadow = '0 6px 15px rgba(0,0,0,0.08)';
    
    const stepsTitle = document.createElement('h4');
    stepsTitle.textContent = 'Customization Process Steps';
    stepsTitle.style.fontSize = '1.3rem';
    stepsTitle.style.marginBottom = '15px';
    stepsTitle.style.color = '#333';
    stepsTitle.style.borderBottom = '2px solid #e8af4e';
    stepsTitle.style.paddingBottom = '10px';
    
    const stepsList = document.createElement('ol');
    stepsList.style.paddingLeft = '25px';
    stepsList.style.fontSize = '1rem';
    stepsList.style.lineHeight = '1.8';
    
    const steps = [
        'Tell us your needs, contact us via email at <a href="mailto:xtavellab@gmail.com" style="color:#e8af4e;text-decoration:underline;">xtavellab@gmail.com</a>', 
        'Within 24 hours, our travel planner will contact you and inquire about your detailed requirements', 
        'Our travel planner will guide you to choose the suitable travel package based on your needs',
        'After selection, we will create a planned route for you and help you choose hotels, transportation and other convenient services',
        'If you are not satisfied with the planning, we will modify it for you free of charge'
    ];
    
    steps.forEach(step => {
        const stepItem = document.createElement('li');
        stepItem.innerHTML = step; // 使用innerHTML而不是textContent，以便支持HTML标签
        stepItem.style.marginBottom = '10px';
        stepsList.appendChild(stepItem);
    });
    
    const contactTip = document.createElement('div');
    contactTip.className = 'contact-tip';
    contactTip.style.marginTop = '20px';
    contactTip.style.padding = '15px';
    contactTip.style.backgroundColor = 'rgba(232, 175, 78, 0.15)';
    contactTip.style.borderLeft = '4px solid #e8af4e';
    contactTip.style.borderRadius = '4px';
    
    const tipTitle = document.createElement('p');
    tipTitle.innerHTML = '<strong>Tip:</strong> Follow us on social media where we share daily updates on interesting Chinese activities, unique cultural insights, and hidden gems';
    tipTitle.style.fontWeight = '500';
    tipTitle.style.marginBottom = '10px';
    
    const tiktokAccounts = document.createElement('div');
    tiktokAccounts.className = 'tiktok-accounts';
    tiktokAccounts.style.display = 'flex';
    tiktokAccounts.style.justifyContent = 'space-around';
    tiktokAccounts.style.marginTop = '10px';
    tiktokAccounts.style.flexWrap = 'wrap'; // 添加弹性换行
    tiktokAccounts.style.gap = '15px'; // 确保项目之间有间距
    
    // 添加X账号
    const accounts = ['@X_Travel_Lab', '@Ni_HaoChina'];
    
    accounts.forEach(account => {
        const accountItem = document.createElement('div');
        accountItem.className = 'tiktok-account';
        accountItem.style.display = 'flex';
        accountItem.style.alignItems = 'center';
        accountItem.style.padding = '8px 15px';
        accountItem.style.borderRadius = '20px';
        accountItem.style.backgroundColor = 'white';
        accountItem.style.boxShadow = '0 3px 10px rgba(0,0,0,0.1)';
        accountItem.style.cursor = 'pointer';
        
        // X平台图标
        const icon = document.createElement('span');
        icon.innerHTML = '𝕏'; // 使用X标志
        icon.style.marginRight = '8px';
        icon.style.fontSize = '1.2rem';
        
        const accountText = document.createElement('span');
        accountText.textContent = account;
        accountText.style.fontWeight = '500';
        
        accountItem.appendChild(icon);
        accountItem.appendChild(accountText);
        
        // 添加悬停效果
        accountItem.addEventListener('mouseenter', () => {
            accountItem.style.transform = 'translateY(-3px)';
            accountItem.style.boxShadow = '0 5px 15px rgba(0,0,0,0.15)';
            accountItem.style.backgroundColor = '#f8f3e9';
        });
        
        accountItem.addEventListener('mouseleave', () => {
            accountItem.style.transform = 'translateY(0)';
            accountItem.style.boxShadow = '0 3px 10px rgba(0,0,0,0.1)';
            accountItem.style.backgroundColor = 'white';
        });
        
        tiktokAccounts.appendChild(accountItem);
    });
    
    contactTip.appendChild(tipTitle);
    contactTip.appendChild(tiktokAccounts);
    
    customStepsContainer.appendChild(stepsTitle);
    customStepsContainer.appendChild(stepsList);
    customStepsContainer.appendChild(contactTip);
    
    profile.appendChild(customStepsContainer);
    profile.appendChild(buttonContainer);
    
    // 为移动设备适配
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    if (mediaQuery.matches) {
        // 在移动设备上，取消额外的左侧内边距
        profile.style.paddingLeft = '20px';
        
        // 调整TikTok账号区域在移动设备上的显示
        tiktokAccounts.style.flexDirection = 'column';
        tiktokAccounts.style.alignItems = 'flex-start';
        tiktokAccounts.style.gap = '10px';
        
        accounts.forEach((_account, index) => {
            const accountItem = tiktokAccounts.children[index];
            accountItem.style.width = '100%';
            accountItem.style.justifyContent = 'flex-start';
        });
    }
    
    // 图片集部分
    const gallery = document.createElement('div');
    gallery.className = 'custom-gallery';
    
    const galleryContainer = document.createElement('div');
    galleryContainer.className = 'gallery-container';
    galleryContainer.style.display = 'flex';
    galleryContainer.style.flexWrap = 'nowrap'; // 改为不换行，实现水平排列
    galleryContainer.style.justifyContent = 'center';
    galleryContainer.style.alignItems = 'center'; // 垂直居中对齐
    galleryContainer.style.gap = '15px'; // 减小间距
    galleryContainer.style.padding = '10px'; // 减小内边距
    galleryContainer.style.height = '100%'; // 确保容器高度充满
    galleryContainer.style.maxWidth = '95%'; // 限制最大宽度
    
    // 添加3张图片
    for (let i = 1; i <= 3; i++) {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.style.backgroundImage = `url('img/专家/高佳颖${i}.jpg')`;
        galleryItem.style.width = '28%'; // 略微减小宽度
        galleryItem.style.height = '65%'; // 略微减小高度
        galleryItem.style.backgroundSize = 'cover';
        galleryItem.style.backgroundPosition = 'center';
        galleryItem.style.borderRadius = '10px';
        galleryItem.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
        galleryItem.style.transition = 'all 0.5s ease';
        
        galleryItem.addEventListener('mouseenter', () => {
            galleryItem.style.transform = 'scale(1.05)';
            galleryItem.style.boxShadow = '0 12px 25px rgba(0,0,0,0.3)';
        });
        
        galleryItem.addEventListener('mouseleave', () => {
            galleryItem.style.transform = 'scale(1)';
            galleryItem.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
        });
        
        galleryContainer.appendChild(galleryItem);
    }
    
    gallery.appendChild(galleryContainer);
    
    // 添加页面元素
    page.appendChild(gallery);
    page.appendChild(profile);
    
    document.body.appendChild(page);
    return page;
}

function showCustomPage(page) {
    // 添加短暂延迟，确保DOM更新
    setTimeout(() => {
        page.classList.add('active');
    }, 50);
}