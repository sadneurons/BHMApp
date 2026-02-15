/* ═══════════════════════════════════════════════════════
   BHM.Instruments.AuditTool — AUDIT Alcohol Use Disorders
   Identification Test
   ═══════════════════════════════════════════════════════
   Layout mirrors the paper form exactly: one unified table
   with scoring columns 0–4 across the top.
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};
BHM.Instruments = BHM.Instruments || {};

BHM.Instruments.AuditTool = (function () {
  'use strict';

  var SP = 'instruments.auditTool';
  var F = BHM.ClickableGrid;

  /* ── Question definitions matching the source booklet exactly ──
     Each item: key, label (exact booklet wording),
     options array of { text, score } for each scoring column.
     Q1-8 have 5 options (scores 0-4).
     Q9-10 have 3 options (scores 0, 2, 4). */

  var QUESTIONS = [
    {
      key: 'a1',
      label: 'How often do you have a drink containing alcohol?',
      options: [
        { text: 'Never',           score: 0 },
        { text: 'Monthly or less', score: 1 },
        { text: '2 to 4 times per month', score: 2 },
        { text: '2 to 3 times per week',  score: 3 },
        { text: '4 times or more per week', score: 4 }
      ]
    },
    {
      key: 'a2',
      label: 'How many units of alcohol do you drink on a typical day when you are drinking?',
      options: [
        { text: '0 to 2',    score: 0 },
        { text: '3 to 4',    score: 1 },
        { text: '5 to 6',    score: 2 },
        { text: '7 to 9',    score: 3 },
        { text: '10 or more', score: 4 }
      ]
    },
    {
      key: 'a3',
      label: 'How often have you had 6 or more units if female, or 8 or more if male, on a single occasion in the last year?',
      options: [
        { text: 'Never',            score: 0 },
        { text: 'Less than monthly', score: 1 },
        { text: 'Monthly',          score: 2 },
        { text: 'Weekly',           score: 3 },
        { text: 'Daily or almost daily', score: 4 }
      ]
    },
    {
      key: 'a4',
      label: 'How often during the last year have you found that you were not able to stop drinking once you had started?',
      options: [
        { text: 'Never',            score: 0 },
        { text: 'Less than monthly', score: 1 },
        { text: 'Monthly',          score: 2 },
        { text: 'Weekly',           score: 3 },
        { text: 'Daily or almost daily', score: 4 }
      ]
    },
    {
      key: 'a5',
      label: 'How often during the last year have you failed to do what was normally expected from you because of your drinking?',
      options: [
        { text: 'Never',            score: 0 },
        { text: 'Less than monthly', score: 1 },
        { text: 'Monthly',          score: 2 },
        { text: 'Weekly',           score: 3 },
        { text: 'Daily or almost daily', score: 4 }
      ]
    },
    {
      key: 'a6',
      label: 'How often during the last year have you needed an alcoholic drink in the morning to get yourself going after a heavy drinking session?',
      options: [
        { text: 'Never',            score: 0 },
        { text: 'Less than monthly', score: 1 },
        { text: 'Monthly',          score: 2 },
        { text: 'Weekly',           score: 3 },
        { text: 'Daily or almost daily', score: 4 }
      ]
    },
    {
      key: 'a7',
      label: 'How often during the last year have you had a feeling of guilt or remorse after drinking?',
      options: [
        { text: 'Never',            score: 0 },
        { text: 'Less than monthly', score: 1 },
        { text: 'Monthly',          score: 2 },
        { text: 'Weekly',           score: 3 },
        { text: 'Daily or almost daily', score: 4 }
      ]
    },
    {
      key: 'a8',
      label: 'How often during the last year have you been unable to remember what happened the night before because you had been drinking?',
      options: [
        { text: 'Never',            score: 0 },
        { text: 'Less than monthly', score: 1 },
        { text: 'Monthly',          score: 2 },
        { text: 'Weekly',           score: 3 },
        { text: 'Daily or almost daily', score: 4 }
      ]
    },
    {
      key: 'a9',
      label: 'Have you or somebody else been injured as a result of your drinking?',
      options: [
        { text: 'No',    score: 0 },
        { text: 'Yes, but not in the last year', score: 2 },
        { text: 'Yes, during the last year',     score: 4 }
      ]
    },
    {
      key: 'a10',
      label: 'Has a relative or friend, doctor or other health worker been concerned about your drinking or suggested that you cut down?',
      options: [
        { text: 'No',    score: 0 },
        { text: 'Yes, but not in the last year', score: 2 },
        { text: 'Yes, during the last year',     score: 4 }
      ]
    }
  ];

  function render(container) {
    container.innerHTML = '';

    var card = document.createElement('div');
    card.className = 'instrument-card';

    // ── Title & subtitle matching booklet exactly ──
    card.innerHTML =
      '<h5>Alcohol use disorders identification test (AUDIT)</h5>' +
      '<p class="instrument-subtitle">' +
        'AUDIT is a comprehensive 10 question alcohol harm screening tool. It was developed by the World ' +
        'Health Organisation (WHO) and modified for use in the UK and has been used in a variety of health ' +
        'and social care settings.' +
      '</p>' +
      '<p style="font-size:0.88rem; margin-bottom:1rem;">' +
        'Please circle the box that applies to you in each row:' +
      '</p>';

    // ── Score summary ──
    var summary = document.createElement('div');
    summary.className = 'score-summary';
    summary.innerHTML = '<span class="score-label">AUDIT Score:</span>' +
      '<span class="score-value" id="audit-total">--</span>' +
      '<span class="score-interp" id="audit-interp">out of 40</span>';
    card.appendChild(summary);

    // ── Build one unified table matching the paper form ──
    var tableWrap = document.createElement('div');
    tableWrap.className = 'table-responsive';

    var table = document.createElement('table');
    table.className = 'clickable-grid audit-unified-table';
    table.id = 'audit-grid';
    table.setAttribute('role', 'grid');

    // ── Header row: "Questions | Scoring system 0 | 1 | 2 | 3 | 4 | Your score" ──
    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');

    var thQ = document.createElement('th');
    thQ.textContent = 'Questions';
    thQ.style.minWidth = '280px';
    thQ.style.textAlign = 'left';
    headerRow.appendChild(thQ);

    var scoreHeaders = ['0', '1', '2', '3', '4'];
    for (var h = 0; h < scoreHeaders.length; h++) {
      var th = document.createElement('th');
      th.textContent = scoreHeaders[h];
      th.style.minWidth = '100px';
      headerRow.appendChild(th);
    }

    var thScore = document.createElement('th');
    thScore.textContent = 'Your score';
    thScore.style.minWidth = '70px';
    headerRow.appendChild(thScore);

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // ── Body rows ──
    var tbody = document.createElement('tbody');

    for (var i = 0; i < QUESTIONS.length; i++) {
      var q = QUESTIONS[i];
      var tr = document.createElement('tr');
      tr.setAttribute('role', 'row');

      // Question label cell
      var tdLabel = document.createElement('td');
      tdLabel.className = 'cg-label';
      tdLabel.textContent = q.label;
      tr.appendChild(tdLabel);

      if (q.options.length === 5) {
        // Q1-8: five cells, one per scoring column
        for (var c = 0; c < 5; c++) {
          var td = document.createElement('td');
          td.className = 'cg-cell';
          td.setAttribute('role', 'gridcell');
          td.setAttribute('tabindex', (i === 0 && c === 0) ? '0' : '-1');
          td.dataset.row = q.key;
          td.dataset.col = c;
          td.dataset.value = q.options[c].score;
          td.textContent = q.options[c].text;

          // Restore from state
          var currentVal = BHM.State.get(SP + '.' + q.key);
          if (currentVal !== undefined && currentVal !== null &&
              String(currentVal) === String(q.options[c].score)) {
            td.classList.add('selected');
          }

          td.addEventListener('click', makeCellHandler(q.key, q.options[c].score, tr));
          td.addEventListener('keydown', makeKeyHandler());
          tr.appendChild(td);
        }
      } else {
        // Q9-10: three options spanning the 5 scoring columns
        // Option 1 (score 0): spans column "0"
        var td0 = createMergedCell(q.key, q.options[0], 1, i, tr);
        tr.appendChild(td0);

        // Empty cell for column "1"
        var tdEmpty1 = document.createElement('td');
        tdEmpty1.className = 'audit-empty-cell';
        tdEmpty1.style.background = '#f0f0f0';
        tr.appendChild(tdEmpty1);

        // Option 2 (score 2): spans column "2"
        var td2 = createMergedCell(q.key, q.options[1], 1, i, tr);
        tr.appendChild(td2);

        // Empty cell for column "3"
        var tdEmpty3 = document.createElement('td');
        tdEmpty3.className = 'audit-empty-cell';
        tdEmpty3.style.background = '#f0f0f0';
        tr.appendChild(tdEmpty3);

        // Option 3 (score 4): spans column "4"
        var td4 = createMergedCell(q.key, q.options[2], 1, i, tr);
        tr.appendChild(td4);
      }

      // "Your score" cell — shows the selected score
      var tdYourScore = document.createElement('td');
      tdYourScore.className = 'audit-your-score text-center fw-bold';
      tdYourScore.id = 'audit-row-score-' + q.key;
      tdYourScore.style.fontSize = '0.95rem';
      var rowVal = BHM.State.get(SP + '.' + q.key);
      tdYourScore.textContent = (rowVal !== undefined && rowVal !== null) ? rowVal : '';
      tr.appendChild(tdYourScore);

      tbody.appendChild(tr);
    }

    // ── Total AUDIT score row ──
    var totalRow = document.createElement('tr');
    totalRow.className = 'audit-total-row';
    var tdTotalLabel = document.createElement('td');
    tdTotalLabel.colSpan = 6;
    tdTotalLabel.className = 'text-end fw-bold';
    tdTotalLabel.style.fontSize = '0.95rem';
    tdTotalLabel.textContent = 'Total AUDIT score';
    totalRow.appendChild(tdTotalLabel);
    var tdTotalVal = document.createElement('td');
    tdTotalVal.className = 'text-center fw-bold';
    tdTotalVal.id = 'audit-total-row';
    tdTotalVal.style.fontSize = '1.1rem';
    tdTotalVal.style.background = '#f0f4ff';
    totalRow.appendChild(tdTotalVal);
    tbody.appendChild(totalRow);

    table.appendChild(tbody);
    tableWrap.appendChild(table);
    card.appendChild(tableWrap);

    // Completeness bar
    var allKeys = QUESTIONS.map(function (q) { return q.key; });
    card.appendChild(F.completenessBar(SP, allKeys));

    container.appendChild(card);
    recalc();
  }

  // ── Cell click handler ──
  function makeCellHandler(rowKey, score, tr) {
    return function () {
      // Deselect all option cells in this row
      var cells = tr.querySelectorAll('.cg-cell');
      for (var i = 0; i < cells.length; i++) cells[i].classList.remove('selected');
      this.classList.add('selected');
      this.focus();

      BHM.State.set(SP + '.' + rowKey, score);

      // Update "Your score" cell for this row
      var scoreCell = document.getElementById('audit-row-score-' + rowKey);
      if (scoreCell) scoreCell.textContent = score;

      recalc();
    };
  }

  // ── Merged cell for Q9-10 ──
  function createMergedCell(rowKey, option, colspan, rowIdx, tr) {
    var td = document.createElement('td');
    td.className = 'cg-cell';
    td.setAttribute('role', 'gridcell');
    td.setAttribute('tabindex', '-1');
    if (colspan > 1) td.colSpan = colspan;
    td.dataset.row = rowKey;
    td.dataset.value = option.score;
    td.textContent = option.text;
    td.style.fontSize = '0.78rem';

    // Restore from state
    var currentVal = BHM.State.get(SP + '.' + rowKey);
    if (currentVal !== undefined && currentVal !== null &&
        String(currentVal) === String(option.score)) {
      td.classList.add('selected');
    }

    td.addEventListener('click', makeCellHandler(rowKey, option.score, tr));
    td.addEventListener('keydown', makeKeyHandler());
    return td;
  }

  // ── Keyboard navigation ──
  function makeKeyHandler() {
    return function (e) {
      var td = e.target;
      var table = td.closest('table');
      var allRows = table.querySelectorAll('tbody tr');
      var parentTr = td.closest('tr');
      var rowIdx = Array.prototype.indexOf.call(allRows, parentTr);
      var cells = parentTr.querySelectorAll('.cg-cell');
      var colIdx = Array.prototype.indexOf.call(cells, td);
      var target = null;

      switch (e.key) {
        case 'ArrowRight':
          if (colIdx < cells.length - 1) target = cells[colIdx + 1];
          break;
        case 'ArrowLeft':
          if (colIdx > 0) target = cells[colIdx - 1];
          break;
        case 'ArrowDown':
          if (rowIdx < allRows.length - 1) {
            var nextCells = allRows[rowIdx + 1].querySelectorAll('.cg-cell');
            var nextIdx = Math.min(colIdx, nextCells.length - 1);
            if (nextCells[nextIdx]) target = nextCells[nextIdx];
          }
          break;
        case 'ArrowUp':
          if (rowIdx > 0) {
            var prevCells = allRows[rowIdx - 1].querySelectorAll('.cg-cell');
            var prevIdx = Math.min(colIdx, prevCells.length - 1);
            if (prevCells[prevIdx]) target = prevCells[prevIdx];
          }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          td.click();
          return;
      }

      if (target) {
        e.preventDefault();
        td.setAttribute('tabindex', '-1');
        target.setAttribute('tabindex', '0');
        target.focus();
      }
    };
  }

  function recalc() {
    if (BHM.Scoring && BHM.Scoring.auditTool) BHM.Scoring.auditTool();

    // Update the total row
    var total = 0, answered = 0;
    for (var i = 0; i < QUESTIONS.length; i++) {
      var val = BHM.State.get(SP + '.' + QUESTIONS[i].key);
      if (val !== undefined && val !== null && val !== '') {
        total += Number(val);
        answered++;
      }
    }
    var totalCell = document.getElementById('audit-total-row');
    if (totalCell) {
      totalCell.textContent = answered > 0 ? total : '';
    }
  }

  return { render: render };
})();
