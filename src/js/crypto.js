/* ═══════════════════════════════════════════════════════
   BHM.Crypto — AES-256-GCM encryption for localStorage
   Uses Web Crypto API (native, zero dependencies)
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};

BHM.Crypto = (function () {
  'use strict';

  var ALGO = 'AES-GCM';
  var KEY_BITS = 256;
  var PBKDF2_ITERS = 600000;
  var SALT_BYTES = 16;
  var IV_BYTES = 12;
  var PIN_CHECK_KEY = 'bhm_pin_check';
  var SS_JWK = 'bhm_crypto_jwk';
  var SS_SALT = 'bhm_crypto_salt';

  var _key = null; // CryptoKey in memory

  // ── ArrayBuffer <-> Base64 helpers ──
  function ab2b64(buf) {
    var bytes = new Uint8Array(buf);
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function b642ab(b64) {
    var bin = atob(b64);
    var buf = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return buf;
  }

  // ── Key derivation: PIN + salt → AES-256-GCM CryptoKey ──
  function deriveKey(pin, salt) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveKey'])
      .then(function (baseKey) {
        return crypto.subtle.deriveKey(
          { name: 'PBKDF2', salt: salt, iterations: PBKDF2_ITERS, hash: 'SHA-256' },
          baseKey,
          { name: ALGO, length: KEY_BITS },
          true,
          ['encrypt', 'decrypt']
        );
      });
  }

  // ── Cache CryptoKey in sessionStorage as JWK ──
  function cacheKey(key, saltB64) {
    _key = key;
    return crypto.subtle.exportKey('jwk', key).then(function (jwk) {
      sessionStorage.setItem(SS_JWK, JSON.stringify(jwk));
      sessionStorage.setItem(SS_SALT, saltB64);
    });
  }

  // ── Restore CryptoKey from sessionStorage (survives refresh) ──
  function restoreCachedKey() {
    var jwkStr = sessionStorage.getItem(SS_JWK);
    if (!jwkStr) return Promise.resolve(false);
    try {
      var jwk = JSON.parse(jwkStr);
      return crypto.subtle.importKey('jwk', jwk, { name: ALGO }, true, ['encrypt', 'decrypt'])
        .then(function (key) { _key = key; return true; })
        .catch(function () { return false; });
    } catch (e) {
      return Promise.resolve(false);
    }
  }

  // ── Encrypt plaintext → JSON envelope string ──
  function encrypt(plaintext) {
    if (!_key) return Promise.reject(new Error('Crypto not unlocked'));
    var iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
    var enc = new TextEncoder();
    var saltB64 = sessionStorage.getItem(SS_SALT) || '';
    return crypto.subtle.encrypt({ name: ALGO, iv: iv }, _key, enc.encode(plaintext))
      .then(function (ctBuf) {
        return JSON.stringify({ v: 1, salt: saltB64, iv: ab2b64(iv), ct: ab2b64(ctBuf) });
      });
  }

  // ── Decrypt JSON envelope string → plaintext ──
  // Gracefully handles legacy unencrypted data (returns as-is)
  function decrypt(envelopeStr) {
    if (!_key) return Promise.reject(new Error('Crypto not unlocked'));
    var envelope;
    try { envelope = JSON.parse(envelopeStr); } catch (e) {
      return Promise.resolve(envelopeStr);
    }
    if (!envelope || typeof envelope !== 'object' || !envelope.v || !envelope.ct) {
      return Promise.resolve(envelopeStr);
    }
    var iv = b642ab(envelope.iv);
    var ct = b642ab(envelope.ct);
    return crypto.subtle.decrypt({ name: ALGO, iv: iv }, _key, ct)
      .then(function (ptBuf) { return new TextDecoder().decode(ptBuf); });
  }

  // ── PIN check marker: encrypt a known string to verify PIN later ──
  function createPinCheck(key, saltB64) {
    var iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
    return crypto.subtle.encrypt({ name: ALGO, iv: iv }, key, new TextEncoder().encode('bhm_pin_ok'))
      .then(function (ctBuf) {
        localStorage.setItem(PIN_CHECK_KEY, JSON.stringify({
          v: 1, salt: saltB64, iv: ab2b64(iv), ct: ab2b64(ctBuf)
        }));
      });
  }

  // ── Verify a PIN against the stored check marker ──
  function verifyPin(pin) {
    var raw = localStorage.getItem(PIN_CHECK_KEY);
    if (!raw) return Promise.resolve(false);
    var env;
    try { env = JSON.parse(raw); } catch (e) { return Promise.resolve(false); }
    var salt = b642ab(env.salt);
    return deriveKey(pin, salt).then(function (key) {
      return crypto.subtle.decrypt({ name: ALGO, iv: b642ab(env.iv) }, key, b642ab(env.ct))
        .then(function (ptBuf) {
          if (new TextDecoder().decode(ptBuf) === 'bhm_pin_ok') {
            return cacheKey(key, env.salt).then(function () { return true; });
          }
          return false;
        })
        .catch(function () { return false; });
    });
  }

  // ── Set up a brand-new PIN ──
  function setupPin(pin) {
    var salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    var saltB64 = ab2b64(salt);
    return deriveKey(pin, salt).then(function (key) {
      return cacheKey(key, saltB64).then(function () {
        return createPinCheck(key, saltB64);
      });
    });
  }

  function hasPinSetup() { return !!localStorage.getItem(PIN_CHECK_KEY); }
  function isUnlocked() { return !!_key; }

  // ── Reset: wipe all encrypted data, preserve theme ──
  function resetAll() {
    var theme = localStorage.getItem('bhm-theme');
    localStorage.clear();
    if (theme) localStorage.setItem('bhm-theme', theme);
    sessionStorage.removeItem(SS_JWK);
    sessionStorage.removeItem(SS_SALT);
    _key = null;
  }

  // ═══════════════════════════════════════════
  //  PIN MODAL UI
  // ═══════════════════════════════════════════
  function showPinModal(resolve) {
    var modalEl = document.getElementById('pinModal');
    if (!modalEl) { console.error('BHM: PIN modal not found'); resolve(); return; }

    var isNew = !hasPinSetup();
    var titleEl = document.getElementById('pinModalTitle');
    var subEl = document.getElementById('pinModalSubtitle');
    var inp = document.getElementById('pinInput');
    var confGrp = document.getElementById('pinConfirmGroup');
    var confInp = document.getElementById('pinConfirmInput');
    var btn = document.getElementById('pinSubmitBtn');
    var errEl = document.getElementById('pinError');
    var resetLink = document.getElementById('pinResetLink');
    var spinner = document.getElementById('pinSpinner');

    titleEl.textContent = isNew ? 'Set a PIN' : 'Enter your PIN';
    subEl.textContent = isNew
      ? 'Choose a 4\u20136 digit PIN to encrypt patient data stored on this device.'
      : 'Unlock to access encrypted patient data.';
    confGrp.style.display = isNew ? '' : 'none';
    btn.innerHTML = isNew
      ? '<span class="spinner-border spinner-border-sm me-1" id="pinSpinner" style="display:none"></span><i class="bi bi-lock me-1"></i>Set PIN &amp; Continue'
      : '<span class="spinner-border spinner-border-sm me-1" id="pinSpinner" style="display:none"></span><i class="bi bi-unlock me-1"></i>Unlock';
    resetLink.style.display = isNew ? 'none' : '';
    inp.value = '';
    confInp.value = '';
    errEl.style.display = 'none';

    var modal = new bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: false });
    modal.show();
    modalEl.addEventListener('shown.bs.modal', function onShow() {
      inp.focus();
      modalEl.removeEventListener('shown.bs.modal', onShow);
    });

    function showErr(msg) {
      errEl.textContent = msg;
      errEl.style.display = '';
      btn.disabled = false;
      var sp = document.getElementById('pinSpinner');
      if (sp) sp.style.display = 'none';
      inp.value = '';
      confInp.value = '';
      inp.focus();
    }

    function submit(e) {
      if (e) e.preventDefault();
      var pin = inp.value.trim();
      if (!/^\d{4,6}$/.test(pin)) { showErr('PIN must be 4\u20136 digits.'); return; }
      if (isNew && pin !== confInp.value.trim()) { showErr('PINs do not match.'); return; }

      btn.disabled = true;
      errEl.style.display = 'none';
      var sp = document.getElementById('pinSpinner');
      if (sp) sp.style.display = '';

      var action = isNew ? setupPin(pin) : verifyPin(pin);
      action.then(function (result) {
        if (!isNew && result === false) { showErr('Incorrect PIN. Try again.'); return; }
        modal.hide();
        cleanup();
        resolve();
      }).catch(function (err) {
        showErr('Error: ' + err.message);
      });
    }

    function reset() {
      if (!confirm('This will permanently delete ALL patient data and snippet customisations.\n\nAre you sure?')) return;
      if (!confirm('This CANNOT be undone. Proceed?')) return;
      resetAll();
      modal.hide();
      cleanup();
      location.reload();
    }

    function onKey(e) { if (e.key === 'Enter') submit(e); }

    function cleanup() {
      btn.removeEventListener('click', submit);
      resetLink.removeEventListener('click', reset);
      inp.removeEventListener('keydown', onKey);
      confInp.removeEventListener('keydown', onKey);
    }

    btn.addEventListener('click', submit);
    resetLink.addEventListener('click', reset);
    inp.addEventListener('keydown', onKey);
    confInp.addEventListener('keydown', onKey);
  }

  // ═══════════════════════════════════════════
  //  MAIN UNLOCK ENTRY POINT
  // ═══════════════════════════════════════════
  function unlock() {
    if (!window.crypto || !window.crypto.subtle) {
      console.warn('BHM: Web Crypto API unavailable — data will NOT be encrypted');
      return Promise.resolve();
    }
    return restoreCachedKey().then(function (restored) {
      if (restored) return;
      return new Promise(function (resolve) { showPinModal(resolve); });
    });
  }

  return {
    unlock: unlock,
    encrypt: encrypt,
    decrypt: decrypt,
    isUnlocked: isUnlocked,
    hasPinSetup: hasPinSetup,
    resetAll: resetAll
  };
})();
