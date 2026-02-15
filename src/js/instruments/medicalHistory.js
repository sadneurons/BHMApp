/* ═══════════════════════════════════════════════════════════════
   BHM.Instruments.MedicalHistory — Past medical & surgical history,
   cardiovascular risk factors, family history, allergies
   ═══════════════════════════════════════════════════════════════ */
var BHM = window.BHM || {};
BHM.Instruments = BHM.Instruments || {};

BHM.Instruments.MedicalHistory = (function () {
  'use strict';

  var S = BHM.State;
  var SP = 'medicalHistory';

  // ═══════════════════════════════════════════
  //  DEFINITIONS
  // ═══════════════════════════════════════════

  var CV_RISK_FACTORS = [
    { id: 'hypertension',        label: 'Hypertension' },
    { id: 'diabetes_t2',         label: 'Type 2 diabetes' },
    { id: 'diabetes_t1',         label: 'Type 1 diabetes' },
    { id: 'hyperlipidaemia',     label: 'Hyperlipidaemia' },
    { id: 'atrial_fibrillation', label: 'Atrial fibrillation' },
    { id: 'ihd',                 label: 'Ischaemic heart disease' },
    { id: 'heart_failure',       label: 'Heart failure' },
    { id: 'stroke',              label: 'Previous stroke' },
    { id: 'tia',                 label: 'Previous TIA' },
    { id: 'pvd',                 label: 'Peripheral vascular disease' },
    { id: 'obesity',             label: 'Obesity (BMI ≥ 30)' },
    { id: 'smoking_current',     label: 'Current smoker' },
    { id: 'smoking_ex',          label: 'Ex-smoker' },
    { id: 'osa',                 label: 'Obstructive sleep apnoea' }
  ];

  var NEURO_CONDITIONS = [
    { id: 'epilepsy',      label: 'Epilepsy / seizures' },
    { id: 'parkinsons',    label: 'Parkinson\'s disease' },
    { id: 'ms',            label: 'Multiple sclerosis' },
    { id: 'migraine',      label: 'Migraine' },
    { id: 'tbi',           label: 'Traumatic brain injury (significant)' },
    { id: 'meningitis',    label: 'Meningitis / encephalitis' },
    { id: 'brain_tumour',  label: 'Brain tumour' },
    { id: 'hydrocephalus', label: 'Hydrocephalus / NPH' }
  ];

  var PSYCH_CONDITIONS = [
    { id: 'depression',    label: 'Depression' },
    { id: 'anxiety',       label: 'Anxiety disorder' },
    { id: 'bipolar',       label: 'Bipolar affective disorder' },
    { id: 'psychosis',     label: 'Psychosis / schizophrenia' },
    { id: 'ptsd',          label: 'PTSD' },
    { id: 'ocd',           label: 'OCD' },
    { id: 'eating',        label: 'Eating disorder' },
    { id: 'personality',   label: 'Personality disorder' }
  ];

  var FAMILY_CONDITIONS = [
    { id: 'dementia',       label: 'Dementia (any type)' },
    { id: 'alzheimers',     label: 'Alzheimer\'s disease (confirmed)' },
    { id: 'parkinsons',     label: 'Parkinson\'s disease' },
    { id: 'mnd',            label: 'Motor neurone disease' },
    { id: 'huntingtons',    label: 'Huntington\'s disease' },
    { id: 'stroke_fam',     label: 'Stroke' },
    { id: 'depression_fam', label: 'Depression / mental illness' },
    { id: 'downs',          label: 'Down syndrome' },
    { id: 'learning_disability', label: 'Learning disability' }
  ];

  // ═══════════════════════════════════════════
  //  STATE HELPERS
  // ═══════════════════════════════════════════

  function get(key) { return S.get(SP + '.' + key); }
  function set(key, val) { S.set(SP + '.' + key, val); triggerReport(); }
  function triggerReport() {
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
      '<h5><i class="bi bi-heart-pulse me-2"></i>Medical History</h5>' +
      '<p class="instrument-subtitle">Record the patient\'s past medical, surgical, and family history. ' +
      'Tick any relevant conditions and add details where needed.</p>';

    // ── Cardiovascular Risk Factors ──
    card.appendChild(buildChecklistSection(
      'Cardiovascular Risk Factors',
      'bi-activity',
      CV_RISK_FACTORS,
      'cvRisk'
    ));

    // CV Notes
    card.appendChild(buildTextarea('cvNotes', 'Additional cardiovascular details',
      'e.g. BP control, duration of diabetes, statin use, pack-year history...'));

    // ── Neurological History ──
    card.appendChild(buildChecklistSection(
      'Neurological History',
      'bi-lightning',
      NEURO_CONDITIONS,
      'neuro'
    ));
    card.appendChild(buildTextarea('neuroNotes', 'Neurological details',
      'e.g. Date of stroke, seizure type and frequency, nature of TBI...'));

    // ── Psychiatric History ──
    card.appendChild(buildChecklistSection(
      'Psychiatric History',
      'bi-emoji-neutral',
      PSYCH_CONDITIONS,
      'psych'
    ));
    card.appendChild(buildTextarea('psychNotes', 'Psychiatric details',
      'e.g. Episodes of depression, previous treatment, current CMHT involvement...'));

    // ── Other Medical / Surgical History ──
    var otherSection = document.createElement('div');
    otherSection.className = 'mb-3';
    otherSection.innerHTML =
      '<h6 class="mb-2" style="font-size:0.9rem"><i class="bi bi-clipboard2-pulse me-1"></i>Other Medical / Surgical History</h6>';
    otherSection.appendChild(buildTextarea('otherMedical', null,
      'e.g. Thyroid disease, B12 deficiency, renal disease, previous operations...'));
    card.appendChild(otherSection);

    // ── Family History ──
    card.appendChild(buildChecklistSection(
      'Family History',
      'bi-people',
      FAMILY_CONDITIONS,
      'family'
    ));
    card.appendChild(buildTextarea('familyNotes', 'Family history details',
      'e.g. Mother diagnosed with dementia at 72, father had Parkinson\'s...'));

    // ── Allergies ──
    var allergySection = document.createElement('div');
    allergySection.className = 'mb-3';
    allergySection.innerHTML =
      '<h6 class="mb-2" style="font-size:0.9rem"><i class="bi bi-exclamation-triangle me-1"></i>Allergies &amp; Adverse Reactions</h6>';
    allergySection.appendChild(buildTextarea('allergies', null,
      'e.g. NKDA / Penicillin — rash / Codeine — nausea'));
    card.appendChild(allergySection);

    container.appendChild(card);
  }

  // ═══════════════════════════════════════════
  //  CHECKLIST BUILDER
  // ═══════════════════════════════════════════

  function buildChecklistSection(title, icon, items, stateKey) {
    var wrapper = document.createElement('div');
    wrapper.className = 'mb-3';
    wrapper.innerHTML = '<h6 class="mb-2" style="font-size:0.9rem"><i class="bi ' + icon + ' me-1"></i>' + title + '</h6>';

    var grid = document.createElement('div');
    grid.className = 'row g-1';

    var saved = get(stateKey) || {};

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var col = document.createElement('div');
      col.className = 'col-md-6 col-lg-4';

      var check = document.createElement('div');
      check.className = 'form-check';
      check.innerHTML =
        '<input class="form-check-input" type="checkbox" id="mh-' + stateKey + '-' + item.id + '" ' +
          (saved[item.id] ? 'checked' : '') + '>' +
        '<label class="form-check-label small" for="mh-' + stateKey + '-' + item.id + '">' + item.label + '</label>';

      check.querySelector('input').addEventListener('change', (function (sk, id) {
        return function () {
          var cur = get(sk) || {};
          if (this.checked) cur[id] = true;
          else delete cur[id];
          set(sk, cur);
        };
      })(stateKey, item.id));

      col.appendChild(check);
      grid.appendChild(col);
    }

    wrapper.appendChild(grid);
    return wrapper;
  }

  // ═══════════════════════════════════════════
  //  TEXTAREA BUILDER
  // ═══════════════════════════════════════════

  function buildTextarea(stateKey, label, placeholder) {
    var wrapper = document.createElement('div');
    wrapper.className = 'mb-3';

    if (label) {
      var lbl = document.createElement('label');
      lbl.className = 'form-label small fw-bold';
      lbl.textContent = label;
      wrapper.appendChild(lbl);
    }

    var ta = document.createElement('textarea');
    ta.className = 'form-control form-control-sm';
    ta.rows = 2;
    ta.placeholder = placeholder || '';
    ta.value = get(stateKey) || '';
    ta.addEventListener('input', function () {
      set(stateKey, ta.value);
    });

    wrapper.appendChild(ta);
    return wrapper;
  }

  // ═══════════════════════════════════════════
  //  PUBLIC API
  // ═══════════════════════════════════════════

  return {
    render: render,
    CV_RISK_FACTORS: CV_RISK_FACTORS,
    NEURO_CONDITIONS: NEURO_CONDITIONS,
    PSYCH_CONDITIONS: PSYCH_CONDITIONS,
    FAMILY_CONDITIONS: FAMILY_CONDITIONS
  };
})();
