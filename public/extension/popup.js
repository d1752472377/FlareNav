document.addEventListener('DOMContentLoaded', () => {
  const statusText = document.getElementById('statusText');
  const unconfiguredAlert = document.getElementById('unconfiguredAlert');
  const bookmarkForm = document.getElementById('bookmarkForm');
  const urlInput = document.getElementById('url');
  const titleInput = document.getElementById('title');
  const categorySelect = document.getElementById('category');
  const descInput = document.getElementById('description');
  const faviconPreview = document.getElementById('faviconPreview');
  const togglePinned = document.getElementById('togglePinned');
  const togglePrivate = document.getElementById('togglePrivate');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const btnLoading = document.getElementById('btnLoading');
  const resultMsg = document.getElementById('resultMsg');
  const openOptionsBtn = document.getElementById('openOptionsBtn');
  const quickSearchInput = document.getElementById('quickSearchInput');
  const quickSearchResults = document.getElementById('quickSearchResults');
  const aiBanner = document.getElementById('aiBanner');
  const aiSuggestionText = document.getElementById('aiSuggestionText');
  const aiCatBadge = document.getElementById('aiCatBadge');
  const aiTagsContainer = document.getElementById('aiTagsContainer');
  const aiRerunBtn = document.getElementById('aiRerunBtn');

  let currentIconUrl = '';
  let config = { apiUrl: '', secretToken: '' };
  let cachedCategories = [];
  let isPinned = false;
  let isPrivate = false;

  togglePinned?.addEventListener('click', () => {
    isPinned = !isPinned;
    togglePinned.classList.toggle('active-pinned', isPinned);
  });

  togglePrivate?.addEventListener('click', () => {
    isPrivate = !isPrivate;
    togglePrivate.classList.toggle('active-private', isPrivate);
  });

  openOptionsBtn?.addEventListener('click', () => {
    if (chrome.runtime && chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
    else window.open(chrome.runtime.getURL('options.html'));
  });

  aiRerunBtn?.addEventListener('click', () => {
    runAIClassification();
  });

  chrome.storage.sync.get(['flarenav_api_url', 'flarenav_secret_token'], async (items) => {
    config.apiUrl = (items.flarenav_api_url || '').trim().replace(/\/+$/, '');
    config.secretToken = (items.flarenav_secret_token || '').trim();

    if (!config.apiUrl) {
      unconfiguredAlert.classList.remove('hidden');
      statusText.textContent = '未连接服务器';
      statusText.style.color = '#f59e0b';
      loadFallbackCategories();
      return;
    }

    statusText.textContent = '已就绪 (Cloudflare D1)';
    statusText.style.color = '#10b981';
    unconfiguredAlert.classList.add('hidden');
    await fetchCategories();

    // Auto trigger AI classification once categories and page metadata are ready
    runAIClassification();
  });

  if (chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        const activeTab = tabs[0];
        urlInput.value = activeTab.url || '';
        titleInput.value = activeTab.title || '';

        if (activeTab.favIconUrl) {
          currentIconUrl = activeTab.favIconUrl;
          faviconPreview.src = activeTab.favIconUrl;
        } else if (activeTab.url) {
          try {
            const domain = new URL(activeTab.url).hostname;
            currentIconUrl = 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=128';
            faviconPreview.src = currentIconUrl;
          } catch (e) {}
        }
      }
    });
  }

  function loadFallbackCategories() {
    cachedCategories = [
      { id: 'cat_ai', name: 'AI 工具 & 智能体' },
      { id: 'cat_dev', name: '开发与技术' },
      { id: 'cat_design', name: '设计与灵感' },
      { id: 'cat_tools', name: '效率与日常' }
    ];
    renderCategoryOptions(cachedCategories);
  }

  function renderCategoryOptions(categories) {
    categorySelect.innerHTML = '';
    categories.forEach((cat) => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      categorySelect.appendChild(opt);
    });
  }

  async function fetchCategories() {
    try {
      const resp = await fetch(config.apiUrl + '/api/categories');
      const data = await resp.json();
      if (data.success && data.data && data.data.length > 0) {
        cachedCategories = data.data;
        renderCategoryOptions(cachedCategories);
      } else loadFallbackCategories();
    } catch (err) {
      loadFallbackCategories();
    }
  }

  async function runAIClassification() {
    const url = urlInput.value.trim();
    const title = titleInput.value.trim();
    if (!url || !config.apiUrl) return;

    aiBanner.classList.remove('hidden');
    aiSuggestionText.textContent = '✨ AI 正在快速推断最佳分类与特征摘要...';

    try {
      const resp = await fetch(config.apiUrl + '/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': config.secretToken,
          'Authorization': 'Bearer ' + config.secretToken
        },
        body: JSON.stringify({
          url,
          title,
          description: descInput.value.trim(),
          categories: cachedCategories
        })
      });

      const res = await resp.json();
      if (resp.ok && res.success) {
        const catName = res.category_name || '智能推荐';
        aiCatBadge.classList.remove('hidden');

        // 1. Auto apply category selection
        let matchedOption = Array.from(categorySelect.options).find(o => o.value === res.category_id || o.textContent.includes(catName));
        if (matchedOption) {
          categorySelect.value = matchedOption.value;
        } else {
          // If suggested a new category, dynamically append and select it!
          const newOpt = document.createElement('option');
          newOpt.value = 'new_cat_' + catName;
          newOpt.textContent = '✨ 推荐新建：' + catName;
          categorySelect.appendChild(newOpt);
          categorySelect.value = newOpt.value;
        }

        // 2. Auto fill description if empty or basic title
        if (res.summary && (!descInput.value.trim() || descInput.value.trim() === title)) {
          descInput.value = res.summary;
        }

        aiSuggestionText.innerHTML = '✨ <b>已自动匹配分类【' + catName + '】</b>' + (res.summary ? '<br><span style="color:#cbd5e1; font-size:10px;">' + res.summary + '</span>' : '');

        // 3. Render suggested tags
        if (res.suggested_tags && res.suggested_tags.length > 0) {
          aiTagsContainer.classList.remove('hidden');
          aiTagsContainer.innerHTML = res.suggested_tags.map(t => '<span class="ai-tag-chip" data-tag="' + t + '">+ ' + t + '</span>').join('');
          aiTagsContainer.querySelectorAll('.ai-tag-chip').forEach(chip => {
            chip.addEventListener('click', () => {
              const tag = chip.dataset.tag;
              if (!descInput.value.includes(tag)) {
                descInput.value = (descInput.value + ' #' + tag).trim();
              }
            });
          });
        }
      } else {
        aiSuggestionText.textContent = 'AI 推荐就绪 (未触发新规则)';
      }
    } catch (e) {
      aiBanner.classList.add('hidden');
    }
  }

  bookmarkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!config.apiUrl) return;

    submitBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoading.classList.remove('hidden');
    resultMsg.className = 'result-msg hidden';

    let selectedCatVal = categorySelect.value || 'cat_tools';
    
    // If user selected a dynamically created AI recommended category
    if (selectedCatVal.startsWith('new_cat_')) {
      const newCatName = selectedCatVal.replace('new_cat_', '');
      try {
        const catResp = await fetch(config.apiUrl + '/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': config.secretToken,
            'Authorization': 'Bearer ' + config.secretToken
          },
          body: JSON.stringify({ name: newCatName, icon: 'Sparkles', color: '#f59e0b' })
        });
        const catData = await catResp.json();
        if (catData.success && catData.data) {
          selectedCatVal = catData.data.id;
        }
      } catch (e) {
        selectedCatVal = 'cat_tools';
      }
    }

    try {
      const payload = {
        title: titleInput.value.trim(),
        url: urlInput.value.trim(),
        category_id: selectedCatVal,
        description: descInput.value.trim(),
        icon_url: currentIconUrl,
        is_pinned: isPinned ? 1 : 0,
        is_private: isPrivate ? 1 : 0,
      };

      const resp = await fetch(config.apiUrl + '/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': config.secretToken,
          'Authorization': 'Bearer ' + config.secretToken,
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      if (resp.ok && data.success) {
        resultMsg.textContent = '🎉 成功收藏至 FlareNav 导航库！';
        resultMsg.className = 'result-msg success';
        setTimeout(() => window.close(), 1500);
      } else {
        resultMsg.textContent = '❌ 保存失败：' + (data.error || '服务器异常');
        resultMsg.className = 'result-msg error';
      }
    } catch (err) {
      resultMsg.textContent = '❌ 网络请求失败，请检查设置。';
      resultMsg.className = 'result-msg error';
    } finally {
      submitBtn.disabled = false;
      btnText.classList.remove('hidden');
      btnLoading.classList.add('hidden');
    }
  });

  quickSearchInput?.addEventListener('input', async (e) => {
    const q = e.target.value.trim();
    if (!q || !config.apiUrl) {
      quickSearchResults.innerHTML = '';
      return;
    }
    try {
      const resp = await fetch(config.apiUrl + '/api/bookmarks?q=' + encodeURIComponent(q));
      const data = await resp.json();
      if (data.success && data.data) {
        quickSearchResults.innerHTML = data.data.slice(0, 5).map(b => 
          '<a href="' + b.url + '" target="_blank" class="quick-result-item">' +
          '<img src="' + (b.icon_url || '../icon-16.png') + '" />' +
          '<span class="item-title">' + b.title + '</span>' +
          '</a>'
        ).join('');
      }
    } catch (err) {}
  });
});
