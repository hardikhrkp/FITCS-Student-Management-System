/*
 * Integration point for the Apps Script backend.
 * Do not use JSONP for login or expose a public endpoint that returns credentials.
 * Configure a trusted, CORS-capable proxy OR serve frontend via Apps Script HTML Service.
 */
const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbxyblrIADq16WUbdy9A4I-LgMWDdj0xoYFT1LuIikN1h1GMAM2ShwymjmEguUB6UdiPWg/exec'; // Set to your approved API/proxy URL only after configuring secure transport.


async function api(action, payload = {}) {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify({ action, ...payload }),
    redirect: 'follow',
    credentials: 'omit'
  });

  if (!response.ok) {
    throw new Error('Backend request failed: ' + response.status);
  }

  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.error || 'Request failed.');
  }

  return result.data;
}

function getToken() {
  return sessionStorage.getItem('fitcs_session') || '';
}

function setToken(token) {
  sessionStorage.setItem('fitcs_session', token);
}

function clearToken() {
  sessionStorage.removeItem('fitcs_session');
}
