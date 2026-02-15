/* DIAMOND Lewy — Assessment Toolkit for Dementia with Lewy Bodies
   Based on: Thomas et al. Int J Geriatr Psychiatry 2018;33:1293-1304
   Aligned with McKeith et al. 4th DLB Consensus Criteria (Neurology 2017)
   ======================================================================= */
var BHM = window.BHM || {};
BHM.Instruments = BHM.Instruments || {};

BHM.Instruments.DiamondLewy = (function () {
  'use strict';

  var SP = 'instruments.diamondLewy';
  var S = BHM.State;

  /* ═══════════════════════════════════════
     DATA DEFINITIONS
     ═══════════════════════════════════════ */

  /* Section 2A: Cognitive Fluctuation — DCFS items */
  var DCFS_ITEMS = [
    { key: 'dcfs_drowsy', text: 'Does the patient have drowsiness or lethargy during the daytime, despite getting enough sleep the night before?' },
    { key: 'dcfs_sleep2h', text: 'Does the patient sleep for more than 2 hours during the daytime?' },
    { key: 'dcfs_disorg', text: 'Does the patient have episodes where their thinking seems quite disorganised or illogical?' },
    { key: 'dcfs_stare', text: 'Does the patient stare into space for long periods?' }
  ];
  var DCFS_OPTIONS = ['Usually (>3 days/week)', 'Sometimes (1\u20133 days/week)', 'Rarely (<1 day/week)', 'Never'];

  /* Section 2D: Parkinsonism — UPDRS motor items */
  var MOTOR_ITEMS = [
    { key: 'motor_expression', text: 'Facial expression (hypomimia / masked face)' },
    { key: 'motor_tremor', text: 'Rest tremor (hands / arms)' },
    { key: 'motor_rigidity', text: 'Rigidity (limbs / neck)' },
    { key: 'motor_bradykinesia', text: 'Bradykinesia (finger tapping / hand movements)' },
    { key: 'motor_gait', text: 'Gait / postural stability' }
  ];
  var MOTOR_SCORES = ['0 \u2013 Normal', '1 \u2013 Slight', '2 \u2013 Mild', '3 \u2013 Moderate', '4 \u2013 Severe'];

  /* Section 3: Indicative Biomarkers */
  var BIOMARKERS = [
    { key: 'bio_dat', text: 'Reduced dopamine transporter uptake in basal ganglia (DaT-SPECT / PET)' },
    { key: 'bio_mibg', text: 'Abnormal \u00b9\u00b2\u00b3I-MIBG myocardial scintigraphy (low uptake)' },
    { key: 'bio_psg', text: 'Polysomnographic confirmation of REM sleep without atonia' }
  ];

  /* Section 4: Supportive Clinical Features */
  var SUPPORTIVE = [
    { key: 'sup_neuroleptic', text: 'Severe sensitivity to antipsychotic agents' },
    { key: 'sup_instability', text: 'Postural instability' },
    { key: 'sup_falls', text: 'Repeated falls' },
    { key: 'sup_syncope', text: 'Syncope or other transient episodes of unresponsiveness' },
    { key: 'sup_autonomic', text: 'Severe autonomic dysfunction (e.g., constipation, orthostatic hypotension, urinary incontinence)' },
    { key: 'sup_hypersomnia', text: 'Hypersomnia' },
    { key: 'sup_hyposmia', text: 'Hyposmia (reduced sense of smell)' },
    { key: 'sup_other_halluc', text: 'Hallucinations in other modalities (auditory, tactile, etc.)' },
    { key: 'sup_delusions', text: 'Systematised delusions' },
    { key: 'sup_apathy', text: 'Apathy' },
    { key: 'sup_anxiety', text: 'Anxiety' },
    { key: 'sup_depression', text: 'Depression' }
  ];

  /* ═══════════════════════════════════════
     RENDER
     ═══════════════════════════════════════ */
  function render(container) {
    container.innerHTML = '';
    var card = document.createElement('div');
    card.className = 'instrument-card';
    card.innerHTML =
      '<h5>DIAMOND Lewy \u2014 Assessment Toolkit for Dementia with Lewy Bodies</h5>' +
      '<p class="instrument-subtitle">Based on the revised DIAMOND Lewy toolkit (Thomas et al., <em>Int J Geriatr Psychiatry</em> 2018) aligned with the 4th DLB Consensus Criteria (McKeith et al., 2017).</p>';

    // ═══ SECTION 1: Essential Criterion ═══
    card.appendChild(dlSection('Section 1: Essential Criterion'));
    card.appendChild(dlSubLabel('Is there progressive cognitive decline of sufficient magnitude to interfere with normal social or occupational functioning?'));
    card.appendChild(dlTable(['Criterion', 'Yes', 'No', 'Uncertain'], [
      ['Progressive cognitive decline (dementia)', 'essential_dementia']
    ]));
    card.appendChild(dlNoteRow('essential_notes', 'Clinical notes (onset, pattern, domains affected):'));

    // ═══ SECTION 2: Core Clinical Features ═══
    card.appendChild(dlSection('Section 2: Core Clinical Features'));
    card.appendChild(dlSubLabel('The presence of two or more core features = probable DLB; one core feature = possible DLB.'));

    // 2A: Fluctuating Cognition
    card.appendChild(dlSection2('2A. Fluctuating Cognition'));
    card.appendChild(dlSubLabel('Dementia Cognitive Fluctuation Scale (DCFS) \u2014 Ask the carer:'));
    card.appendChild(dlTable(
      ['Question (ask carer)', 'Usually (>3d/wk)', 'Sometimes (1\u20133d/wk)', 'Rarely (<1d/wk)', 'Never'],
      DCFS_ITEMS.map(function (item) { return [item.text, item.key]; })
    ));
    card.appendChild(dlTable(['Clinician\u2019s overall assessment: Is fluctuating cognition present?', 'Yes', 'No', 'Uncertain'], [
      ['Fluctuating cognition with pronounced variations in attention and alertness', 'core_fluctuation']
    ]));

    // 2B: REM Sleep Behaviour Disorder
    card.appendChild(dlSection2('2B. REM Sleep Behaviour Disorder (RBD)'));
    card.appendChild(dlSubLabel('Mayo Sleep Questionnaire \u2014 Ask the carer:'));
    card.appendChild(dlTable(['Question (ask carer)', 'Yes', 'No', "Don't Know"], [
      ['Have you ever seen the patient appear to \u201cact out their dreams\u201d while sleeping? (e.g., punching, flailing arms in the air, shouting, screaming)', 'rbd_screen']
    ]));
    card.appendChild(dlTable(['If yes, was the behaviour:', 'Yes', 'No', "Don't Know"], [
      ['Potentially harmful or disruptive to the patient or bed partner?', 'rbd_harmful'],
      ['Occurring on more than one occasion?', 'rbd_recurrent']
    ]));
    card.appendChild(dlTable(['Clinician\u2019s overall assessment: Is RBD present?', 'Yes', 'No', 'Uncertain'], [
      ['REM sleep behaviour disorder', 'core_rbd']
    ]));

    // 2C: Visual Hallucinations
    card.appendChild(dlSection2('2C. Visual Hallucinations'));
    card.appendChild(dlSubLabel('North East Visual Hallucinations Inventory (NEVHI) \u2014 Ask the patient:'));
    card.appendChild(dlTable(['Question (ask patient)', 'Yes', 'No'], [
      ['Do you ever see things that other people cannot see?', 'vh_patient_sees'],
      ['If yes: Are they well-formed images (people, animals, objects)?', 'vh_patient_formed']
    ]));
    card.appendChild(dlNoteRow('vh_patient_describe', 'Patient\u2019s description of what they see:'));
    card.appendChild(dlSubLabel('Ask the carer:'));
    card.appendChild(dlTable(['Question (ask carer)', 'Yes', 'No'], [
      ['Does the patient appear to see things that are not there?', 'vh_carer_sees'],
      ['If yes: Does the patient describe seeing formed images such as people, animals, or objects?', 'vh_carer_formed']
    ]));
    card.appendChild(dlTable(['Clinician\u2019s overall assessment: Are visual hallucinations present?', 'Yes', 'No', 'Uncertain'], [
      ['Recurrent complex visual hallucinations (typically well-formed and detailed)', 'core_hallucinations']
    ]));

    // 2D: Parkinsonism
    card.appendChild(dlSection2('2D. Parkinsonism'));
    card.appendChild(dlSubLabel('Motor assessment (UPDRS items) \u2014 At least one cardinal feature (bradykinesia, rest tremor, or rigidity) required:'));
    card.appendChild(dlTable(
      ['Motor Item', '0\u2013Normal', '1\u2013Slight', '2\u2013Mild', '3\u2013Moderate', '4\u2013Severe'],
      MOTOR_ITEMS.map(function (item) { return [item.text, item.key]; })
    ));
    card.appendChild(dlTable(['Clinician\u2019s overall assessment: Is spontaneous parkinsonism present?', 'Yes', 'No', 'Uncertain'], [
      ['One or more spontaneous cardinal features of parkinsonism (not drug-induced)', 'core_parkinsonism']
    ]));

    // ═══ SECTION 3: Indicative Biomarkers ═══
    card.appendChild(dlSection('Section 3: Indicative Biomarkers'));
    card.appendChild(dlSubLabel('One or more indicative biomarkers + one core feature = probable DLB. Biomarker(s) alone (no core feature) = possible DLB.'));
    card.appendChild(dlTable(['Biomarker', 'Present', 'Absent', 'Not Done'], BIOMARKERS.map(function (b) { return [b.text, b.key]; })));

    // ═══ SECTION 4: Supportive Clinical Features ═══
    card.appendChild(dlSection('Section 4: Supportive Clinical Features'));
    card.appendChild(dlSubLabel('These features support a DLB diagnosis but do not contribute to the diagnostic classification algorithm.'));
    card.appendChild(dlTable(['Feature', 'Present', 'Absent', 'Uncertain'], SUPPORTIVE.map(function (s) { return [s.text, s.key]; })));
    card.appendChild(dlNoteRow('supportive_notes', 'Additional supportive feature notes:'));

    // ═══ DIAGNOSTIC SUMMARY (auto-calculated) ═══
    card.appendChild(dlSection('Diagnostic Summary'));
    var sumDiv = document.createElement('div');
    sumDiv.id = 'dl-summary-div';
    sumDiv.className = 'card';
    sumDiv.innerHTML =
      '<div class="card-body">' +
        '<div class="row text-center mb-3" id="dl-core-summary">' +
          '<div class="col-3"><div class="border rounded p-2"><div class="small text-muted">Fluctuation</div><div id="dl-s-fluct" class="fw-bold">\u2014</div></div></div>' +
          '<div class="col-3"><div class="border rounded p-2"><div class="small text-muted">RBD</div><div id="dl-s-rbd" class="fw-bold">\u2014</div></div></div>' +
          '<div class="col-3"><div class="border rounded p-2"><div class="small text-muted">Hallucinations</div><div id="dl-s-vh" class="fw-bold">\u2014</div></div></div>' +
          '<div class="col-3"><div class="border rounded p-2"><div class="small text-muted">Parkinsonism</div><div id="dl-s-park" class="fw-bold">\u2014</div></div></div>' +
        '</div>' +
        '<div class="row text-center mb-3">' +
          '<div class="col-4"><div class="border rounded p-2"><div class="small text-muted">Core Features Present</div><div id="dl-core-count" class="fw-bold fs-4">\u2014</div></div></div>' +
          '<div class="col-4"><div class="border rounded p-2"><div class="small text-muted">Indicative Biomarkers</div><div id="dl-bio-count" class="fw-bold fs-4">\u2014</div></div></div>' +
          '<div class="col-4"><div class="border rounded p-2"><div class="small text-muted">Supportive Features</div><div id="dl-sup-count" class="fw-bold fs-4">\u2014</div></div></div>' +
        '</div>' +
        '<div class="alert mb-0 text-center fs-5" id="dl-diagnosis-alert">' +
          '<span id="dl-diagnosis-text">Complete the assessment above to generate a diagnostic classification.</span>' +
        '</div>' +
      '</div>';
    card.appendChild(sumDiv);

    container.appendChild(card);

    // Bind events and restore
    bindAllButtons(card);
    recalc();
  }

  /* ═══════════════════════════════════════
     TABLE BUILDER (same tabular style as CDR)
     ═══════════════════════════════════════ */
  function dlTable(headers, rows) {
    var wrap = document.createElement('div');
    wrap.className = 'table-responsive';
    var table = document.createElement('table');
    table.className = 'cdr-worksheet-table';
    var thead = document.createElement('thead');
    var htr = document.createElement('tr');
    for (var h = 0; h < headers.length; h++) {
      var th = document.createElement('th');
      th.textContent = headers[h];
      htr.appendChild(th);
    }
    thead.appendChild(htr);
    table.appendChild(thead);
    var tbody = document.createElement('tbody');
    var optCount = headers.length - 1;
    for (var r = 0; r < rows.length; r++) {
      var tr = document.createElement('tr');
      var tdQ = document.createElement('td');
      tdQ.textContent = rows[r][0];
      tr.appendChild(tdQ);
      var key = rows[r][1];
      for (var o = 0; o < optCount; o++) {
        var tdO = document.createElement('td');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cdr-ws-btn';
        btn.textContent = '\u25CB';
        var val = headers[o + 1].toLowerCase();
        btn.setAttribute('data-key', key);
        btn.setAttribute('data-val', val);
        var cur = S.get(SP + '.' + key);
        if (cur === val) { btn.classList.add('active'); btn.textContent = '\u25CF'; }
        tdO.appendChild(btn);
        tr.appendChild(tdO);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  /* ═══════════════════════════════════════
     UI HELPERS
     ═══════════════════════════════════════ */
  function dlSection(title) {
    var div = document.createElement('div');
    div.className = 'cdr-ws-section';
    div.innerHTML = '<h6><i class="bi bi-check2-square me-1"></i>' + title + '</h6>';
    return div;
  }
  function dlSection2(title) {
    var div = document.createElement('div');
    div.className = 'mt-3 mb-1';
    div.innerHTML = '<strong class="text-secondary" style="font-size:0.9rem"><i class="bi bi-arrow-return-right me-1"></i>' + title + '</strong>';
    return div;
  }
  function dlSubLabel(text) {
    var div = document.createElement('div');
    div.className = 'cdr-ws-subsection mb-1';
    div.textContent = text;
    return div;
  }
  function dlNoteRow(key, label) {
    var div = document.createElement('div');
    div.className = 'mb-2';
    var lbl = document.createElement('div');
    lbl.className = 'cdr-ws-subsection mb-1';
    lbl.textContent = label;
    div.appendChild(lbl);
    var ta = document.createElement('textarea');
    ta.className = 'form-control form-control-sm';
    ta.rows = 2;
    ta.style.fontSize = '0.82rem';
    var cur = S.get(SP + '.' + key);
    if (cur) ta.value = cur;
    ta.setAttribute('data-key', key);
    ta.addEventListener('input', function () { S.set(SP + '.' + this.getAttribute('data-key'), this.value); });
    div.appendChild(ta);
    return div;
  }

  /* ═══════════════════════════════════════
     EVENT HANDLING
     ═══════════════════════════════════════ */
  function bindAllButtons(root) {
    root.addEventListener('click', function (e) {
      var btn = e.target.closest('.cdr-ws-btn');
      if (!btn) return;
      var key = btn.getAttribute('data-key');
      var val = btn.getAttribute('data-val');
      var row = btn.closest('tr');
      var btns = row.querySelectorAll('.cdr-ws-btn');
      for (var i = 0; i < btns.length; i++) { btns[i].classList.remove('active'); btns[i].textContent = '\u25CB'; }
      btn.classList.add('active');
      btn.textContent = '\u25CF';
      S.set(SP + '.' + key, val);
      recalc();
    });
  }

  /* ═══════════════════════════════════════
     SCORING / DIAGNOSTIC ALGORITHM
     ═══════════════════════════════════════ */
  function recalc() {
    var coreKeys = ['core_fluctuation', 'core_rbd', 'core_hallucinations', 'core_parkinsonism'];
    var coreLabels = ['Fluctuation', 'RBD', 'Hallucinations', 'Parkinsonism'];
    var coreIds = ['dl-s-fluct', 'dl-s-rbd', 'dl-s-vh', 'dl-s-park'];
    var coreCount = 0;
    var coreAnswered = 0;

    for (var c = 0; c < coreKeys.length; c++) {
      var val = S.get(SP + '.' + coreKeys[c]);
      var el = document.getElementById(coreIds[c]);
      if (el) {
        if (val === 'yes') { el.textContent = 'Yes'; el.className = 'fw-bold text-success'; coreCount++; coreAnswered++; }
        else if (val === 'no') { el.textContent = 'No'; el.className = 'fw-bold text-muted'; coreAnswered++; }
        else if (val === 'uncertain') { el.textContent = '?'; el.className = 'fw-bold text-warning'; coreAnswered++; }
        else { el.textContent = '\u2014'; el.className = 'fw-bold'; }
      }
    }

    var bioCount = 0, bioAnswered = 0;
    for (var b = 0; b < BIOMARKERS.length; b++) {
      var bVal = S.get(SP + '.' + BIOMARKERS[b].key);
      if (bVal === 'present') { bioCount++; bioAnswered++; }
      else if (bVal === 'absent' || bVal === 'not done') { bioAnswered++; }
    }

    var supCount = 0;
    for (var s = 0; s < SUPPORTIVE.length; s++) {
      var sVal = S.get(SP + '.' + SUPPORTIVE[s].key);
      if (sVal === 'present') supCount++;
    }

    updateText('dl-core-count', coreCount);
    updateText('dl-bio-count', bioCount);
    updateText('dl-sup-count', supCount);

    // Diagnostic classification
    var essential = S.get(SP + '.essential_dementia');
    var diagEl = document.getElementById('dl-diagnosis-alert');
    var diagText = document.getElementById('dl-diagnosis-text');
    var diagnosis = 'incomplete';

    if (essential === 'yes' && coreAnswered >= 4) {
      if (coreCount >= 2) {
        diagnosis = 'probable';
      } else if (coreCount === 1 && bioCount >= 1) {
        diagnosis = 'probable';
      } else if (coreCount === 1 && bioCount === 0) {
        diagnosis = 'possible';
      } else if (coreCount === 0 && bioCount >= 1) {
        diagnosis = 'possible';
      } else {
        diagnosis = 'not_met';
      }
    } else if (essential === 'no') {
      diagnosis = 'no_dementia';
    }

    if (diagEl && diagText) {
      switch (diagnosis) {
        case 'probable':
          diagEl.className = 'alert alert-success mb-0 text-center fs-5';
          diagText.innerHTML = '<strong>Probable DLB</strong> \u2014 ' +
            (coreCount >= 2 ? coreCount + ' core features present' : '1 core feature + ' + bioCount + ' indicative biomarker(s)') +
            (supCount > 0 ? ' | ' + supCount + ' supportive feature(s)' : '');
          break;
        case 'possible':
          diagEl.className = 'alert alert-warning mb-0 text-center fs-5';
          diagText.innerHTML = '<strong>Possible DLB</strong> \u2014 ' +
            (coreCount === 1 ? '1 core feature (no indicative biomarkers)' : bioCount + ' indicative biomarker(s) (no core features)') +
            (supCount > 0 ? ' | ' + supCount + ' supportive feature(s)' : '');
          break;
        case 'not_met':
          diagEl.className = 'alert alert-secondary mb-0 text-center fs-5';
          diagText.innerHTML = '<strong>DLB criteria not met</strong> \u2014 Dementia present but no core features or indicative biomarkers identified';
          break;
        case 'no_dementia':
          diagEl.className = 'alert alert-secondary mb-0 text-center fs-5';
          diagText.innerHTML = '<strong>Essential criterion not met</strong> \u2014 Progressive cognitive decline (dementia) not established';
          break;
        default:
          diagEl.className = 'alert alert-info mb-0 text-center fs-5';
          diagText.textContent = 'Complete the assessment above to generate a diagnostic classification.';
      }
    }

    // Build supportive features list
    var supList = [];
    for (var sl = 0; sl < SUPPORTIVE.length; sl++) {
      if (S.get(SP + '.' + SUPPORTIVE[sl].key) === 'present') supList.push(SUPPORTIVE[sl].text);
    }

    // Build core features list
    var corePresent = [];
    for (var cl = 0; cl < coreKeys.length; cl++) {
      if (S.get(SP + '.' + coreKeys[cl]) === 'yes') corePresent.push(coreLabels[cl]);
    }

    // Save to scores
    S.setScore('diamondLewy', {
      diagnosis: diagnosis,
      coreCount: coreCount,
      biomarkerCount: bioCount,
      supportiveCount: supCount,
      corePresent: corePresent,
      supportivePresent: supList,
      essential: essential || null
    });

    if (BHM.Scoring && BHM.Scoring.triggerReport) BHM.Scoring.triggerReport();
    else if (BHM.Report && BHM.Report.update) BHM.Report.update();
  }

  function updateText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  return {
    render: render,
    recalc: recalc
  };
})();
