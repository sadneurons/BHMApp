/* ═══════════════════════════════════════════════════════
   BHM.Instruments.Hearing — Your ears and hearing
   Exact wording from Pre-Assessment Booklet pages 8-10.
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};
BHM.Instruments = BHM.Instruments || {};

BHM.Instruments.Hearing = (function () {
  'use strict';

  var SP = 'instruments.hearing';
  var F = BHM.ClickableGrid;

  // Yes/No items — exact question wording from booklet
  var YN_ITEMS = [
    { key: 'suddenChange', label: 'Have you had any sudden or rapid changes in your hearing (within 90 days)?' },
    { key: 'fluctuation',  label: 'Does your hearing change on different days?' },
    { key: 'pain',         label: 'Do you get pain in your ears?' },
    { key: 'discharge',    label: 'Do you get any infections or discharge from your ears (not including wax)?' },
    { key: 'operations',   label: 'Have you had any ear-related operations?' },
    { key: 'perforation',  label: 'Have you ever had a perforated eardrum?' },
    { key: 'tinnitus',     label: 'Do you hear any rushing, hissing, ringing, beating, pulsing or any other noises in your ears, often called tinnitus?' },
    { key: 'hyperacusis',  label: 'Do you have a strong sensitivity to everyday loud sounds that do not bother other people?' }
  ];

  // Hearing difficulties situations — exact wording from booklet page 9
  var SITUATIONS = [
    { key: 'hs1',  label: '1. One to one conversation in quiet.' },
    { key: 'hs2',  label: '2. One to one conversation in noise.' },
    { key: 'hs3',  label: '3. Conversations in a group with no background noise.' },
    { key: 'hs4',  label: '4. Conversation in a group with background noise.' },
    { key: 'hs5',  label: '5. Hearing the television or radio at normal volume.' },
    { key: 'hs6',  label: '6. Hearing a familiar speaker on the telephone.' },
    { key: 'hs7',  label: '7. Hearing an unfamiliar speaker on the telephone.' },
    { key: 'hs8',  label: '8. Hearing the phone ring from another room.' },
    { key: 'hs9',  label: '9. Hearing the doorbell or knocker.' },
    { key: 'hs10', label: '10. Hearing in church or in a meeting' },
    { key: 'hs11', label: '11. Hearing traffic.' },
    { key: 'hs12', label: '12. Hearing the fire alarm.' },
    { key: 'hs13', label: '13. Decreased social contact.' },
    { key: 'hs14', label: '14. Feeling embarrassed or stupid.' },
    { key: 'hs15', label: '15. Feeling left out.' },
    { key: 'hs16', label: '16. Feeling upset or angry.' },
    { key: 'hs17', label: '17. Other:' }
  ];

  function render(container) {
    container.innerHTML = '';

    var card = document.createElement('div');
    card.className = 'instrument-card';

    // ═══ PAGE 1: Your ears and hearing ═══
    // Title — exact from booklet
    card.innerHTML = '<h5>Your ears and hearing</h5>';

    // Opening questions
    var q1 = document.createElement('div');
    q1.className = 'row g-3 mb-3';
    q1.appendChild(wrapCol(F.createField({
      label: 'How long have you had a problem with your hearing?',
      statePath: SP + '.duration',
      placeholder: ''
    }), 'col-md-6'));
    q1.appendChild(wrapCol(F.createField({
      label: 'Which ear(s) does your hearing problem affect?',
      statePath: SP + '.earAffected',
      placeholder: ''
    }), 'col-md-6'));
    card.appendChild(q1);

    // Instruction
    var instrDiv = document.createElement('div');
    instrDiv.className = 'mb-3';
    instrDiv.innerHTML = '<p style="font-size:0.88rem;">Please click \u2018Yes\u2019 or \u2018No\u2019 for each question.</p>';
    card.appendChild(instrDiv);

    // Yes/No items — exact question wording
    for (var i = 0; i < YN_ITEMS.length; i++) {
      var item = YN_ITEMS[i];
      var row = document.createElement('div');
      row.className = 'd-flex align-items-center justify-content-between py-2 border-bottom';
      var lbl = document.createElement('span');
      lbl.className = 'me-3';
      lbl.style.fontSize = '0.88rem';
      lbl.textContent = item.label;
      row.appendChild(lbl);
      row.appendChild(F.createYesNo({
        statePath: SP + '.' + item.key,
        onChange: recalc
      }));
      card.appendChild(row);
    }

    // "If you have answered 'Yes'..." — exact from booklet
    card.appendChild(F.createField({
      label: 'If you have answered \u2018Yes\u2019 to any of these please give more information:',
      statePath: SP + '.yesDetails',
      type: 'textarea',
      rows: 2,
      placeholder: ''
    }));

    // Follow-up questions — exact wording from booklet
    var fuSection = document.createElement('div');
    fuSection.className = 'mt-3';

    fuSection.appendChild(F.createField({
      label: 'Have you ever seen an Ear, Nose and Throat specialist for ear, hearing or dizziness problems?',
      statePath: SP + '.entSeen',
      type: 'select',
      options: ['', 'Yes', 'No']
    }));

    fuSection.appendChild(F.createField({
      label: 'If yes, what was the outcome of this appointment?',
      statePath: SP + '.entOutcome',
      type: 'textarea',
      rows: 2,
      placeholder: ''
    }));

    fuSection.appendChild(F.createField({
      label: 'Do you wear hearing aids?',
      statePath: SP + '.hearingAids',
      type: 'select',
      options: ['', 'Yes', 'No']
    }));

    fuSection.appendChild(F.createField({
      label: 'If yes, do you experience any problems with your hearing aids?',
      statePath: SP + '.hearingAidProblems',
      type: 'textarea',
      rows: 2,
      placeholder: ''
    }));

    fuSection.appendChild(F.createField({
      label: 'If no, would you want to hearing aids if they may help you to hear better?',
      statePath: SP + '.wantHearingAids',
      type: 'select',
      options: ['', 'Yes', 'No', 'Not sure']
    }));

    card.appendChild(fuSection);

    // ═══ PAGE 2: Hearing difficulties ═══
    var page2 = document.createElement('div');
    page2.className = 'mt-4 pt-3 border-top';
    page2.innerHTML =
      '<h5>Hearing difficulties</h5>' +
      '<p style="font-size:0.88rem;">' +
        'Please click the boxes to select any the situations in which you may find that your hearing ' +
        'affects you. If you feel no situations apply please leave this section blank.' +
      '</p>';

    // Situations as a checklist (tick boxes — matching booklet format)
    for (var s = 0; s < SITUATIONS.length; s++) {
      var sit = SITUATIONS[s];
      var sitRow = document.createElement('div');
      sitRow.className = 'd-flex align-items-center py-1';

      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'form-check-input me-2';
      cb.id = 'hearing-sit-' + sit.key;
      cb.style.minWidth = '20px';
      cb.style.minHeight = '20px';

      // Restore from state
      var currentVal = BHM.State.get(SP + '.' + sit.key);
      if (currentVal === 'yes') cb.checked = true;

      cb.addEventListener('change', (function (key) {
        return function () {
          BHM.State.set(SP + '.' + key, this.checked ? 'yes' : 'no');
          recalc();
        };
      })(sit.key));

      var sitLabel = document.createElement('label');
      sitLabel.className = 'form-check-label';
      sitLabel.htmlFor = 'hearing-sit-' + sit.key;
      sitLabel.style.fontSize = '0.88rem';
      sitLabel.textContent = sit.label;

      sitRow.appendChild(cb);
      sitRow.appendChild(sitLabel);
      page2.appendChild(sitRow);
    }

    // Other specify text
    page2.appendChild(F.createField({
      label: '',
      statePath: SP + '.hs17_text',
      placeholder: 'Please specify other situation',
    }));

    // Top 3 — exact wording from booklet
    var top3 = document.createElement('div');
    top3.className = 'mt-3';
    top3.innerHTML =
      '<p style="font-size:0.88rem; font-weight:500;">' +
        'Of the situations you ticked, which 3 are most affected by your hearing?<br>' +
        'Please enter the numbers that apply here.' +
      '</p>';

    var top3Row = document.createElement('div');
    top3Row.className = 'row g-2';
    for (var t = 1; t <= 3; t++) {
      top3Row.appendChild(wrapCol(F.createField({
        label: '',
        statePath: SP + '.top' + t,
        placeholder: '#',
        type: 'number',
        min: 1,
        max: 17
      }), 'col-4'));
    }
    top3.appendChild(top3Row);
    page2.appendChild(top3);

    card.appendChild(page2);

    // Score summary
    var summaryDiv = document.createElement('div');
    summaryDiv.className = 'score-summary mt-3';
    summaryDiv.innerHTML = '<span class="score-label">Affected situations:</span>' +
      '<span class="score-value" id="hearing-count">--</span>' +
      '<span class="score-interp" id="hearing-interp">out of 17</span>';
    card.appendChild(summaryDiv);

    container.appendChild(card);
    recalc();
  }

  function recalc() {
    if (BHM.Scoring && BHM.Scoring.hearing) BHM.Scoring.hearing();
  }

  function wrapCol(el, colClass) {
    var col = document.createElement('div');
    col.className = colClass;
    col.appendChild(el);
    return col;
  }

  function getSituations() { return SITUATIONS; }

  return { render: render, getSituations: getSituations };
})();
