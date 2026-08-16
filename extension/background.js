/**
 * FlareNav Extension - Background Service Worker (Manifest V3)
 */

chrome.runtime.onInstalled.addListener(() => {
  // Create context menu item
  chrome.contextMenus.create({
    id: 'flarenav_quick_save',
    title: '⚡ 收藏到 FlareNav 导航',
    contexts: ['page', 'link']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'flarenav_quick_save') {
    const targetUrl = info.linkUrl || info.pageUrl || (tab && tab.url);
    const targetTitle = (tab && tab.title) || targetUrl;

    if (!targetUrl || targetUrl.startsWith('chrome://')) return;

    chrome.storage.sync.get(['flarenav_api_url', 'flarenav_secret_token'], async (items) => {
      const apiUrl = (items.flarenav_api_url || '').trim().replace(/\/+$/, '');
      const secretToken = (items.flarenav_secret_token || '').trim();

      if (!apiUrl) {
        if (chrome.runtime.openOptionsPage) {
          chrome.runtime.openOptionsPage();
        }
        return;
      }

      try {
        const domain = new URL(targetUrl).hostname;
        const iconUrl = tab?.favIconUrl || `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

        const resp = await fetch(`${apiUrl}/api/bookmarks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': secretToken,
            'Authorization': `Bearer ${secretToken}`
          },
          body: JSON.stringify({
            title: targetTitle,
            url: targetUrl,
            category_id: 'cat_tools',
            icon_url: iconUrl,
            description: '通过浏览器右键菜单快捷收藏'
          })
        });

        const res = await resp.json();
        if (resp.ok && res.success) {
          // Notification could be added here
          console.log('Successfully bookmarked via context menu:', targetTitle);
        }
      } catch (err) {
        console.error('Failed to quick bookmark:', err);
      }
    });
  }
});
