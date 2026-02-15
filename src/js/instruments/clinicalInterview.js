/* ═══════════════════════════════════════════════════════
   BHM.Instruments.ClinicalInterview — Semi-structured clinician form
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};
BHM.Instruments = BHM.Instruments || {};

BHM.Instruments.ClinicalInterview = (function () {
  'use strict';

  var SP = 'instruments.clinical';
  var F = BHM.ClickableGrid;

  // ── Cognitive symptom tables ──
  var MEMORY_ITEMS = [
    { key: 'mem1', label: 'Forgetting recent conversations' },
    { key: 'mem2', label: 'Repeating questions or stories' },
    { key: 'mem3', label: 'Forgetting appointments or events' },
    { key: 'mem4', label: 'Misplacing belongings' },
    { key: 'mem5', label: 'Difficulty learning new information' },
    { key: 'mem6', label: 'Relying more on lists or reminders' }
  ];

  var LANGUAGE_ITEMS = [
    { key: 'lang1', label: 'Word-finding difficulties' },
    { key: 'lang2', label: 'Using wrong or substitute words' },
    { key: 'lang3', label: 'Difficulty following conversations' },
    { key: 'lang4', label: 'Difficulty with reading or writing' },
    { key: 'lang5', label: 'Speech becoming less fluent' }
  ];

  var VISUOSPATIAL_ITEMS = [
    { key: 'vis1', label: 'Getting lost in familiar places' },
    { key: 'vis2', label: 'Difficulty judging distances' },
    { key: 'vis3', label: 'Difficulty recognising faces or objects' },
    { key: 'vis4', label: 'Problems with spatial awareness' }
  ];

  var FREQ_COLS = ['Y', 'N'];
  var FREQ_VALS = ['yes', 'no'];
  var FREQUENCY_COLS = ['Daily', 'Weekly', 'Monthly', 'Occasional'];
  var FREQUENCY_VALS = ['daily', 'weekly', 'monthly', 'occasional'];

  function render(container) {
    container.innerHTML = '';

    var card = document.createElement('div');
    card.className = 'instrument-card';
    card.innerHTML =
      '<h5>Semi-Structured Clinical Interview</h5>' +
      '<p class="instrument-subtitle">Clinician-completed interview form covering cognitive symptoms, personal history, and background.</p>';

    // ── Header identifiers (separate from session tab — interview-specific) ──
    var headerSection = document.createElement('div');
    headerSection.innerHTML = '<h6 class="mt-2 mb-3"><i class="bi bi-card-heading me-1"></i>Interview Details</h6>';
    var hRow = document.createElement('div');
    hRow.className = 'row g-3 mb-3';
    hRow.appendChild(wrapCol(F.createField({ label: 'Interview Date', statePath: SP + '.interviewDate', type: 'date' }), 'col-md-3'));
    hRow.appendChild(wrapCol(F.createField({ label: 'Interviewing Clinician', statePath: SP + '.interviewer', placeholder: 'Name' }), 'col-md-3'));
    hRow.appendChild(wrapCol(F.createField({ label: 'Informant Present', statePath: SP + '.informantPresent', type: 'select', options: ['Yes', 'No', 'By phone'] }), 'col-md-3'));
    hRow.appendChild(wrapCol(F.createField({ label: 'Informant Relationship', statePath: SP + '.informantRel', placeholder: 'e.g. Spouse' }), 'col-md-3'));
    headerSection.appendChild(hRow);
    card.appendChild(headerSection);

    // ══ COGNITIVE SYMPTOMS ══

    // ── Memory ──
    var memSection = document.createElement('div');
    memSection.className = 'mt-4';
    memSection.innerHTML = '<h6 class="text-primary"><i class="bi bi-brain me-1"></i>New Learning / Memory</h6>';

    var memPresenceGrid = F.create({
      id: 'clinical-mem-presence',
      statePath: SP,
      columns: FREQ_COLS,
      values: FREQ_VALS,
      rows: MEMORY_ITEMS,
      onChange: recalc
    });
    memSection.appendChild(memPresenceGrid);

    // Frequency for memory items
    memSection.appendChild(createSubLabel('Frequency of memory symptoms:'));
    var memFreqGrid = F.create({
      id: 'clinical-mem-freq',
      statePath: SP,
      columns: FREQUENCY_COLS,
      values: FREQUENCY_VALS,
      rows: MEMORY_ITEMS.map(function (item) {
        return { key: item.key + '_freq', label: item.label };
      }),
      onChange: recalc
    });
    memSection.appendChild(memFreqGrid);

    memSection.appendChild(F.createField({
      label: 'Onset of memory symptoms',
      statePath: SP + '.memoryOnset',
      placeholder: 'e.g. Gradual over 2 years'
    }));
    memSection.appendChild(F.createField({
      label: 'Examples / Notes',
      statePath: SP + '.memoryNotes',
      type: 'textarea',
      rows: 2,
      placeholder: 'Specific examples reported'
    }));
    card.appendChild(memSection);

    // ── Language ──
    var langSection = document.createElement('div');
    langSection.className = 'mt-4';
    langSection.innerHTML = '<h6 class="text-primary"><i class="bi bi-chat-dots me-1"></i>Word-finding / Language</h6>';

    var langGrid = F.create({
      id: 'clinical-lang',
      statePath: SP,
      columns: FREQ_COLS,
      values: FREQ_VALS,
      rows: LANGUAGE_ITEMS,
      onChange: recalc
    });
    langSection.appendChild(langGrid);

    var langExtras = document.createElement('div');
    langExtras.className = 'row g-3 mt-2';
    langExtras.appendChild(wrapCol(F.createField({
      label: 'Primary language', statePath: SP + '.primaryLanguage', placeholder: 'e.g. English'
    }), 'col-md-4'));
    langExtras.appendChild(wrapCol(F.createField({
      label: 'Other languages', statePath: SP + '.otherLanguages', placeholder: 'e.g. Urdu, Welsh'
    }), 'col-md-4'));
    langExtras.appendChild(wrapCol(F.createField({
      label: 'Longstanding language difficulty?', statePath: SP + '.langDifficulty', type: 'select',
      options: ['No', 'Yes — dyslexia', 'Yes — other', 'Unknown']
    }), 'col-md-4'));
    langSection.appendChild(langExtras);

    langSection.appendChild(F.createField({
      label: 'Examples / Notes', statePath: SP + '.languageNotes', type: 'textarea', rows: 2
    }));
    card.appendChild(langSection);

    // ── Visuospatial ──
    var visSection = document.createElement('div');
    visSection.className = 'mt-4';
    visSection.innerHTML = '<h6 class="text-primary"><i class="bi bi-geo-alt me-1"></i>Wayfinding / Visuospatial</h6>';

    var visGrid = F.create({
      id: 'clinical-vis',
      statePath: SP,
      columns: ['Present', 'Stopped', 'Safety concern'],
      values: ['present', 'stopped', 'safety'],
      rows: VISUOSPATIAL_ITEMS,
      onChange: recalc
    });
    visSection.appendChild(visGrid);

    visSection.appendChild(F.createField({
      label: 'Onset', statePath: SP + '.visuospatialOnset', placeholder: 'e.g. Last 6 months'
    }));
    visSection.appendChild(F.createField({
      label: 'Examples / Notes', statePath: SP + '.visuospatialNotes', type: 'textarea', rows: 2
    }));
    card.appendChild(visSection);

    // ══ BACKGROUND & CONTEXT ══
    var bgSection = document.createElement('div');
    bgSection.className = 'mt-4';
    bgSection.innerHTML = '<h6 class="text-primary"><i class="bi bi-person-lines-fill me-1"></i>Personal History & Background</h6>';

    var bgRow1 = document.createElement('div');
    bgRow1.className = 'row g-3';
    bgRow1.appendChild(wrapCol(F.createField({
      label: 'Education', statePath: SP + '.education', placeholder: 'e.g. Left school at 16, degree level'
    }), 'col-md-6'));
    bgRow1.appendChild(wrapCol(F.createField({
      label: 'Occupation(s)', statePath: SP + '.occupation', placeholder: 'Main occupation(s)'
    }), 'col-md-6'));
    bgSection.appendChild(bgRow1);

    // Head injury
    bgSection.appendChild(createSubLabel('Head Injury History'));
    var hiRow = document.createElement('div');
    hiRow.className = 'row g-3';
    hiRow.appendChild(wrapCol(F.createField({
      label: 'Any significant head injury?', statePath: SP + '.headInjury', type: 'select',
      options: ['No', 'Yes — single', 'Yes — multiple', 'Unknown']
    }), 'col-md-4'));
    hiRow.appendChild(wrapCol(F.createField({
      label: 'Loss of consciousness duration', statePath: SP + '.headInjuryLOC', placeholder: 'e.g. <1 minute, >30 minutes'
    }), 'col-md-4'));
    hiRow.appendChild(wrapCol(F.createField({
      label: 'Details', statePath: SP + '.headInjuryDetails', type: 'textarea', rows: 2
    }), 'col-md-4'));
    bgSection.appendChild(hiRow);

    // Premorbid personality
    bgSection.appendChild(createSubLabel('Premorbid Personality (Clinician Rating)'));
    bgSection.appendChild(F.createField({
      label: 'Personality notes', statePath: SP + '.premorbidPersonality', type: 'textarea', rows: 3,
      placeholder: 'Clinician observations on premorbid personality traits'
    }));

    // Substance use
    bgSection.appendChild(createSubLabel('Substance Use'));
    var subRow = document.createElement('div');
    subRow.className = 'row g-3';
    subRow.appendChild(wrapCol(F.createField({
      label: 'Smoking status', statePath: SP + '.smoking', type: 'select',
      options: ['Never smoked', 'Ex-smoker', 'Current smoker', 'Unknown']
    }), 'col-md-4'));
    subRow.appendChild(wrapCol(F.createField({
      label: 'AUDIT completed in Patient Booklet?', statePath: SP + '.auditCompleted', type: 'select',
      options: ['Yes', 'No', 'Partially']
    }), 'col-md-4'));
    subRow.appendChild(wrapCol(F.createField({
      label: 'AUDIT score (if known)', statePath: SP + '.auditScore', type: 'number', min: 0, max: 40
    }), 'col-md-4'));
    bgSection.appendChild(subRow);
    bgSection.appendChild(F.createField({
      label: 'Other substance use notes', statePath: SP + '.substanceNotes', type: 'textarea', rows: 2
    }));

    card.appendChild(bgSection);

    // ── Clinician free-text summary ──
    var summSection = document.createElement('div');
    summSection.className = 'mt-4';
    summSection.innerHTML = '<h6 class="text-primary"><i class="bi bi-pencil-square me-1"></i>Clinician Summary Notes</h6>';
    summSection.appendChild(F.createField({
      label: 'Key positives / concerns', statePath: SP + '.keyPositives', type: 'textarea', rows: 3,
      placeholder: 'Key positive findings, safety concerns, onset patterns'
    }));
    summSection.appendChild(F.createField({
      label: 'Safety concerns', statePath: SP + '.safetyConcerns', type: 'textarea', rows: 2,
      placeholder: 'Any immediate safety or risk issues'
    }));
    card.appendChild(summSection);

    container.appendChild(card);
  }

  function createSubLabel(text) {
    var div = document.createElement('div');
    div.className = 'mt-3 mb-2';
    div.innerHTML = '<strong style="font-size:0.88rem">' + text + '</strong>';
    return div;
  }

  function recalc() {
    // Clinical interview has no formal score; just triggers report update
    if (BHM.Report && BHM.Report.update) BHM.Report.update();
  }

  function wrapCol(el, colClass) {
    var col = document.createElement('div');
    col.className = colClass;
    col.appendChild(el);
    return col;
  }

  return { render: render };
})();
