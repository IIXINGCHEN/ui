// 页面加载完成后执行的初始化函数
document.addEventListener('DOMContentLoaded', () => {
    // 初始化时间显示
    updateTime();
    setInterval(updateTime, 1000); // 每秒更新时间

    // 初始化页面加载时间
    updatePageLoadTime();
    setInterval(updatePageLoadTime, 1000); // 每秒更新加载时间

    // 初始化 Cloudflare 信息
    updateCloudflareInfo();

    // 初始化主题切换
    initThemeToggle();

    // 初始化移动端菜单
    initMobileMenu();

    // 初始化返回顶部按钮
    initBackToTop();

    // 初始化搜索功能
    initSearch();

    // 设置随机背景图片，避免缓存问题
    setRandomBackground();
});

// 更新时间显示函数
function updateTime() {
    const now = new Date(); // 获取当前时间
    const options = { timeZone: 'Asia/Shanghai' }; // 设置时区为上海

    // 深色主题时间显示
    const timeEl = document.getElementById('time'); // 获取时间元素
    const dateEl = document.getElementById('date'); // 获取日期元素
    const weekdayEl = document.getElementById('weekday'); // 获取星期元素
    const dayOfYearEl = document.getElementById('day-of-year'); // 获取年份第几天元素
    const utcTimeEl = document.getElementById('utc-time'); // 获取 UTC 时间元素

    // 亮色主题时间显示
    const timeLightEl = document.getElementById('time-light'); // 获取亮色时间元素
    const dateLightEl = document.getElementById('date-light'); // 获取亮色日期元素
    const weekdayLightEl = document.getElementById('weekday-light'); // 获取亮色星期元素
    const dayOfYearLightEl = document.getElementById('day-of-year-light'); // 获取亮色年份第几天元素
    const utcTimeLightEl = document.getElementById('utc-time-light'); // 获取亮色 UTC 时间元素

    // 时间格式化
    const timeStr = now.toLocaleTimeString('zh-CN', { ...options, hour12: false }); // 24小时制时间
    const dateStr = now.toLocaleDateString('zh-CN', options); // 日期
    const weekdayStr = now.toLocaleString('zh-CN', { ...options, weekday: 'long' }); // 星期几
    const startOfYear = new Date(now.getFullYear(), 0, 1); // 年初时间
    const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24)) + 1; // 计算第几天
    const utcStr = now.toUTCString(); // UTC 时间

    // 更新深色主题时间
    if (timeEl) timeEl.textContent = timeStr;
    if (dateEl) dateEl.textContent = dateStr;
    if (weekdayEl) weekdayEl.textContent = weekdayStr;
    if (dayOfYearEl) dayOfYearEl.textContent = `第 ${dayOfYear} 天`;
    if (utcTimeEl) utcTimeEl.textContent = `UTC: ${utcStr.split(' ')[4]}`;

    // 更新亮色主题时间
    if (timeLightEl) timeLightEl.textContent = timeStr;
    if (dateLightEl) dateLightEl.textContent = dateStr;
    if (weekdayLightEl) weekdayLightEl.textContent = weekdayStr;
    if (dayOfYearLightEl) dayOfYearLightEl.textContent = `第 ${dayOfYear} 天`;
    if (utcTimeLightEl) utcTimeLightEl.textContent = `UTC: ${utcStr.split(' ')[4]}`;
}

// 更新页面加载时间函数
let loadTime = Date.now(); // 记录页面加载开始时间
function updatePageLoadTime() {
    const now = Date.now(); // 当前时间
    const seconds = Math.floor((now - loadTime) / 1000); // 计算已加载秒数

    // 更新深色主题加载时间
    const pageLoadEl = document.getElementById('page-loaded-time');
    if (pageLoadEl) pageLoadEl.textContent = `${seconds}秒`;

    // 更新亮色主题加载时间
    const pageLoadLightEl = document.getElementById('page-loaded-time-light');
    if (pageLoadLightEl) pageLoadLightEl.textContent = `${seconds}秒`;
}

// 更新 Cloudflare 信息函数 - 获取真实CDN信息
async function updateCloudflareInfo() {
    try {
        // 获取深色和亮色主题的Cloudflare信息元素
        const cfEl = document.getElementById('cf'); // 深色主题
        const cfLightEl = document.getElementById('cf-light'); // 亮色主题

        // 检测是否在开发环境（包括本地开发服务器）
        const isLocalDev = window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.port === '5500' ||
            window.location.port === '3000';

        // 如果在开发环境中，显示开发信息并直接返回
        if (isLocalDev) {
            const devInfo = '本地开发环境 - Cloudflare信息不可用';
            if (cfEl) cfEl.textContent = devInfo;
            if (cfLightEl) cfLightEl.textContent = devInfo;
            return;
        }

        // 在生产环境中尝试获取真实数据
        try {
            const response = await fetch('/cdn-cgi/trace', {
                // 添加超时控制避免长时间等待
                signal: AbortSignal.timeout(3000)
            });

            if (response.ok) {
                const data = await response.text();
                const lines = data.split('\n');
                const info = {};

                // 解析返回的数据
                lines.forEach(line => {
                    const parts = line.split('=');
                    if (parts.length === 2) {
                        info[parts[0]] = parts[1];
                    }
                });

                // 构建显示文本
                const displayText = `${info.loc || 'Unknown'} ${info.ip || '-'} | ${info.colo || '-'} | ${info.http || '-'} | ${info.visit_scheme || '-'} | ${info.tls || '-'} | ${info.kex || '-'}`;

                // 更新深色和亮色主题的元素
                if (cfEl) cfEl.textContent = displayText;
                if (cfLightEl) cfLightEl.textContent = displayText;
                return;
            }
            throw new Error(`请求失败: ${response.status}`);
        } catch (fetchError) {
            console.warn('Cloudflare信息获取尝试失败:', fetchError);
            // 继续执行到错误处理代码
        }

        // 如果无法获取Cloudflare信息，显示备用信息
        const fallbackText = '直接访问 - Cloudflare信息不可用';
        if (cfEl) cfEl.textContent = fallbackText;
        if (cfLightEl) cfLightEl.textContent = fallbackText;

    } catch (error) {
        console.error('获取Cloudflare节点信息处理过程中出错: ', error);

        // 获取失败时显示错误信息
        const fallbackText = 'Cloudflare信息获取失败';
        const cfEl = document.getElementById('cf');
        const cfLightEl = document.getElementById('cf-light');

        if (cfEl) cfEl.textContent = fallbackText;
        if (cfLightEl) cfLightEl.textContent = fallbackText;
    }
}

// 初始化主题切换函数
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle'); // 深色主题切换按钮
    const themeToggleLight = document.getElementById('theme-toggle-light'); // 亮色主题切换按钮
    const darkNav = document.querySelector('.dark-theme-only'); // 深色导航栏
    const lightNav = document.querySelector('.light-theme-only'); // 亮色导航栏
    const darkElements = document.querySelectorAll('.dark-theme-only'); // 所有深色主题元素
    const lightElements = document.querySelectorAll('.light-theme-only'); // 所有亮色主题元素

    // 检查本地存储中的主题偏好
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 根据主题初始化显示
    if (savedTheme === 'light') {
        darkNav.classList.add('hidden');
        lightNav.classList.remove('hidden');
        darkElements.forEach(el => el.classList.add('hidden'));
        lightElements.forEach(el => el.classList.remove('hidden'));
        themeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
    } else {
        darkNav.classList.remove('hidden');
        lightNav.classList.add('hidden');
        darkElements.forEach(el => el.classList.remove('hidden'));
        lightElements.forEach(el => el.classList.add('hidden'));
        themeToggleLight.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    }

    // 深色主题切换事件
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            darkNav.classList.add('hidden');
            lightNav.classList.remove('hidden');
            darkElements.forEach(el => el.classList.add('hidden'));
            lightElements.forEach(el => el.classList.remove('hidden'));
            themeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
        }
    });

    // 亮色主题切换事件
    themeToggleLight.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            darkNav.classList.remove('hidden');
            lightNav.classList.add('hidden');
            darkElements.forEach(el => el.classList.remove('hidden'));
            lightElements.forEach(el => el.classList.add('hidden'));
            themeToggleLight.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        }
    });
}

// 初始化移动端菜单函数
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button'); // 深色主题移动菜单按钮
    const mobileMenu = document.getElementById('mobile-menu'); // 深色主题移动菜单
    const mobileMenuButtonLight = document.getElementById('mobile-menu-button-light'); // 亮色主题移动菜单按钮
    const mobileMenuLight = document.getElementById('mobile-menu-light'); // 亮色主题移动菜单

    // 深色主题移动菜单切换
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // 亮色主题移动菜单切换
    mobileMenuButtonLight.addEventListener('click', () => {
        mobileMenuLight.classList.toggle('hidden');
    });
}

// 初始化返回顶部按钮函数
function initBackToTop() {
    const backToTop = document.getElementById('back-to-top'); // 返回顶部按钮

    // 监听滚动事件
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) { // 滚动超过 300px 显示按钮
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
}

// 平滑滚动到顶部函数
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // 平滑滚动
    });
}

// 复制代码函数
function copyCode(button) {
    if (!button || !(button instanceof HTMLElement)) {
        console.error('无效的按钮元素');
        return;
    }

    const codeElement = button.previousElementSibling;
    if (!codeElement) {
        console.error('找不到代码元素');
        return;
    }

    // 优先使用data-original属性（如果存在），否则使用textContent
    let code = '';
    if (codeElement.hasAttribute('data-original')) {
        code = codeElement.getAttribute('data-original') || '';
    } else {
        code = codeElement.textContent || '';
    }

    // 确保代码内容非空
    if (!code.trim()) {
        console.error('空代码内容');
        return;
    }

    // 设置按钮为加载状态
    const originalText = button.textContent;
    button.textContent = '复制中...';

    // 尝试复制 - 首先尝试现代API，然后尝试备选方法
    tryCopy();

    // 复制函数
    function tryCopy() {
        // 1. 首先尝试Clipboard API
        if (navigator.clipboard) {
            navigator.clipboard.writeText(code)
                .then(() => {
                    showSuccess();
                })
                .catch(() => {
                    // 如果API调用失败，尝试备选方法
                    tryExecCommand();
                });
        } else {
            // 如果不支持Clipboard API，尝试备选方法
            tryExecCommand();
        }
    }

    // 尝试使用execCommand复制
    function tryExecCommand() {
        let textarea = null;
        try {
            // 创建临时textarea元素
            textarea = document.createElement('textarea');
            textarea.value = code;
            // 设置样式使其不可见
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            textarea.style.top = '0';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();

            // 尝试复制
            const successful = document.execCommand('copy');

            if (successful) {
                showSuccess();
            } else {
                // 如果execCommand也失败，才提示用户手动复制
                showManualCopyHelp();
            }
        } catch (err) {
            console.error('复制失败:', err);
            // 所有方法都失败，提示用户手动复制
            showManualCopyHelp();
        } finally {
            // 确保临时元素被移除
            if (textarea && textarea.parentNode) {
                document.body.removeChild(textarea);
            }
        }
    }

    // 显示成功状态
    function showSuccess() {
        button.textContent = '已复制!';
        button.style.backgroundColor = '#34D399'; // 绿色背景
        button.style.color = 'white';

        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '';
            button.style.color = '';
        }, 2000);
    }

    // 显示手动复制帮助
    function showManualCopyHelp() {
        // 选中代码文本以便用户复制
        selectTextIn(codeElement);

        button.textContent = '请按Ctrl+C复制';
        button.style.backgroundColor = '#FBBF24'; // 黄色警告背景
        button.style.color = 'black';

        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '';
            button.style.color = '';
        }, 3000);
    }

    // 选中元素中的文本
    function selectTextIn(element) {
        if (window.getSelection && element) {
            try {
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(element);
                selection.removeAllRanges();
                selection.addRange(range);
            } catch (e) {
                console.error('选择文本失败:', e);
            }
        }
    }
}

// 初始化搜索功能函数
function initSearch() {
    const searchInput = document.getElementById('search-input-new'); // 搜索输入框
    const searchButton = document.getElementById('search-button-new'); // 搜索按钮
    const historyContainer = document.getElementById('search-history'); // 搜索历史容器
    const historyList = document.getElementById('history-list'); // 历史记录列表

    // 安全地从localStorage获取数据
    let searchHistory = [];
    try {
        const storedHistory = localStorage.getItem('searchHistory');
        if (storedHistory) {
            searchHistory = JSON.parse(storedHistory);
            // 验证数据是否为数组
            if (!Array.isArray(searchHistory)) {
                searchHistory = [];
            }
        }
    } catch (e) {
        console.error('读取历史记录失败:', e);
        searchHistory = [];
    }

    // 更新历史记录显示
    function updateHistory() {
        if (!historyList) return;

        historyList.innerHTML = ''; // 清空历史列表
        searchHistory.forEach(term => {
            if (typeof term !== 'string') return; // 跳过非字符串项

            const span = document.createElement('span');
            span.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900/50 text-blue-200 cursor-pointer hover:bg-blue-800/60';
            span.textContent = term;
            span.addEventListener('click', () => quickSearch(term)); // 点击历史记录触发搜索
            historyList.appendChild(span);
        });

        if (historyContainer) {
            historyContainer.classList.toggle('hidden', searchHistory.length === 0); // 显示或隐藏历史容器
        }
    }

    // 添加搜索记录
    function addToHistory(term) {
        if (!term || typeof term !== 'string' || !term.trim()) return;

        const cleanTerm = term.trim();
        // 移除已存在的相同项
        searchHistory = searchHistory.filter(item => item !== cleanTerm);

        searchHistory.unshift(cleanTerm); // 添加到历史记录开头
        if (searchHistory.length > 5) searchHistory.pop(); // 限制历史记录最多 5 条

        try {
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory)); // 保存到本地存储
        } catch (e) {
            console.error('保存历史记录失败:', e);
        }

        updateHistory(); // 更新显示
    }

    // 执行搜索
    window.performSearch = function () {
        if (!searchInput) return;

        const query = searchInput.value.trim(); // 获取搜索输入并去除首尾空格
        if (query) {
            addToHistory(query); // 添加到历史记录
            // 确保URL安全
            const encodedQuery = encodeURIComponent(query);
            window.location.href = `/search?q=${encodedQuery}`; // 跳转到当前域名下的搜索页面
        }
    };

    // 快速搜索
    window.quickSearch = function (term) {
        if (!searchInput || !term || typeof term !== 'string') return;

        searchInput.value = term; // 设置输入框内容
        addToHistory(term); // 添加到历史记录
        // 确保URL安全
        const encodedTerm = encodeURIComponent(term);
        window.location.href = `/search?q=${encodedTerm}`; // 跳转到当前域名下的搜索页面
    };

    // 初始化历史记录显示
    updateHistory();

    // 为搜索按钮添加点击事件
    if (searchButton) {
        searchButton.addEventListener('click', () => performSearch());
    }

    // 为搜索输入框添加回车事件
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

// 设置随机背景图片函数，添加时间戳防止缓存
function setRandomBackground() {
    // 添加时间戳作为查询参数，强制浏览器重新请求图片
    const timestamp = new Date().getTime();
    const backgroundUrl = `https://api-hrandom-pic.imixc.top/?type=horizontal&raw=1&t=${timestamp}`;

    // 预加载图片，确保图片完全加载后再设置为背景
    const img = new Image();
    img.onload = function () {
        // 图片加载完成后设置为背景
        document.body.style.backgroundImage = `url('${backgroundUrl}')`;
    };
    img.onerror = function () {
        // 图片加载失败时使用备用图片
        console.warn('背景图片加载失败，使用备用图片');
        document.body.style.backgroundImage = "url('https://imgapi.cn/api.php?zz=zsy&fl=fengjing&gs=images&t=" + timestamp + "')";
    };
    img.src = backgroundUrl;
}