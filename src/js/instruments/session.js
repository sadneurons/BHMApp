/* ═══════════════════════════════════════════════════════
   BHM.Instruments.Session — Session & Patient Identifiers
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};
BHM.Instruments = BHM.Instruments || {};

BHM.Instruments.Session = (function () {
  'use strict';
  var F = BHM.ClickableGrid;  // shorthand for field helpers

  function render(container) {
    container.innerHTML = '';

    var card = document.createElement('div');
    card.className = 'instrument-card';

    card.innerHTML =
      '<h5>Assessment Session</h5>' +
      '<p class="instrument-subtitle">Enter session identifiers and context before transcribing booklet responses.</p>';

    // ── Session metadata ──
    var metaSection = document.createElement('div');
    metaSection.innerHTML = '<h6 class="mt-3 mb-3"><i class="bi bi-gear me-1"></i>Session Metadata</h6>';

    var metaRow = document.createElement('div');
    metaRow.className = 'row g-3';

    metaRow.appendChild(wrapCol(F.createField({
      label: 'Operator Name / Initials',
      statePath: 'meta.operator',
      placeholder: 'e.g. JD'
    }), 'col-md-4'));

    metaRow.appendChild(wrapCol(F.createField({
      label: 'Date of Completion',
      statePath: 'patient.dateOfCompletion',
      type: 'date'
    }), 'col-md-4'));

    var modeDiv = document.createElement('div');
    modeDiv.className = 'col-md-4 bhm-field-group';
    var modeLabel = document.createElement('label');
    modeLabel.textContent = 'Entry Mode';
    modeDiv.appendChild(modeLabel);
    var modeSelect = F.createField({
      label: '',
      statePath: 'meta.sourceMode',
      type: 'select',
      options: [
        { value: 'transcribed', label: 'Transcribed from paper' },
        { value: 'live', label: 'Completed live on screen' }
      ]
    });
    metaRow.appendChild(wrapCol(modeSelect, 'col-md-4'));

    metaSection.appendChild(metaRow);
    card.appendChild(metaSection);

    // ── Patient identifiers ──
    var patientSection = document.createElement('div');
    patientSection.innerHTML = '<h6 class="mt-4 mb-3"><i class="bi bi-person me-1"></i>Patient Identifiers</h6>';

    var patRow = document.createElement('div');
    patRow.className = 'row g-3';

    patRow.appendChild(wrapCol(F.createField({
      label: 'Patient Name',
      statePath: 'patient.name',
      placeholder: 'As shown on booklet'
    }), 'col-md-4'));

    patRow.appendChild(wrapCol(F.createField({
      label: 'Date of Birth',
      statePath: 'patient.dob',
      type: 'date'
    }), 'col-md-3'));

    // Auto-calculated age display
    var ageCol = document.createElement('div');
    ageCol.className = 'col-md-1';
    var ageGroup = document.createElement('div');
    ageGroup.className = 'bhm-field-group';
    ageGroup.innerHTML =
      '<label class="form-label small fw-bold">Age</label>' +
      '<div class="form-control form-control-sm text-center fw-bold" style="background:var(--bs-tertiary-bg,#f8f9fa)" id="session-age-display">—</div>';
    ageCol.appendChild(ageGroup);
    patRow.appendChild(ageCol);

    patRow.appendChild(wrapCol(F.createField({
      label: 'Sex',
      statePath: 'patient.sex',
      type: 'select',
      options: ['Male', 'Female']
    }), 'col-md-2'));

    patRow.appendChild(wrapCol(F.createField({
      label: 'EPR Number',
      statePath: 'patient.nhsNumber',
      placeholder: 'Optional',
      helpText: 'Optional — for clinical linking'
    }), 'col-md-2'));

    patientSection.appendChild(patRow);

    // ── Age auto-calculation on DOB change ──
    function updateAge() {
      var dob = BHM.State.get('patient.dob');
      var el = document.getElementById('session-age-display');
      if (!el) return;
      if (dob) {
        var b = new Date(dob);
        var now = new Date();
        var age = now.getFullYear() - b.getFullYear();
        var m = now.getMonth() - b.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
        el.textContent = age;
      } else {
        el.textContent = '—';
      }
    }
    BHM.State.subscribe(function (path) {
      if (path === 'patient.dob') updateAge();
    });
    updateAge();

    card.appendChild(patientSection);

    // ── Clinician / Informant ──
    var clinSection = document.createElement('div');
    clinSection.innerHTML = '<h6 class="mt-4 mb-3"><i class="bi bi-clipboard2-pulse me-1"></i>Clinician & Informant</h6>';

    var clinRow = document.createElement('div');
    clinRow.className = 'row g-3';

    clinRow.appendChild(wrapCol(F.createField({
      label: 'Clinician Name',
      statePath: 'patient.clinicianName',
      placeholder: 'Assessing clinician'
    }), 'col-md-3'));

    clinRow.appendChild(wrapCol(F.createField({
      label: 'Referring GP / Clinician',
      statePath: 'patient.referringGP',
      placeholder: 'e.g. Dr A. Smith'
    }), 'col-md-3'));

    clinRow.appendChild(wrapCol(F.createField({
      label: 'Informant Name',
      statePath: 'patient.informantName',
      placeholder: 'Friend or relative'
    }), 'col-md-3'));

    clinRow.appendChild(wrapCol(F.createField({
      label: 'Informant Relationship',
      statePath: 'patient.informantRelationship',
      type: 'select',
      options: [
        'Spouse / Partner', 'Son / Daughter', 'Sibling',
        'Friend', 'Carer', 'Other'
      ]
    }), 'col-md-3'));

    clinSection.appendChild(clinRow);
    card.appendChild(clinSection);

    // ── Session actions ──
    var actionsDiv = document.createElement('div');
    actionsDiv.className = 'mt-4 pt-3 border-top d-flex gap-2';
    var newBtn = document.createElement('button');
    newBtn.className = 'btn btn-outline-danger btn-sm';
    newBtn.innerHTML = '<i class="bi bi-plus-circle me-1"></i>New Session (clear all)';
    newBtn.addEventListener('click', function () {
      if (confirm('This will clear all data and start a new session. Are you sure?')) {
        BHM.State.clearSession();
        BHM.App.renderAll();
      }
    });
    actionsDiv.appendChild(newBtn);
    card.appendChild(actionsDiv);

    container.appendChild(card);
  }

  function wrapCol(el, colClass) {
    var col = document.createElement('div');
    col.className = colClass;
    col.appendChild(el);
    return col;
  }

  return { render: render };
})();
