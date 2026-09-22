// Google Ads click-id capture, ported from the Salesforce test page (test_support_files/code.txt):
// the gclid from the landing URL is kept for 90 days in a cookie and in localStorage.
const KEY = 'gclid';

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  const match = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : '';
}

export function captureGclid() {
  const gclid = getParam('gclid');
  const gclsrc = getParam('gclsrc');
  if (gclid && (!gclsrc || gclsrc.includes('aw'))) {
    setCookie(KEY, gclid, 90);
    try {
      localStorage.setItem(KEY, gclid);
    } catch {}
  }
}

export function getGclid() {
  let stored = '';
  try {
    stored = localStorage.getItem(KEY) || '';
  } catch {}
  return getCookie(KEY) || stored;
}
