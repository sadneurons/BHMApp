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

    var colors = config.colors || config.data.map(function (val) {
      if (config.thresholdValue !== undefined) {
        return val > config.thresholdValue ? '#dc3545'
          : val > (config.warningValue || config.thresholdValue * 0.7) ? '#ffc107' : '#198754';
      }
      return '#0d6efd';
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
              grid: { color: '#e9ecef' },
              ticks: { font: { size: 11 } }
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 10 }, maxRotation: 45 }
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

    var datasets = [];
    for (var i = 0; i < config.datasets.length; i++) {
      var ds = config.datasets[i];
      datasets.push({
        label: ds.label,
        data: ds.data,
        backgroundColor: ds.bg || 'rgba(13,110,253,0.15)',
        borderColor: ds.border || '#0d6efd',
        borderWidth: ds.borderWidth || 2,
        pointBackgroundColor: ds.border || '#0d6efd',
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
            legend: { display: datasets.length > 1, position: 'bottom', labels: { font: { size: 11 } } }
          },
          scales: {
            r: {
              beginAtZero: true,
              max: config.max || undefined,
              ticks: { stepSize: config.step || undefined, font: { size: 10 }, backdropColor: 'transparent' },
              pointLabels: { font: { size: config.labelSize || 11 } },
              grid: { color: '#dee2e6' },
              angleLines: { color: '#dee2e6' }
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

    var labels = ['Immediate\nMemory', 'Visuospatial', 'Language', 'Attention', 'Delayed\nMemory'];
    var idx = rb.indices;
    var duff = rb.duff;
    var stdData = [idx.immediateMemory, idx.visuospatial, idx.language, idx.attention, idx.delayedMemory];
    var duffData = [parseFloat(duff.immIndex), parseFloat(duff.visuoIndex), parseFloat(duff.langIndex),
      parseFloat(duff.attIndex), parseFloat(duff.memIndex)];

    try {
      _chartInstances[c.canvasId] = new Chart(c.canvas.getContext('2d'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Standard Norms',
              data: stdData,
              borderColor: 'rgb(17,157,255)',
              backgroundColor: 'rgba(17,157,255,0.08)',
              borderWidth: 2.5,
              pointRadius: 6,
              pointBackgroundColor: 'rgb(17,157,255)',
              fill: false,
              tension: 0.1
            },
            {
              label: 'Duff Adjusted',
              data: duffData,
              borderColor: 'rgb(255,102,0)',
              backgroundColor: 'rgba(255,102,0,0.08)',
              borderWidth: 2.5,
              borderDash: [6, 3],
              pointRadius: 6,
              pointBackgroundColor: 'rgb(255,102,0)',
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
            title: { display: true, text: 'RBANS Index Profile', font: { size: 13, weight: 'bold' } },
            legend: { position: 'bottom', labels: { font: { size: 11 } } }
          },
          scales: {
            y: {
              min: 40, max: 160,
              ticks: { stepSize: 10, font: { size: 10 } },
              title: { display: true, text: 'Index Score', font: { size: 11 } }
            },
            x: {
              ticks: { font: { size: 10 } }
            }
          }
        },
        plugins: [{
          id: 'rbans-report-bands',
          beforeDraw: function (chart) {
            var ctx = chart.ctx;
            var yScale = chart.scales.y;
            var area = chart.chartArea;
            var bands = [
              { lo: 40, hi: 70, color: 'rgba(255,77,77,0.07)' },
              { lo: 70, hi: 85, color: 'rgba(255,200,0,0.07)' },
              { lo: 85, hi: 115, color: 'rgba(0,200,83,0.07)' },
              { lo: 115, hi: 160, color: 'rgba(0,123,255,0.05)' }
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
            ctx.strokeStyle = 'rgba(0,0,0,0.18)';
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
        colors: cData.map(function () { return '#0d6efd'; })
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
        datasets: [{ label: 'MBI-C Domain Scores', data: mData, bg: 'rgba(220,53,69,0.15)', border: '#dc3545' }],
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
          { label: 'Severity', data: sevData, bg: 'rgba(255,193,7,0.15)', border: '#ffc107', borderWidth: 2 },
          { label: 'Carer Distress', data: distData, bg: 'rgba(220,53,69,0.12)', border: '#dc3545', borderWidth: 2 }
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
        datasets: [{ label: 'CDR Domain Ratings', data: cdrData, bg: 'rgba(108,117,125,0.15)', border: '#6c757d' }],
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
