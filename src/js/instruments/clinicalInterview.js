/* ═══════════════════════════════════════════════════════
   BHM.Instruments.ClinicalInterview
   Semi-Structured Clinical Interview — exact layout from
   Semistructured_Clinical_Interview_BHM_formatted_v3.docx
   Sections A-I
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};
BHM.Instruments = BHM.Instruments || {};

BHM.Instruments.ClinicalInterview = (function () {
  'use strict';

  var SP = 'instruments.clinical';
  var F = BHM.ClickableGrid;

  // ── Section A: New learning / memory ──
  var MEM_ITEMS = [
    { key: 'memA1', label: 'Rapid forgetfulness (new information)' },
    { key: 'memA2', label: 'Repetitive questioning' },
    { key: 'memA3', label: 'Misplacing objects' },
    { key: 'memA4', label: 'Forgetting appointments' },
    { key: 'memA5', label: 'Increased reliance on lists/calendars' },
    { key: 'memA6', label: 'Losing things around the house' }
  ];

  // ── Section B: Word-finding / language ──
  var LANG_ITEMS = [
    { key: 'langB1', label: 'Tip-of-the-tongue episodes' },
    { key: 'langB2', label: 'Pauses / hesitations in speech' },
    { key: 'langB3', label: 'Uses the wrong word (semantic errors)' },
    { key: 'langB4', label: 'Circumlocution (talking around a word)' },
    { key: 'langB5', label: 'Difficulty following complex conversation' },
    { key: 'langB6', label: 'Reduced reading comprehension' }
  ];

  // ── Section C: Wayfinding / visuospatial ──
  var VIS_ITEMS = [
    { key: 'visC1', label: 'Gets lost while driving somewhere familiar' },
    { key: 'visC2', label: 'Gets lost while driving somewhere unfamiliar' },
    { key: 'visC3', label: 'Gets lost while walking somewhere familiar' },
    { key: 'visC4', label: 'Gets lost while walking somewhere unfamiliar' },
    { key: 'visC5', label: 'Difficulty with maps / satnav / route planning' }
  ];

  var YN_COLS = ['Yes', 'No'];
  var YN_VALS = ['yes', 'no'];
  var FREQ_COLS = ['Daily', 'Weekly', 'Monthly', 'Occasional'];
  var FREQ_VALS = ['daily', 'weekly', 'monthly', 'occasional'];

  // ── Section F: Premorbid personality traits ──
  var PERSONALITY_ITEMS = [
    { key: 'persSocAnx',   label: 'Social anxiety' },
    { key: 'persInhib',    label: 'Inhibition/withdrawal' },
    { key: 'persPersist',  label: 'Persistence/perfectionism' },
    { key: 'persImpuls',   label: 'Impulsivity/risk-taking' },
    { key: 'persEmpathy',  label: 'Baseline empathy' }
  ];

  function render(container) {
    container.innerHTML = '';
    var card = document.createElement('div');
    card.className = 'instrument-card';

    card.innerHTML =
      '<h5>Semi-Structured Clinical Interview</h5>' +
      '<p class="instrument-subtitle">Brain Health Manchester — Clinician-completed interview covering cognitive symptoms, personal history, and background context.</p>';

    // ══════════════════════════════════════
    // A. NEW LEARNING / MEMORY
    // ══════════════════════════════════════
    var secA = section('A. New Learning / Memory', 'bi-brain');
    secA.appendChild(subLabel('Tick where present. For frequency, tick one option.'));
    secA.appendChild(cogTable('mem', MEM_ITEMS));
    secA.appendChild(F.createField({ label: 'Examples / impact (optional)', statePath: SP + '.memoryNotes', type: 'textarea', rows: 2, placeholder: '' }));
    card.appendChild(secA);

    // ══════════════════════════════════════
    // B. WORD-FINDING / LANGUAGE
    // ══════════════════════════════════════
    var secB = section('B. Word-finding / Language', 'bi-chat-dots');
    secB.appendChild(cogTable('lang', LANG_ITEMS));
    var bExtras = row(3);
    bExtras.appendChild(wrapCol(F.createField({ label: 'Primary language', statePath: SP + '.primaryLanguage', placeholder: '' }), 'col-md-4'));
    bExtras.appendChild(wrapCol(F.createField({ label: 'Other languages', statePath: SP + '.otherLanguages', placeholder: '' }), 'col-md-4'));
    bExtras.appendChild(wrapCol(F.createField({ label: 'Any longstanding speech/language difficulty?', statePath: SP + '.langDifficulty', type: 'select', options: ['', 'No', 'Yes — dyslexia', 'Yes — ADHD', 'Yes — other'] }), 'col-md-4'));
    secB.appendChild(bExtras);
    var bExtras2 = row(2);
    bExtras2.appendChild(wrapCol(F.createField({ label: 'Hearing impairment?', statePath: SP + '.hearingImpairment', type: 'select', options: ['', 'No', 'Yes', 'Yes — with aids'] }), 'col-md-6'));
    bExtras2.appendChild(wrapCol(F.createField({ label: 'Details', statePath: SP + '.hearingDetails', placeholder: '' }), 'col-md-6'));
    secB.appendChild(bExtras2);
    secB.appendChild(F.createField({ label: 'Examples / Notes', statePath: SP + '.languageNotes', type: 'textarea', rows: 2 }));
    card.appendChild(secB);

    // ══════════════════════════════════════
    // C. WAYFINDING / VISUOSPATIAL
    // ══════════════════════════════════════
    var secC = section('C. Wayfinding / Visuospatial', 'bi-geo-alt');
    secC.appendChild(visTable());
    secC.appendChild(F.createField({ label: 'Examples (where/when, consequences)', statePath: SP + '.visuospatialNotes', type: 'textarea', rows: 2 }));
    card.appendChild(secC);

    // ══════════════════════════════════════
    // D. PERSONAL HISTORY (brief)
    // ══════════════════════════════════════
    var secD = section('D. Personal History (brief)', 'bi-person-lines-fill');
    var d1 = row(3);
    d1.appendChild(wrapCol(F.createField({ label: 'Place of birth', statePath: SP + '.birthPlace', placeholder: '' }), 'col-md-4'));
    d1.appendChild(wrapCol(F.createField({ label: 'Current living situation', statePath: SP + '.livingSituation', placeholder: 'e.g. Lives alone, with spouse' }), 'col-md-4'));
    d1.appendChild(wrapCol(F.createField({ label: 'Siblings (number/order)', statePath: SP + '.siblings', placeholder: '' }), 'col-md-4'));
    secD.appendChild(d1);
    var d2 = row(3);
    d2.appendChild(wrapCol(F.createField({ label: 'Significant migration history', statePath: SP + '.migration', type: 'select', options: ['', 'No', 'Yes'] }), 'col-md-4'));
    d2.appendChild(wrapCol(F.createField({ label: 'Migration details (if yes)', statePath: SP + '.migrationDetails', placeholder: '' }), 'col-md-4'));
    d2.appendChild(wrapCol(F.createField({ label: 'Father/primary carer occupation', statePath: SP + '.parentOccupation', placeholder: '' }), 'col-md-4'));
    secD.appendChild(d2);
    var d3 = row(3);
    d3.appendChild(wrapCol(F.createField({ label: 'Discipline at home', statePath: SP + '.discipline', type: 'select', options: ['', 'None', 'Typical', 'Harsh/strict', 'Other'] }), 'col-md-4'));
    d3.appendChild(wrapCol(F.createField({ label: 'History of abuse/trauma', statePath: SP + '.trauma', type: 'select', options: ['', 'No', 'Yes'] }), 'col-md-4'));
    d3.appendChild(wrapCol(F.createField({ label: 'Trauma details (if disclosed)', statePath: SP + '.traumaDetails', placeholder: 'Type/age' }), 'col-md-4'));
    secD.appendChild(d3);
    var d4 = row(3);
    d4.appendChild(wrapCol(F.createField({ label: 'Military service', statePath: SP + '.military', type: 'select', options: ['', 'No', 'Yes'] }), 'col-md-4'));
    d4.appendChild(wrapCol(F.createField({ label: 'Relationships / marriages', statePath: SP + '.relationships', placeholder: '' }), 'col-md-4'));
    d4.appendChild(wrapCol(F.createField({ label: 'Children', statePath: SP + '.children', placeholder: '' }), 'col-md-4'));
    secD.appendChild(d4);
    secD.appendChild(F.createField({ label: 'Key cultural/religious factors (if relevant)', statePath: SP + '.culturalFactors', placeholder: '' }));
    secD.appendChild(F.createField({ label: 'Other key life events', statePath: SP + '.otherLifeEvents', type: 'textarea', rows: 2, placeholder: '' }));
    card.appendChild(secD);

    // ══════════════════════════════════════
    // E. HEAD INJURY
    // ══════════════════════════════════════
    var secE = section('E. Head Injury', 'bi-bandaid');
    var e1 = row(3);
    e1.appendChild(wrapCol(F.createField({ label: 'Any head injury?', statePath: SP + '.headInjury', type: 'select', options: ['', 'No', 'Yes'] }), 'col-md-4'));
    e1.appendChild(wrapCol(F.createField({ label: 'Contact sports history?', statePath: SP + '.contactSports', type: 'select', options: ['', 'No', 'Yes'] }), 'col-md-4'));
    e1.appendChild(wrapCol(F.createField({ label: 'Sport / years', statePath: SP + '.contactSportsDetails', placeholder: '' }), 'col-md-4'));
    secE.appendChild(e1);
    secE.appendChild(subLabel('Most significant injury (if any)'));
    var e2 = row(3);
    e2.appendChild(wrapCol(F.createField({ label: 'Date/age', statePath: SP + '.headInjuryDate', placeholder: '' }), 'col-md-4'));
    e2.appendChild(wrapCol(F.createField({ label: 'Mechanism', statePath: SP + '.headInjuryMech', placeholder: 'e.g. Fall, RTA' }), 'col-md-4'));
    e2.appendChild(wrapCol(F.createField({ label: 'Loss of consciousness', statePath: SP + '.headInjuryLOC', type: 'select', options: ['', 'No', 'Yes — <1 min', 'Yes — 1-30 min', 'Yes — >30 min'] }), 'col-md-4'));
    secE.appendChild(e2);
    var e3 = row(3);
    e3.appendChild(wrapCol(F.createField({ label: 'Post-traumatic amnesia', statePath: SP + '.headInjuryPTA', type: 'select', options: ['', 'No', 'Yes — <1 hr', 'Yes — 1-24 hr', 'Yes — >24 hr'] }), 'col-md-4'));
    e3.appendChild(wrapCol(F.createField({ label: 'Repeated concussions', statePath: SP + '.repeatedConcussions', type: 'select', options: ['', 'No', 'Yes'] }), 'col-md-4'));
    e3.appendChild(wrapCol(F.createField({ label: 'Approx. number', statePath: SP + '.concussionCount', type: 'number', min: 0 }), 'col-md-4'));
    secE.appendChild(e3);
    secE.appendChild(F.createField({ label: 'Ongoing symptoms attributed to head injury', statePath: SP + '.headInjuryOngoing', type: 'textarea', rows: 2, placeholder: '' }));
    var e4 = row(1);
    e4.appendChild(wrapCol(F.createField({ label: 'Anticoagulants/bleed risk at time?', statePath: SP + '.anticoagulants', type: 'select', options: ['', 'No', 'Yes', 'Unknown'] }), 'col-md-4'));
    secE.appendChild(e4);
    card.appendChild(secE);

    // ══════════════════════════════════════
    // F. PREMORBID PERSONALITY
    // ══════════════════════════════════════
    var secF = section('F. Premorbid Personality (clinician-rated)', 'bi-person-check');
    secF.appendChild(subLabel('Tick one per line'));
    secF.appendChild(personalityTable());
    var f1 = row(2);
    f1.appendChild(wrapCol(F.createField({ label: 'Handling conflict', statePath: SP + '.persConflict', type: 'select', options: ['', 'Avoidant', 'Direct', 'Escalates', 'Other'] }), 'col-md-6'));
    f1.appendChild(wrapCol(F.createField({ label: 'Baseline mood', statePath: SP + '.persMood', type: 'select', options: ['', 'Mostly positive', 'Neutral', 'Low/anxious'] }), 'col-md-6'));
    secF.appendChild(f1);
    var f2 = row(1);
    f2.appendChild(wrapCol(F.createField({ label: 'Baseline social engagement', statePath: SP + '.persSocial', type: 'select', options: ['', 'High', 'Typical', 'Low'] }), 'col-md-6'));
    secF.appendChild(f2);
    card.appendChild(secF);

    // ══════════════════════════════════════
    // G. EDUCATION AND OCCUPATION
    // ══════════════════════════════════════
    var secG = section('G. Education and Occupation', 'bi-mortarboard');
    var g1 = row(3);
    g1.appendChild(wrapCol(F.createField({ label: 'Academic performance (self-rating)', statePath: SP + '.academicPerf', type: 'select', options: ['', 'Top', 'Middle', 'Bottom'] }), 'col-md-4'));
    g1.appendChild(wrapCol(F.createField({ label: 'Age left school', statePath: SP + '.schoolLeaveAge', type: 'number', min: 10, max: 25 }), 'col-md-4'));
    g1.appendChild(wrapCol(F.createField({ label: 'Highest qualification', statePath: SP + '.highestQual', type: 'select', options: ['', 'None', 'GCSE/O-level', 'A-level', 'Degree', 'Postgrad', 'Other'] }), 'col-md-4'));
    secG.appendChild(g1);
    var g2 = row(3);
    g2.appendChild(wrapCol(F.createField({ label: 'Years of education', statePath: SP + '.yearsEdu', type: 'number', min: 0, max: 30 }), 'col-md-4'));
    g2.appendChild(wrapCol(F.createField({ label: 'Learning difficulties?', statePath: SP + '.learningDiff', type: 'select', options: ['', 'No', 'Yes — dyslexia', 'Yes — ADHD', 'Yes — other'] }), 'col-md-4'));
    g2.appendChild(wrapCol(F.createField({ label: 'Occupational status', statePath: SP + '.occStatus', type: 'select', options: ['', 'Employed', 'Retired', 'Unemployed', 'Sick leave', 'Other'] }), 'col-md-4'));
    secG.appendChild(g2);
    var g3 = row(3);
    g3.appendChild(wrapCol(F.createField({ label: 'First job after school', statePath: SP + '.firstJob', placeholder: '' }), 'col-md-4'));
    g3.appendChild(wrapCol(F.createField({ label: 'Peak occupation', statePath: SP + '.peakOccupation', placeholder: '' }), 'col-md-4'));
    g3.appendChild(wrapCol(F.createField({ label: 'Last job (if retired)', statePath: SP + '.lastJob', placeholder: '' }), 'col-md-4'));
    secG.appendChild(g3);
    var g4 = row(1);
    g4.appendChild(wrapCol(F.createField({ label: 'Work domain', statePath: SP + '.workDomain', type: 'select', options: ['', 'Manual', 'Clerical', 'Professional', 'Caring', 'Managerial', 'Other'] }), 'col-md-4'));
    secG.appendChild(g4);
    card.appendChild(secG);

    // ══════════════════════════════════════
    // H. SUBSTANCE USE
    // ══════════════════════════════════════
    var secH = section('H. Substance Use', 'bi-cup-straw');
    var h1 = row(3);
    h1.appendChild(wrapCol(F.createField({ label: 'Alcohol (current) — units/week', statePath: SP + '.alcUnitsWk', type: 'select', options: ['', 'None', '1-7', '8-14', '15-35', '>35'] }), 'col-md-4'));
    h1.appendChild(wrapCol(F.createField({ label: 'AUDIT completed?', statePath: SP + '.auditCompleted', type: 'select', options: ['', 'No', 'Yes'] }), 'col-md-4'));
    h1.appendChild(wrapCol(F.createField({ label: 'AUDIT score (if known)', statePath: SP + '.auditScore', type: 'number', min: 0, max: 40 }), 'col-md-4'));
    secH.appendChild(h1);
    var h2 = row(2);
    h2.appendChild(wrapCol(F.createField({ label: 'Alcohol (past)', statePath: SP + '.alcPast', type: 'select', options: ['', 'No concerns', 'Past harmful use'] }), 'col-md-6'));
    h2.appendChild(wrapCol(F.createField({ label: 'Past use details', statePath: SP + '.alcPastDetails', placeholder: '' }), 'col-md-6'));
    secH.appendChild(h2);
    var h3 = row(3);
    h3.appendChild(wrapCol(F.createField({ label: 'Tobacco', statePath: SP + '.tobacco', type: 'select', options: ['', 'Never', 'Ex-smoker', 'Current'] }), 'col-md-4'));
    h3.appendChild(wrapCol(F.createField({ label: 'Packs/day', statePath: SP + '.tobaccoPacks', placeholder: '' }), 'col-md-4'));
    h3.appendChild(wrapCol(F.createField({ label: 'Years smoking', statePath: SP + '.tobaccoYears', placeholder: '' }), 'col-md-4'));
    secH.appendChild(h3);
    var h4 = row(2);
    h4.appendChild(wrapCol(F.createField({ label: 'Cannabis', statePath: SP + '.cannabis', type: 'select', options: ['', 'Never', 'Past', 'Current — daily', 'Current — weekly', 'Current — monthly', 'Current — occasional'] }), 'col-md-6'));
    h4.appendChild(wrapCol(F.createField({ label: 'Other substances', statePath: SP + '.otherSubstances', type: 'select', options: ['', 'None', 'Stimulants', 'Opiates', 'Sedatives', 'Other'] }), 'col-md-6'));
    secH.appendChild(h4);
    var h5 = row(2);
    h5.appendChild(wrapCol(F.createField({ label: 'Caffeine cups/day', statePath: SP + '.caffeine', placeholder: '' }), 'col-md-6'));
    h5.appendChild(wrapCol(F.createField({ label: 'Substance-related harms', statePath: SP + '.substanceHarms', type: 'select', options: ['', 'No', 'Yes — falls', 'Yes — driving', 'Yes — withdrawal', 'Yes — other'] }), 'col-md-6'));
    secH.appendChild(h5);
    secH.appendChild(F.createField({ label: 'Substance use notes', statePath: SP + '.substanceNotes', type: 'textarea', rows: 2 }));
    card.appendChild(secH);

    // ══════════════════════════════════════
    // I. OTHER COMMENTS / CLINICIAN NOTES
    // ══════════════════════════════════════
    var secI = section('I. Other Comments / Clinician Notes', 'bi-pencil-square');
    secI.appendChild(F.createField({ label: 'Key positives / concerns', statePath: SP + '.keyPositives', type: 'textarea', rows: 3, placeholder: 'Key positive findings, onset patterns, impressions' }));
    secI.appendChild(F.createField({ label: 'Safety concerns', statePath: SP + '.safetyConcerns', type: 'textarea', rows: 2, placeholder: 'Any immediate safety or risk issues' }));
    card.appendChild(secI);

    container.appendChild(card);
  }

  // ── Cognitive symptom table (A & B) — Y/N + frequency + onset per item ──
  function cogTable(prefix, items) {
    var wrap = document.createElement('div');
    wrap.className = 'table-responsive';
    var t = document.createElement('table');
    t.className = 'cdr-worksheet-table';
    t.style.width = '100%';

    // Header
    var thead = document.createElement('thead');
    var hr = document.createElement('tr');
    ['Item', 'Y/N', 'Daily', 'Weekly', 'Monthly', 'Occasional', 'Onset (approx)'].forEach(function (h) {
      var th = document.createElement('th');
      th.textContent = h;
      th.style.padding = '6px 8px';
      th.style.fontSize = '0.82rem';
      if (h === 'Item') th.style.minWidth = '220px';
      if (h === 'Onset (approx)') th.style.minWidth = '120px';
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    t.appendChild(thead);

    var tbody = document.createElement('tbody');
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var tr = document.createElement('tr');

      // Label
      var tdL = document.createElement('td');
      tdL.textContent = item.label;
      tdL.style.fontSize = '0.84rem';
      tdL.style.padding = '5px 8px';
      tr.appendChild(tdL);

      // Y/N buttons
      var tdYN = document.createElement('td');
      tdYN.style.textAlign = 'center';
      tdYN.appendChild(makeToggle(item.key, YN_VALS, YN_COLS));
      tr.appendChild(tdYN);

      // Frequency buttons (collect references for enable/disable)
      var freqBtns = [];
      for (var f = 0; f < FREQ_VALS.length; f++) {
        var tdF = document.createElement('td');
        tdF.style.textAlign = 'center';
        tdF.className = 'cog-freq-cell';
        var fb = makeRadioBtn(item.key + '_freq', FREQ_VALS[f], FREQ_COLS[f].charAt(0));
        freqBtns.push(fb);
        tdF.appendChild(fb);
        tr.appendChild(tdF);
      }

      // Onset field
      var tdO = document.createElement('td');
      var inp = document.createElement('input');
      inp.type = 'text';
      inp.className = 'rbans-input';
      inp.style.width = '100%';
      inp.placeholder = '';
      var curOnset = BHM.State.get(SP + '.' + item.key + '_onset');
      if (curOnset) inp.value = curOnset;
      inp.addEventListener('input', (function (k) { return function () { BHM.State.set(SP + '.' + k + '_onset', this.value); }; })(item.key));
      tdO.appendChild(inp);
      tr.appendChild(tdO);

      tbody.appendChild(tr);

      // Wire Y/N toggle to enable/disable frequency buttons & onset
      wireYNtoFreq(item.key, tdYN, freqBtns, inp);
    }
    t.appendChild(tbody);
    wrap.appendChild(t);
    return wrap;
  }

  // ── Visuospatial table (C) — Present / Stopped / Safety concern / Onset ──
  function visTable() {
    var wrap = document.createElement('div');
    wrap.className = 'table-responsive';
    var t = document.createElement('table');
    t.className = 'cdr-worksheet-table';
    t.style.width = '100%';

    var thead = document.createElement('thead');
    var hr = document.createElement('tr');
    ['Situation', 'Present', 'Stopped', 'Safety concern', 'Onset'].forEach(function (h) {
      var th = document.createElement('th');
      th.textContent = h;
      th.style.padding = '6px 8px';
      th.style.fontSize = '0.82rem';
      if (h === 'Situation') th.style.minWidth = '260px';
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    t.appendChild(thead);

    var tbody = document.createElement('tbody');
    for (var i = 0; i < VIS_ITEMS.length; i++) {
      var item = VIS_ITEMS[i];
      var tr = document.createElement('tr');

      var tdL = document.createElement('td');
      tdL.textContent = item.label;
      tdL.style.fontSize = '0.84rem';
      tdL.style.padding = '5px 8px';
      tr.appendChild(tdL);

      // Present / Stopped / Safety — each is a checkbox
      ['_present', '_stopped', '_safety'].forEach(function (suffix) {
        var td = document.createElement('td');
        td.style.textAlign = 'center';
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'form-check-input';
        cb.style.width = '20px';
        cb.style.height = '20px';
        var cur = BHM.State.get(SP + '.' + item.key + suffix);
        if (cur === 'yes') cb.checked = true;
        cb.addEventListener('change', (function (k, suf) {
          return function () { BHM.State.set(SP + '.' + k + suf, this.checked ? 'yes' : 'no'); };
        })(item.key, suffix));
        td.appendChild(cb);
        tr.appendChild(td);
      });

      // Onset text
      var tdO = document.createElement('td');
      var inp = document.createElement('input');
      inp.type = 'text';
      inp.className = 'rbans-input';
      inp.style.width = '100%';
      var curO = BHM.State.get(SP + '.' + item.key + '_onset');
      if (curO) inp.value = curO;
      inp.addEventListener('input', (function (k) { return function () { BHM.State.set(SP + '.' + k + '_onset', this.value); }; })(item.key));
      tdO.appendChild(inp);
      tr.appendChild(tdO);

      tbody.appendChild(tr);
    }
    t.appendChild(tbody);
    wrap.appendChild(t);
    return wrap;
  }

  // ── Personality table (F) — Low / Typical / High per item ──
  function personalityTable() {
    var wrap = document.createElement('div');
    wrap.className = 'table-responsive';
    var t = document.createElement('table');
    t.className = 'cdr-worksheet-table';
    t.style.width = '100%';

    var thead = document.createElement('thead');
    var hr = document.createElement('tr');
    ['Trait', 'Low', 'Typical', 'High / marked'].forEach(function (h) {
      var th = document.createElement('th');
      th.textContent = h;
      th.style.padding = '6px 8px';
      th.style.fontSize = '0.82rem';
      if (h === 'Trait') th.style.minWidth = '200px';
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    t.appendChild(thead);

    var tbody = document.createElement('tbody');
    var vals = ['low', 'typical', 'high'];
    for (var i = 0; i < PERSONALITY_ITEMS.length; i++) {
      var item = PERSONALITY_ITEMS[i];
      var tr = document.createElement('tr');
      var tdL = document.createElement('td');
      tdL.textContent = item.label;
      tdL.style.fontSize = '0.84rem';
      tdL.style.padding = '5px 8px';
      tr.appendChild(tdL);
      for (var v = 0; v < vals.length; v++) {
        var td = document.createElement('td');
        td.style.textAlign = 'center';
        td.appendChild(makeRadioBtn(item.key, vals[v], ''));
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    t.appendChild(tbody);
    wrap.appendChild(t);
    return wrap;
  }

  // ── UI helpers ──

  // Disable frequency buttons + onset when Y/N is not "yes"
  function wireYNtoFreq(key, ynCell, freqBtns, onsetInput) {
    function syncDisabled() {
      var val = BHM.State.get(SP + '.' + key);
      var enabled = (val === 'yes');
      for (var i = 0; i < freqBtns.length; i++) {
        freqBtns[i].disabled = !enabled;
        freqBtns[i].style.opacity = enabled ? '1' : '0.3';
        freqBtns[i].style.pointerEvents = enabled ? '' : 'none';
      }
      onsetInput.disabled = !enabled;
      onsetInput.style.opacity = enabled ? '1' : '0.3';
      // If switching to No, clear frequency and onset
      if (!enabled) {
        for (var j = 0; j < freqBtns.length; j++) {
          freqBtns[j].classList.remove('btn-primary', 'active');
          freqBtns[j].classList.add('btn-outline-secondary');
        }
        BHM.State.set(SP + '.' + key + '_freq', '');
        BHM.State.set(SP + '.' + key + '_onset', '');
        onsetInput.value = '';
      }
    }
    // Initial sync
    syncDisabled();
    // Re-sync when any Y/N button in this cell is clicked
    var btns = ynCell.querySelectorAll('.btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () {
        // Small delay to let the state update first
        setTimeout(syncDisabled, 10);
      });
    }
  }

  function makeToggle(key, vals, labels) {
    var grp = document.createElement('div');
    grp.className = 'btn-group btn-group-sm';
    for (var i = 0; i < vals.length; i++) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-outline-secondary btn-sm';
      btn.textContent = labels[i];
      btn.style.fontSize = '0.78rem';
      btn.style.padding = '2px 8px';
      var cur = BHM.State.get(SP + '.' + key);
      if (cur === vals[i]) btn.classList.add('active', vals[i] === 'yes' ? 'btn-primary' : 'btn-secondary');
      btn.addEventListener('click', (function (k, v, g) {
        return function () {
          BHM.State.set(SP + '.' + k, v);
          var btns = g.querySelectorAll('.btn');
          for (var j = 0; j < btns.length; j++) { btns[j].classList.remove('active', 'btn-primary', 'btn-secondary'); btns[j].classList.add('btn-outline-secondary'); }
          this.classList.remove('btn-outline-secondary');
          this.classList.add('active', v === 'yes' ? 'btn-primary' : 'btn-secondary');
        };
      })(key, vals[i], grp));
      grp.appendChild(btn);
    }
    return grp;
  }

  function makeRadioBtn(key, val, label) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-outline-secondary btn-sm';
    btn.setAttribute('data-radio-key', key);
    btn.textContent = label || '\u25CB';
    btn.style.fontSize = '0.75rem';
    btn.style.padding = '1px 6px';
    btn.style.borderRadius = '50%';
    btn.style.width = '26px';
    btn.style.height = '26px';
    var cur = BHM.State.get(SP + '.' + key);
    if (cur === val) { btn.classList.remove('btn-outline-secondary'); btn.classList.add('btn-primary', 'active'); }
    btn.addEventListener('click', (function (k, v) {
      return function () {
        // Deselect all sibling radio buttons sharing the same key in this row
        var row = this.closest('tr');
        if (row) {
          var siblings = row.querySelectorAll('[data-radio-key="' + k + '"]');
          for (var j = 0; j < siblings.length; j++) {
            siblings[j].classList.remove('btn-primary', 'active');
            siblings[j].classList.add('btn-outline-secondary');
          }
        }
        BHM.State.set(SP + '.' + k, v);
        this.classList.remove('btn-outline-secondary');
        this.classList.add('btn-primary', 'active');
      };
    })(key, val));
    return btn;
  }

  function section(title, icon) {
    var div = document.createElement('div');
    div.className = 'mt-4';
    div.innerHTML = '<h6 class="text-primary"><i class="bi ' + icon + ' me-1"></i>' + title + '</h6>';
    return div;
  }

  function subLabel(text) {
    var div = document.createElement('div');
    div.className = 'mb-2';
    div.innerHTML = '<span style="font-size:0.84rem;color:#6c757d">' + text + '</span>';
    return div;
  }

  function row() {
    var div = document.createElement('div');
    div.className = 'row g-3 mb-2';
    return div;
  }

  function wrapCol(el, colClass) {
    var col = document.createElement('div');
    col.className = colClass;
    col.appendChild(el);
    return col;
  }

  // Public getters for report generation
  function getMemItems() { return MEM_ITEMS; }
  function getLangItems() { return LANG_ITEMS; }
  function getVisItems() { return VIS_ITEMS; }
  function getPersonalityItems() { return PERSONALITY_ITEMS; }

  return {
    render: render,
    getMemItems: getMemItems,
    getLangItems: getLangItems,
    getVisItems: getVisItems,
    getPersonalityItems: getPersonalityItems
  };
})();
