/**
 * FlareNav Extension - Options Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const apiUrlInput = document.getElementById('apiUrl');
  const secretTokenInput = document.getElementById('secretToken');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const statusBox = document.getElementById('statusBox');

  // Load current settings
  chrome.storage.sync.get(['flarenav_api_url', 'flarenav_secret_token'], (items) => {
    if (items.flarenav_api_url) {
      apiUrlInput.value = items.flarenav_api_url;
    }
    if (items.flarenav_secret_token) {
      secretTokenInput.value = items.flarenav_secret_token;
    }
  });

  function showStatus(message, isSuccess) {
    statusBox.textContent = message;
    statusBox.className = `status-box ${isSuccess ? 'success' : 'error'}`;
    statusBox.style.display = 'block';
  }

  // Save settings
  saveBtn.addEventListener('click', () => {
    const rawUrl = apiUrlInput.value.trim().replace(/\/+$/, '');
    const token = secretTokenInput.value.trim();

    if (!rawUrl) {
      showStatus('❌ 请输入有效的 FlareNav 服务器地址', false);
      return;
    }

    chrome.storage.sync.set({
      flarenav_api_url: rawUrl,
      flarenav_secret_token: token
    }, () => {
      showStatus('✅ 配置已保存成功！', true);
      setTimeout(() => {
        statusBox.style.display = 'none';
      }, 3000);
    });
  });

  // Test connection
  testBtn.addEventListener('click', async () => {
    const rawUrl = apiUrlInput.value.trim().replace(/\/+$/, '');
    const token = secretTokenInput.value.trim();

    if (!rawUrl) {
      showStatus('❌ 请先输入 FlareNav 服务器地址', false);
      return;
    }

    testBtn.disabled = true;
    testBtn.textContent = '测试中...';

    try {
      // Test public categories API
      const resp = await fetch(`${rawUrl}/api/categories`);
      if (!resp.ok) throw new Error(`HTTP 状态码: ${resp.status}`);
      const data = await resp.json();

      if (data.success) {
        // Test Auth verification if token is provided
        if (token) {
          const authResp = await fetch(`${rawUrl}/api/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          });
          const authData = await authResp.json();
          if (authData.authenticated) {
            showStatus(`🎉 连接成功！已成功识别管理员身份，检测到 ${data.data?.length || 0} 个分类。`, true);
          } else {
            showStatus(`⚠️ 服务器连接成功，但管理员密钥 (Token) 不匹配，请核对！`, false);
          }
        } else {
          showStatus(`🎉 服务器连接成功！检测到 ${data.data?.length || 0} 个分类（未提供管理员密钥）。`, true);
        }
      } else {
        showStatus(`❌ 服务器返回异常: ${data.error || '未知错误'}`, false);
      }
    } catch (err) {
      showStatus(`❌ 连接失败: 无法访问 ${rawUrl}，请检查 URL 是否正确或是否有 CORS 限制。错误: ${err.message}`, false);
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = '⚡ 测试连接';
    }
  });
});
