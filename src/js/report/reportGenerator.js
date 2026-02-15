/* ═══════════════════════════════════════════════════════
   BHM.Report — Live plain-language report generator
   Granular item-level feedback with MI tone throughout
   v2.1 — per-section clinician notes, generic language
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};

BHM.Report = (function () {
  'use strict';

  var S = BHM.State;
  var TEMPLATE_VERSION = '2.1.0';

  function update() {
    // Recalculate derived scores that pull from multiple instruments
    if (BHM.Scoring && BHM.Scoring.stopBang) BHM.Scoring.stopBang();
    updateSidePanel();
    updateFullReport();
  }

  function updateSidePanel() {
    var body = document.getElementById('reportSidePanelBody');
    if (!body) return;
    body.innerHTML = generateHTML(true);
  }

  function updateFullReport() {
    var container = document.getElementById('reportFullContent');
    if (!container) return;
    container.innerHTML = '';

    var wrapper = document.createElement('div');
    wrapper.className = 'report-full';

    var header = document.createElement('div');
    header.className = 'report-header';
    var name = S.get('patient.name') || '[Patient Name]';
    var date = S.get('patient.dateOfCompletion') || '[Date]';
    header.innerHTML =
      '<div style="font-size:0.85rem;color:#6c757d">PLACEHOLDER — Manchester Brain Health Centre Logo</div>' +
      '<h3>Assessment Report</h3>' +
      '<p class="mb-0"><strong>' + esc(name) + '</strong></p>' +
      '<p class="text-muted mb-0">Date: ' + esc(date) + '</p>';
    wrapper.appendChild(header);

    var bodyDiv = document.createElement('div');
    bodyDiv.innerHTML = generateHTML(false);
    wrapper.appendChild(bodyDiv);

    var nextSteps = document.createElement('div');
    nextSteps.innerHTML = '<h4>Next Steps and Signposting</h4>' +
      '<p>This report summarises the information gathered during your assessment. ' +
      'The findings will be discussed with you and any next steps agreed. ' +
      'If you have concerns about any of the areas covered, please speak to your GP or care team.</p>' +
      '<div data-snippet-zone="nextSteps"></div>' +
      insertHTML('section_nextSteps', 'Clinical notes — Next Steps');
    wrapper.appendChild(nextSteps);

    var footer = document.createElement('div');
    footer.className = 'report-footer mt-4 pt-2 border-top text-muted';
    footer.style.fontSize = '0.75rem';
    footer.innerHTML = 'Report template v' + TEMPLATE_VERSION + ' | App v' + S.VERSION +
      ' | Generated: ' + new Date().toLocaleString();
    wrapper.appendChild(footer);
    container.appendChild(wrapper);

    // Bind all clinician insert textareas
    bindInserts(wrapper);

    // Replace snippet drop zone placeholders with real DOM elements
    if (BHM.Snippets && BHM.Snippets.createDropZone) {
      var placeholders = wrapper.querySelectorAll('[data-snippet-zone]');
      for (var pi = 0; pi < placeholders.length; pi++) {
        var key = placeholders[pi].getAttribute('data-snippet-zone');
        var dropZone = BHM.Snippets.createDropZone(key);
        placeholders[pi].parentNode.replaceChild(dropZone, placeholders[pi]);
      }
    }

    if (BHM.Charts && BHM.Charts.renderReportCharts) BHM.Charts.renderReportCharts(wrapper);
  }

  function generateHTML(compact) {
    var html = '';

    // ── Diagnostic Block (bold, at the very top) ──
    html += diagnosisBlock(compact);

    html += section('About This Report', aboutContent(), compact, 'about');

    // ── Clinical assessment sections (first) ──
    html += clinicalSection(compact);
    html += stagingSection(compact);
    html += lewySection(compact);
    html += neuroimagingSection(compact);
    html += rbansSection(compact);

    // ── Medications, Medical History, Physical Exam ──
    html += medicationsSection(compact);
    html += medicalHistorySection(compact);
    html += physicalExamSection(compact);
    html += qrisk3Section(compact);

    // ── Informant scales ──
    html += informantSection(compact);

    // ── Patient questionnaires ──
    html += moodSection(compact);
    html += sleepSection(compact);
    html += qolSection(compact);
    html += alcoholSection(compact);
    html += dietSection(compact);
    html += hearingSection(compact);

    // Summary & Plan section break
    if (!compact) {
      html += '<hr style="border:none;border-top:3px double var(--bs-primary, #1a3c6e);margin:2rem 0 1.5rem">';
      html += '<h3 style="color:var(--bs-primary, #1a3c6e);margin-bottom:1rem">Summary &amp; Plan</h3>';
    }

    // Global inserts at the end (only full report)
    if (!compact) {
      html += insertHTML('overallSummary', 'Overall Summary');
      html += insertHTML('agreedToday', 'What We Agreed Today');
      html += insertHTML('safetyFollowUp', 'Safety and Follow-up');
    }
    return html;
  }

  // ─── Helpers ───

  // Section wrapper — includes optional snippet drop zone + clinician insert at bottom
  function section(title, content, compact, insertKey) {
    var h = compact ? '<h6>' + title + '</h6>' + content : '<h4>' + title + '</h4>' + content;
    if (!compact && insertKey) {
      // Snippet drop zone placeholder (replaced with real DOM element in updateFullReport)
      h += '<div data-snippet-zone="' + insertKey + '"></div>';
      h += insertHTML('section_' + insertKey, 'Clinical notes — ' + title);
    }
    return h;
  }

  // HTML for a clinician insert textarea (rendered in the HTML string)
  var _speechSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  function insertHTML(key, label) {
    var statePath = 'clinicianInserts.' + key;
    var current = S.get(statePath) || '';
    var micBtn = _speechSupported
      ? '<button type="button" class="dictation-btn" data-dictation-for="' + esc(statePath) + '" title="Dictate (click to start/stop)"><i class="bi bi-mic"></i></button>'
      : '<button type="button" class="dictation-btn unsupported" title="Speech recognition not supported in this browser" disabled><i class="bi bi-mic-mute"></i></button>';

    return '<div class="clinician-insert" style="margin:0.75rem 0 1.25rem;padding:8px 12px;background:#fffbe6;border:1px dashed #e0c36a;border-radius:6px;">' +
      '<div style="font-size:0.78rem;color:#8a7530;margin-bottom:4px;font-weight:600">' + esc(label) + ' <span style="font-weight:400">(editable — will be preserved)</span>' + micBtn + '</div>' +
      '<textarea data-insert-key="' + esc(statePath) + '" ' +
        'style="width:100%;min-height:48px;border:1px solid #ddd;border-radius:4px;padding:6px 8px;font-size:0.85rem;resize:vertical;font-family:inherit;background:#fff;"' +
        ' placeholder="Type or dictate clinical notes here...">' + esc(current) + '</textarea></div>';
  }

  // ── Speech recognition state ──
  var _activeRecognition = null;   // current SpeechRecognition instance
  var _activeBtn = null;           // currently active mic button element
  var _activeTa = null;            // currently active textarea element

  function stopDictation() {
    if (_activeRecognition) {
      try { _activeRecognition.stop(); } catch (e) { /* ignore */ }
      _activeRecognition = null;
    }
    if (_activeBtn) {
      _activeBtn.classList.remove('recording');
      _activeBtn.querySelector('i').className = 'bi bi-mic';
      _activeBtn = null;
    }
    _activeTa = null;
  }

  function startDictation(btn, textarea) {
    // Stop any existing session first
    stopDictation();

    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    var recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-GB';

    _activeRecognition = recognition;
    _activeBtn = btn;
    _activeTa = textarea;

    // Visual feedback
    btn.classList.add('recording');
    btn.querySelector('i').className = 'bi bi-mic-fill';

    // Track where existing text ends so we can show interim results
    var baseText = textarea.value;
    var finalAppended = '';

    recognition.onresult = function (event) {
      var interim = '';
      for (var i = event.resultIndex; i < event.results.length; i++) {
        var transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          // Capitalise first char if it follows a sentence end or is at the start
          var separator = (baseText + finalAppended).length > 0 ? ' ' : '';
          var lastChar = (baseText + finalAppended).slice(-1);
          if (lastChar === '.' || lastChar === '?' || lastChar === '!' || lastChar === '\n' || (baseText + finalAppended).length === 0) {
            transcript = transcript.charAt(0).toUpperCase() + transcript.slice(1);
          }
          finalAppended += separator + transcript;
          // Persist after each final result
          textarea.value = baseText + finalAppended;
          S.set(textarea.getAttribute('data-insert-key'), textarea.value);
        } else {
          interim += transcript;
        }
      }
      // Show interim text as a preview (greyed out feel via the textarea)
      if (interim) {
        textarea.value = baseText + finalAppended + ' ' + interim;
      }
    };

    recognition.onerror = function (event) {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        alert('Microphone access was denied. Please allow microphone permission in your browser settings.');
      }
      stopDictation();
    };

    recognition.onend = function () {
      // Finalise text (remove any interim preview)
      if (_activeTa) {
        _activeTa.value = baseText + finalAppended;
        S.set(_activeTa.getAttribute('data-insert-key'), _activeTa.value);
      }
      stopDictation();
    };

    recognition.start();
  }

  // Bind event listeners for all clinician inserts after innerHTML is set
  function bindInserts(container) {
    // Stop any active dictation when report re-renders
    stopDictation();

    var textareas = container.querySelectorAll('textarea[data-insert-key]');
    for (var i = 0; i < textareas.length; i++) {
      (function (ta) {
        ta.addEventListener('input', function () {
          S.set(ta.getAttribute('data-insert-key'), ta.value);
        });
      })(textareas[i]);
    }

    // Bind mic buttons
    var micBtns = container.querySelectorAll('.dictation-btn[data-dictation-for]');
    for (var m = 0; m < micBtns.length; m++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var key = btn.getAttribute('data-dictation-for');
          var ta = container.querySelector('textarea[data-insert-key="' + key + '"]');
          if (!ta) return;
          // Toggle: if this button is already recording, stop
          if (_activeBtn === btn) {
            stopDictation();
          } else {
            startDictation(btn, ta);
          }
        });
      })(micBtns[m]);
    }
  }

  function scoreBadge(value, max, thresholds) {
    if (value === null || value === undefined) return '<span class="score-badge" style="background:#e9ecef">Not yet scored</span>';
    var cls = 'score-good';
    if (thresholds) { if (value > thresholds.poor) cls = 'score-poor'; else if (value > thresholds.moderate) cls = 'score-moderate'; }
    return '<span class="score-badge ' + cls + '">' + value + (max ? '/' + max : '') + '</span>';
  }
  function rptTh(text, align) {
    return '<th style="padding:5px 8px;border:1px solid #dee2e6;background:#e8edf3;font-weight:600;font-size:0.84rem;' + (align ? 'text-align:' + align : 'text-align:left') + '">' + text + '</th>';
  }
  function rptTd(text, align, bold) {
    return '<td style="padding:4px 8px;border:1px solid #dee2e6;font-size:0.86rem;' + (align ? 'text-align:' + align : '') + (bold ? ';font-weight:600' : '') + '">' + text + '</td>';
  }

  // frequency label for PSQI items (0-3)
  var FREQ = ['not during the past month', 'less than once a week', 'once or twice a week', 'three or more times a week'];
  var QUALITY = ['very good', 'fairly good', 'fairly bad', 'very bad'];
  var PROBLEM = ['no problem at all', 'only a very slight problem', 'somewhat of a problem', 'a very big problem'];
  var GAD_FREQ = ['not at all', 'several days', 'more than half the days', 'nearly every day'];

  // ═══════════════════════════════════════════
  //  NEUROIMAGING
  // ═══════════════════════════════════════════
  function neuroimagingSection(compact) {
    var scans = S.get('neuroimaging.scans') || [];
    if (scans.length === 0) {
      return section('Neuroimaging', '<p class="text-muted">No neuroimaging results have been recorded.</p>', compact, 'neuroimaging');
    }

    var content = '';
    for (var i = 0; i < scans.length; i++) {
      var scan = scans[i];
      if (scans.length > 1) content += '<h5>' + esc(scan.modality || 'Scan') + (scan.scanDate ? ' (' + niDate(scan.scanDate) + ')' : '') + '</h5>';

      var mod = scan.modality || '';
      var para = niOpener(scan);

      // ── Modality-specific narrative ──
      if (mod === 'MRI Brain')    { para += niMRI(scan); }
      else if (mod === 'CT Head') { para += niCT(scan); }
      else if (mod === 'FDG-PET') { para += niFDG(scan); }
      else if (mod === 'Amyloid PET') { para += niAmyloid(scan); }
      else if (mod === 'Tau PET') { para += niTau(scan); }
      else if (mod === 'DaT-SPECT') { para += niDaT(scan); }
      else if (mod === 'MIBG') { para += niMIBG(scan); }
      else if (mod === 'EEG') { para += niEEG(scan); }

      // Universal extras
      if (scan.otherFindings && scan.otherFindings.trim()) {
        para += 'Additional findings: ' + esc(scan.otherFindings) + '. ';
      }

      content += '<p>' + para + '</p>';

      // ── Scores table (MRI / CT only) ──
      content += niScoresTable(scan, mod);

      // ── Visual rating scale chart ──
      if (!compact) content += '<div class="chart-container" id="chart-neuro-' + i + '"></div>';

      // Clinician interpretation
      if (scan.clinicianInterpretation && scan.clinicianInterpretation.trim()) {
        content += '<p><em>' + esc(scan.clinicianInterpretation) + '</em></p>';
      }
    }

    return section('Neuroimaging', content, compact, 'neuroimaging');
  }

  /* ── Neuroimaging narrative helpers ── */
  function niOpener(scan) {
    var modName = esc(scan.modality || 'Brain scan');
    var dateStr = scan.scanDate ? ' dated ' + niDate(scan.scanDate) : '';
    if (scan.location) dateStr += ' (' + esc(scan.location) + ')';
    return 'Your ' + modName.toLowerCase() + dateStr + ' was reviewed during this assessment. ';
  }

  // ── MRI narrative ──
  function niMRI(scan) {
    var p = '';
    // Fazekas (small vessel disease)
    var hasFaz = scan.fazekasPV !== null || scan.fazekasDWM !== null;
    if (hasFaz) {
      var pvG = scan.fazekasPV; var dwmG = scan.fazekasDWM;
      var maxFaz = Math.max(pvG || 0, dwmG || 0);
      if (maxFaz === 0) {
        p += 'There was no evidence of significant small vessel disease. ';
      } else {
        var svdSev = maxFaz === 1 ? 'mild' : maxFaz === 2 ? 'moderate' : 'severe';
        p += 'The scan showed <strong>' + svdSev + ' small vessel disease</strong>';
        var fd = [];
        if (pvG !== null) fd.push('periventricular Fazekas grade ' + pvG);
        if (dwmG !== null) fd.push('deep white matter Fazekas grade ' + dwmG);
        p += ' (' + fd.join(', ') + '). ';
        if (maxFaz >= 2) p += 'This indicates changes in the small blood vessels of the brain, which can contribute to thinking and memory difficulties. ';
      }
    }
    // GCA
    p += niGCA(scan);
    // MTA
    p += niMTA(scan);
    // Koedam
    p += niKoedam(scan);
    // Structural
    if (scan.microbleeds && scan.microbleeds.trim()) p += 'Microbleeds: ' + esc(scan.microbleeds) + '. ';
    if (scan.lacunes && scan.lacunes.trim()) p += 'Lacunar infarcts: ' + esc(scan.lacunes) + '. ';
    if (scan.strategicInfarcts && scan.strategicInfarcts.trim()) p += 'Strategic infarcts: ' + esc(scan.strategicInfarcts) + '. ';
    return p;
  }

  // ── CT narrative (no Fazekas, no Koedam, no microbleeds) ──
  function niCT(scan) {
    var p = '';
    p += niGCA(scan);
    p += niMTA(scan);
    if (scan.lacunes && scan.lacunes.trim()) p += 'Lacunar infarcts: ' + esc(scan.lacunes) + '. ';
    if (scan.strategicInfarcts && scan.strategicInfarcts.trim()) p += 'Strategic infarcts: ' + esc(scan.strategicInfarcts) + '. ';
    return p;
  }

  // ── FDG-PET narrative ──
  function niFDG(scan) {
    var p = '';
    var patternLabels = { normal: 'normal', ad: 'an Alzheimer\'s disease-typical (temporoparietal)', ftd: 'a frontotemporal dementia-typical (frontal / anterior temporal)', dlb: 'a Lewy body dementia-typical (occipital ± temporoparietal)', other: 'an atypical' };
    if (scan.fdgPattern) {
      p += 'The FDG-PET showed <strong>' + (patternLabels[scan.fdgPattern] || scan.fdgPattern) + ' pattern</strong> of glucose metabolism. ';
    }
    if (scan.fdgRegions && scan.fdgRegions.trim()) {
      p += 'Regions of reduced metabolism were noted in ' + esc(scan.fdgRegions) + '. ';
    }
    if (scan.fdgPattern === 'normal') {
      p += 'This means the brain\'s use of glucose appeared within normal limits, which is reassuring. ';
    } else if (scan.fdgPattern && scan.fdgPattern !== 'normal') {
      p += 'This pattern of reduced brain activity can help clarify the underlying cause of cognitive difficulties. ';
    }
    return p;
  }

  // ── Amyloid PET narrative ──
  function niAmyloid(scan) {
    var p = '';
    if (scan.amyloidResult) {
      if (scan.amyloidResult === 'positive') {
        p += 'The amyloid PET scan was <strong>positive</strong>, indicating the presence of amyloid plaques in the brain. ';
        p += 'Amyloid is one of the proteins associated with Alzheimer\'s disease, though its presence alone does not necessarily mean Alzheimer\'s is causing symptoms. ';
      } else if (scan.amyloidResult === 'negative') {
        p += 'The amyloid PET scan was <strong>negative</strong>, meaning no significant amyloid deposits were found. ';
        p += 'This makes Alzheimer\'s disease a less likely cause of any cognitive difficulties. ';
      } else {
        p += 'The amyloid PET scan result was <strong>equivocal</strong> (borderline), meaning it was not clearly positive or negative. ';
      }
    }
    if (scan.centiloid && scan.centiloid.trim()) {
      p += 'The Centiloid value was ' + esc(scan.centiloid) + '. ';
    }
    if (scan.amyloidNotes && scan.amyloidNotes.trim()) {
      p += esc(scan.amyloidNotes) + ' ';
    }
    return p;
  }

  // ── Tau PET narrative ──
  function niTau(scan) {
    var p = '';
    if (scan.tauResult) {
      if (scan.tauResult === 'positive') {
        p += 'The tau PET scan was <strong>positive</strong>, showing abnormal accumulation of tau protein in the brain. ';
        p += 'Tau tangles are closely associated with nerve cell damage and the progression of Alzheimer\'s disease. ';
      } else if (scan.tauResult === 'negative') {
        p += 'The tau PET scan was <strong>negative</strong>, with no significant tau accumulation detected. ';
      } else {
        p += 'The tau PET scan result was <strong>equivocal</strong>. ';
      }
    }
    if (scan.tauBraak) {
      p += 'The distribution of tau corresponded to <strong>Braak stage ' + esc(scan.tauBraak) + '</strong>. ';
    }
    if (scan.tauRegions && scan.tauRegions.trim()) {
      p += 'Elevated tau uptake was observed in ' + esc(scan.tauRegions) + '. ';
    }
    return p;
  }

  // ── DaT-SPECT narrative ──
  function niDaT(scan) {
    var p = '';
    if (scan.datResult) {
      if (scan.datResult === 'normal') {
        p += 'The DaT-SPECT scan showed <strong>normal</strong> dopamine transporter uptake. ';
        p += 'This makes conditions that affect the dopamine system, such as Lewy body dementia or Parkinson\'s disease, less likely. ';
      } else {
        p += 'The DaT-SPECT scan was <strong>abnormal</strong>, showing reduced dopamine transporter uptake. ';
        p += 'This suggests involvement of the dopamine pathways, which can be seen in conditions such as Lewy body dementia or Parkinson\'s disease. ';
      }
    }
    var latLabels = { symmetric: 'symmetric (both sides affected equally)', left: 'asymmetric, with the left side more affected', right: 'asymmetric, with the right side more affected' };
    if (scan.datLaterality && latLabels[scan.datLaterality]) {
      p += 'The pattern was ' + latLabels[scan.datLaterality] + '. ';
    }
    if (scan.datPattern && scan.datPattern.trim()) {
      p += esc(scan.datPattern) + ' ';
    }
    return p;
  }

  // ── MIBG narrative ──
  function niMIBG(scan) {
    var p = '';
    if (scan.mibgResult) {
      if (scan.mibgResult === 'normal') {
        p += 'The MIBG cardiac scan showed <strong>normal</strong> cardiac sympathetic innervation. ';
      } else {
        p += 'The MIBG cardiac scan was <strong>abnormal</strong>, showing reduced cardiac sympathetic innervation. ';
        p += 'This finding can support a diagnosis of Lewy body dementia. ';
      }
    }
    if (scan.mibgHMEarly && scan.mibgHMEarly.trim()) p += 'Heart-to-mediastinum ratio (early): ' + esc(scan.mibgHMEarly) + '. ';
    if (scan.mibgHMDelayed && scan.mibgHMDelayed.trim()) p += 'Heart-to-mediastinum ratio (delayed): ' + esc(scan.mibgHMDelayed) + '. ';
    return p;
  }

  // ── EEG narrative ──
  function niEEG(scan) {
    var p = '';
    var patLabels = { normal: 'normal', generalised_slow: 'generalised slowing', focal_slow: 'focal slowing', periodic_discharges: 'periodic discharges', epileptiform: 'epileptiform activity', other: 'other abnormalities' };
    if (scan.eegPattern) {
      if (scan.eegPattern === 'normal') {
        p += 'The EEG recording was <strong>normal</strong>. ';
      } else {
        p += 'The EEG showed <strong>' + (patLabels[scan.eegPattern] || scan.eegPattern) + '</strong>. ';
      }
    }
    if (scan.eegSlowing && scan.eegSlowing !== 'none') {
      p += 'Background slowing was ' + esc(scan.eegSlowing) + '. ';
    }
    if (scan.eegPDR && scan.eegPDR.trim()) {
      p += 'The posterior dominant rhythm was ' + esc(scan.eegPDR) + '. ';
    }
    if (scan.eegNotes && scan.eegNotes.trim()) {
      p += esc(scan.eegNotes) + ' ';
    }
    return p;
  }

  /* ── Shared sub-narratives (GCA, MTA, Koedam) ── */
  function niGCA(scan) {
    if (scan.gca === null) return '';
    if (scan.gca === 0) return 'There was no significant global brain shrinkage. ';
    var sev = scan.gca === 1 ? 'mild' : scan.gca === 2 ? 'moderate' : 'severe';
    var p = 'There was <strong>' + sev + ' global brain shrinkage</strong> (GCA grade ' + scan.gca + '). ';
    if (scan.gca >= 2) p += 'This means the brain has lost some of its overall volume, which can be associated with cognitive changes. ';
    return p;
  }
  function niMTA(scan) {
    var hasMTA = scan.mtaLeft !== null || scan.mtaRight !== null;
    if (!hasMTA) return '';
    var mtaL = scan.mtaLeft || 0; var mtaR = scan.mtaRight || 0;
    var mx = Math.max(mtaL, mtaR);
    if (mx === 0) return 'The memory areas of the brain (hippocampi) appeared normal in size. ';
    var p = '';
    var bilateral = scan.mtaLeft !== null && scan.mtaRight !== null;
    if (bilateral && mtaL === mtaR) {
      var sev = mtaL <= 1 ? 'mild' : mtaL <= 2 ? 'mild-to-moderate' : mtaL <= 3 ? 'moderate' : 'severe';
      p += 'There was <strong>' + sev + ' shrinkage of the memory areas (hippocampi) on both sides</strong> (MTA grade ' + mtaL + ' bilaterally). ';
    } else if (bilateral) {
      p += 'There was shrinkage of the memory areas (hippocampi) — <strong>MTA grade ' + mtaL + ' on the left and grade ' + mtaR + ' on the right</strong>. ';
    } else if (scan.mtaLeft !== null) {
      p += 'Left medial temporal atrophy was graded at <strong>MTA ' + mtaL + '</strong>. ';
    } else {
      p += 'Right medial temporal atrophy was graded at <strong>MTA ' + mtaR + '</strong>. ';
    }
    if (mx >= 2) p += 'These areas are important for forming new memories, and changes here can be an early sign of conditions such as Alzheimer\'s disease. ';
    return p;
  }
  function niKoedam(scan) {
    if (scan.koedam === null) return '';
    if (scan.koedam === 0) return 'The posterior (back) regions of the brain did not show significant shrinkage. ';
    var sev = scan.koedam === 1 ? 'mild' : scan.koedam === 2 ? 'moderate' : 'severe';
    var p = 'There was <strong>' + sev + ' posterior brain shrinkage</strong> (Koedam grade ' + scan.koedam + '). ';
    if (scan.koedam >= 2) p += 'The posterior regions of the brain are involved in visual processing and spatial awareness, and changes here can be associated with certain forms of dementia. ';
    return p;
  }

  /* ── Scores table (MRI / CT structural scales) ── */
  function niScoresTable(scan, mod) {
    if (mod !== 'MRI Brain' && mod !== 'CT Head') return '';
    var rows = [];
    if (scan.fazekasPV !== null && mod === 'MRI Brain') rows.push({ s: 'Fazekas — Periventricular', v: scan.fazekasPV, r: '0–3', i: fazLabel(scan.fazekasPV) });
    if (scan.fazekasDWM !== null && mod === 'MRI Brain') rows.push({ s: 'Fazekas — Deep White Matter', v: scan.fazekasDWM, r: '0–3', i: fazDWMLabel(scan.fazekasDWM) });
    if (scan.gca !== null) rows.push({ s: 'GCA — Global Cortical Atrophy', v: scan.gca, r: '0–3', i: gcaLabel(scan.gca) });
    if (scan.koedam !== null && mod === 'MRI Brain') rows.push({ s: 'Koedam — Posterior Atrophy', v: scan.koedam, r: '0–3', i: koedamLabel(scan.koedam) });
    if (scan.mtaLeft !== null) rows.push({ s: 'MTA — Left (Scheltens)', v: scan.mtaLeft, r: '0–4', i: mtaLabel(scan.mtaLeft) });
    if (scan.mtaRight !== null) rows.push({ s: 'MTA — Right (Scheltens)', v: scan.mtaRight, r: '0–4', i: mtaLabel(scan.mtaRight) });
    if (rows.length === 0) return '';
    var h = '<table style="width:100%;border-collapse:collapse;margin:0.5rem 0 0.75rem">';
    h += '<thead><tr>' + rptTh('Scale') + rptTh('Score', 'center') + rptTh('Range', 'center') + rptTh('Interpretation', 'center') + '</tr></thead><tbody>';
    for (var j = 0; j < rows.length; j++) h += '<tr>' + rptTd(rows[j].s) + rptTd(rows[j].v, 'center', true) + rptTd(rows[j].r, 'center') + rptTd(rows[j].i, 'center') + '</tr>';
    h += '</tbody></table>';
    return h;
  }

  // Rating scale label helpers
  function fazLabel(g) { return ['Absent', 'Caps / pencil-thin lining', 'Smooth halo', 'Irregular, into deep WM'][g] || '—'; }
  function fazDWMLabel(g) { return ['Absent', 'Punctate foci', 'Beginning confluence', 'Large confluent areas'][g] || '—'; }
  function gcaLabel(g) { return ['No atrophy', 'Mild opening of sulci', 'Moderate gyral volume loss', 'Severe knife-blade atrophy'][g] || '—'; }
  function koedamLabel(g) { return ['No posterior atrophy', 'Mild posterior widening', 'Moderate parietal atrophy', 'Severe parietal atrophy'][g] || '—'; }
  function mtaLabel(g) { return ['No atrophy', 'Widened choroid fissure', 'Also widened temporal horn', 'Moderate hippocampal loss', 'Severe hippocampal loss'][g] || '—'; }
  function niDate(d) { if (!d) return ''; var parts = d.split('-'); if (parts.length === 3) return parts[2] + '/' + parts[1] + '/' + parts[0]; return d; }

  // ═══════════════════════════════════════════
  //  MEDICATIONS
  // ═══════════════════════════════════════════
  function medicationsSection(compact) {
    var meds = S.get('medications.list') || [];
    var recentChanges = S.get('medications.recentChanges') || '';
    var adherence = S.get('medications.adherence') || '';

    if (meds.length === 0 && !recentChanges.trim() && !adherence.trim()) {
      return section('Medications', '<p class="text-muted">No medications have been recorded.</p>', compact, 'medications');
    }

    var content = '';

    if (meds.length > 0) {
      // Group by category
      var byCat = {};
      for (var i = 0; i < meds.length; i++) {
        var m = meds[i];
        if (!m.name || !m.name.trim()) continue;
        var cat = m.category || 'Other';
        if (!byCat[cat]) byCat[cat] = [];
        byCat[cat].push(m);
      }

      // Medications table
      content += '<table style="width:100%;border-collapse:collapse;margin:0.5rem 0 0.75rem">';
      content += '<thead><tr>' + rptTh('Medication') + rptTh('Dose') + rptTh('Frequency') + rptTh('Route') + rptTh('Indication') + '</tr></thead><tbody>';
      for (var j = 0; j < meds.length; j++) {
        var med = meds[j];
        if (!med.name || !med.name.trim()) continue;
        content += '<tr>' +
          rptTd('<strong>' + esc(med.name) + '</strong>') +
          rptTd(esc(med.dose || '—')) +
          rptTd(esc(med.frequency || '—')) +
          rptTd(esc(med.route || '—')) +
          rptTd(esc(med.indication || '—')) +
          '</tr>';
      }
      content += '</tbody></table>';

      // Plain-language summary
      var catNames = Object.keys(byCat);
      if (catNames.length > 0) {
        var summaryParts = [];
        for (var c = 0; c < catNames.length; c++) {
          var catMeds = byCat[catNames[c]];
          var names = catMeds.map(function (m) { return '<strong>' + esc(m.name) + '</strong>' + (m.dose ? ' ' + esc(m.dose) : ''); });
          if (catNames[c] === 'Dementia') {
            summaryParts.push('You are currently taking ' + joinList(names) + ' for your memory');
          } else {
            summaryParts.push(joinList(names) + ' (' + catNames[c].toLowerCase() + ')');
          }
        }
        content += '<p>At the time of this assessment, your medications included: ' + summaryParts.join('; ') + '.</p>';
      }
    }

    if (recentChanges && recentChanges.trim()) {
      content += '<p><strong>Recent changes:</strong> ' + esc(recentChanges) + '</p>';
    }
    if (adherence && adherence.trim()) {
      content += '<p><strong>Adherence:</strong> ' + esc(adherence) + '</p>';
    }

    return section('Medications', content, compact, 'medications');
  }

  // ═══════════════════════════════════════════
  //  MEDICAL HISTORY
  // ═══════════════════════════════════════════
  function medicalHistorySection(compact) {
    var MH = 'medicalHistory.';
    var cvRisk = S.get(MH + 'cvRisk') || {};
    var cvNotes = S.get(MH + 'cvNotes') || '';
    var neuro = S.get(MH + 'neuro') || {};
    var neuroNotes = S.get(MH + 'neuroNotes') || '';
    var psych = S.get(MH + 'psych') || {};
    var psychNotes = S.get(MH + 'psychNotes') || '';
    var otherMedical = S.get(MH + 'otherMedical') || '';
    var family = S.get(MH + 'family') || {};
    var familyNotes = S.get(MH + 'familyNotes') || '';
    var allergies = S.get(MH + 'allergies') || '';

    var hasAnything = Object.keys(cvRisk).length || cvNotes.trim() ||
      Object.keys(neuro).length || neuroNotes.trim() ||
      Object.keys(psych).length || psychNotes.trim() ||
      otherMedical.trim() ||
      Object.keys(family).length || familyNotes.trim() ||
      allergies.trim();

    if (!hasAnything) {
      return section('Medical History', '<p class="text-muted">No medical history has been recorded.</p>', compact, 'medicalHistory');
    }

    var content = '';
    var CVDefs = (BHM.Instruments.MedicalHistory && BHM.Instruments.MedicalHistory.CV_RISK_FACTORS) || [];
    var NeuroDefs = (BHM.Instruments.MedicalHistory && BHM.Instruments.MedicalHistory.NEURO_CONDITIONS) || [];
    var PsychDefs = (BHM.Instruments.MedicalHistory && BHM.Instruments.MedicalHistory.PSYCH_CONDITIONS) || [];
    var FamDefs = (BHM.Instruments.MedicalHistory && BHM.Instruments.MedicalHistory.FAMILY_CONDITIONS) || [];

    // ── Cardiovascular risk factors ──
    var cvItems = checkedLabels(cvRisk, CVDefs);
    if (cvItems.length > 0 || cvNotes.trim()) {
      var cvPara = '';
      if (cvItems.length > 0) {
        cvPara += 'Cardiovascular risk factors include ' + joinList(cvItems.map(function (l) { return '<strong>' + l + '</strong>'; })) + '. ';
      } else {
        cvPara += 'No specific cardiovascular risk factors were identified. ';
      }
      if (cvNotes.trim()) cvPara += esc(cvNotes) + ' ';
      content += '<p>' + cvPara + '</p>';
    }

    // ── Neurological history ──
    var neuroItems = checkedLabels(neuro, NeuroDefs);
    if (neuroItems.length > 0 || neuroNotes.trim()) {
      var neuroPara = '';
      if (neuroItems.length > 0) {
        neuroPara += 'Neurological history includes ' + joinList(neuroItems.map(function (l) { return '<strong>' + l + '</strong>'; })) + '. ';
      }
      if (neuroNotes.trim()) neuroPara += esc(neuroNotes) + ' ';
      content += '<p>' + neuroPara + '</p>';
    }

    // ── Psychiatric history ──
    var psychItems = checkedLabels(psych, PsychDefs);
    if (psychItems.length > 0 || psychNotes.trim()) {
      var psychPara = '';
      if (psychItems.length > 0) {
        psychPara += 'Psychiatric history includes ' + joinList(psychItems.map(function (l) { return '<strong>' + l + '</strong>'; })) + '. ';
      }
      if (psychNotes.trim()) psychPara += esc(psychNotes) + ' ';
      content += '<p>' + psychPara + '</p>';
    }

    // ── Other medical / surgical ──
    if (otherMedical.trim()) {
      content += '<p><strong>Other medical / surgical history:</strong> ' + esc(otherMedical) + '</p>';
    }

    // ── Family history ──
    var famItems = checkedLabels(family, FamDefs);
    if (famItems.length > 0 || familyNotes.trim()) {
      var famPara = '';
      if (famItems.length > 0) {
        famPara += 'There is a family history of ' + joinList(famItems.map(function (l) { return '<strong>' + l.toLowerCase() + '</strong>'; })) + '. ';
      } else {
        famPara += 'No significant family history was reported. ';
      }
      if (familyNotes.trim()) famPara += esc(familyNotes) + ' ';
      content += '<p>' + famPara + '</p>';
    }

    // ── Allergies ──
    if (allergies.trim()) {
      content += '<p><strong>Allergies &amp; adverse reactions:</strong> ' + esc(allergies) + '</p>';
    }

    return section('Medical History', content, compact, 'medicalHistory');
  }

  // ═══════════════════════════════════════════
  //  PHYSICAL EXAMINATION
  // ═══════════════════════════════════════════
  function physicalExamSection(compact) {
    var PE = 'physicalExam.';
    var hasAny = S.get(PE + 'heightCm') || S.get(PE + 'weightKg') || S.get(PE + 'bpSystolic') ||
                 S.get(PE + 'heartRate') || S.get(PE + 'gait') || S.get(PE + 'focalNeurology') ||
                 S.get(PE + 'neckCircCm');
    var sbScore = S.getScore('stopBang');
    var hasSB = sbScore && sbScore.unknownCount < 8;
    if (!hasAny && !hasSB) {
      return section('Physical Examination', '<p class="text-muted">No physical examination findings have been recorded.</p>', compact, 'physicalExam');
    }

    var content = '';

    // ── Anthropometrics ──
    var h = S.get(PE + 'heightCm');
    var w = S.get(PE + 'weightKg');
    var bmi = parseFloat(S.get(PE + 'bmi'));
    var neck = S.get(PE + 'neckCircCm');
    var waist = S.get(PE + 'waistCircCm');

    if (h || w || !isNaN(bmi)) {
      var anthro = [];
      if (h) anthro.push('height ' + esc(String(h)) + ' cm');
      if (w) anthro.push('weight ' + esc(String(w)) + ' kg');
      if (!isNaN(bmi)) {
        var bmiLabel = bmi < 18.5 ? 'underweight' : bmi < 25 ? 'normal' : bmi < 30 ? 'overweight' : bmi < 35 ? 'obese (Class I)' : bmi < 40 ? 'obese (Class II)' : 'obese (Class III)';
        anthro.push('BMI <strong>' + bmi + '</strong> (' + bmiLabel + ')');
      }
      if (neck) anthro.push('neck circumference ' + esc(String(neck)) + ' cm');
      if (waist) anthro.push('waist circumference ' + esc(String(waist)) + ' cm');
      content += '<p><strong>Anthropometrics:</strong> ' + anthro.join(', ') + '.</p>';
    }

    // ── Vital signs ──
    var sys = S.get(PE + 'bpSystolic');
    var dia = S.get(PE + 'bpDiastolic');
    var hr = S.get(PE + 'heartRate');
    var o2 = S.get(PE + 'o2Sat');
    var temp = S.get(PE + 'temperature');
    var rr = S.get(PE + 'respRate');

    if (sys || hr || o2) {
      var vitals = [];
      if (sys && dia) vitals.push('blood pressure ' + esc(String(sys)) + '/' + esc(String(dia)) + ' mmHg');
      else if (sys) vitals.push('systolic BP ' + esc(String(sys)) + ' mmHg');
      if (hr) vitals.push('heart rate ' + esc(String(hr)) + ' bpm');
      if (o2) vitals.push('O\u2082 saturation ' + esc(String(o2)) + '%');
      if (temp) vitals.push('temperature ' + esc(String(temp)) + ' \u00B0C');
      if (rr) vitals.push('respiratory rate ' + esc(String(rr)));
      content += '<p><strong>Vital signs:</strong> ' + vitals.join(', ') + '.</p>';
    }

    // ── Postural BP ──
    var ls = parseFloat(S.get(PE + 'bpLyingSys'));
    var ss = parseFloat(S.get(PE + 'bpStandingSys'));
    if (!isNaN(ls) && !isNaN(ss)) {
      var drop = ls - ss;
      var significant = drop >= 20;
      content += '<p><strong>Postural blood pressure:</strong> Lying ' + ls + '/' + (S.get(PE + 'bpLyingDia') || '?') +
        ', standing ' + ss + '/' + (S.get(PE + 'bpStandingDia') || '?') +
        ' mmHg (systolic drop ' + drop + ' mmHg' +
        (significant ? ' — <em>significant postural hypotension</em>' : ' — within normal range') + ').</p>';
    }

    // ── Observations ──
    var gait = S.get(PE + 'gait');
    var tremor = S.get(PE + 'tremor');
    var rigidity = S.get(PE + 'rigidity');
    var nutritional = S.get(PE + 'nutritional');
    if (gait || tremor || rigidity || nutritional) {
      var obs = [];
      if (gait && gait !== '') obs.push('gait was ' + esc(gait).toLowerCase());
      if (tremor && tremor !== '' && tremor !== 'None') obs.push(esc(tremor).toLowerCase() + ' was noted');
      else if (tremor === 'None') obs.push('no tremor');
      if (rigidity && rigidity !== '' && rigidity !== 'None') obs.push('rigidity was ' + esc(rigidity).toLowerCase());
      else if (rigidity === 'None') obs.push('no rigidity');
      if (nutritional && nutritional !== '') obs.push('nutritional status: ' + esc(nutritional).toLowerCase());
      content += '<p><strong>General observations:</strong> ' + obs.join('; ') + '.</p>';
    }

    // ── Focal neurology ──
    var focal = S.get(PE + 'focalNeurology');
    if (focal && focal.trim()) {
      content += '<p><strong>Focal neurological signs:</strong> ' + esc(focal) + '</p>';
    } else {
      content += '<p><strong>Focal neurological signs:</strong> none elicited.</p>';
    }

    // ── Other findings ──
    var other = S.get(PE + 'otherFindings');
    if (other && other.trim()) {
      content += '<p><strong>Other findings:</strong> ' + esc(other) + '</p>';
    }

    // ── STOP-BANG ──
    var sb = S.getScore('stopBang');
    if (sb && sb.unknownCount < 8) {
      content += '<p><strong>STOP-BANG sleep apnoea screen:</strong> ' +
        scoreBadge(sb.total, 8, { moderate: 3, poor: 5 }) +
        ' (' + sb.interp + ')';
      if (sb.unknownCount > 0) {
        content += ' <em>(' + sb.unknownCount + ' item' + (sb.unknownCount > 1 ? 's' : '') + ' not yet assessed)</em>';
      }
      content += '</p>';
      if (!compact) content += '<div class="chart-container" id="chart-stopbang"></div>';
    }

    return section('Physical Examination', content, compact, 'physicalExam');
  }

  // ═══════════════════════════════════════════
  //  QRISK3 CARDIOVASCULAR RISK
  // ═══════════════════════════════════════════
  function qrisk3Section(compact) {
    // Recalculate to ensure fresh
    if (BHM.Scoring && BHM.Scoring.qrisk3) BHM.Scoring.qrisk3();

    var qr = S.getScore('qrisk3');
    if (!qr || qr.error || qr.score === undefined) {
      return ''; // Don't show section if no valid score
    }

    var pct = qr.score;
    var riskLabel = pct >= 20 ? 'high' : pct >= 10 ? 'moderate' : 'low';
    var riskColour = pct >= 20 ? '#dc3545' : pct >= 10 ? '#ffc107' : '#198754';
    var affectedCount = Math.round(pct);
    if (affectedCount < 1 && pct > 0) affectedCount = 1;
    if (affectedCount > 100) affectedCount = 100;

    var content = '';

    content += '<p>Your estimated 10-year cardiovascular disease risk using the QRISK3 algorithm is ' +
      '<strong style="color:' + riskColour + '">' + pct.toFixed(1) + '%</strong> (' + riskLabel + ' risk). ' +
      'This means that out of 100 people with similar risk factors, approximately <strong>' +
      affectedCount + '</strong> would be expected to experience a heart attack or stroke over the next 10 years.</p>';

    // Key risk factors identified
    var inputs = qr.inputs || {};
    var factors = [];
    if (inputs.smoke_cat > 0) {
      var smokeLabels = ['', 'ex-smoker', 'light smoker', 'moderate smoker', 'heavy smoker'];
      factors.push(smokeLabels[inputs.smoke_cat]);
    }
    if (inputs.bmi > 30) factors.push('BMI of ' + inputs.bmi.toFixed(1));
    if (inputs.sbp > 140) factors.push('elevated blood pressure (' + inputs.sbp + ' mmHg)');

    if (factors.length > 0) {
      content += '<p>Key modifiable risk factors identified include: ' + factors.join(', ') + '.</p>';
    }

    if (pct >= 10) {
      content += '<p><em>NICE guidelines recommend discussing lipid-lowering therapy (e.g. atorvastatin 20 mg) ' +
        'for adults with a 10-year CVD risk of 10% or higher (CG181).</em></p>';
    }

    // Warnings
    if (qr.warnings && qr.warnings.length > 0) {
      content += '<p class="text-muted" style="font-size:0.8em"><em>Note: ';
      content += qr.warnings.join('. ') + '.</em></p>';
    }

    // Chart container
    if (!compact) {
      content += '<div class="chart-container" id="chart-qrisk3"></div>';
    }

    content += '<p class="text-muted" style="font-size:0.75em">QRISK3-2017 &copy; ClinRisk Ltd. ' +
      'Hippisley-Cox J, Coupland C, Brindle P. BMJ 2017;357:j2099.</p>';

    return section('Cardiovascular Risk (QRISK3)', content, compact, 'qrisk3');
  }

  // Helper: extract checked labels from a checklist object
  function checkedLabels(obj, defs) {
    var labels = [];
    var keys = Object.keys(obj);
    for (var i = 0; i < defs.length; i++) {
      if (obj[defs[i].id]) labels.push(defs[i].label);
    }
    return labels;
  }

  // Helper: join array as natural list ("a, b, and c")
  function joinList(arr) {
    if (arr.length === 0) return '';
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return arr[0] + ' and ' + arr[1];
    return arr.slice(0, -1).join(', ') + ', and ' + arr[arr.length - 1];
  }

  // ═══════════════════════════════════════════
  //  ABOUT THIS REPORT
  // ═══════════════════════════════════════════
  function aboutContent() {
    var gp = S.get('patient.referringGP') || '';
    var clinician = S.get('patient.clinicianName') || '';
    var informant = S.get('patient.informantName') || '';
    var informantRel = S.get('patient.informantRelationship') || '';
    var assessDate = S.get('patient.dateOfCompletion') || '';

    var html = '<p>';

    // Referral line
    html += 'You were referred to the memory assessment services by ';
    html += gp.trim() ? '<strong>' + esc(gp) + '</strong>' : 'your GP';
    html += '. ';

    // Centre intro
    html += 'Because you are independent in Instrumental Activities of Daily Living (IADL), and likely to be functioning independently, ' +
      'we invited you to the <strong>Manchester Brain Health Centre</strong>. ' +
      'The Centre is a new collaboration between GMMH and MFT NHS Trusts. ' +
      'This is a new approach to the assessment of people with milder forms of cognitive impairment. We aim to:</p>';

    // Numbered aims
    html += '<ol style="margin:0.25rem 0 0.75rem">';
    html += '<li>Optimise cognitive performance by addressing sensory impairment, pain, and medication effects, and to identify people who are more or less likely to have worsening of their cognitive impairment in the short term &mdash; <em>Risk Profiling</em>.</li>';
    html += '<li>Diagnose neurodegenerative diseases in a timely way.</li>';
    html += '<li>Reduce people\u2019s risk of worsening cognition using techniques for behaviour change as well as group and individual education.</li>';
    html += '<li>We encourage everyone to participate in one of our many currently running research studies of promising new therapies.</li>';
    html += '</ol>';

    // Seen-by line
    html += '<p>';
    html += 'You were seen by ';
    html += clinician.trim() ? '<strong>' + esc(clinician) + '</strong>' : 'your clinician';

    if (informant.trim()) {
      html += ' with ';
      if (informantRel.trim()) html += 'your ' + esc(informantRel.toLowerCase()) + ', ';
      html += '<strong>' + esc(informant) + '</strong>';
    }

    if (assessDate) {
      var parts = assessDate.split('-');
      if (parts.length === 3) {
        html += ' on ' + fmtDateLong(parts[0], parts[1], parts[2]);
      }
    }
    html += '.</p>';

    // What this report contains
    html += '<p>This report is a summary of your assessment, your scans, and your cognitive testing results. ' +
      'It provides a summary of the information gathered, written in plain language. ' +
      'The scores and descriptions below are based on standardised questionnaires and are intended to help you understand the results.</p>';

    return html;
  }

  // Format date as "5th February 2026"
  function fmtDateLong(y, m, d) {
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var day = parseInt(d, 10);
    var suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    else if (day === 2 || day === 22) suffix = 'nd';
    else if (day === 3 || day === 23) suffix = 'rd';
    return day + suffix + ' ' + (months[parseInt(m, 10) - 1] || m) + ' ' + y;
  }

  // ═══════════════════════════════════════════
  //  DIAGNOSIS BLOCK (top of report)
  // ═══════════════════════════════════════════
  function diagnosisBlock(compact) {
    var diagList = S.get('diagnoses') || [];
    if (diagList.length === 0) {
      return '<div class="diagnosis-report-block" style="border:2px solid var(--bs-border-color);border-radius:8px;padding:12px 16px;margin-bottom:1.2rem;background:var(--bs-tertiary-bg, #f8f9fa)">' +
        '<p class="text-muted mb-0" style="font-size:0.9rem"><i class="bi bi-info-circle me-1"></i>No diagnosis has been recorded. Use the Diagnosis tab to add diagnostic codes.</p></div>';
    }

    var DiagMod = BHM.Instruments.Diagnosis;
    // Sort: primary first
    var sorted = diagList.slice().sort(function (a, b) { return (b.primary ? 1 : 0) - (a.primary ? 1 : 0); });

    var html = '<div class="diagnosis-report-block" style="border:2px solid var(--bs-primary, #1a3c6e);border-radius:8px;padding:14px 18px;margin-bottom:1.2rem;background:var(--bs-primary-bg-subtle, #eef2f9)">';
    html += '<h4 style="color:var(--bs-primary, #1a3c6e);margin:0 0 8px;font-size:1.1rem"><i class="bi bi-shield-check me-2"></i>Diagnosis</h4>';

    for (var i = 0; i < sorted.length; i++) {
      var entry = sorted[i];
      var diagObj = DiagMod ? DiagMod.findDiagnosis(entry.diagnosisId) : null;
      if (!diagObj) continue;

      var qualLabel = '';
      if (entry.qualifier && DiagMod) {
        for (var q = 0; q < DiagMod.QUALIFIERS.length; q++) {
          if (DiagMod.QUALIFIERS[q].id === entry.qualifier) { qualLabel = DiagMod.QUALIFIERS[q].label; break; }
        }
      }

      html += '<div style="margin-bottom:6px;font-size:0.95rem">';
      html += '<strong>' + (i + 1) + '. ' + esc(diagObj.label) + '</strong>';
      if (qualLabel) html += ' — <em>' + esc(qualLabel) + '</em>';
      if (entry.freeText) html += ' <span style="color:var(--bs-secondary-color, #6c757d)">(' + esc(entry.freeText) + ')</span>';
      html += ' <span class="score-badge" style="font-size:0.75rem;padding:1px 6px;margin-left:4px">ICD-10: ' + diagObj.icd10 + '</span>';
      html += ' <span class="score-badge" style="font-size:0.75rem;padding:1px 6px;background:#e0f2fe;color:#0369a1">SNOMED: ' + diagObj.snomed + '</span>';
      if (entry.primary) html += ' <span class="badge bg-warning text-dark" style="font-size:0.65rem;vertical-align:middle">PRIMARY</span>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  // ═══════════════════════════════════════════
  //  SLEEP (PSQI + Epworth)
  // ═══════════════════════════════════════════
  function sleepSection(compact) {
    var psqi = S.getScore('psqi');
    var epworth = S.getScore('epworth');
    var d = S.getSession().instruments.psqi || {};
    var content = '';

    if (psqi && psqi.globalTotal !== null) {
      content += '<p><strong>Pittsburgh Sleep Quality Index (PSQI):</strong> ' +
        scoreBadge(psqi.globalTotal, 21, { moderate: 5, poor: 10 }) + '</p>';

      // Overall quality
      if (d.q9_quality !== undefined && d.q9_quality !== null) {
        content += '<p>Over the past month, you rated your overall sleep quality as <strong>' + QUALITY[d.q9_quality] + '</strong>. ';
      } else {
        content += '<p>Over the past month, ';
      }

      // Bedtime/waketime/hours
      if (d.q1_bedtime) content += 'You reported typically going to bed at <strong>' + esc(d.q1_bedtime) + '</strong>';
      if (d.q3_waketime) content += ' and waking at <strong>' + esc(d.q3_waketime) + '</strong>';
      if (d.q4_sleep_hours) content += ', getting approximately <strong>' + d.q4_sleep_hours + ' hours</strong> of actual sleep';
      content += '. ';

      // Latency
      if (d.q2_latency_min) {
        content += 'It usually took you about <strong>' + esc(String(d.q2_latency_min)) + ' minutes</strong> to fall asleep. ';
      }
      content += '</p>';

      // Specific sleep disturbances
      var distItems = [
        { k: 'q5a', t: 'not being able to get to sleep within 30 minutes' },
        { k: 'q5b', t: 'waking up in the middle of the night or early morning' },
        { k: 'q5c', t: 'having to get up to use the bathroom' },
        { k: 'q5d', t: 'not being able to breathe comfortably' },
        { k: 'q5e', t: 'coughing or snoring loudly' },
        { k: 'q5f', t: 'feeling too cold' },
        { k: 'q5g', t: 'feeling too hot' },
        { k: 'q5h', t: 'having bad dreams' },
        { k: 'q5i', t: 'having pain' }
      ];

      var frequent = [], occasional = [];
      for (var i = 0; i < distItems.length; i++) {
        var v = d[distItems[i].k];
        if (v !== undefined && v !== null) {
          if (Number(v) >= 3) frequent.push(distItems[i].t);
          else if (Number(v) >= 2) occasional.push(distItems[i].t);
        }
      }

      if (frequent.length > 0) {
        content += '<p>You reported having trouble sleeping <strong>three or more times a week</strong> because of ' + joinList(frequent) + '. ';
        if (occasional.length > 0) {
          content += 'You also had difficulty <strong>once or twice a week</strong> with ' + joinList(occasional) + '. ';
        }
        content += '</p>';
      } else if (occasional.length > 0) {
        content += '<p>You reported having trouble sleeping <strong>once or twice a week</strong> because of ' + joinList(occasional) + '.</p>';
      }

      // Medication
      if (d.q6_medication !== undefined && Number(d.q6_medication) > 0) {
        content += '<p>You indicated that you have taken sleep medication <strong>' + FREQ[d.q6_medication] + '</strong>.</p>';
      }

      // Daytime dysfunction
      if (d.q7_drowsiness !== undefined && Number(d.q7_drowsiness) >= 2) {
        content += '<p>You reported having trouble staying awake while driving, eating, or during social activity <strong>' + FREQ[d.q7_drowsiness] + '</strong>. ';
      }
      if (d.q8_enthusiasm !== undefined && Number(d.q8_enthusiasm) >= 1) {
        content += 'Keeping up enthusiasm to get things done has been <strong>' + PROBLEM[d.q8_enthusiasm] + '</strong>. ';
      }
      if ((d.q7_drowsiness !== undefined && Number(d.q7_drowsiness) >= 2) || (d.q8_enthusiasm !== undefined && Number(d.q8_enthusiasm) >= 1)) {
        content += '</p>';
      }

      // MI summary
      if (psqi.globalTotal <= 5) {
        content += '<p><em>It sounds like your sleep has been going reasonably well over the past month, which is a real positive for your overall health and wellbeing.</em></p>';
      } else {
        content += '<p><em>It sounds like sleep has been a challenge recently. The good news is that there are practical strategies that can help, and it is worth exploring what might make the biggest difference for you.</em></p>';
      }

      if (!compact) content += '<div class="chart-container" id="chart-psqi"></div>';
    } else {
      content += '<p class="text-muted">PSQI not yet completed.</p>';
    }

    // Epworth
    var ed = S.getSession().instruments.epworth || {};
    if (epworth && epworth.total !== null) {
      content += '<p><strong>Epworth Sleepiness Scale:</strong> ' +
        scoreBadge(epworth.total, 24, { moderate: 10, poor: 14 }) + '</p>';

      var situations = [
        { k: 'e1', t: 'sitting and reading' },
        { k: 'e2', t: 'watching TV' },
        { k: 'e3', t: 'sitting inactive in a public place' },
        { k: 'e4', t: 'as a passenger in a car for an hour' },
        { k: 'e5', t: 'lying down to rest in the afternoon' },
        { k: 'e6', t: 'sitting and talking to someone' },
        { k: 'e7', t: 'sitting quietly after lunch without alcohol' },
        { k: 'e8', t: 'in a car while stopped in traffic' }
      ];

      var high = [], moderate = [];
      for (var ei = 0; ei < situations.length; ei++) {
        var ev = ed[situations[ei].k];
        if (ev !== undefined && ev !== null) {
          if (Number(ev) === 3) high.push(situations[ei].t);
          else if (Number(ev) === 2) moderate.push(situations[ei].t);
        }
      }

      if (high.length > 0) {
        content += '<p>You reported a <strong>high chance of dozing</strong> while ' + joinList(high) + '. ';
        if (moderate.length > 0) content += 'You also noted a <strong>moderate chance</strong> while ' + joinList(moderate) + '. ';
        content += '</p>';
      } else if (moderate.length > 0) {
        content += '<p>You reported a <strong>moderate chance of dozing</strong> while ' + joinList(moderate) + '.</p>';
      }

      if (epworth.total <= 10) {
        content += '<p><em>Your daytime sleepiness appears to be within the normal range, which is reassuring.</em></p>';
      } else {
        content += '<p><em>You mentioned feeling sleepier during the day than might be expected. This is worth exploring further, as addressing the underlying cause can make a real difference to how you feel day-to-day.</em></p>';
      }
      if (!compact) content += '<div class="chart-container" id="chart-epworth"></div>';
    } else {
      content += '<p class="text-muted">Epworth not yet completed.</p>';
    }

    return section('Sleep', content, compact, 'sleep');
  }

  // ═══════════════════════════════════════════
  //  MOOD & WORRY (GAD-7 + GDS-15)
  // ═══════════════════════════════════════════
  function moodSection(compact) {
    var gad = S.getScore('gad7');
    var dep = S.getScore('depression');
    var gd = S.getSession().instruments.gad7 || {};
    var dd = S.getSession().instruments.depression || {};
    var content = '';

    // GAD-7
    if (gad && gad.total !== null) {
      content += '<p><strong>Anxiety (GAD-7):</strong> ' + scoreBadge(gad.total, 21, { moderate: 9, poor: 14 }) + '</p>';

      var gadItems = [
        { k: 'g1', t: 'feeling nervous, anxious, or on edge' },
        { k: 'g2', t: 'not being able to stop or control worrying' },
        { k: 'g3', t: 'worrying too much about different things' },
        { k: 'g4', t: 'trouble relaxing' },
        { k: 'g5', t: 'being so restless that it is hard to sit still' },
        { k: 'g6', t: 'becoming easily annoyed or irritable' },
        { k: 'g7', t: 'feeling afraid, as if something awful might happen' }
      ];

      var gadFreq = {}, gadAny = false;
      for (var gi = 0; gi < gadItems.length; gi++) {
        var gv = gd[gadItems[gi].k];
        if (gv !== undefined && gv !== null && Number(gv) > 0) {
          var freq = GAD_FREQ[Number(gv)];
          if (!gadFreq[freq]) gadFreq[freq] = [];
          gadFreq[freq].push(gadItems[gi].t);
          gadAny = true;
        }
      }

      if (gadAny) {
        content += '<p>Over the past two weeks, you reported: ';
        var parts = [];
        if (gadFreq['nearly every day']) parts.push('<strong>nearly every day</strong> — ' + joinList(gadFreq['nearly every day']));
        if (gadFreq['more than half the days']) parts.push('<strong>more than half the days</strong> — ' + joinList(gadFreq['more than half the days']));
        if (gadFreq['several days']) parts.push('<strong>several days</strong> — ' + joinList(gadFreq['several days']));
        content += parts.join('; ') + '.</p>';
      }

      if (gad.impairment) {
        var impLabels = { not_difficult: 'not at all difficult', somewhat: 'somewhat difficult', very: 'very difficult', extremely: 'extremely difficult' };
        content += '<p>You rated the impact of these difficulties on your daily functioning as <em>' + (impLabels[gad.impairment] || gad.impairment) + '</em>.</p>';
      }

      if (gad.total <= 4) {
        content += '<p><em>It is encouraging that worry and nervousness have not been a significant problem for you recently. This is a real strength to build on.</em></p>';
      } else if (gad.total <= 9) {
        content += '<p><em>You have been experiencing some mild anxiety. Many people find that small, practical steps — such as relaxation techniques or talking things through — can help manage these feelings.</em></p>';
      } else {
        content += '<p><em>It sounds like anxiety has been having a noticeable impact on your life. There are effective approaches that can help, and it is worth exploring what kind of support might be most beneficial for you.</em></p>';
      }
      if (!compact) content += '<div class="chart-container" id="chart-gad7"></div>';
    } else {
      content += '<p class="text-muted">GAD-7 not yet completed.</p>';
    }

    // GDS-15
    if (dep && dep.total !== null) {
      content += '<p><strong>Depression Screen (GDS-15):</strong> ' + scoreBadge(dep.total, 15, { moderate: 4, poor: 8 }) + '</p>';

      var depItems = BHM.Instruments.Depression.getItems();
      var endorsed = [];
      for (var di = 0; di < depItems.length; di++) {
        var dv = dd[depItems[di].key];
        if (dv !== undefined && dv === depItems[di].depressiveAnswer) {
          var stmt = depItems[di].label.replace(/^\d+\s*/, '');
          endorsed.push(stmt);
        }
      }

      if (endorsed.length > 0) {
        content += '<p>Your responses indicated that: ';
        var stmts = [];
        for (var ei2 = 0; ei2 < endorsed.length; ei2++) {
          var s = endorsed[ei2];
          s = s.replace(/^Are you basically satisfied/, 'you are not fully satisfied');
          s = s.replace(/^Have you dropped/, 'you have dropped');
          s = s.replace(/^Do you feel that your life is empty/, 'you feel your life is empty');
          s = s.replace(/^Do you often feel bored/, 'you often feel bored');
          s = s.replace(/^Are you in good spirits/, 'you are not in good spirits');
          s = s.replace(/^Are you afraid/, 'you are afraid');
          s = s.replace(/^Do you feel happy/, 'you do not feel happy');
          s = s.replace(/^Do you often feel helpless/, 'you often feel helpless');
          s = s.replace(/^Do you prefer to stay at home/, 'you prefer to stay at home');
          s = s.replace(/^Do you feel you have more problems/, 'you feel you have more problems');
          s = s.replace(/^Do you think it is wonderful/, 'you do not feel it is wonderful');
          s = s.replace(/^Do you feel pretty worthless/, 'you feel worthless');
          s = s.replace(/^Do you feel full of energy/, 'you do not feel full of energy');
          s = s.replace(/^Do you feel that your situation is hopeless/, 'you feel your situation is hopeless');
          s = s.replace(/^Do you think that most people/, 'you think most people');
          s = s.replace(/\?$/, '');
          stmts.push(s.charAt(0).toLowerCase() + s.slice(1));
        }
        content += stmts.join('; ') + '.</p>';
      }

      if (dep.total <= 4) {
        content += '<p><em>Your responses do not suggest significant symptoms of low mood. It is good to hear that you are generally managing well in this area.</em></p>';
      } else if (dep.total <= 8) {
        content += '<p><em>You have described some feelings that suggest your mood may have dipped a little recently. This is something that many people experience, and talking through how you have been feeling can often be a helpful first step.</em></p>';
      } else {
        content += '<p><em>It sounds like you have been going through a difficult time emotionally. Please know that support is available, and there are effective ways to help with these feelings.</em></p>';
      }
      if (!compact) content += '<div class="chart-container" id="chart-gds"></div>';
    } else {
      content += '<p class="text-muted">Depression screen not yet completed.</p>';
    }

    return section('Mood and Worry', content, compact, 'mood');
  }

  // ═══════════════════════════════════════════
  //  ALCOHOL (AUDIT)
  // ═══════════════════════════════════════════
  function alcoholSection(compact) {
    var audit = S.getScore('auditTool');
    var ad = S.getSession().instruments.auditTool || {};
    var content = '';

    if (audit && audit.total !== null) {
      content += '<p><strong>AUDIT Score:</strong> ' + scoreBadge(audit.total, 40, { moderate: 7, poor: 15 }) + '</p>';

      var freqLabels = ['never', 'monthly or less', '2 to 4 times per month', '2 to 3 times per week', '4 or more times per week'];
      var unitLabels = ['0 to 2', '3 to 4', '5 to 6', '7 to 9', '10 or more'];
      var bingeLabels = ['never', 'less than monthly', 'monthly', 'weekly', 'daily or almost daily'];

      if (ad.a1 !== undefined && ad.a1 !== null) {
        if (Number(ad.a1) === 0) {
          content += '<p>You reported that you <strong>never</strong> drink alcohol.</p>';
        } else {
          content += '<p>You reported having a drink containing alcohol <strong>' + freqLabels[Number(ad.a1)] + '</strong>';
          if (ad.a2 !== undefined && ad.a2 !== null) {
            content += ', typically having <strong>' + unitLabels[Number(ad.a2)] + ' units</strong> on a drinking day';
          }
          content += '. ';

          if (ad.a3 !== undefined && Number(ad.a3) > 0) {
            content += 'You have had 6 or more units on a single occasion <strong>' + bingeLabels[Number(ad.a3)] + '</strong>. ';
          }
          content += '</p>';

          var concerns = [];
          if (ad.a4 !== undefined && Number(ad.a4) > 0) concerns.push('you found you were not able to stop drinking once you had started (' + bingeLabels[Number(ad.a4)] + ')');
          if (ad.a5 !== undefined && Number(ad.a5) > 0) concerns.push('you failed to do what was normally expected because of drinking (' + bingeLabels[Number(ad.a5)] + ')');
          if (ad.a6 !== undefined && Number(ad.a6) > 0) concerns.push('you needed a morning drink to get going (' + bingeLabels[Number(ad.a6)] + ')');
          if (ad.a7 !== undefined && Number(ad.a7) > 0) concerns.push('you had feelings of guilt or remorse after drinking (' + bingeLabels[Number(ad.a7)] + ')');
          if (ad.a8 !== undefined && Number(ad.a8) > 0) concerns.push('you were unable to remember what happened the night before because of drinking (' + bingeLabels[Number(ad.a8)] + ')');

          if (concerns.length > 0) {
            content += '<p>In the past year, you indicated that ' + joinList(concerns) + '.</p>';
          }

          if (ad.a9 !== undefined && Number(ad.a9) > 0) {
            content += '<p>You reported that ' + (Number(ad.a9) === 4 ? 'you or someone else has been injured during the last year' : 'you or someone else has been injured, though not in the last year') + ' as a result of drinking.</p>';
          }
          if (ad.a10 !== undefined && Number(ad.a10) > 0) {
            content += '<p>A relative, friend, or health worker has expressed concern about your drinking' +
              (Number(ad.a10) === 4 ? ' during the last year' : ', though not in the last year') + '.</p>';
          }
        }
      }

      if (audit.total <= 7) {
        content += '<p><em>Your alcohol use falls within the low-risk range. Maintaining these habits is a positive step for your long-term health.</em></p>';
      } else if (audit.total <= 15) {
        content += '<p><em>Your responses suggest your alcohol use is at a level that could be worth reviewing. Even small changes can make a meaningful difference to your health, and support is available if you are interested in exploring this.</em></p>';
      } else {
        content += '<p><em>Your responses suggest that alcohol may be having a significant impact on your life. There are effective support options available, and it is worth discussing what might be most helpful for you.</em></p>';
      }
      if (!compact) content += '<div class="chart-container" id="chart-audit"></div>';
    } else {
      content += '<p class="text-muted">AUDIT not yet completed.</p>';
    }

    return section('Alcohol', content, compact, 'alcohol');
  }

  // ═══════════════════════════════════════════
  //  DIET (Mediterranean Diet Score)
  // ═══════════════════════════════════════════
  function dietSection(compact) {
    var dietScore = S.getScore('diet');
    var dd = S.getSession().instruments.diet || {};
    var content = '';

    if (dietScore && dietScore.total !== null) {
      content += '<p><strong>Mediterranean Diet Score:</strong> ' + scoreBadge(dietScore.total, 14, { moderate: -1, poor: -1 }) + '</p>';

      var dietItems = [
        { k: 'md1',  yes: 'olive oil is your main cooking fat', no: 'olive oil is not your main cooking fat' },
        { k: 'md2',  yes: 'you use 4 or more tablespoons of olive oil each day', no: 'you use less than 4 tablespoons of olive oil each day' },
        { k: 'md3',  yes: 'you eat 2 or more servings of vegetables each day', no: 'you eat fewer than 2 servings of vegetables daily' },
        { k: 'md4',  yes: 'you eat 3 or more servings of fruit each day', no: 'you eat fewer than 3 servings of fruit daily' },
        { k: 'md5',  yes: 'you eat less than 1 serving of red meat per day', no: 'you eat 1 or more servings of red meat per day' },
        { k: 'md6',  yes: 'you consume less than 1 serving of butter, margarine, or cream per day', no: 'you consume 1 or more servings of butter, margarine, or cream daily' },
        { k: 'md7',  yes: 'you drink fewer than 1 sweetened carbonated drink per day', no: 'you drink 1 or more sweetened carbonated drinks per day' },
        { k: 'md8',  yes: 'you drink 3 or more glasses of wine per week', no: 'you drink fewer than 3 glasses of wine per week' },
        { k: 'md9',  yes: 'you eat 3 or more servings of legumes per week', no: 'you eat fewer than 3 servings of legumes per week' },
        { k: 'md10', yes: 'you eat 3 or more servings of fish or seafood per week', no: 'you eat fewer than 3 servings of fish or seafood per week' },
        { k: 'md11', yes: 'you eat fewer than 3 commercial sweets or pastries per week', no: 'you eat 3 or more commercial sweets or pastries per week' },
        { k: 'md12', yes: 'you eat 1 or more servings of nuts per week', no: 'you eat fewer than 1 serving of nuts per week' },
        { k: 'md13', yes: 'you routinely choose chicken, turkey, or rabbit over red meat', no: 'you do not routinely choose poultry over red meat' },
        { k: 'md14', yes: 'you eat pasta, vegetable, or rice dishes flavoured with garlic, tomato, leek, or onion twice a week or more', no: 'you eat these Mediterranean-style dishes less than twice a week' }
      ];

      var strengths = [], gaps = [];
      for (var di = 0; di < dietItems.length; di++) {
        var v = dd[dietItems[di].k];
        if (v === 'yes') strengths.push(dietItems[di].yes);
        else if (v === 'no') gaps.push(dietItems[di].no);
      }

      if (strengths.length > 0) {
        content += '<p>Some positive aspects of your current diet: ' + joinList(strengths) + '.</p>';
      }
      if (gaps.length > 0) {
        content += '<p>Some areas where your diet could move closer to a Mediterranean pattern: ' + joinList(gaps) + '.</p>';
      }

      if (dietScore.total >= 10) {
        content += '<p><em>Your diet already follows a Mediterranean pattern well, which is linked to better brain and heart health. That is a real strength to build on and maintain.</em></p>';
      } else if (dietScore.total >= 7) {
        content += '<p><em>Your diet has some good Mediterranean features already. Even small, gradual changes — such as adding a little more fish, vegetables, or olive oil — can further support your brain health over time.</em></p>';
      } else {
        content += '<p><em>There may be some straightforward changes you could consider to move your diet closer to a Mediterranean pattern, which is associated with better brain health outcomes. A dietitian or other specialist can help think about what would work best for you.</em></p>';
      }
      if (!compact) content += '<div class="chart-container" id="chart-diet"></div>';
    } else {
      content += '<p class="text-muted">Diet questionnaire not yet completed.</p>';
    }

    return section('Diet Pattern', content, compact, 'diet');
  }

  // ═══════════════════════════════════════════
  //  QUALITY OF LIFE (CASP-19)
  // ═══════════════════════════════════════════
  function qolSection(compact) {
    var casp = S.getScore('casp19');
    var cd = S.getSession().instruments.casp19 || {};
    var content = '';

    if (casp && casp.total !== null) {
      content += '<p><strong>Quality of Life (CASP-19):</strong> ' + scoreBadge(casp.total, 57, { moderate: -1, poor: -1 }) + '</p>';
      content += '<p>This questionnaire asks about four aspects of quality of life: Control, Autonomy, Pleasure, and Self-realisation.</p>';

      var items = BHM.Instruments.CASP19.getItems();
      var COLS = ['often', 'sometimes', 'not often', 'never'];

      var domains = {};
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (!domains[item.domain]) domains[item.domain] = { concerns: [], positives: [] };
        var v = cd[item.key];
        if (v === undefined || v === null) continue;
        var colIdx = Number(v);
        var freqWord = COLS[colIdx];

        // Convert label to second person ("I/me/my" → "you/your")
        var stmt = toSecondPerson(item.label);
        var stmtLower = stmt.charAt(0).toLowerCase() + stmt.slice(1);
        // Strip "on balance, " prefix for cleaner embedding
        stmtLower = stmtLower.replace(/^on balance,\s*/i, '');

        // Check if the converted text starts with "you [verb]"
        var startsWithYou = /^you\s/.test(stmtLower);
        var verbPhrase = startsWithYou ? stmtLower.replace(/^you\s+/, '') : null;

        if (item.reverse) {
          // Negative wording: concern when often (0) or sometimes (1)
          if (colIdx <= 1) {
            var phrase;
            if (startsWithYou) {
              // "you feel left out" → "you often feel left out"
              phrase = 'you ' + freqWord + ' ' + verbPhrase;
            } else {
              // "your age prevents you..." → "you often feel that your age prevents you..."
              phrase = 'you ' + freqWord + ' feel that ' + stmtLower;
            }
            domains[item.domain].concerns.push(phrase);
          }
        } else {
          // Positive wording: concern when not often (2) or never (3)
          if (colIdx >= 2) {
            var phrase2;
            if (startsWithYou && verbPhrase) {
              // Handle "can" specially: "you do not often feel you can..."
              if (/^can\s/.test(verbPhrase)) {
                phrase2 = (freqWord === 'not often')
                  ? 'you do not often feel you can ' + verbPhrase.replace(/^can\s+/, '')
                  : 'you ' + freqWord + ' feel you can ' + verbPhrase.replace(/^can\s+/, '');
              } else {
                phrase2 = (freqWord === 'not often')
                  ? 'you do not often ' + verbPhrase
                  : 'you ' + freqWord + ' ' + verbPhrase;
              }
            } else {
              phrase2 = (freqWord === 'not often')
                ? 'you do not often feel that ' + stmtLower
                : 'you ' + freqWord + ' feel that ' + stmtLower;
            }
            domains[item.domain].concerns.push(phrase2);
          } else {
            // Positive: store as second-person verb phrase for "you often..."
            var posStmt = toSecondPerson(item.label);
            var posLower = posStmt.charAt(0).toLowerCase() + posStmt.slice(1);
            posLower = posLower.replace(/^on balance,\s*/i, '');
            // Strip leading "you " so it can be joined after "you often"
            var posVerb = /^you\s/.test(posLower) ? posLower.replace(/^you\s+/, '') : posLower;
            domains[item.domain].positives.push(posVerb);
          }
        }
      }

      for (var dom in domains) {
        if (!domains.hasOwnProperty(dom)) continue;
        var dInfo = domains[dom];
        var domScore = casp.domainTotals ? casp.domainTotals[dom] : null;
        content += '<p><strong>' + dom + '</strong>' + (domScore !== null ? ' (score: ' + domScore + ')' : '') + ': ';
        if (dInfo.concerns.length > 0) {
          content += 'You noted that ' + joinList(dInfo.concerns) + '. ';
        }
        if (dInfo.positives.length > 0 && dInfo.concerns.length === 0) {
          content += 'Positively, you indicated that you often ' + joinList(dInfo.positives) + '. ';
        }
        if (dInfo.concerns.length === 0 && dInfo.positives.length === 0) {
          content += 'No notable concerns were identified in this area. ';
        }
        content += '</p>';
      }

      content += '<p><em>Quality of life is personal and multifaceted. It can be helpful to think about which areas matter most to you and what might help you get more of what you value.</em></p>';

      if (!compact) content += '<div class="chart-container" id="chart-casp19"></div>';
    } else {
      content += '<p class="text-muted">CASP-19 not yet completed.</p>';
    }

    return section('Quality of Life', content, compact, 'qol');
  }

  // ═══════════════════════════════════════════
  //  HEARING
  // ═══════════════════════════════════════════
  function hearingSection(compact) {
    var hearingScore = S.getScore('hearing');
    var hd = S.getSession().instruments.hearing || {};
    var content = '';

    if (hearingScore) {
      content += '<p><strong>Hearing difficulties reported in:</strong> ' + hearingScore.affectedCount + ' of 17 situations</p>';

      if (hearingScore.affectedCount > 0) {
        var situations = BHM.Instruments.Hearing ? BHM.Instruments.Hearing.getSituations() : [];
        var affected = [];
        for (var i = 0; i < situations.length; i++) {
          if (hd[situations[i].key] === 'yes') {
            var txt = situations[i].label.replace(/^\d+\.\s*/, '').replace(/\.$/, '').toLowerCase();
            affected.push(txt);
          }
        }
        if (affected.length > 0) {
          content += '<p>You reported that your hearing affects you in the following situations: ' + joinList(affected) + '.</p>';
        }

        var top1 = hd.top1, top2 = hd.top2, top3 = hd.top3;
        var tops = [top1, top2, top3].filter(function (t) { return t && String(t).trim(); });
        if (tops.length > 0) {
          content += '<p>The situations you identified as most important to you were numbers ' + tops.join(', ') + '.</p>';
        }

        var earSymptoms = [];
        if (hd.tinnitus === 'yes') earSymptoms.push('tinnitus (ringing, hissing, or other noises in the ears)');
        if (hd.hyperacusis === 'yes') earSymptoms.push('sensitivity to everyday loud sounds');
        if (hd.pain === 'yes') earSymptoms.push('ear pain');
        if (earSymptoms.length > 0) {
          content += '<p>You also reported experiencing ' + joinList(earSymptoms) + '.</p>';
        }

        if (hd.hearingAids === 'Yes') {
          content += '<p>You currently wear hearing aids. ';
          if (hd.hearingAidProblems && hd.hearingAidProblems.trim()) {
            content += 'You noted the following issues: ' + esc(hd.hearingAidProblems) + '.';
          }
          content += '</p>';
        } else if (hd.hearingAids === 'No') {
          if (hd.wantHearingAids === 'Yes') {
            content += '<p>You do not currently wear hearing aids but indicated you would be interested if they might help.</p>';
          }
        }

        content += '<p><em>Hearing plays an important role in communication, social connection, and overall wellbeing. Addressing hearing difficulties can have a positive impact on many areas of life, and there are good options available.</em></p>';
        if (!compact) content += '<div class="chart-container" id="chart-hearing"></div>';
      } else {
        content += '<p><em>You did not report significant hearing difficulties, which is positive.</em></p>';
      }
    } else {
      content += '<p class="text-muted">Hearing section not yet completed.</p>';
    }

    return section('Hearing', content, compact, 'hearing');
  }

  // ═══════════════════════════════════════════
  //  INFORMANT (MBI-C + NPI-Q)
  //  Concise score-summary + brief narrative
  // ═══════════════════════════════════════════
  function informantSection(compact) {
    var mbic = S.getScore('mbiC');
    var npiq = S.getScore('npiQ');
    var content = '';

    // ── MBI-C ──
    if (mbic && mbic.total !== null) {
      content += '<p><strong>Mild Behavioural Impairment Checklist (MBI-C):</strong> Total score ' + mbic.total + '</p>';

      var domains = BHM.Instruments.MBIC.getDomains();
      var domainShort = ['Motivation & drive', 'Mood & anxiety', 'Impulse control', 'Social appropriateness', 'Beliefs & perception'];
      var mbicData = S.getSession().instruments.mbiC || {};

      // Build per-domain stats
      var domStats = [];
      var concernDomains = [], clearDomains = [];
      for (var d = 0; d < domains.length; d++) {
        var dom = domains[d];
        var domTotal = 0, endorsedCount = 0, maxSev = 0, answered = 0;
        for (var j = 0; j < dom.items.length; j++) {
          var v = mbicData[dom.items[j].key];
          if (v !== undefined && v !== null && v !== '') {
            answered++;
            var nv = Number(v);
            domTotal += nv;
            if (nv > 0) { endorsedCount++; if (nv > maxSev) maxSev = nv; }
          }
        }
        var stat = { name: domainShort[d], score: domTotal, endorsed: endorsedCount, total: dom.items.length, maxSev: maxSev, answered: answered };
        domStats.push(stat);
        if (endorsedCount > 0) concernDomains.push(stat);
        else if (answered > 0) clearDomains.push(stat);
      }

      // Domain score table
      content += '<table style="width:100%;border-collapse:collapse;margin:0.5rem 0 0.75rem">';
      content += '<thead><tr>' + rptTh('Domain') + rptTh('Score', 'center') + rptTh('Items endorsed', 'center') + rptTh('Max severity', 'center') + '</tr></thead><tbody>';
      var sevWord = ['—', 'mild', 'moderate', 'severe'];
      for (var ds = 0; ds < domStats.length; ds++) {
        var st = domStats[ds];
        content += '<tr>' + rptTd(st.name, null, st.endorsed > 0) + rptTd(st.score, 'center') + rptTd(st.endorsed + ' / ' + st.total, 'center') + rptTd(sevWord[st.maxSev] || '—', 'center') + '</tr>';
      }
      content += '</tbody></table>';

      if (mbic.total > 0) {
        // Narrative summary — group by severity
        var severe = [], moderate = [], mild = [];
        for (var cd2 = 0; cd2 < concernDomains.length; cd2++) {
          var cs = concernDomains[cd2];
          var phrase = cs.name.toLowerCase() + ' (' + cs.endorsed + ' item' + (cs.endorsed > 1 ? 's' : '') + ')';
          if (cs.maxSev === 3) severe.push(phrase);
          else if (cs.maxSev === 2) moderate.push(phrase);
          else mild.push(phrase);
        }

        content += '<p>';
        if (severe.length > 0) content += 'The informant reported <strong>severe</strong> concerns in ' + joinList(severe) + '. ';
        if (moderate.length > 0) {
          content += (severe.length > 0 ? '<strong>Moderate</strong> concerns were noted in ' : 'The informant reported <strong>moderate</strong> concerns in ');
          content += joinList(moderate) + '. ';
        }
        if (mild.length > 0) {
          content += (severe.length > 0 || moderate.length > 0 ? '<strong>Mild</strong> concerns were noted in ' : 'The informant reported <strong>mild</strong> concerns in ');
          content += joinList(mild) + '. ';
        }
        content += '</p>';

        if (clearDomains.length > 0) {
          var clearNames = [];
          for (var cl = 0; cl < clearDomains.length; cl++) clearNames.push(clearDomains[cl].name.toLowerCase());
          content += '<p>No concerns were raised in ' + joinList(clearNames) + '.</p>';
        }

        content += '<p><em>Changes in behaviour can sometimes be among the earliest signs of changes in brain health. These observations will be considered alongside all other assessment findings.</em></p>';
      } else {
        content += '<p><em>No behavioural changes were reported by the informant, which is reassuring.</em></p>';
      }
      if (!compact) content += '<div class="chart-container" id="chart-mbic"></div>';
    } else {
      content += '<p class="text-muted">MBI-C not yet completed.</p>';
    }

    // ── NPI-Q ──
    if (npiq) {
      content += '<p><strong>Neuropsychiatric Inventory (NPI-Q):</strong> ' + npiq.count + ' of 12 symptoms reported';
      if (npiq.count > 0) content += ' — severity total ' + npiq.severityTotal + ', carer distress total ' + npiq.distressTotal;
      content += '</p>';

      if (npiq.count > 0) {
        var symptoms = BHM.Instruments.NPIQ.getSymptoms();
        var npiData = S.getSession().instruments.npiQ || {};
        var sevLabels = { 1: 'mild', 2: 'moderate', 3: 'severe' };
        var distLabels = { 0: 'no distress', 1: 'minimal', 2: 'mild', 3: 'moderate', 4: 'severe', 5: 'extreme' };

        // Group by severity
        var npiSevere = [], npiMod = [], npiMild = [], npiAbsent = [];
        var maxDist = 0;
        for (var si = 0; si < symptoms.length; si++) {
          if (npiData[symptoms[si].key + '_present'] === 'yes') {
            var sev = Number(npiData[symptoms[si].key + '_severity'] || 0);
            var dist = Number(npiData[symptoms[si].key + '_distress'] || 0);
            if (dist > maxDist) maxDist = dist;
            var entry = symptoms[si].label;
            if (sev === 3) npiSevere.push(entry);
            else if (sev === 2) npiMod.push(entry);
            else npiMild.push(entry);
          } else if (npiData[symptoms[si].key + '_present'] === 'no') {
            npiAbsent.push(symptoms[si].label.toLowerCase());
          }
        }

        content += '<p>';
        if (npiSevere.length > 0) content += '<strong>Severe:</strong> ' + joinList(npiSevere) + '. ';
        if (npiMod.length > 0) content += '<strong>Moderate:</strong> ' + joinList(npiMod) + '. ';
        if (npiMild.length > 0) content += '<strong>Mild:</strong> ' + joinList(npiMild) + '. ';
        content += '</p>';

        if (npiAbsent.length > 0) {
          content += '<p>Not reported: ' + joinList(npiAbsent) + '.</p>';
        }

        if (maxDist >= 3) {
          content += '<p>The informant indicated up to <strong>' + distLabels[maxDist] + '</strong> levels of personal distress in relation to these symptoms.</p>';
        }

        content += '<p><em>These symptoms can be distressing for both the person and their family. Understanding which are present helps guide the most appropriate support.</em></p>';
      } else {
        content += '<p><em>No neuropsychiatric symptoms were reported by the informant, which is reassuring.</em></p>';
      }
      if (!compact && npiq.count > 0) content += '<div class="chart-container" id="chart-npiq"></div>';
    } else {
      content += '<p class="text-muted">NPI-Q not yet completed.</p>';
    }

    return section('Changes Noticed by Family or Friends', content, compact, 'informant');
  }

  // ═══════════════════════════════════════════
  //  CLINICAL INTERVIEW — granular NLP summary
  // ═══════════════════════════════════════════
  function clinicalSection(compact) {
    var c = S.getSession().instruments.clinical || {};
    var content = '';
    var hasAnything = false;
    var CI = BHM.Instruments.ClinicalInterview;

    // ── A. Memory ──
    var memItems = CI ? CI.getMemItems() : [];
    var memDaily = [], memWeekly = [], memMonthly = [], memOther = [];
    var memAbsent = 0;
    for (var mi = 0; mi < memItems.length; mi++) {
      var mk = memItems[mi].key;
      if (c[mk] === 'yes') {
        var freq = c[mk + '_freq'] || '';
        var desc = memItems[mi].label.toLowerCase();
        if (freq === 'daily') memDaily.push(desc);
        else if (freq === 'weekly') memWeekly.push(desc);
        else if (freq === 'monthly') memMonthly.push(desc);
        else memOther.push(desc + (freq ? ' (' + freq + ')' : ''));
      } else if (c[mk] === 'no') { memAbsent++; }
    }
    if (memDaily.length > 0 || memWeekly.length > 0 || memMonthly.length > 0 || memOther.length > 0) {
      hasAnything = true;
      content += '<p><strong>Memory and new learning:</strong> You described difficulties with your memory. ';
      if (memDaily.length > 0) content += 'On a daily basis, this includes ' + joinList(memDaily) + '. ';
      if (memWeekly.length > 0) content += 'On a weekly basis, you noted ' + joinList(memWeekly) + '. ';
      if (memMonthly.length > 0) content += 'Less frequently, you reported ' + joinList(memMonthly) + '. ';
      if (memOther.length > 0) content += 'You also reported ' + joinList(memOther) + '. ';
      content += '</p>';
    } else if (memAbsent === memItems.length && memItems.length > 0) {
      hasAnything = true;
      content += '<p><strong>Memory and new learning:</strong> You did not report any significant difficulties with memory or learning new information.</p>';
    }
    if (c.memoryNotes && c.memoryNotes.trim()) {
      content += '<p style="margin-left:1rem;font-style:italic;font-size:0.88rem">' + esc(c.memoryNotes) + '</p>';
    }

    // ── B. Language ──
    var langItems = CI ? CI.getLangItems() : [];
    var langPresent = [], langAbsent = 0;
    for (var li = 0; li < langItems.length; li++) {
      var lk = langItems[li].key;
      if (c[lk] === 'yes') {
        var lfreq = c[lk + '_freq'] || '';
        langPresent.push(langItems[li].label.toLowerCase() + (lfreq ? ' (' + lfreq + ')' : ''));
      } else if (c[lk] === 'no') { langAbsent++; }
    }
    if (langPresent.length > 0 || langAbsent === langItems.length) {
      hasAnything = true;
      if (langPresent.length > 0) {
        content += '<p><strong>Word-finding and language:</strong> You reported difficulties with ' + joinList(langPresent) + '.';
      } else {
        content += '<p><strong>Word-finding and language:</strong> You did not report difficulties with word-finding or language.';
      }
      if (c.primaryLanguage) content += ' Your primary language is ' + esc(c.primaryLanguage) + '.';
      if (c.langDifficulty && c.langDifficulty !== 'No' && c.langDifficulty !== '') {
        content += ' A longstanding language difficulty was noted (' + esc(c.langDifficulty) + ').';
      }
      content += '</p>';
    }
    if (c.languageNotes && c.languageNotes.trim()) {
      content += '<p style="margin-left:1rem;font-style:italic;font-size:0.88rem">' + esc(c.languageNotes) + '</p>';
    }

    // ── C. Wayfinding / visuospatial ──
    var visItems = CI ? CI.getVisItems() : [];
    var visPresent = [], visStopped = [], visSafety = [];
    for (var vi = 0; vi < visItems.length; vi++) {
      var vk = visItems[vi].key;
      var vlbl = visItems[vi].label.toLowerCase().replace(/^gets /, 'getting ').replace(/^difficulty /, 'difficulty ');
      if (c[vk + '_present'] === 'yes') visPresent.push(vlbl);
      if (c[vk + '_stopped'] === 'yes') visStopped.push(vlbl);
      if (c[vk + '_safety'] === 'yes') visSafety.push(vlbl);
    }
    if (visPresent.length > 0 || visStopped.length > 0) {
      hasAnything = true;
      content += '<p><strong>Wayfinding and visuospatial skills:</strong> ';
      if (visPresent.length > 0) content += 'You described current difficulties with ' + joinList(visPresent) + '. ';
      if (visStopped.length > 0) content += 'You have stopped or are no longer able to do the following due to these difficulties: ' + joinList(visStopped) + '. ';
      if (visSafety.length > 0) content += '<strong>Safety concerns</strong> were identified in relation to ' + joinList(visSafety) + '.';
      content += '</p>';
    }
    if (c.visuospatialNotes && c.visuospatialNotes.trim()) {
      content += '<p style="margin-left:1rem;font-style:italic;font-size:0.88rem">' + esc(c.visuospatialNotes) + '</p>';
    }

    // ── D. Personal background ──
    var hasBg = c.birthPlace || c.livingSituation || c.siblings || c.relationships || c.children || c.military === 'Yes';
    if (hasBg) {
      hasAnything = true;
      content += '<p><strong>Personal background:</strong> ';
      var bgSentences = [];
      if (c.birthPlace) bgSentences.push('You were born in ' + esc(c.birthPlace));
      if (c.livingSituation) bgSentences.push('you currently ' + esc(c.livingSituation).toLowerCase());
      var famParts = [];
      if (c.siblings) famParts.push(esc(c.siblings) + ' sibling' + (c.siblings !== '1' ? 's' : ''));
      if (c.children) famParts.push(esc(c.children) + ' child' + (c.children !== '1' ? 'ren' : ''));
      if (famParts.length > 0) bgSentences.push('you have ' + famParts.join(' and '));
      if (c.relationships) {
        var rel = esc(c.relationships).toLowerCase();
        if (/married|partner|civil/.test(rel)) bgSentences.push('you are ' + rel);
        else if (/single|divorced|widow|separated|bereaved/.test(rel)) bgSentences.push('you are ' + rel);
        else bgSentences.push('your relationship status is ' + rel);
      }
      if (c.military === 'Yes') bgSentences.push('you have a history of military service');
      // Join into flowing prose
      if (bgSentences.length > 0) {
        content += bgSentences[0];
        for (var bs = 1; bs < bgSentences.length; bs++) {
          content += (bs === bgSentences.length - 1 ? ', and ' : ', ') + bgSentences[bs];
        }
        content += '.';
      }
      content += '</p>';
    }
    if (c.trauma === 'Yes' && c.traumaDetails) {
      content += '<p>A history of trauma was disclosed: ' + esc(c.traumaDetails) + '.</p>';
    }

    // ── E. Head injury ──
    if (c.headInjury === 'Yes') {
      hasAnything = true;
      content += '<p><strong>Head injury:</strong> You reported a history of head injury.';
      if (c.headInjuryMech) content += ' This was caused by ' + esc(c.headInjuryMech).toLowerCase() + '.';
      if (c.headInjuryLOC && c.headInjuryLOC !== 'No' && c.headInjuryLOC !== '') content += ' There was a loss of consciousness (' + esc(c.headInjuryLOC).toLowerCase() + ').';
      if (c.headInjuryPTA && c.headInjuryPTA !== 'No' && c.headInjuryPTA !== '') content += ' Post-traumatic amnesia was reported (' + esc(c.headInjuryPTA).toLowerCase() + ').';
      if (c.repeatedConcussions === 'Yes') content += ' You reported repeated concussions' + (c.concussionCount ? ' (approximately ' + c.concussionCount + ')' : '') + '.';
      if (c.contactSports === 'Yes') content += ' You have a history of contact sports (' + esc(c.contactSportsDetails || 'details not specified') + ').';
      if (c.headInjuryOngoing && c.headInjuryOngoing.trim()) content += ' You continue to experience: ' + esc(c.headInjuryOngoing) + '.';
      content += '</p>';
    } else if (c.headInjury === 'No') {
      hasAnything = true;
      content += '<p><strong>Head injury:</strong> You did not report any significant history of head injury.</p>';
    }

    // ── F. Premorbid personality ──
    var persItems = CI ? CI.getPersonalityItems() : [];
    var persParts = [];
    for (var pi = 0; pi < persItems.length; pi++) {
      var pv = c[persItems[pi].key];
      if (pv && pv !== 'typical') {
        persParts.push({ trait: persItems[pi].label.toLowerCase(), level: pv.toLowerCase() });
      }
    }
    var hasPersMeta = c.persConflict || c.persMood || c.persSocial;
    if (persParts.length > 0 || hasPersMeta) {
      hasAnything = true;
      content += '<p><strong>Premorbid personality:</strong> Before these difficulties began, you were described as someone ';
      var persDesc = [];
      for (var pd = 0; pd < persParts.length; pd++) {
        persDesc.push('with ' + persParts[pd].level + ' ' + persParts[pd].trait);
      }
      if (c.persMood) persDesc.push('with a ' + esc(c.persMood).toLowerCase() + ' baseline mood');
      if (c.persSocial) persDesc.push('who was ' + esc(c.persSocial).toLowerCase() + 'ly socially engaged');
      if (c.persConflict) persDesc.push('who tended to be ' + esc(c.persConflict).toLowerCase() + ' in conflict situations');
      content += joinList(persDesc) + '.</p>';
    }

    // ── G. Education and occupation ──
    var hasEd = c.highestQual || c.schoolLeaveAge || c.yearsEdu || c.peakOccupation || c.occStatus;
    if (hasEd) {
      hasAnything = true;
      content += '<p><strong>Education and occupation:</strong> ';
      var edSentences = [];
      if (c.highestQual) {
        var qualStr = 'Your highest qualification is ' + esc(c.highestQual);
        if (c.schoolLeaveAge) qualStr += ', and you left school at age ' + esc(c.schoolLeaveAge);
        if (c.yearsEdu) qualStr += ' with approximately ' + esc(c.yearsEdu) + ' years of education';
        edSentences.push(qualStr);
      } else {
        if (c.yearsEdu) edSentences.push('You completed approximately ' + esc(c.yearsEdu) + ' years of education');
        if (c.schoolLeaveAge) edSentences.push('you left school at age ' + esc(c.schoolLeaveAge));
      }
      if (c.academicPerf) edSentences.push('you described your academic performance as ' + esc(c.academicPerf).toLowerCase());
      if (c.peakOccupation) {
        var occStr = 'your peak occupation was ' + esc(c.peakOccupation);
        if (c.occStatus) occStr += ' and you are currently ' + esc(c.occStatus).toLowerCase();
        edSentences.push(occStr);
      } else if (c.occStatus) {
        edSentences.push('you are currently ' + esc(c.occStatus).toLowerCase());
      }
      if (c.workDomain) edSentences.push('working in the ' + esc(c.workDomain).toLowerCase() + ' sector');
      if (c.learningDiff && c.learningDiff !== 'No' && c.learningDiff !== '') edSentences.push('a learning difficulty was noted (' + esc(c.learningDiff) + ')');
      content += edSentences[0];
      for (var es = 1; es < edSentences.length; es++) {
        content += '. ' + edSentences[es].charAt(0).toUpperCase() + edSentences[es].slice(1);
      }
      content += '.</p>';
      if (!compact) content += '<div class="chart-container" id="chart-education"></div>';
    }

    // ── H. Substance use ──
    var hasSub = c.alcUnitsWk || c.alcPast === 'Past harmful use' || c.tobacco || (c.cannabis && c.cannabis !== 'Never' && c.cannabis !== '');
    if (hasSub) {
      hasAnything = true;
      content += '<p><strong>Substance use:</strong> ';
      var subSentences = [];
      if (c.alcUnitsWk) subSentences.push('you reported drinking approximately ' + esc(c.alcUnitsWk) + ' units of alcohol per week');
      if (c.alcPast === 'Past harmful use') subSentences.push('there is a history of past harmful alcohol use' + (c.alcPastDetails ? ' (' + esc(c.alcPastDetails) + ')' : ''));
      if (c.tobacco) {
        var tobStr = 'regarding tobacco, you are ' + esc(c.tobacco).toLowerCase();
        if (c.tobaccoPacks) tobStr += ' (' + esc(c.tobaccoPacks) + ' packs/day';
        if (c.tobaccoYears) tobStr += (c.tobaccoPacks ? ' for ' : '(') + esc(c.tobaccoYears) + ' years)';
        else if (c.tobaccoPacks) tobStr += ')';
        subSentences.push(tobStr);
      }
      if (c.cannabis && c.cannabis !== 'Never' && c.cannabis !== '') subSentences.push('cannabis use was reported (' + esc(c.cannabis).toLowerCase() + ')');
      if (c.otherSubstances && c.otherSubstances !== 'None' && c.otherSubstances !== '') subSentences.push('other substance use: ' + esc(c.otherSubstances).toLowerCase());
      if (c.substanceHarms && c.substanceHarms !== 'No' && c.substanceHarms !== '') subSentences.push('substance-related harms were reported (' + esc(c.substanceHarms).toLowerCase() + ')');
      content += subSentences[0].charAt(0).toUpperCase() + subSentences[0].slice(1);
      for (var ss = 1; ss < subSentences.length; ss++) content += '. ' + subSentences[ss].charAt(0).toUpperCase() + subSentences[ss].slice(1);
      content += '.</p>';
    }
    if (c.substanceNotes && c.substanceNotes.trim()) {
      content += '<p style="margin-left:1rem;font-style:italic;font-size:0.88rem">' + esc(c.substanceNotes) + '</p>';
    }

    // ── I. Clinician summary ──
    if (c.keyPositives && c.keyPositives.trim()) {
      hasAnything = true;
      content += '<p><strong>Key findings:</strong> ' + esc(c.keyPositives) + '</p>';
    }
    if (c.safetyConcerns && c.safetyConcerns.trim()) {
      hasAnything = true;
      content += '<p><strong>Safety concerns:</strong> ' + esc(c.safetyConcerns) + '</p>';
    } else if (hasAnything) {
      content += '<p><strong>Safety concerns:</strong> None identified during this assessment.</p>';
    }

    if (!hasAnything) {
      content = '<p class="text-muted">Clinical interview not yet completed.</p>';
    } else {
      content += '<p><em>This information was gathered during a semi-structured clinical interview and provides important context for interpreting the assessment findings.</em></p>';
    }

    return section('Clinical Interview', content, compact, 'clinical');
  }

  // ═══════════════════════════════════════════
  //  STAGING (CDR)
  // ═══════════════════════════════════════════
  function stagingSection(compact) {
    var cdr = S.getScore('cdr');
    var content = '';
    if (cdr && cdr.total !== null) {
      content += '<p><strong>Clinical Dementia Rating (CDR) Total:</strong> ' + scoreBadge(cdr.total, 3, { moderate: 0.5, poor: 1 }) + '</p>';
      content += '<p><strong>CDR Sum of Boxes (CDR-SB):</strong> ' + scoreBadge(cdr.sumOfBoxes, 18, { moderate: 2.5, poor: 4 }) + '</p>';
      if (cdr.total === 0) content += '<p>The CDR rating indicates no dementia. No significant cognitive decline from the person\'s previous usual level was identified across the domains assessed.</p>';
      else if (cdr.total === 0.5) content += '<p>The CDR rating of 0.5 indicates questionable or very mild impairment. There may be some subtle changes in one or more areas that are worth monitoring.</p>';
      else if (cdr.total === 1) content += '<p>The CDR rating of 1 indicates mild dementia. Difficulties were noted across several domains that are likely affecting daily activities to some degree.</p>';
      else if (cdr.total === 2) content += '<p>The CDR rating of 2 indicates moderate dementia. Significant difficulties were noted across several areas, with a clear impact on daily functioning and independence.</p>';
      else if (cdr.total === 3) content += '<p>The CDR rating of 3 indicates severe dementia. Major difficulties were noted across all areas, with substantial loss of independent function.</p>';
      if (cdr.severity) content += '<p>Based on the Sum of Boxes score (' + cdr.sumOfBoxes + '), this is classified as <strong>' + cdr.severity + '</strong> (Bryant et al 2012).</p>';
      if (cdr.domainScores) {
        content += '<p>Domain ratings: ';
        var parts = [], labels = { memory: 'Memory', orientation: 'Orientation', judgment: 'Judgment', community: 'Community Affairs', homeHobbies: 'Home & Hobbies', personalCare: 'Personal Care' };
        for (var key in cdr.domainScores) { if (cdr.domainScores.hasOwnProperty(key)) parts.push(labels[key] + ': ' + cdr.domainScores[key]); }
        content += parts.join(', ') + '</p>';
      }
      if (!compact) content += '<div class="chart-container" id="chart-cdr"></div>';
    } else {
      content += '<p class="text-muted">CDR assessment not yet completed.</p>';
    }
    return section('Staging', content, compact, 'staging');
  }

  // ═══════════════════════════════════════════
  //  RBANS
  // ═══════════════════════════════════════════
  function rbansSection(compact) {
    var rb = S.getScore('rbans');
    if (!rb || !rb.indices) return section('Neuropsychological Assessment', '<p class="text-muted">RBANS not yet completed.</p>', compact, 'rbans');
    var idx = rb.indices, cent = rb.centiles, raw = S.getSession().instruments.rbans || {};
    var content = '';
    if (rb.fsiq) content += '<p><strong>Premorbid Functioning (TOPF):</strong> Estimated pre-morbid IQ approximately <strong>' + rb.fsiq + '</strong>.</p>';
    content += '<p><strong>Total Scale Score:</strong> ' + scoreBadge(idx.totalScale, null, { moderate: 84, poor: 69 }) + ' (' + cent.totalScale + 'th percentile)</p>';
    if (idx.totalScale >= 90) content += '<p>Your overall cognitive performance on the RBANS fell within the average range or better.</p>';
    else if (idx.totalScale >= 80) content += '<p>Your overall cognitive performance was in the low average range, which may reflect subtle difficulties across domains.</p>';
    else if (idx.totalScale >= 70) content += '<p>Your overall cognitive performance was in the borderline range, suggesting difficulties across multiple domains.</p>';
    else content += '<p>Your overall cognitive performance was well below the expected range, indicating significant difficulties.</p>';
    content += '<table style="width:100%;border-collapse:collapse;margin:0.75rem 0"><thead><tr>' + rptTh('Domain') + rptTh('Index', 'center') + rptTh('Centile', 'center') + rptTh('Classification', 'center') + '</tr></thead><tbody>';
    var domainList = [
      { label: 'Immediate Memory', i: idx.immediateMemory, c: cent.immediateMemory },
      { label: 'Visuospatial/Constructional', i: idx.visuospatial, c: cent.visuospatial },
      { label: 'Language', i: idx.language, c: cent.language },
      { label: 'Attention', i: idx.attention, c: cent.attention },
      { label: 'Delayed Memory', i: idx.delayedMemory, c: cent.delayedMemory }
    ];
    for (var d2 = 0; d2 < domainList.length; d2++) { var dm = domainList[d2]; content += '<tr>' + rptTd(dm.label, null, true) + rptTd(dm.i, 'center') + rptTd(dm.c + '%', 'center') + rptTd(classifyIndex(dm.i), 'center') + '</tr>'; }
    content += '<tr style="background:#e8edf3;font-weight:600">' + rptTd('Total Scale', null, true) + rptTd(idx.totalScale, 'center') + rptTd(cent.totalScale + '%', 'center') + rptTd(classifyIndex(idx.totalScale), 'center') + '</tr>';
    content += '</tbody></table>';
    if (!compact) content += '<div class="chart-container" id="chart-rbans" style="min-height:780px;max-width:700px;margin:0 auto"></div>';
    content += '<div style="margin-top:1rem">';
    content += '<h5 style="color:#0d6efd;border-bottom:2px solid #0d6efd;padding-bottom:3px;font-size:0.95rem">Immediate Memory</h5>';
    content += '<p>You scored ' + (raw.listlearning || '--') + '/40 on the word list learning task which is a sensitive indicator of your ability to remember new words. You scored ' + (raw.storylearning || '--') + '/24 on the short story learning task which is similar. This gives an Immediate Memory Index Score of <strong>' + idx.immediateMemory + '</strong>. This means that ' + cent.immediateMemory + '% of healthy people in your age group score worse than you on this subtest.</p>';
    content += '<h5 style="color:#0d6efd;border-bottom:2px solid #0d6efd;padding-bottom:3px;font-size:0.95rem">Visuospatial Function</h5>';
    content += '<p>You scored ' + (raw.lineorientation || '--') + '/20 on the line orientation task which tests visual perceptual ability. You scored ' + (raw.figurecopy || '--') + '/20 on the figure copy task which tests visual working memory and motor skill. This gives a Visuospatial/Constructional Index Score of <strong>' + idx.visuospatial + '</strong>. This means that ' + cent.visuospatial + '% of healthy people in your age group score worse than you on this subtest.</p>';
    content += '<h5 style="color:#0d6efd;border-bottom:2px solid #0d6efd;padding-bottom:3px;font-size:0.95rem">Language Function</h5>';
    content += '<p>You scored ' + (raw.naming || '--') + '/10 on the naming task which is a specific measure of your ability to recall words. You scored ' + (raw.semanticfluency || '--') + '/40 on the semantic fluency task which makes demands on your attention and executive function as well as memory. This gives a Language Index Score of <strong>' + idx.language + '</strong>. This means that ' + cent.language + '% of healthy people in your age group score worse than you on this subtest.</p>';
    content += '<h5 style="color:#0d6efd;border-bottom:2px solid #0d6efd;padding-bottom:3px;font-size:0.95rem">Attention &amp; Concentration</h5>';
    content += '<p>You scored ' + (raw.digitspan || '--') + '/16 on the digit span task which tests attention and working memory. You scored ' + (raw.coding || '--') + '/89 on the digit-symbol coding task which tests attention and processing speed. This gives an Attention Index Score of <strong>' + idx.attention + '</strong>. This means that ' + cent.attention + '% of healthy people in your age group score worse than you on this subtest.</p>';
    content += '<h5 style="color:#0d6efd;border-bottom:2px solid #0d6efd;padding-bottom:3px;font-size:0.95rem">Delayed Memory</h5>';
    content += '<p>You scored ' + (raw.listrecall || '--') + '/10 on the free recall of ten words, a sensitive indicator of verbal learning and recall. You scored ' + (raw.listrecog || '--') + '/20 on the cued recall task which taxes delayed memory. Recalling the complex figure is difficult, and you scored ' + (raw.figurerecall || '--') + '/20. You remembered ' + (raw.storyrecall || '--') + ' items out of a possible 12 from the short story. This gives a Delayed Memory Index Score of <strong>' + idx.delayedMemory + '</strong>. This means that ' + cent.delayedMemory + '% of healthy people in your age group score worse than you on this subtest.</p>';
    content += '<h5 style="color:#0d6efd;border-bottom:2px solid #0d6efd;padding-bottom:3px;font-size:0.95rem">Overall Scores</h5>';
    content += '<p>The Total Scale Score is <strong>' + idx.totalScale + '</strong>. This means that ' + cent.totalScale + '% of healthy people in your age group score worse than you overall.</p>';
    content += '</div>';
    content += '<div style="margin-top:0.75rem;padding:8px 12px;background:#f8f9fa;border-radius:6px;font-size:0.84rem">';
    content += '<strong>Supplementary Indices:</strong> Effort — Silverberg = ' + rb.silverbergEI + ', Novitski = ' + rb.novitskiES + '. ';
    content += 'Cortical–Subcortical Index = ' + rb.corticalSubcortical.toFixed(1) + (rb.corticalSubcortical > 0 ? ' (cortical pattern)' : ' (subcortical pattern)') + '.';
    if (rb.duff) {
      content += '<br><strong>Duff demographically-corrected centiles:</strong> Imm Memory ' + rb.duff.immCentile + '%, Visuospatial ' + rb.duff.visuoCentile + '%, Language ' + rb.duff.langCentile + '%, Attention ' + rb.duff.attCentile + '%, Delayed Memory ' + rb.duff.memCentile + '%, Total ' + rb.duff.totalCentile + '%.';
    }
    content += '</div>';
    return section('Neuropsychological Assessment (RBANS)', content, compact, 'rbans');
  }
  function classifyIndex(idx) { if (idx >= 130) return 'Very Superior'; if (idx >= 120) return 'Superior'; if (idx >= 110) return 'High Average'; if (idx >= 90) return 'Average'; if (idx >= 80) return 'Low Average'; if (idx >= 70) return 'Borderline'; return 'Extremely Low'; }

  // ═══════════════════════════════════════════
  //  LEWY BODY (DIAMOND Lewy)
  // ═══════════════════════════════════════════
  function lewySection(compact) {
    var dl = S.getScore('diamondLewy');
    if (!dl || dl.diagnosis === 'incomplete') return section('Lewy Body Features', '<p class="text-muted">DIAMOND Lewy assessment not yet completed.</p>', compact, 'lewy');
    var content = '';
    var diag = dl.diagnosis;
    var isPending = diag.indexOf('_pending') !== -1;
    var baseDiag = diag.replace('_pending', '');
    var pendingNote = isPending ? ' <em>(note: the presence of progressive cognitive decline is currently uncertain and requires further evaluation)</em>' : '';

    switch (baseDiag) {
      case 'probable': content += '<p><strong>Diagnostic classification:</strong> <span class="score-badge score-poor">Probable Dementia with Lewy Bodies (DLB)</span>' + pendingNote + '</p>'; break;
      case 'possible': content += '<p><strong>Diagnostic classification:</strong> <span class="score-badge score-moderate">Possible Dementia with Lewy Bodies (DLB)</span>' + pendingNote + '</p>'; break;
      case 'not_met': content += '<p><strong>Diagnostic classification:</strong> DLB criteria not met.' + pendingNote + '</p>'; break;
      case 'no_dementia': content += '<p><strong>Diagnostic classification:</strong> Essential criterion (progressive cognitive decline) not established.</p>'; break;
    }
    content += '<p><strong>Core features present (' + dl.coreCount + '/4):</strong> ' + ((dl.corePresent && dl.corePresent.length > 0) ? dl.corePresent.join(', ') : 'None identified') + '</p>';
    content += '<p><strong>Indicative biomarkers:</strong> ' + dl.biomarkerCount + ' present</p>';
    if (dl.supportiveCount > 0) { content += '<p><strong>Supportive features (' + dl.supportiveCount + '):</strong> ' + ((dl.supportivePresent && dl.supportivePresent.length > 0) ? dl.supportivePresent.join(', ') : '') + '</p>'; }
    if (baseDiag === 'probable') content += '<p>The assessment findings meet criteria for <em>probable</em> Dementia with Lewy Bodies based on the 4th DLB Consensus Criteria (McKeith et al., 2017). This means the pattern of symptoms is consistent with this form of dementia, and the implications will be discussed with you.</p>';
    else if (baseDiag === 'possible') content += '<p>The assessment findings meet criteria for <em>possible</em> Dementia with Lewy Bodies. This means some features suggestive of this diagnosis were identified, but the full diagnostic criteria were not met. Further investigation may be helpful.</p>';
    else if (baseDiag === 'not_met' && !isPending) content += '<p>While dementia was identified, the specific features needed for a diagnosis of Dementia with Lewy Bodies were not found during this assessment.</p>';
    else if (baseDiag === 'not_met' && isPending) content += '<p>The specific features needed for a diagnosis of Dementia with Lewy Bodies were not found during this assessment. The question of whether progressive cognitive decline is present remains to be clarified.</p>';
    return section('Lewy Body Features', content, compact, 'lewy');
  }

  // ─── Utility ───
  function esc(str) { var div = document.createElement('div'); div.textContent = str; return div.innerHTML; }
  function joinList(arr) {
    if (arr.length === 0) return '';
    if (arr.length === 1) return arr[0];
    return arr.slice(0, -1).join(', ') + ', and ' + arr[arr.length - 1];
  }

  /** Convert first-person text to second person (I/me/my → you/your) */
  function toSecondPerson(text) {
    var s = text;
    // Longer phrases first to avoid partial matches
    s = s.replace(/\bI feel\b/g, 'you feel');
    s = s.replace(/\bI can\b/g, 'you can');
    s = s.replace(/\bI choose\b/g, 'you choose');
    s = s.replace(/\bI look\b/g, 'you look');
    s = s.replace(/\bI enjoy\b/g, 'you enjoy');
    s = s.replace(/\bI would\b/g, 'you would');
    s = s.replace(/\bI want\b/g, 'you want');
    s = s.replace(/\bI have\b/g, 'you have');
    s = s.replace(/\bI do\b/g, 'you do');
    s = s.replace(/\bI am\b/g, 'you are');
    s = s.replace(/\bI\b/g, 'you');
    s = s.replace(/\bMy\b/g, 'Your');
    s = s.replace(/\bmy\b/g, 'your');
    s = s.replace(/\bmyself\b/g, 'yourself');
    s = s.replace(/\bme\b/g, 'you');
    return s;
  }

  return { update: update, TEMPLATE_VERSION: TEMPLATE_VERSION };
})();
