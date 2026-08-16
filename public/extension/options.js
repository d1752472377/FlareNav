document.addEventListener('DOMContentLoaded', () => {
  const apiUrlInput = document.getElementById('apiUrl');
  const secretTokenInput = document.getElementById('secretToken');
  const quickCodeInput = document.getElementById('quickCodeInput');
  const parseCodeBtn = document.getElementById('parseCodeBtn');
  const saveBtn = document.getElementById('saveBtn');
  const status = document.getElementById('status');

  chrome.storage.sync.get(['flarenav_api_url', 'flarenav_secret_token'], (items) => {
    if (items.flarenav_api_url) apiUrlInput.value = items.flarenav_api_url;
    if (items.flarenav_secret_token) secretTokenInput.value = items.flarenav_secret_token;
  });

  parseCodeBtn?.addEventListener('click', () => {
    const raw = quickCodeInput.value.trim();
    if (raw.startsWith('fnv1:')) {
      try {
        const decoded = JSON.parse(atob(raw.replace('fnv1:', '')));
        if (decoded.url) apiUrlInput.value = decoded.url;
        if (decoded.token) secretTokenInput.value = decoded.token;
        showStatus('✨ 配置码解析成功，请点击保存！', 'success');
      } catch (e) {
        showStatus('❌ 配置码格式无效', 'error');
      }
    } else {
      showStatus('❌ 请输入以 fnv1: 开头的配置码', 'error');
    }
  });

  saveBtn.addEventListener('click', async () => {
    const apiUrl = apiUrlInput.value.trim().replace(/\/+$/, '');
    const secretToken = secretTokenInput.value.trim();

    if (!apiUrl) {
      showStatus('❌ 请输入正确的 API 服务器地址', 'error');
      return;
    }

    try {
      const resp = await fetch(apiUrl + '/api/categories');
      if (resp.ok) {
        chrome.storage.sync.set({
          flarenav_api_url: apiUrl,
          flarenav_secret_token: secretToken
        }, () => {
          showStatus('✅ 连接成功！设置已保存。', 'success');
        });
      } else {
        showStatus('⚠️ 连通测试失败，请检查服务器地址与网络', 'error');
      }
    } catch (e) {
      showStatus('❌ 无法连接至服务器: ' + e.message, 'error');
    }
  });

  function showStatus(msg, type) {
    status.textContent = msg;
    status.className = 'status ' + type;
  }
});
