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

    // ── Render all instrument forms ──
    renderAll();

    // ── Bind UI controls ──
    bindReportPanel();
    bindExportButtons();
    bindTabEvents();

    // ── Subscribe to state changes for live report updates ──
    BHM.State.subscribe(function () {
      BHM.Report.update();
    });

    // ── Initial report generation ──
    BHM.Report.update();

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

    // Audit log
    BHM.Export.renderAuditTab(document.getElementById('auditContent'));
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

  // ── Export buttons ──
  function bindExportButtons() {
    var jsonBtn = document.getElementById('exportJSON');
    var csvBtn = document.getElementById('exportCSV');
    var auditBtn = document.getElementById('exportAudit');
    var printBtn = document.getElementById('printReport');

    if (jsonBtn) jsonBtn.addEventListener('click', function (e) { e.preventDefault(); BHM.Export.exportJSON(); });
    if (csvBtn) csvBtn.addEventListener('click', function (e) { e.preventDefault(); BHM.Export.exportCSV(); });
    if (auditBtn) auditBtn.addEventListener('click', function (e) { e.preventDefault(); BHM.Export.exportAudit(); });
    if (printBtn) printBtn.addEventListener('click', function (e) { e.preventDefault(); BHM.Export.printReport(); });
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

    // Re-render report when switching to report tab
    var reportTab = document.getElementById('tab-report');
    if (reportTab) {
      reportTab.addEventListener('shown.bs.tab', function () {
        BHM.Report.update();
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
