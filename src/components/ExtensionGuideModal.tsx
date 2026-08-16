import React, { useState } from 'react';
import {
  X,
  Chrome,
  Download,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
  Shield,
  HelpCircle,
  FileCode,
  FolderDown,
} from 'lucide-react';
import JSZip from 'jszip';
import { getStoredAdminToken } from '../services/api';
import { ThemeMode } from '../types';

interface ExtensionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeMode;
}

export const ExtensionGuideModal: React.FC<ExtensionGuideModalProps> = ({
  isOpen,
  onClose,
  theme = 'dark',
}) => {
  const [isZipping, setIsZipping] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedQuickCode, setCopiedQuickCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'download' | 'workflow' | 'code'>('guide');

  const isLight = theme === 'light';

  if (!isOpen) return null;

  const currentApiUrl = window.location.origin;
  const currentToken = getStoredAdminToken() || 'admin123';
  const quickConfigString = `fnv1:${btoa(JSON.stringify({ url: currentApiUrl, token: currentToken }))}`;

  // 1-Click Package & Download ZIP using JSZip
  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const extFolder = zip.folder('flarenav-chrome-extension');

      const manifestJson = {
        manifest_version: 3,
        name: 'FlareNav - 快捷网页收藏助手',
        version: '1.0.0',
        description: '一键将当前网页收藏至您的自托管 FlareNav (Cloudflare Pages + D1) 个人导航系统。',
        icons: {
          '16': 'icon.png',
          '48': 'icon.png',
          '128': 'icon.png'
        },
        action: {
          default_popup: 'popup.html',
          default_title: '添加到 FlareNav 导航',
          default_icon: 'icon.png'
        },
        options_page: 'options.html',
        permissions: ['activeTab', 'storage', 'contextMenus'],
        host_permissions: ['<all_urls>'],
        background: {
          service_worker: 'background.js'
        }
      };

      const popupHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FlareNav 收藏助手</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="popup-container">
    <header class="header">
      <div class="brand">
        <div class="logo-badge">⚡</div>
        <div class="brand-text">
          <div class="title">FlareNav</div>
          <div class="subtitle" id="statusText">正在连接...</div>
        </div>
      </div>
      <a href="options.html" target="_blank" class="settings-btn" title="配置服务器与密钥">⚙️</a>
    </header>

    <div id="unconfiguredAlert" class="alert-box hidden">
      <p>⚠️ 尚未配置 FlareNav 服务器地址</p>
      <button id="openOptionsBtn" class="btn btn-secondary btn-sm">前往设置</button>
    </div>

    <form id="bookmarkForm" class="form">
      <div class="form-group">
        <label for="url">网页链接 (URL)</label>
        <div class="input-with-icon">
          <img id="faviconPreview" class="favicon-preview" src="icon.png" alt="icon" />
          <input type="url" id="url" required placeholder="https://example.com" />
        </div>
      </div>

      <div class="form-group">
        <label for="title">网页标题</label>
        <input type="text" id="title" required placeholder="网站名称或文章标题" />
      </div>

      <div class="form-group">
        <label for="category">所属分类</label>
        <div class="select-wrapper">
          <select id="category" required>
            <option value="" disabled selected>加载分类中...</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="description">简要备注 / 描述</label>
        <textarea id="description" rows="2" placeholder="可在此输入页面摘要或个人备注（选填）"></textarea>
      </div>

      <div class="custom-toggle-row">
        <button type="button" id="isPinnedToggle" class="custom-toggle-btn" data-checked="false">
          <div class="toggle-left">
            <span class="toggle-icon">⭐</span>
            <span>置顶推荐</span>
          </div>
          <div class="toggle-box"></div>
        </button>

        <button type="button" id="isPrivateToggle" class="custom-toggle-btn" data-checked="false">
          <div class="toggle-left">
            <span class="toggle-icon">🛡️</span>
            <span>私有书签</span>
          </div>
          <div class="toggle-box"></div>
        </button>
      </div>

      <div class="actions">
        <button type="submit" id="submitBtn" class="btn btn-primary">
          <span id="btnText">⚡ 一键收藏到导航</span>
          <span id="btnLoading" class="spinner hidden"></span>
        </button>
      </div>

      <div id="resultMsg" class="result-msg hidden"></div>
    </form>

    <div class="quick-search-section">
      <div class="section-title">🔍 快速检索我的导航</div>
      <input type="text" id="quickSearchInput" placeholder="输入关键词检索书签..." />
      <div id="quickSearchResults" class="quick-results-list"></div>
    </div>
  </div>
  <script src="popup.js"></script>
</body>
</html>`;

      const popupCss = `* { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
body { width: 360px; background-color: #0f172a; color: #f8fafc; font-size: 13px; }
.popup-container { padding: 14px; display: flex; flex-direction: column; gap: 12px; }
.header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid #334155; }
.brand { display: flex; align-items: center; gap: 8px; }
.logo-badge { width: 28px; height: 28px; background: linear-gradient(135deg, #f59e0b, #ea580c); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; }
.title { font-size: 14px; font-weight: 700; color: #f8fafc; }
.subtitle { font-size: 11px; color: #94a3b8; }
.settings-btn { text-decoration: none; font-size: 16px; padding: 4px 6px; border-radius: 6px; cursor: pointer; }
.settings-btn:hover { background: #334155; }
.alert-box { background: #451a03; border: 1px solid #b45309; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 6px; color: #fde68a; font-size: 12px; }
.form { display: flex; flex-direction: column; gap: 10px; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-group label { font-size: 11px; font-weight: 600; color: #94a3b8; }
input[type="text"], input[type="url"], textarea, select { width: 100%; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px 10px; color: #f8fafc; font-size: 12px; outline: none; }
input:focus, textarea:focus, select:focus { border-color: #f59e0b; background: #1e293b; }
.input-with-icon { position: relative; display: flex; align-items: center; }
.input-with-icon input { padding-left: 30px; }
.favicon-preview { position: absolute; left: 8px; width: 16px; height: 16px; border-radius: 4px; object-fit: contain; }
.custom-toggle-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 2px; }
.custom-toggle-btn { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: #1e293b; border: 1px solid #334155; border-radius: 8px; color: #94a3b8; font-size: 11px; font-weight: 600; cursor: pointer; user-select: none; }
.toggle-left { display: flex; align-items: center; gap: 5px; }
.toggle-box { width: 14px; height: 14px; border-radius: 4px; border: 1.5px solid #475569; display: flex; align-items: center; justify-content: center; background: #0f172a; }
.custom-toggle-btn.active-pinned { background: rgba(245, 158, 11, 0.12); border-color: #f59e0b; color: #fbbf24; }
.custom-toggle-btn.active-pinned .toggle-box { background: #f59e0b; border-color: #f59e0b; }
.custom-toggle-btn.active-pinned .toggle-box::after { content: "✓"; color: #0f172a; font-size: 10px; font-weight: 900; }
.custom-toggle-btn.active-private { background: rgba(56, 189, 248, 0.12); border-color: #38bdf8; color: #38bdf8; }
.custom-toggle-btn.active-private .toggle-box { background: #38bdf8; border-color: #38bdf8; }
.custom-toggle-btn.active-private .toggle-box::after { content: "✓"; color: #0f172a; font-size: 10px; font-weight: 900; }
.btn { display: flex; align-items: center; justify-content: center; border-radius: 8px; border: none; font-weight: 700; cursor: pointer; padding: 9px 12px; }
.btn-primary { background: #f59e0b; color: #0f172a; width: 100%; }
.btn-primary:hover { background: #d97706; }
.btn-secondary { background: #334155; color: #f8fafc; }
.btn-sm { padding: 5px 8px; font-size: 11px; }
.result-msg { padding: 8px; border-radius: 8px; font-size: 12px; text-align: center; }
.result-msg.success { background: #064e3b; color: #6ee7b7; border: 1px solid #059669; }
.result-msg.error { background: #7f1d1d; color: #fca5a5; border: 1px solid #dc2626; }
.quick-search-section { border-top: 1px solid #334155; padding-top: 10px; display: flex; flex-direction: column; gap: 6px; }
.section-title { font-size: 11px; font-weight: 600; color: #94a3b8; }
.quick-results-list { max-height: 120px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
.quick-result-item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px; background: #1e293b; color: #e2e8f0; text-decoration: none; font-size: 12px; }
.quick-result-item:hover { background: #334155; color: #f59e0b; }
.quick-result-item img { width: 14px; height: 14px; border-radius: 3px; }
.quick-result-item .item-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
.hidden { display: none !important; }
.spinner { width: 14px; height: 14px; border: 2px solid #0f172a; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }`;

      const popupJs = `document.addEventListener('DOMContentLoaded', async () => {
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

  isPinnedToggle?.addEventListener('click', () => {
    isPinned = !isPinned;
    isPinnedToggle.dataset.checked = String(isPinned);
    if (isPinned) isPinnedToggle.classList.add('active-pinned');
    else isPinnedToggle.classList.remove('active-pinned');
  });

  isPrivateToggle?.addEventListener('click', () => {
    isPrivate = !isPrivate;
    isPrivateToggle.dataset.checked = String(isPrivate);
    if (isPrivate) isPrivateToggle.classList.add('active-private');
    else isPrivateToggle.classList.remove('active-private');
  });

  openOptionsBtn?.addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
    else window.open(chrome.runtime.getURL('options.html'));
  });

  chrome.storage.sync.get(['flarenav_api_url', 'flarenav_secret_token'], async (items) => {
    config.apiUrl = (items.flarenav_api_url || '').trim().replace(/\\/+$/, '');
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

  if (chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        const tab = tabs[0];
        const pageUrl = tab.url || '';
        const pageTitle = tab.title || '';
        if (!pageUrl.startsWith('chrome://') && !pageUrl.startsWith('edge://')) {
          urlInput.value = pageUrl;
          titleInput.value = pageTitle;
          try {
            const domain = new URL(pageUrl).hostname;
            currentIconUrl = tab.favIconUrl || 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=128';
            faviconPreview.src = currentIconUrl;
          } catch (e) {
            currentIconUrl = 'icon.png';
          }
        }
      }
    });
  }

  function loadFallbackCategories() {
    categorySelect.innerHTML = '<option value="cat_ai">AI 工具 & 智能体</option><option value="cat_dev" selected>开发与技术</option><option value="cat_design">设计与灵感</option><option value="cat_tools">效率与日常</option>';
  }

  async function fetchCategories() {
    try {
      const resp = await fetch(config.apiUrl + '/api/categories');
      const data = await resp.json();
      if (data.success && data.data) {
        categorySelect.innerHTML = '';
        data.data.forEach((cat) => {
          const opt = document.createElement('option');
          opt.value = cat.id;
          opt.textContent = cat.name;
          categorySelect.appendChild(opt);
        });
      } else loadFallbackCategories();
    } catch (err) {
      loadFallbackCategories();
    }
  }

  bookmarkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!config.apiUrl) return;
    submitBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoading.classList.remove('hidden');
    resultMsg.className = 'result-msg hidden';

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

      const resp = await fetch(config.apiUrl + '/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': config.secretToken,
          'Authorization': 'Bearer ' + config.secretToken
        },
        body: JSON.stringify(payload)
      });

      const res = await resp.json();
      if (resp.ok && res.success) {
        resultMsg.className = 'result-msg success';
        resultMsg.textContent = '✨ 成功收藏到 FlareNav 导航！';
        setTimeout(() => window.close(), 1200);
      } else {
        resultMsg.className = 'result-msg error';
        resultMsg.textContent = '收藏失败: ' + (res.error || '未授权');
      }
    } catch (err) {
      resultMsg.className = 'result-msg error';
      resultMsg.textContent = '网络错误: ' + err.message;
    } finally {
      submitBtn.disabled = false;
      btnText.classList.remove('hidden');
      btnLoading.classList.add('hidden');
    }
  });

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
        const resp = await fetch(config.apiUrl + '/api/bookmarks?q=' + encodeURIComponent(query));
        const data = await resp.json();
        if (data.success && data.data) {
          if (data.data.length === 0) {
            quickSearchResults.innerHTML = '<div style="color:#64748b; font-size:11px; padding:4px;">未找到匹配书签</div>';
            return;
          }
          quickSearchResults.innerHTML = data.data.slice(0, 5).map(item => \`
            <a href="\${item.url}" target="_blank" class="quick-result-item">
              <img src="\${item.icon_url || 'icon.png'}" />
              <span class="item-title">\${item.title}</span>
            </a>
          \`).join('');
        }
      } catch (e) {}
    }, 300);
  });
});`;

      const optionsHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>FlareNav 扩展设置</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: sans-serif; }
    body { background: #090d16; color: #f1f5f9; padding: 40px 20px; display: flex; justify-content: center; }
    .container { max-width: 580px; width: 100%; background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; padding: 28px; }
    h1 { font-size: 20px; font-weight: 700; color: #f8fafc; }
    .quick-card { background: rgba(245, 158, 11, 0.08); border: 1px dashed rgba(245, 158, 11, 0.35); border-radius: 10px; padding: 14px; margin: 18px 0; }
    .form-group { margin-top: 16px; }
    label { display: block; font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 6px; }
    input { width: 100%; padding: 10px 12px; background: #1e293b; border: 1px solid #334155; border-radius: 8px; color: #f8fafc; outline: none; }
    .btn-row { display: flex; gap: 12px; margin-top: 24px; }
    button { padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; }
    .btn-primary { background: #f59e0b; color: #0f172a; flex: 1; }
    .btn-secondary { background: #1e293b; color: #f1f5f9; border: 1px solid #334155; }
    .status-box { margin-top: 18px; padding: 12px; border-radius: 8px; font-size: 13px; display: none; }
    .status-box.success { display: block; background: rgba(16,185,129,0.15); border: 1px solid #059669; color: #6ee7b7; }
    .status-box.error { display: block; background: rgba(239,68,68,0.15); border: 1px solid #dc2626; color: #fca5a5; }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚡ FlareNav 扩展选项与配置</h1>
    <p style="font-size: 13px; color: #94a3b8; margin-top: 4px;">配置您的 FlareNav 个人导航连接信息</p>
    
    <div class="quick-card">
      <div style="font-size: 13px; font-weight: 700; color: #fbbf24; margin-bottom: 8px;">✨ 一键快捷导入网站配置</div>
      <div style="display: flex; gap: 8px;">
        <input type="text" id="quickCodeInput" placeholder="粘贴 fnv1:... 或 JSON 配置码" style="flex: 1;" />
        <button id="importCodeBtn" class="btn-primary" style="white-space: nowrap; padding: 8px 14px; font-size: 12px;">⚡ 一键解析绑定</button>
      </div>
    </div>

    <div class="form-group">
      <label>FlareNav 服务器地址 (API URL)</label>
      <input type="url" id="apiUrl" placeholder="https://your-nav.pages.dev" required />
    </div>
    <div class="form-group">
      <label>管理员访问密钥 (Admin Secret Key / Token)</label>
      <input type="password" id="secretToken" placeholder="admin123" />
    </div>
    <div class="btn-row">
      <button id="saveBtn" class="btn-primary">💾 保存配置</button>
      <button id="testBtn" class="btn-secondary">⚡ 测试连接</button>
    </div>
    <div id="statusBox" class="status-box"></div>
  </div>
  <script src="options.js"></script>
</body>
</html>`;

      const optionsJs = `document.addEventListener('DOMContentLoaded', () => {
  const apiUrlInput = document.getElementById('apiUrl');
  const secretTokenInput = document.getElementById('secretToken');
  const quickCodeInput = document.getElementById('quickCodeInput');
  const importCodeBtn = document.getElementById('importCodeBtn');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const statusBox = document.getElementById('statusBox');

  chrome.storage.sync.get(['flarenav_api_url', 'flarenav_secret_token'], (items) => {
    if (items.flarenav_api_url) apiUrlInput.value = items.flarenav_api_url;
    if (items.flarenav_secret_token) secretTokenInput.value = items.flarenav_secret_token;
  });

  importCodeBtn?.addEventListener('click', () => {
    const raw = (quickCodeInput.value || '').trim();
    if (!raw) return;
    try {
      let data = null;
      if (raw.startsWith('fnv1:')) {
        const decoded = atob(raw.replace(/^fnv1:/, ''));
        data = JSON.parse(decoded);
      } else {
        data = JSON.parse(raw);
      }
      if (data.url) apiUrlInput.value = data.url;
      if (data.token) secretTokenInput.value = data.token;
      saveBtn.click();
    } catch (e) {
      statusBox.textContent = '❌ 解析失败，配置码格式不正确';
      statusBox.className = 'status-box error';
    }
  });

  saveBtn.addEventListener('click', () => {
    const rawUrl = apiUrlInput.value.trim().replace(/\\/+$/, '');
    const token = secretTokenInput.value.trim();
    if (!rawUrl) return;
    chrome.storage.sync.set({ flarenav_api_url: rawUrl, flarenav_secret_token: token }, () => {
      statusBox.textContent = '✅ 配置已成功保存！';
      statusBox.className = 'status-box success';
      setTimeout(() => statusBox.style.display = 'none', 3000);
    });
  });

  testBtn.addEventListener('click', async () => {
    const rawUrl = apiUrlInput.value.trim().replace(/\\/+$/, '');
    if (!rawUrl) return;
    testBtn.textContent = '测试中...';
    try {
      const resp = await fetch(rawUrl + '/api/categories');
      const data = await resp.json();
      if (data.success) {
        statusBox.textContent = '🎉 恭喜！成功连接到 FlareNav 服务器！检测到 ' + (data.data?.length || 0) + ' 个分类。';
        statusBox.className = 'status-box success';
      } else throw new Error();
    } catch (e) {
      statusBox.textContent = '❌ 连接失败，请检查 URL 是否正确或网络是否通畅。';
      statusBox.className = 'status-box error';
    } finally {
      testBtn.textContent = '⚡ 测试连接';
    }
  });
});`;

      const backgroundJs = `chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'flarenav_quick_save', title: '⚡ 收藏到 FlareNav 导航', contexts: ['page', 'link'] });
});
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'flarenav_quick_save') {
    const targetUrl = info.linkUrl || info.pageUrl || (tab && tab.url);
    const targetTitle = (tab && tab.title) || targetUrl;
    if (!targetUrl || targetUrl.startsWith('chrome://')) return;
    chrome.storage.sync.get(['flarenav_api_url', 'flarenav_secret_token'], async (items) => {
      const apiUrl = (items.flarenav_api_url || '').trim().replace(/\\/+$/, '');
      const secretToken = (items.flarenav_secret_token || '').trim();
      if (!apiUrl) return;
      try {
        await fetch(apiUrl + '/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Admin-Token': secretToken },
          body: JSON.stringify({ title: targetTitle, url: targetUrl, category_id: 'cat_tools' })
        });
      } catch (err) {}
    });
  }
});`;

      const iconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAG1JREFUWIXt1yEOwDAMRNFXm2Pn5v0P5B00RZEUeKqom9GfS5fspqre0V3V9+zMh/7OqipJko5821uSJEnSl+/mJUk68W1vSZIkSV++m5ck6cS3vSVJkiR9+W5ekqQT3/aWJEmS9OW7eUmSfnz7AL00h4nK2tVdAAAAAElFTkSuQmCC';

      if (extFolder) {
        extFolder.file('manifest.json', JSON.stringify(manifestJson, null, 2));
        extFolder.file('popup.html', popupHtml);
        extFolder.file('popup.css', popupCss);
        extFolder.file('popup.js', popupJs);
        extFolder.file('options.html', optionsHtml);
        extFolder.file('options.js', optionsJs);
        extFolder.file('background.js', backgroundJs);
        extFolder.file('icon.png', iconBase64, { base64: true });
        extFolder.file('README.md', '# FlareNav Chrome Extension\n\n1. Open chrome://extensions/\n2. Enable Developer mode\n3. Click "Load unpacked" and select this folder.');
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'flarenav-chrome-extension.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Failed to create extension zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const copyToClipboard = (text: string, type: 'url' | 'token') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const modalBg = isLight
    ? 'bg-white border-slate-200 text-slate-900 shadow-2xl'
    : 'bg-slate-900 border-slate-800 text-slate-100 shadow-2xl';

  const headerBg = isLight
    ? 'bg-slate-50 border-slate-200'
    : 'bg-slate-900/90 border-slate-800';

  const tabNavBg = isLight
    ? 'bg-slate-100/70 border-slate-200'
    : 'bg-slate-900/50 border-slate-800';

  const cardBg = isLight
    ? 'bg-slate-50 border-slate-200 text-slate-800'
    : 'bg-slate-800/50 border-slate-700/60 text-slate-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className={`w-full max-w-2xl border rounded-3xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${modalBg}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${headerBg}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-md">
              <Chrome size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className={`font-bold text-base flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                <span>FlareNav 浏览器收藏插件</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono font-semibold">
                  Manifest V3
                </span>
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>一键收录网页至自托管 Cloudflare D1 数据库</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`flex items-center border-b px-6 gap-4 overflow-x-auto ${tabNavBg}`}>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                : isLight ? 'border-transparent text-slate-500 hover:text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📖 快速安装步骤
          </button>
          <button
            onClick={() => setActiveTab('download')}
            className={`py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'download'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                : isLight ? 'border-transparent text-slate-500 hover:text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📦 一键下载与连接参数
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'workflow'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                : isLight ? 'border-transparent text-slate-500 hover:text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ 收藏与直接上传流程
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'code'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                : isLight ? 'border-transparent text-slate-500 hover:text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📂 插件源码与结构
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs leading-relaxed">
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
                <Sparkles size={20} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-600 dark:text-amber-300 text-sm">浏览器本地加载方式 (极速上手)</div>
                  <p className={`mt-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    由于本插件完全开源且自托管，您无需通过 Chrome Web Store 审核，只需在浏览器中开启开发者模式，即可 5 秒内加载使用！
                  </p>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                <div className={`flex items-start gap-3 border rounded-xl p-3.5 ${cardBg}`}>
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>下载或获取插件文件夹</div>
                    <p className={`mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      点击切换到「一键下载」标签，下载 <code>flarenav-chrome-extension.zip</code> 并解压；或者直接使用项目源码中的 <code>/extension/</code> 目录。
                    </p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 border rounded-xl p-3.5 ${cardBg}`}>
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>打开 Chrome 扩展管理界面</div>
                    <p className={`mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      在 Chrome / Edge 浏览器地址栏输入 <code className="text-amber-500 font-mono font-bold">chrome://extensions/</code> 并回车。
                    </p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 border rounded-xl p-3.5 ${cardBg}`}>
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>开启「开发者模式」并加载已解压的扩展</div>
                    <p className={`mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      开启右上角「开发者模式」开关，点击左上角 <strong>「加载已解压的扩展程序」 (Load unpacked)</strong>，选择解压后的 <code>extension</code> 文件夹。
                    </p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 border rounded-xl p-3.5 ${cardBg}`}>
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                    4
                  </div>
                  <div>
                    <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>共用配置与一键连接</div>
                    <p className={`mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      打开扩展设置，直接粘贴下方生成的「一键同步配置码」，即可瞬间完成当前网站与管理员密钥的绑定！
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'download' && (
            <div className="space-y-4">
              {/* 1-Click ZIP Download button */}
              <div className={`border rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-gradient-to-r from-slate-800 to-slate-850 border-slate-700'}`}>
                <div>
                  <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>打包下载 Chrome 扩展 ZIP 包</h4>
                  <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    实时打包生成包含 Manifest V3、弹窗 UI、高精图标与后台脚本的独立插件包。
                  </p>
                </div>
                <button
                  onClick={handleDownloadZip}
                  disabled={isZipping}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 shrink-0 disabled:opacity-50"
                >
                  <FolderDown size={16} />
                  <span>{isZipping ? '正在打包...' : '下载扩展 (.zip)'}</span>
                </button>
              </div>

              {/* 1-Click Quick Config String */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-amber-600 dark:text-amber-300 text-xs flex items-center gap-1.5">
                    <Sparkles size={14} />
                    <span>✨ 一键同步配置码 (共用登录与站点配置)</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(quickConfigString);
                      setCopiedQuickCode(true);
                      setTimeout(() => setCopiedQuickCode(false), 2000);
                    }}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-lg transition flex items-center gap-1"
                  >
                    {copiedQuickCode ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedQuickCode ? '已复制' : '复制配置码'}</span>
                  </button>
                </div>
                <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  在扩展的设置选项页中，直接粘贴此配置码并点击「一键解析」，即可自动完成服务器地址与管理员 Token 的绑定！
                </p>
                <div className={`border rounded-xl p-2.5 font-mono text-[10px] break-all select-all ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                  {quickConfigString}
                </div>
              </div>

              {/* Connection Parameters Quick Copy */}
              <div className={`border rounded-2xl p-4 space-y-3 ${cardBg}`}>
                <div className={`font-bold text-xs ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>🔑 插件手动连接参数</div>

                <div className="space-y-1">
                  <label className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>1. 服务器地址 (API URL)</label>
                  <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
                    <span className="font-mono text-amber-500 text-xs flex-1 truncate">{currentApiUrl}</span>
                    <button
                      onClick={() => copyToClipboard(currentApiUrl, 'url')}
                      className={`transition ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
                      title="复制地址"
                    >
                      {copiedUrl ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>2. 管理员密钥 (Admin Secret Token)</label>
                  <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
                    <span className={`font-mono text-xs flex-1 truncate ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{currentToken}</span>
                    <button
                      onClick={() => copyToClipboard(currentToken, 'token')}
                      className={`transition ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
                      title="复制密钥"
                    >
                      {copiedToken ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="space-y-4">
              <div className={`border rounded-2xl p-4 space-y-3 ${cardBg}`}>
                <h4 className={`font-bold text-sm flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  <span className="text-amber-500">⚡</span>
                  <span>从浏览网页到直接上传至 Cloudflare D1 的完整流</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className={`border rounded-xl p-3 space-y-1.5 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                    <div className="text-amber-500 font-bold text-xs">1. 浏览目标网页</div>
                    <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      当您在任意网站（如 GitHub、博客、文档）时，点击浏览器右上角的 FlareNav 图标。
                    </p>
                  </div>

                  <div className={`border rounded-xl p-3 space-y-1.5 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                    <div className="text-amber-500 font-bold text-xs">2. 智能提取信息</div>
                    <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      扩展自动提取该网页的 Title、URL、高精度 Favicon 图标与 Meta 描述，并拉取您的实时分类。
                    </p>
                  </div>

                  <div className={`border rounded-xl p-3 space-y-1.5 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                    <div className="text-amber-500 font-bold text-xs">3. 直传 Cloudflare D1</div>
                    <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      点击「一键收藏」，书签数据立即写入您的 Cloudflare D1 SQLite 数据库，全端秒级同步！
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 space-y-1.5 text-[11px]">
                <div className="font-bold text-emerald-600 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500" />
                  <span>右键快捷收录支持</span>
                </div>
                <p className={isLight ? 'text-slate-600' : 'text-slate-300'}>
                  在网页中的任何链接或空白处点击鼠标右键，选择 <strong>「⚡ 收藏到 FlareNav 导航」</strong> 即可在后台完成收录，无需打断您的浏览！
                </p>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <p className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                本仓库内已包含完整的扩展源文件结构，位于项目根目录 <code>/extension/</code> 下：
              </p>
              <div className={`border rounded-xl p-3 font-mono text-[11px] space-y-1 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                <div>📁 /extension/</div>
                <div className="pl-4">├── 📄 manifest.json (Manifest V3 配置文件)</div>
                <div className="pl-4">├── 📄 popup.html (浏览器插件弹出面板 UI)</div>
                <div className="pl-4">├── 📄 popup.css (现代化暗黑主题样式)</div>
                <div className="pl-4">├── 📄 popup.js (自动提取标签、分类联动与检索逻辑)</div>
                <div className="pl-4">├── 📄 options.html (服务器地址与密钥配置页面)</div>
                <div className="pl-4">├── 📄 options.js (选项存储与连接自检)</div>
                <div className="pl-4">├── 📄 background.js (右键快捷收藏与后台 Service Worker)</div>
                <div className="pl-4">└── 📄 README.md (插件使用与配置文档)</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between px-6 py-3.5 border-t ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
          <div className={`text-[11px] flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            <Shield size={13} className="text-amber-500" />
            <span>支持全网任意网页右键与快捷键智能收录</span>
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition ${
              isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
