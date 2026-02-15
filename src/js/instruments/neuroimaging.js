/* ═══════════════════════════════════════════════════════════════
   BHM.Instruments.Neuroimaging — Scan findings & visual rating scales
   Modality-aware: shows only clinically relevant structured fields
   ═══════════════════════════════════════════════════════════════ */
var BHM = window.BHM || {};
BHM.Instruments = BHM.Instruments || {};

BHM.Instruments.Neuroimaging = (function () {
  'use strict';

  var S = BHM.State;
  var SP = 'neuroimaging';

  // ═══════════════════════════════════════════
  //  SCALE & OPTION DEFINITIONS
  // ═══════════════════════════════════════════

  var MODALITIES = [
    'MRI Brain', 'CT Head', 'FDG-PET', 'Amyloid PET', 'Tau PET',
    'DaT-SPECT', 'MIBG', 'EEG', 'Other'
  ];

  var FAZEKAS_PV = [
    { value: 0, label: '0 — Absent' },
    { value: 1, label: '1 — Caps or thin lining (pencil-thin)' },
    { value: 2, label: '2 — Smooth halo' },
    { value: 3, label: '3 — Irregular, extending into deep white matter' }
  ];
  var FAZEKAS_DWM = [
    { value: 0, label: '0 — Absent' },
    { value: 1, label: '1 — Punctate foci' },
    { value: 2, label: '2 — Beginning confluence' },
    { value: 3, label: '3 — Large confluent areas' }
  ];
  var GCA = [
    { value: 0, label: '0 — No cortical atrophy' },
    { value: 1, label: '1 — Mild: some opening of sulci' },
    { value: 2, label: '2 — Moderate: volume loss of gyri' },
    { value: 3, label: '3 — Severe: knife-blade atrophy' }
  ];
  var KOEDAM = [
    { value: 0, label: '0 — No posterior atrophy' },
    { value: 1, label: '1 — Mild: some widening of posterior sulci' },
    { value: 2, label: '2 — Moderate: substantial parietal atrophy' },
    { value: 3, label: '3 — Severe: end-stage parietal atrophy' }
  ];
  var MTA = [
    { value: 0, label: '0 — No atrophy' },
    { value: 1, label: '1 — Widening of choroid fissure only' },
    { value: 2, label: '2 — Also widening of temporal horn' },
    { value: 3, label: '3 — Moderate hippocampal volume loss' },
    { value: 4, label: '4 — Severe hippocampal volume loss' }
  ];

  var POS_NEG = [
    { value: 'positive',  label: 'Positive' },
    { value: 'negative',  label: 'Negative' },
    { value: 'equivocal', label: 'Equivocal' }
  ];
  var NORM_ABNORM = [
    { value: 'normal',   label: 'Normal' },
    { value: 'abnormal', label: 'Abnormal' }
  ];
  var EEG_PATTERN = [
    { value: 'normal',              label: 'Normal' },
    { value: 'generalised_slow',    label: 'Generalised slowing' },
    { value: 'focal_slow',          label: 'Focal slowing' },
    { value: 'periodic_discharges', label: 'Periodic discharges' },
    { value: 'epileptiform',        label: 'Epileptiform activity' },
    { value: 'other',               label: 'Other' }
  ];
  var EEG_SLOW = [
    { value: 'none',     label: 'None' },
    { value: 'mild',     label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'severe',   label: 'Severe' }
  ];
  var FDG_PATTERN = [
    { value: 'normal',  label: 'Normal' },
    { value: 'ad',      label: 'AD-typical (temporoparietal)' },
    { value: 'ftd',     label: 'FTD-typical (frontal / anterior temporal)' },
    { value: 'dlb',     label: 'DLB-typical (occipital +/- temporoparietal)' },
    { value: 'other',   label: 'Other pattern' }
  ];
  var BRAAK = [
    { value: 'I',   label: 'I — Entorhinal' },
    { value: 'II',  label: 'II — Hippocampus' },
    { value: 'III', label: 'III — Inferior temporal' },
    { value: 'IV',  label: 'IV — Lateral temporal / parietal' },
    { value: 'V',   label: 'V — Prefrontal' },
    { value: 'VI',  label: 'VI — Widespread' }
  ];
  var LATERALITY = [
    { value: 'symmetric',  label: 'Symmetric / bilateral' },
    { value: 'left',       label: 'Left > Right' },
    { value: 'right',      label: 'Right > Left' }
  ];

  // ═══════════════════════════════════════════
  //  EMPTY SCAN TEMPLATE (all possible fields)
  // ═══════════════════════════════════════════

  function emptyScan() {
    return {
      modality: 'MRI Brain', scanDate: '', location: '',
      // MRI structural
      fazekasPV: null, fazekasDWM: null, gca: null, koedam: null,
      mtaLeft: null, mtaRight: null,
      microbleeds: '', lacunes: '', strategicInfarcts: '',
      // FDG-PET
      fdgPattern: '', fdgRegions: '',
      // Amyloid PET
      amyloidResult: '', centiloid: '', amyloidNotes: '',
      // Tau PET
      tauResult: '', tauBraak: '', tauRegions: '',
      // DaT-SPECT
      datResult: '', datLaterality: '', datPattern: '',
      // MIBG
      mibgResult: '', mibgHMEarly: '', mibgHMDelayed: '',
      // EEG
      eegPattern: '', eegSlowing: '', eegPDR: '', eegNotes: '',
      // Universal
      otherFindings: '', clinicianInterpretation: ''
    };
  }

  // ═══════════════════════════════════════════
  //  STATE HELPERS
  // ═══════════════════════════════════════════

  function getScans() { return S.get(SP + '.scans') || []; }
  function setScans(list) { S.set(SP + '.scans', list); triggerReport(); }
  function triggerReport() {
    if (BHM.Scoring && BHM.Scoring.triggerReport) BHM.Scoring.triggerReport();
    else if (BHM.Report && BHM.Report.update) BHM.Report.update();
  }

  // ═══════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════

  var _listDiv; // keep reference so modality change can re-render

  function render(container) {
    container.innerHTML = '';
    var card = document.createElement('div');
    card.className = 'instrument-card';
    card.innerHTML =
      '<h5><i class="bi bi-image me-2"></i>Neuroimaging</h5>' +
      '<p class="instrument-subtitle">Record scan findings and visual rating scale scores. ' +
      'You can add multiple scans if more than one imaging study has been reviewed.</p>';

    _listDiv = document.createElement('div');
    _listDiv.id = 'neuroimaging-list';
    card.appendChild(_listDiv);

    var addRow = document.createElement('div');
    addRow.className = 'mt-3';
    var addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn btn-outline-primary btn-sm';
    addBtn.innerHTML = '<i class="bi bi-plus-circle me-1"></i>Add Scan';
    addBtn.addEventListener('click', function () {
      var scans = getScans();
      scans.push(emptyScan());
      setScans(scans);
      renderList();
    });
    addRow.appendChild(addBtn);
    card.appendChild(addRow);

    container.appendChild(card);
    renderList();
  }

  function renderList() {
    _listDiv.innerHTML = '';
    var scans = getScans();
    if (scans.length === 0) {
      _listDiv.innerHTML = '<div class="text-muted text-center py-3" style="font-size:0.88rem">' +
        '<i class="bi bi-info-circle me-1"></i>No scans recorded. Click "Add Scan" to begin.</div>';
      return;
    }
    for (var i = 0; i < scans.length; i++) {
      _listDiv.appendChild(createScanCard(scans, i));
    }
  }

  // ═══════════════════════════════════════════
  //  SCAN CARD
  // ═══════════════════════════════════════════

  function createScanCard(scans, idx) {
    var scan = scans[idx];
    var card = document.createElement('div');
    card.className = 'card mb-3';

    // ── Header ──
    var header = document.createElement('div');
    header.className = 'card-header d-flex align-items-center justify-content-between py-2';
    header.innerHTML = '<strong><i class="bi bi-image me-1"></i>Scan ' + (idx + 1) + '</strong>';
    var removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-outline-danger btn-sm';
    removeBtn.innerHTML = '<i class="bi bi-trash"></i>';
    removeBtn.addEventListener('click', function () {
      scans.splice(idx, 1);
      setScans(scans);
      renderList();
    });
    header.appendChild(removeBtn);
    card.appendChild(header);

    var body = document.createElement('div');
    body.className = 'card-body p-3';

    // ── Row 1: Modality, Date, Location ──
    var r1 = document.createElement('div');
    r1.className = 'row g-2 mb-3';
    r1.innerHTML =
      '<div class="col-md-4">' +
        '<label class="form-label small fw-bold">Modality</label>' +
        '<select class="form-select form-select-sm" data-field="modality">' +
          MODALITIES.map(function (m) { return '<option' + (scan.modality === m ? ' selected' : '') + '>' + m + '</option>'; }).join('') +
        '</select>' +
      '</div>' +
      '<div class="col-md-4">' +
        '<label class="form-label small fw-bold">Date of Scan</label>' +
        '<input type="date" class="form-control form-control-sm" data-field="scanDate" value="' + (scan.scanDate || '') + '">' +
      '</div>' +
      '<div class="col-md-4">' +
        '<label class="form-label small fw-bold">Location / Scanner</label>' +
        '<input type="text" class="form-control form-control-sm" data-field="location" value="' + esc(scan.location || '') + '" placeholder="e.g. Salford Royal 3T">' +
      '</div>';
    body.appendChild(r1);

    // ── Modality-specific structured fields ──
    var fieldsDiv = document.createElement('div');
    fieldsDiv.className = 'neuroimaging-fields';
    renderModalityFields(fieldsDiv, scan);
    body.appendChild(fieldsDiv);

    // ── Universal: Other findings / Interpretation ──
    var notesDiv = document.createElement('div');
    notesDiv.className = 'mt-2';
    notesDiv.innerHTML =
      '<div class="mb-2">' +
        '<label class="form-label small fw-bold">Other Findings</label>' +
        '<textarea class="form-control form-control-sm" data-field="otherFindings" rows="2" placeholder="e.g. Incidental meningioma, old subdural, etc.">' + esc(scan.otherFindings || '') + '</textarea>' +
      '</div>' +
      '<div>' +
        '<label class="form-label small fw-bold">Clinician Interpretation</label>' +
        '<textarea class="form-control form-control-sm" data-field="clinicianInterpretation" rows="3" placeholder="Your summary of the imaging findings and their clinical significance...">' + esc(scan.clinicianInterpretation || '') + '</textarea>' +
      '</div>';
    body.appendChild(notesDiv);

    card.appendChild(body);

    // ── Bind inputs ──
    bindInputs(card, scans, idx, fieldsDiv);

    return card;
  }

  // ═══════════════════════════════════════════
  //  MODALITY-SPECIFIC FIELDS
  // ═══════════════════════════════════════════

  function renderModalityFields(container, scan) {
    container.innerHTML = '';
    var mod = scan.modality || '';

    if (mod === 'MRI Brain') {
      container.innerHTML = renderMRI(scan);
    } else if (mod === 'CT Head') {
      container.innerHTML = renderCT(scan);
    } else if (mod === 'FDG-PET') {
      container.innerHTML = renderFDG(scan);
    } else if (mod === 'Amyloid PET') {
      container.innerHTML = renderAmyloid(scan);
    } else if (mod === 'Tau PET') {
      container.innerHTML = renderTau(scan);
    } else if (mod === 'DaT-SPECT') {
      container.innerHTML = renderDaT(scan);
    } else if (mod === 'MIBG') {
      container.innerHTML = renderMIBG(scan);
    } else if (mod === 'EEG') {
      container.innerHTML = renderEEG(scan);
    }
    // 'Other' → no structured fields, just the universal text boxes
  }

  // ── MRI Brain: full set ──
  function renderMRI(scan) {
    return scaleHeading('Visual Rating Scales') +
      row2(
        labelled('Fazekas — Periventricular', buildSelect('fazekasPV', FAZEKAS_PV, scan.fazekasPV)),
        labelled('Fazekas — Deep White Matter', buildSelect('fazekasDWM', FAZEKAS_DWM, scan.fazekasDWM))
      ) +
      row2(
        labelled('GCA — Global Cortical Atrophy (Pasquier)', buildSelect('gca', GCA, scan.gca)),
        labelled('Koedam — Posterior Atrophy', buildSelect('koedam', KOEDAM, scan.koedam))
      ) +
      row2(
        labelled('MTA — Left (Scheltens)', buildSelect('mtaLeft', MTA, scan.mtaLeft)),
        labelled('MTA — Right (Scheltens)', buildSelect('mtaRight', MTA, scan.mtaRight))
      ) +
      scaleHeading('Structural Findings') +
      row3(
        labelled('Microbleeds', textInput('microbleeds', scan.microbleeds, 'e.g. None / 3 lobar')),
        labelled('Lacunes', textInput('lacunes', scan.lacunes, 'e.g. None / 2 basal ganglia')),
        labelled('Strategic Infarcts', textInput('strategicInfarcts', scan.strategicInfarcts, 'e.g. None / left thalamic'))
      );
  }

  // ── CT Head: GCA, rough MTA, structural lesions (no Fazekas, no Koedam) ──
  function renderCT(scan) {
    return scaleHeading('Visual Rating Scales') +
      row2(
        labelled('GCA — Global Cortical Atrophy (Pasquier)', buildSelect('gca', GCA, scan.gca)),
        ''
      ) +
      row2(
        labelled('MTA — Left (Scheltens)', buildSelect('mtaLeft', MTA, scan.mtaLeft)),
        labelled('MTA — Right (Scheltens)', buildSelect('mtaRight', MTA, scan.mtaRight))
      ) +
      scaleHeading('Structural Findings') +
      row3(
        labelled('Lacunes', textInput('lacunes', scan.lacunes, 'e.g. None / 2 basal ganglia')),
        labelled('Strategic Infarcts', textInput('strategicInfarcts', scan.strategicInfarcts, 'e.g. None / left thalamic')),
        ''
      );
  }

  // ── FDG-PET: metabolic pattern ──
  function renderFDG(scan) {
    return scaleHeading('Metabolic Pattern') +
      row2(
        labelled('Overall Pattern', buildSelectStr('fdgPattern', FDG_PATTERN, scan.fdgPattern)),
        ''
      ) +
      '<div class="mb-2">' +
        '<label class="form-label small fw-bold">Regions of Hypometabolism</label>' +
        '<textarea class="form-control form-control-sm" data-field="fdgRegions" rows="2" placeholder="e.g. bilateral temporoparietal and posterior cingulate hypometabolism">' + esc(scan.fdgRegions || '') + '</textarea>' +
      '</div>';
  }

  // ── Amyloid PET ──
  function renderAmyloid(scan) {
    return scaleHeading('Amyloid Status') +
      row2(
        labelled('Result', buildSelectStr('amyloidResult', POS_NEG, scan.amyloidResult)),
        labelled('Centiloid', textInput('centiloid', scan.centiloid, 'e.g. 45'))
      ) +
      '<div class="mb-2">' +
        '<label class="form-label small fw-bold">Notes</label>' +
        '<textarea class="form-control form-control-sm" data-field="amyloidNotes" rows="2" placeholder="e.g. Regional distribution, comparison with prior scan...">' + esc(scan.amyloidNotes || '') + '</textarea>' +
      '</div>';
  }

  // ── Tau PET ──
  function renderTau(scan) {
    return scaleHeading('Tau Imaging') +
      row2(
        labelled('Result', buildSelectStr('tauResult', POS_NEG, scan.tauResult)),
        labelled('Braak Stage', buildSelectStr('tauBraak', BRAAK, scan.tauBraak))
      ) +
      '<div class="mb-2">' +
        '<label class="form-label small fw-bold">Regional Uptake</label>' +
        '<textarea class="form-control form-control-sm" data-field="tauRegions" rows="2" placeholder="e.g. Elevated tracer uptake in bilateral inferior temporal and parietal cortices">' + esc(scan.tauRegions || '') + '</textarea>' +
      '</div>';
  }

  // ── DaT-SPECT ──
  function renderDaT(scan) {
    return scaleHeading('Dopamine Transporter Imaging') +
      row2(
        labelled('Result', buildSelectStr('datResult', NORM_ABNORM, scan.datResult)),
        labelled('Laterality', buildSelectStr('datLaterality', LATERALITY, scan.datLaterality))
      ) +
      '<div class="mb-2">' +
        '<label class="form-label small fw-bold">Pattern Description</label>' +
        '<textarea class="form-control form-control-sm" data-field="datPattern" rows="2" placeholder="e.g. Reduced bilateral putaminal uptake, worse on the left">' + esc(scan.datPattern || '') + '</textarea>' +
      '</div>';
  }

  // ── MIBG ──
  function renderMIBG(scan) {
    return scaleHeading('Cardiac Sympathetic Innervation') +
      row2(
        labelled('Result', buildSelectStr('mibgResult', NORM_ABNORM, scan.mibgResult)),
        ''
      ) +
      row2(
        labelled('H/M Ratio — Early', textInput('mibgHMEarly', scan.mibgHMEarly, 'e.g. 2.1')),
        labelled('H/M Ratio — Delayed', textInput('mibgHMDelayed', scan.mibgHMDelayed, 'e.g. 1.8'))
      );
  }

  // ── EEG ──
  function renderEEG(scan) {
    return scaleHeading('Electroencephalography') +
      row2(
        labelled('Overall Pattern', buildSelectStr('eegPattern', EEG_PATTERN, scan.eegPattern)),
        labelled('Background Slowing', buildSelectStr('eegSlowing', EEG_SLOW, scan.eegSlowing))
      ) +
      row2(
        labelled('Posterior Dominant Rhythm (Hz)', textInput('eegPDR', scan.eegPDR, 'e.g. 9 Hz')),
        ''
      ) +
      '<div class="mb-2">' +
        '<label class="form-label small fw-bold">Additional EEG Notes</label>' +
        '<textarea class="form-control form-control-sm" data-field="eegNotes" rows="2" placeholder="e.g. Intermittent generalised theta slowing, no epileptiform discharges">' + esc(scan.eegNotes || '') + '</textarea>' +
      '</div>';
  }

  // ═══════════════════════════════════════════
  //  HTML BUILDER HELPERS
  // ═══════════════════════════════════════════

  function scaleHeading(text) {
    return '<h6 class="mb-2 mt-2" style="font-size:0.9rem"><i class="bi bi-rulers me-1"></i>' + text + '</h6>';
  }
  function labelled(label, inputHtml) {
    if (!inputHtml) return '';
    return '<label class="form-label small fw-bold">' + label + '</label>' + inputHtml;
  }
  function row2(col1, col2) {
    return '<div class="row g-2 mb-2">' +
      '<div class="col-md-6">' + col1 + '</div>' +
      '<div class="col-md-6">' + col2 + '</div>' +
    '</div>';
  }
  function row3(c1, c2, c3) {
    return '<div class="row g-2 mb-2">' +
      '<div class="col-md-4">' + c1 + '</div>' +
      '<div class="col-md-4">' + c2 + '</div>' +
      '<div class="col-md-4">' + c3 + '</div>' +
    '</div>';
  }
  function textInput(field, val, placeholder) {
    return '<input type="text" class="form-control form-control-sm" data-field="' + field + '" value="' + esc(val || '') + '" placeholder="' + (placeholder || '') + '">';
  }

  function buildSelect(field, options, currentVal) {
    var html = '<select class="form-select form-select-sm" data-field="' + field + '">';
    html += '<option value="">— Not rated —</option>';
    for (var i = 0; i < options.length; i++) {
      var sel = (currentVal !== null && currentVal !== undefined && currentVal !== '' && parseInt(currentVal, 10) === options[i].value) ? ' selected' : '';
      html += '<option value="' + options[i].value + '"' + sel + '>' + options[i].label + '</option>';
    }
    html += '</select>';
    return html;
  }

  function buildSelectStr(field, options, currentVal) {
    var html = '<select class="form-select form-select-sm" data-field="' + field + '">';
    html += '<option value="">— Select —</option>';
    for (var i = 0; i < options.length; i++) {
      var sel = (currentVal === options[i].value) ? ' selected' : '';
      html += '<option value="' + options[i].value + '"' + sel + '>' + options[i].label + '</option>';
    }
    html += '</select>';
    return html;
  }

  // ═══════════════════════════════════════════
  //  INPUT BINDING
  // ═══════════════════════════════════════════

  var NUMERIC_FIELDS = /^(fazekasPV|fazekasDWM|gca|koedam|mtaLeft|mtaRight)$/;

  function bindInputs(card, scans, idx, fieldsDiv) {
    var allInputs = card.querySelectorAll('[data-field]');
    for (var i = 0; i < allInputs.length; i++) {
      var el = allInputs[i];
      var field = el.getAttribute('data-field');

      // Special: modality change re-renders fields
      if (field === 'modality') {
        el.addEventListener('change', (function (index, fDiv) {
          return function () {
            var s = getScans();
            if (!s[index]) return;
            s[index].modality = this.value;
            setScans(s);
            renderModalityFields(fDiv, s[index]);
            // Re-bind the newly rendered fields
            bindFieldInputs(fDiv, s, index);
          };
        })(idx, fieldsDiv));
        continue;
      }

      attachFieldHandler(el, field, scans, idx);
    }
  }

  function bindFieldInputs(container, scans, idx) {
    var inputs = container.querySelectorAll('[data-field]');
    for (var i = 0; i < inputs.length; i++) {
      attachFieldHandler(inputs[i], inputs[i].getAttribute('data-field'), scans, idx);
    }
  }

  function attachFieldHandler(el, field, scans, idx) {
    var handler = function () {
      var s = getScans();
      if (!s[idx]) return;
      var val = el.value;
      if (NUMERIC_FIELDS.test(field)) val = val === '' ? null : parseInt(val, 10);
      s[idx][field] = val;
      setScans(s);
    };
    el.addEventListener('change', handler);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.addEventListener('input', handler);
    }
  }

  // ═══════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════

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
    getScans: getScans,
    FAZEKAS_PV: FAZEKAS_PV,
    FAZEKAS_DWM: FAZEKAS_DWM,
    GCA: GCA,
    KOEDAM: KOEDAM,
    MTA: MTA
  };
})();
