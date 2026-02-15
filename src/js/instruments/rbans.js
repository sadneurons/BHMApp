/* ═══════════════════════════════════════════════════════
   BHM.Instruments.RBANS — RBANS Calculator & Supplementary Analysis
   Re-implemented from rbanscalc.html with improved styling
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};
BHM.Instruments = BHM.Instruments || {};

BHM.Instruments.RBANS = (function () {
  'use strict';

  var S = BHM.State;
  var N = BHM.RBANSNorms;
  var PREFIX = 'instruments.rbans';
  var _chart = null; // Chart.js instance

  // ── Subtest definitions ──
  var SUBTESTS = [
    { id: 'listlearning',    label: 'List Learning',     max: 40,  domain: 'Immediate Memory' },
    { id: 'storylearning',   label: 'Story Learning',    max: 24,  domain: 'Immediate Memory' },
    { id: 'figurecopy',      label: 'Figure Copy',       max: 20,  domain: 'Visuospatial/Constructional' },
    { id: 'lineorientation', label: 'Line Orientation',  max: 20,  domain: 'Visuospatial/Constructional' },
    { id: 'naming',          label: 'Picture Naming',    max: 10,  domain: 'Language' },
    { id: 'semanticfluency', label: 'Semantic Fluency',  max: 40,  domain: 'Language' },
    { id: 'digitspan',       label: 'Digit Span',        max: 16,  domain: 'Attention' },
    { id: 'coding',          label: 'Coding',            max: 89,  domain: 'Attention' },
    { id: 'listrecall',      label: 'List Recall',       max: 10,  domain: 'Delayed Memory' },
    { id: 'listrecog',       label: 'List Recognition',  max: 20,  domain: 'Delayed Memory' },
    { id: 'storyrecall',     label: 'Story Recall',      max: 12,  domain: 'Delayed Memory' },
    { id: 'figurerecall',    label: 'Figure Recall',     max: 20,  domain: 'Delayed Memory' }
  ];

  // ═══════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════
  function render(container) {
    if (!container) return;
    container.innerHTML = '';

    var html = '';
    html += '<h5 class="mb-3"><i class="bi bi-calculator me-2"></i>RBANS Calculator &amp; Supplementary Analysis</h5>';

    // ── Three-column layout: demographics, subtests, results ──
    html += '<div class="row g-3">';

    // ═══ COL 1: Demographics ═══
    html += '<div class="col-lg-3">';

    html += '<div class="card mb-3">';
    html += '<div class="card-header bg-primary text-white py-2"><i class="bi bi-person me-1"></i> Demographics</div>';
    html += '<div class="card-body p-2">';
    html += '<table class="cdr-worksheet-table mb-0">';
    html += '<colgroup><col style="width:50%"><col style="width:50%"></colgroup>';
    html += demoRow('topf', 'TOPF Score', 'number', '0–70');

    // Auto-derived: Age from patient.dob
    var autoAge = getPatientAge();
    html += '<tr><td>Age</td><td class="cdr-ws-note-cell">' +
      '<span id="rbans-auto-age" class="fw-bold" style="font-size:0.9rem">' +
      (autoAge !== null ? autoAge + ' yrs' : '<span class="text-muted fst-italic">Set DOB on Session tab</span>') +
      '</span></td></tr>';

    // Auto-derived: Years of Education from clinical interview
    var autoYOE = S.get('instruments.clinical.yearsEdu');
    html += '<tr><td>Years of Education</td><td class="cdr-ws-note-cell">' +
      '<span id="rbans-auto-yoe" class="fw-bold" style="font-size:0.9rem">' +
      (autoYOE !== undefined && autoYOE !== null && autoYOE !== '' ? autoYOE + ' yrs' : '<span class="text-muted fst-italic">Set on Clinical Interview tab</span>') +
      '</span></td></tr>';

    // Auto-derived: Sex from patient.sex
    var autoSex = S.get('patient.sex');
    html += '<tr><td>Sex</td><td class="cdr-ws-note-cell">' +
      '<span id="rbans-auto-sex" class="fw-bold" style="font-size:0.9rem">' +
      (autoSex ? autoSex : '<span class="text-muted fst-italic">Set on Session tab</span>') +
      '</span></td></tr>';

    html += '<tr><td>Ethnicity</td><td class="cdr-ws-note-cell">' +
      radioGroup('ethnicity', [{ v: 'White', l: 'White' }, { v: 'Non-White', l: 'Non-White' }]) + '</td></tr>';
    html += '</table>';
    html += '</div></div>';

    // -- Calculate button --
    html += '<div class="d-grid mb-3"><button class="btn btn-primary" id="rbans-calculate-btn">' +
      '<i class="bi bi-calculator me-1"></i>Calculate All Scores</button></div>';

    html += '</div>'; // end col 1

    // ═══ COL 2: Subtest Raw Scores ═══
    html += '<div class="col-lg-4">';

    html += '<div class="card mb-3">';
    html += '<div class="card-header bg-primary text-white py-2"><i class="bi bi-pencil-square me-1"></i> Subtest Raw Scores</div>';
    html += '<div class="card-body p-2">';
    html += '<table class="cdr-worksheet-table mb-0">';
    html += '<colgroup><col style="width:50%"><col style="width:30%"><col style="width:20%"></colgroup>';
    html += '<thead><tr><th style="text-align:left">Subtest</th><th>Score</th><th>Max</th></tr></thead>';
    html += '<tbody>';

    var lastDomain = '';
    for (var i = 0; i < SUBTESTS.length; i++) {
      var st = SUBTESTS[i];
      if (st.domain !== lastDomain) {
        html += '<tr class="cdr-ws-subsection"><td colspan="3">' + st.domain + '</td></tr>';
        lastDomain = st.domain;
      }
      var savedVal = S.get(PREFIX + '.' + st.id);
      html += '<tr><td>' + st.label + '</td>';
      html += '<td class="cdr-ws-note-cell"><input type="number" id="rbans-' + st.id + '" ' +
        'min="0" max="' + st.max + '" class="rbans-input" data-key="' + st.id + '" ' +
        (savedVal !== undefined && savedVal !== null ? 'value="' + savedVal + '"' : '') +
        ' placeholder="0–' + st.max + '"></td>';
      html += '<td style="text-align:center;color:#6c757d;font-size:0.8rem">/' + st.max + '</td>';
      html += '</tr>';
    }
    html += '</tbody></table>';
    html += '</div></div>';

    html += '</div>'; // end col 2

    // ═══ COL 3: Results ═══
    html += '<div class="col-lg-5">';
    html += '<div id="rbans-results">';
    html += '<div class="card mb-3"><div class="card-body text-center text-muted py-4">' +
      '<i class="bi bi-arrow-left-circle me-1"></i>Enter demographics and subtest scores, then click Calculate</div></div>';
    html += '</div>';
    html += '</div>'; // end col 3

    html += '</div>'; // end row

    container.innerHTML = html;

    // ── Bind events ──
    var inputs = container.querySelectorAll('.rbans-input');
    for (var j = 0; j < inputs.length; j++) {
      inputs[j].addEventListener('change', function () {
        var key = this.getAttribute('data-key');
        var val = this.value !== '' ? parseInt(this.value, 10) : null;
        S.set(PREFIX + '.' + key, val);
      });
    }

    // Radio buttons
    var radios = container.querySelectorAll('.rbans-radio');
    for (var k = 0; k < radios.length; k++) {
      radios[k].addEventListener('change', function () {
        var key = this.getAttribute('data-key');
        S.set(PREFIX + '.' + key, this.value);
      });
    }

    // Calculate button
    var calcBtn = container.querySelector('#rbans-calculate-btn');
    if (calcBtn) {
      calcBtn.addEventListener('click', function () {
        calculate();
      });
    }

    // Restore radio selections
    var savedEth = S.get(PREFIX + '.ethnicity');
    if (savedEth) {
      var eEl = container.querySelector('input.rbans-radio[data-key="ethnicity"][value="' + savedEth + '"]');
      if (eEl) eEl.checked = true;
    }
  }

  // ── Helper: derive age from patient.dob ──
  function getPatientAge() {
    var dob = S.get('patient.dob');
    if (!dob) return null;
    var b = new Date(dob);
    var now = new Date();
    var age = now.getFullYear() - b.getFullYear();
    var m = now.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
    return age;
  }

  // ── Helper: demographic input row ──
  function demoRow(id, label, type, placeholder) {
    var savedVal = S.get(PREFIX + '.' + id);
    return '<tr><td>' + label + '</td><td class="cdr-ws-note-cell">' +
      '<input type="' + type + '" id="rbans-' + id + '" class="rbans-input" data-key="' + id + '" ' +
      'placeholder="' + placeholder + '" ' +
      (savedVal !== undefined && savedVal !== null ? 'value="' + savedVal + '"' : '') +
      '></td></tr>';
  }

  // ── Helper: radio button group ──
  function radioGroup(key, options) {
    var html = '<div class="d-flex gap-3">';
    for (var i = 0; i < options.length; i++) {
      var uid = 'rbans-' + key + '-' + options[i].v;
      html += '<div class="form-check form-check-inline mb-0">' +
        '<input class="form-check-input rbans-radio" type="radio" name="rbans_' + key + '" ' +
        'id="' + uid + '" value="' + options[i].v + '" data-key="' + key + '">' +
        '<label class="form-check-label" for="' + uid + '" style="font-size:0.84rem">' + options[i].l + '</label></div>';
    }
    html += '</div>';
    return html;
  }

  // ═══════════════════════════════════════════
  //  CALCULATE
  // ═══════════════════════════════════════════
  function calculate() {
    var d = S.getSession().instruments.rbans || {};
    var SD = 15;

    // Pull demographics from session / clinical interview
    var derivedAge = getPatientAge();
    var derivedSex = S.get('patient.sex');
    var derivedYOE = S.get('instruments.clinical.yearsEdu');

    // Validate required fields
    var missing = [];
    if (derivedAge === null || derivedAge === undefined) missing.push('Age (set DOB on Session tab)');
    if (!derivedSex) missing.push('Sex (set on Session tab)');
    if (!d.ethnicity) missing.push('Ethnicity');
    if (derivedYOE === undefined || derivedYOE === null || derivedYOE === '') missing.push('Years of Education (set on Clinical Interview tab)');
    for (var i = 0; i < SUBTESTS.length; i++) {
      if (d[SUBTESTS[i].id] === undefined || d[SUBTESTS[i].id] === null) {
        missing.push(SUBTESTS[i].label);
      }
    }
    if (missing.length > 0) {
      showError('Please complete: ' + missing.join(', '));
      return;
    }

    var age = parseInt(derivedAge, 10);
    var topf = d.topf !== undefined && d.topf !== null ? parseInt(d.topf, 10) : null;
    var yearsEd = parseInt(derivedYOE, 10);

    // Get raw scores
    var listlearning = parseInt(d.listlearning, 10);
    var storylearning = parseInt(d.storylearning, 10);
    var figurecopy = parseInt(d.figurecopy, 10);
    var lineorientation = parseInt(d.lineorientation, 10);
    var naming = parseInt(d.naming, 10);
    var semanticfluency = parseInt(d.semanticfluency, 10);
    var digitspan = parseInt(d.digitspan, 10);
    var coding = parseInt(d.coding, 10);
    var listrecall = parseInt(d.listrecall, 10);
    var listrecog = parseInt(d.listrecog, 10);
    var storyrecall = parseInt(d.storyrecall, 10);
    var figurerecall = parseInt(d.figurerecall, 10);

    // Select age-normed tables
    var ageGroup;
    if (age > 79) ageGroup = '80';
    else if (age >= 70) ageGroup = '70';
    else if (age >= 60) ageGroup = '60';
    else ageGroup = '50';

    var memArray = N['mem' + ageGroup];
    var immArray = N['immediate' + ageGroup];
    var visuoArray = N['visuo' + ageGroup];
    var langArray = N['language' + ageGroup];
    var attArray = N['att' + ageGroup];

    // ── DELAYED MEMORY INDEX ──
    var delayedMemoryRaw = listrecall + storyrecall + figurerecall;
    var delayedMemoryIndex = safeTableLookup(memArray, delayedMemoryRaw, listrecog);

    // ── IMMEDIATE MEMORY INDEX ──
    var immediateMemoryIndex = safeTableLookup(immArray, listlearning, storylearning);

    // ── VISUOSPATIAL INDEX ──
    var visuospatialIndex = safeTableLookup(visuoArray, figurecopy, lineorientation);

    // ── LANGUAGE INDEX ──
    var languageIndex = safeTableLookup(langArray, semanticfluency, naming);

    // ── ATTENTION INDEX ──
    var attentionIndex = safeTableLookup(attArray, coding, digitspan);

    // ── TOTAL SCALE ──
    var totalIndexRaw = attentionIndex + languageIndex + visuospatialIndex + immediateMemoryIndex + delayedMemoryIndex - 200;
    var totalArray = N.total_array;
    var totalScaledScore = totalIndexRaw >= 0 && totalIndexRaw < totalArray.length
      ? totalArray[totalIndexRaw]
      : (totalIndexRaw < 0 ? totalArray[0] : totalArray[totalArray.length - 1]);

    // Percentiles
    var centile = function (idx) { return (100 * N.GetZPercent((idx - 100) / SD)).toFixed(1); };
    var immCentile = centile(immediateMemoryIndex);
    var visuoCentile = centile(visuospatialIndex);
    var langCentile = centile(languageIndex);
    var attCentile = centile(attentionIndex);
    var memCentile = centile(delayedMemoryIndex);
    var totalCentile = centile(totalScaledScore);

    // ── DUFF REGRESSION NORMS ──
    var sexbeta = derivedSex === 'Male' ? 1 : 0;
    var ethnicbeta = d.ethnicity === 'White' ? 0 : 1;
    var yoebeta;
    if (yearsEd < 12) yoebeta = 1;
    else if (yearsEd === 12) yoebeta = 2;
    else if (yearsEd > 12 && yearsEd < 16) yoebeta = 3;
    else yoebeta = 4;

    var duff = {};
    // Immediate Memory
    duff.immPred = 95.54 - (age * 0.13) - (sexbeta * 4.36) + (yoebeta * 2.93) - (ethnicbeta * 6.65);
    duff.immZ = (immediateMemoryIndex - duff.immPred) / 17.24;
    duff.immIndex = (100 + duff.immZ * 15).toFixed(1);
    duff.immCentile = (100 * N.GetZPercent(duff.immZ)).toFixed(1);

    // Visuospatial
    duff.visuoPred = 103.34 - (age * 0.18) + (sexbeta * 5.20) + (yoebeta * 2.94) - (ethnicbeta * 8.79);
    duff.visuoZ = (visuospatialIndex - duff.visuoPred) / 16.20;
    duff.visuoIndex = (100 + duff.visuoZ * 15).toFixed(1);
    duff.visuoCentile = (100 * N.GetZPercent(duff.visuoZ)).toFixed(1);

    // Language
    duff.langPred = 92.77 - (age * 0.01) - (sexbeta * 3.25) + (yoebeta * 1.23) - (ethnicbeta * 5.74);
    duff.langZ = (languageIndex - duff.langPred) / 10.94;
    duff.langIndex = (100 + duff.langZ * 15).toFixed(1);
    duff.langCentile = (100 * N.GetZPercent(duff.langZ)).toFixed(1);

    // Attention
    duff.attPred = 106.92 - (age * 0.21) - (sexbeta * 2.07) + (yoebeta * 2.55) - (ethnicbeta * 7.35);
    duff.attZ = (attentionIndex - duff.attPred) / 15.43;
    duff.attIndex = (100 + duff.attZ * 15).toFixed(1);
    duff.attCentile = (100 * N.GetZPercent(duff.attZ)).toFixed(1);

    // Delayed Memory
    duff.memPred = 125.23 - (age * 0.43) - (sexbeta * 5.20) + (yoebeta * 2.12) - (ethnicbeta * 9.93);
    duff.memZ = (delayedMemoryIndex - duff.memPred) / 16.02;
    duff.memIndex = (100 + duff.memZ * 15).toFixed(1);
    duff.memCentile = (100 * N.GetZPercent(duff.memZ)).toFixed(1);

    // Total
    duff.totalPred = 105.01 - (age * 0.24) - (sexbeta * 2.86) + (yoebeta * 3.24) - (ethnicbeta * 10.33);
    duff.totalZ = (totalScaledScore - duff.totalPred) / 14.60;
    duff.totalIndex = (100 + duff.totalZ * 15).toFixed(1);
    duff.totalCentile = (100 * N.GetZPercent(duff.totalZ)).toFixed(1);

    // ── TOPF ──
    var fsiq = null;
    if (topf !== null && !isNaN(topf)) {
      fsiq = (29.991 + 2.0942600 * topf + (-0.0404559 * topf * topf) +
        (0.000340705 * topf * topf * topf) + yearsEd * 1.4617126 + 4.925 * (sexbeta + 1)).toFixed(0);
    }

    // ── EFFORT INDICES ──
    // Silverberg
    var digitEffort;
    if (digitspan < 5) digitEffort = 6;
    else if (digitspan === 5) digitEffort = 5;
    else if (digitspan === 6) digitEffort = 3;
    else if (digitspan === 7) digitEffort = 2;
    else digitEffort = 0;

    var recogEffort;
    if (listrecog < 10) recogEffort = 6;
    else if (listrecog === 10) recogEffort = 5;
    else if (listrecog >= 11 && listrecog <= 12) recogEffort = 4;
    else if (listrecog >= 13 && listrecog <= 14) recogEffort = 3;
    else if (listrecog >= 15 && listrecog <= 16) recogEffort = 2;
    else if (listrecog === 17) recogEffort = 1;
    else recogEffort = 0;

    var silverbergEI = digitEffort + recogEffort;

    // Novitski
    var novitskiES = digitspan + (listrecog - (listrecall + storylearning + figurerecall));

    // ── CORTICAL-SUBCORTICAL INDEX ──
    var corticalSub = ((visuospatialIndex + attentionIndex) / 2) - ((languageIndex + delayedMemoryIndex) / 2);

    // ── Save scores ──
    var scoreObj = {
      indices: {
        immediateMemory: immediateMemoryIndex,
        visuospatial: visuospatialIndex,
        language: languageIndex,
        attention: attentionIndex,
        delayedMemory: delayedMemoryIndex,
        totalScale: totalScaledScore
      },
      centiles: {
        immediateMemory: parseFloat(immCentile),
        visuospatial: parseFloat(visuoCentile),
        language: parseFloat(langCentile),
        attention: parseFloat(attCentile),
        delayedMemory: parseFloat(memCentile),
        totalScale: parseFloat(totalCentile)
      },
      duff: duff,
      fsiq: fsiq,
      silverbergEI: silverbergEI,
      novitskiES: novitskiES,
      corticalSubcortical: corticalSub
    };
    S.setScore('rbans', scoreObj);

    // ── Render results ──
    renderResults({
      age: age,
      topf: topf,
      fsiq: fsiq,
      indices: scoreObj.indices,
      centiles: scoreObj.centiles,
      duff: duff,
      silverbergEI: silverbergEI,
      novitskiES: novitskiES,
      corticalSub: corticalSub,
      rawScores: {
        listlearning: listlearning, storylearning: storylearning,
        figurecopy: figurecopy, lineorientation: lineorientation,
        naming: naming, semanticfluency: semanticfluency,
        digitspan: digitspan, coding: coding,
        listrecall: listrecall, listrecog: listrecog,
        storyrecall: storyrecall, figurerecall: figurerecall
      }
    });

    // Trigger report update
    if (BHM.Scoring && BHM.Scoring.triggerReport) BHM.Scoring.triggerReport();
  }

  // ── Safe table lookup with bounds clamping ──
  function safeTableLookup(table, row, col) {
    if (!table) return 40;
    var r = Math.max(0, Math.min(row, table.length - 1));
    var c = Math.max(0, Math.min(col, table[r].length - 1));
    return table[r][c];
  }

  // ── Show error in results area ──
  function showError(msg) {
    var el = document.getElementById('rbans-results');
    if (el) {
      el.innerHTML = '<div class="alert alert-warning"><i class="bi bi-exclamation-triangle me-1"></i>' + msg + '</div>';
    }
  }

  // ═══════════════════════════════════════════
  //  RENDER RESULTS
  // ═══════════════════════════════════════════
  function renderResults(r) {
    var el = document.getElementById('rbans-results');
    if (!el) return;

    var html = '';

    // ── TOPF Card ──
    if (r.fsiq !== null) {
      html += '<div class="card mb-3">';
      html += '<div class="card-header bg-info text-white py-2"><i class="bi bi-book me-1"></i> Test of Premorbid Functioning (TOPF)</div>';
      html += '<div class="card-body p-3">';
      html += '<p class="mb-1">The TOPF is a reading/vocabulary test to estimate premorbid ability. ' +
        'Score: <strong>' + r.topf + '/70</strong> — Estimated FSIQ: <strong>' + r.fsiq + '</strong>.</p>';
      html += '</div></div>';
    }

    // ── Domain Index Summary Table ──
    html += '<div class="card mb-3">';
    html += '<div class="card-header bg-primary text-white py-2"><i class="bi bi-bar-chart me-1"></i> Index Scores &amp; Centiles</div>';
    html += '<div class="card-body p-2">';
    html += '<table class="table table-sm table-hover mb-0 rbans-results-table">';
    html += '<thead><tr><th>Domain</th><th class="text-center">Index</th><th class="text-center">Centile</th>' +
      '<th class="text-center">Classification</th></tr></thead><tbody>';

    var domains = [
      { label: 'Immediate Memory', idx: r.indices.immediateMemory, cent: r.centiles.immediateMemory },
      { label: 'Visuospatial/Constructional', idx: r.indices.visuospatial, cent: r.centiles.visuospatial },
      { label: 'Language', idx: r.indices.language, cent: r.centiles.language },
      { label: 'Attention', idx: r.indices.attention, cent: r.centiles.attention },
      { label: 'Delayed Memory', idx: r.indices.delayedMemory, cent: r.centiles.delayedMemory }
    ];

    for (var i = 0; i < domains.length; i++) {
      var d = domains[i];
      var cls = classifyIndex(d.idx);
      html += '<tr><td><strong>' + d.label + '</strong></td>';
      html += '<td class="text-center"><span class="badge ' + cls.badge + '">' + d.idx + '</span></td>';
      html += '<td class="text-center">' + d.cent + '%</td>';
      html += '<td class="text-center"><small>' + cls.label + '</small></td></tr>';
    }

    // Total row
    var totalCls = classifyIndex(r.indices.totalScale);
    html += '<tr class="table-active"><td><strong>Total Scale</strong></td>';
    html += '<td class="text-center"><span class="badge ' + totalCls.badge + '">' + r.indices.totalScale + '</span></td>';
    html += '<td class="text-center">' + r.centiles.totalScale + '%</td>';
    html += '<td class="text-center"><small>' + totalCls.label + '</small></td></tr>';

    html += '</tbody></table></div></div>';

    // ── Chart ──
    html += '<div class="card mb-3">';
    html += '<div class="card-header bg-primary text-white py-2"><i class="bi bi-graph-up me-1"></i> RBANS Profile</div>';
    html += '<div class="card-body p-2"><div id="rbans-chart-wrap" style="position:relative;width:100%;aspect-ratio:1/2">';
    html += '<canvas id="rbans-chart"></canvas>';
    html += '</div></div></div>';

    // ── Duff Regression Norms ──
    html += '<div class="card mb-3">';
    html += '<div class="card-header py-2" style="background:#fd7e14;color:#fff"><i class="bi bi-graph-down me-1"></i> Duff Demographically-Corrected Norms</div>';
    html += '<div class="card-body p-2">';
    html += '<p class="mb-2" style="font-size:0.82rem">Regression-based norms correcting for age, education, sex, and ethnicity (Duff &amp; Ramezani, 2015).</p>';
    html += '<table class="table table-sm table-hover mb-0 rbans-results-table">';
    html += '<thead><tr><th>Domain</th><th class="text-center">Predicted</th><th class="text-center">Adjusted Index</th>' +
      '<th class="text-center">Centile</th></tr></thead><tbody>';

    var duffRows = [
      { label: 'Immediate Memory', pred: r.duff.immPred, idx: r.duff.immIndex, cent: r.duff.immCentile },
      { label: 'Visuospatial', pred: r.duff.visuoPred, idx: r.duff.visuoIndex, cent: r.duff.visuoCentile },
      { label: 'Language', pred: r.duff.langPred, idx: r.duff.langIndex, cent: r.duff.langCentile },
      { label: 'Attention', pred: r.duff.attPred, idx: r.duff.attIndex, cent: r.duff.attCentile },
      { label: 'Delayed Memory', pred: r.duff.memPred, idx: r.duff.memIndex, cent: r.duff.memCentile },
      { label: 'Total Scale', pred: r.duff.totalPred, idx: r.duff.totalIndex, cent: r.duff.totalCentile }
    ];
    for (var j = 0; j < duffRows.length; j++) {
      var dr = duffRows[j];
      html += '<tr><td>' + dr.label + '</td><td class="text-center">' + dr.pred.toFixed(1) + '</td>';
      html += '<td class="text-center">' + dr.idx + '</td><td class="text-center">' + dr.cent + '%</td></tr>';
    }
    html += '</tbody></table></div></div>';

    // ── Effort Indices ──
    html += '<div class="card mb-3">';
    html += '<div class="card-header py-2" style="background:#6f42c1;color:#fff"><i class="bi bi-shield-check me-1"></i> Effort Indices</div>';
    html += '<div class="card-body p-3">';
    html += '<p class="mb-2"><strong>Silverberg Effort Index:</strong> ' + r.silverbergEI + '</p>';

    // Silverberg table
    html += '<table class="table table-sm table-bordered table-hover mb-3" style="font-size:0.8rem">';
    html += '<thead class="table-light"><tr><th>Cut-off</th><th>MTBI</th><th>Controls</th><th>Clinical Malingerers</th>' +
      '<th>Sim-naive</th><th>Sim-coached</th></tr></thead><tbody>';
    var sData = [
      ['>0', '0.781', '0.964', '0.933', '0.958', '0.857'],
      ['>1', '0.813', '0.964', '0.667', '0.917', '0.750'],
      ['>2', '0.906', '0.964', '0.667', '0.792', '0.500'],
      ['>3', '1.000', '1.000', '0.533', '0.708', '0.464']
    ];
    for (var s = 0; s < sData.length; s++) {
      html += '<tr>';
      for (var c = 0; c < sData[s].length; c++) {
        html += '<td class="text-center">' + sData[s][c] + '</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table>';

    html += '<p class="mb-0"><strong>Novitski Effort Scale:</strong> ' + r.novitskiES + '</p>';
    html += '</div></div>';

    // ── Cortical-Subcortical ──
    html += '<div class="card mb-3">';
    html += '<div class="card-header py-2" style="background:#198754;color:#fff"><i class="bi bi-diagram-3 me-1"></i> Cortical–Subcortical Index</div>';
    html += '<div class="card-body p-3">';
    html += '<p class="mb-1">The cortical–subcortical index (Beatty, 2003) is <strong>' + r.corticalSub.toFixed(1) + '</strong>.</p>';
    html += '<p class="mb-0 text-muted" style="font-size:0.82rem">Scores above 0 predict a cortical pattern; scores below 0 predict a subcortical pattern.</p>';
    html += '</div></div>';

    // ── Domain Narrative Sections ──
    html += renderNarrative(r);

    // ── References ──
    html += '<div class="card mb-3">';
    html += '<div class="card-header bg-secondary text-white py-2"><i class="bi bi-journal me-1"></i> References</div>';
    html += '<div class="card-body p-3" style="font-size:0.78rem">';
    html += '<ol class="mb-0">';
    html += '<li>Duff K, Ramezani A. Regression-Based Normative Formulae for the RBANS for Older Adults. Arch Clin Neuropsychol. 2015;30(7):600-4.</li>';
    html += '<li>Duff K, Patton D, Schoenberg MR, et al. Age- and education-corrected independent normative data for the RBANS. Clin Neuropsychol. 2003;17(3):351-66.</li>';
    html += '<li>Novitski J, et al. The RBANS Effort Scale. Arch Clin Neuropsychol. 2012;27(2):190-5.</li>';
    html += '<li>Silverberg ND, et al. An Effort Index for the RBANS. Clin Neuropsychol. 2007;21(5):841-54.</li>';
    html += '</ol></div></div>';

    el.innerHTML = html;

    // ── Render Chart ──
    renderChart(r);
  }

  // ── Index classification ──
  function classifyIndex(idx) {
    if (idx >= 130) return { label: 'Very Superior', badge: 'bg-primary' };
    if (idx >= 120) return { label: 'Superior', badge: 'bg-primary' };
    if (idx >= 110) return { label: 'High Average', badge: 'bg-success' };
    if (idx >= 90) return { label: 'Average', badge: 'bg-success' };
    if (idx >= 80) return { label: 'Low Average', badge: 'bg-warning text-dark' };
    if (idx >= 70) return { label: 'Borderline', badge: 'bg-warning text-dark' };
    return { label: 'Extremely Low', badge: 'bg-danger' };
  }

  // ── Domain narrative ──
  function renderNarrative(r) {
    var html = '<div class="card mb-3">';
    html += '<div class="card-header bg-dark text-white py-2"><i class="bi bi-chat-text me-1"></i> Domain Narratives</div>';
    html += '<div class="card-body p-3" style="font-size:0.88rem">';
    var raw = r.rawScores;

    html += '<h6 class="text-primary border-bottom pb-1 mb-2">Immediate Memory</h6>';
    html += '<p>You scored ' + raw.listlearning + '/40 on the word list learning task, a sensitive indicator of verbal learning. ';
    html += 'You scored ' + raw.storylearning + '/24 on the short story learning task. ';
    html += 'This gives an Immediate Memory Index of <strong>' + r.indices.immediateMemory + '</strong> (' + r.centiles.immediateMemory + 'th centile).</p>';

    html += '<h6 class="text-primary border-bottom pb-1 mb-2">Visuospatial Function</h6>';
    html += '<p>You scored ' + raw.lineorientation + '/20 on line orientation (visual perceptual ability) and ';
    html += raw.figurecopy + '/20 on figure copy (visual working memory and motor skill). ';
    html += 'This gives a Visuospatial/Constructional Index of <strong>' + r.indices.visuospatial + '</strong> (' + r.centiles.visuospatial + 'th centile).</p>';

    html += '<h6 class="text-primary border-bottom pb-1 mb-2">Language</h6>';
    html += '<p>You scored ' + raw.naming + '/10 on naming (word recall) and ';
    html += raw.semanticfluency + '/40 on semantic fluency (attention, executive function, and memory). ';
    html += 'This gives a Language Index of <strong>' + r.indices.language + '</strong> (' + r.centiles.language + 'th centile).</p>';

    html += '<h6 class="text-primary border-bottom pb-1 mb-2">Attention &amp; Concentration</h6>';
    html += '<p>You scored ' + raw.digitspan + '/16 on digit span (attention and working memory) and ';
    html += raw.coding + '/89 on digit-symbol coding (attention and processing speed). ';
    html += 'This gives an Attention Index of <strong>' + r.indices.attention + '</strong> (' + r.centiles.attention + 'th centile).</p>';

    html += '<h6 class="text-primary border-bottom pb-1 mb-2">Delayed Memory</h6>';
    html += '<p>You recalled ' + raw.listrecall + '/10 words (free recall), ' + raw.listrecog + '/20 on cued recognition, ';
    html += raw.storyrecall + '/12 story items, and ' + raw.figurerecall + '/20 on the complex figure. ';
    html += 'This gives a Delayed Memory Index of <strong>' + r.indices.delayedMemory + '</strong> (' + r.centiles.delayedMemory + 'th centile).</p>';

    html += '<h6 class="text-primary border-bottom pb-1 mb-2">Overall</h6>';
    html += '<p>The Total Scale score is <strong>' + r.indices.totalScale + '</strong> (' + r.centiles.totalScale + 'th centile). ';
    html += r.centiles.totalScale + '% of healthy people in your age group scored lower overall.</p>';

    html += '</div></div>';
    return html;
  }

  // ═══════════════════════════════════════════
  //  CHART (Chart.js)
  // ═══════════════════════════════════════════
  function renderChart(r) {
    var canvas = document.getElementById('rbans-chart');
    if (!canvas) return;

    // Destroy previous chart if exists
    if (_chart) { _chart.destroy(); _chart = null; }

    var labels = ['Immediate\nMemory', 'Visuospatial', 'Language', 'Attention', 'Delayed\nMemory'];
    var stdData = [r.indices.immediateMemory, r.indices.visuospatial, r.indices.language, r.indices.attention, r.indices.delayedMemory];
    var duffData = [parseFloat(r.duff.immIndex), parseFloat(r.duff.visuoIndex), parseFloat(r.duff.langIndex),
      parseFloat(r.duff.attIndex), parseFloat(r.duff.memIndex)];

    _chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Standard Norms',
            data: stdData,
            borderColor: 'rgb(17, 157, 255)',
            backgroundColor: 'rgba(17, 157, 255, 0.1)',
            borderWidth: 2.5,
            pointRadius: 6,
            pointBackgroundColor: 'rgb(17, 157, 255)',
            tension: 0.1
          },
          {
            label: 'Duff Adjusted',
            data: duffData,
            borderColor: 'rgb(255, 102, 0)',
            backgroundColor: 'rgba(255, 102, 0, 0.1)',
            borderWidth: 2.5,
            borderDash: [6, 3],
            pointRadius: 6,
            pointBackgroundColor: 'rgb(255, 102, 0)',
            pointStyle: 'rectRot',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'RBANS Index Profile',
            font: { size: 14, weight: 'bold' }
          },
          legend: {
            position: 'bottom'
          },
          annotation: undefined // no plugin needed
        },
        scales: {
          y: {
            min: 40,
            max: 160,
            ticks: {
              stepSize: 10,
              callback: function (val) {
                // Show percentile on the right
                return val;
              }
            },
            title: {
              display: true,
              text: 'Index Score'
            }
          }
        }
      },
      plugins: [{
        id: 'rbans-bands',
        beforeDraw: function (chart) {
          var ctx = chart.ctx;
          var yScale = chart.scales.y;
          var area = chart.chartArea;

          // Severity bands
          var bands = [
            { lo: 40, hi: 55, color: 'rgba(255,77,77,0.10)' },    // Extremely Low
            { lo: 55, hi: 70, color: 'rgba(255,165,0,0.10)' },    // Borderline
            { lo: 70, hi: 85, color: 'rgba(255,255,0,0.08)' },    // Low Average
            { lo: 85, hi: 115, color: 'rgba(204,255,204,0.12)' },  // Average
            { lo: 115, hi: 130, color: 'rgba(153,255,153,0.10)' }, // High Average+
            { lo: 130, hi: 160, color: 'rgba(77,255,77,0.10)' }   // Superior+
          ];

          ctx.save();
          for (var b = 0; b < bands.length; b++) {
            var top = yScale.getPixelForValue(bands[b].hi);
            var bottom = yScale.getPixelForValue(bands[b].lo);
            ctx.fillStyle = bands[b].color;
            ctx.fillRect(area.left, top, area.right - area.left, bottom - top);
          }

          // Mean line
          var meanY = yScale.getPixelForValue(100);
          ctx.strokeStyle = 'rgba(0,0,0,0.2)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(area.left, meanY);
          ctx.lineTo(area.right, meanY);
          ctx.stroke();
          ctx.restore();
        }
      }]
    });
  }

  return {
    render: render,
    calculate: calculate
  };
})();
