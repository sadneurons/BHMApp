/* ═══════════════════════════════════════════════════════
   BHM.Keyboard — Keyboard shortcuts for power users
   ═══════════════════════════════════════════════════════
   Shortcuts (when not typing in an input):
     1–8        Switch main tab
     ← →        Previous / next sub-tab within current main tab
     Shift+← →  Previous / next main tab
     R          Toggle report side panel
     B          Toggle snippet panel (bookmarks)
     ?          Show keyboard shortcut help
     Escape     Close any open modal or panel
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};

BHM.Keyboard = (function () {
  'use strict';

  // ── Main tab IDs in order ──
  var MAIN_TABS = [
    'tab-session',
    'tab-patient',
    'tab-informant',
    'tab-rbans',
    'tab-clinical',
    'tab-diagnosis',
    'tab-report',
    'tab-audit'
  ];

  function isInputFocused() {
    var el = document.activeElement;
    if (!el) return false;
    var tag = el.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
  }

  function getActiveMainTabIndex() {
    for (var i = 0; i < MAIN_TABS.length; i++) {
      var el = document.getElementById(MAIN_TABS[i]);
      if (el && el.classList.contains('active')) return i;
    }
    return 0;
  }

  function switchMainTab(index) {
    if (index < 0 || index >= MAIN_TABS.length) return;
    var el = document.getElementById(MAIN_TABS[index]);
    if (el) {
      var tab = new bootstrap.Tab(el);
      tab.show();
      el.focus();
    }
  }

  // ── Sub-tab navigation ──

  function getSubTabPills() {
    var activeIdx = getActiveMainTabIndex();
    var tabId = MAIN_TABS[activeIdx];
    var panelId = tabId.replace('tab-', 'panel-');
    var panel = document.getElementById(panelId);
    if (!panel) return [];

    var pillList = panel.querySelector('.nav-pills');
    if (!pillList) return [];

    var pills = pillList.querySelectorAll('.nav-link');
    return Array.prototype.slice.call(pills);
  }

  function getActiveSubTabIndex(pills) {
    for (var i = 0; i < pills.length; i++) {
      if (pills[i].classList.contains('active')) return i;
    }
    return 0;
  }

  function switchSubTab(direction) {
    var pills = getSubTabPills();
    if (pills.length <= 1) return false;

    var cur = getActiveSubTabIndex(pills);
    var next = cur + direction;
    if (next < 0) next = pills.length - 1;
    if (next >= pills.length) next = 0;

    var tab = new bootstrap.Tab(pills[next]);
    tab.show();
    pills[next].focus();
    return true;
  }

  // ── Help overlay ──

  function showHelp() {
    var modalEl = document.getElementById('keyboardHelpModal');
    if (!modalEl) return;
    var modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  function hideHelp() {
    var modalEl = document.getElementById('keyboardHelpModal');
    if (!modalEl) return;
    var inst = bootstrap.Modal.getInstance(modalEl);
    if (inst) inst.hide();
  }

  // ── Main handler ──

  function handleKeydown(e) {
    // Never intercept if a modal with input is active (PIN modal)
    var pinModal = document.getElementById('pinModal');
    if (pinModal && pinModal.classList.contains('show')) return;

    var key = e.key;
    var shift = e.shiftKey;
    var ctrl = e.ctrlKey || e.metaKey;
    var alt = e.altKey;

    // Escape: close panels / help
    if (key === 'Escape') {
      var reportPanel = document.getElementById('reportSidePanel');
      if (reportPanel && !reportPanel.classList.contains('collapsed')) {
        reportPanel.classList.add('collapsed');
        e.preventDefault();
        return;
      }
      var snippetPanel = document.getElementById('snippetPanel');
      if (snippetPanel && !snippetPanel.classList.contains('collapsed')) {
        snippetPanel.classList.add('collapsed');
        e.preventDefault();
        return;
      }
      return; // let Bootstrap handle modal Escape
    }

    // Don't intercept when typing in inputs (except for Shift+arrow)
    if (isInputFocused()) {
      // Allow Shift+Arrow for main tab switching even from inputs
      if (shift && !ctrl && !alt && (key === 'ArrowLeft' || key === 'ArrowRight')) {
        var dir = key === 'ArrowRight' ? 1 : -1;
        var curIdx = getActiveMainTabIndex();
        var newIdx = curIdx + dir;
        if (newIdx < 0) newIdx = MAIN_TABS.length - 1;
        if (newIdx >= MAIN_TABS.length) newIdx = 0;
        switchMainTab(newIdx);
        e.preventDefault();
        return;
      }
      return;
    }

    // Don't intercept if Ctrl or Alt is held (except Shift combos above)
    if (ctrl || alt) return;

    // Number keys 1–8: switch main tab
    var num = parseInt(key, 10);
    if (!isNaN(num) && num >= 1 && num <= 8) {
      switchMainTab(num - 1);
      e.preventDefault();
      return;
    }

    // Arrow keys: sub-tab navigation
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
      if (shift) {
        // Shift+Arrow: switch main tabs
        var mDir = key === 'ArrowRight' ? 1 : -1;
        var mCur = getActiveMainTabIndex();
        var mNext = mCur + mDir;
        if (mNext < 0) mNext = MAIN_TABS.length - 1;
        if (mNext >= MAIN_TABS.length) mNext = 0;
        switchMainTab(mNext);
        e.preventDefault();
      } else {
        // Plain arrow: switch sub-tabs
        var sDir = key === 'ArrowRight' ? 1 : -1;
        if (switchSubTab(sDir)) {
          e.preventDefault();
        }
      }
      return;
    }

    // R: toggle report panel
    if (key === 'r' || key === 'R') {
      var toggleBtn = document.getElementById('toggleReportPanelBtn');
      if (toggleBtn) toggleBtn.click();
      e.preventDefault();
      return;
    }

    // B: toggle snippet/bookmarks panel
    if (key === 'b' || key === 'B') {
      var snippetBtn = document.getElementById('toggleSnippetPanel');
      if (snippetBtn) snippetBtn.click();
      e.preventDefault();
      return;
    }

    // ?: show help
    if (key === '?' || (shift && key === '/')) {
      showHelp();
      e.preventDefault();
      return;
    }
  }

  // ── Init ──

  function init() {
    document.addEventListener('keydown', handleKeydown);
  }

  return {
    init: init,
    showHelp: showHelp
  };
})();
