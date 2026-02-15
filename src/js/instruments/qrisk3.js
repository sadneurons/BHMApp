/* ═══════════════════════════════════════════════════════════════
   BHM.Instruments.QRISK3 — QRISK3-2017 cardiovascular risk calculator
   Auto-populates from existing app data; collects missing items
   ═══════════════════════════════════════════════════════════════ */
var BHM = window.BHM || {};
BHM.Instruments = BHM.Instruments || {};

BHM.Instruments.QRISK3 = (function () {
  'use strict';

  var S = BHM.State;
  var SP = 'qrisk3';

  function get(key) { return S.get(SP + '.' + key); }
  function set(key, val) {
    S.set(SP + '.' + key, val);
    refreshAutoValues();
    if (BHM.Scoring && BHM.Scoring.qrisk3) BHM.Scoring.qrisk3();
    if (BHM.Scoring && BHM.Scoring.triggerReport) BHM.Scoring.triggerReport();
  }

  // ── Age from DOB ──
  function getAge() {
    var dob = S.get('patient.dob');
    if (!dob) return null;
    var b = new Date(dob); var n = new Date();
    var age = n.getFullYear() - b.getFullYear();
    var m = n.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && n.getDate() < b.getDate())) age--;
    return age;
  }

  // ── Map existing smoking data to QRISK3 categories ──
  function inferSmokingStatus() {
    var tob = S.get('instruments.clinical.tobacco');
    if (!tob) return null;
    if (tob === 'Never') return 0;
    if (tob === 'Ex-smoker') return 1;
    if (tob === 'Current') {
      var packs = parseFloat(S.get('instruments.clinical.tobaccoPacks'));
      if (!isNaN(packs)) {
        var cigs = packs * 20;
        if (cigs < 10) return 2;      // light
        if (cigs < 20) return 3;      // moderate
        return 4;                      // heavy
      }
      return 2; // default to light if packs unknown
    }
    return null;
  }

  // ── Check medications for atypical antipsychotics ──
  function inferAtypicalAntipsychotic() {
    var meds = S.get('medications.list');
    if (!meds || !Array.isArray(meds)) return false;
    var atypicals = ['amisulpride', 'aripiprazole', 'clozapine', 'lurasidone', 'olanzapine',
      'paliperidone', 'quetiapine', 'risperidone', 'sertindole', 'zotepine'];
    for (var i = 0; i < meds.length; i++) {
      var name = (meds[i].name || '').toLowerCase();
      for (var j = 0; j < atypicals.length; j++) {
        if (name.indexOf(atypicals[j]) !== -1) return true;
      }
    }
    return false;
  }

  // ── Check medications for corticosteroids ──
  function inferCorticosteroids() {
    var meds = S.get('medications.list');
    if (!meds || !Array.isArray(meds)) return false;
    var steroids = ['prednisolone', 'prednisone', 'betamethasone', 'cortisone', 'depo-medrone',
      'dexamethasone', 'deflazacort', 'efcortesol', 'hydrocortisone', 'methylprednisolone', 'triamcinolone'];
    for (var i = 0; i < meds.length; i++) {
      var name = (meds[i].name || '').toLowerCase();
      for (var j = 0; j < steroids.length; j++) {
        if (name.indexOf(steroids[j]) !== -1) return true;
      }
    }
    return false;
  }

  // ── Infer severe mental illness ──
  function inferSMI() {
    return !!(S.get('medicalHistory.psych.bipolar') || S.get('medicalHistory.psych.psychosis'));
  }

  // ── Refresh auto-populated values display ──
  function refreshAutoValues() {
    var fields = [
      { id: 'qr-auto-age', fn: function () { var a = getAge(); return a !== null ? a + ' yrs' : null; } },
      { id: 'qr-auto-sex', fn: function () { return S.get('patient.sex') || null; } },
      { id: 'qr-auto-bmi', fn: function () { var b = S.get('physicalExam.bmi'); return b ? parseFloat(b).toFixed(1) : null; } },
      { id: 'qr-auto-sbp', fn: function () { var s = S.get('physicalExam.bpSystolic'); return s ? s + ' mmHg' : null; } },
      { id: 'qr-auto-af', fn: function () { return S.get('medicalHistory.cvRisk.atrial_fibrillation') ? 'Yes' : null; } },
      { id: 'qr-auto-dm1', fn: function () { return S.get('medicalHistory.cvRisk.diabetes_t1') ? 'Yes' : null; } },
      { id: 'qr-auto-dm2', fn: function () { return S.get('medicalHistory.cvRisk.diabetes_t2') ? 'Yes' : null; } },
      { id: 'qr-auto-htn', fn: function () { return S.get('medicalHistory.cvRisk.hypertension') ? 'Yes' : null; } },
      { id: 'qr-auto-migraine', fn: function () { return S.get('medicalHistory.neuro.migraine') ? 'Yes' : null; } },
      { id: 'qr-auto-smi', fn: function () { return inferSMI() ? 'Yes' : null; } },
      { id: 'qr-auto-antipsych', fn: function () { return inferAtypicalAntipsychotic() ? 'Yes' : null; } },
      { id: 'qr-auto-steroids', fn: function () { return inferCorticosteroids() ? 'Yes' : null; } }
    ];
    for (var i = 0; i < fields.length; i++) {
      var el = document.getElementById(fields[i].id);
      if (el) {
        var val = fields[i].fn();
        if (val) {
          el.innerHTML = '<span class="badge bg-success bg-opacity-75"><i class="bi bi-check-circle me-1"></i>' + val + '</span>';
        } else {
          el.innerHTML = '<span class="text-muted fst-italic" style="font-size:0.72rem">Not set</span>';
        }
      }
    }
    // Update smoking display
    var smokingEl = document.getElementById('qr-auto-smoking');
    if (smokingEl) {
      var sm = inferSmokingStatus();
      var labels = ['Non-smoker', 'Ex-smoker', 'Light', 'Moderate', 'Heavy'];
      if (sm !== null) {
        smokingEl.innerHTML = '<span class="badge bg-success bg-opacity-75"><i class="bi bi-check-circle me-1"></i>' + labels[sm] + '</span>';
      } else {
        smokingEl.innerHTML = '<span class="text-muted fst-italic" style="font-size:0.72rem">Not set</span>';
      }
    }
  }

  // ═══════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════
  function render(container) {
    if (!container) return;
    container.innerHTML = '';

    var html = '';
    html += '<h5 class="mb-2" style="font-size:1rem"><i class="bi bi-heart-pulse me-2"></i>QRISK3 — 10-Year Cardiovascular Risk</h5>';
    html += '<p class="text-muted mb-2" style="font-size:0.78rem">' +
      'QRISK3-2017 (Hippisley-Cox et al., BMJ 2017). Fields marked <i class="bi bi-arrow-repeat text-success"></i> are auto-populated from data elsewhere in the app. ' +
      'Override any value below if needed.</p>';

    html += '<div class="row g-2">';

    // ═══ COL 1: Auto-populated + demographics ═══
    html += '<div class="col-lg-4">';

    // Auto-populated card
    html += '<div class="card mb-2">';
    html += '<div class="card-header bg-success text-white py-1" style="font-size:0.85rem"><i class="bi bi-arrow-repeat me-1"></i> Auto-Populated</div>';
    html += '<div class="card-body p-1">';
    html += '<table class="table table-sm mb-0" style="font-size:0.8rem">';
    html += autoRow('Age', 'qr-auto-age');
    html += autoRow('Sex', 'qr-auto-sex');
    html += autoRow('BMI', 'qr-auto-bmi');
    html += autoRow('Systolic BP', 'qr-auto-sbp');
    html += autoRow('Atrial fibrillation', 'qr-auto-af');
    html += autoRow('Diabetes T1', 'qr-auto-dm1');
    html += autoRow('Diabetes T2', 'qr-auto-dm2');
    html += autoRow('Hypertension', 'qr-auto-htn');
    html += autoRow('Migraine', 'qr-auto-migraine');
    html += autoRow('Severe mental illness', 'qr-auto-smi');
    html += autoRow('Atypical antipsychotic', 'qr-auto-antipsych');
    html += autoRow('Corticosteroids', 'qr-auto-steroids');
    html += autoRow('Smoking', 'qr-auto-smoking');
    html += '</table>';
    html += '</div></div>';

    // Calculate button
    html += '<div class="d-grid mb-2"><button class="btn btn-danger btn-sm" id="qrisk3-calculate-btn">' +
      '<i class="bi bi-heart-pulse me-1"></i>Calculate QRISK3</button></div>';

    // Score display
    html += '<div id="qrisk3-score-display"></div>';

    html += '</div>'; // end col 1

    // ═══ COL 2: Additional required inputs ═══
    html += '<div class="col-lg-4">';

    html += '<div class="card mb-2">';
    html += '<div class="card-header bg-primary text-white py-1" style="font-size:0.85rem"><i class="bi bi-pencil-square me-1"></i> Additional Inputs</div>';
    html += '<div class="card-body p-2">';

    // Ethnicity (9-category)
    html += '<div class="mb-2">';
    html += '<label class="form-label small fw-bold mb-1">Ethnicity</label>';
    html += '<select class="form-select form-select-sm qr-input" data-key="ethnicity">';
    var ethOpts = [
      { v: '', l: '-- Select --' },
      { v: '1', l: 'White or not stated' },
      { v: '2', l: 'Indian' },
      { v: '3', l: 'Pakistani' },
      { v: '4', l: 'Bangladeshi' },
      { v: '5', l: 'Other Asian' },
      { v: '6', l: 'Black Caribbean' },
      { v: '7', l: 'Black African' },
      { v: '8', l: 'Chinese' },
      { v: '9', l: 'Other ethnic group' }
    ];
    for (var e = 0; e < ethOpts.length; e++) {
      html += '<option value="' + ethOpts[e].v + '">' + ethOpts[e].l + '</option>';
    }
    html += '</select></div>';

    // Cholesterol / HDL ratio
    html += '<div class="mb-2">';
    html += '<label class="form-label small fw-bold mb-1">Total Cholesterol / HDL Ratio</label>';
    html += '<div class="row g-1">';
    html += '<div class="col-5"><input type="number" step="0.1" min="0" max="20" class="form-control form-control-sm qr-input" data-key="totalChol" placeholder="Total chol"></div>';
    html += '<div class="col-2 text-center pt-1"><small class="text-muted">/</small></div>';
    html += '<div class="col-5"><input type="number" step="0.1" min="0" max="10" class="form-control form-control-sm qr-input" data-key="hdlChol" placeholder="HDL"></div>';
    html += '</div>';
    html += '<div class="mt-1" style="font-size:0.78rem">Ratio: <strong id="qr-chol-ratio">—</strong></div>';
    html += '</div>';

    // SBP Standard Deviation
    html += '<div class="mb-2">';
    html += '<label class="form-label small fw-bold mb-1">Systolic BP Variability (SD)</label>';
    html += '<input type="number" step="0.1" min="0" max="50" class="form-control form-control-sm qr-input" data-key="sbpSD" placeholder="0 if single reading">';
    html += '<div class="form-text" style="font-size:0.7rem">SD of repeated readings. Use 0 if only one reading available.</div>';
    html += '</div>';

    // Townsend score
    html += '<div class="mb-2">';
    html += '<label class="form-label small fw-bold mb-1">Townsend Deprivation Score</label>';
    html += '<input type="number" step="0.01" min="-8" max="12" class="form-control form-control-sm qr-input" data-key="townsend" placeholder="0 = average">';
    html += '<div class="form-text" style="font-size:0.7rem">Derived from postcode. 0 = average deprivation.</div>';
    html += '</div>';

    // Smoking (override)
    html += '<div class="mb-2">';
    html += '<label class="form-label small fw-bold mb-1">Smoking Status (override)</label>';
    html += '<select class="form-select form-select-sm qr-input" data-key="smokingOverride">';
    html += '<option value="">Use auto-detected</option>';
    html += '<option value="0">Non-smoker</option>';
    html += '<option value="1">Ex-smoker</option>';
    html += '<option value="2">Light smoker (1-9/day)</option>';
    html += '<option value="3">Moderate smoker (10-19/day)</option>';
    html += '<option value="4">Heavy smoker (≥20/day)</option>';
    html += '</select></div>';

    // Family history CHD
    html += checkRow('familyCHD', 'Family history of CHD in 1st-degree relative <60');

    html += '</div></div>';
    html += '</div>'; // end col 2

    // ═══ COL 3: Clinical conditions ═══
    html += '<div class="col-lg-4">';

    html += '<div class="card mb-2">';
    html += '<div class="card-header bg-warning text-dark py-1" style="font-size:0.85rem"><i class="bi bi-clipboard2-pulse me-1"></i> Clinical Conditions (override)</div>';
    html += '<div class="card-body p-2">';
    html += '<p class="text-muted mb-2" style="font-size:0.72rem">Tick below to override auto-detected values or add conditions not captured elsewhere.</p>';

    html += checkRow('overrideAF', 'Atrial fibrillation');
    html += checkRow('overrideDM1', 'Diabetes Type 1');
    html += checkRow('overrideDM2', 'Diabetes Type 2');
    html += checkRow('overrideHTN', 'Treated hypertension (on BP meds)');
    html += checkRow('overrideMigraine', 'Migraine');
    html += checkRow('overrideSMI', 'Severe mental illness');
    html += checkRow('overrideAntipsych', 'Atypical antipsychotic use');
    html += checkRow('overrideSteroids', 'Regular corticosteroid use');
    html += checkRow('rheumatoidArthritis', 'Rheumatoid arthritis');
    html += checkRow('ckd345', 'Chronic kidney disease (stage 3-5)');
    html += checkRow('sle', 'Systemic lupus erythematosus (SLE)');
    html += checkRow('erectileDysfunction', 'Erectile dysfunction (males)');
    html += checkRow('hiv', 'HIV / AIDS');

    html += '</div></div>';
    html += '</div>'; // end col 3

    html += '</div>'; // end row

    container.innerHTML = html;

    // ── Bind events ──
    var inputs = container.querySelectorAll('.qr-input');
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener('change', function () {
        var key = this.getAttribute('data-key');
        var val = this.type === 'checkbox' ? this.checked : this.value;
        set(key, val);
        updateCholRatio();
      });
      if (inputs[i].type === 'number') {
        inputs[i].addEventListener('input', function () {
          var key = this.getAttribute('data-key');
          set(key, this.value);
          updateCholRatio();
        });
      }
    }

    // Calculate button
    var calcBtn = container.querySelector('#qrisk3-calculate-btn');
    if (calcBtn) {
      calcBtn.addEventListener('click', function () {
        if (BHM.Scoring && BHM.Scoring.qrisk3) BHM.Scoring.qrisk3();
        showScore();
      });
    }

    // Restore saved values
    restoreValues(container);
    refreshAutoValues();
    updateCholRatio();

    // Subscribe to changes from other tabs
    S.subscribe(function (path) {
      if (path.indexOf('patient.') === 0 || path.indexOf('physicalExam.') === 0 ||
          path.indexOf('medicalHistory.') === 0 || path.indexOf('medications.') === 0 ||
          path.indexOf('instruments.clinical.') === 0) {
        refreshAutoValues();
      }
    });
  }

  function autoRow(label, id) {
    return '<tr><td style="width:55%">' + label + '</td><td id="' + id + '"><span class="text-muted fst-italic" style="font-size:0.72rem">Not set</span></td></tr>';
  }

  function checkRow(key, label) {
    var checked = get(key) ? ' checked' : '';
    return '<div class="form-check mb-1">' +
      '<input class="form-check-input qr-input" type="checkbox" data-key="' + key + '" id="qr-' + key + '"' + checked + '>' +
      '<label class="form-check-label" for="qr-' + key + '" style="font-size:0.82rem">' + label + '</label></div>';
  }

  function updateCholRatio() {
    var tc = parseFloat(get('totalChol'));
    var hdl = parseFloat(get('hdlChol'));
    var el = document.getElementById('qr-chol-ratio');
    if (el) {
      if (tc > 0 && hdl > 0) {
        el.textContent = (tc / hdl).toFixed(1);
      } else {
        el.textContent = '—';
      }
    }
  }

  function restoreValues(container) {
    var inputs = container.querySelectorAll('.qr-input');
    for (var i = 0; i < inputs.length; i++) {
      var key = inputs[i].getAttribute('data-key');
      var saved = get(key);
      if (saved !== undefined && saved !== null && saved !== '') {
        if (inputs[i].type === 'checkbox') {
          inputs[i].checked = !!saved;
        } else {
          inputs[i].value = saved;
        }
      }
    }
  }

  function showScore() {
    var el = document.getElementById('qrisk3-score-display');
    if (!el) return;
    var score = S.getScore('qrisk3');
    if (!score) {
      el.innerHTML = '<div class="alert alert-warning py-2" style="font-size:0.82rem"><i class="bi bi-exclamation-triangle me-1"></i>Could not calculate. Check required fields.</div>';
      return;
    }
    if (score.error) {
      el.innerHTML = '<div class="alert alert-warning py-2" style="font-size:0.82rem"><i class="bi bi-exclamation-triangle me-1"></i>' + score.error + '</div>';
      return;
    }

    var pct = score.score;
    var riskClass = pct >= 20 ? 'danger' : pct >= 10 ? 'warning' : 'success';
    var riskLabel = pct >= 20 ? 'High risk' : pct >= 10 ? 'Moderate risk' : 'Low risk';

    var html = '<div class="card border-' + riskClass + '">';
    html += '<div class="card-body p-2 text-center">';
    html += '<div style="font-size:2rem;font-weight:bold" class="text-' + riskClass + '">' + pct.toFixed(1) + '%</div>';
    html += '<div class="fw-bold text-' + riskClass + '">' + riskLabel + '</div>';
    html += '<div class="text-muted" style="font-size:0.75rem">10-year CVD risk (QRISK3-2017)</div>';
    if (score.warnings && score.warnings.length > 0) {
      html += '<div class="mt-1" style="font-size:0.72rem">';
      for (var w = 0; w < score.warnings.length; w++) {
        html += '<div class="text-warning"><i class="bi bi-info-circle me-1"></i>' + score.warnings[w] + '</div>';
      }
      html += '</div>';
    }
    html += '</div></div>';
    el.innerHTML = html;
  }

  return {
    render: render,
    showScore: showScore,
    refreshAutoValues: refreshAutoValues
  };
})();
