/* ═══════════════════════════════════════════════════════
   BHM.Completeness — Instrument completion dashboard
   Traffic-light progress tracking for all assessment sections
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};

BHM.Completeness = (function () {
  'use strict';

  // ── Helpers ──

  function countKeys(obj, keys) {
    if (!obj || typeof obj !== 'object') return { filled: 0, total: keys.length };
    var filled = 0;
    for (var i = 0; i < keys.length; i++) {
      var v = obj[keys[i]];
      if (v !== undefined && v !== null && v !== '') filled++;
    }
    return { filled: filled, total: keys.length };
  }

  function hasAnyData(obj) {
    if (!obj || typeof obj !== 'object') return false;
    if (Array.isArray(obj)) return obj.length > 0;
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      var v = obj[keys[i]];
      if (v !== undefined && v !== null && v !== '' &&
          !(Array.isArray(v) && v.length === 0) &&
          !(typeof v === 'object' && Object.keys(v).length === 0)) return true;
    }
    return false;
  }

  function rangeKeys(prefix, from, to) {
    var keys = [];
    for (var i = from; i <= to; i++) keys.push(prefix + i);
    return keys;
  }

  // ═══════════════════════════════════════════
  //  INSTRUMENT DEFINITIONS
  // ═══════════════════════════════════════════

  var INSTRUMENTS = [
    {
      id: 'session', label: 'Session', icon: 'bi-person-badge',
      tab: 'tab-session', subTab: null, group: 'session',
      check: function (s) {
        return countKeys(s.patient, ['name', 'dob', 'sex', 'dateOfCompletion']);
      }
    },

    // ── Patient Booklet ──
    {
      id: 'psqi', label: 'PSQI', icon: 'bi-moon-stars',
      tab: 'tab-patient', subTab: '[data-bs-target="#sub-psqi"]', group: 'patient',
      check: function (s) {
        var keys = ['q1_bedtime', 'q2_sleepLatency', 'q3_wakeTime', 'q4_hoursSlept',
          'q5a', 'q5b', 'q5c', 'q5d', 'q5e', 'q5f', 'q5g', 'q5h', 'q5i',
          'q6_medication', 'q7_drowsiness', 'q8_enthusiasm', 'q9_quality'];
        return countKeys(s.instruments.psqi, keys);
      }
    },
    {
      id: 'epworth', label: 'Epworth', icon: 'bi-sun',
      tab: 'tab-patient', subTab: '[data-bs-target="#sub-epworth"]', group: 'patient',
      check: function (s) {
        return countKeys(s.instruments.epworth, rangeKeys('e', 1, 8));
      }
    },
    {
      id: 'gad7', label: 'GAD-7', icon: 'bi-exclamation-triangle',
      tab: 'tab-patient', subTab: '[data-bs-target="#sub-gad7"]', group: 'patient',
      check: function (s) {
        return countKeys(s.instruments.gad7, rangeKeys('g', 1, 7));
      }
    },
    {
      id: 'depression', label: 'Depression', icon: 'bi-cloud-rain',
      tab: 'tab-patient', subTab: '[data-bs-target="#sub-depression"]', group: 'patient',
      check: function (s) {
        return countKeys(s.instruments.depression, rangeKeys('d', 1, 15));
      }
    },
    {
      id: 'diet', label: 'Diet', icon: 'bi-cup-hot',
      tab: 'tab-patient', subTab: '[data-bs-target="#sub-diet"]', group: 'patient',
      check: function (s) {
        return countKeys(s.instruments.diet, rangeKeys('md', 1, 14));
      }
    },
    {
      id: 'audit', label: 'AUDIT', icon: 'bi-cup-straw',
      tab: 'tab-patient', subTab: '[data-bs-target="#sub-audit-tool"]', group: 'patient',
      check: function (s) {
        return countKeys(s.instruments.auditTool, rangeKeys('a', 1, 10));
      }
    },
    {
      id: 'casp19', label: 'CASP-19', icon: 'bi-heart-pulse',
      tab: 'tab-patient', subTab: '[data-bs-target="#sub-casp19"]', group: 'patient',
      check: function (s) {
        return countKeys(s.instruments.casp19, rangeKeys('c', 1, 19));
      }
    },
    {
      id: 'hearing', label: 'Hearing', icon: 'bi-volume-up',
      tab: 'tab-patient', subTab: '[data-bs-target="#sub-hearing"]', group: 'patient',
      check: function (s) {
        var keys = ['suddenChange', 'fluctuation', 'pain', 'discharge',
          'operations', 'perforation', 'tinnitus', 'hyperacusis'];
        return countKeys(s.instruments.hearing, keys);
      }
    },

    // ── Informant Booklet ──
    {
      id: 'mbiC', label: 'MBI-C', icon: 'bi-people',
      tab: 'tab-informant', subTab: '[data-bs-target="#sub-mbic"]', group: 'informant',
      check: function (s) {
        var keys = rangeKeys('imd', 1, 5)
          .concat(rangeKeys('ma', 1, 6))
          .concat(rangeKeys('dg', 1, 12))
          .concat(rangeKeys('sn', 1, 5))
          .concat(rangeKeys('sb', 1, 5));
        return countKeys(s.instruments.mbiC, keys);
      }
    },
    {
      id: 'npiQ', label: 'NPI-Q', icon: 'bi-person-exclamation',
      tab: 'tab-informant', subTab: '[data-bs-target="#sub-npiq"]', group: 'informant',
      check: function (s) {
        var symptoms = ['delusions', 'hallucinations', 'agitation', 'depression',
          'anxiety', 'elation', 'apathy', 'disinhibition', 'irritability',
          'motorDisturbance', 'nightBehaviour', 'appetite'];
        var presentKeys = [];
        for (var i = 0; i < symptoms.length; i++) presentKeys.push(symptoms[i] + '_present');
        return countKeys(s.instruments.npiQ, presentKeys);
      }
    },

    // ── RBANS ──
    {
      id: 'rbans', label: 'RBANS', icon: 'bi-calculator',
      tab: 'tab-rbans', subTab: null, group: 'rbans',
      check: function (s) {
        var keys = ['listlearning', 'storylearning', 'figurecopy', 'lineorientation',
          'naming', 'semanticfluency', 'digitspan', 'coding',
          'listrecall', 'listrecog', 'storyrecall', 'figurerecall'];
        return countKeys(s.instruments.rbans, keys);
      }
    },

    // ── Clinical Interview & Associated ──
    {
      id: 'clinical', label: 'Interview', icon: 'bi-clipboard2-pulse',
      tab: 'tab-clinical', subTab: '[data-bs-target="#sub-interview"]', group: 'clinical',
      check: function (s) {
        var keys = rangeKeys('memA', 1, 6)
          .concat(rangeKeys('langB', 1, 6))
          .concat(rangeKeys('visC', 1, 5))
          .concat(['yearsEdu']);
        return countKeys(s.instruments.clinical, keys);
      }
    },
    {
      id: 'cdr', label: 'CDR', icon: 'bi-speedometer2',
      tab: 'tab-clinical', subTab: '[data-bs-target="#sub-cdr-scoring"]', group: 'clinical',
      check: function (s) {
        var keys = ['memory', 'orientation', 'judgment', 'community', 'homeHobbies', 'personalCare'];
        return countKeys(s.instruments.cdr, keys);
      }
    },
    {
      id: 'diamondLewy', label: 'DIAMOND', icon: 'bi-gem',
      tab: 'tab-clinical', subTab: '[data-bs-target="#sub-diamond-lewy"]', group: 'clinical',
      check: function (s) {
        var keys = ['essential_dementia', 'core_fluctuation', 'core_rbd',
          'core_hallucinations', 'core_parkinsonism'];
        return countKeys(s.instruments.diamondLewy, keys);
      }
    },
    {
      id: 'neuroimaging', label: 'Imaging', icon: 'bi-image',
      tab: 'tab-clinical', subTab: '[data-bs-target="#sub-neuroimaging"]', group: 'clinical',
      check: function (s) {
        var scans = s.neuroimaging && s.neuroimaging.scans;
        return { filled: (scans && scans.length > 0) ? 1 : 0, total: 1 };
      }
    },
    {
      id: 'medHistory', label: 'Med Hx', icon: 'bi-journal-medical',
      tab: 'tab-clinical', subTab: '[data-bs-target="#sub-medical-history"]', group: 'clinical',
      check: function (s) {
        return { filled: hasAnyData(s.medicalHistory) ? 1 : 0, total: 1 };
      }
    },
    {
      id: 'medications', label: 'Meds', icon: 'bi-capsule',
      tab: 'tab-clinical', subTab: '[data-bs-target="#sub-medications"]', group: 'clinical',
      check: function (s) {
        var m = s.medications;
        var hasList = m && m.list && m.list.length > 0;
        var hasNotes = (m && m.recentChanges) || (m && m.adherence);
        return { filled: (hasList || hasNotes) ? 1 : 0, total: 1 };
      }
    },
    {
      id: 'physicalExam', label: 'Physical', icon: 'bi-activity',
      tab: 'tab-clinical', subTab: '[data-bs-target="#sub-physical-exam"]', group: 'clinical',
      check: function (s) {
        return countKeys(s.physicalExam, ['heightCm', 'weightKg', 'bpSystolic', 'bpDiastolic', 'heartRate']);
      }
    },
    {
      id: 'qrisk3', label: 'QRISK3', icon: 'bi-heart',
      tab: 'tab-clinical', subTab: '[data-bs-target="#sub-qrisk3"]', group: 'clinical',
      check: function (s) {
        return { filled: hasAnyData(s.qrisk3) ? 1 : 0, total: 1 };
      }
    },

    // ── Diagnosis ──
    {
      id: 'diagnosis', label: 'Diagnosis', icon: 'bi-shield-check',
      tab: 'tab-diagnosis', subTab: null, group: 'diagnosis',
      check: function (s) {
        var dx = s.diagnoses;
        return { filled: (dx && dx.length > 0) ? 1 : 0, total: 1 };
      }
    }
  ];

  // ═══════════════════════════════════════════
  //  STATUS COMPUTATION
  // ═══════════════════════════════════════════

  function getStatus(result) {
    if (result.total === 0) return 'complete';
    if (result.filled === 0) return 'empty';
    if (result.filled >= result.total) return 'complete';
    return 'partial';
  }

  function getAll() {
    var session = BHM.State.getSession();
    var results = [];
    for (var i = 0; i < INSTRUMENTS.length; i++) {
      var inst = INSTRUMENTS[i];
      var result = inst.check(session);
      results.push({
        id: inst.id,
        label: inst.label,
        icon: inst.icon,
        tab: inst.tab,
        subTab: inst.subTab,
        group: inst.group,
        filled: result.filled,
        total: result.total,
        status: getStatus(result)
      });
    }
    return results;
  }

  function getGroupStatus(group, all) {
    var allComplete = true, allEmpty = true;
    for (var i = 0; i < all.length; i++) {
      if (all[i].group !== group) continue;
      if (all[i].status !== 'complete') allComplete = false;
      if (all[i].status !== 'empty') allEmpty = false;
    }
    if (allComplete) return 'complete';
    if (allEmpty) return 'empty';
    return 'partial';
  }

  // ═══════════════════════════════════════════
  //  DASHBOARD RENDERING
  // ═══════════════════════════════════════════

  var _container = null;

  function render(container) {
    _container = container;
    update();
  }

  function update() {
    if (!_container) return;
    var all = getAll();

    var totalComplete = 0;
    for (var i = 0; i < all.length; i++) {
      if (all[i].status === 'complete') totalComplete++;
    }

    var pct = Math.round((totalComplete / all.length) * 100);
    var barClass = pct === 100 ? 'bg-success' : pct > 0 ? 'bg-warning' : 'bg-secondary';

    var html = '';
    html += '<div class="completeness-dashboard card mb-3 shadow-sm">';
    html += '<div class="card-header d-flex justify-content-between align-items-center py-2">';
    html += '<span class="fw-semibold"><i class="bi bi-clipboard-check me-2"></i>Assessment Progress</span>';
    html += '<span class="badge ' + (totalComplete === all.length ? 'bg-success' : 'bg-secondary') + '">';
    html += totalComplete + '/' + all.length + ' complete</span>';
    html += '</div>';

    html += '<div class="card-body p-2 pb-1">';

    // Overall progress bar
    html += '<div class="progress mb-2" style="height:5px">';
    html += '<div class="progress-bar ' + barClass + '" style="width:' + pct + '%"></div>';
    html += '</div>';

    // Instrument grid
    html += '<div class="completeness-grid">';
    for (var j = 0; j < all.length; j++) {
      var r = all[j];
      var fraction = r.total <= 1
        ? (r.filled > 0 ? '<i class="bi bi-check-lg"></i>' : '\u2014')
        : r.filled + '/' + r.total;

      html += '<a class="completeness-item cdi-' + r.status + '" href="javascript:void(0)" ';
      html += 'data-cd-tab="' + r.tab + '" ';
      if (r.subTab) html += 'data-cd-sub="' + r.subTab.replace(/"/g, '&quot;') + '" ';
      html += 'title="' + r.label + ' \u2014 ' + r.filled + ' of ' + r.total + ' fields">';
      html += '<span class="cd-dot"></span>';
      html += '<i class="' + r.icon + ' cd-icon"></i>';
      html += '<span class="cd-label">' + r.label + '</span>';
      html += '<span class="cd-frac">' + fraction + '</span>';
      html += '</a>';
    }
    html += '</div>';
    html += '</div></div>';

    _container.innerHTML = html;

    // Bind click handlers for navigation
    var items = _container.querySelectorAll('.completeness-item');
    for (var k = 0; k < items.length; k++) {
      items[k].addEventListener('click', handleItemClick);
    }

    // Update tab badges
    updateTabBadges(all);
  }

  function handleItemClick(e) {
    e.preventDefault();
    var el = e.currentTarget;
    var tabId = el.getAttribute('data-cd-tab');
    var subTabSel = el.getAttribute('data-cd-sub');

    var mainTabEl = document.getElementById(tabId);
    if (mainTabEl) {
      var tab = new bootstrap.Tab(mainTabEl);
      tab.show();
    }

    if (subTabSel) {
      setTimeout(function () {
        var subTabEl = document.querySelector(subTabSel);
        if (subTabEl) {
          var pill = new bootstrap.Tab(subTabEl);
          pill.show();
        }
      }, 100);
    }
  }

  // ── Tab badge indicators ──

  var TAB_GROUPS = {
    'tab-session': 'session',
    'tab-patient': 'patient',
    'tab-informant': 'informant',
    'tab-rbans': 'rbans',
    'tab-clinical': 'clinical',
    'tab-diagnosis': 'diagnosis'
  };

  function updateTabBadges(all) {
    for (var tabId in TAB_GROUPS) {
      if (!TAB_GROUPS.hasOwnProperty(tabId)) continue;
      var group = TAB_GROUPS[tabId];
      var status = getGroupStatus(group, all);
      var tabEl = document.getElementById(tabId);
      if (!tabEl) continue;

      var existing = tabEl.querySelector('.cd-tab-dot');
      if (existing) existing.remove();

      var dot = document.createElement('span');
      dot.className = 'cd-tab-dot cd-td-' + status;
      tabEl.appendChild(dot);
    }

    // Also update sub-tab pills with individual instrument dots
    for (var i = 0; i < all.length; i++) {
      var r = all[i];
      if (!r.subTab) continue;
      var pill = document.querySelector(r.subTab);
      if (!pill) continue;

      var eDot = pill.querySelector('.cd-tab-dot');
      if (eDot) eDot.remove();

      var d = document.createElement('span');
      d.className = 'cd-tab-dot cd-td-' + r.status;
      pill.appendChild(d);
    }
  }

  return {
    render: render,
    update: update,
    getAll: getAll
  };
})();
