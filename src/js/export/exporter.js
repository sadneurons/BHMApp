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

  // ── Export raw session as JSON ──
  function exportJSON() {
    var session = S.getSession();
    var json = JSON.stringify(session, null, 2);
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
