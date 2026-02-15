/* ═══════════════════════════════════════════════════════
   BHM.Instruments.CASP19 — Quality of Life (ELSA version)
   Exact wording from Pre-Assessment Booklet pages 7-8.
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};
BHM.Instruments = BHM.Instruments || {};

BHM.Instruments.CASP19 = (function () {
  'use strict';

  var SP = 'instruments.casp19';
  var F = BHM.ClickableGrid;

  // Items — exact wording from booklet, with sub-domain codes and scoring direction
  // reverse: true means negative wording (Often=0, Never=3)
  // reverse: false means positive wording (Often=3, Never=0)
  var ITEMS = [
    { key: 'c1',  label: 'My age prevents me from doing the things I would like to',                   code: 'C1',  domain: 'Control',          reverse: true  },
    { key: 'c2',  label: 'I feel that what happens to me is out of my control',                         code: 'C2',  domain: 'Control',          reverse: true  },
    { key: 'c3',  label: 'I feel free to plan for the future',                                          code: 'C3',  domain: 'Control',          reverse: false },
    { key: 'c4',  label: 'I feel left out of things',                                                   code: 'C4',  domain: 'Control',          reverse: true  },
    { key: 'c5',  label: 'I can do the things that I want to do',                                       code: 'A1',  domain: 'Autonomy',         reverse: false },
    { key: 'c6',  label: 'Family responsibilities prevent me from doing what I want to do',              code: 'A2',  domain: 'Autonomy',         reverse: true  },
    { key: 'c7',  label: 'I feel that I can please myself what I do',                                   code: 'A3',  domain: 'Autonomy',         reverse: false },
    { key: 'c8',  label: 'My health stops me from doing things I want to do',                           code: 'A4',  domain: 'Autonomy',         reverse: true  },
    { key: 'c9',  label: 'Shortage of money stops me from doing the things I want to do',               code: 'A5',  domain: 'Autonomy',         reverse: true  },
    { key: 'c10', label: 'I look forward to each day',                                                  code: 'P1',  domain: 'Pleasure',         reverse: false },
    { key: 'c11', label: 'I feel that my life has meaning',                                              code: 'P2',  domain: 'Pleasure',         reverse: false },
    { key: 'c12', label: 'I enjoy the things that I do',                                                 code: 'P3',  domain: 'Pleasure',         reverse: false },
    { key: 'c13', label: 'I enjoy being in the company of others',                                       code: 'P4',  domain: 'Pleasure',         reverse: false },
    { key: 'c14', label: 'On balance, I look back on my life with a sense of happiness',                 code: 'P5',  domain: 'Pleasure',         reverse: false },
    { key: 'c15', label: 'I feel full of energy these days',                                             code: 'SR1', domain: 'Self-realisation', reverse: false },
    { key: 'c16', label: 'I choose to do things that I have never done before',                          code: 'SR2', domain: 'Self-realisation', reverse: false },
    { key: 'c17', label: 'I feel satisfied with the way my life has turned out',                         code: 'SR3', domain: 'Self-realisation', reverse: false },
    { key: 'c18', label: 'I feel that life is full of opportunities',                                    code: 'SR4', domain: 'Self-realisation', reverse: false },
    { key: 'c19', label: 'I feel that the future looks good for me',                                     code: 'SR5', domain: 'Self-realisation', reverse: false }
  ];

  var COLS = ['Often', 'Sometimes', 'Not often', 'Never'];
  var VALS = [0, 1, 2, 3];

  function render(container) {
    container.innerHTML = '';

    var card = document.createElement('div');
    card.className = 'instrument-card';

    // Title — exact from booklet
    card.innerHTML =
      '<h5>CASP19 Quality of Life Scale (ELSA version)</h5>' +
      '<p class="instrument-subtitle">Please circle the number that corresponds with how much you agree with the phrase</p>';

    // Score summary
    var summary = document.createElement('div');
    summary.className = 'score-summary';
    summary.innerHTML = '<span class="score-label">CASP-19 Score:</span>' +
      '<span class="score-value" id="casp19-total">--</span>' +
      '<span class="score-interp" id="casp19-interp">out of 57 (higher = better quality of life)</span>';
    card.appendChild(summary);

    // Build table matching booklet structure:
    // Sub-domain | Item no | Statement | Often | Sometimes | Not often | Never
    var tableWrap = document.createElement('div');
    tableWrap.className = 'table-responsive';

    var table = document.createElement('table');
    table.className = 'clickable-grid casp19-table';
    table.id = 'casp19-grid';
    table.setAttribute('role', 'grid');

    // Header
    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    var headers = ['', 'Sub-domain', 'Item no', 'Often', 'Sometimes', 'Not often', 'Never'];
    for (var h = 0; h < headers.length; h++) {
      var th = document.createElement('th');
      th.textContent = headers[h];
      if (h === 0) { th.style.minWidth = '300px'; th.style.textAlign = 'left'; }
      if (h === 1) { th.style.minWidth = '50px'; th.style.fontSize = '0.75rem'; }
      if (h === 2) { th.style.minWidth = '50px'; th.style.fontSize = '0.75rem'; }
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    var tbody = document.createElement('tbody');
    for (var i = 0; i < ITEMS.length; i++) {
      var item = ITEMS[i];
      var tr = document.createElement('tr');
      tr.setAttribute('role', 'row');

      // Statement
      var tdLabel = document.createElement('td');
      tdLabel.className = 'cg-label';
      tdLabel.textContent = item.label;
      tr.appendChild(tdLabel);

      // Sub-domain code
      var tdDomain = document.createElement('td');
      tdDomain.className = 'text-center text-muted';
      tdDomain.style.fontSize = '0.75rem';
      tdDomain.textContent = item.code;
      tr.appendChild(tdDomain);

      // Item number
      var tdNum = document.createElement('td');
      tdNum.className = 'text-center text-muted';
      tdNum.style.fontSize = '0.75rem';
      tdNum.textContent = String(i + 1);
      tr.appendChild(tdNum);

      // Scoring cells — show the score number in each cell (as on paper)
      // reverse items: Often=0, Sometimes=1, Not often=2, Never=3
      // positive items: Often=3, Sometimes=2, Not often=1, Never=0
      for (var c = 0; c < 4; c++) {
        var scoreVal = item.reverse ? c : (3 - c);
        var td = document.createElement('td');
        td.className = 'cg-cell';
        td.setAttribute('role', 'gridcell');
        td.setAttribute('tabindex', (i === 0 && c === 0) ? '0' : '-1');
        td.dataset.row = item.key;
        td.dataset.col = c;
        td.dataset.value = c; // store column index
        td.textContent = String(scoreVal);

        var currentVal = BHM.State.get(SP + '.' + item.key);
        if (currentVal !== undefined && currentVal !== null && String(currentVal) === String(c)) {
          td.classList.add('selected');
        }

        td.addEventListener('click', makeCellHandler(item.key, c, tr));
        td.addEventListener('keydown', makeKeyHandler());
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    tableWrap.appendChild(table);
    card.appendChild(tableWrap);

    var keys = ITEMS.map(function (i) { return i.key; });
    card.appendChild(F.completenessBar(SP, keys));

    container.appendChild(card);
    recalc();
  }

  function makeCellHandler(rowKey, colIdx, tr) {
    return function () {
      var cells = tr.querySelectorAll('.cg-cell');
      for (var i = 0; i < cells.length; i++) cells[i].classList.remove('selected');
      this.classList.add('selected');
      this.focus();
      BHM.State.set(SP + '.' + rowKey, colIdx);
      recalc();
    };
  }

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
        case 'ArrowRight': if (colIdx < cells.length - 1) target = cells[colIdx + 1]; break;
        case 'ArrowLeft': if (colIdx > 0) target = cells[colIdx - 1]; break;
        case 'ArrowDown': if (rowIdx < allRows.length - 1) { var nc = allRows[rowIdx + 1].querySelectorAll('.cg-cell'); if (nc[colIdx]) target = nc[colIdx]; } break;
        case 'ArrowUp': if (rowIdx > 0) { var pc = allRows[rowIdx - 1].querySelectorAll('.cg-cell'); if (pc[colIdx]) target = pc[colIdx]; } break;
        case 'Enter': case ' ': e.preventDefault(); td.click(); return;
      }
      if (target) { e.preventDefault(); td.setAttribute('tabindex', '-1'); target.setAttribute('tabindex', '0'); target.focus(); }
    };
  }

  function recalc() {
    if (BHM.Scoring && BHM.Scoring.casp19) BHM.Scoring.casp19();
  }

  function getItems() { return ITEMS; }

  return { render: render, getItems: getItems };
})();
