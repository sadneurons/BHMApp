/* ═══════════════════════════════════════════════════════
   BHM.Instruments.Depression — 15-item Yes/No (GDS-15)
   Exact wording from Pre-Assessment Booklet page 5.
   ═══════════════════════════════════════════════════════
   Critical: The booklet ALTERNATES the Yes/No column order.
   For each item, the depressive answer is printed FIRST.
   Items 1,5,7,11,13: show "No Yes" (depressive answer = No)
   All others: show "Yes No" (depressive answer = Yes)
   The on-screen layout mirrors this alternation exactly.
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};
BHM.Instruments = BHM.Instruments || {};

BHM.Instruments.Depression = (function () {
  'use strict';

  var SP = 'instruments.depression';
  var F = BHM.ClickableGrid;

  // Items — exact wording from booklet, with column order matching paper
  // firstCol/secondCol reflect the printed order on the paper form
  var ITEMS = [
    { key: 'd1',  label: '1 Are you basically satisfied with your life?',                                    firstCol: 'No',  secondCol: 'Yes', depressiveAnswer: 'no'  },
    { key: 'd2',  label: '2 Have you dropped many of your activities or interests?',                          firstCol: 'Yes', secondCol: 'No',  depressiveAnswer: 'yes' },
    { key: 'd3',  label: '3 Do you feel that your life is empty?',                                            firstCol: 'Yes', secondCol: 'No',  depressiveAnswer: 'yes' },
    { key: 'd4',  label: '4 Do you often feel bored?',                                                        firstCol: 'Yes', secondCol: 'No',  depressiveAnswer: 'yes' },
    { key: 'd5',  label: '5 Are you in good spirits most of the time?',                                       firstCol: 'No',  secondCol: 'Yes', depressiveAnswer: 'no'  },
    { key: 'd6',  label: '6 Are you afraid that something bad is going to happen to you?',                    firstCol: 'Yes', secondCol: 'No',  depressiveAnswer: 'yes' },
    { key: 'd7',  label: '7 Do you feel happy most of the time?',                                             firstCol: 'No',  secondCol: 'Yes', depressiveAnswer: 'no'  },
    { key: 'd8',  label: '8 Do you often feel helpless?',                                                     firstCol: 'Yes', secondCol: 'No',  depressiveAnswer: 'yes' },
    { key: 'd9',  label: '9 Do you prefer to stay at home, rather than going out and doing new things?',      firstCol: 'Yes', secondCol: 'No',  depressiveAnswer: 'yes' },
    { key: 'd10', label: '10 Do you feel you have more problems with your memory than most?',                 firstCol: 'Yes', secondCol: 'No',  depressiveAnswer: 'yes' },
    { key: 'd11', label: '11 Do you think it is wonderful to be alive?',                                      firstCol: 'No',  secondCol: 'Yes', depressiveAnswer: 'no'  },
    { key: 'd12', label: '12 Do you feel pretty worthless the way you are now',                               firstCol: 'Yes', secondCol: 'No',  depressiveAnswer: 'yes' },
    { key: 'd13', label: '13 Do you feel full of energy?',                                                    firstCol: 'No',  secondCol: 'Yes', depressiveAnswer: 'no'  },
    { key: 'd14', label: '14 Do you feel that your situation is hopeless?',                                   firstCol: 'Yes', secondCol: 'No',  depressiveAnswer: 'yes' },
    { key: 'd15', label: '15 Do you think that most people are better off than you are?',                     firstCol: 'Yes', secondCol: 'No',  depressiveAnswer: 'yes' }
  ];

  function render(container) {
    container.innerHTML = '';

    var card = document.createElement('div');
    card.className = 'instrument-card';

    // Title — booklet just says "Depression"
    card.innerHTML = '<h5>Depression</h5>';

    var summary = document.createElement('div');
    summary.className = 'score-summary';
    summary.innerHTML = '<span class="score-label">Score:</span>' +
      '<span class="score-value" id="depression-total">--</span>' +
      '<span class="score-interp" id="depression-interp">out of 15</span>';
    card.appendChild(summary);

    // Build custom table that mirrors the paper's alternating Yes/No order
    var tableWrap = document.createElement('div');
    tableWrap.className = 'table-responsive';

    var table = document.createElement('table');
    table.className = 'clickable-grid depression-table';
    table.id = 'depression-grid';
    table.setAttribute('role', 'grid');

    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    var thQ = document.createElement('th');
    thQ.textContent = '';
    thQ.style.textAlign = 'left';
    thQ.style.minWidth = '350px';
    headerRow.appendChild(thQ);
    // Two option columns — labels vary per row, so headers are generic
    var th1 = document.createElement('th');
    th1.textContent = '';
    th1.style.minWidth = '70px';
    headerRow.appendChild(th1);
    var th2 = document.createElement('th');
    th2.textContent = '';
    th2.style.minWidth = '70px';
    headerRow.appendChild(th2);
    thead.appendChild(headerRow);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');

    for (var i = 0; i < ITEMS.length; i++) {
      var item = ITEMS[i];
      var tr = document.createElement('tr');
      tr.setAttribute('role', 'row');

      var tdLabel = document.createElement('td');
      tdLabel.className = 'cg-label';
      tdLabel.textContent = item.label;
      tr.appendChild(tdLabel);

      // First column option (matches paper print order)
      var td1 = createCell(item.key, item.firstCol.toLowerCase(), item.firstCol, i, tr);
      tr.appendChild(td1);

      // Second column option
      var td2 = createCell(item.key, item.secondCol.toLowerCase(), item.secondCol, i, tr);
      tr.appendChild(td2);

      tbody.appendChild(tr);
    }

    // Total row
    var totalRow = document.createElement('tr');
    var tdTotalLabel = document.createElement('td');
    tdTotalLabel.className = 'text-end fw-bold';
    tdTotalLabel.textContent = 'TOTAL:';
    tdTotalLabel.style.background = '#f0f4ff';
    tdTotalLabel.style.borderTop = '2px solid #0d6efd';
    totalRow.appendChild(tdTotalLabel);
    var tdTotalVal = document.createElement('td');
    tdTotalVal.colSpan = 2;
    tdTotalVal.className = 'fw-bold text-center';
    tdTotalVal.id = 'depression-total-row';
    tdTotalVal.style.background = '#f0f4ff';
    tdTotalVal.style.borderTop = '2px solid #0d6efd';
    tdTotalVal.style.fontSize = '1.1rem';
    totalRow.appendChild(tdTotalVal);
    tbody.appendChild(totalRow);

    table.appendChild(tbody);
    tableWrap.appendChild(table);
    card.appendChild(tableWrap);

    var keys = ITEMS.map(function (item) { return item.key; });
    card.appendChild(F.completenessBar(SP, keys));

    container.appendChild(card);
    recalc();
  }

  function createCell(rowKey, value, displayText, rowIdx, tr) {
    var td = document.createElement('td');
    td.className = 'cg-cell';
    td.setAttribute('role', 'gridcell');
    td.setAttribute('tabindex', '-1');
    td.dataset.row = rowKey;
    td.dataset.value = value;
    td.textContent = displayText;

    var currentVal = BHM.State.get(SP + '.' + rowKey);
    if (currentVal !== undefined && currentVal !== null && currentVal === value) {
      td.classList.add('selected');
    }

    td.addEventListener('click', function () {
      var cells = tr.querySelectorAll('.cg-cell');
      for (var i = 0; i < cells.length; i++) cells[i].classList.remove('selected');
      this.classList.add('selected');
      this.focus();
      BHM.State.set(SP + '.' + rowKey, value);
      recalc();
    });

    return td;
  }

  function recalc() {
    if (BHM.Scoring && BHM.Scoring.depression) BHM.Scoring.depression();

    // Update total row
    var items = getItems();
    var total = 0, answered = 0;
    for (var i = 0; i < items.length; i++) {
      var val = BHM.State.get(SP + '.' + items[i].key);
      if (val !== undefined && val !== null && val !== '') {
        answered++;
        if (val === items[i].depressiveAnswer) total++;
      }
    }
    var totalCell = document.getElementById('depression-total-row');
    if (totalCell) totalCell.textContent = answered > 0 ? total : '';
  }

  function getItems() { return ITEMS; }

  return { render: render, getItems: getItems };
})();
