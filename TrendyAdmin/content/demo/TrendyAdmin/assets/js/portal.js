'use strict';
const FP = (() => {
  const API = 'http://localhost:3001/api';
  const TOKEN_KEY = 'fp_token';
  const REFRESH_KEY = 'fp_refresh';
  const USER_KEY = 'fp_user';

  function getToken()  { return localStorage.getItem(TOKEN_KEY); }
  function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
  function getRefresh()  { return localStorage.getItem(REFRESH_KEY); }
  function setRefresh(t) { localStorage.setItem(REFRESH_KEY, t); }
  function getUser()   {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  }
  function setUser(u)  { localStorage.setItem(USER_KEY, JSON.stringify(u)); }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = 'auth-login.html';
  }

  let _refreshing = null; // single in-flight refresh promise

  async function tryRefresh() {
    const rt = getRefresh();
    if (!rt) return false;
    try {
      const res = await fetch(API + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt })
      });
      if (!res.ok) return false;
      const data = await res.json();
      setToken(data.accessToken);
      if (data.refreshToken) setRefresh(data.refreshToken);
      return true;
    } catch { return false; }
  }

  async function apiFetch(path, options = {}) {
    const doFetch = (tok) => fetch(API + path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(tok ? { Authorization: 'Bearer ' + tok } : {}),
        ...(options.headers || {})
      },
      body: options.body !== undefined
        ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body))
        : undefined
    });

    let res = await doFetch(getToken());

    if (res.status === 401) {
      // Attempt token refresh (collapse concurrent requests into one refresh)
      if (!_refreshing) _refreshing = tryRefresh().finally(() => { _refreshing = null; });
      const ok = await _refreshing;
      if (!ok) { logout(); return null; }
      // Retry original request with the new token
      res = await doFetch(getToken());
      if (res.status === 401) { logout(); return null; }
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'API error ' + res.status);
    }
    return res.json();
  }

  function requireAuth() {
    if (!getToken()) { window.location.href = 'auth-login.html'; return false; }
    return true;
  }

  // Format a number as South African Rand
  function fmt(n) {
    const num = Number(n) || 0;
    if (num >= 1_000_000) return 'R' + (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000)    return 'R' + (num / 1_000).toFixed(0) + 'k';
    return 'R' + num.toLocaleString('en-ZA');
  }
  function fmtFull(n) {
    return 'R' + Number(n || 0).toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function set(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function initUserDisplay() {
    const user = getUser();
    if (!user) return;
    document.querySelectorAll('[data-fp-user-name]').forEach(el => el.textContent = user.name || '');
    document.querySelectorAll('[data-fp-user-email]').forEach(el => el.textContent = user.email || '');
    document.querySelectorAll('[data-fp-user-role]').forEach(el => el.textContent = user.role || '');
  }

  function initLogout() {
    document.querySelectorAll('[data-fp-logout]').forEach(el => {
      el.addEventListener('click', e => { e.preventDefault(); logout(); });
    });
  }

  function showError(msg) {
    let el = document.getElementById('fp-error-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'fp-error-toast';
      el.style.cssText = 'position:fixed;bottom:1rem;right:1rem;z-index:9999;background:#dc3545;color:#fff;padding:.75rem 1.25rem;border-radius:.5rem;font-size:.875rem;max-width:320px;box-shadow:0 4px 12px rgba(0,0,0,.2)';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
  }

  return { getToken, setToken, getRefresh, setRefresh, getUser, setUser, logout, apiFetch, requireAuth, fmt, fmtFull, set, initUserDisplay, initLogout, showError };
})();
