/* ═══════════════════════════════════════════════════════
   BHM.Instruments.GAD7 — Anxiety (GAD-7)
   Exact wording from Pre-Assessment Booklet page 4.
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};
BHM.Instruments = BHM.Instruments || {};

BHM.Instruments.GAD7 = (function () {
  'use strict';

  var SP = 'instruments.gad7';
  var F = BHM.ClickableGrid;

  // Items — exact wording from booklet (note commas)
  var ITEMS = [
    { key: 'g1', label: '1. Feeling nervous, anxious, or on edge' },
    { key: 'g2', label: '2. Not being able to stop or control worrying' },
    { key: 'g3', label: '3. Worrying too much about different things' },
    { key: 'g4', label: '4. Trouble relaxing' },
    { key: 'g5', label: '5. Being so restless that it is hard to sit still' },
    { key: 'g6', label: '6. Becoming easily annoyed or irritable' },
    { key: 'g7', label: '7. Feeling afraid, as if something awful might happen' }
  ];

  // Column headers — exact from booklet (no score numbers in headers)
  var COLS = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'];
  var VALS = [0, 1, 2, 3];

  function render(container) {
    container.innerHTML = '';

    var card = document.createElement('div');
    card.className = 'instrument-card';

    // Title — booklet just says "Anxiety"
    card.innerHTML =
      '<h5>Anxiety</h5>' +
      '<p style="font-size:0.85rem; color:#6c757d; margin-bottom:0.5rem;">' +
        'Column totals _____ + _____ + _____ + _____ = Total score _______' +
      '</p>';

    // Score summary
    var summary = document.createElement('div');
    summary.className = 'score-summary';
    summary.innerHTML = '<span class="score-label">GAD-7 Score:</span>' +
      '<span class="score-value" id="gad7-total">--</span>' +
      '<span class="score-interp" id="gad7-interp">out of 21</span>';
    card.appendChild(summary);

    // Instruction — exact from booklet
    var instrDiv = document.createElement('div');
    instrDiv.className = 'mb-2';
    instrDiv.innerHTML = '<strong>Over the last two weeks, how often have you been bothered by the following problems?</strong>';
    card.appendChild(instrDiv);

    var grid = F.create({
      id: 'gad7-grid',
      statePath: SP,
      columns: COLS,
      values: VALS,
      rows: ITEMS,
      onChange: recalc
    });
    card.appendChild(grid);

    // Impairment question — exact wording from booklet
    var impDiv = document.createElement('div');
    impDiv.className = 'mt-3';
    impDiv.innerHTML =
      '<strong>If you checked any problems, how difficult have they made it for you to do your work, take care of things at home, or get along with other people?</strong>';
    var impGrid = F.create({
      id: 'gad7-impairment-grid',
      statePath: SP,
      columns: ['Not difficult at all', 'Somewhat difficult', 'Very difficult', 'Extremely difficult'],
      values: ['not_difficult', 'somewhat', 'very', 'extremely'],
      rows: [{ key: 'impairment', label: 'Difficulty level' }],
      onChange: recalc
    });
    impDiv.appendChild(impGrid);
    card.appendChild(impDiv);

    var keys = ITEMS.map(function (i) { return i.key; });
    card.appendChild(F.completenessBar(SP, keys));

    container.appendChild(card);
    recalc();
  }

  function recalc() {
    if (BHM.Scoring && BHM.Scoring.gad7) BHM.Scoring.gad7();
  }

  return { render: render };
})();
