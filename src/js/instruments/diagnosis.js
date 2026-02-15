/* ═══════════════════════════════════════════════════════════════
   BHM.Instruments.Diagnosis — Multi-axis diagnostic coding
   Searchable combobox with SNOMED-CT & ICD-10 codes
   Supports multiple concurrent diagnoses with qualifiers
   ═══════════════════════════════════════════════════════════════ */
var BHM = window.BHM || {};
BHM.Instruments = BHM.Instruments || {};

BHM.Instruments.Diagnosis = (function () {
  'use strict';

  var S = BHM.State;
  var SP = 'diagnoses';

  // ═══════════════════════════════════════════
  //  DIAGNOSIS CATALOGUE
  // ═══════════════════════════════════════════

  var DIAGNOSES = [
    // ── Mild Cognitive Impairment ──
    { id: 'mci',           label: 'Mild cognitive impairment, unspecified',             snomed: '386805003',      icd10: 'F06.7',  category: 'Mild Cognitive Impairment' },
    { id: 'mci_amnestic',  label: 'MCI — amnestic type',                               snomed: '698691002',      icd10: 'F06.7',  category: 'Mild Cognitive Impairment' },
    { id: 'mci_nonamnestic', label: 'MCI — non-amnestic type',                          snomed: '698692009',      icd10: 'F06.7',  category: 'Mild Cognitive Impairment' },
    { id: 'mci_multidomain', label: 'MCI — multi-domain',                               snomed: '698693004',      icd10: 'F06.7',  category: 'Mild Cognitive Impairment' },

    // ── Alzheimer's Disease ──
    { id: 'ad',            label: "Alzheimer's disease",                                snomed: '26929004',       icd10: 'G30.9',  category: "Alzheimer's Disease" },
    { id: 'ad_early',      label: "Alzheimer's disease, early onset (<65)",             snomed: '416780008',      icd10: 'G30.0',  category: "Alzheimer's Disease" },
    { id: 'ad_late',       label: "Alzheimer's disease, late onset (≥65)",              snomed: '416975007',      icd10: 'G30.1',  category: "Alzheimer's Disease" },
    { id: 'ad_dementia',   label: "Dementia due to Alzheimer's disease",                snomed: '15662003',       icd10: 'F00.9',  category: "Alzheimer's Disease" },
    { id: 'ad_atypical',   label: "Atypical Alzheimer's disease",                       snomed: '230258005',      icd10: 'F00.2',  category: "Alzheimer's Disease" },

    // ── Vascular ──
    { id: 'vad',           label: 'Vascular dementia',                                  snomed: '429998004',      icd10: 'F01.9',  category: 'Vascular' },
    { id: 'vad_acute',     label: 'Vascular dementia, acute onset',                     snomed: '230285002',      icd10: 'F01.0',  category: 'Vascular' },
    { id: 'vad_multi',     label: 'Multi-infarct dementia',                             snomed: '56267009',       icd10: 'F01.1',  category: 'Vascular' },
    { id: 'vad_subcort',   label: 'Subcortical vascular dementia',                      snomed: '230286001',      icd10: 'F01.2',  category: 'Vascular' },
    { id: 'csvd',          label: 'Cerebral small vessel disease',                      snomed: '266257000',      icd10: 'I67.8',  category: 'Vascular' },
    { id: 'vci',           label: 'Vascular cognitive impairment (not dementia)',        snomed: '127295002',      icd10: 'F06.7',  category: 'Vascular' },

    // ── Lewy Body Spectrum ──
    { id: 'dlb',           label: 'Dementia with Lewy bodies',                          snomed: '312991009',      icd10: 'G31.83', category: 'Lewy Body Spectrum' },
    { id: 'pdd',           label: "Parkinson's disease dementia",                       snomed: '425390006',      icd10: 'F02.3',  category: 'Lewy Body Spectrum' },

    // ── Frontotemporal ──
    { id: 'ftd',           label: 'Frontotemporal dementia, unspecified',               snomed: '230270009',      icd10: 'G31.0',  category: 'Frontotemporal' },
    { id: 'bvftd',         label: 'Behavioural variant FTD (bvFTD)',                    snomed: '723123001',      icd10: 'G31.0',  category: 'Frontotemporal' },
    { id: 'pnfa',          label: 'Progressive non-fluent aphasia (nfvPPA)',            snomed: '230269005',      icd10: 'G31.0',  category: 'Frontotemporal' },
    { id: 'sd',            label: 'Semantic dementia (svPPA)',                           snomed: '230268002',      icd10: 'G31.0',  category: 'Frontotemporal' },
    { id: 'lpa',           label: 'Logopenic progressive aphasia (lvPPA)',              snomed: '723390000',      icd10: 'G31.0',  category: 'Frontotemporal' },

    // ── Other Neurodegenerative ──
    { id: 'pca',           label: 'Posterior cortical atrophy',                          snomed: '715737004',      icd10: 'G31.8',  category: 'Other Neurodegenerative' },
    { id: 'cbs',           label: 'Corticobasal syndrome',                               snomed: '71028004',       icd10: 'G31.8',  category: 'Other Neurodegenerative' },
    { id: 'psp',           label: 'Progressive supranuclear palsy',                      snomed: '14020002',       icd10: 'G23.1',  category: 'Other Neurodegenerative' },
    { id: 'nph',           label: 'Normal pressure hydrocephalus',                       snomed: '7011001',        icd10: 'G91.2',  category: 'Other Neurodegenerative' },
    { id: 'cjd',           label: 'Creutzfeldt-Jakob disease',                           snomed: '21837003',       icd10: 'A81.0',  category: 'Other Neurodegenerative' },
    { id: 'hd',            label: "Huntington's disease",                                snomed: '58756001',       icd10: 'G10',    category: 'Other Neurodegenerative' },
    { id: 'arbd',          label: 'Alcohol-related brain damage (Korsakoff)',            snomed: '69482004',       icd10: 'F10.6',  category: 'Other Neurodegenerative' },
    { id: 'msa',           label: 'Multiple system atrophy',                             snomed: '230275009',      icd10: 'G90.3',  category: 'Other Neurodegenerative' },

    // ── Mixed / Unspecified Dementia ──
    { id: 'mixed_ad_vasc', label: "Mixed dementia (Alzheimer's + vascular)",            snomed: '79341000119107', icd10: 'F00.2',  category: 'Mixed / Unspecified' },
    { id: 'dementia_unspec', label: 'Dementia, unspecified',                             snomed: '52448006',       icd10: 'F03',    category: 'Mixed / Unspecified' },
    { id: 'yod',           label: 'Young-onset dementia, unspecified',                   snomed: '420614009',      icd10: 'F03',    category: 'Mixed / Unspecified' },

    // ── Subjective / Functional ──
    { id: 'scd',           label: 'Subjective cognitive decline',                        snomed: '762564009',      icd10: 'R41.8',  category: 'Subjective / Functional' },
    { id: 'fcd',           label: 'Functional cognitive disorder',                       snomed: '762509008',      icd10: 'F45.8',  category: 'Subjective / Functional' },
    { id: 'no_impairment', label: 'No cognitive impairment identified',                  snomed: '1255527001',     icd10: 'Z03.8',  category: 'Subjective / Functional' },

    // ── Psychiatric Comorbidity ──
    { id: 'depression',    label: 'Depressive episode',                                  snomed: '35489007',       icd10: 'F32.9',  category: 'Psychiatric' },
    { id: 'depression_rec', label: 'Recurrent depressive disorder',                      snomed: '268621008',      icd10: 'F33.9',  category: 'Psychiatric' },
    { id: 'gad',           label: 'Generalised anxiety disorder',                        snomed: '21897009',       icd10: 'F41.1',  category: 'Psychiatric' },
    { id: 'psychosis',     label: 'Late-life psychosis',                                 snomed: '37868008',       icd10: 'F06.2',  category: 'Psychiatric' },
    { id: 'ptsd',          label: 'Post-traumatic stress disorder',                      snomed: '47505003',       icd10: 'F43.1',  category: 'Psychiatric' },
    { id: 'delirium',      label: 'Delirium',                                            snomed: '2776000',        icd10: 'F05.9',  category: 'Psychiatric' },

    // ── Other Medical ──
    { id: 'osa',           label: 'Obstructive sleep apnoea',                            snomed: '78275009',       icd10: 'G47.3',  category: 'Other Medical' },
    { id: 'b12_def',       label: 'Vitamin B12 deficiency',                              snomed: '190634004',      icd10: 'E53.8',  category: 'Other Medical' },
    { id: 'hypothyroid',   label: 'Hypothyroidism',                                      snomed: '40930008',       icd10: 'E03.9',  category: 'Other Medical' },
    { id: 'hearing_loss',  label: 'Hearing loss',                                        snomed: '15188001',       icd10: 'H91.9',  category: 'Other Medical' },
    { id: 'tbi',           label: 'Traumatic brain injury',                              snomed: '127295002',      icd10: 'S06.9',  category: 'Other Medical' }
  ];

  var QUALIFIERS = [
    { id: 'biomarker_supported',  label: 'Biomarker-supported' },
    { id: 'clinically_established', label: 'Clinically established' },
    { id: 'probable',             label: 'Probable' },
    { id: 'possible',            label: 'Possible' },
    { id: 'prodromal',           label: 'Prodromal' },
    { id: 'preclinical',         label: 'Preclinical' },
    { id: 'with_behavioural',    label: 'With behavioural disturbance' },
    { id: 'without_behavioural', label: 'Without behavioural disturbance' },
    { id: 'with_psychosis',      label: 'With psychotic features' },
    { id: 'suspected',           label: 'Suspected' }
  ];

  // ═══════════════════════════════════════════
  //  STATE HELPERS
  // ═══════════════════════════════════════════

  function getDiagnoses() {
    return S.get(SP) || [];
  }

  function setDiagnoses(list) {
    S.set(SP, list);
    updateReport();
  }

  function updateReport() {
    if (BHM.Scoring && BHM.Scoring.triggerReport) BHM.Scoring.triggerReport();
    else if (BHM.Report && BHM.Report.update) BHM.Report.update();
  }

  // ═══════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════

  function render(container) {
    container.innerHTML = '';

    var card = document.createElement('div');
    card.className = 'instrument-card';

    card.innerHTML =
      '<h5><i class="bi bi-clipboard2-pulse me-2"></i>Diagnostic Coding</h5>' +
      '<p class="instrument-subtitle">Add one or more diagnoses. Mark one as <strong>primary</strong>. ' +
      'Each diagnosis carries SNOMED-CT and ICD-10 codes and optional qualifiers. ' +
      'These will appear at the top of the report and in the exported document.</p>';

    // Diagnosis list container
    var listDiv = document.createElement('div');
    listDiv.id = 'diagnosis-list';
    card.appendChild(listDiv);

    // Add button
    var addRow = document.createElement('div');
    addRow.className = 'mt-3';
    var addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn btn-outline-primary btn-sm';
    addBtn.innerHTML = '<i class="bi bi-plus-circle me-1"></i>Add Diagnosis';
    addBtn.addEventListener('click', function () {
      var list = getDiagnoses();
      list.push({ diagnosisId: '', qualifier: '', freeText: '', primary: list.length === 0 });
      setDiagnoses(list);
      renderList(listDiv);
    });
    addRow.appendChild(addBtn);
    card.appendChild(addRow);

    container.appendChild(card);
    renderList(listDiv);
  }

  function renderList(listDiv) {
    listDiv.innerHTML = '';
    var list = getDiagnoses();

    if (list.length === 0) {
      listDiv.innerHTML = '<div class="text-muted text-center py-3" style="font-size:0.88rem">' +
        '<i class="bi bi-info-circle me-1"></i>No diagnoses added yet. Click "Add Diagnosis" below.</div>';
      return;
    }

    for (var i = 0; i < list.length; i++) {
      listDiv.appendChild(createDiagnosisRow(list, i));
    }
  }

  function createDiagnosisRow(list, idx) {
    var entry = list[idx];
    var diagObj = findDiagnosis(entry.diagnosisId);

    var row = document.createElement('div');
    row.className = 'diagnosis-row card mb-2';
    if (entry.primary) row.classList.add('diagnosis-primary');

    var body = document.createElement('div');
    body.className = 'card-body p-2';

    // ── Row 1: Primary toggle + Diagnosis search + Remove ──
    var r1 = document.createElement('div');
    r1.className = 'd-flex align-items-start gap-2 mb-2';

    // Primary radio
    var primaryDiv = document.createElement('div');
    primaryDiv.className = 'pt-1';
    primaryDiv.title = 'Set as primary diagnosis';
    var primaryBtn = document.createElement('button');
    primaryBtn.type = 'button';
    primaryBtn.className = 'btn btn-sm p-0 border-0';
    primaryBtn.innerHTML = entry.primary
      ? '<i class="bi bi-star-fill text-warning" style="font-size:1.2rem"></i>'
      : '<i class="bi bi-star text-muted" style="font-size:1.2rem"></i>';
    primaryBtn.title = entry.primary ? 'Primary diagnosis' : 'Click to set as primary';
    primaryBtn.addEventListener('click', (function (index) {
      return function () {
        var l = getDiagnoses();
        for (var j = 0; j < l.length; j++) l[j].primary = (j === index);
        setDiagnoses(l);
        renderList(row.parentNode);
      };
    })(idx));
    primaryDiv.appendChild(primaryBtn);
    r1.appendChild(primaryDiv);

    // Diagnosis search combobox
    var searchWrap = document.createElement('div');
    searchWrap.className = 'flex-grow-1 position-relative';
    var searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'form-control form-control-sm diagnosis-search';
    searchInput.placeholder = 'Search diagnosis...';
    searchInput.autocomplete = 'off';
    searchInput.value = diagObj ? diagObj.label : (entry.diagnosisId || '');
    searchWrap.appendChild(searchInput);

    // Dropdown results
    var dropdown = document.createElement('div');
    dropdown.className = 'diagnosis-dropdown';
    searchWrap.appendChild(dropdown);

    // Search event
    searchInput.addEventListener('input', (function (dd, inp, index) {
      return function () {
        var q = inp.value.toLowerCase().trim();
        dd.innerHTML = '';
        if (q.length < 1) { dd.style.display = 'none'; return; }
        var matches = DIAGNOSES.filter(function (d) {
          return d.label.toLowerCase().indexOf(q) >= 0 ||
                 d.snomed.indexOf(q) >= 0 ||
                 d.icd10.toLowerCase().indexOf(q) >= 0 ||
                 d.category.toLowerCase().indexOf(q) >= 0;
        });
        if (matches.length === 0) { dd.style.display = 'none'; return; }

        var lastCat = '';
        for (var m = 0; m < matches.length && m < 20; m++) {
          if (matches[m].category !== lastCat) {
            lastCat = matches[m].category;
            var catDiv = document.createElement('div');
            catDiv.className = 'diagnosis-dd-cat';
            catDiv.textContent = lastCat;
            dd.appendChild(catDiv);
          }
          var opt = document.createElement('div');
          opt.className = 'diagnosis-dd-item';
          opt.innerHTML = '<span class="diagnosis-dd-label">' + esc(matches[m].label) + '</span>' +
            '<span class="diagnosis-dd-codes">' + matches[m].icd10 + ' | ' + matches[m].snomed + '</span>';
          opt.setAttribute('data-diag-id', matches[m].id);
          opt.addEventListener('mousedown', (function (diagId, label, inputEl, ddEl, idx2) {
            return function (e) {
              e.preventDefault();
              inputEl.value = label;
              ddEl.style.display = 'none';
              var l2 = getDiagnoses();
              if (l2[idx2]) { l2[idx2].diagnosisId = diagId; setDiagnoses(l2); renderList(inputEl.closest('#diagnosis-list')); }
            };
          })(matches[m].id, matches[m].label, inp, dd, index));
          dd.appendChild(opt);
        }
        dd.style.display = 'block';
      };
    })(dropdown, searchInput, idx));

    searchInput.addEventListener('blur', function () {
      setTimeout(function () { dropdown.style.display = 'none'; }, 200);
    });
    searchInput.addEventListener('focus', function () { this.select(); });

    r1.appendChild(searchWrap);

    // Remove button
    var removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-outline-danger btn-sm';
    removeBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
    removeBtn.title = 'Remove diagnosis';
    removeBtn.addEventListener('click', (function (index) {
      return function () {
        var l = getDiagnoses();
        var wasPrimary = l[index].primary;
        l.splice(index, 1);
        if (wasPrimary && l.length > 0) l[0].primary = true;
        setDiagnoses(l);
        renderList(document.getElementById('diagnosis-list'));
      };
    })(idx));
    r1.appendChild(removeBtn);
    body.appendChild(r1);

    // ── Row 2: Codes display + Qualifier + Free text ──
    if (diagObj) {
      var r2 = document.createElement('div');
      r2.className = 'd-flex align-items-center gap-2 mb-2 flex-wrap';

      // Codes badges
      var codeDiv = document.createElement('div');
      codeDiv.innerHTML =
        '<span class="badge bg-primary me-1" title="ICD-10">ICD-10: ' + diagObj.icd10 + '</span>' +
        '<span class="badge bg-info text-dark" title="SNOMED-CT">SNOMED: ' + diagObj.snomed + '</span>';
      r2.appendChild(codeDiv);

      // Qualifier dropdown
      var qualSel = document.createElement('select');
      qualSel.className = 'form-select form-select-sm';
      qualSel.style.width = 'auto';
      qualSel.style.minWidth = '160px';
      qualSel.innerHTML = '<option value="">— No qualifier —</option>';
      for (var q = 0; q < QUALIFIERS.length; q++) {
        qualSel.innerHTML += '<option value="' + QUALIFIERS[q].id + '"' +
          (entry.qualifier === QUALIFIERS[q].id ? ' selected' : '') + '>' +
          QUALIFIERS[q].label + '</option>';
      }
      qualSel.addEventListener('change', (function (index) {
        return function () {
          var l = getDiagnoses();
          if (l[index]) { l[index].qualifier = this.value; setDiagnoses(l); }
        };
      })(idx));
      r2.appendChild(qualSel);
      body.appendChild(r2);

      // Free-text note
      var r3 = document.createElement('div');
      var ft = document.createElement('input');
      ft.type = 'text';
      ft.className = 'form-control form-control-sm';
      ft.placeholder = 'Optional note (e.g., "ATN A+T+N+", "right-sided onset")';
      ft.value = entry.freeText || '';
      ft.addEventListener('input', (function (index) {
        return function () {
          var l = getDiagnoses();
          if (l[index]) { l[index].freeText = this.value; setDiagnoses(l); }
        };
      })(idx));
      r3.appendChild(ft);
      body.appendChild(r3);
    }

    row.appendChild(body);
    return row;
  }

  // ═══════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════

  function findDiagnosis(id) {
    if (!id) return null;
    for (var i = 0; i < DIAGNOSES.length; i++) {
      if (DIAGNOSES[i].id === id) return DIAGNOSES[i];
    }
    return null;
  }

  function esc(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ═══════════════════════════════════════════
  //  PUBLIC API
  // ═══════════════════════════════════════════

  return {
    render: render,
    getDiagnoses: getDiagnoses,
    findDiagnosis: findDiagnosis,
    DIAGNOSES: DIAGNOSES,
    QUALIFIERS: QUALIFIERS
  };
})();
