/* ═══════════════════════════════════════════════════════════════
   BHM.Instruments.PhysicalExam — Physical examination findings
   Height, weight, BMI, neck circumference, BP, HR, O2 sat,
   general observations
   ═══════════════════════════════════════════════════════════════ */
var BHM = window.BHM || {};
BHM.Instruments = BHM.Instruments || {};

BHM.Instruments.PhysicalExam = (function () {
  'use strict';

  var S = BHM.State;
  var SP = 'physicalExam';

  function get(key) { return S.get(SP + '.' + key); }
  function set(key, val) { S.set(SP + '.' + key, val); recalcBMI(); triggerScoring(); }
  function triggerScoring() {
    if (BHM.Scoring && BHM.Scoring.stopBang) BHM.Scoring.stopBang();
    if (BHM.Scoring && BHM.Scoring.triggerReport) BHM.Scoring.triggerReport();
    else if (BHM.Report && BHM.Report.update) BHM.Report.update();
  }

  // ── Auto-calculate BMI ──
  function recalcBMI() {
    var h = parseFloat(get('heightCm'));
    var w = parseFloat(get('weightKg'));
    if (h > 0 && w > 0) {
      var hm = h / 100;
      var bmi = (w / (hm * hm)).toFixed(1);
      // Silently set BMI without re-triggering (avoid loop)
      S.set(SP + '.bmi', bmi);
      var bmiEl = document.getElementById('pe-bmi-display');
      if (bmiEl) {
        bmiEl.textContent = bmi;
        bmiEl.className = 'fw-bold ' + bmiClass(parseFloat(bmi));
      }
    }
  }

  function bmiClass(bmi) {
    if (bmi < 18.5) return 'text-info';
    if (bmi < 25) return 'text-success';
    if (bmi < 30) return 'text-warning';
    return 'text-danger';
  }

  function bmiLabel(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    if (bmi < 35) return 'Obese (Class I)';
    if (bmi < 40) return 'Obese (Class II)';
    return 'Obese (Class III)';
  }

  // ═══════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════
  function render(container) {
    container.innerHTML = '';
    var card = document.createElement('div');
    card.className = 'instrument-card';

    card.innerHTML =
      '<h5><i class="bi bi-clipboard2-check me-2"></i>Physical Examination</h5>' +
      '<p class="instrument-subtitle">Record basic physical examination findings. ' +
      'BMI is calculated automatically from height and weight. These data also contribute to the STOP-BANG sleep apnoea screening score.</p>';

    // ── Anthropometrics ──
    var anthroH = document.createElement('h6');
    anthroH.className = 'mt-3 mb-2'; anthroH.style.fontSize = '0.9rem';
    anthroH.innerHTML = '<i class="bi bi-rulers me-1"></i>Anthropometrics';
    card.appendChild(anthroH);

    var anthroRow = document.createElement('div');
    anthroRow.className = 'row g-3 mb-3';

    anthroRow.appendChild(fieldCol('Height (cm)', 'heightCm', 'number', 'e.g. 172', 'col-md-2'));
    anthroRow.appendChild(fieldCol('Weight (kg)', 'weightKg', 'number', 'e.g. 78', 'col-md-2'));

    // BMI display
    var bmiCol = document.createElement('div');
    bmiCol.className = 'col-md-2';
    var bmiGroup = document.createElement('div');
    bmiGroup.className = 'bhm-field-group';
    bmiGroup.innerHTML =
      '<label class="form-label small fw-bold">BMI (auto)</label>' +
      '<div class="form-control form-control-sm" style="background:var(--bs-tertiary-bg,#f8f9fa)">' +
      '<span id="pe-bmi-display" class="fw-bold">—</span>' +
      ' <small id="pe-bmi-label" class="text-muted"></small></div>';
    bmiCol.appendChild(bmiGroup);
    anthroRow.appendChild(bmiCol);

    anthroRow.appendChild(fieldCol('Neck circumference (cm)', 'neckCircCm', 'number', 'e.g. 42', 'col-md-3'));
    anthroRow.appendChild(fieldCol('Waist circumference (cm)', 'waistCircCm', 'number', 'Optional', 'col-md-3'));

    card.appendChild(anthroRow);

    // ── Vital Signs ──
    var vitalsH = document.createElement('h6');
    vitalsH.className = 'mt-3 mb-2'; vitalsH.style.fontSize = '0.9rem';
    vitalsH.innerHTML = '<i class="bi bi-heart-pulse me-1"></i>Vital Signs';
    card.appendChild(vitalsH);

    var vitalsRow = document.createElement('div');
    vitalsRow.className = 'row g-3 mb-3';

    vitalsRow.appendChild(fieldCol('Systolic BP (mmHg)', 'bpSystolic', 'number', 'e.g. 134', 'col-md-2'));
    vitalsRow.appendChild(fieldCol('Diastolic BP (mmHg)', 'bpDiastolic', 'number', 'e.g. 82', 'col-md-2'));
    vitalsRow.appendChild(fieldCol('Heart rate (bpm)', 'heartRate', 'number', 'e.g. 72', 'col-md-2'));
    vitalsRow.appendChild(fieldCol('O₂ saturation (%)', 'o2Sat', 'number', 'e.g. 97', 'col-md-2'));
    vitalsRow.appendChild(fieldCol('Temperature (°C)', 'temperature', 'number', 'e.g. 36.6', 'col-md-2'));
    vitalsRow.appendChild(fieldCol('Respiratory rate', 'respRate', 'number', 'e.g. 16', 'col-md-2'));

    card.appendChild(vitalsRow);

    // ── Postural BP (lying → standing) ──
    var posturalH = document.createElement('h6');
    posturalH.className = 'mt-3 mb-2'; posturalH.style.fontSize = '0.9rem';
    posturalH.innerHTML = '<i class="bi bi-arrow-up-circle me-1"></i>Postural Blood Pressure (optional)';
    card.appendChild(posturalH);

    var posturalRow = document.createElement('div');
    posturalRow.className = 'row g-3 mb-3';

    posturalRow.appendChild(fieldCol('Lying systolic', 'bpLyingSys', 'number', '', 'col-md-2'));
    posturalRow.appendChild(fieldCol('Lying diastolic', 'bpLyingDia', 'number', '', 'col-md-2'));
    posturalRow.appendChild(fieldCol('Standing systolic', 'bpStandingSys', 'number', '', 'col-md-2'));
    posturalRow.appendChild(fieldCol('Standing diastolic', 'bpStandingDia', 'number', '', 'col-md-2'));

    // Postural drop display
    var dropCol = document.createElement('div');
    dropCol.className = 'col-md-4';
    var dropGroup = document.createElement('div');
    dropGroup.className = 'bhm-field-group';
    dropGroup.innerHTML =
      '<label class="form-label small fw-bold">Postural drop</label>' +
      '<div class="form-control form-control-sm" style="background:var(--bs-tertiary-bg,#f8f9fa)">' +
      '<span id="pe-postural-drop">—</span></div>';
    dropCol.appendChild(dropGroup);
    posturalRow.appendChild(dropCol);

    card.appendChild(posturalRow);

    // ── General Observations ──
    var obsH = document.createElement('h6');
    obsH.className = 'mt-3 mb-2'; obsH.style.fontSize = '0.9rem';
    obsH.innerHTML = '<i class="bi bi-eye me-1"></i>General Observations';
    card.appendChild(obsH);

    var obsRow = document.createElement('div');
    obsRow.className = 'row g-3 mb-3';

    obsRow.appendChild(selectCol('Gait', 'gait', ['', 'Normal', 'Broad-based', 'Shuffling', 'Ataxic', 'Antalgic', 'Unsteady', 'Wheelchair / immobile', 'Other'], 'col-md-3'));
    obsRow.appendChild(selectCol('Tremor', 'tremor', ['', 'None', 'Resting tremor', 'Action/postural tremor', 'Intention tremor', 'Mixed'], 'col-md-3'));
    obsRow.appendChild(selectCol('Rigidity', 'rigidity', ['', 'None', 'Mild', 'Moderate', 'Severe — cogwheel', 'Severe — lead-pipe'], 'col-md-3'));
    obsRow.appendChild(selectCol('Nutritional status', 'nutritional', ['', 'Well nourished', 'Malnourished', 'Overweight', 'Obese', 'Cachectic'], 'col-md-3'));

    card.appendChild(obsRow);

    // ── Focal neurology ──
    var focalTA = buildTextarea('focalNeurology', 'Focal neurological signs',
      'e.g. Upper motor neuron signs R side, Babinski positive L, visual field defect...');
    card.appendChild(focalTA);

    // ── Other examination findings ──
    var otherTA = buildTextarea('otherFindings', 'Other examination findings',
      'e.g. Peripheral oedema, carotid bruit, skin changes, lymphadenopathy...');
    card.appendChild(otherTA);

    // ── STOP-BANG summary ──
    var sbCard = document.createElement('div');
    sbCard.className = 'card mt-3';
    sbCard.innerHTML =
      '<div class="card-header py-2"><h6 class="mb-0" style="font-size:0.9rem">' +
      '<i class="bi bi-moon-stars me-1"></i>STOP-BANG Score (auto-calculated)</h6></div>' +
      '<div class="card-body py-2">' +
      '<p class="small text-muted mb-2">Derived from data entered across the assessment. Items in <strong>bold</strong> are positive.</p>' +
      '<div id="pe-stopbang-items" class="small"></div>' +
      '<div class="mt-2 fw-bold">Total: <span id="pe-stopbang-total">—</span>/8 &nbsp; ' +
      '<span id="pe-stopbang-interp" class="badge bg-secondary">—</span></div>' +
      '</div>';
    card.appendChild(sbCard);

    container.appendChild(card);

    // Restore values & recalculate
    restoreInputs(container);
    recalcBMI();
    updatePosturalDrop();
  }

  // ═══════════════════════════════════════════
  //  FIELD BUILDERS
  // ═══════════════════════════════════════════

  function fieldCol(label, key, type, placeholder, colClass) {
    var col = document.createElement('div');
    col.className = colClass || 'col-md-3';
    var group = document.createElement('div');
    group.className = 'bhm-field-group';
    group.innerHTML = '<label class="form-label small fw-bold">' + label + '</label>';
    var input = document.createElement('input');
    input.type = type || 'text';
    input.className = 'form-control form-control-sm';
    input.placeholder = placeholder || '';
    input.dataset.peKey = key;
    if (type === 'number') { input.step = 'any'; input.min = '0'; }
    input.addEventListener('input', function () {
      set(key, type === 'number' ? (input.value !== '' ? parseFloat(input.value) : null) : input.value);
      if (key === 'bpLyingSys' || key === 'bpLyingDia' || key === 'bpStandingSys' || key === 'bpStandingDia') {
        updatePosturalDrop();
      }
    });
    group.appendChild(input);
    col.appendChild(group);
    return col;
  }

  function selectCol(label, key, options, colClass) {
    var col = document.createElement('div');
    col.className = colClass || 'col-md-3';
    var group = document.createElement('div');
    group.className = 'bhm-field-group';
    group.innerHTML = '<label class="form-label small fw-bold">' + label + '</label>';
    var sel = document.createElement('select');
    sel.className = 'form-select form-select-sm';
    sel.dataset.peKey = key;
    for (var i = 0; i < options.length; i++) {
      var opt = document.createElement('option');
      opt.value = options[i];
      opt.textContent = options[i] || '— Select —';
      sel.appendChild(opt);
    }
    sel.addEventListener('change', function () { set(key, sel.value); });
    group.appendChild(sel);
    col.appendChild(group);
    return col;
  }

  function buildTextarea(stateKey, label, placeholder) {
    var wrapper = document.createElement('div');
    wrapper.className = 'mb-3';
    if (label) {
      var lbl = document.createElement('label');
      lbl.className = 'form-label small fw-bold';
      lbl.textContent = label;
      wrapper.appendChild(lbl);
    }
    var ta = document.createElement('textarea');
    ta.className = 'form-control form-control-sm';
    ta.rows = 2;
    ta.placeholder = placeholder || '';
    ta.dataset.peKey = stateKey;
    ta.addEventListener('input', function () { set(stateKey, ta.value); });
    wrapper.appendChild(ta);
    return wrapper;
  }

  // ═══════════════════════════════════════════
  //  RESTORE SAVED VALUES
  // ═══════════════════════════════════════════

  function restoreInputs(container) {
    var inputs = container.querySelectorAll('[data-pe-key]');
    for (var i = 0; i < inputs.length; i++) {
      var el = inputs[i];
      var key = el.dataset.peKey;
      var val = get(key);
      if (val !== undefined && val !== null && val !== '') {
        if (el.tagName === 'SELECT') el.value = val;
        else el.value = val;
      }
    }
    // Update BMI display
    var bmi = get('bmi');
    if (bmi) {
      var bmiEl = document.getElementById('pe-bmi-display');
      var bmiLbl = document.getElementById('pe-bmi-label');
      if (bmiEl) {
        bmiEl.textContent = bmi;
        bmiEl.className = 'fw-bold ' + bmiClass(parseFloat(bmi));
      }
      if (bmiLbl) bmiLbl.textContent = bmiLabel(parseFloat(bmi));
    }
  }

  function updatePosturalDrop() {
    var ls = parseFloat(get('bpLyingSys'));
    var ss = parseFloat(get('bpStandingSys'));
    var el = document.getElementById('pe-postural-drop');
    if (!el) return;
    if (ls > 0 && ss > 0) {
      var drop = ls - ss;
      var significant = drop >= 20;
      el.innerHTML = 'Systolic drop: <strong class="' + (significant ? 'text-danger' : 'text-success') + '">' +
        drop + ' mmHg</strong>' + (significant ? ' — <em>significant postural hypotension</em>' : ' — within normal range');
    } else {
      el.textContent = '—';
    }
  }

  // ═══════════════════════════════════════════
  //  STOP-BANG display update (called by scoring)
  // ═══════════════════════════════════════════
  function updateStopBangDisplay(result) {
    var itemsEl = document.getElementById('pe-stopbang-items');
    var totalEl = document.getElementById('pe-stopbang-total');
    var interpEl = document.getElementById('pe-stopbang-interp');
    if (!itemsEl || !totalEl || !interpEl) return;

    var labels = [
      { key: 'snoring', letter: 'S', label: 'Snoring — loud snoring reported' },
      { key: 'tired', letter: 'T', label: 'Tired — excessive daytime sleepiness (Epworth > 10)' },
      { key: 'observed', letter: 'O', label: 'Observed — breathing pauses observed during sleep' },
      { key: 'pressure', letter: 'P', label: 'Pressure — treated for high blood pressure' },
      { key: 'bmi', letter: 'B', label: 'BMI > 35' },
      { key: 'age', letter: 'A', label: 'Age > 50' },
      { key: 'neck', letter: 'N', label: 'Neck circumference > 40 cm' },
      { key: 'gender', letter: 'G', label: 'Gender — male' }
    ];

    var html = '<div class="row g-1">';
    for (var i = 0; i < labels.length; i++) {
      var pos = result.items[labels[i].key];
      var unknown = result.unknown && result.unknown[labels[i].key];
      html += '<div class="col-md-6">';
      if (unknown) {
        html += '<span class="text-muted"><i class="bi bi-question-circle me-1"></i>';
        html += '<strong>' + labels[i].letter + '</strong> — ' + labels[i].label + ' <em>(not assessed)</em></span>';
      } else if (pos) {
        html += '<span class="text-danger"><i class="bi bi-check-circle-fill me-1"></i>';
        html += '<strong>' + labels[i].letter + '</strong> — ' + labels[i].label + '</span>';
      } else {
        html += '<span class="text-success"><i class="bi bi-x-circle me-1"></i>';
        html += labels[i].letter + ' — ' + labels[i].label + '</span>';
      }
      html += '</div>';
    }
    html += '</div>';
    itemsEl.innerHTML = html;

    totalEl.textContent = result.total;
    if (result.total >= 5) {
      interpEl.textContent = 'High risk of OSA';
      interpEl.className = 'badge bg-danger';
    } else if (result.total >= 3) {
      interpEl.textContent = 'Intermediate risk of OSA';
      interpEl.className = 'badge bg-warning text-dark';
    } else {
      interpEl.textContent = 'Low risk of OSA';
      interpEl.className = 'badge bg-success';
    }
  }

  return {
    render: render,
    updateStopBangDisplay: updateStopBangDisplay
  };
})();
