/* CDR Instrument - Clinical Dementia Rating Scale
   Assessment interview worksheet + Scoring grid/calculator
   Based on: CDR English United States (Washington University)
   ========================================================== */
var BHM = window.BHM || {};
BHM.Instruments = BHM.Instruments || {};

BHM.Instruments.CDR = (function () {
  'use strict';

  var SP = 'instruments.cdr';
  var S = BHM.State;
  var F = BHM.ClickableGrid;

  /* ═══════════════════════════════════════
     DOMAIN DATA for scoring grid
     ═══════════════════════════════════════ */
  var DOMAINS = [
    { key: 'memory', label: 'Memory', descriptions: [
        'No memory loss or slight inconsistent forgetfulness',
        'Consistent slight forgetfulness; partial recollection of events; \u201cbenign\u201d forgetfulness',
        'Moderate memory loss; more marked for recent events; defect interferes with everyday activities',
        'Severe memory loss; only highly learned material retained; new material rapidly lost',
        'Severe memory loss; only fragments remain'
    ]},
    { key: 'orientation', label: 'Orientation', descriptions: [
        'Fully oriented',
        'Fully oriented except for slight difficulty with time relationships',
        'Moderate difficulty with time relationships; oriented for place at examination; may have geographic disorientation elsewhere',
        'Severe difficulty with time relationships; usually disoriented to time, often to place',
        'Oriented to person only'
    ]},
    { key: 'judgment', label: 'Judgment & Problem Solving', descriptions: [
        'Solves everyday problems & handles business & financial affairs well; judgment good in relation to past performance',
        'Slight impairment in solving problems, similarities, and differences',
        'Moderate difficulty in handling problems, similarities, and differences; social judgment usually maintained',
        'Severely impaired in handling problems, similarities, and differences; social judgment usually impaired',
        'Unable to make judgments or solve problems'
    ]},
    { key: 'community', label: 'Community Affairs', descriptions: [
        'Independent function at usual level in job, shopping, volunteer and social groups',
        'Slight impairment in these activities',
        'Unable to function independently at these activities although may still be engaged in some; appears normal to casual inspection',
        'No pretense of independent function outside home. Appears well enough to be taken to functions outside a family home',
        'No pretense of independent function outside home. Appears too ill to be taken to functions outside a family home'
    ]},
    { key: 'homeHobbies', label: 'Home and Hobbies', descriptions: [
        'Life at home, hobbies, and intellectual interests well maintained',
        'Life at home, hobbies, and intellectual interests slightly impaired',
        'Mild but definite impairment of function at home; more difficult chores abandoned; more complicated hobbies and interests abandoned',
        'Only simple chores preserved; very restricted interests, poorly maintained',
        'No significant function in home'
    ]},
    { key: 'personalCare', label: 'Personal Care', isPersonalCare: true, descriptions: [
        'Fully capable of self-care',
        null,
        'Needs prompting',
        'Requires assistance in dressing, hygiene, keeping of personal effects',
        'Requires much help with personal care; frequent incontinence'
    ]}
  ];

  var SCORE_VALUES = [0, 0.5, 1, 2, 3];

  /* ═══════════════════════════════════════
     ASSESSMENT TAB - Semi-structured interview worksheet
     Tabular layout based on CDR English United States
     (Washington University)
     ═══════════════════════════════════════ */
  function renderAssessment(container) {
    container.innerHTML = '';
    var card = document.createElement('div');
    card.className = 'instrument-card';
    card.innerHTML =
      '<h5>Clinical Dementia Rating Worksheet</h5>' +
      '<p class="instrument-subtitle">This is a semi-structured interview. Please ask all of these questions. Ask any additional questions necessary to determine the subject\u2019s CDR.</p>' +
      '<p class="text-muted small mb-0">All rights reserved. Copyright 2001 by Washington University in St. Louis, Missouri.</p>';

    // ═══ MEMORY - INFORMANT ═══
    card.appendChild(wsSection('Memory Questions for Informant'));
    card.appendChild(wsTable(['Question', 'Yes', 'No'], [
      ['Does he/she have a problem with his/her memory or thinking?', 'mem_inf_problem'],
      ['1a. If yes, is this a consistent problem (as opposed to inconsistent)?', 'mem_inf_consistent']
    ]));
    card.appendChild(wsTable(['Question', 'Usually', 'Sometimes', 'Rarely'], [
      ['Can he/she recall recent events?', 'mem_inf_recall'],
      ['Can he/she remember a short list of items (shopping)?', 'mem_inf_list']
    ]));
    card.appendChild(wsTable(['Question', 'Yes', 'No'], [
      ['Has there been some decline in memory during the past year?', 'mem_inf_decline'],
      ['Is his/her memory impaired to such a degree that it would have interfered with his/her activities of daily life a few years ago (or pre-retirement activities)?', 'mem_inf_adl']
    ]));
    card.appendChild(wsTable(['Question', 'Usually', 'Sometimes', 'Rarely'], [
      ['Does he/she completely forget a major event (e.g., trip, party, family wedding) within a few weeks of the event?', 'mem_inf_forget_event'],
      ['Does he/she forget pertinent details of the major event?', 'mem_inf_forget_details'],
      ['Does he/she completely forget important information of the distant past (e.g., birthdate, wedding date, place of employment)?', 'mem_inf_forget_distant']
    ]));
    card.appendChild(wsNoteRow('mem_inf_recent_event', 'Tell me about some recent event in his/her life that he/she should remember. (For later testing, obtain details such as location, time, participants, how long, when ended, how they got there).'));
    card.appendChild(wsFieldGrid([
      ['mem_inf_event_1wk', 'Within 1 week:'],
      ['mem_inf_event_1mo', 'Within 1 month:']
    ], 2));
    card.appendChild(wsFieldGrid([
      ['mem_inf_born_when', 'When was he/she born?'],
      ['mem_inf_born_where', 'Where was he/she born?'],
      ['mem_inf_school', 'Last school attended?']
    ], 3));
    card.appendChild(wsFieldGrid([
      ['mem_inf_occupation', 'Main occupation/job?'],
      ['mem_inf_last_job', 'Last major job?'],
      ['mem_inf_retire', 'When retire and why?']
    ], 3));

    // ═══ ORIENTATION - INFORMANT ═══
    card.appendChild(wsSection('Orientation Questions for Informant'));
    card.appendChild(wsSubLabel('How often does he/she know the exact:'));
    card.appendChild(wsTable(['Question', 'Usually', 'Sometimes', 'Rarely', "Don't Know"], [
      ['Date of the Month?', 'ori_inf_date'],
      ['Month?', 'ori_inf_month'],
      ['Year?', 'ori_inf_year'],
      ['Day of the Week?', 'ori_inf_day'],
      ['Does he/she have difficulty with time relationships (when events happened in relation to each other)?', 'ori_inf_time_rel'],
      ['Can he/she find his/her way about familiar streets?', 'ori_inf_streets'],
      ['How often does he/she know how to get from one place to another outside his/her neighbourhood?', 'ori_inf_outside'],
      ['How often can he/she find his/her way about indoors?', 'ori_inf_indoors']
    ]));

    // ═══ JUDGMENT - INFORMANT ═══
    card.appendChild(wsSection('Judgment and Problem Solving Questions for Informant'));
    card.appendChild(wsTable(['In general, rate his/her problem-solving abilities:', 'As good as ever', 'Good, not as good', 'Fair', 'Poor', 'No ability'], [
      ['Rate his/her abilities to solve problems at the present time', 'judg_inf_rate']
    ]));
    card.appendChild(wsTable(['Rate ability to handle money:', 'No loss', 'Some loss', 'Severe loss'], [
      ['Cope with small sums of money (e.g., make change, leave a small tip)', 'judg_inf_money'],
      ['Handle complicated financial or business transactions (e.g., balance chequebook, pay bills)', 'judg_inf_financial']
    ]));
    card.appendChild(wsTable(['Question', 'As well as before', 'Worse (thinking)', 'Worse (other)'], [
      ['Can he/she handle a household emergency (e.g., plumbing leak, small fire)?', 'judg_inf_emergency']
    ]));
    card.appendChild(wsTable(['Question', 'Usually', 'Sometimes', 'Rarely', "Don't Know"], [
      ['Can he/she understand situations or explanations?', 'judg_inf_understand'],
      ['Does he/she behave appropriately in social situations and interactions?', 'judg_inf_behave']
    ]));

    // ═══ COMMUNITY AFFAIRS - INFORMANT ═══
    card.appendChild(wsSection('Community Affairs Questions for Informant'));
    card.appendChild(wsSubLabel('Occupational'));
    card.appendChild(wsTable(['Question', 'Yes', 'No', 'N/A'], [
      ['1. Is the subject still working?', 'comm_inf_working']
    ]));
    card.appendChild(wsTable(['Question', 'Yes', 'No'], [
      ['2. Did memory or thinking problems contribute to the subject\u2019s decision to retire?', 'comm_inf_retire_reason']
    ]));
    card.appendChild(wsTable(['Question', 'Rarely/Never', 'Sometimes', 'Usually', "Don't Know"], [
      ['3. Does the subject have significant difficulty in his/her job because of problems with memory or thinking?', 'comm_inf_job_diff']
    ]));
    card.appendChild(wsSubLabel('Social'));
    card.appendChild(wsTable(['Question', 'Yes', 'No'], [
      ['4. Did he/she ever drive a car?', 'comm_inf_drive_ever'],
      ['Does the subject drive a car now?', 'comm_inf_drive_now'],
      ['If no, is this because of memory or thinking problems?', 'comm_inf_drive_memory'],
      ['5. If still driving, are there problems or risks because of poor thinking?', 'comm_inf_drive_risk']
    ]));
    card.appendChild(wsTable(['Question', 'Rarely/Never', 'Sometimes', 'Usually', "Don't Know"], [
      ['6. Is he/she able to independently shop for needs?', 'comm_inf_shop'],
      ['7. Is he/she able to independently carry out activities outside the home?', 'comm_inf_activities']
    ]));
    card.appendChild(wsTable(['Question', 'Yes', 'No'], [
      ['Is he/she taken to social functions outside a family home?', 'comm_inf_social_fn'],
      ['Would a casual observer think the subject was ill?', 'comm_inf_observer']
    ]));
    card.appendChild(wsNoteRow('comm_inf_notes', 'Community Affairs notes'));

    // ═══ HOME AND HOBBIES - INFORMANT ═══
    card.appendChild(wsSection('Home and Hobbies Questions for Informant'));
    card.appendChild(wsFieldGrid([
      ['home_inf_chore_changes', '1a. What changes have occurred in his/her abilities to perform household chores?'],
      ['home_inf_chore_can', '1b. What can he/she still do well?']
    ], 2));
    card.appendChild(wsFieldGrid([
      ['home_inf_hobby_changes', '2a. What changes have occurred in his/her abilities to perform hobbies?'],
      ['home_inf_hobby_can', '2b. What can he/she still do well?']
    ], 2));
    card.appendChild(wsTable(['Household chore level:', 'Normal function', 'Not at usual level', 'Independent in some', 'Limited only', 'No meaningful function'], [
      ['Is he/she able to perform household chores at the level of:', 'home_inf_household_level']
    ]));
    card.appendChild(wsNoteRow('home_inf_notes', 'Home and Hobbies notes'));

    // ═══ PERSONAL CARE - INFORMANT ═══
    card.appendChild(wsSection('Personal Care Questions for Informant'));
    card.appendChild(wsSubLabel('What is your estimate of his/her mental ability in the following areas:'));
    card.appendChild(wsBlessedTable());
    card.appendChild(wsSubLabel('* A box-score of 1 can be considered if the subject\u2019s personal care is impaired from a previous level, even if they do not receive prompting.'));

    // ═══ MEMORY - SUBJECT ═══
    card.appendChild(wsSection('Memory Questions for Subject'));
    card.appendChild(wsTable(['Question', 'Yes', 'No'], [
      ['Do you have problems with memory or thinking?', 'mem_subj_problem']
    ]));
    card.appendChild(wsSubLabel('A few moments ago your informant told me a few recent experiences you had. Will you tell me something about those?'));
    card.appendChild(wsTable(['Recall', '1.0 \u2013 Largely correct', '0.5', '0.0 \u2013 Largely incorrect'], [
      ['Within 1 week', 'mem_subj_recall_1wk'],
      ['Within 1 month', 'mem_subj_recall_1mo']
    ]));
    card.appendChild(wsSubLabel('Name and address memory test: John Brown, 42 Market Street, Chicago'));
    card.appendChild(wsFieldGrid([
      ['mem_subj_trial1', 'Trial 1 (elements correct):'],
      ['mem_subj_trial2', 'Trial 2 (elements correct):'],
      ['mem_subj_trial3', 'Trial 3 (elements correct):']
    ], 3));
    card.appendChild(wsFieldGrid([
      ['mem_subj_born_when', 'When were you born?'],
      ['mem_subj_born_where', 'Where were you born?'],
      ['mem_subj_school', 'Last school attended?']
    ], 3));
    card.appendChild(wsFieldGrid([
      ['mem_subj_occupation', 'Main occupation/job?'],
      ['mem_subj_last_job', 'Last major job?'],
      ['mem_subj_retire', 'When retire and why?']
    ], 3));
    card.appendChild(wsSubLabel('Repeat the name and address I asked you to remember:'));
    card.appendChild(wsFieldGrid([
      ['mem_subj_delayed', 'Delayed recall (elements correct):']
    ], 1));

    // ═══ ORIENTATION - SUBJECT ═══
    card.appendChild(wsSection('Orientation Questions for Subject'));
    card.appendChild(wsSubLabel('Record the subject\u2019s answer verbatim for each question'));
    card.appendChild(wsOrientationSubjectTable());

    // ═══ JUDGMENT - SUBJECT ═══
    card.appendChild(wsSection('Judgment and Problem Solving Questions for Subject'));
    card.appendChild(wsSubLabel('Similarities'));
    card.appendChild(wsTable(['Item', '0', '1', '2'], [
      ['Turnip \u2026 cauliflower (0 = vegetables; 1 = edible/living/cooked; 2 = not pertinent)', 'judg_subj_sim1'],
      ['Desk \u2026 bookcase (0 = furniture; 1 = wooden/legs; 2 = not pertinent)', 'judg_subj_sim2']
    ]));
    card.appendChild(wsSubLabel('Differences'));
    card.appendChild(wsTable(['Item', '0', '1', '2'], [
      ['Lie \u2026 mistake (0 = deliberate vs unintentional; 1 = one bad/one good; 2 = other)', 'judg_subj_diff1'],
      ['River \u2026 canal (0 = natural vs artificial; 2 = anything else)', 'judg_subj_diff2']
    ]));
    card.appendChild(wsSubLabel('Calculations'));
    card.appendChild(wsTable(['Question', 'Correct', 'Incorrect'], [
      ['How many nickels in a dollar?', 'judg_subj_calc1'],
      ['How many quarters in $6.75?', 'judg_subj_calc2'],
      ['Subtract 3 from 20 and keep subtracting 3 all the way down', 'judg_subj_calc3']
    ]));
    card.appendChild(wsSubLabel('Judgment'));
    card.appendChild(wsTable(['Question', '0', '1', '2'], [
      ['Upon arriving in a strange city, how would you locate a friend? (0=phone book/courthouse; 1=police/operator; 2=no clear response)', 'judg_subj_city']
    ]));
    card.appendChild(wsTable(['Subject\u2019s assessment of disability and understanding:', 'Good Insight', 'Partial Insight', 'Little Insight'], [
      ['Rate insight', 'judg_subj_insight']
    ]));

    container.appendChild(card);
  }

  /* ── Tabular helper: build a worksheet table ── */
  function wsTable(headers, rows) {
    var wrap = document.createElement('div');
    wrap.className = 'table-responsive';
    var table = document.createElement('table');
    table.className = 'cdr-worksheet-table';
    // header
    var thead = document.createElement('thead');
    var htr = document.createElement('tr');
    for (var h = 0; h < headers.length; h++) {
      var th = document.createElement('th');
      th.textContent = headers[h];
      htr.appendChild(th);
    }
    thead.appendChild(htr);
    table.appendChild(thead);
    // body
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
        btn.addEventListener('click', wsBtnHandler);
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

  function wsBtnHandler(e) {
    var btn = e.target;
    var key = btn.getAttribute('data-key');
    var val = btn.getAttribute('data-val');
    // deselect siblings in same row
    var row = btn.closest('tr');
    var btns = row.querySelectorAll('.cdr-ws-btn');
    for (var i = 0; i < btns.length; i++) { btns[i].classList.remove('active'); btns[i].textContent = '\u25CB'; }
    btn.classList.add('active');
    btn.textContent = '\u25CF';
    S.set(SP + '.' + key, val);
  }

  /* ── Section heading ── */
  function wsSection(title) {
    var div = document.createElement('div');
    div.className = 'cdr-ws-section';
    div.innerHTML = '<h6><i class="bi bi-chat-square-text me-1"></i>' + title + '</h6>';
    return div;
  }
  function wsSubLabel(text) {
    var div = document.createElement('div');
    div.className = 'cdr-ws-subsection mb-1';
    div.textContent = text;
    return div;
  }

  /* ── Note / textarea row ── */
  function wsNoteRow(key, label) {
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
    ta.addEventListener('input', function () { S.set(SP + '.' + key, this.value); });
    div.appendChild(ta);
    return div;
  }

  /* ── Grid of text fields ── */
  function wsFieldGrid(fields, cols) {
    var row = document.createElement('div');
    row.className = 'row g-2 mb-2';
    var colCls = cols >= 3 ? 'col-md-4' : cols === 2 ? 'col-md-6' : 'col-12';
    for (var i = 0; i < fields.length; i++) {
      var col = document.createElement('div');
      col.className = colCls;
      var lbl = document.createElement('label');
      lbl.className = 'form-label mb-0';
      lbl.style.fontSize = '0.82rem';
      lbl.textContent = fields[i][1];
      col.appendChild(lbl);
      var inp = document.createElement('input');
      inp.type = 'text';
      inp.className = 'form-control form-control-sm';
      inp.style.fontSize = '0.82rem';
      var key = fields[i][0];
      var cur = S.get(SP + '.' + key);
      if (cur) inp.value = cur;
      inp.setAttribute('data-key', key);
      inp.addEventListener('input', function () { S.set(SP + '.' + this.getAttribute('data-key'), this.value); });
      col.appendChild(inp);
      row.appendChild(col);
    }
    return row;
  }

  /* ── Blessed personal care scoring table ── */
  function wsBlessedTable() {
    var blessedData = [
      { key: 'pc_inf_dressing', label: 'A. Dressing', opts: ['Unaided', 'Occasionally misplaced buttons, etc.', 'Wrong sequence, commonly forgotten items', 'Unable to dress'] },
      { key: 'pc_inf_washing', label: 'B. Washing, grooming', opts: ['Unaided', 'Needs prompting', 'Sometimes needs help', 'Always or nearly always needs help'] },
      { key: 'pc_inf_eating', label: 'C. Eating habits', opts: ['Cleanly; proper utensils', 'Messily; spoon', 'Simple solids', 'Has to be fed completely'] },
      { key: 'pc_inf_sphincter', label: 'D. Sphincter control', opts: ['Normal complete control', 'Occasionally wets bed', 'Frequently wets bed', 'Doubly incontinent'] }
    ];
    var wrap = document.createElement('div');
    wrap.className = 'table-responsive';
    var table = document.createElement('table');
    table.className = 'cdr-blessed-table';
    var thead = document.createElement('thead');
    var htr = document.createElement('tr');
    var hLabels = ['', '0', '1', '2', '3'];
    for (var h = 0; h < hLabels.length; h++) {
      var th = document.createElement('th');
      th.textContent = hLabels[h];
      htr.appendChild(th);
    }
    thead.appendChild(htr);
    table.appendChild(thead);
    var tbody = document.createElement('tbody');
    for (var r = 0; r < blessedData.length; r++) {
      var item = blessedData[r];
      var tr = document.createElement('tr');
      var tdLabel = document.createElement('td');
      tdLabel.textContent = item.label;
      tr.appendChild(tdLabel);
      for (var c = 0; c < item.opts.length; c++) {
        var td = document.createElement('td');
        td.title = item.opts[c];
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cdr-ws-btn';
        btn.innerHTML = '<small>' + esc(item.opts[c]) + '</small>';
        btn.setAttribute('data-key', item.key);
        btn.setAttribute('data-val', String(c));
        btn.addEventListener('click', wsBtnHandler);
        var cur = S.get(SP + '.' + item.key);
        if (cur === String(c)) { btn.classList.add('active'); }
        td.appendChild(btn);
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  /* ── Orientation subject table (question + answer + correct/incorrect) ── */
  function wsOrientationSubjectTable() {
    var qs = [
      ['ori_subj_date', 'What is the date today?'],
      ['ori_subj_day', 'What day of the week is it?'],
      ['ori_subj_month', 'What is the month?'],
      ['ori_subj_year', 'What is the year?'],
      ['ori_subj_place', 'What is the name of this place?'],
      ['ori_subj_town', 'What town or city are we in?'],
      ['ori_subj_time', 'What time is it?'],
      ['ori_subj_knows_informant', 'Does the subject know who the informant is?']
    ];
    var wrap = document.createElement('div');
    wrap.className = 'table-responsive';
    var table = document.createElement('table');
    table.className = 'cdr-worksheet-table';
    var thead = document.createElement('thead');
    var htr = document.createElement('tr');
    var headers = ['Question', 'Answer', 'Correct', 'Incorrect'];
    for (var h = 0; h < headers.length; h++) {
      var th = document.createElement('th');
      th.textContent = headers[h];
      htr.appendChild(th);
    }
    thead.appendChild(htr);
    table.appendChild(thead);
    var tbody = document.createElement('tbody');
    for (var r = 0; r < qs.length; r++) {
      var tr = document.createElement('tr');
      var tdQ = document.createElement('td');
      tdQ.textContent = qs[r][1];
      tr.appendChild(tdQ);
      // answer field
      var tdA = document.createElement('td');
      tdA.className = 'cdr-ws-note-cell';
      var inp = document.createElement('input');
      inp.type = 'text';
      inp.setAttribute('data-key', qs[r][0] + '_ans');
      var curA = S.get(SP + '.' + qs[r][0] + '_ans');
      if (curA) inp.value = curA;
      inp.addEventListener('input', function () { S.set(SP + '.' + this.getAttribute('data-key'), this.value); });
      tdA.appendChild(inp);
      tr.appendChild(tdA);
      // correct/incorrect buttons
      var ciBtns = ['correct', 'incorrect'];
      for (var ci = 0; ci < ciBtns.length; ci++) {
        var tdCI = document.createElement('td');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cdr-ws-btn';
        btn.textContent = '\u25CB';
        btn.setAttribute('data-key', qs[r][0]);
        btn.setAttribute('data-val', ciBtns[ci]);
        btn.addEventListener('click', wsBtnHandler);
        var cur = S.get(SP + '.' + qs[r][0]);
        if (cur === ciBtns[ci]) { btn.classList.add('active'); btn.textContent = '\u25CF'; }
        tdCI.appendChild(btn);
        tr.appendChild(tdCI);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  /* ═══════════════════════════════════════
     SCORING TAB - Clickable CDR grid + calculator
     ═══════════════════════════════════════ */
  function renderScoring(container) {
    container.innerHTML = '';
    var card = document.createElement('div');
    card.className = 'instrument-card';
    card.innerHTML =
      '<h5>Clinical Dementia Rating (CDR) \u2014 Scoring</h5>' +
      '<p class="instrument-subtitle">Based on the interview, rate each domain below. Scores are calculated using the Washington University algorithm.</p>' +
      '<p class="fw-bold text-center mb-3">Score only as decline from previous usual level due to cognitive loss, not impairment due to other factors.</p>';

    // ── CDR Total Score header table ──
    var totalCard = document.createElement('div');
    totalCard.className = 'card mb-3';
    totalCard.innerHTML =
      '<div class="card-header"><strong>Clinical Dementia Rating (CDR):</strong></div>' +
      '<div class="card-body p-0">' +
        '<table class="table table-bordered mb-0 text-center" id="cdr-score-table">' +
          '<tr><td class="fw-bold">CDR Score</td><td>0</td><td>0.5</td><td>1</td><td>2</td><td>3</td></tr>' +
        '</table>' +
      '</div>';
    card.appendChild(totalCard);

    // ── Clickable CDR rating grid ──
    var tableWrap = document.createElement('div');
    tableWrap.className = 'table-responsive mb-3';

    var table = document.createElement('table');
    table.className = 'clickable-grid cdr-assessment-table';
    table.id = 'cdr-rating-grid';

    var thead = document.createElement('thead');
    var htr = document.createElement('tr');
    var cols = ['', 'None 0', 'Questionable 0.5', 'Mild 1', 'Moderate 2', 'Severe 3'];
    for (var h = 0; h < cols.length; h++) {
      var th = document.createElement('th');
      th.textContent = cols[h];
      htr.appendChild(th);
    }
    thead.appendChild(htr);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    for (var d = 0; d < DOMAINS.length; d++) {
      var domain = DOMAINS[d];
      var tr = document.createElement('tr');
      tr.setAttribute('data-domain', domain.key);
      var tdLabel = document.createElement('td');
      tdLabel.className = 'cdr-domain-label';
      tdLabel.textContent = domain.label;
      tr.appendChild(tdLabel);

      for (var c = 0; c < SCORE_VALUES.length; c++) {
        var td = document.createElement('td');
        td.className = 'cdr-score-cell';
        td.setAttribute('data-domain', domain.key);
        td.setAttribute('data-score', SCORE_VALUES[c]);
        td.setAttribute('tabindex', '0');
        td.setAttribute('role', 'radio');
        td.setAttribute('aria-label', domain.label + ' score ' + SCORE_VALUES[c]);

        if (domain.isPersonalCare && c === 0) {
          td.setAttribute('colspan', '2');
          td.innerHTML = '<small>' + esc(domain.descriptions[0]) + '</small>';
          tr.appendChild(td);
          c++;
          continue;
        }
        if (domain.isPersonalCare && c === 1) { continue; }

        var desc = domain.descriptions[c];
        if (desc) {
          td.innerHTML = '<small>' + esc(desc) + '</small>';
        } else {
          td.className += ' cdr-empty-cell';
        }
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    tableWrap.appendChild(table);
    card.appendChild(tableWrap);

    // ── Box scores summary ──
    var boxCard = document.createElement('div');
    boxCard.className = 'card mb-3';
    boxCard.innerHTML =
      '<div class="card-header"><strong>Box Scores Summary</strong></div>' +
      '<div class="card-body p-0">' +
        '<table class="table table-bordered mb-0 text-center" id="cdr-box-table">' +
          '<thead><tr><th>Memory</th><th>Orientation</th><th>Judgment</th><th>Community</th><th>Home/Hobbies</th><th>Personal Care</th><th class="table-primary">Sum of Boxes</th></tr></thead>' +
          '<tbody><tr>' +
            '<td id="cdr-box-memory">--</td><td id="cdr-box-orientation">--</td><td id="cdr-box-judgment">--</td>' +
            '<td id="cdr-box-community">--</td><td id="cdr-box-homeHobbies">--</td><td id="cdr-box-personalCare">--</td>' +
            '<td id="cdr-box-sob" class="fw-bold table-primary">--</td>' +
          '</tr></tbody>' +
        '</table>' +
      '</div>';
    card.appendChild(boxCard);

    // ── Result display ──
    var resultDiv = document.createElement('div');
    resultDiv.id = 'cdr-result-div';
    resultDiv.className = 'alert alert-info text-center fs-5';
    resultDiv.textContent = 'Rate each domain above to generate scores.';
    card.appendChild(resultDiv);

    // ── Tzeng interpretation ──
    var tzengDiv = document.createElement('div');
    tzengDiv.id = 'cdr-tzeng-div';
    tzengDiv.className = 'text-center text-muted mb-3';
    card.appendChild(tzengDiv);

    // ── CDR-SB classification reference ──
    var classCard = document.createElement('div');
    classCard.className = 'card mt-3';
    classCard.innerHTML =
      '<div class="card-header"><strong>CDR Sum of Boxes Classification</strong> <small class="text-muted">(Bryant et al 2012)</small></div>' +
      '<div class="card-body p-0">' +
        '<table class="table table-bordered table-sm mb-0">' +
          '<thead><tr><th>CDR-SB Range</th><th>Classification</th></tr></thead>' +
          '<tbody>' +
            '<tr><td>0</td><td>Normal cognition</td></tr>' +
            '<tr><td>0.5 \u2013 2.5</td><td>Questionable / mild cognitive impairment</td></tr>' +
            '<tr><td>2.5 \u2013 4.0</td><td>Very mild dementia</td></tr>' +
            '<tr><td>4.0 \u2013 9.0</td><td>Mild dementia</td></tr>' +
            '<tr><td>9.0 \u2013 15.5</td><td>Moderate dementia</td></tr>' +
            '<tr><td>16.0 \u2013 18.0</td><td>Severe dementia</td></tr>' +
          '</tbody>' +
        '</table>' +
      '</div>';
    card.appendChild(classCard);

    container.appendChild(card);
    bindScoringEvents(table);
    restoreScoringState(table);
  }

  function bindScoringEvents(table) {
    table.addEventListener('click', function (e) {
      var cell = e.target.closest('.cdr-score-cell');
      if (!cell) return;
      selectCell(cell, table);
    });
    table.addEventListener('keydown', function (e) {
      var cell = e.target.closest('.cdr-score-cell');
      if (!cell) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCell(cell, table); }
    });
  }

  function selectCell(cell, table) {
    var domainKey = cell.getAttribute('data-domain');
    var score = parseFloat(cell.getAttribute('data-score'));
    var row = cell.closest('tr');
    var cells = row.querySelectorAll('.cdr-score-cell');
    for (var i = 0; i < cells.length; i++) {
      cells[i].classList.remove('selected');
      cells[i].setAttribute('aria-checked', 'false');
    }
    cell.classList.add('selected');
    cell.setAttribute('aria-checked', 'true');
    S.set(SP + '.' + domainKey, score);
    recalc();
  }

  function restoreScoringState(table) {
    for (var d = 0; d < DOMAINS.length; d++) {
      var val = S.get(SP + '.' + DOMAINS[d].key);
      if (val !== undefined && val !== null && val !== '') {
        var cell = table.querySelector('.cdr-score-cell[data-domain="' + DOMAINS[d].key + '"][data-score="' + val + '"]');
        if (cell) { cell.classList.add('selected'); cell.setAttribute('aria-checked', 'true'); }
      }
    }
    recalc();
  }

  /* ═══════════════════════════════════════
     CDR TOTAL ALGORITHM
     Exact from user's cdr_calculator.html
     (Washington University, Morris algorithm)
     ═══════════════════════════════════════ */
  function calculateCDR(scores) {
    var memory = scores[0];
    var CDR = 0, EQ_MEM = 0, GT_MEM = 0, LT_MEM = 0;
    var BOX_EQ_0 = 0, BOX_EQ_5 = 0, BOX_EQ_1 = 0, BOX_EQ_2 = 0, BOX_EQ_3 = 0;
    var MAXCOUNT = 0, BOX_GE_1 = 0, BOX_GE_5 = 0;

    for (var i = 1; i < scores.length; i++) {
      if (scores[i] > memory) GT_MEM++;
      if (scores[i] === memory) EQ_MEM++;
      if (scores[i] < memory) LT_MEM++;
      if (scores[i] === 0) BOX_EQ_0++;
      if (scores[i] === 0.5) BOX_EQ_5++;
      if (scores[i] === 1) BOX_EQ_1++;
      if (scores[i] === 2) BOX_EQ_2++;
      if (scores[i] === 3) BOX_EQ_3++;
    }

    if (EQ_MEM >= 3) {
      CDR = memory;
    } else if (GT_MEM + LT_MEM >= 3) {
      if (Math.abs(GT_MEM - LT_MEM) > 1) {
        MAXCOUNT = 0;
        if (BOX_EQ_0 >= MAXCOUNT && memory !== 0) { CDR = 0; MAXCOUNT = BOX_EQ_0; }
        if (BOX_EQ_5 >= MAXCOUNT && memory !== 0.5) { CDR = 0.5; MAXCOUNT = BOX_EQ_5; }
        if (BOX_EQ_1 >= MAXCOUNT && memory !== 1) { CDR = 1; MAXCOUNT = BOX_EQ_1; }
        if (BOX_EQ_2 >= MAXCOUNT && memory !== 2) { CDR = 2; MAXCOUNT = BOX_EQ_2; }
        if (BOX_EQ_3 >= MAXCOUNT && memory !== 3) { CDR = 3; MAXCOUNT = BOX_EQ_3; }
      }
    }

    if ((GT_MEM === 3 && LT_MEM === 2) || (GT_MEM === 2 && LT_MEM === 3)) { CDR = memory; }

    if (memory === 0.5) {
      BOX_GE_1 = 0;
      for (var j = 0; j < scores.length; j++) { if (scores[j] >= 1) BOX_GE_1++; }
      CDR = (BOX_GE_1 >= 3) ? 1 : 0.5;
    }

    if (memory === 0) {
      BOX_GE_5 = 0;
      for (var k = 0; k < scores.length; k++) { if (scores[k] >= 0.5) BOX_GE_5++; }
      CDR = (BOX_GE_5 >= 2) ? 0.5 : 0;
    }

    if ((GT_MEM === 4 || LT_MEM === 4) &&
      ((BOX_EQ_0===2&&BOX_EQ_5===2)||(BOX_EQ_0===2&&BOX_EQ_1===2)||(BOX_EQ_0===2&&BOX_EQ_2===2)||
       (BOX_EQ_0===2&&BOX_EQ_3===2)||(BOX_EQ_5===2&&BOX_EQ_1===2)||(BOX_EQ_5===2&&BOX_EQ_2===2)||
       (BOX_EQ_5===2&&BOX_EQ_3===2)||(BOX_EQ_1===2&&BOX_EQ_2===2)||(BOX_EQ_1===2&&BOX_EQ_3===2)||
       (BOX_EQ_2===2&&BOX_EQ_3===2))) {
      if (memory===0&&BOX_EQ_5===2) CDR=0.5;
      else if (memory===0&&BOX_EQ_1===2&&(BOX_EQ_2===2||BOX_EQ_3===2)) CDR=1;
      else if (memory===0&&BOX_EQ_2===2&&BOX_EQ_3===2) CDR=2;
      else if (memory===0.5&&BOX_EQ_1===2&&(BOX_EQ_2===2||BOX_EQ_3===2)) CDR=1;
      else if (memory===0.5&&BOX_EQ_2===2&&BOX_EQ_3===2) CDR=2;
      else if (memory===1&&BOX_EQ_2===2&&BOX_EQ_3===2) CDR=2;
      else if (memory===1&&BOX_EQ_0===2&&BOX_EQ_5===2) CDR=0.5;
      else if (memory===2&&BOX_EQ_1===2&&(BOX_EQ_5===2||BOX_EQ_0===2)) CDR=1;
      else if (memory===2&&BOX_EQ_1===2&&BOX_EQ_5===2) CDR=1;
      else if (memory===3&&BOX_EQ_2===2&&(BOX_EQ_1===2||BOX_EQ_5===2||BOX_EQ_0===2)) CDR=2;
      else if (memory===3&&BOX_EQ_1===2&&(BOX_EQ_5===2||BOX_EQ_0===2)) CDR=1;
      else if (memory===3&&BOX_EQ_5===2&&BOX_EQ_0===2) CDR=0.5;
    }

    if (EQ_MEM===1||EQ_MEM===2) { if (GT_MEM<=2&&LT_MEM<=2) { CDR=memory; } }
    if (memory>=1&&CDR===0) { CDR=0.5; }
    return CDR;
  }

  function classifyCDRSB(sb) {
    if (sb===0) return 'normal cognition';
    if (sb>=0.5&&sb<=2.5) return 'questionable/mild cognitive impairment';
    if (sb>2.5&&sb<=4.0) return 'very mild dementia';
    if (sb>4.0&&sb<=9.0) return 'mild dementia';
    if (sb>9.0&&sb<=15.5) return 'moderate dementia';
    if (sb>=16.0&&sb<=18.0) return 'severe dementia';
    return 'Unknown';
  }

  function interpretationText(x) {
    var t='Compared to a CDR-SB score of 0, the hazard ratio (HR) for progression to CDRt >=1 within 5 years is: ';
    var a=[1.51,1.91,2.58,2.13,3.46,3.85,3.19,5.12,5.22];
    if(x===0.5)return t+a[0];if(x===1)return t+a[1];if(x===1.5)return t+a[2];
    if(x===2)return t+a[3];if(x===2.5)return t+a[4];if(x===3)return t+a[5];
    if(x===3.5)return t+a[6];if(x===4)return t+a[7];if(x>=4.5)return t+a[8];
    return '';
  }

  /* ═══════════════════════════════════════
     RECALC + DISPLAY UPDATE
     ═══════════════════════════════════════ */
  function recalc() {
    var domainKeys = ['memory','orientation','judgment','community','homeHobbies','personalCare'];
    var scores = [], allAnswered = true;
    for (var i=0;i<domainKeys.length;i++) {
      var val = S.get(SP+'.'+domainKeys[i]);
      if (val!==undefined&&val!==null&&val!=='') { scores.push(parseFloat(val)); }
      else { scores.push(null); allAnswered=false; }
    }
    if (allAnswered) {
      var CDRt = calculateCDR(scores);
      var CDRsb = 0;
      for (var j=0;j<scores.length;j++) CDRsb+=scores[j];
      var severity = classifyCDRSB(CDRsb);
      S.setScore('cdr',{total:CDRt,sumOfBoxes:CDRsb,severity:severity,domainScores:{
        memory:scores[0],orientation:scores[1],judgment:scores[2],
        community:scores[3],homeHobbies:scores[4],personalCare:scores[5]
      }});
      updateScoringDisplay();
    } else {
      S.setScore('cdr',{total:null,sumOfBoxes:null,severity:null,domainScores:null});
      updateScoringDisplay();
    }
    if (BHM.Scoring&&BHM.Scoring.triggerReport) BHM.Scoring.triggerReport();
    else if (BHM.Report&&BHM.Report.update) BHM.Report.update();
  }

  function updateScoringDisplay() {
    var cdrScore = S.getScore('cdr');
    var domainKeys = ['memory','orientation','judgment','community','homeHobbies','personalCare'];
    for (var i=0;i<domainKeys.length;i++) {
      var val = S.get(SP+'.'+domainKeys[i]);
      updateEl('cdr-box-'+domainKeys[i], val!==undefined&&val!==null?val:'--');
    }
    if (cdrScore&&cdrScore.total!==null) {
      var CDRt=cdrScore.total, CDRsb=cdrScore.sumOfBoxes, severity=cdrScore.severity;
      updateEl('cdr-box-sob',CDRsb);
      var rd=document.getElementById('cdr-result-div');
      if(rd){rd.className='alert alert-success text-center fs-5';
        rd.innerHTML='<strong>Total CDR score = '+CDRt+'</strong> and <strong>sum of boxes = '+CDRsb+'</strong>, indicating <em>'+severity+'</em>';}
      var st=document.getElementById('cdr-score-table');
      if(st){var row=st.rows[0];var ps=[0,0.5,1,2,3];var idx=ps.indexOf(CDRt);
        for(var j=0;j<row.cells.length;j++)row.cells[j].style.backgroundColor='';
        if(idx>=0)row.cells[idx+1].style.backgroundColor='#daf1ee';}
      var tz=document.getElementById('cdr-tzeng-div');
      if(tz){if(CDRt===0.5){tz.innerHTML=interpretationText(CDRsb)+' <a target="_blank" href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9537043/">Tzeng et al 2022</a>';}else{tz.innerHTML='';}}
    } else {
      updateEl('cdr-box-sob','--');
      var rd2=document.getElementById('cdr-result-div');
      if(rd2){rd2.className='alert alert-info text-center fs-5';rd2.textContent='Rate each domain above to generate scores.';}
      var st2=document.getElementById('cdr-score-table');
      if(st2){var r2=st2.rows[0];for(var k=0;k<r2.cells.length;k++)r2.cells[k].style.backgroundColor='';}
      var tz2=document.getElementById('cdr-tzeng-div');if(tz2)tz2.innerHTML='';
    }
  }

  /* ═══════════════════════════════════════
     SHARED HELPERS
     ═══════════════════════════════════════ */
  function updateEl(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }
  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  return {
    renderAssessment: renderAssessment,
    renderScoring: renderScoring,
    calculateCDR: calculateCDR,
    classifyCDRSB: classifyCDRSB,
    recalc: recalc,
    DOMAINS: DOMAINS
  };
})();
