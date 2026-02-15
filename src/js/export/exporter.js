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
      // User-customised snippets (stored separately in localStorage)
      snippetCustomisations: (function () {
        try { var raw = localStorage.getItem('bhm_snippets_v1'); return raw ? JSON.parse(raw) : null; }
        catch (e) { return null; }
      })(),
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

  return {
    exportJSON: exportJSON,
    exportCSV: exportCSV,
    exportAudit: exportAudit,
    printReport: printReport,
    renderAuditTab: renderAuditTab
  };
})();
