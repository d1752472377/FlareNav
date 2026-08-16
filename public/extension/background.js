chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'flarenav_quick_add',
    title: '⚡ 收藏到 FlareNav 导航',
    contexts: ['page', 'link']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'flarenav_quick_add') {
    const targetUrl = info.linkUrl || info.pageUrl || tab?.url;
    const targetTitle = info.linkUrl ? info.linkUrl : (tab?.title || '快捷收藏');

    if (!targetUrl) return;

    chrome.storage.sync.get(['flarenav_api_url', 'flarenav_secret_token'], async (items) => {
      const apiUrl = (items.flarenav_api_url || '').trim().replace(/\/+$/, '');
      const secretToken = (items.flarenav_secret_token || '').trim();

      if (!apiUrl) {
        chrome.runtime.openOptionsPage();
        return;
      }

      let faviconUrl = '';
      try {
        const domain = new URL(targetUrl).hostname;
        faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      } catch (e) {}

      try {
        await fetch(apiUrl + '/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': secretToken,
            'Authorization': 'Bearer ' + secretToken
          },
          body: JSON.stringify({
            title: targetTitle,
            url: targetUrl,
            category_id: 'cat_tools',
            description: '通过浏览器右键菜单快捷收录',
            icon_url: faviconUrl,
            is_pinned: 0,
            is_private: 0
          })
        });
      } catch (err) {
        console.error('FlareNav context menu error:', err);
      }
    });
  }
});
