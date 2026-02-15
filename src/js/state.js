/* ═══════════════════════════════════════════════════════
   BHM.State — Centralised State Store & Audit Log
   Encrypted persistence via BHM.Crypto (AES-256-GCM)
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};

BHM.State = (function () {
  'use strict';

  var STORAGE_KEY = 'bhm_assessment_session';
  var VERSION = '1.0.0';

  // ── Default session structure ──
  function createEmptySession() {
    return {
      version: VERSION,
      meta: {
        created: new Date().toISOString(),
        lastEdited: new Date().toISOString(),
        operator: '',
        sourceMode: 'transcribed'  // 'transcribed' | 'live'
      },
      patient: {
        name: '',
        dob: '',
        sex: '',
        nhsNumber: '',
        dateOfCompletion: '',
        clinicianName: '',
        referringGP: '',
        informantName: '',
        informantRelationship: ''
      },
      instruments: {
        psqi: {},
        epworth: {},
        gad7: {},
        depression: {},
        diet: {},
        auditTool: {},
        casp19: {},
        hearing: {},
        mbiC: {},
        npiQ: {},
        rbans: {},
        cdr: {},
        diamondLewy: {},
        clinical: {}
      },
      diagnoses: [],
      medications: { list: [], recentChanges: '', adherence: '' },
      medicalHistory: {},
      physicalExam: {},
      qrisk3: {},
      neuroimaging: { scans: [] },
      scores: {},
      snippetInserts: {},
      clinicianInserts: {
        overallSummary: '',
        agreedToday: '',
        safetyFollowUp: ''
      },
      auditLog: []
    };
  }

  var _session = createEmptySession();
  var _listeners = [];
  var _saveInFlight = false;
  var _savePending = false;

  // ── Async encrypted persistence ──
  function save() {
    _session.meta.lastEdited = new Date().toISOString();
    if (BHM.Crypto && BHM.Crypto.isUnlocked()) {
      _scheduleEncryptedSave();
    } else {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_session)); }
      catch (e) { console.warn('BHM: localStorage save failed', e); }
    }
  }

  function _scheduleEncryptedSave() {
    if (_saveInFlight) { _savePending = true; return; }
    _saveInFlight = true;
    var json = JSON.stringify(_session);
    BHM.Crypto.encrypt(json).then(function (enc) {
      try { localStorage.setItem(STORAGE_KEY, enc); } catch (e) { console.warn('BHM: save failed', e); }
      _saveInFlight = false;
      if (_savePending) { _savePending = false; _scheduleEncryptedSave(); }
    }).catch(function (e) {
      console.warn('BHM: encrypted save failed', e);
      _saveInFlight = false;
      if (_savePending) { _savePending = false; _scheduleEncryptedSave(); }
    });
  }

  // ── Async load (decrypts if encrypted, handles legacy plaintext) ──
  function load() {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return Promise.resolve(false);

    if (BHM.Crypto && BHM.Crypto.isUnlocked()) {
      return BHM.Crypto.decrypt(raw).then(function (plaintext) {
        try {
          var parsed = JSON.parse(plaintext);
          _session = deepMerge(createEmptySession(), parsed);
          return true;
        } catch (e) {
          console.warn('BHM: parse failed after decrypt', e);
          return false;
        }
      }).catch(function (e) {
        console.warn('BHM: decrypt/load failed', e);
        return false;
      });
    }

    // Fallback: no crypto available, try plain JSON
    try {
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !parsed.v) {
        _session = deepMerge(createEmptySession(), parsed);
        return Promise.resolve(true);
      }
    } catch (e) {
      console.warn('BHM: localStorage load failed', e);
    }
    return Promise.resolve(false);
  }

  function clearSession() {
    _session = createEmptySession();
    save();
    notifyAll();
  }

  // ── Deep merge utility ──
  function deepMerge(target, source) {
    var result = Object.assign({}, target);
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])
            && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
          result[key] = deepMerge(target[key], source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    return result;
  }

  // ── Getters ──
  function getSession() { return _session; }

  function get(path) {
    var parts = path.split('.');
    var obj = _session;
    for (var i = 0; i < parts.length; i++) {
      if (obj == null) return undefined;
      obj = obj[parts[i]];
    }
    return obj;
  }

  // ── Setters (with audit) ──
  function set(path, value, source) {
    var parts = path.split('.');
    var obj = _session;
    for (var i = 0; i < parts.length - 1; i++) {
      if (obj[parts[i]] == null) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    var lastKey = parts[parts.length - 1];
    var oldValue = obj[lastKey];

    if (oldValue === value && typeof value !== 'object') return;

    obj[lastKey] = value;

    var logOld = (oldValue !== null && typeof oldValue === 'object') ? '[object]' : (oldValue === undefined ? null : oldValue);
    var logNew = (value !== null && typeof value === 'object') ? '[object]' : value;
    _session.auditLog.push({
      timestamp: new Date().toISOString(),
      field: path,
      oldValue: logOld,
      newValue: logNew,
      operator: _session.meta.operator || 'unknown',
      sourceMode: _session.meta.sourceMode
    });

    if (_session.auditLog.length > 2000) {
      _session.auditLog = _session.auditLog.slice(-1500);
    }

    save();
    notifyAll(path);
  }

  // ── Batch set (no per-field notification, single notify at end) ──
  function setBatch(updates) {
    for (var i = 0; i < updates.length; i++) {
      var u = updates[i];
      var parts = u.path.split('.');
      var obj = _session;
      for (var j = 0; j < parts.length - 1; j++) {
        if (obj[parts[j]] == null) obj[parts[j]] = {};
        obj = obj[parts[j]];
      }
      var lastKey = parts[parts.length - 1];
      var oldValue = obj[lastKey];
      if (oldValue !== u.value || typeof u.value === 'object') {
        obj[lastKey] = u.value;
        var bLogOld = (oldValue !== null && typeof oldValue === 'object') ? '[object]' : (oldValue === undefined ? null : oldValue);
        var bLogNew = (u.value !== null && typeof u.value === 'object') ? '[object]' : u.value;
        _session.auditLog.push({
          timestamp: new Date().toISOString(),
          field: u.path,
          oldValue: bLogOld,
          newValue: bLogNew,
          operator: _session.meta.operator || 'unknown',
          sourceMode: _session.meta.sourceMode
        });
      }
    }
    save();
    notifyAll();
  }

  // ── Computed scores cache ──
  function setScore(instrumentKey, scoreObj) {
    _session.scores[instrumentKey] = scoreObj;
    save();
  }
  function getScore(instrumentKey) {
    return _session.scores[instrumentKey] || null;
  }

  // ── Listeners (reactive updates) ──
  function subscribe(fn) {
    _listeners.push(fn);
    return function unsubscribe() {
      _listeners = _listeners.filter(function (l) { return l !== fn; });
    };
  }

  function notifyAll(changedPath) {
    for (var i = 0; i < _listeners.length; i++) {
      try {
        _listeners[i](changedPath);
      } catch (e) {
        console.error('BHM: listener error', e);
      }
    }
  }

  // ── Public API ──
  return {
    VERSION: VERSION,
    createEmptySession: createEmptySession,
    getSession: getSession,
    get: get,
    set: set,
    setBatch: setBatch,
    setScore: setScore,
    getScore: getScore,
    subscribe: subscribe,
    save: save,
    load: load,
    clearSession: clearSession
  };
})();
