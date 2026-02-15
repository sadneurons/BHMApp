/* ═══════════════════════════════════════════════════════
   BHM.App — Main application controller
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};

BHM.App = (function () {
  'use strict';

  function init() {
    console.log('BHM Assessment App v' + BHM.State.VERSION + ' initialising...');

    // ── Load saved session ──
    var loaded = BHM.State.load();
    if (loaded) {
      console.log('BHM: Restored session from localStorage');
    }

    // ── Initialise theme picker ──
    if (BHM.Themes && BHM.Themes.init) BHM.Themes.init();

    // ── Initialise snippet library ──
    if (BHM.Snippets && BHM.Snippets.init) BHM.Snippets.init();

    // ── Render all instrument forms ──
    renderAll();

    // ── Bind UI controls ──
    bindResetSession();
    bindReportPanel();
    bindSnippetPanel();
    bindExportButtons();
    bindTabEvents();

    // ── Subscribe to state changes for live report updates ──
    // Skip full report rebuild when the change is just a clinician‐notes
    // textarea (those don't affect computed content, and rebuilding would
    // destroy the textarea the user is actively typing in).
    BHM.State.subscribe(function (changedPath) {
      if (changedPath && changedPath.indexOf('clinicianInserts.') === 0) return;
      if (changedPath && changedPath.indexOf('snippetInserts.') === 0) return;
      BHM.Report.update();
    });

    // ── Initial report generation ──
    BHM.Report.update();

    // ── Show disclaimer splash on every fresh page load ──
    showDisclaimer();

    console.log('BHM: App ready');
  }

  function renderAll() {
    // Session
    BHM.Instruments.Session.render(document.getElementById('sessionContent'));

    // Patient booklet instruments
    BHM.Instruments.PSQI.render(document.getElementById('psqiContent'));
    BHM.Instruments.Epworth.render(document.getElementById('epworthContent'));
    BHM.Instruments.GAD7.render(document.getElementById('gad7Content'));
    BHM.Instruments.Depression.render(document.getElementById('depressionContent'));
    BHM.Instruments.Diet.render(document.getElementById('dietContent'));
    BHM.Instruments.AuditTool.render(document.getElementById('auditToolContent'));
    BHM.Instruments.CASP19.render(document.getElementById('casp19Content'));
    BHM.Instruments.Hearing.render(document.getElementById('hearingContent'));

    // Informant booklet instruments
    BHM.Instruments.MBIC.render(document.getElementById('mbicContent'));
    BHM.Instruments.NPIQ.render(document.getElementById('npiqContent'));

    // RBANS
    BHM.Instruments.RBANS.render(document.getElementById('rbansContent'));

    // Clinical interview
    BHM.Instruments.ClinicalInterview.render(document.getElementById('clinicalContent'));

    // CDR
    BHM.Instruments.CDR.renderAssessment(document.getElementById('cdrAssessContent'));
    BHM.Instruments.CDR.renderScoring(document.getElementById('cdrScoringContent'));

    // DIAMOND Lewy
    BHM.Instruments.DiamondLewy.render(document.getElementById('diamondLewyContent'));

    // Neuroimaging
    BHM.Instruments.Neuroimaging.render(document.getElementById('neuroimagingContent'));

    // Medical History
    BHM.Instruments.MedicalHistory.render(document.getElementById('medicalHistoryContent'));

    // Medications
    BHM.Instruments.Medications.render(document.getElementById('medicationsContent'));

    // Physical Exam
    BHM.Instruments.PhysicalExam.render(document.getElementById('physicalExamContent'));

    // QRISK3
    BHM.Instruments.QRISK3.render(document.getElementById('qrisk3Content'));

    // Diagnosis
    BHM.Instruments.Diagnosis.render(document.getElementById('diagnosisContent'));

    // Audit log
    BHM.Export.renderAuditTab(document.getElementById('auditContent'));
  }

  // ── Disclaimer / splash screen ──
  function showDisclaimer() {
    var modalEl = document.getElementById('disclaimerModal');
    if (!modalEl) return;
    var modal = new bootstrap.Modal(modalEl);
    modal.show();

    var acceptBtn = document.getElementById('disclaimerAcceptBtn');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        modal.hide();
      });
    }
  }

  // ── Reset session (clear all data) ──
  function bindResetSession() {
    var btn = document.getElementById('resetSessionBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (!confirm('Start a new session?\n\nThis will clear ALL entered data, scores, clinical notes, and snippet customisations.\n\nMake sure you have exported anything you need first.')) return;
      // Double-confirm for safety
      if (!confirm('Are you absolutely sure? This cannot be undone.')) return;
      // Preserve theme preference across session reset
      var savedTheme = localStorage.getItem('bhm-theme');
      localStorage.clear();
      if (savedTheme) localStorage.setItem('bhm-theme', savedTheme);
      location.reload();
    });
  }

  // ── Report side panel toggle ──
  function bindReportPanel() {
    var panel = document.getElementById('reportSidePanel');
    var toggleBtn = document.getElementById('toggleReportPanelBtn');
    var closeBtn = document.getElementById('closeSidePanel');

    // Start collapsed
    panel.classList.add('collapsed');

    toggleBtn.addEventListener('click', function () {
      panel.classList.toggle('collapsed');
      if (!panel.classList.contains('collapsed')) {
        BHM.Report.update();
      }
    });

    closeBtn.addEventListener('click', function () {
      panel.classList.add('collapsed');
    });
  }

  // ── Snippet panel toggle ──
  function bindSnippetPanel() {
    var panel = document.getElementById('snippetPanel');
    var toggleBtn = document.getElementById('toggleSnippetPanel');
    if (!panel || !toggleBtn) return;

    // Render snippet panel content
    if (BHM.Snippets && BHM.Snippets.renderPanel) BHM.Snippets.renderPanel(panel);

    toggleBtn.addEventListener('click', function () {
      panel.classList.toggle('collapsed');
      // Adjust toggle icon
      var icon = toggleBtn.querySelector('i');
      if (panel.classList.contains('collapsed')) {
        icon.className = 'bi bi-bookmarks';
      } else {
        icon.className = 'bi bi-bookmarks-fill';
      }
    });
  }

  // ── Export buttons ──
  function bindExportButtons() {
    var jsonBtn = document.getElementById('exportJSON');
    var csvBtn = document.getElementById('exportCSV');
    var auditBtn = document.getElementById('exportAudit');
    var printBtn = document.getElementById('printReport');

    var docxBtn = document.getElementById('exportDocx');

    if (jsonBtn) jsonBtn.addEventListener('click', function (e) { e.preventDefault(); BHM.Export.exportJSON(); });
    if (csvBtn) csvBtn.addEventListener('click', function (e) { e.preventDefault(); BHM.Export.exportCSV(); });
    if (auditBtn) auditBtn.addEventListener('click', function (e) { e.preventDefault(); BHM.Export.exportAudit(); });
    if (printBtn) printBtn.addEventListener('click', function (e) { e.preventDefault(); BHM.Export.printReport(); });
    if (docxBtn) docxBtn.addEventListener('click', function (e) { e.preventDefault(); BHM.DocxExport.exportDocx(); });
  }

  // ── Tab events ──
  function bindTabEvents() {
    // Re-render audit log when switching to audit tab
    var auditTab = document.getElementById('tab-audit');
    if (auditTab) {
      auditTab.addEventListener('shown.bs.tab', function () {
        BHM.Export.renderAuditTab(document.getElementById('auditContent'));
      });
    }

    // Re-render report + snippet panel when switching to report tab
    var reportTab = document.getElementById('tab-report');
    if (reportTab) {
      reportTab.addEventListener('shown.bs.tab', function () {
        BHM.Report.update();
        var sp = document.getElementById('snippetPanel');
        if (sp && BHM.Snippets && BHM.Snippets.renderPanel) BHM.Snippets.renderPanel(sp);
      });
    }

    // Re-render CDR scoring when switching to CDR scoring sub-tab
    var cdrScoringPill = document.querySelector('[data-bs-target="#sub-cdr-scoring"]');
    if (cdrScoringPill) {
      cdrScoringPill.addEventListener('shown.bs.tab', function () {
        BHM.Instruments.CDR.renderScoring(document.getElementById('cdrScoringContent'));
      });
    }
  }

  // ── DOM ready ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    renderAll: renderAll
  };
})();
