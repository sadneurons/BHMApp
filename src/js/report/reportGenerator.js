/* ═══════════════════════════════════════════════════════
   BHM.Report — Live plain-language report generator
   Reworked: removed single-bar charts, added radar for
   MBI-C/NPI-Q, full RBANS section with table + narratives
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};

BHM.Report = (function () {
  'use strict';

  var S = BHM.State;
  var TEMPLATE_VERSION = '1.1.0';

  function update() {
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

    // Header
    var header = document.createElement('div');
    header.className = 'report-header';
    var name = S.get('patient.name') || '[Patient Name]';
    var date = S.get('patient.dateOfCompletion') || '[Date]';
    header.innerHTML =
      '<div style="font-size:0.85rem;color:#6c757d">PLACEHOLDER — brainHEALTH Manchester Logo</div>' +
      '<h3>Assessment Report</h3>' +
      '<p class="mb-0"><strong>' + esc(name) + '</strong></p>' +
      '<p class="text-muted mb-0">Date: ' + esc(date) + '</p>';
    wrapper.appendChild(header);

    // Report body
    var bodyDiv = document.createElement('div');
    bodyDiv.innerHTML = generateHTML(false);
    wrapper.appendChild(bodyDiv);

    // Clinician editable inserts
    wrapper.appendChild(createClinicianInsert('Overall Summary', 'clinicianInserts.overallSummary'));
    wrapper.appendChild(createClinicianInsert('What We Agreed Today', 'clinicianInserts.agreedToday'));
    wrapper.appendChild(createClinicianInsert('Safety and Follow-up', 'clinicianInserts.safetyFollowUp'));

    // Next steps
    var nextSteps = document.createElement('div');
    nextSteps.innerHTML = '<h4>Next Steps and Signposting</h4>' +
      '<p>This report summarises the information gathered during your assessment. ' +
      'Your clinician will discuss the findings with you and agree any next steps. ' +
      'If you have concerns about any of the areas covered, please speak to your clinician or GP.</p>';
    wrapper.appendChild(nextSteps);

    // Footer
    var footer = document.createElement('div');
    footer.className = 'report-footer mt-4 pt-2 border-top text-muted';
    footer.style.fontSize = '0.75rem';
    footer.innerHTML = 'Report template v' + TEMPLATE_VERSION + ' | App v' + S.VERSION +
      ' | Generated: ' + new Date().toLocaleString();
    wrapper.appendChild(footer);

    container.appendChild(wrapper);

    // Render charts into the report
    if (BHM.Charts && BHM.Charts.renderReportCharts) {
      BHM.Charts.renderReportCharts(wrapper);
    }
  }

  // ─── Generate report HTML sections ───
  function generateHTML(compact) {
    var html = '';

    html += section('About This Report',
      '<p>This report was generated from questionnaire responses completed ' +
      (S.get('meta.sourceMode') === 'live' ? 'during your appointment' : 'from your paper booklet responses') +
      '. It provides a summary of the information gathered, written in plain language. ' +
      'The scores and descriptions below are based on standardised questionnaires and are intended to help you and your clinician understand the results.</p>',
      compact);

    html += sleepSection(compact);
    html += moodSection(compact);
    html += alcoholSection(compact);
    html += dietSection(compact);
    html += qolSection(compact);
    html += hearingSection(compact);
    html += informantSection(compact);
    html += clinicalSection(compact);
    html += stagingSection(compact);
    html += rbansSection(compact);
    html += lewySection(compact);

    return html;
  }

  // ─── Section helpers ───
  function section(title, content, compact) {
    if (compact) return '<h6>' + title + '</h6>' + content;
    return '<h4>' + title + '</h4>' + content;
  }

  function scoreBadge(value, max, thresholds) {
    if (value === null || value === undefined) return '<span class="score-badge" style="background:#e9ecef">Not yet scored</span>';
    var cls = 'score-good';
    if (thresholds) {
      if (value > thresholds.poor) cls = 'score-poor';
      else if (value > thresholds.moderate) cls = 'score-moderate';
    }
    return '<span class="score-badge ' + cls + '">' + value + (max ? '/' + max : '') + '</span>';
  }

  // helper: styled table for report
  function rptTh(text, align) {
    return '<th style="padding:5px 8px;border:1px solid #dee2e6;background:#e8edf3;font-weight:600;font-size:0.84rem;' +
      (align ? 'text-align:' + align : 'text-align:left') + '">' + text + '</th>';
  }
  function rptTd(text, align, bold) {
    return '<td style="padding:4px 8px;border:1px solid #dee2e6;font-size:0.86rem;' +
      (align ? 'text-align:' + align : '') + (bold ? ';font-weight:600' : '') + '">' + text + '</td>';
  }

  // ═══════════════════════════════════════════
  //  SLEEP
  // ═══════════════════════════════════════════
  function sleepSection(compact) {
    var psqi = S.getScore('psqi');
    var epworth = S.getScore('epworth');
    var content = '';

    if (psqi && psqi.globalTotal !== null) {
      content += '<p><strong>Pittsburgh Sleep Quality Index (PSQI):</strong> ' +
        scoreBadge(psqi.globalTotal, 21, { moderate: 5, poor: 10 }) + '</p>';
      if (psqi.globalTotal <= 5) {
        content += '<p>Your responses suggest you have been sleeping reasonably well over the past month.</p>';
      } else {
        content += '<p>Your responses suggest your sleep has been disrupted over the past month. ';
        var compNames = ['Subjective Quality', 'Sleep Latency', 'Sleep Duration', 'Sleep Efficiency',
          'Sleep Disturbance', 'Sleep Medication', 'Daytime Dysfunction'];
        var compKeys = ['subjectiveQuality', 'sleepLatency', 'sleepDuration', 'sleepEfficiency',
          'sleepDisturbance', 'sleepMedication', 'daytimeDysfunction'];
        var highComps = [];
        for (var i = 0; i < compKeys.length; i++) {
          if (psqi.components[compKeys[i]] >= 2) highComps.push(compNames[i]);
        }
        if (highComps.length > 0) {
          content += 'The areas that contributed most were: ' + highComps.join(', ') + '.</p>';
        } else {
          content += '</p>';
        }
      }
      // PSQI has 7 meaningful components — keep chart
      if (!compact) content += '<div class="chart-container" id="chart-psqi"></div>';
    } else {
      content += '<p class="text-muted">PSQI not yet completed.</p>';
    }

    if (epworth && epworth.total !== null) {
      content += '<p><strong>Epworth Sleepiness Scale:</strong> ' +
        scoreBadge(epworth.total, 24, { moderate: 10, poor: 14 }) + '</p>';
      if (epworth.total <= 10) {
        content += '<p>Your daytime sleepiness is within the normal range.</p>';
      } else if (epworth.total <= 14) {
        content += '<p>You reported mild excessive daytime sleepiness. This means you may feel more sleepy during the day than is typical.</p>';
      } else {
        content += '<p>You reported significant daytime sleepiness. This may affect your daily activities and is worth discussing with your clinician.</p>';
      }
      // No chart — single number, badge is sufficient
    } else {
      content += '<p class="text-muted">Epworth not yet completed.</p>';
    }

    return section('Sleep', content, compact);
  }

  // ═══════════════════════════════════════════
  //  MOOD & WORRY
  // ═══════════════════════════════════════════
  function moodSection(compact) {
    var gad = S.getScore('gad7');
    var dep = S.getScore('depression');
    var content = '';

    if (gad && gad.total !== null) {
      content += '<p><strong>Anxiety (GAD-7):</strong> ' +
        scoreBadge(gad.total, 21, { moderate: 9, poor: 14 }) + '</p>';
      if (gad.total <= 4) {
        content += '<p>Your anxiety scores are in the minimal range, suggesting worry and nervousness have not been a significant problem recently.</p>';
      } else if (gad.total <= 9) {
        content += '<p>Your responses indicate mild levels of anxiety over the past two weeks.</p>';
      } else if (gad.total <= 14) {
        content += '<p>Your responses suggest moderate anxiety. You may be experiencing worry or nervousness that is affecting your daily life.</p>';
      } else {
        content += '<p>Your responses indicate severe anxiety levels. It is important to discuss this with your clinician.</p>';
      }
      if (gad.impairment) {
        var impLabels = { not_difficult: 'not at all difficult', somewhat: 'somewhat difficult', very: 'very difficult', extremely: 'extremely difficult' };
        content += '<p>You rated the impact on your daily functioning as <em>' + (impLabels[gad.impairment] || gad.impairment) + '</em>.</p>';
      }
      // No chart — single score, badge + text sufficient
    } else {
      content += '<p class="text-muted">GAD-7 not yet completed.</p>';
    }

    if (dep && dep.total !== null) {
      content += '<p><strong>Depression Screen (GDS-15):</strong> ' +
        scoreBadge(dep.total, 15, { moderate: 4, poor: 8 }) + '</p>';
      if (dep.total <= 4) {
        content += '<p>Your responses do not suggest significant symptoms of depression.</p>';
      } else if (dep.total <= 8) {
        content += '<p>Your responses suggest mild depressive symptoms. This may mean you have been feeling a little low recently.</p>';
      } else if (dep.total <= 11) {
        content += '<p>Your responses suggest moderate depressive symptoms. It would be helpful to discuss how you have been feeling.</p>';
      } else {
        content += '<p>Your responses indicate significant depressive symptoms. Please discuss this with your clinician.</p>';
      }
      // No chart — single score
    } else {
      content += '<p class="text-muted">Depression screen not yet completed.</p>';
    }

    return section('Mood and Worry', content, compact);
  }

  // ═══════════════════════════════════════════
  //  ALCOHOL
  // ═══════════════════════════════════════════
  function alcoholSection(compact) {
    var audit = S.getScore('auditTool');
    var content = '';

    if (audit && audit.total !== null) {
      content += '<p><strong>AUDIT Score:</strong> ' +
        scoreBadge(audit.total, 40, { moderate: 7, poor: 15 }) + '</p>';
      if (audit.total <= 7) {
        content += '<p>Your alcohol use is within the low-risk range.</p>';
      } else if (audit.total <= 15) {
        content += '<p>Your responses suggest an increasing risk level of alcohol use. It may be worth reviewing your drinking habits.</p>';
      } else if (audit.total <= 19) {
        content += '<p>Your responses suggest a higher-risk level of alcohol use. We recommend discussing this further.</p>';
      } else {
        content += '<p>Your responses suggest a level of alcohol use that may indicate dependence. Please discuss this with your clinician.</p>';
      }
      // No chart — single score
    } else {
      content += '<p class="text-muted">AUDIT not yet completed.</p>';
    }

    return section('Alcohol', content, compact);
  }

  // ═══════════════════════════════════════════
  //  DIET
  // ═══════════════════════════════════════════
  function dietSection(compact) {
    var dietScore = S.getScore('diet');
    var content = '';

    if (dietScore && dietScore.total !== null) {
      content += '<p><strong>Mediterranean Diet Score:</strong> ' +
        scoreBadge(dietScore.total, 14, { moderate: -1, poor: -1 }) + '</p>';
      if (dietScore.total >= 10) {
        content += '<p>Your diet appears to follow the Mediterranean pattern well, which is associated with good brain and heart health.</p>';
      } else if (dietScore.total >= 7) {
        content += '<p>Your diet has some Mediterranean features. There may be small changes you could make to improve your diet for brain health.</p>';
      } else {
        content += '<p>Your diet does not closely follow a Mediterranean pattern at present. A Mediterranean-style diet is associated with better brain health outcomes.</p>';
      }
      // No chart — single score
    } else {
      content += '<p class="text-muted">Diet questionnaire not yet completed.</p>';
    }

    return section('Diet Pattern', content, compact);
  }

  // ═══════════════════════════════════════════
  //  QUALITY OF LIFE
  // ═══════════════════════════════════════════
  function qolSection(compact) {
    var casp = S.getScore('casp19');
    var content = '';

    if (casp && casp.total !== null) {
      content += '<p><strong>Quality of Life (CASP-19):</strong> ' +
        scoreBadge(casp.total, 57, { moderate: -1, poor: -1 }) + '</p>';
      content += '<p>Your quality of life score is ' + casp.total + ' out of 57. Higher scores indicate better perceived quality of life.</p>';
      if (casp.domainTotals) {
        content += '<p>Domain breakdown: ';
        var parts = [];
        for (var d in casp.domainTotals) {
          if (casp.domainTotals.hasOwnProperty(d)) parts.push(d + ': ' + casp.domainTotals[d]);
        }
        content += parts.join(', ') + '</p>';
      }
      // CASP-19 has 4 meaningful domains — keep chart
      if (!compact) content += '<div class="chart-container" id="chart-casp19"></div>';
    } else {
      content += '<p class="text-muted">CASP-19 not yet completed.</p>';
    }

    return section('Quality of Life', content, compact);
  }

  // ═══════════════════════════════════════════
  //  HEARING
  // ═══════════════════════════════════════════
  function hearingSection(compact) {
    var hearingScore = S.getScore('hearing');
    var content = '';

    if (hearingScore) {
      content += '<p><strong>Hearing difficulties reported in:</strong> ' + hearingScore.affectedCount + ' of 17 situations</p>';
      if (hearingScore.affectedCount > 0) {
        content += '<p>You reported hearing difficulties in several situations. ';
        var top1 = S.get('instruments.hearing.top1');
        var top2 = S.get('instruments.hearing.top2');
        var top3 = S.get('instruments.hearing.top3');
        var tops = [top1, top2, top3].filter(function (t) { return t && t.trim(); });
        if (tops.length > 0) {
          content += 'Your top priorities were: ' + tops.join('; ') + '.</p>';
        } else {
          content += '</p>';
        }
      } else {
        content += '<p>You did not report significant hearing difficulties.</p>';
      }
    } else {
      content += '<p class="text-muted">Hearing section not yet completed.</p>';
    }

    return section('Hearing', content, compact);
  }

  // ═══════════════════════════════════════════
  //  INFORMANT (MBI-C + NPI-Q) — with radar charts
  // ═══════════════════════════════════════════
  function informantSection(compact) {
    var mbic = S.getScore('mbiC');
    var npiq = S.getScore('npiQ');
    var content = '';

    // ── MBI-C ──
    if (mbic && mbic.total !== null) {
      content += '<p><strong>Mild Behavioural Impairment (MBI-C) Total:</strong> ' + mbic.total + '</p>';
      if (mbic.total === 0) {
        content += '<p>No behavioural changes were reported by the informant.</p>';
      } else {
        content += '<p>Some behavioural changes were noted by the informant. The total MBI-C score was ' + mbic.total + '.</p>';
      }
      // Radar chart — 5 domains (windrose)
      if (!compact) content += '<div class="chart-container" id="chart-mbic"></div>';
    } else {
      content += '<p class="text-muted">MBI-C not yet completed.</p>';
    }

    // ── NPI-Q ──
    if (npiq) {
      content += '<p><strong>NPI-Q:</strong> ' + npiq.count + ' symptom(s) reported, severity total ' +
        npiq.severityTotal + ', distress total ' + npiq.distressTotal + '</p>';
      if (npiq.count > 0) {
        var symptoms = BHM.Instruments.NPIQ.getSymptoms();
        var present = [];
        for (var i = 0; i < symptoms.length; i++) {
          if (S.get('instruments.npiQ.' + symptoms[i].key + '_present') === 'yes') {
            present.push(symptoms[i].label);
          }
        }
        if (present.length > 0) {
          content += '<p>Symptoms reported: ' + present.join(', ') + '.</p>';
        }
      } else {
        content += '<p>No neuropsychiatric symptoms were reported by the informant.</p>';
      }
      // Radar chart — severity vs distress across 12 symptoms (windrose)
      if (!compact && npiq.count > 0) content += '<div class="chart-container" id="chart-npiq"></div>';
    } else {
      content += '<p class="text-muted">NPI-Q not yet completed.</p>';
    }

    return section('Changes Noticed by Family or Friends', content, compact);
  }

  // ═══════════════════════════════════════════
  //  CLINICAL INTERVIEW
  // ═══════════════════════════════════════════
  function clinicalSection(compact) {
    var clin = S.getSession().instruments.clinical || {};
    if (!clin.interviewDate && !clin.keyPositives && !clin.safetyConcerns) {
      return section('Clinician Interview Summary',
        '<p class="text-muted">Clinical interview not yet completed.</p>', compact);
    }
    var content = '';
    if (clin.keyPositives) content += '<p><strong>Key findings:</strong> ' + esc(clin.keyPositives) + '</p>';
    if (clin.safetyConcerns) content += '<p><strong>Safety concerns:</strong> ' + esc(clin.safetyConcerns) + '</p>';
    return section('Clinician Interview Summary', content, compact);
  }

  // ═══════════════════════════════════════════
  //  STAGING (CDR) — with radar chart
  // ═══════════════════════════════════════════
  function stagingSection(compact) {
    var cdr = S.getScore('cdr');
    var content = '';

    if (cdr && cdr.total !== null) {
      content += '<p><strong>Clinical Dementia Rating (CDR) Total:</strong> ' +
        scoreBadge(cdr.total, 3, { moderate: 0.5, poor: 1 }) + '</p>';
      content += '<p><strong>CDR Sum of Boxes (CDR-SB):</strong> ' +
        scoreBadge(cdr.sumOfBoxes, 18, { moderate: 2.5, poor: 4 }) + '</p>';

      if (cdr.total === 0) {
        content += '<p>The CDR rating indicates no dementia. No significant cognitive decline from the person\'s previous usual level was identified across the domains assessed.</p>';
      } else if (cdr.total === 0.5) {
        content += '<p>The CDR rating of 0.5 indicates questionable or very mild impairment. There may be some subtle changes in one or more areas that are worth monitoring.</p>';
      } else if (cdr.total === 1) {
        content += '<p>The CDR rating of 1 indicates mild dementia. Difficulties were noted across several domains that are likely affecting daily activities to some degree.</p>';
      } else if (cdr.total === 2) {
        content += '<p>The CDR rating of 2 indicates moderate dementia. Significant difficulties were noted across several areas, with a clear impact on daily functioning and independence.</p>';
      } else if (cdr.total === 3) {
        content += '<p>The CDR rating of 3 indicates severe dementia. Major difficulties were noted across all areas, with substantial loss of independent function.</p>';
      }

      if (cdr.severity) {
        content += '<p>Based on the Sum of Boxes score (' + cdr.sumOfBoxes + '), this is classified as <strong>' + cdr.severity + '</strong> (Bryant et al 2012).</p>';
      }

      // Domain breakdown table
      if (cdr.domainScores) {
        content += '<p>Domain ratings: ';
        var parts = [];
        var labels = { memory: 'Memory', orientation: 'Orientation', judgment: 'Judgment', community: 'Community Affairs', homeHobbies: 'Home & Hobbies', personalCare: 'Personal Care' };
        for (var key in cdr.domainScores) {
          if (cdr.domainScores.hasOwnProperty(key)) parts.push(labels[key] + ': ' + cdr.domainScores[key]);
        }
        content += parts.join(', ') + '</p>';
      }

      // CDR radar chart — 6 domains
      if (!compact) content += '<div class="chart-container" id="chart-cdr"></div>';
    } else {
      content += '<p class="text-muted">CDR assessment not yet completed.</p>';
    }

    return section('Staging', content, compact);
  }

  // ═══════════════════════════════════════════
  //  RBANS — Full report with table + narratives + chart
  // ═══════════════════════════════════════════
  function rbansSection(compact) {
    var rb = S.getScore('rbans');
    var content = '';

    if (!rb || !rb.indices) {
      return section('Neuropsychological Assessment',
        '<p class="text-muted">RBANS not yet completed.</p>', compact);
    }

    var idx = rb.indices;
    var cent = rb.centiles;
    var raw = S.getSession().instruments.rbans || {};

    // ── TOPF ──
    if (rb.fsiq) {
      content += '<p><strong>Premorbid Functioning (TOPF):</strong> Estimated pre-morbid IQ approximately <strong>' + rb.fsiq + '</strong>.</p>';
    }

    // ── Overall summary ──
    content += '<p><strong>Total Scale Score:</strong> ' +
      scoreBadge(idx.totalScale, null, { moderate: 84, poor: 69 }) +
      ' (' + cent.totalScale + 'th percentile)</p>';

    if (idx.totalScale >= 90) {
      content += '<p>Your overall cognitive performance on the RBANS fell within the average range or better.</p>';
    } else if (idx.totalScale >= 80) {
      content += '<p>Your overall cognitive performance was in the low average range, which may reflect subtle difficulties across domains.</p>';
    } else if (idx.totalScale >= 70) {
      content += '<p>Your overall cognitive performance was in the borderline range, suggesting difficulties across multiple domains.</p>';
    } else {
      content += '<p>Your overall cognitive performance was well below the expected range, indicating significant difficulties.</p>';
    }

    // ── Domain Index Scores table ──
    content += '<table style="width:100%;border-collapse:collapse;margin:0.75rem 0">';
    content += '<thead><tr>' + rptTh('Domain') + rptTh('Index', 'center') + rptTh('Centile', 'center') +
      rptTh('Classification', 'center') + '</tr></thead><tbody>';

    var domainList = [
      { label: 'Immediate Memory', i: idx.immediateMemory, c: cent.immediateMemory },
      { label: 'Visuospatial/Constructional', i: idx.visuospatial, c: cent.visuospatial },
      { label: 'Language', i: idx.language, c: cent.language },
      { label: 'Attention', i: idx.attention, c: cent.attention },
      { label: 'Delayed Memory', i: idx.delayedMemory, c: cent.delayedMemory }
    ];

    for (var d = 0; d < domainList.length; d++) {
      var dm = domainList[d];
      var cls = classifyIndex(dm.i);
      content += '<tr>' + rptTd(dm.label, null, true) + rptTd(dm.i, 'center') +
        rptTd(dm.c + '%', 'center') + rptTd(cls, 'center') + '</tr>';
    }

    // Total row (highlighted)
    var totalCls = classifyIndex(idx.totalScale);
    content += '<tr style="background:#e8edf3;font-weight:600">' +
      rptTd('Total Scale', null, true) + rptTd(idx.totalScale, 'center') +
      rptTd(cent.totalScale + '%', 'center') + rptTd(totalCls, 'center') + '</tr>';

    content += '</tbody></table>';

    // ── RBANS Profile Chart ──
    if (!compact) content += '<div class="chart-container" id="chart-rbans"></div>';

    // ── Domain-by-domain narratives ──
    content += '<div style="margin-top:1rem">';

    content += '<h5 style="color:#0d6efd;border-bottom:2px solid #0d6efd;padding-bottom:3px;font-size:0.95rem">Immediate Memory</h5>';
    content += '<p>You scored ' + (raw.listlearning || '--') + '/40 on the word list learning task which is a sensitive indicator of your ability to remember new words. ';
    content += 'You scored ' + (raw.storylearning || '--') + '/24 on the short story learning task which is similar. ';
    content += 'This gives an Immediate Memory Index Score of <strong>' + idx.immediateMemory + '</strong>. ';
    content += 'This means that ' + cent.immediateMemory + '% of healthy people in your age group score worse than you on this subtest.</p>';

    content += '<h5 style="color:#0d6efd;border-bottom:2px solid #0d6efd;padding-bottom:3px;font-size:0.95rem">Visuospatial Function</h5>';
    content += '<p>You scored ' + (raw.lineorientation || '--') + '/20 on the line orientation task which tests visual perceptual ability. ';
    content += 'You scored ' + (raw.figurecopy || '--') + '/20 on the figure copy task which tests visual working memory and motor skill. ';
    content += 'This gives a Visuospatial/Constructional Index Score of <strong>' + idx.visuospatial + '</strong>. ';
    content += 'This means that ' + cent.visuospatial + '% of healthy people in your age group score worse than you on this subtest.</p>';

    content += '<h5 style="color:#0d6efd;border-bottom:2px solid #0d6efd;padding-bottom:3px;font-size:0.95rem">Language Function</h5>';
    content += '<p>You scored ' + (raw.naming || '--') + '/10 on the naming task which is a specific measure of your ability to recall words. ';
    content += 'You scored ' + (raw.semanticfluency || '--') + '/40 on the semantic fluency task which makes demands on your attention and executive function as well as memory. ';
    content += 'This gives a Language Index Score of <strong>' + idx.language + '</strong>. ';
    content += 'This means that ' + cent.language + '% of healthy people in your age group score worse than you on this subtest.</p>';

    content += '<h5 style="color:#0d6efd;border-bottom:2px solid #0d6efd;padding-bottom:3px;font-size:0.95rem">Attention &amp; Concentration</h5>';
    content += '<p>You scored ' + (raw.digitspan || '--') + '/16 on the digit span task which tests attention and working memory. ';
    content += 'You scored ' + (raw.coding || '--') + '/89 on the digit-symbol coding task which tests attention and processing speed. ';
    content += 'This gives an Attention Index Score of <strong>' + idx.attention + '</strong>. ';
    content += 'This means that ' + cent.attention + '% of healthy people in your age group score worse than you on this subtest.</p>';

    content += '<h5 style="color:#0d6efd;border-bottom:2px solid #0d6efd;padding-bottom:3px;font-size:0.95rem">Delayed Memory</h5>';
    content += '<p>You scored ' + (raw.listrecall || '--') + '/10 on the free recall of ten words, a sensitive indicator of verbal learning and recall. ';
    content += 'You scored ' + (raw.listrecog || '--') + '/20 on the cued recall task which taxes delayed memory. ';
    content += 'Recalling the complex figure is difficult, and you scored ' + (raw.figurerecall || '--') + '/20. ';
    content += 'You remembered ' + (raw.storyrecall || '--') + ' items out of a possible 12 from the short story. ';
    content += 'This gives a Delayed Memory Index Score of <strong>' + idx.delayedMemory + '</strong>. ';
    content += 'This means that ' + cent.delayedMemory + '% of healthy people in your age group score worse than you on this subtest.</p>';

    content += '<h5 style="color:#0d6efd;border-bottom:2px solid #0d6efd;padding-bottom:3px;font-size:0.95rem">Overall Scores</h5>';
    content += '<p>The Total Scale Score is <strong>' + idx.totalScale + '</strong>. ';
    content += 'This means that ' + cent.totalScale + '% of healthy people in your age group score worse than you overall.</p>';

    content += '</div>';

    // ── Supplementary indices (compact text) ──
    content += '<div style="margin-top:0.75rem;padding:8px 12px;background:#f8f9fa;border-radius:6px;font-size:0.84rem">';
    content += '<strong>Supplementary Indices:</strong> ';
    content += 'Effort — Silverberg = ' + rb.silverbergEI + ', Novitski = ' + rb.novitskiES + '. ';
    content += 'Cortical–Subcortical Index = ' + rb.corticalSubcortical.toFixed(1) +
      (rb.corticalSubcortical > 0 ? ' (cortical pattern)' : ' (subcortical pattern)') + '.';

    // Duff norms summary
    if (rb.duff) {
      content += '<br><strong>Duff demographically-corrected centiles:</strong> ';
      content += 'Imm Memory ' + rb.duff.immCentile + '%, ';
      content += 'Visuospatial ' + rb.duff.visuoCentile + '%, ';
      content += 'Language ' + rb.duff.langCentile + '%, ';
      content += 'Attention ' + rb.duff.attCentile + '%, ';
      content += 'Delayed Memory ' + rb.duff.memCentile + '%, ';
      content += 'Total ' + rb.duff.totalCentile + '%.';
    }
    content += '</div>';

    return section('Neuropsychological Assessment (RBANS)', content, compact);
  }

  // RBANS classification helper
  function classifyIndex(idx) {
    if (idx >= 130) return 'Very Superior';
    if (idx >= 120) return 'Superior';
    if (idx >= 110) return 'High Average';
    if (idx >= 90) return 'Average';
    if (idx >= 80) return 'Low Average';
    if (idx >= 70) return 'Borderline';
    return 'Extremely Low';
  }

  // ═══════════════════════════════════════════
  //  LEWY BODY FEATURES (DIAMOND Lewy)
  // ═══════════════════════════════════════════
  function lewySection(compact) {
    var dl = S.getScore('diamondLewy');
    var content = '';

    if (!dl || dl.diagnosis === 'incomplete') {
      return section('Lewy Body Features',
        '<p class="text-muted">DIAMOND Lewy assessment not yet completed.</p>', compact);
    }

    switch (dl.diagnosis) {
      case 'probable':
        content += '<p><strong>Diagnostic classification:</strong> <span class="score-badge score-poor">Probable Dementia with Lewy Bodies (DLB)</span></p>';
        break;
      case 'possible':
        content += '<p><strong>Diagnostic classification:</strong> <span class="score-badge score-moderate">Possible Dementia with Lewy Bodies (DLB)</span></p>';
        break;
      case 'not_met':
        content += '<p><strong>Diagnostic classification:</strong> DLB criteria not met.</p>';
        break;
      case 'no_dementia':
        content += '<p><strong>Diagnostic classification:</strong> Essential criterion (progressive cognitive decline) not established.</p>';
        break;
    }

    content += '<p><strong>Core features present (' + dl.coreCount + '/4):</strong> ';
    content += (dl.corePresent && dl.corePresent.length > 0) ? dl.corePresent.join(', ') : 'None identified';
    content += '</p>';

    content += '<p><strong>Indicative biomarkers:</strong> ' + dl.biomarkerCount + ' present</p>';

    if (dl.supportiveCount > 0) {
      content += '<p><strong>Supportive features (' + dl.supportiveCount + '):</strong> ';
      if (dl.supportivePresent && dl.supportivePresent.length > 0) content += dl.supportivePresent.join(', ');
      content += '</p>';
    }

    if (dl.diagnosis === 'probable') {
      content += '<p>The assessment findings meet criteria for <em>probable</em> Dementia with Lewy Bodies based on the 4th DLB Consensus Criteria (McKeith et al., 2017). ' +
        'This means the pattern of symptoms is consistent with this form of dementia. Your clinician will discuss what this means for your care.</p>';
    } else if (dl.diagnosis === 'possible') {
      content += '<p>The assessment findings meet criteria for <em>possible</em> Dementia with Lewy Bodies. ' +
        'This means some features suggestive of this diagnosis were identified, but the full diagnostic criteria were not met. Further investigation may be helpful.</p>';
    } else if (dl.diagnosis === 'not_met') {
      content += '<p>While dementia was identified, the specific features needed for a diagnosis of Dementia with Lewy Bodies were not found during this assessment.</p>';
    }

    return section('Lewy Body Features', content, compact);
  }

  // ─── Clinician insert box ───
  function createClinicianInsert(title, statePath) {
    var div = document.createElement('div');
    div.className = 'clinician-insert';
    div.innerHTML = '<strong>' + title + '</strong> <small class="text-muted">(clinician editable)</small>';
    var ta = document.createElement('textarea');
    ta.placeholder = 'Type here... This text will not be overwritten by report regeneration.';
    var current = S.get(statePath);
    if (current) ta.value = current;
    ta.addEventListener('input', function () { S.set(statePath, this.value); });
    div.appendChild(ta);
    return div;
  }

  function esc(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return {
    update: update,
    TEMPLATE_VERSION: TEMPLATE_VERSION
  };
})();
