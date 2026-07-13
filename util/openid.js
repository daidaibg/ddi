import { baseVar, Request } from './http.js';
import { ref } from 'vue';

export const OPENID_STORAGE_KEY = 'openid';
export const USER_SESSION_STORAGE_KEY = 'wxloginsession';

let pendingOpenidRequest;
export const openidFetchFailed = ref(false);

export function getCachedOpenid() {
  const cachedOpenid = uni.getStorageSync(OPENID_STORAGE_KEY);
  if (cachedOpenid) return cachedOpenid;

  const legacySession = uni.getStorageSync(USER_SESSION_STORAGE_KEY);
  return (legacySession && legacySession.openid) || '';
}

export function ensureOpenid(force = false, { showError = true } = {}) {
  if (!force) {
    const cachedOpenid = getCachedOpenid();
    if (cachedOpenid) return Promise.resolve(cachedOpenid);
  }
  if (pendingOpenidRequest) return pendingOpenidRequest;

  openidFetchFailed.value = false;
  pendingOpenidRequest = new Promise((resolve) => {
    wx.login({
      success: async (loginRes) => {
        if (!loginRes.code) {
          resolveWithError('获取 openid 失败：未获取到微信登录 code', resolve, showError);
          return;
        }

        try {
          const res = await Request({
            baseUrl: baseVar.baseUrl,
            url: '/blog/auth/cs/user/wechat/mini-program/openid',
            method: 'post',
            data: { code: loginRes.code },
          });
          const openid = res && res.data && res.data.openid;
          if (openid) {
            uni.setStorageSync(OPENID_STORAGE_KEY, openid);
            resolve(openid);
            return;
          }
          resolveWithError((res && res.msg) || '获取 openid 失败，请重试', resolve, showError);
        } catch (err) {
          resolveWithError((err && err.msg) || '获取 openid 失败，请重试', resolve, showError);
        }
      },
      fail: () => resolveWithError('微信登录失败，请重试', resolve, showError),
    });
  }).finally(() => {
    pendingOpenidRequest = undefined;
  });

  return pendingOpenidRequest;
}

function resolveWithError(message, resolve, showError) {
  openidFetchFailed.value = true;
  if (showError) uni.showToast({ title: message, icon: 'none' });
  resolve('');
}
