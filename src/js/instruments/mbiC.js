/* ═══════════════════════════════════════════════════════
   BHM.Instruments.MBIC — Mild Behavioural Impairment Checklist
   Exact wording from Pre-Assessment Booklet pages 11-13.
   Modified from J Alzheimers Dis. 2017; 56(3): 929-938.
   doi:10.3233/JAD-160979.
   ─────────────────────────────────────────────────────
   Layout: ONE single unified table. Domain headings are
   full-width header rows within the table (matches paper).
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};
BHM.Instruments = BHM.Instruments || {};

BHM.Instruments.MBIC = (function () {
  'use strict';

  var SP = 'instruments.mbiC';
  var F = BHM.ClickableGrid;

  // Domains and items — exact wording, order and counts from booklet
  var DOMAINS = [
    {
      name: 'Interest, motivation, and drive',
      items: [
        { key: 'imd1', label: 'Does the person lack curiosity in topics that would usually have attracted her/his interest?' },
        { key: 'imd2', label: 'Has the person lost interest in friends, family, or home activities?' },
        { key: 'imd3', label: 'Has the person become less spontaneous and active \u2013 for example, is she/he less likely to initiate or maintain conversation?' },
        { key: 'imd4', label: 'Has the person lost the motivation to act on their obligations or interests?' },
        { key: 'imd5', label: 'Is the person less affectionate and/or lacking in emotions when compared to her/his usual self?' }
      ]
    },
    {
      name: 'Mood or anxiety symptoms',
      items: [
        { key: 'ma1', label: 'Has the person developed sadness or appear to be in low spirits? Does she/he have episodes of tearfulness?' },
        { key: 'ma2', label: 'Has the person become less able to experience pleasure?' },
        { key: 'ma3', label: 'Has become discouraged about their future or feel that he/she is a failure?' },
        { key: 'ma4', label: 'Does the person view herself/himself as a burden to family?' },
        { key: 'ma5', label: 'Has the person become more anxious or worried about things that are routine (e.g. events, visits, etc.)?' },
        { key: 'ma6', label: 'Does the person feel very tense, having developed an inability to relax, or shakiness, or symptoms of panic?' }
      ]
    },
    {
      name: 'Delayed gratification and control behavior, impulses, oral intake and/or changes in reward',
      items: [
        { key: 'dg1',  label: 'Has the person become agitated, aggressive, irritable, or temperamental?' },
        { key: 'dg2',  label: 'Has she/he become unreasonably or uncharacteristically argumentative?' },
        { key: 'dg3',  label: 'Has the person become more impulsive, seeming to act without considering things?' },
        { key: 'dg4',  label: 'Does the person display sexually disinhibited or intrusive behaviour, such as touching (themselves/others), hugging, groping, etc., in a manner that is out of character or may cause offence?' },
        { key: 'dg5',  label: 'Has the person become more easily frustrated or impatient? Does she/he have troubles coping with delays, or waiting for events or for their turn?' },
        { key: 'dg6',  label: 'Does the person display a new recklessness or lack of judgement when driving (e.g. speeding, erratic swerving, abrupt lane changes, etc.)?' },
        { key: 'dg7',  label: 'Has the person become more stubborn or rigid, i.e., uncharacteristically insistent on having their way, or unwilling/unable to see/hear other views?' },
        { key: 'dg8',  label: 'Is there a change in eating behaviours (e.g., overeating, cramming the mouth, insistent on eating only specific foods, or eating the food in exactly the same order)?' },
        { key: 'dg9',  label: 'Does the person no longer find food tasteful or enjoyable? Are they eating less?' },
        { key: 'dg10', label: 'Does the person hoard objects when she/he did not do so before?' },
        { key: 'dg11', label: 'Has the person developed simple repetitive behaviours or compulsions?' },
        { key: 'dg12', label: 'Has the person recently developed trouble regulating smoking, alcohol, drug intake or gambling, or started shoplifting?' }
      ]
    },
    {
      name: 'Societal norms and having social graces, tact, and empathy',
      items: [
        { key: 'sn1', label: 'Has the person become less concerned about how her/his words or actions affect others? Has she/he become insensitive to others\u2019 feelings?' },
        { key: 'sn2', label: 'Has the person started talking openly about very personal or private matters not usually discussed in public?' },
        { key: 'sn3', label: 'Does the person say rude or crude things or make lewd sexual remarks that she/he would not have said before?' },
        { key: 'sn4', label: 'Does the person seem to lack the social judgement she/he previously had about what to say or how to behave in public or private?' },
        { key: 'sn5', label: 'Does the person now talk to strangers as if familiar, or intrude on their activities?' }
      ]
    },
    {
      name: 'Strongly held beliefs and sensory experiences',
      items: [
        { key: 'sb1', label: 'Has the person developed beliefs that they are in danger, or that others are planning to harm them or steal their belongings?' },
        { key: 'sb2', label: 'Has the person developed suspiciousness about the intentions or motives of other people?' },
        { key: 'sb3', label: 'Does she/he have unrealistic beliefs about her/his power, wealth or skills?' },
        { key: 'sb4', label: 'Does the person describe hearing voices or does she/he talk to imaginary people or \u201cspirits\u201d?' },
        { key: 'sb5', label: 'Does the person report or complain about, or act as if seeing things (e.g. people, animals or insects) that are not there, i.e., that are imaginary to others?' }
      ]
    }
  ];

  var COLS = ['None', 'Mild', 'Moderate', 'Severe'];
  var VALS = [0, 1, 2, 3];

  function render(container) {
    container.innerHTML = '';

    var card = document.createElement('div');
    card.className = 'instrument-card';

    // Title — exact from booklet
    card.innerHTML =
      '<h5>Mild Behavioural Impairment Checklist (MBI-C)</h5>';

    // ID number field
    card.appendChild(F.createField({
      label: 'ID Number:',
      statePath: SP + '.idNumber',
      placeholder: ''
    }));

    // Citation
    var cite = document.createElement('p');
    cite.style.fontSize = '0.75rem';
    cite.style.color = '#6c757d';
    cite.textContent = 'Modified from J Alzheimers Dis. 2017 ; 56(3): 929\u2013938. doi:10.3233/JAD-160979.';
    card.appendChild(cite);

    // Score summary
    var summary = document.createElement('div');
    summary.className = 'score-summary';
    summary.innerHTML = '<span class="score-label">MBI-C Total:</span>' +
      '<span class="score-value" id="mbic-total">--</span>' +
      '<span class="score-interp" id="mbic-interp">Domain scores shown below</span>';
    card.appendChild(summary);

    // Domain scores display
    var domainScores = document.createElement('div');
    domainScores.className = 'd-flex flex-wrap gap-2 mb-3';
    domainScores.id = 'mbic-domain-scores';
    for (var d = 0; d < DOMAINS.length; d++) {
      var badge = document.createElement('span');
      badge.className = 'badge bg-light text-dark border';
      badge.style.fontSize = '0.72rem';
      badge.id = 'mbic-domain-' + d;
      badge.textContent = DOMAINS[d].name.substring(0, 30) + '\u2026: --';
      badge.title = DOMAINS[d].name;
      domainScores.appendChild(badge);
    }
    card.appendChild(domainScores);

    // ── Build ONE single unified table ──
    var tableWrap = document.createElement('div');
    tableWrap.className = 'table-responsive';

    var table = document.createElement('table');
    table.className = 'clickable-grid mbic-unified-table';
    table.id = 'mbic-grid';
    table.setAttribute('role', 'grid');

    // Header row
    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    var thQ = document.createElement('th');
    thQ.textContent = '';
    thQ.style.textAlign = 'left';
    thQ.style.minWidth = '350px';
    headerRow.appendChild(thQ);

    for (var c = 0; c < COLS.length; c++) {
      var th = document.createElement('th');
      th.textContent = COLS[c];
      th.style.minWidth = '70px';
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body — domains flow continuously as section header rows + item rows
    var tbody = document.createElement('tbody');
    var allKeys = [];
    var globalRowIdx = 0;

    for (var di = 0; di < DOMAINS.length; di++) {
      var domain = DOMAINS[di];

      // Domain header row (spans all columns)
      var domainRow = document.createElement('tr');
      domainRow.className = 'mbic-domain-header';
      var domainTd = document.createElement('td');
      domainTd.colSpan = COLS.length + 1;
      domainTd.innerHTML = '<strong>' + domain.name + '</strong>';
      domainRow.appendChild(domainTd);
      tbody.appendChild(domainRow);

      // Item rows
      for (var ii = 0; ii < domain.items.length; ii++) {
        var item = domain.items[ii];
        allKeys.push(item.key);

        var tr = document.createElement('tr');
        tr.setAttribute('role', 'row');

        // Label cell
        var tdLabel = document.createElement('td');
        tdLabel.className = 'cg-label';
        tdLabel.textContent = item.label;
        tr.appendChild(tdLabel);

        // Clickable cells (None / Mild / Moderate / Severe)
        for (var ci = 0; ci < VALS.length; ci++) {
          var td = document.createElement('td');
          td.className = 'cg-cell';
          td.setAttribute('role', 'gridcell');
          td.setAttribute('tabindex', (globalRowIdx === 0 && ci === 0) ? '0' : '-1');
          td.dataset.row = item.key;
          td.dataset.col = ci;
          td.dataset.value = VALS[ci];
          td.innerHTML = '\u2610'; // empty checkbox char

          // Restore from state
          var currentVal = BHM.State.get(SP + '.' + item.key);
          if (currentVal !== undefined && currentVal !== null && Number(currentVal) === VALS[ci]) {
            td.classList.add('selected');
            td.innerHTML = '\u2611';
          }

          td.addEventListener('click', makeCellHandler(item.key, VALS[ci], tr));
          td.addEventListener('keydown', makeKeyHandler());
          tr.appendChild(td);
        }

        tbody.appendChild(tr);
        globalRowIdx++;
      }
    }

    table.appendChild(tbody);
    tableWrap.appendChild(table);
    card.appendChild(tableWrap);

    card.appendChild(F.completenessBar(SP, allKeys));
    container.appendChild(card);
    recalc();
  }

  function makeCellHandler(rowKey, value, tr) {
    return function () {
      // Deselect siblings
      var cells = tr.querySelectorAll('.cg-cell');
      for (var i = 0; i < cells.length; i++) {
        cells[i].classList.remove('selected');
        cells[i].innerHTML = '\u2610';
      }
      // Select this one
      this.classList.add('selected');
      this.innerHTML = '\u2611';
      this.focus();
      BHM.State.set(SP + '.' + rowKey, value);
      recalc();
    };
  }

  function makeKeyHandler() {
    return function (e) {
      var td = e.target;
      var table = td.closest('table');
      // Get only item rows (skip domain header rows)
      var allItemRows = table.querySelectorAll('tbody tr:not(.mbic-domain-header)');
      var parentTr = td.closest('tr');
      var rowIdx = Array.prototype.indexOf.call(allItemRows, parentTr);
      var cells = parentTr.querySelectorAll('.cg-cell');
      var colIdx = Array.prototype.indexOf.call(cells, td);
      var target = null;
      switch (e.key) {
        case 'ArrowRight': if (colIdx < cells.length - 1) target = cells[colIdx + 1]; break;
        case 'ArrowLeft': if (colIdx > 0) target = cells[colIdx - 1]; break;
        case 'ArrowDown':
          if (rowIdx < allItemRows.length - 1) {
            var nc = allItemRows[rowIdx + 1].querySelectorAll('.cg-cell');
            if (nc[colIdx]) target = nc[colIdx];
          }
          break;
        case 'ArrowUp':
          if (rowIdx > 0) {
            var pc = allItemRows[rowIdx - 1].querySelectorAll('.cg-cell');
            if (pc[colIdx]) target = pc[colIdx];
          }
          break;
        case 'Enter': case ' ': e.preventDefault(); td.click(); return;
      }
      if (target) { e.preventDefault(); td.setAttribute('tabindex', '-1'); target.setAttribute('tabindex', '0'); target.focus(); }
    };
  }

  function recalc() {
    if (BHM.Scoring && BHM.Scoring.mbiC) BHM.Scoring.mbiC();
  }

  function getDomains() { return DOMAINS; }

  return { render: render, getDomains: getDomains };
})();
