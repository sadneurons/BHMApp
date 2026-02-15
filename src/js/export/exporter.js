/* ═══════════════════════════════════════════════════════
   BHM.Export — JSON, CSV, Audit Log, Print
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};

BHM.Export = (function () {
  'use strict';

  var S = BHM.State;

  function downloadFile(content, filename, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function getTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  }

  function getPatientSlug() {
    var name = S.get('patient.name') || 'unknown';
    return name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  }

  // ── Export raw session as JSON (includes ALL stored data) ──
  function exportJSON() {
    var session = S.getSession();

    // Build a complete export bundle that includes data stored outside the session
    var bundle = {
      _exportVersion: 2,
      _exportedAt: new Date().toISOString(),
      session: session,
      // User-customised snippets (from in-memory decrypted store)
      snippetCustomisations: (BHM.Snippets && BHM.Snippets.getAll) ? BHM.Snippets.getAll() : null,
      // Theme preference
      themePreference: localStorage.getItem('bhm-theme') || 'default'
    };

    var json = JSON.stringify(bundle, null, 2);
    var filename = 'BHM_' + getPatientSlug() + '_' + getTimestamp() + '.json';
    downloadFile(json, filename, 'application/json');
  }

  // ── Export scores summary as CSV ──
  function exportCSV() {
    var scores = S.getSession().scores || {};
    var rows = [['Instrument', 'Metric', 'Value']];

    // PSQI
    if (scores.psqi) {
      rows.push(['PSQI', 'Global Total', scores.psqi.globalTotal]);
      var comps = scores.psqi.components || {};
      for (var ck in comps) {
        if (comps.hasOwnProperty(ck)) {
          rows.push(['PSQI', 'Component: ' + ck, comps[ck]]);
        }
      }
    }

    // Simple totals
    var simpleScores = [
      { key: 'epworth', name: 'Epworth', metric: 'Total' },
      { key: 'gad7', name: 'GAD-7', metric: 'Total' },
      { key: 'depression', name: 'Depression (GDS-15)', metric: 'Total' },
      { key: 'diet', name: 'Mediterranean Diet', metric: 'Total' },
      { key: 'auditTool', name: 'AUDIT', metric: 'Total' },
      { key: 'casp19', name: 'CASP-19', metric: 'Total' }
    ];
    for (var i = 0; i < simpleScores.length; i++) {
      var s = simpleScores[i];
      if (scores[s.key] && scores[s.key].total !== undefined) {
        rows.push([s.name, s.metric, scores[s.key].total]);
      }
    }

    // GAD-7 impairment
    if (scores.gad7 && scores.gad7.impairment) {
      rows.push(['GAD-7', 'Impairment', scores.gad7.impairment]);
    }

    // CASP-19 domains
    if (scores.casp19 && scores.casp19.domainTotals) {
      for (var d in scores.casp19.domainTotals) {
        if (scores.casp19.domainTotals.hasOwnProperty(d)) {
          rows.push(['CASP-19', 'Domain: ' + d, scores.casp19.domainTotals[d]]);
        }
      }
    }

    // Hearing
    if (scores.hearing) {
      rows.push(['Hearing', 'Affected Situations', scores.hearing.affectedCount]);
    }

    // MBI-C
    if (scores.mbiC && scores.mbiC.total !== undefined) {
      rows.push(['MBI-C', 'Total', scores.mbiC.total]);
    }

    // NPI-Q
    if (scores.npiQ) {
      rows.push(['NPI-Q', 'Symptom Count', scores.npiQ.count]);
      rows.push(['NPI-Q', 'Severity Total', scores.npiQ.severityTotal]);
      rows.push(['NPI-Q', 'Distress Total', scores.npiQ.distressTotal]);
    }

    // CDR
    if (scores.cdr) {
      if (scores.cdr.totalCDR !== undefined) rows.push(['CDR', 'Total CDR', scores.cdr.totalCDR]);
      if (scores.cdr.sumOfBoxes !== undefined) rows.push(['CDR', 'Sum of Boxes', scores.cdr.sumOfBoxes]);
    }

    // DIAMOND Lewy
    if (scores.diamondLewy) {
      if (scores.diamondLewy.diagnosis) rows.push(['DIAMOND Lewy', 'Classification', scores.diamondLewy.diagnosis]);
      if (scores.diamondLewy.coreCount !== undefined) rows.push(['DIAMOND Lewy', 'Core Features', scores.diamondLewy.coreCount]);
    }

    // RBANS
    if (scores.rbans) {
      var rbIdx = scores.rbans.indices || {};
      var rbFields = ['immediateMemory', 'visuospatial', 'language', 'attention', 'delayedMemory', 'totalScale'];
      for (var ri = 0; ri < rbFields.length; ri++) {
        if (rbIdx[rbFields[ri]] !== undefined) rows.push(['RBANS', 'Index: ' + rbFields[ri], rbIdx[rbFields[ri]]]);
      }
      var rbCent = scores.rbans.centiles || {};
      for (var rc = 0; rc < rbFields.length; rc++) {
        if (rbCent[rbFields[rc]] !== undefined) rows.push(['RBANS', 'Centile: ' + rbFields[rc], rbCent[rbFields[rc]]]);
      }
    }

    // Diagnoses
    var diagList = S.get('diagnoses') || [];
    for (var di = 0; di < diagList.length; di++) {
      var dg = diagList[di];
      var dgLabel = dg.diagnosisId || 'Unknown';
      rows.push(['Diagnosis ' + (di + 1), 'ID', dgLabel]);
      if (dg.qualifier) rows.push(['Diagnosis ' + (di + 1), 'Qualifier', dg.qualifier]);
      if (dg.primary) rows.push(['Diagnosis ' + (di + 1), 'Primary', 'Yes']);
    }

    // Medications count
    var medsList = S.get('medications.list') || [];
    rows.push(['Medications', 'Count', medsList.length]);
    for (var mi = 0; mi < medsList.length; mi++) {
      var med = medsList[mi];
      if (med.name) rows.push(['Medication ' + (mi + 1), 'Name', med.name]);
      if (med.dose) rows.push(['Medication ' + (mi + 1), 'Dose', med.dose]);
      if (med.frequency) rows.push(['Medication ' + (mi + 1), 'Frequency', med.frequency]);
      if (med.category) rows.push(['Medication ' + (mi + 1), 'Category', med.category]);
    }

    // Neuroimaging
    var scans = S.get('neuroimaging.scans') || [];
    for (var ni = 0; ni < scans.length; ni++) {
      var sc = scans[ni];
      var prefix = 'Scan ' + (ni + 1);
      rows.push([prefix, 'Modality', sc.modality || '']);
      rows.push([prefix, 'Date', sc.scanDate || '']);
      if (sc.fazekasPV !== null && sc.fazekasPV !== undefined) rows.push([prefix, 'Fazekas PV', sc.fazekasPV]);
      if (sc.fazekasDWM !== null && sc.fazekasDWM !== undefined) rows.push([prefix, 'Fazekas DWM', sc.fazekasDWM]);
      if (sc.gca !== null && sc.gca !== undefined) rows.push([prefix, 'GCA', sc.gca]);
      if (sc.koedam !== null && sc.koedam !== undefined) rows.push([prefix, 'Koedam', sc.koedam]);
      if (sc.mtaLeft !== null && sc.mtaLeft !== undefined) rows.push([prefix, 'MTA Left', sc.mtaLeft]);
      if (sc.mtaRight !== null && sc.mtaRight !== undefined) rows.push([prefix, 'MTA Right', sc.mtaRight]);
    }

    // Medical history — CV risk factor count
    var cvRisk = S.get('medicalHistory.cvRisk') || {};
    var cvCount = Object.keys(cvRisk).length;
    if (cvCount > 0) rows.push(['Medical History', 'CV Risk Factors', cvCount]);

    // Physical examination
    var pe = S.getSession().physicalExam || {};
    if (pe.heightCm) rows.push(['Physical Exam', 'Height (cm)', pe.heightCm]);
    if (pe.weightKg) rows.push(['Physical Exam', 'Weight (kg)', pe.weightKg]);
    if (pe.bmi) rows.push(['Physical Exam', 'BMI', pe.bmi]);
    if (pe.neckCircCm) rows.push(['Physical Exam', 'Neck Circumference (cm)', pe.neckCircCm]);
    if (pe.bpSystolic) rows.push(['Physical Exam', 'BP Systolic', pe.bpSystolic]);
    if (pe.bpDiastolic) rows.push(['Physical Exam', 'BP Diastolic', pe.bpDiastolic]);
    if (pe.heartRate) rows.push(['Physical Exam', 'Heart Rate', pe.heartRate]);
    if (pe.o2Sat) rows.push(['Physical Exam', 'O2 Sat (%)', pe.o2Sat]);
    if (pe.gait) rows.push(['Physical Exam', 'Gait', pe.gait]);
    if (pe.tremor) rows.push(['Physical Exam', 'Tremor', pe.tremor]);
    if (pe.rigidity) rows.push(['Physical Exam', 'Rigidity', pe.rigidity]);

    // STOP-BANG
    var sbScore = scores.stopBang;
    if (sbScore) {
      rows.push(['STOP-BANG', 'Total', sbScore.total]);
      rows.push(['STOP-BANG', 'Interpretation', sbScore.interp]);
      rows.push(['STOP-BANG', 'Unknown Items', sbScore.unknownCount]);
    }

    // QRISK3
    var qrScore = scores.qrisk3;
    if (qrScore && qrScore.score !== undefined) {
      rows.push(['QRISK3', '10-Year CVD Risk (%)', qrScore.score.toFixed(1)]);
      var riskCat = qrScore.score >= 20 ? 'High' : qrScore.score >= 10 ? 'Moderate' : 'Low';
      rows.push(['QRISK3', 'Risk Category', riskCat]);
    }

    var csv = rows.map(function (row) {
      return row.map(function (cell) {
        return '"' + String(cell === null || cell === undefined ? '' : cell).replace(/"/g, '""') + '"';
      }).join(',');
    }).join('\n');

    var filename = 'BHM_Scores_' + getPatientSlug() + '_' + getTimestamp() + '.csv';
    downloadFile(csv, filename, 'text/csv');
  }

  // ── Export audit log ──
  function exportAudit() {
    var log = S.getSession().auditLog || [];
    var rows = [['Timestamp', 'Field', 'Old Value', 'New Value', 'Operator', 'Source Mode']];
    for (var i = 0; i < log.length; i++) {
      var entry = log[i];
      rows.push([
        entry.timestamp,
        entry.field,
        JSON.stringify(entry.oldValue),
        JSON.stringify(entry.newValue),
        entry.operator,
        entry.sourceMode
      ]);
    }

    var csv = rows.map(function (row) {
      return row.map(function (cell) {
        return '"' + String(cell === null || cell === undefined ? '' : cell).replace(/"/g, '""') + '"';
      }).join(',');
    }).join('\n');

    var filename = 'BHM_Audit_' + getPatientSlug() + '_' + getTimestamp() + '.csv';
    downloadFile(csv, filename, 'text/csv');
  }

  // ── Print report ──
  function printReport() {
    // Switch to report tab first
    var reportTab = document.getElementById('tab-report');
    if (reportTab) {
      var bsTab = new bootstrap.Tab(reportTab);
      bsTab.show();
    }
    setTimeout(function () {
      window.print();
    }, 300);
  }

  // ── Render audit log table ──
  function renderAuditTab(container) {
    container.innerHTML = '';

    var card = document.createElement('div');
    card.className = 'instrument-card';
    card.innerHTML =
      '<h5><i class="bi bi-clock-history me-1"></i>Audit Log</h5>' +
      '<p class="instrument-subtitle">Complete history of all data changes in this session.</p>';

    var log = S.getSession().auditLog || [];

    if (log.length === 0) {
      card.innerHTML += '<p class="text-muted">No changes recorded yet.</p>';
      container.appendChild(card);
      return;
    }

    var toolbar = document.createElement('div');
    toolbar.className = 'd-flex justify-content-between align-items-center mb-3';
    toolbar.innerHTML =
      '<span class="badge bg-secondary">' + log.length + ' entries</span>' +
      '<button class="btn btn-sm btn-outline-primary" id="exportAuditBtn"><i class="bi bi-download me-1"></i>Export Audit Log</button>';
    card.appendChild(toolbar);

    var tableWrap = document.createElement('div');
    tableWrap.className = 'table-responsive';
    tableWrap.style.maxHeight = '500px';
    tableWrap.style.overflowY = 'auto';

    var table = document.createElement('table');
    table.className = 'table table-sm table-striped audit-table';
    table.innerHTML =
      '<thead><tr><th>Time</th><th>Field</th><th>Old</th><th>New</th><th>Operator</th><th>Mode</th></tr></thead>';

    var tbody = document.createElement('tbody');
    // Show most recent first
    for (var i = log.length - 1; i >= 0; i--) {
      var e = log[i];
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + new Date(e.timestamp).toLocaleString() + '</td>' +
        '<td><code>' + escHtml(e.field) + '</code></td>' +
        '<td>' + escHtml(formatVal(e.oldValue)) + '</td>' +
        '<td>' + escHtml(formatVal(e.newValue)) + '</td>' +
        '<td>' + escHtml(e.operator || '—') + '</td>' +
        '<td>' + escHtml(e.sourceMode || '—') + '</td>';
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    tableWrap.appendChild(table);
    card.appendChild(tableWrap);

    container.appendChild(card);

    // Bind export button
    var btn = document.getElementById('exportAuditBtn');
    if (btn) btn.addEventListener('click', exportAudit);
  }

  function formatVal(val) {
    if (val === null || val === undefined) return '—';
    return String(val);
  }

  function escHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ═══════════════════════════════════════════════════════
  //  IMPORT JSON SESSION
  // ═══════════════════════════════════════════════════════

  var MAX_IMPORT_SIZE = 5 * 1024 * 1024; // 5 MB
  var _pendingImport = null;

  function importJSON() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', function () {
      if (!input.files || !input.files[0]) { cleanup(); return; }
      var file = input.files[0];

      if (file.size > MAX_IMPORT_SIZE) {
        alert('File is too large (max 5 MB). This does not appear to be a BHM export.');
        cleanup();
        return;
      }

      var reader = new FileReader();
      reader.onload = function () {
        cleanup();
        try {
          var data = JSON.parse(reader.result);
          processImport(data, file.name);
        } catch (e) {
          alert('Invalid JSON file. Could not parse the selected file.');
        }
      };
      reader.onerror = function () {
        cleanup();
        alert('Could not read the selected file.');
      };
      reader.readAsText(file);
    });

    input.click();

    function cleanup() {
      if (input.parentNode) document.body.removeChild(input);
    }
  }

  function processImport(data, filename) {
    var session, snippets, theme;

    // Detect format: v2 bundle or legacy raw session
    if (data._exportVersion && data.session) {
      session = data.session;
      snippets = data.snippetCustomisations;
      theme = data.themePreference;
    } else if (data.patient && data.instruments) {
      session = data;
    } else {
      alert('This file does not appear to be a valid BHM session export.\n\nExpected a file exported via the "Export JSON" button.');
      return;
    }

    // Basic structure validation
    if (!session || typeof session !== 'object' || !session.patient || !session.instruments) {
      alert('The session data in this file is malformed or incomplete.');
      return;
    }

    // Store pending import and show confirmation modal
    _pendingImport = { session: session, snippets: snippets, theme: theme };
    showImportModal(session, data._exportedAt, filename);
  }

  function showImportModal(session, exportedAt, filename) {
    var modalEl = document.getElementById('importModal');
    var body = document.getElementById('importModalBody');
    if (!modalEl || !body) {
      if (confirm('Import session from "' + filename + '"?\n\nThis will replace ALL current data.')) {
        confirmImport();
      } else {
        _pendingImport = null;
      }
      return;
    }

    var patName = (session.patient && session.patient.name) || 'Unknown';
    var patDOB = (session.patient && session.patient.dob) || '';
    var patSex = (session.patient && session.patient.sex) || '';
    var docDate = (session.patient && session.patient.dateOfCompletion) || '';
    var exportDate = exportedAt ? new Date(exportedAt).toLocaleString() : 'Unknown';

    // Count instruments with data
    var instCount = 0;
    var inst = session.instruments || {};
    for (var k in inst) {
      if (inst.hasOwnProperty(k) && inst[k] && typeof inst[k] === 'object' && Object.keys(inst[k]).length > 0) {
        instCount++;
      }
    }

    var diagCount = (session.diagnoses && session.diagnoses.length) || 0;
    var medCount = (session.medications && session.medications.list && session.medications.list.length) || 0;
    var scanCount = (session.neuroimaging && session.neuroimaging.scans && session.neuroimaging.scans.length) || 0;

    body.innerHTML =
      '<div class="mb-3">' +
        '<div class="d-flex align-items-center gap-2 mb-2">' +
          '<i class="bi bi-file-earmark-code fs-3 text-primary"></i>' +
          '<div><strong>' + escHtml(filename) + '</strong><br>' +
            '<small class="text-muted">Exported ' + escHtml(exportDate) + '</small></div>' +
        '</div>' +
        '<table class="table table-sm mb-0">' +
          '<tr><td class="fw-semibold">Patient</td><td>' + escHtml(patName) +
            (patDOB ? ' <small class="text-muted">(DOB: ' + escHtml(patDOB) + ')</small>' : '') +
            (patSex ? ' <small class="text-muted">[' + escHtml(patSex) + ']</small>' : '') + '</td></tr>' +
          (docDate ? '<tr><td class="fw-semibold">Assessment date</td><td>' + escHtml(docDate) + '</td></tr>' : '') +
          '<tr><td class="fw-semibold">Instruments</td><td>' + instCount + ' with data</td></tr>' +
          (diagCount ? '<tr><td class="fw-semibold">Diagnoses</td><td>' + diagCount + '</td></tr>' : '') +
          (medCount ? '<tr><td class="fw-semibold">Medications</td><td>' + medCount + '</td></tr>' : '') +
          (scanCount ? '<tr><td class="fw-semibold">Scans</td><td>' + scanCount + '</td></tr>' : '') +
        '</table>' +
      '</div>' +
      '<div class="alert alert-warning mb-0 py-2">' +
        '<i class="bi bi-exclamation-triangle me-1"></i>' +
        '<strong>This will replace all current data.</strong> Make sure you have exported the current session first if needed.' +
      '</div>';

    var modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  function confirmImport() {
    if (!_pendingImport) return;
    var imp = _pendingImport;
    _pendingImport = null;

    // Close modal if open
    var modalEl = document.getElementById('importModal');
    if (modalEl) {
      var bsModal = bootstrap.Modal.getInstance(modalEl);
      if (bsModal) bsModal.hide();
    }

    // Restore session (async — handles encryption)
    S.restoreSession(imp.session).then(function () {
      // Restore snippet customisations if present and valid
      var snippetPromise = Promise.resolve();
      if (imp.snippets && Array.isArray(imp.snippets)) {
        snippetPromise = restoreSnippets(imp.snippets);
      }
      return snippetPromise;
    }).then(function () {
      // Restore theme preference if present
      if (imp.theme && typeof imp.theme === 'string') {
        localStorage.setItem('bhm-theme', imp.theme);
      }
      // Reload to re-initialise everything cleanly
      location.reload();
    }).catch(function (err) {
      console.error('BHM: Import failed', err);
      alert('Import failed: ' + err.message);
    });
  }

  function restoreSnippets(snippets) {
    var json = JSON.stringify(snippets);
    if (BHM.Crypto && BHM.Crypto.isUnlocked()) {
      return BHM.Crypto.encrypt(json).then(function (enc) {
        try { localStorage.setItem('bhm_snippets_v1', enc); } catch (e) { /* ignore */ }
      });
    }
    try { localStorage.setItem('bhm_snippets_v1', json); } catch (e) { /* ignore */ }
    return Promise.resolve();
  }

  return {
    exportJSON: exportJSON,
    exportCSV: exportCSV,
    exportAudit: exportAudit,
    importJSON: importJSON,
    confirmImport: confirmImport,
    printReport: printReport,
    renderAuditTab: renderAuditTab
  };
})();
