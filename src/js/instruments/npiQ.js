/* ═══════════════════════════════════════════════════════
   BHM.Instruments.NPIQ — Neuropsychiatric Inventory
   Questionnaire (NPI-Q)
   Exact wording from Pre-Assessment Booklet pages 13-16.
   ─────────────────────────────────────────────────────
   Layout: Single unified table. Each symptom is one row:
     Label | Yes No | SEVERITY 1 2 3 | DISTRESS 0 1 2 3 4 5
   Severity & distress cells are greyed out until Yes.
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};
BHM.Instruments = BHM.Instruments || {};

BHM.Instruments.NPIQ = (function () {
  'use strict';

  var SP = 'instruments.npiQ';
  var F = BHM.ClickableGrid;

  var SYMPTOMS = [
    { key: 'delusions',        label: 'Delusions',             desc: 'Does the patient have false beliefs, such as thinking that others are stealing from him/her or planning to harm him/her in some way?' },
    { key: 'hallucinations',   label: 'Hallucinations',        desc: 'Does the patient have hallucinations such as false visions or voices? Does he or she seem to hear or see things that are not present?' },
    { key: 'agitation',        label: 'Agitation/Aggression',  desc: 'Is the patient resistive to help from others at times, or hard to handle?' },
    { key: 'depression',       label: 'Depression/Dysphoria',  desc: 'Does the patient seem sad or say that he/she is depressed?' },
    { key: 'anxiety',          label: 'Anxiety',               desc: 'Does the patient become upset when separated from you? Does he/she have any other signs of nervousness such as shortness of breath, sighing, being unable to relax, or feeling excessively tense?' },
    { key: 'elation',          label: 'Elation/Euphoria',      desc: 'Does the patient appear to feel too good or act excessively happy?' },
    { key: 'apathy',           label: 'Apathy/Indifference',   desc: 'Does the patient seem less interested in his/her usual activities or in the activities and plans of others?' },
    { key: 'disinhibition',    label: 'Disinhibition',         desc: 'Does the patient seem to act impulsively, for example, talking to strangers as if he/she knows them, or saying things that may hurt people\u2019s feelings?' },
    { key: 'irritability',     label: 'Irritability/Lability', desc: 'Is the patient impatient and cranky? Does he/she have difficulty coping with delays or waiting for planned activities?' },
    { key: 'motorDisturbance', label: 'Motor Disturbance',     desc: 'Does the patient engage in repetitive activities such as pacing around the house, handling buttons, wrapping string, or doing other things repeatedly?' },
    { key: 'nightBehaviour',   label: 'Nightime Behaviors',    desc: 'Does the patient awaken you during the night, rise too early in the morning, or take excessive naps during the day?' },
    { key: 'appetite',         label: 'Appetite/Eating',       desc: 'Has the patient lost or gained weight, or had a change in the type of food he/she likes?' }
  ];

  var SEV_VALS = [1, 2, 3];
  var DIST_VALS = [0, 1, 2, 3, 4, 5];

  function render(container) {
    container.innerHTML = '';

    var card = document.createElement('div');
    card.className = 'instrument-card';
    card.innerHTML = '<h5>Neuropsychiatric Inventory Questionnaire (NPI-Q)</h5>';

    // Instructions — exact from booklet
    var instrDiv = document.createElement('div');
    instrDiv.className = 'instrument-subtitle';
    instrDiv.style.fontSize = '0.85rem';
    instrDiv.innerHTML =
      '<p>Please answer the following questions based on changes that have occurred since the patient first began to experience memory problems.</p>' +
      '<p>Circle \u201cYes\u201d only if the symptom(s) has been present in the last month. Otherwise, circle \u201cNo\u201d. For each item marked \u201cYes\u201d:</p>' +
      '<p>a) Rate the <strong>SEVERITY</strong> of the symptom (how it affects the patient):</p>' +
      '<div class="ps-3 mb-2" style="line-height:1.6;">' +
        '1 = Mild (noticeable, but not a significant change)<br>' +
        '2 = Moderate (significant, but not a dramatic change)<br>' +
        '3 = Severe (very marked or prominent, a dramatic change)' +
      '</div>' +
      '<p>b) Rate the <strong>DISTRESS</strong> you experience due to that symptom (how it affects you):</p>' +
      '<div class="ps-3 mb-2" style="line-height:1.6;">' +
        '0 = Not distressing at all<br>' +
        '1 = Minimal (slightly distressing, not a problem to cope with)<br>' +
        '2 = Mild (not very distressing, generally easy to cope with)<br>' +
        '3 = Moderate (fairly distressing, not always easy to cope with)<br>' +
        '4 = Severe (very distressing, difficult to cope with)<br>' +
        '5 = Extreme or Very Severe (extremely distressing, unable to cope with)' +
      '</div>' +
      '<p>Please answer each question carefully. Ask for assistance if you have any questions.</p>';
    card.appendChild(instrDiv);

    // Score summary
    var summary = document.createElement('div');
    summary.className = 'score-summary';
    summary.innerHTML =
      '<span class="score-label">Symptom count:</span><span class="score-value" id="npiq-count">--</span>' +
      '<span class="score-label ms-3">Severity total:</span><span class="score-value" id="npiq-severity">--</span>' +
      '<span class="score-label ms-3">Distress total:</span><span class="score-value" id="npiq-distress">--</span>';
    card.appendChild(summary);

    // ═══ UNIFIED TABLE ═══
    var tableWrap = document.createElement('div');
    tableWrap.className = 'table-responsive';

    var table = document.createElement('table');
    table.className = 'clickable-grid npiq-unified-table';
    table.id = 'npiq-grid';
    table.setAttribute('role', 'grid');

    // ── Header row ──
    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');

    // Symptom column
    var thSym = document.createElement('th');
    thSym.textContent = '';
    thSym.style.textAlign = 'left';
    thSym.style.minWidth = '220px';
    headerRow.appendChild(thSym);

    // Yes / No columns
    var thYes = document.createElement('th');
    thYes.textContent = 'Yes';
    thYes.style.minWidth = '44px';
    headerRow.appendChild(thYes);
    var thNo = document.createElement('th');
    thNo.textContent = 'No';
    thNo.style.minWidth = '44px';
    headerRow.appendChild(thNo);

    // Severity header spanning 3 cols
    var thSev = document.createElement('th');
    thSev.textContent = 'SEVERITY:';
    thSev.colSpan = 3;
    thSev.className = 'npiq-group-header';
    headerRow.appendChild(thSev);

    // Distress header spanning 6 cols
    var thDist = document.createElement('th');
    thDist.textContent = 'DISTRESS:';
    thDist.colSpan = 6;
    thDist.className = 'npiq-group-header';
    headerRow.appendChild(thDist);

    thead.appendChild(headerRow);

    // Sub-header row with the numeric labels
    var subRow = document.createElement('tr');
    subRow.className = 'npiq-sub-header';

    // Empty for symptom + yes + no
    var subEmpty1 = document.createElement('th');
    subEmpty1.textContent = '';
    subRow.appendChild(subEmpty1);
    var subEmpty2 = document.createElement('th');
    subEmpty2.textContent = '';
    subRow.appendChild(subEmpty2);
    var subEmpty3 = document.createElement('th');
    subEmpty3.textContent = '';
    subRow.appendChild(subEmpty3);

    // Severity sub-headers: 1 2 3
    for (var s = 0; s < SEV_VALS.length; s++) {
      var thS = document.createElement('th');
      thS.textContent = String(SEV_VALS[s]);
      thS.className = 'npiq-num-header';
      subRow.appendChild(thS);
    }
    // Distress sub-headers: 0 1 2 3 4 5
    for (var d = 0; d < DIST_VALS.length; d++) {
      var thD = document.createElement('th');
      thD.textContent = String(DIST_VALS[d]);
      thD.className = 'npiq-num-header';
      subRow.appendChild(thD);
    }
    thead.appendChild(subRow);
    table.appendChild(thead);

    // ── Body rows ──
    var tbody = document.createElement('tbody');

    for (var i = 0; i < SYMPTOMS.length; i++) {
      var sym = SYMPTOMS[i];
      var tr = document.createElement('tr');
      tr.setAttribute('role', 'row');
      tr.id = 'npiq-row-' + sym.key;

      // Label cell
      var tdLabel = document.createElement('td');
      tdLabel.className = 'cg-label npiq-label-cell';
      tdLabel.innerHTML = '<strong>' + sym.label + '</strong>' +
        '<div class="npiq-item-desc">' + sym.desc + '</div>';
      tr.appendChild(tdLabel);

      // Yes cell
      var tdYes = document.createElement('td');
      tdYes.className = 'cg-cell npiq-yn-cell';
      tdYes.setAttribute('role', 'gridcell');
      tdYes.setAttribute('tabindex', '-1');
      tdYes.textContent = 'Yes';
      tdYes.dataset.row = sym.key;
      tdYes.dataset.type = 'present';
      tdYes.dataset.value = 'yes';
      tr.appendChild(tdYes);

      // No cell
      var tdNo = document.createElement('td');
      tdNo.className = 'cg-cell npiq-yn-cell';
      tdNo.setAttribute('role', 'gridcell');
      tdNo.setAttribute('tabindex', '-1');
      tdNo.textContent = 'No';
      tdNo.dataset.row = sym.key;
      tdNo.dataset.type = 'present';
      tdNo.dataset.value = 'no';
      tr.appendChild(tdNo);

      // Severity cells: 1 2 3
      for (var si = 0; si < SEV_VALS.length; si++) {
        var tdSev = document.createElement('td');
        tdSev.className = 'cg-cell npiq-rating-cell npiq-disabled';
        tdSev.setAttribute('role', 'gridcell');
        tdSev.setAttribute('tabindex', '-1');
        tdSev.textContent = String(SEV_VALS[si]);
        tdSev.dataset.row = sym.key;
        tdSev.dataset.type = 'severity';
        tdSev.dataset.value = SEV_VALS[si];
        tr.appendChild(tdSev);
      }

      // Distress cells: 0 1 2 3 4 5
      for (var di = 0; di < DIST_VALS.length; di++) {
        var tdDist = document.createElement('td');
        tdDist.className = 'cg-cell npiq-rating-cell npiq-disabled';
        tdDist.setAttribute('role', 'gridcell');
        tdDist.setAttribute('tabindex', '-1');
        tdDist.textContent = String(DIST_VALS[di]);
        tdDist.dataset.row = sym.key;
        tdDist.dataset.type = 'distress';
        tdDist.dataset.value = DIST_VALS[di];
        tr.appendChild(tdDist);
      }

      tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    tableWrap.appendChild(table);
    card.appendChild(tableWrap);

    // Footer
    var footer = document.createElement('p');
    footer.style.fontSize = '0.75rem';
    footer.style.color = '#6c757d';
    footer.className = 'mt-3';
    footer.textContent = 'Developed by Daniel Kaufer, MD. Final Version 6/99. \u00A9 JL Cummings, 1994; all rights reserved';
    card.appendChild(footer);

    container.appendChild(card);

    // ── Bind all cell clicks ──
    var allCells = table.querySelectorAll('.cg-cell');
    for (var ci = 0; ci < allCells.length; ci++) {
      allCells[ci].addEventListener('click', handleCellClick);
      allCells[ci].addEventListener('keydown', handleKeyDown);
    }

    // Restore saved state
    restoreState();
    recalc();
  }

  function handleCellClick(e) {
    var td = e.target.closest('.cg-cell');
    if (!td) return;
    var key = td.dataset.row;
    var type = td.dataset.type;
    var value = td.dataset.value;
    var tr = td.closest('tr');

    if (type === 'present') {
      // Yes/No toggle — clear previous selection in this pair
      var ynCells = tr.querySelectorAll('.npiq-yn-cell');
      for (var i = 0; i < ynCells.length; i++) {
        ynCells[i].classList.remove('selected', 'npiq-yes-selected', 'npiq-no-selected');
      }
      td.classList.add('selected');
      td.classList.add(value === 'yes' ? 'npiq-yes-selected' : 'npiq-no-selected');
      BHM.State.set(SP + '.' + key + '_present', value);

      // Enable/disable severity + distress cells
      var ratingCells = tr.querySelectorAll('.npiq-rating-cell');
      for (var r = 0; r < ratingCells.length; r++) {
        if (value === 'yes') {
          ratingCells[r].classList.remove('npiq-disabled');
        } else {
          ratingCells[r].classList.add('npiq-disabled');
          ratingCells[r].classList.remove('selected');
          // Clear severity/distress if switching to No
          var rType = ratingCells[r].dataset.type;
          BHM.State.set(SP + '.' + key + '_' + rType, undefined, { silent: true });
        }
      }

    } else if (type === 'severity') {
      if (td.classList.contains('npiq-disabled')) return;
      // Clear other severity cells in this row
      var sevCells = tr.querySelectorAll('.npiq-rating-cell[data-type="severity"]');
      for (var s = 0; s < sevCells.length; s++) sevCells[s].classList.remove('selected');
      td.classList.add('selected');
      BHM.State.set(SP + '.' + key + '_severity', Number(value));

    } else if (type === 'distress') {
      if (td.classList.contains('npiq-disabled')) return;
      var distCells = tr.querySelectorAll('.npiq-rating-cell[data-type="distress"]');
      for (var d = 0; d < distCells.length; d++) distCells[d].classList.remove('selected');
      td.classList.add('selected');
      BHM.State.set(SP + '.' + key + '_distress', Number(value));
    }

    td.focus();
    recalc();
  }

  function handleKeyDown(e) {
    var td = e.target;
    var tr = td.closest('tr');
    var table = td.closest('table');
    var allRows = table.querySelectorAll('tbody tr');
    var rowIdx = Array.prototype.indexOf.call(allRows, tr);
    var allCells = tr.querySelectorAll('.cg-cell');
    var colIdx = Array.prototype.indexOf.call(allCells, td);
    var target = null;

    switch (e.key) {
      case 'ArrowRight': if (colIdx < allCells.length - 1) target = allCells[colIdx + 1]; break;
      case 'ArrowLeft':  if (colIdx > 0) target = allCells[colIdx - 1]; break;
      case 'ArrowDown':
        if (rowIdx < allRows.length - 1) {
          var nc = allRows[rowIdx + 1].querySelectorAll('.cg-cell');
          if (nc[colIdx]) target = nc[colIdx];
        }
        break;
      case 'ArrowUp':
        if (rowIdx > 0) {
          var pc = allRows[rowIdx - 1].querySelectorAll('.cg-cell');
          if (pc[colIdx]) target = pc[colIdx];
        }
        break;
      case 'Enter': case ' ': e.preventDefault(); td.click(); return;
    }
    if (target) { e.preventDefault(); td.setAttribute('tabindex', '-1'); target.setAttribute('tabindex', '0'); target.focus(); }
  }

  function restoreState() {
    for (var i = 0; i < SYMPTOMS.length; i++) {
      var key = SYMPTOMS[i].key;
      var tr = document.getElementById('npiq-row-' + key);
      if (!tr) continue;

      var present = BHM.State.get(SP + '.' + key + '_present');
      if (present === 'yes' || present === 'no') {
        var ynCells = tr.querySelectorAll('.npiq-yn-cell');
        for (var y = 0; y < ynCells.length; y++) {
          if (ynCells[y].dataset.value === present) {
            ynCells[y].classList.add('selected');
            ynCells[y].classList.add(present === 'yes' ? 'npiq-yes-selected' : 'npiq-no-selected');
          }
        }
        // Enable rating cells if yes
        if (present === 'yes') {
          var ratingCells = tr.querySelectorAll('.npiq-rating-cell');
          for (var r = 0; r < ratingCells.length; r++) ratingCells[r].classList.remove('npiq-disabled');
        }
      }

      // Restore severity
      var sev = BHM.State.get(SP + '.' + key + '_severity');
      if (sev !== undefined && sev !== null) {
        var sevCells = tr.querySelectorAll('.npiq-rating-cell[data-type="severity"]');
        for (var s = 0; s < sevCells.length; s++) {
          if (Number(sevCells[s].dataset.value) === Number(sev)) sevCells[s].classList.add('selected');
        }
      }

      // Restore distress
      var dist = BHM.State.get(SP + '.' + key + '_distress');
      if (dist !== undefined && dist !== null) {
        var distCells = tr.querySelectorAll('.npiq-rating-cell[data-type="distress"]');
        for (var d = 0; d < distCells.length; d++) {
          if (Number(distCells[d].dataset.value) === Number(dist)) distCells[d].classList.add('selected');
        }
      }
    }
  }

  function recalc() {
    if (BHM.Scoring && BHM.Scoring.npiQ) BHM.Scoring.npiQ();
  }

  function getSymptoms() { return SYMPTOMS; }

  return { render: render, getSymptoms: getSymptoms };
})();
