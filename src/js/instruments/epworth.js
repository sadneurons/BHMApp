/* ═══════════════════════════════════════════════════════
   BHM.Instruments.Epworth — Epworth Sleepiness Scale
   ═══════════════════════════════════════════════════════
   Layout mirrors the paper booklet exactly:
   - Full multi-paragraph instruction text
   - Situation table with "Chance of dozing" column
   - Scale key shown above the table
   - Total row at the bottom
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};
BHM.Instruments = BHM.Instruments || {};

BHM.Instruments.Epworth = (function () {
  'use strict';

  var SP = 'instruments.epworth';
  var F = BHM.ClickableGrid;

  // Situation items — exact wording from booklet
  var ITEMS = [
    { key: 'e1', label: 'Sitting and reading' },
    { key: 'e2', label: 'Watching TV' },
    { key: 'e3', label: 'Sitting, inactive in a public place (e.g. a theatre or a meeting)' },
    { key: 'e4', label: 'As a passenger in a car for an hour without a break' },
    { key: 'e5', label: 'Lying down to rest in the afternoon when circumstances permit' },
    { key: 'e6', label: 'Sitting and talking to someone' },
    { key: 'e7', label: 'Sitting quietly after a lunch without alcohol' },
    { key: 'e8', label: 'In a car, while stopped for a few minutes in the traffic' }
  ];

  // Column labels — exact case from booklet scale key
  var COLS = [
    'would never doze (0)',
    'Slight chance of dozing (1)',
    'Moderate chance of dozing (2)',
    'High chance of dozing (3)'
  ];
  var VALS = [0, 1, 2, 3];

  function render(container) {
    container.innerHTML = '';

    var card = document.createElement('div');
    card.className = 'instrument-card';

    // ── Title ──
    card.innerHTML = '<h5>Epworth Sleepiness Scale</h5>';

    // ── Name / Date fields (as on booklet) ──
    var nameDate = document.createElement('div');
    nameDate.className = 'row g-3 mb-3';
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

    // ── Instructions — exact multi-paragraph text from booklet ──
    var instructions = document.createElement('div');
    instructions.className = 'instrument-subtitle';
    instructions.innerHTML =
      '<p>How likely are you to doze off or fall asleep in the situations described below, in contrast to feeling tired?</p>' +
      '<p>This refers to your usual way of life in recent times.</p>' +
      '<p>Even if you haven\u2019t done some of these things recently try to work out how they would have affected you.</p>' +
      '<p class="mb-2">Use the following scale to choose the most appropriate number for each situation:</p>' +
      '<div class="mb-3 ps-3" style="font-size:0.88rem; line-height:1.7;">' +
        '<strong>0</strong> = would never doze<br>' +
        '<strong>1</strong> = Slight chance of dozing<br>' +
        '<strong>2</strong> = Moderate chance of dozing<br>' +
        '<strong>3</strong> = High chance of dozing' +
      '</div>';
    card.appendChild(instructions);

    // Score summary
    var summary = document.createElement('div');
    summary.className = 'score-summary';
    summary.innerHTML = '<span class="score-label">Total:</span>' +
      '<span class="score-value" id="epworth-total">--</span>' +
      '<span class="score-interp" id="epworth-interp">out of 24</span>';
    card.appendChild(summary);

    // ── Build table matching booklet: "Situation | Chance of dozing" ──
    // The booklet has a two-column layout (Situation | Chance of dozing)
    // but since we use clickable cells, we expand "Chance of dozing" into
    // the 4 scale options as clickable columns.
    var tableWrap = document.createElement('div');
    tableWrap.className = 'table-responsive';

    var table = document.createElement('table');
    table.className = 'clickable-grid epworth-table';
    table.id = 'epworth-grid';
    table.setAttribute('role', 'grid');

    // ── Header ──
    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');

    var thSit = document.createElement('th');
    thSit.textContent = 'Situation';
    thSit.style.textAlign = 'left';
    thSit.style.minWidth = '280px';
    headerRow.appendChild(thSit);

    // "Chance of dozing" spans the 4 scale columns
    for (var h = 0; h < COLS.length; h++) {
      var th = document.createElement('th');
      th.textContent = COLS[h];
      th.style.minWidth = '90px';
      headerRow.appendChild(th);
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // ── Body rows ──
    var tbody = document.createElement('tbody');

    for (var i = 0; i < ITEMS.length; i++) {
      var item = ITEMS[i];
      var tr = document.createElement('tr');
      tr.setAttribute('role', 'row');

      var tdLabel = document.createElement('td');
      tdLabel.className = 'cg-label';
      tdLabel.textContent = item.label;
      tr.appendChild(tdLabel);

      for (var c = 0; c < VALS.length; c++) {
        var td = document.createElement('td');
        td.className = 'cg-cell';
        td.setAttribute('role', 'gridcell');
        td.setAttribute('tabindex', (i === 0 && c === 0) ? '0' : '-1');
        td.dataset.row = item.key;
        td.dataset.col = c;
        td.dataset.value = VALS[c];
        td.textContent = String(VALS[c]);

        // Restore from state
        var currentVal = BHM.State.get(SP + '.' + item.key);
        if (currentVal !== undefined && currentVal !== null &&
            String(currentVal) === String(VALS[c])) {
          td.classList.add('selected');
        }

        td.addEventListener('click', makeCellHandler(item.key, VALS[c], tr));
        td.addEventListener('keydown', makeKeyHandler());
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    }

    // ── Total row ──
    var totalRow = document.createElement('tr');
    totalRow.className = 'epworth-total-row';
    var tdTotalLabel = document.createElement('td');
    tdTotalLabel.className = 'fw-bold text-end';
    tdTotalLabel.textContent = 'Total';
    tdTotalLabel.style.background = '#f0f4ff';
    tdTotalLabel.style.borderTop = '2px solid #0d6efd';
    totalRow.appendChild(tdTotalLabel);

    var tdTotalVal = document.createElement('td');
    tdTotalVal.colSpan = 4;
    tdTotalVal.className = 'fw-bold';
    tdTotalVal.id = 'epworth-total-row';
    tdTotalVal.style.background = '#f0f4ff';
    tdTotalVal.style.borderTop = '2px solid #0d6efd';
    tdTotalVal.style.fontSize = '1.1rem';
    tdTotalVal.style.textAlign = 'center';
    totalRow.appendChild(tdTotalVal);
    tbody.appendChild(totalRow);

    table.appendChild(tbody);
    tableWrap.appendChild(table);
    card.appendChild(tableWrap);

    // Completeness
    var keys = ITEMS.map(function (item) { return item.key; });
    card.appendChild(F.completenessBar(SP, keys));

    container.appendChild(card);
    recalc();
  }

  // ── Cell click handler ──
  function makeCellHandler(rowKey, value, tr) {
    return function () {
      var cells = tr.querySelectorAll('.cg-cell');
      for (var i = 0; i < cells.length; i++) cells[i].classList.remove('selected');
      this.classList.add('selected');
      this.focus();

      BHM.State.set(SP + '.' + rowKey, value);
      recalc();
    };
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
            if (nextCells[colIdx]) target = nextCells[colIdx];
          }
          break;
        case 'ArrowUp':
          if (rowIdx > 0) {
            var prevCells = allRows[rowIdx - 1].querySelectorAll('.cg-cell');
            if (prevCells[colIdx]) target = prevCells[colIdx];
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
    if (BHM.Scoring && BHM.Scoring.epworth) BHM.Scoring.epworth();

    // Update total row
    var total = 0, answered = 0;
    for (var i = 0; i < ITEMS.length; i++) {
      var val = BHM.State.get(SP + '.' + ITEMS[i].key);
      if (val !== undefined && val !== null && val !== '') {
        total += Number(val);
        answered++;
      }
    }
    var totalCell = document.getElementById('epworth-total-row');
    if (totalCell) {
      totalCell.textContent = answered > 0 ? total : '';
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
