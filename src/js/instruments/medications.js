/* ═══════════════════════════════════════════════════════════════
   BHM.Instruments.Medications — Current medications, recent changes,
   supplements, adherence concerns
   ═══════════════════════════════════════════════════════════════ */
var BHM = window.BHM || {};
BHM.Instruments = BHM.Instruments || {};

BHM.Instruments.Medications = (function () {
  'use strict';

  var S = BHM.State;
  var SP = 'medications';

  // ═══════════════════════════════════════════
  //  COMMON CATEGORIES (for quick-filter colour coding)
  // ═══════════════════════════════════════════

  var CATEGORIES = [
    'Dementia', 'Antidepressant', 'Antipsychotic', 'Anxiolytic / Hypnotic',
    'Antiepileptic', 'Analgesic', 'Cardiovascular', 'Diabetes',
    'Respiratory', 'Gastrointestinal', 'Supplement / Vitamin',
    'Over-the-counter', 'Other'
  ];

  // ═══════════════════════════════════════════
  //  STATE HELPERS
  // ═══════════════════════════════════════════

  function getMeds() { return S.get(SP + '.list') || []; }
  function setMeds(list) { S.set(SP + '.list', list); triggerReport(); }
  function getField(key) { return S.get(SP + '.' + key) || ''; }
  function setField(key, val) { S.set(SP + '.' + key, val); triggerReport(); }
  function triggerReport() {
    if (BHM.Scoring && BHM.Scoring.triggerReport) BHM.Scoring.triggerReport();
    else if (BHM.Report && BHM.Report.update) BHM.Report.update();
  }

  function emptyMed() {
    return { name: '', dose: '', frequency: '', route: 'Oral', category: '', indication: '', recentChange: '' };
  }

  // ═══════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════

  var _listDiv;

  function render(container) {
    container.innerHTML = '';
    var card = document.createElement('div');
    card.className = 'instrument-card';
    card.innerHTML =
      '<h5><i class="bi bi-capsule me-2"></i>Current Medications</h5>' +
      '<p class="instrument-subtitle">List all current prescribed and over-the-counter medications, ' +
      'vitamins, and supplements. Note any recent changes.</p>';

    _listDiv = document.createElement('div');
    _listDiv.id = 'medications-list';
    card.appendChild(_listDiv);

    // Add medication button
    var addRow = document.createElement('div');
    addRow.className = 'mt-2 mb-3';
    var addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn btn-outline-primary btn-sm';
    addBtn.innerHTML = '<i class="bi bi-plus-circle me-1"></i>Add Medication';
    addBtn.addEventListener('click', function () {
      var meds = getMeds();
      meds.push(emptyMed());
      setMeds(meds);
      renderList();
    });
    addRow.appendChild(addBtn);
    card.appendChild(addRow);

    // ── Recent changes / notes ──
    var notesSection = document.createElement('div');
    notesSection.className = 'mb-3';
    notesSection.innerHTML =
      '<h6 class="mb-2" style="font-size:0.9rem"><i class="bi bi-arrow-repeat me-1"></i>Recent Medication Changes</h6>';
    var ta1 = document.createElement('textarea');
    ta1.className = 'form-control form-control-sm';
    ta1.rows = 2;
    ta1.placeholder = 'e.g. Donepezil started 3 months ago, sertraline dose increased from 50mg to 100mg...';
    ta1.value = getField('recentChanges');
    ta1.addEventListener('input', function () { setField('recentChanges', ta1.value); });
    notesSection.appendChild(ta1);
    card.appendChild(notesSection);

    // ── Adherence ──
    var adhSection = document.createElement('div');
    adhSection.className = 'mb-3';
    adhSection.innerHTML =
      '<h6 class="mb-2" style="font-size:0.9rem"><i class="bi bi-check2-circle me-1"></i>Adherence &amp; Concerns</h6>';
    var ta2 = document.createElement('textarea');
    ta2.className = 'form-control form-control-sm';
    ta2.rows = 2;
    ta2.placeholder = 'e.g. Good adherence via dosette box, occasionally forgets evening dose, side effects...';
    ta2.value = getField('adherence');
    ta2.addEventListener('input', function () { setField('adherence', ta2.value); });
    adhSection.appendChild(ta2);
    card.appendChild(adhSection);

    container.appendChild(card);
    renderList();
  }

  function renderList() {
    _listDiv.innerHTML = '';
    var meds = getMeds();
    if (meds.length === 0) {
      _listDiv.innerHTML = '<div class="text-muted text-center py-3" style="font-size:0.88rem">' +
        '<i class="bi bi-info-circle me-1"></i>No medications recorded. Click "Add Medication" to begin.</div>';
      return;
    }

    // Table layout
    var table = document.createElement('table');
    table.className = 'table table-sm table-bordered align-middle mb-1';
    table.style.fontSize = '0.85rem';
    table.innerHTML =
      '<thead><tr>' +
        '<th style="min-width:160px">Medication</th>' +
        '<th style="width:100px">Dose</th>' +
        '<th style="width:100px">Frequency</th>' +
        '<th style="width:80px">Route</th>' +
        '<th style="width:130px">Category</th>' +
        '<th>Indication / Notes</th>' +
        '<th style="width:40px"></th>' +
      '</tr></thead>';

    var tbody = document.createElement('tbody');
    for (var i = 0; i < meds.length; i++) {
      tbody.appendChild(createMedRow(meds, i));
    }
    table.appendChild(tbody);

    var wrapper = document.createElement('div');
    wrapper.className = 'table-responsive';
    wrapper.appendChild(table);
    _listDiv.appendChild(wrapper);
  }

  function createMedRow(meds, idx) {
    var med = meds[idx];
    var tr = document.createElement('tr');

    tr.innerHTML =
      '<td><input type="text" class="form-control form-control-sm border-0" data-field="name" value="' + esc(med.name) + '" placeholder="e.g. Donepezil"></td>' +
      '<td><input type="text" class="form-control form-control-sm border-0" data-field="dose" value="' + esc(med.dose) + '" placeholder="e.g. 10mg"></td>' +
      '<td><input type="text" class="form-control form-control-sm border-0" data-field="frequency" value="' + esc(med.frequency) + '" placeholder="e.g. OD"></td>' +
      '<td>' + buildRouteSelect(med.route) + '</td>' +
      '<td>' + buildCategorySelect(med.category) + '</td>' +
      '<td><input type="text" class="form-control form-control-sm border-0" data-field="indication" value="' + esc(med.indication) + '" placeholder="e.g. Alzheimer\'s"></td>' +
      '<td class="text-center"><button type="button" class="btn btn-sm btn-outline-danger p-0 px-1" data-action="remove"><i class="bi bi-x"></i></button></td>';

    // Bind inputs
    var inputs = tr.querySelectorAll('[data-field]');
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener('input', (function (field, index) {
        return function () {
          var m = getMeds();
          if (!m[index]) return;
          m[index][field] = this.value;
          setMeds(m);
        };
      })(inputs[i].getAttribute('data-field'), idx));
      inputs[i].addEventListener('change', (function (field, index) {
        return function () {
          var m = getMeds();
          if (!m[index]) return;
          m[index][field] = this.value;
          setMeds(m);
        };
      })(inputs[i].getAttribute('data-field'), idx));
    }

    // Remove button
    tr.querySelector('[data-action="remove"]').addEventListener('click', function () {
      var m = getMeds();
      m.splice(idx, 1);
      setMeds(m);
      renderList();
    });

    return tr;
  }

  function buildRouteSelect(val) {
    var routes = ['Oral', 'Topical', 'Inhaled', 'SC', 'IM', 'IV', 'PR', 'SL', 'Patch', 'Other'];
    var html = '<select class="form-select form-select-sm border-0" data-field="route">';
    for (var i = 0; i < routes.length; i++) {
      html += '<option' + (val === routes[i] ? ' selected' : '') + '>' + routes[i] + '</option>';
    }
    html += '</select>';
    return html;
  }

  function buildCategorySelect(val) {
    var html = '<select class="form-select form-select-sm border-0" data-field="category">';
    html += '<option value="">—</option>';
    for (var i = 0; i < CATEGORIES.length; i++) {
      html += '<option' + (val === CATEGORIES[i] ? ' selected' : '') + '>' + CATEGORIES[i] + '</option>';
    }
    html += '</select>';
    return html;
  }

  function esc(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  // ═══════════════════════════════════════════
  //  PUBLIC API
  // ═══════════════════════════════════════════

  return {
    render: render,
    getMeds: getMeds,
    CATEGORIES: CATEGORIES
  };
})();
