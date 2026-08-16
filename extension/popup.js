/**
 * FlareNav Extension - Popup Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  const urlInput = document.getElementById('url');
  const titleInput = document.getElementById('title');
  const descInput = document.getElementById('description');
  const categorySelect = document.getElementById('category');
  const isPinnedToggle = document.getElementById('isPinnedToggle');
  const isPrivateToggle = document.getElementById('isPrivateToggle');
  const faviconPreview = document.getElementById('faviconPreview');
  const bookmarkForm = document.getElementById('bookmarkForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const btnLoading = document.getElementById('btnLoading');
  const resultMsg = document.getElementById('resultMsg');
  const statusText = document.getElementById('statusText');
  const unconfiguredAlert = document.getElementById('unconfiguredAlert');
  const openOptionsBtn = document.getElementById('openOptionsBtn');
  const quickSearchInput = document.getElementById('quickSearchInput');
  const quickSearchResults = document.getElementById('quickSearchResults');

  let currentIconUrl = '';
  let config = { apiUrl: '', secretToken: '' };

  let isPinned = false;
  let isPrivate = false;

  // Toggle handlers
  isPinnedToggle?.addEventListener('click', () => {
    isPinned = !isPinned;
    isPinnedToggle.dataset.checked = String(isPinned);
    if (isPinned) {
      isPinnedToggle.classList.add('active-pinned');
    } else {
      isPinnedToggle.classList.remove('active-pinned');
    }
  });

  isPrivateToggle?.addEventListener('click', () => {
    isPrivate = !isPrivate;
    isPrivateToggle.dataset.checked = String(isPrivate);
    if (isPrivate) {
      isPrivateToggle.classList.add('active-private');
    } else {
      isPrivateToggle.classList.remove('active-private');
    }
  });

  openOptionsBtn?.addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  });

  // 1. Load config from Chrome Storage
  chrome.storage.sync.get(['flarenav_api_url', 'flarenav_secret_token'], async (items) => {
    config.apiUrl = (items.flarenav_api_url || '').trim().replace(/\/+$/, '');
    config.secretToken = (items.flarenav_secret_token || '').trim();

    if (!config.apiUrl) {
      statusText.textContent = '未配置服务器';
      statusText.style.color = '#f59e0b';
      unconfiguredAlert.classList.remove('hidden');
      loadFallbackCategories();
      return;
    }

    statusText.textContent = '已连接到服务器';
    statusText.style.color = '#10b981';
    unconfiguredAlert.classList.add('hidden');

    await fetchCategories();
  });

  // 2. Query Current Active Tab
  if (chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        const tab = tabs[0];
        const pageUrl = tab.url || '';
        const pageTitle = tab.title || '';

        if (!pageUrl.startsWith('chrome://') && !pageUrl.startsWith('edge://') && !pageUrl.startsWith('about:')) {
          urlInput.value = pageUrl;
          titleInput.value = pageTitle;

          try {
            const domain = new URL(pageUrl).hostname;
            currentIconUrl = tab.favIconUrl || `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
            faviconPreview.src = currentIconUrl;
          } catch (e) {
            currentIconUrl = 'icons/icon-32.png';
          }
        }
      }
    });
  }

  // 3. Fallback categories
  function loadFallbackCategories() {
    categorySelect.innerHTML = `
      <option value="cat_ai">AI 工具 & 智能体</option>
      <option value="cat_dev" selected>开发与技术</option>
      <option value="cat_design">设计与灵感</option>
      <option value="cat_cloud">云服务与部署</option>
      <option value="cat_tools">效率与日常</option>
      <option value="cat_read">阅读与资讯</option>
    `;
  }

  // 4. Fetch dynamic categories from FlareNav D1 API
  async function fetchCategories() {
    try {
      const resp = await fetch(`${config.apiUrl}/api/categories`);
      if (!resp.ok) throw new Error('网络响应错误');
      const data = await resp.json();
      if (data.success && data.data && data.data.length > 0) {
        categorySelect.innerHTML = '';
        data.data.forEach((cat) => {
          const opt = document.createElement('option');
          opt.value = cat.id;
          opt.textContent = `${cat.name}`;
          categorySelect.appendChild(opt);
        });
      } else {
        loadFallbackCategories();
      }
    } catch (err) {
      console.warn('获取分类列表失败，使用默认分类:', err);
      loadFallbackCategories();
    }
  }

  // 5. Submit Bookmark
  bookmarkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!config.apiUrl) {
      showResult('请先在扩展设置中配置 FlareNav 服务器地址！', 'error');
      return;
    }

    setLoading(true);
    showResult('', '');

    try {
      const payload = {
        title: titleInput.value.trim(),
        url: urlInput.value.trim(),
        category_id: categorySelect.value,
        description: descInput.value.trim(),
        icon_url: currentIconUrl,
        is_pinned: isPinned ? 1 : 0,
        is_private: isPrivate ? 1 : 0
      };

      const resp = await fetch(`${config.apiUrl}/api/bookmarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': config.secretToken,
          'Authorization': `Bearer ${config.secretToken}`
        },
        body: JSON.stringify(payload)
      });

      const res = await resp.json();
      if (resp.ok && res.success) {
        showResult('✨ 成功收藏到 FlareNav 导航！', 'success');
        setTimeout(() => {
          window.close();
        }, 1200);
      } else {
        showResult(`收藏失败: ${res.error || '未授权或密钥错误'}`, 'error');
      }
    } catch (err) {
      showResult(`网络错误: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  });

  // 6. Quick In-Popup Search
  let searchDebounce = null;
  quickSearchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    const query = quickSearchInput.value.trim();
    if (!query || !config.apiUrl) {
      quickSearchResults.innerHTML = '';
      return;
    }

    searchDebounce = setTimeout(async () => {
      try {
        const resp = await fetch(`${config.apiUrl}/api/bookmarks?q=${encodeURIComponent(query)}`);
        const data = await resp.json();
        if (data.success && data.data) {
          if (data.data.length === 0) {
            quickSearchResults.innerHTML = '<div style="color:#64748b; font-size:11px; padding:4px;">未找到匹配书签</div>';
            return;
          }
          quickSearchResults.innerHTML = data.data.slice(0, 5).map(item => `
            <a href="${item.url}" target="_blank" class="quick-result-item" title="${item.url}">
              <img src="${item.icon_url || 'icons/icon-32.png'}" onerror="this.src='icons/icon-32.png'" />
              <span class="item-title">${item.title}</span>
            </a>
          `).join('');
        }
      } catch (e) {
        quickSearchResults.innerHTML = '<div style="color:#ef4444; font-size:11px; padding:4px;">检索失败</div>';
      }
    }, 300);
  });

  function setLoading(loading) {
    if (loading) {
      submitBtn.disabled = true;
      btnText.classList.add('hidden');
      btnLoading.classList.remove('hidden');
    } else {
      submitBtn.disabled = false;
      btnText.classList.remove('hidden');
      btnLoading.classList.add('hidden');
    }
  }

  function showResult(msg, type) {
    if (!msg) {
      resultMsg.className = 'result-msg hidden';
      resultMsg.textContent = '';
      return;
    }
    resultMsg.className = `result-msg ${type}`;
    resultMsg.textContent = msg;
  }
});
