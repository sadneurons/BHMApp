/* ═══════════════════════════════════════════════════════
   BHM.Instruments.PSQI — Pittsburgh Sleep Quality Index
   ═══════════════════════════════════════════════════════
   Layout mirrors the paper booklet exactly:
   - Q1-4 as free-text fields
   - Q5a-j, Q6, Q7 in ONE unified frequency table
   - Q8 separate (problem scale)
   - Q9 separate (quality scale)
   - Q10 separate (partner status)
   - Partner items in own frequency table
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};
BHM.Instruments = BHM.Instruments || {};

BHM.Instruments.PSQI = (function () {
  'use strict';

  var SP = 'instruments.psqi';
  var F = BHM.ClickableGrid;

  // Frequency columns — exact wording from booklet
  var FREQ_COLS = [
    'Not during the past month',
    'Less than once a week',
    'Once or twice a week',
    'Three or more times a week'
  ];
  var FREQ_VALS = [0, 1, 2, 3];

  // Q5 items + Q6 + Q7 — all share the same frequency table in the booklet
  var FREQ_TABLE_ROWS = [
    { key: 'q5a', label: 'a. Cannot get to sleep within 30 minutes', isSubItem: true },
    { key: 'q5b', label: 'b. Wake up in the middle of the night or early morning', isSubItem: true },
    { key: 'q5c', label: 'c. Have to get up to use the bathroom', isSubItem: true },
    { key: 'q5d', label: 'd. Cannot breathe comfortably', isSubItem: true },
    { key: 'q5e', label: 'e. Cough or snore loudly', isSubItem: true },
    { key: 'q5f', label: 'f. Feel too cold', isSubItem: true },
    { key: 'q5g', label: 'g. Feel too hot', isSubItem: true },
    { key: 'q5h', label: 'h. Have bad dreams', isSubItem: true },
    { key: 'q5i', label: 'i. Have pain', isSubItem: true },
    { key: 'q5j', label: 'j. Other reason(s), please describe:', isSubItem: true },
    { key: 'q6_medication', label: '6. During the past month, how often have you taken medicine to help you sleep (prescribed or \u201cover the counter\u201d)?', isSubItem: false },
    { key: 'q7_drowsiness', label: '7. During the past month, how often have you had trouble staying awake while driving, eating meals, or engaging in social activity?', isSubItem: false }
  ];

  // Partner-reported items — exact wording from booklet
  var PARTNER_ITEMS = [
    { key: 'q10a', label: 'a. Loud snoring' },
    { key: 'q10b', label: 'b. Long pauses between breaths while asleep' },
    { key: 'q10c', label: 'c. Legs twitching or jerking while you sleep' },
    { key: 'q10d', label: 'd. Episodes of disorientation or confusion during sleep' },
    { key: 'q10e', label: 'e. Other restlessness while you sleep, please describe:' }
  ];

  function render(container) {
    container.innerHTML = '';

    var card = document.createElement('div');
    card.className = 'instrument-card';

    // ── Title & instructions — exact booklet wording ──
    card.innerHTML =
      '<h5>Pittsburgh Sleep Quality Index (PSQI)</h5>' +
      '<p class="instrument-subtitle">' +
        '<strong>Instructions:</strong> The following questions relate to your usual sleep habits during the past month only. ' +
        'Your answers should indicate the most accurate reply for the majority of days and nights in the past month. ' +
        'Please answer all questions.' +
      '</p>';

    // Score summary
    var summary = document.createElement('div');
    summary.className = 'score-summary';
    summary.id = 'psqi-score-summary';
    summary.innerHTML = '<span class="score-label">Global PSQI Score:</span>' +
      '<span class="score-value" id="psqi-total">--</span>' +
      '<span class="score-interp" id="psqi-interp">Complete all required items to calculate</span>';
    card.appendChild(summary);

    // ── Q1: Bedtime ──
    var q1 = document.createElement('div');
    q1.className = 'row g-3 mb-3';
    q1.appendChild(wrapCol(F.createField({
      label: '1. During the past month, what time have you usually gone to bed at night?',
      statePath: SP + '.q1_bedtime',
      placeholder: 'e.g. 22:30 or 10:30pm',
      helpText: 'Usual bedtime',
      onChange: recalc
    }), 'col-md-6'));
    card.appendChild(q1);

    // ── Q2: Sleep latency ──
    var q2 = document.createElement('div');
    q2.className = 'row g-3 mb-3';
    q2.appendChild(wrapCol(F.createField({
      label: '2. During the past month, how long (in minutes) has it usually taken you to fall asleep each night?',
      statePath: SP + '.q2_latency_min',
      placeholder: 'Minutes (e.g. 20 or 15-30)',
      helpText: 'If a range, the midpoint will be used for scoring',
      onChange: recalc
    }), 'col-md-6'));
    card.appendChild(q2);

    // ── Q3: Wake time ──
    var q3 = document.createElement('div');
    q3.className = 'row g-3 mb-3';
    q3.appendChild(wrapCol(F.createField({
      label: '3. During the past month, what time have you usually gotten up in the morning?',
      statePath: SP + '.q3_waketime',
      placeholder: 'e.g. 07:00 or 7am',
      onChange: recalc
    }), 'col-md-6'));
    card.appendChild(q3);

    // ── Q4: Hours of sleep — exact wording: "different than" ──
    var q4 = document.createElement('div');
    q4.className = 'row g-3 mb-3';
    q4.appendChild(wrapCol(F.createField({
      label: '4. During the past month, how many hours of actual sleep did you get at night? (This may be different than the number of hours you spent in bed.)',
      statePath: SP + '.q4_sleep_hours',
      type: 'number',
      min: 0,
      max: 24,
      step: 0.5,
      placeholder: 'Hours',
      onChange: recalc
    }), 'col-md-6'));
    card.appendChild(q4);

    // ── Q5 intro + unified frequency table (Q5a-j, Q6, Q7) ──
    // This mirrors the paper form: one table with shared frequency columns
    var q5Header = document.createElement('div');
    q5Header.className = 'mb-2 mt-3';
    q5Header.innerHTML = '<strong>5. During the past month, how often have you had trouble sleeping because you\u2026</strong>';
    card.appendChild(q5Header);

    var freqGrid = F.create({
      id: 'psqi-freq-grid',
      statePath: SP,
      columns: FREQ_COLS,
      values: FREQ_VALS,
      rows: FREQ_TABLE_ROWS,
      onChange: recalc
    });
    card.appendChild(freqGrid);

    // Q5j other reason text
    var q5jText = F.createField({
      label: '',
      statePath: SP + '.q5j_text',
      type: 'textarea',
      rows: 2,
      placeholder: 'Describe other reason(s) for sleep trouble'
    });
    q5jText.classList.add('mt-2');
    card.appendChild(q5jText);

    // ── Q8: Enthusiasm problem — own column headers ──
    var q8Header = document.createElement('div');
    q8Header.className = 'mb-2 mt-4';
    q8Header.innerHTML = '<strong>8. During the past month, how much of a problem has it been for you to keep up enough enthusiasm to get things done?</strong>';
    card.appendChild(q8Header);
    var q8Grid = F.create({
      id: 'psqi-q8-grid',
      statePath: SP,
      columns: ['No problem at all', 'Only a very slight problem', 'Somewhat of a problem', 'A very big problem'],
      values: [0, 1, 2, 3],
      rows: [{ key: 'q8_enthusiasm', label: 'Enthusiasm to get things done' }],
      onChange: recalc
    });
    card.appendChild(q8Grid);

    // ── Q9: Overall sleep quality — own column headers ──
    var q9Header = document.createElement('div');
    q9Header.className = 'mb-2 mt-4';
    q9Header.innerHTML = '<strong>9. During the past month, how would you rate your sleep quality overall?</strong>';
    card.appendChild(q9Header);
    var q9Grid = F.create({
      id: 'psqi-q9-grid',
      statePath: SP,
      columns: ['Very good', 'Fairly good', 'Fairly bad', 'Very bad'],
      values: [0, 1, 2, 3],
      rows: [{ key: 'q9_quality', label: 'Overall sleep quality' }],
      onChange: recalc
    });
    card.appendChild(q9Grid);

    // ── Page break hint (matches booklet page 2) ──
    var pageBreak = document.createElement('hr');
    pageBreak.className = 'my-4';
    card.appendChild(pageBreak);

    // ── Q10: Bed partner — exact column wording from booklet ──
    var q10Header = document.createElement('div');
    q10Header.className = 'mb-2';
    q10Header.innerHTML = '<strong>10. Do you have a bed partner or room mate?</strong>';
    card.appendChild(q10Header);
    var q10Grid = F.create({
      id: 'psqi-q10-grid',
      statePath: SP,
      columns: [
        'No bed partner or room mate',
        'Partner/room mate in other room',
        'Partner in same room but not same bed',
        'Partner in same bed'
      ],
      values: [0, 1, 2, 3],
      rows: [{ key: 'q10_partner', label: 'Bed partner or room mate' }],
      onChange: function (key, val) {
        togglePartnerSection(val);
        recalc();
      }
    });
    card.appendChild(q10Grid);

    // ── Partner-reported items (conditional) ──
    var partnerSection = document.createElement('div');
    partnerSection.className = 'conditional-section mt-3';
    partnerSection.id = 'psqi-partner-section';
    partnerSection.style.display = 'none';
    partnerSection.innerHTML =
      '<p class="text-muted mb-2">If you have a room mate or bed partner, ask him/her how often in the past month you have had:</p>';

    var partnerGrid = F.create({
      id: 'psqi-partner-grid',
      statePath: SP,
      columns: FREQ_COLS,
      values: FREQ_VALS,
      rows: PARTNER_ITEMS,
      onChange: recalc
    });
    partnerSection.appendChild(partnerGrid);

    // Partner item e describe text
    var q10eText = F.createField({
      label: '',
      statePath: SP + '.q10e_text',
      type: 'textarea',
      rows: 2,
      placeholder: 'Describe other restlessness'
    });
    q10eText.classList.add('mt-2');
    partnerSection.appendChild(q10eText);

    card.appendChild(partnerSection);

    // Restore partner section visibility
    var partnerVal = BHM.State.get(SP + '.q10_partner');
    if (partnerVal !== undefined && partnerVal > 0) {
      togglePartnerSection(partnerVal);
    }

    // ── Name / Date fields (as on booklet page) ──
    var nameDate = document.createElement('div');
    nameDate.className = 'row g-3 mt-4 pt-3 border-top';
    nameDate.appendChild(wrapCol(F.createField({
      label: 'Name:',
      statePath: 'patient.name',
      placeholder: ''
    }), 'col-md-6'));
    nameDate.appendChild(wrapCol(F.createField({
      label: 'Date:',
      statePath: 'patient.dateOfCompletion',
      type: 'date'
    }), 'col-md-6'));
    card.appendChild(nameDate);

    // Completeness
    var allKeys = ['q1_bedtime', 'q2_latency_min', 'q3_waketime', 'q4_sleep_hours',
      'q5a', 'q5b', 'q5c', 'q5d', 'q5e', 'q5f', 'q5g', 'q5h', 'q5i',
      'q6_medication', 'q7_drowsiness', 'q8_enthusiasm', 'q9_quality', 'q10_partner'];
    card.appendChild(F.completenessBar(SP, allKeys));

    container.appendChild(card);
    recalc();
  }

  function togglePartnerSection(val) {
    var sec = document.getElementById('psqi-partner-section');
    if (sec) sec.style.display = (val > 0) ? 'block' : 'none';
  }

  function recalc() {
    if (BHM.Scoring && BHM.Scoring.psqi) {
      BHM.Scoring.psqi();
    }
  }

  function wrapCol(el, colClass) {
    var col = document.createElement('div');
    col.className = colClass;
    col.appendChild(el);
    return col;
  }

  return { render: render };
})();
