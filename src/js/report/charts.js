/* ═══════════════════════════════════════════════════════
   BHM.Charts — Report chart rendering (Chart.js)
   Reworked: removed pointless single-bar charts;
   added radar for MBI-C & NPI-Q; RBANS line profile;
   CDR domain radar
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};

BHM.Charts = (function () {
  'use strict';

  var S = BHM.State;
  var _chartInstances = {};

  // ── Helper: read CSS variable from :root ──
  function cssVar(name, fallback) {
    var val = getComputedStyle(document.documentElement).getPropertyValue(name);
    return val ? val.trim() : (fallback || '');
  }

  // ── Helper: determine if current theme is dark ──
  function isDark() {
    return document.documentElement.getAttribute('data-bs-theme') === 'dark';
  }

  // ── Helper: get theme-aware colour palette ──
  function themeColors() {
    var primary     = cssVar('--bs-primary', '#0d6efd');
    var danger      = cssVar('--bs-danger', '#dc3545');
    var warning     = cssVar('--bs-warning', '#ffc107');
    var success     = cssVar('--bs-success', '#198754');
    var info        = cssVar('--bs-info', '#0dcaf0');
    var secondary   = cssVar('--bs-secondary', '#6c757d');
    var bodyColor   = cssVar('--bs-body-color', '#212529');
    var borderColor = cssVar('--bs-border-color', '#dee2e6');
    var gridColor   = isDark() ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
    var tickColor   = isDark() ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)';
    return {
      primary: primary, danger: danger, warning: warning, success: success,
      info: info, secondary: secondary, bodyColor: bodyColor,
      borderColor: borderColor, gridColor: gridColor, tickColor: tickColor
    };
  }

  // ── Helper: rgba from hex ──
  function hexToRGBA(hex, alpha) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r = parseInt(hex.substring(0,2), 16);
    var g = parseInt(hex.substring(2,4), 16);
    var b = parseInt(hex.substring(4,6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  // ── Helper: destroy previous chart ──
  function destroyChart(id) {
    if (_chartInstances[id]) {
      _chartInstances[id].destroy();
      delete _chartInstances[id];
    }
  }

  // ── Helper: ensure canvas inside container ──
  function ensureCanvas(containerId, height) {
    var container = document.getElementById(containerId);
    if (!container) return null;
    var canvasId = containerId + '-canvas';
    var canvas = document.getElementById(canvasId);
    if (!canvas) {
      container.style.height = (height || 220) + 'px';
      canvas = document.createElement('canvas');
      canvas.id = canvasId;
      container.appendChild(canvas);
    }
    destroyChart(canvasId);
    return { canvas: canvas, canvasId: canvasId };
  }

  // ═══════════════════════════════════════════
  //  BAR CHART (for multi-category data only)
  // ═══════════════════════════════════════════
  function createBarChart(containerId, config) {
    var c = ensureCanvas(containerId, config.height || 220);
    if (!c) return;

    var tc = themeColors();
    var colors = config.colors || config.data.map(function (val) {
      if (config.thresholdValue !== undefined) {
        return val > config.thresholdValue ? tc.danger
          : val > (config.warningValue || config.thresholdValue * 0.7) ? tc.warning : tc.success;
      }
      return tc.primary;
    });

    try {
      _chartInstances[c.canvasId] = new Chart(c.canvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: config.labels,
          datasets: [{
            data: config.data,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: true } },
          scales: {
            y: {
              beginAtZero: true,
              max: config.max || undefined,
              grid: { color: tc.gridColor },
              ticks: { font: { size: 11 }, color: tc.tickColor }
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 10 }, maxRotation: 45, color: tc.tickColor }
            }
          }
        }
      });
    } catch (e) {
      console.warn('BHM Charts: bar failed', containerId, e);
    }
  }

  // ═══════════════════════════════════════════
  //  RADAR / WINDROSE CHART
  // ═══════════════════════════════════════════
  function createRadarChart(containerId, config) {
    var c = ensureCanvas(containerId, config.height || 300);
    if (!c) return;

    var tc = themeColors();
    var datasets = [];
    for (var i = 0; i < config.datasets.length; i++) {
      var ds = config.datasets[i];
      var border = ds.border || tc.primary;
      datasets.push({
        label: ds.label,
        data: ds.data,
        backgroundColor: ds.bg || hexToRGBA(border, 0.15),
        borderColor: border,
        borderWidth: ds.borderWidth || 2,
        pointBackgroundColor: border,
        pointRadius: 4,
        pointHoverRadius: 6
      });
    }

    try {
      _chartInstances[c.canvasId] = new Chart(c.canvas.getContext('2d'), {
        type: 'radar',
        data: {
          labels: config.labels,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: datasets.length > 1, position: 'bottom', labels: { font: { size: 11 }, color: tc.tickColor } }
          },
          scales: {
            r: {
              beginAtZero: true,
              max: config.max || undefined,
              ticks: { stepSize: config.step || undefined, font: { size: 10 }, backdropColor: 'transparent', color: tc.tickColor },
              pointLabels: { font: { size: config.labelSize || 11 }, color: tc.tickColor },
              grid: { color: tc.gridColor },
              angleLines: { color: tc.gridColor }
            }
          }
        }
      });
    } catch (e) {
      console.warn('BHM Charts: radar failed', containerId, e);
    }
  }

  // ═══════════════════════════════════════════
  //  RBANS LINE PROFILE CHART
  // ═══════════════════════════════════════════
  function createRBANSChart(containerId) {
    var rb = S.getScore('rbans');
    if (!rb || !rb.indices) return;

    var c = ensureCanvas(containerId, 360);
    if (!c) return;

    var tc = themeColors();
    var labels = ['Immediate\nMemory', 'Visuospatial', 'Language', 'Attention', 'Delayed\nMemory'];
    var idx = rb.indices;
    var duff = rb.duff;
    var stdData = [idx.immediateMemory, idx.visuospatial, idx.language, idx.attention, idx.delayedMemory];
    var duffData = [parseFloat(duff.immIndex), parseFloat(duff.visuoIndex), parseFloat(duff.langIndex),
      parseFloat(duff.attIndex), parseFloat(duff.memIndex)];

    // Use theme-aware colours: primary for std norms, info/warning for duff
    var stdColor = tc.primary;
    var duffColor = tc.warning;

    try {
      _chartInstances[c.canvasId] = new Chart(c.canvas.getContext('2d'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Standard Norms',
              data: stdData,
              borderColor: stdColor,
              backgroundColor: hexToRGBA(stdColor, 0.08),
              borderWidth: 2.5,
              pointRadius: 6,
              pointBackgroundColor: stdColor,
              fill: false,
              tension: 0.1
            },
            {
              label: 'Duff Adjusted',
              data: duffData,
              borderColor: duffColor,
              backgroundColor: hexToRGBA(duffColor, 0.08),
              borderWidth: 2.5,
              borderDash: [6, 3],
              pointRadius: 6,
              pointBackgroundColor: duffColor,
              pointStyle: 'rectRot',
              fill: false,
              tension: 0.1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: { display: true, text: 'RBANS Index Profile', font: { size: 13, weight: 'bold' }, color: tc.bodyColor },
            legend: { position: 'bottom', labels: { font: { size: 11 }, color: tc.tickColor } }
          },
          scales: {
            y: {
              min: 40, max: 160,
              ticks: { stepSize: 10, font: { size: 10 }, color: tc.tickColor },
              title: { display: true, text: 'Index Score', font: { size: 11 }, color: tc.tickColor },
              grid: { color: tc.gridColor }
            },
            x: {
              ticks: { font: { size: 10 }, color: tc.tickColor },
              grid: { color: tc.gridColor }
            }
          }
        },
        plugins: [{
          id: 'rbans-report-bands',
          beforeDraw: function (chart) {
            var ctx = chart.ctx;
            var yScale = chart.scales.y;
            var area = chart.chartArea;
            var bandAlpha = isDark() ? 0.12 : 0.07;
            var bands = [
              { lo: 40, hi: 70, color: hexToRGBA(tc.danger, bandAlpha) },
              { lo: 70, hi: 85, color: hexToRGBA(tc.warning, bandAlpha) },
              { lo: 85, hi: 115, color: hexToRGBA(tc.success, bandAlpha) },
              { lo: 115, hi: 160, color: hexToRGBA(tc.info, bandAlpha * 0.7) }
            ];
            ctx.save();
            for (var b = 0; b < bands.length; b++) {
              var top = yScale.getPixelForValue(bands[b].hi);
              var bottom = yScale.getPixelForValue(bands[b].lo);
              ctx.fillStyle = bands[b].color;
              ctx.fillRect(area.left, top, area.right - area.left, bottom - top);
            }
            // Mean line
            var meanY = yScale.getPixelForValue(100);
            ctx.strokeStyle = isDark() ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.18)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(area.left, meanY);
            ctx.lineTo(area.right, meanY);
            ctx.stroke();
            ctx.restore();
          }
        }]
      });
    } catch (e) {
      console.warn('BHM Charts: RBANS failed', containerId, e);
    }
  }

  // ═══════════════════════════════════════════
  //  RENDER ALL REPORT CHARTS
  // ═══════════════════════════════════════════
  function renderReportCharts() {
    var tc = themeColors();

    // ── PSQI 7-component bar (meaningful multi-bar) ──
    var psqi = S.getScore('psqi');
    if (psqi && psqi.globalTotal !== null) {
      var compLabels = ['Quality', 'Latency', 'Duration', 'Efficiency', 'Disturbance', 'Medication', 'Day Dysfunction'];
      var compKeys = ['subjectiveQuality', 'sleepLatency', 'sleepDuration', 'sleepEfficiency',
        'sleepDisturbance', 'sleepMedication', 'daytimeDysfunction'];
      var compData = compKeys.map(function (k) { return psqi.components[k] || 0; });
      createBarChart('chart-psqi', {
        labels: compLabels, data: compData, max: 3, height: 220,
        thresholdValue: 2, warningValue: 1
      });
    }

    // ── CASP-19 4-domain bar (meaningful multi-bar) ──
    var casp = S.getScore('casp19');
    if (casp && casp.total !== null && casp.domainTotals) {
      var cLabels = [], cData = [];
      for (var d in casp.domainTotals) {
        if (casp.domainTotals.hasOwnProperty(d)) {
          cLabels.push(d);
          cData.push(casp.domainTotals[d]);
        }
      }
      createBarChart('chart-casp19', {
        labels: cLabels, data: cData, height: 200,
        colors: cData.map(function () { return tc.primary; })
      });
    }

    // ── MBI-C 5-domain radar (windrose) ──
    var mbic = S.getScore('mbiC');
    if (mbic && mbic.total !== null && BHM.Instruments.MBIC) {
      var domains = BHM.Instruments.MBIC.getDomains();
      var mLabels = [], mData = [];
      var domainShortNames = ['Motivation\n& Drive', 'Mood &\nAnxiety', 'Impulse Control\n& Reward', 'Social\nAppropriate.', 'Beliefs &\nPerception'];
      for (var i = 0; i < domains.length; i++) {
        mLabels.push(domainShortNames[i] || domains[i].name.split(' ')[0]);
        var dTotal = 0;
        for (var j = 0; j < domains[i].items.length; j++) {
          var val = S.get('instruments.mbiC.' + domains[i].items[j].key);
          if (val !== undefined && val !== null) dTotal += Number(val);
        }
        mData.push(dTotal);
      }
      // Max per domain: items * 3 (each scored 0-3)
      var maxPerDomain = domains.map(function (dom) { return dom.items.length * 3; });
      var maxAll = Math.max.apply(null, maxPerDomain);
      createRadarChart('chart-mbic', {
        labels: mLabels,
        datasets: [{ label: 'MBI-C Domain Scores', data: mData, border: tc.danger }],
        max: maxAll,
        step: Math.ceil(maxAll / 5),
        height: 320,
        labelSize: 11
      });
    }

    // ── NPI-Q 12-symptom radar (severity + distress overlaid) ──
    var npiq = S.getScore('npiQ');
    if (npiq && npiq.count > 0 && BHM.Instruments.NPIQ) {
      var symptoms = BHM.Instruments.NPIQ.getSymptoms();
      var nLabels = [], sevData = [], distData = [];
      for (var si = 0; si < symptoms.length; si++) {
        nLabels.push(symptoms[si].label.split('/')[0]); // short label
        var present = S.get('instruments.npiQ.' + symptoms[si].key + '_present');
        if (present === 'yes') {
          var sev = S.get('instruments.npiQ.' + symptoms[si].key + '_severity');
          var dist = S.get('instruments.npiQ.' + symptoms[si].key + '_distress');
          sevData.push(sev !== undefined && sev !== null ? Number(sev) : 0);
          distData.push(dist !== undefined && dist !== null ? Number(dist) : 0);
        } else {
          sevData.push(0);
          distData.push(0);
        }
      }
      createRadarChart('chart-npiq', {
        labels: nLabels,
        datasets: [
          { label: 'Severity', data: sevData, border: tc.warning, borderWidth: 2 },
          { label: 'Carer Distress', data: distData, border: tc.danger, borderWidth: 2 }
        ],
        max: 5,
        step: 1,
        height: 340,
        labelSize: 10
      });
    }

    // ── CDR 6-domain radar ──
    var cdr = S.getScore('cdr');
    if (cdr && cdr.total !== null && cdr.domainScores) {
      var cdrLabels = ['Memory', 'Orientation', 'Judgment', 'Community\nAffairs', 'Home &\nHobbies', 'Personal\nCare'];
      var cdrKeys = ['memory', 'orientation', 'judgment', 'community', 'homeHobbies', 'personalCare'];
      var cdrData = cdrKeys.map(function (k) { return cdr.domainScores[k] || 0; });
      createRadarChart('chart-cdr', {
        labels: cdrLabels,
        datasets: [{ label: 'CDR Domain Ratings', data: cdrData, border: tc.secondary }],
        max: 3,
        step: 0.5,
        height: 300,
        labelSize: 11
      });
    }

    // ── RBANS profile line chart ──
    createRBANSChart('chart-rbans');
  }

  return {
    renderReportCharts: renderReportCharts
  };
})();
