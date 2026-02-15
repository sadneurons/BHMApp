/* ═══════════════════════════════════════════════════════
   BHM.Charts — Report chart rendering (Chart.js)
   Full suite: radar, line, bar, doughnut, gauge, mosaic,
   bullet, traffic-light — stylistically harmonised
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};

BHM.Charts = (function () {
  'use strict';

  var S = BHM.State;
  var _chartInstances = {};

  // ═══════════════════════════════════════════
  //  THEME HELPERS
  // ═══════════════════════════════════════════
  function cssVar(name, fb) { var v = getComputedStyle(document.documentElement).getPropertyValue(name); return v ? v.trim() : (fb || ''); }
  function isDark() { return document.documentElement.getAttribute('data-bs-theme') === 'dark'; }
  function hexToRGBA(hex, alpha) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    return 'rgba(' + parseInt(hex.substring(0,2),16) + ',' + parseInt(hex.substring(2,4),16) + ',' + parseInt(hex.substring(4,6),16) + ',' + alpha + ')';
  }
  function themeColors() {
    return {
      primary:   cssVar('--bs-primary',   '#0d6efd'),
      danger:    cssVar('--bs-danger',    '#dc3545'),
      warning:   cssVar('--bs-warning',   '#ffc107'),
      success:   cssVar('--bs-success',   '#198754'),
      info:      cssVar('--bs-info',      '#0dcaf0'),
      secondary: cssVar('--bs-secondary', '#6c757d'),
      bodyColor: cssVar('--bs-body-color','#212529'),
      borderColor: cssVar('--bs-border-color','#dee2e6'),
      gridColor: isDark() ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      tickColor: isDark() ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)',
      bgColor:   isDark() ? '#222' : '#fff'
    };
  }

  // ═══════════════════════════════════════════
  //  CANVAS HELPERS
  // ═══════════════════════════════════════════
  function destroyChart(id) { if (_chartInstances[id]) { _chartInstances[id].destroy(); delete _chartInstances[id]; } }

  function ensureCanvas(containerId, height, opts) {
    var container = document.getElementById(containerId);
    if (!container) return null;
    var canvasId = containerId + '-canvas';
    var canvas = document.getElementById(canvasId);
    if (!canvas) {
      container.style.height = (height || 220) + 'px';
      if (opts && opts.maxWidth) container.style.maxWidth = opts.maxWidth + 'px';
      if (opts && opts.center) container.style.margin = '0 auto';
      canvas = document.createElement('canvas');
      canvas.id = canvasId;
      container.appendChild(canvas);
    }
    destroyChart(canvasId);
    return { canvas: canvas, canvasId: canvasId };
  }

  // Colour-stop helper for severity (green → yellow → orange → red)
  function sevColor(val, max, tc) {
    var ratio = val / max;
    if (ratio <= 0.25) return tc.success;
    if (ratio <= 0.5) return tc.warning;
    if (ratio <= 0.75) return '#fd7e14'; // orange
    return tc.danger;
  }

  // ═══════════════════════════════════════════
  //  1. BAR CHART (generic)
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
        data: { labels: config.labels, datasets: [{ data: config.data, backgroundColor: colors, borderColor: colors, borderWidth: 1, borderRadius: 4 }] },
        options: {
          responsive: true, maintainAspectRatio: false, indexAxis: config.horizontal ? 'y' : 'x',
          plugins: { legend: { display: false }, title: config.title ? { display: true, text: config.title, font: { size: 12, weight: 'bold' }, color: tc.bodyColor } : { display: false } },
          scales: {
            y: { beginAtZero: true, max: config.max || undefined, grid: { color: tc.gridColor }, ticks: { font: { size: 10 }, color: tc.tickColor } },
            x: { grid: { display: config.horizontal ? true : false, color: tc.gridColor }, ticks: { font: { size: 10 }, maxRotation: 45, color: tc.tickColor }, max: config.horizontal ? (config.max || undefined) : undefined }
          }
        }
      });
    } catch (e) { console.warn('BHM Charts: bar failed', containerId, e); }
  }

  // ═══════════════════════════════════════════
  //  2. RADAR / WINDROSE
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
        label: ds.label, data: ds.data,
        backgroundColor: ds.bg || hexToRGBA(border, 0.15), borderColor: border,
        borderWidth: ds.borderWidth || 2, pointBackgroundColor: border, pointRadius: 4, pointHoverRadius: 6
      });
    }
    try {
      _chartInstances[c.canvasId] = new Chart(c.canvas.getContext('2d'), {
        type: 'radar',
        data: { labels: config.labels, datasets: datasets },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: datasets.length > 1, position: 'bottom', labels: { font: { size: 11 }, color: tc.tickColor } },
            title: config.title ? { display: true, text: config.title, font: { size: 12, weight: 'bold' }, color: tc.bodyColor } : { display: false }
          },
          scales: {
            r: {
              beginAtZero: true, max: config.max || undefined,
              ticks: { stepSize: config.step || undefined, font: { size: 10 }, backdropColor: 'transparent', color: tc.tickColor },
              pointLabels: { font: { size: config.labelSize || 11 }, color: tc.tickColor },
              grid: { color: tc.gridColor }, angleLines: { color: tc.gridColor }
            }
          }
        }
      });
    } catch (e) { console.warn('BHM Charts: radar failed', containerId, e); }
  }

  // ═══════════════════════════════════════════
  //  3. DOUGHNUT / PROGRESS RING
  // ═══════════════════════════════════════════
  function createProgressRing(containerId, config) {
    var c = ensureCanvas(containerId, config.height || 200, { maxWidth: 220, center: true });
    if (!c) return;
    var tc = themeColors();
    var val = config.value;
    var max = config.max;
    var remainder = max - val;
    var color = config.color || tc.success;
    try {
      _chartInstances[c.canvasId] = new Chart(c.canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: [config.label || 'Score', 'Remaining'],
          datasets: [{ data: [val, remainder], backgroundColor: [color, isDark() ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'], borderWidth: 0, cutout: '72%' }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: true }
          }
        },
        plugins: [{
          id: 'center-text',
          afterDraw: function (chart) {
            var ctx = chart.ctx;
            var area = chart.chartArea;
            var cx = (area.left + area.right) / 2;
            var cy = (area.top + area.bottom) / 2;
            ctx.save();
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.font = 'bold 28px sans-serif'; ctx.fillStyle = tc.bodyColor;
            ctx.fillText(val + '/' + max, cx, cy - 8);
            ctx.font = '12px sans-serif'; ctx.fillStyle = tc.tickColor;
            ctx.fillText(config.sublabel || '', cx, cy + 16);
            ctx.restore();
          }
        }]
      });
    } catch (e) { console.warn('BHM Charts: ring failed', containerId, e); }
  }

  // ═══════════════════════════════════════════
  //  4. SEMICIRCULAR GAUGE (Epworth-style)
  // ═══════════════════════════════════════════
  function createGaugeChart(containerId, config) {
    var c = ensureCanvas(containerId, config.height || 180, { maxWidth: 280, center: true });
    if (!c) return;
    var tc = themeColors();
    var zones = config.zones; // [{max, color, label}]
    var zoneData = zones.map(function (z, i) { return z.max - (i > 0 ? zones[i - 1].max : 0); });
    var zoneColors = zones.map(function (z) { return z.color; });
    try {
      _chartInstances[c.canvasId] = new Chart(c.canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: zones.map(function (z) { return z.label; }),
          datasets: [{ data: zoneData, backgroundColor: zoneColors, borderWidth: 0, cutout: '65%' }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          rotation: -90, circumference: 180,
          plugins: { legend: { display: false }, tooltip: { enabled: true } }
        },
        plugins: [{
          id: 'gauge-needle',
          afterDraw: function (chart) {
            var ctx = chart.ctx;
            var area = chart.chartArea;
            var cx = (area.left + area.right) / 2;
            var cy = area.bottom - 10;
            var totalMax = zones[zones.length - 1].max;
            var angle = Math.PI + (config.value / totalMax) * Math.PI;
            var needleLen = (area.right - area.left) / 2 * 0.7;
            // Draw needle
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, -3); ctx.lineTo(needleLen, 0); ctx.lineTo(0, 3);
            ctx.fillStyle = tc.bodyColor; ctx.fill();
            ctx.restore();
            // Center dot
            ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
            ctx.fillStyle = tc.bodyColor; ctx.fill();
            // Score text
            ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
            ctx.font = 'bold 22px sans-serif'; ctx.fillStyle = tc.bodyColor;
            ctx.fillText(config.value + '/' + totalMax, cx, cy - 12);
            ctx.font = '11px sans-serif'; ctx.fillStyle = tc.tickColor;
            ctx.fillText(config.sublabel || '', cx, cy + 18);
          }
        }]
      });
    } catch (e) { console.warn('BHM Charts: gauge failed', containerId, e); }
  }

  // ═══════════════════════════════════════════
  //  5. BULLET / HORIZONTAL SCORE BAR
  // ═══════════════════════════════════════════
  function createBulletChart(containerId, config) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    container.style.padding = '12px 0';
    var tc = themeColors();
    var zones = config.zones; // [{max, color, label}]
    var totalMax = zones[zones.length - 1].max;
    var val = config.value;

    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;height:32px;border-radius:6px;overflow:hidden;background:' + (isDark() ? 'rgba(255,255,255,0.06)' : '#f0f0f0');

    // Zone backgrounds
    var prevPct = 0;
    for (var z = 0; z < zones.length; z++) {
      var pct = (zones[z].max / totalMax) * 100;
      var seg = document.createElement('div');
      seg.style.cssText = 'position:absolute;top:0;bottom:0;left:' + prevPct + '%;width:' + (pct - prevPct) + '%;background:' + hexToRGBA(zones[z].color, 0.25);
      seg.title = zones[z].label + ' (0–' + zones[z].max + ')';
      wrap.appendChild(seg);
      prevPct = pct;
    }

    // Marker
    var markerPct = Math.min((val / totalMax) * 100, 100);
    var marker = document.createElement('div');
    marker.style.cssText = 'position:absolute;top:2px;bottom:2px;left:' + markerPct + '%;width:4px;border-radius:2px;background:' + tc.bodyColor + ';transform:translateX(-2px)';
    wrap.appendChild(marker);

    container.appendChild(wrap);

    // Labels row
    var labels = document.createElement('div');
    labels.style.cssText = 'display:flex;justify-content:space-between;font-size:0.72rem;color:' + tc.tickColor + ';margin-top:4px';
    for (var l = 0; l < zones.length; l++) {
      var sp = document.createElement('span');
      sp.textContent = zones[l].label;
      labels.appendChild(sp);
    }
    container.appendChild(labels);

    // Score label
    var scoreLabel = document.createElement('div');
    scoreLabel.style.cssText = 'text-align:center;font-weight:bold;font-size:0.9rem;margin-top:2px;color:' + tc.bodyColor;
    scoreLabel.textContent = 'Score: ' + val + '/' + totalMax;
    container.appendChild(scoreLabel);
  }

  // ═══════════════════════════════════════════
  //  6. TRAFFIC LIGHT (Education)
  // ═══════════════════════════════════════════
  function createTrafficLight(containerId, config) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    container.style.padding = '10px 0';
    var tc = themeColors();
    var levels = config.levels; // [{label, color}]
    var activeIdx = config.activeIndex;

    var row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;justify-content:center;align-items:center';

    for (var i = 0; i < levels.length; i++) {
      var light = document.createElement('div');
      var isActive = i === activeIdx;
      light.style.cssText = 'flex:1;text-align:center;padding:10px 6px;border-radius:8px;font-size:0.82rem;font-weight:' +
        (isActive ? '700' : '400') + ';color:' + (isActive ? '#fff' : tc.tickColor) +
        ';background:' + (isActive ? levels[i].color : hexToRGBA(levels[i].color, 0.15)) +
        ';border:2px solid ' + (isActive ? levels[i].color : 'transparent') +
        ';transition:all 0.2s';
      light.textContent = levels[i].label;
      row.appendChild(light);
    }
    container.appendChild(row);
  }

  // ═══════════════════════════════════════════
  //  7. MOSAIC GRID (GDS-15 black/white)
  // ═══════════════════════════════════════════
  function createMosaic(containerId, config) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    container.style.padding = '10px 0';
    var tc = themeColors();
    var items = config.items; // [{label, endorsed}]
    var cols = config.cols || 5;

    var title = document.createElement('div');
    title.style.cssText = 'text-align:center;font-size:0.82rem;font-weight:600;margin-bottom:6px;color:' + tc.bodyColor;
    title.textContent = config.title || '';
    container.appendChild(title);

    var grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(' + cols + ',1fr);gap:3px;max-width:320px;margin:0 auto';

    for (var i = 0; i < items.length; i++) {
      var cell = document.createElement('div');
      var endorsed = items[i].endorsed;
      cell.style.cssText = 'aspect-ratio:1;border-radius:4px;display:flex;align-items:center;justify-content:center;' +
        'font-size:0.6rem;text-align:center;padding:2px;line-height:1.1;' +
        'background:' + (endorsed ? (config.endorsedColor || tc.danger) : (isDark() ? 'rgba(255,255,255,0.08)' : '#f5f5f5')) +
        ';color:' + (endorsed ? '#fff' : tc.tickColor) +
        ';font-weight:' + (endorsed ? '600' : '400');
      cell.textContent = items[i].label;
      cell.title = items[i].label + (endorsed ? ' (endorsed)' : '');
      grid.appendChild(cell);
    }
    container.appendChild(grid);

    var countLabel = document.createElement('div');
    var endorsedCount = items.filter(function (it) { return it.endorsed; }).length;
    countLabel.style.cssText = 'text-align:center;font-size:0.85rem;font-weight:bold;margin-top:6px;color:' + tc.bodyColor;
    countLabel.textContent = endorsedCount + '/' + items.length + ' endorsed';
    container.appendChild(countLabel);
  }

  // ═══════════════════════════════════════════
  //  8. HORIZONTAL SEVERITY BARS (Neuroimaging)
  // ═══════════════════════════════════════════
  function createSeverityBars(containerId, config) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    container.style.padding = '8px 0';
    var tc = themeColors();
    var items = config.items; // [{label, value, max}]

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;margin-bottom:4px;font-size:0.78rem';

      var label = document.createElement('span');
      label.style.cssText = 'width:140px;flex-shrink:0;color:' + tc.bodyColor + ';font-weight:500';
      label.textContent = item.label;
      row.appendChild(label);

      var barWrap = document.createElement('div');
      barWrap.style.cssText = 'flex:1;height:16px;border-radius:4px;background:' + (isDark() ? 'rgba(255,255,255,0.08)' : '#eee') + ';position:relative;overflow:hidden';

      var fillPct = (item.value / item.max) * 100;
      var fill = document.createElement('div');
      fill.style.cssText = 'height:100%;border-radius:4px;width:' + fillPct + '%;background:' + sevColor(item.value, item.max, tc) + ';transition:width 0.3s';
      barWrap.appendChild(fill);
      row.appendChild(barWrap);

      var valLabel = document.createElement('span');
      valLabel.style.cssText = 'width:40px;text-align:right;font-weight:600;margin-left:6px;color:' + tc.bodyColor;
      valLabel.textContent = item.value + '/' + item.max;
      row.appendChild(valLabel);

      container.appendChild(row);
    }
  }

  // ═══════════════════════════════════════════
  //  9. RBANS LINE PROFILE (preserved)
  // ═══════════════════════════════════════════
  function createRBANSChart(containerId) {
    var rb = S.getScore('rbans');
    if (!rb || !rb.indices) return;
    var container = document.getElementById(containerId);
    if (container) { container.style.maxWidth = '600px'; container.style.margin = '0 auto'; }
    var c = ensureCanvas(containerId, 500);
    if (!c) return;
    var tc = themeColors();
    var labels = ['Immediate\nMemory', 'Visuospatial', 'Language', 'Attention', 'Delayed\nMemory'];
    var idx = rb.indices; var duff = rb.duff;
    var stdData = [idx.immediateMemory, idx.visuospatial, idx.language, idx.attention, idx.delayedMemory];
    var duffData = [parseFloat(duff.immIndex), parseFloat(duff.visuoIndex), parseFloat(duff.langIndex), parseFloat(duff.attIndex), parseFloat(duff.memIndex)];
    try {
      _chartInstances[c.canvasId] = new Chart(c.canvas.getContext('2d'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            { label: 'Standard Norms', data: stdData, borderColor: tc.primary, backgroundColor: hexToRGBA(tc.primary, 0.08), borderWidth: 2.5, pointRadius: 6, pointBackgroundColor: tc.primary, fill: false, tension: 0.1 },
            { label: 'Duff Adjusted', data: duffData, borderColor: tc.warning, backgroundColor: hexToRGBA(tc.warning, 0.08), borderWidth: 2.5, borderDash: [6,3], pointRadius: 6, pointBackgroundColor: tc.warning, pointStyle: 'rectRot', fill: false, tension: 0.1 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            title: { display: true, text: 'RBANS Index Profile', font: { size: 13, weight: 'bold' }, color: tc.bodyColor },
            legend: { position: 'bottom', labels: { font: { size: 11 }, color: tc.tickColor } }
          },
          scales: {
            y: { min: 40, max: 160, ticks: { stepSize: 10, font: { size: 10 }, color: tc.tickColor }, title: { display: true, text: 'Index Score', font: { size: 11 }, color: tc.tickColor }, grid: { color: tc.gridColor } },
            x: { ticks: { font: { size: 10 }, color: tc.tickColor }, grid: { color: tc.gridColor } }
          }
        },
        plugins: [{
          id: 'rbans-report-bands',
          beforeDraw: function (chart) {
            var ctx = chart.ctx; var yScale = chart.scales.y; var area = chart.chartArea;
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
            var meanY = yScale.getPixelForValue(100);
            ctx.strokeStyle = isDark() ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.18)';
            ctx.lineWidth = 1; ctx.setLineDash([4,4]);
            ctx.beginPath(); ctx.moveTo(area.left, meanY); ctx.lineTo(area.right, meanY); ctx.stroke();
            ctx.restore();
          }
        }]
      });
    } catch (e) { console.warn('BHM Charts: RBANS failed', containerId, e); }
  }

  // ═══════════════════════════════════════════
  //  RENDER ALL REPORT CHARTS
  // ═══════════════════════════════════════════
  function renderReportCharts() {
    var tc = themeColors();

    // ── Education traffic light ──
    var qual = S.get('instruments.clinical.highestQual');
    if (qual) {
      var qualMap = { 'None': 0, 'GCSE/O-level': 1, 'A-level': 1, 'Degree': 2, 'Postgrad': 2, 'Other': 1 };
      var activeIdx = qualMap[qual] !== undefined ? qualMap[qual] : -1;
      createTrafficLight('chart-education', {
        levels: [
          { label: 'Primary / None', color: tc.danger },
          { label: 'Secondary', color: tc.warning },
          { label: 'Tertiary', color: tc.success }
        ],
        activeIndex: activeIdx
      });
    }

    // ── GDS-15 mosaic ──
    var gds = S.getScore('depression');
    if (gds && gds.total !== null) {
      var GDS_ITEMS = [
        { key: 'd1', label: 'Satisfied', dep: 'no' }, { key: 'd2', label: 'Dropped activities', dep: 'yes' },
        { key: 'd3', label: 'Life empty', dep: 'yes' }, { key: 'd4', label: 'Often bored', dep: 'yes' },
        { key: 'd5', label: 'Good spirits', dep: 'no' }, { key: 'd6', label: 'Afraid', dep: 'yes' },
        { key: 'd7', label: 'Happy', dep: 'no' }, { key: 'd8', label: 'Helpless', dep: 'yes' },
        { key: 'd9', label: 'Stay home', dep: 'yes' }, { key: 'd10', label: 'Memory worse', dep: 'yes' },
        { key: 'd11', label: 'Wonderful alive', dep: 'no' }, { key: 'd12', label: 'Worthless', dep: 'yes' },
        { key: 'd13', label: 'Full of energy', dep: 'no' }, { key: 'd14', label: 'Hopeless', dep: 'yes' },
        { key: 'd15', label: 'Others better', dep: 'yes' }
      ];
      var mosaicItems = GDS_ITEMS.map(function (item) {
        var val = S.get('instruments.depression.' + item.key);
        var endorsed = (val === item.dep);
        return { label: item.label, endorsed: endorsed };
      });
      createMosaic('chart-gds', {
        title: 'GDS-15 — Depressive Items',
        items: mosaicItems,
        cols: 5,
        endorsedColor: isDark() ? '#555' : '#222'
      });
    }

    // ── GAD-7 radar ──
    var gad = S.getScore('gad7');
    if (gad && gad.total !== null) {
      var GAD_LABELS = ['Nervous /\nAnxious', 'Uncontrollable\nWorry', 'Excessive\nWorry', 'Trouble\nRelaxing', 'Restless-\nness', 'Irritable', 'Feeling\nAfraid'];
      var gadKeys = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'];
      var gadData = gadKeys.map(function (k) { var v = S.get('instruments.gad7.' + k); return v !== undefined && v !== null ? Number(v) : 0; });
      createRadarChart('chart-gad7', {
        labels: GAD_LABELS,
        datasets: [{ label: 'GAD-7', data: gadData, border: tc.info }],
        max: 3, step: 1, height: 280, labelSize: 10,
        title: 'GAD-7 — Anxiety Profile'
      });
    }

    // ── PSQI stacked horizontal bar (7 components) ──
    var psqi = S.getScore('psqi');
    if (psqi && psqi.globalTotal !== null) {
      var compLabels = ['Quality', 'Latency', 'Duration', 'Efficiency', 'Disturbance', 'Medication', 'Day Dysfunction'];
      var compKeys = ['subjectiveQuality', 'sleepLatency', 'sleepDuration', 'sleepEfficiency', 'sleepDisturbance', 'sleepMedication', 'daytimeDysfunction'];
      var compData = compKeys.map(function (k) { return psqi.components[k] || 0; });
      var compColors = compData.map(function (v) { return sevColor(v, 3, tc); });
      createBarChart('chart-psqi', {
        labels: compLabels, data: compData, max: 3, height: 220,
        colors: compColors, horizontal: true,
        title: 'PSQI Components (0–3 each)'
      });
    }

    // ── Epworth gauge ──
    var epworth = S.getScore('epworth');
    if (epworth && epworth.total !== null) {
      createGaugeChart('chart-epworth', {
        value: epworth.total,
        zones: [
          { max: 5, color: tc.success, label: 'Lower normal' },
          { max: 10, color: '#8BC34A', label: 'Higher normal' },
          { max: 12, color: tc.warning, label: 'Mild' },
          { max: 15, color: '#fd7e14', label: 'Moderate' },
          { max: 24, color: tc.danger, label: 'Severe' }
        ],
        sublabel: 'Daytime Sleepiness',
        height: 170
      });
    }

    // ── AUDIT bullet chart ──
    var audit = S.getScore('auditTool');
    if (audit && audit.total !== null) {
      createBulletChart('chart-audit', {
        value: audit.total,
        zones: [
          { max: 7, color: tc.success, label: 'Low risk' },
          { max: 15, color: tc.warning, label: 'Increasing risk' },
          { max: 19, color: '#fd7e14', label: 'Higher risk' },
          { max: 40, color: tc.danger, label: 'Possible dependence' }
        ]
      });
    }

    // ── CASP-19 grouped bar ──
    var casp = S.getScore('casp19');
    if (casp && casp.total !== null && casp.domainTotals) {
      var cLabels = [], cData = [], cMax = [];
      var domainMaxes = { 'Control': 12, 'Autonomy': 15, 'Self-realisation': 12, 'Pleasure': 18 };
      for (var d in casp.domainTotals) {
        if (casp.domainTotals.hasOwnProperty(d)) {
          cLabels.push(d);
          cData.push(casp.domainTotals[d]);
          cMax.push(domainMaxes[d] || 15);
        }
      }
      var cColors = cData.map(function (v, idx) { return v >= cMax[idx] * 0.7 ? tc.success : v >= cMax[idx] * 0.4 ? tc.warning : tc.danger; });
      createBarChart('chart-casp19', {
        labels: cLabels, data: cData, height: 200,
        colors: cColors,
        title: 'CASP-19 Quality of Life Domains'
      });
    }

    // ── Mediterranean Diet ring ──
    var diet = S.getScore('diet');
    if (diet && diet.total !== null) {
      var dietColor = diet.total >= 10 ? tc.success : diet.total >= 7 ? tc.warning : tc.danger;
      createProgressRing('chart-diet', {
        value: diet.total, max: 14,
        color: dietColor, label: 'Diet Score',
        sublabel: diet.total >= 10 ? 'Good adherence' : diet.total >= 7 ? 'Moderate' : 'Low adherence',
        height: 200
      });
    }

    // ── Hearing mosaic ──
    var hearing = S.getScore('hearing');
    if (hearing) {
      var HEAR_LABELS = [
        'TV/radio', 'Phone', 'Face to face', 'Group unfamiliar', 'Group familiar',
        'Noisy shop', 'Restaurant', 'Busy street', 'Car', 'Public transport',
        'Worship', 'Music', 'Lecture/talk', 'Multi-floor rooms', 'Echoing rooms',
        'Outdoors', 'Soft speech'
      ];
      var hearItems = [];
      for (var h = 0; h < 17; h++) {
        var hVal = S.get('instruments.hearing.hs' + (h + 1));
        hearItems.push({ label: HEAR_LABELS[h] || 'Situation ' + (h + 1), endorsed: hVal === 'yes' });
      }
      if (hearItems.some(function (it) { return it.endorsed; })) {
        createMosaic('chart-hearing', {
          title: 'Hearing — Affected Situations',
          items: hearItems,
          cols: 6,
          endorsedColor: '#fd7e14'
        });
      }
    }

    // ── MBI-C radar ──
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
      var maxPerDomain = domains.map(function (dom) { return dom.items.length * 3; });
      var maxAll = Math.max.apply(null, maxPerDomain);
      createRadarChart('chart-mbic', {
        labels: mLabels,
        datasets: [{ label: 'MBI-C Domain Scores', data: mData, border: tc.danger }],
        max: maxAll, step: Math.ceil(maxAll / 5), height: 320, labelSize: 11
      });
    }

    // ── NPI-Q radar ──
    var npiq = S.getScore('npiQ');
    if (npiq && npiq.count > 0 && BHM.Instruments.NPIQ) {
      var symptoms = BHM.Instruments.NPIQ.getSymptoms();
      var nLabels = [], sevData = [], distData = [];
      for (var si = 0; si < symptoms.length; si++) {
        nLabels.push(symptoms[si].label.split('/')[0]);
        var present = S.get('instruments.npiQ.' + symptoms[si].key + '_present');
        if (present === 'yes') {
          var sev = S.get('instruments.npiQ.' + symptoms[si].key + '_severity');
          var dist = S.get('instruments.npiQ.' + symptoms[si].key + '_distress');
          sevData.push(sev !== undefined && sev !== null ? Number(sev) : 0);
          distData.push(dist !== undefined && dist !== null ? Number(dist) : 0);
        } else { sevData.push(0); distData.push(0); }
      }
      createRadarChart('chart-npiq', {
        labels: nLabels,
        datasets: [
          { label: 'Severity', data: sevData, border: tc.warning, borderWidth: 2 },
          { label: 'Carer Distress', data: distData, border: tc.danger, borderWidth: 2 }
        ],
        max: 5, step: 1, height: 340, labelSize: 10
      });
    }

    // ── CDR radar ──
    var cdr = S.getScore('cdr');
    if (cdr && cdr.total !== null && cdr.domainScores) {
      var cdrLabels = ['Memory', 'Orientation', 'Judgment', 'Community\nAffairs', 'Home &\nHobbies', 'Personal\nCare'];
      var cdrKeys = ['memory', 'orientation', 'judgment', 'community', 'homeHobbies', 'personalCare'];
      var cdrData = cdrKeys.map(function (k) { return cdr.domainScores[k] || 0; });
      createRadarChart('chart-cdr', {
        labels: cdrLabels,
        datasets: [{ label: 'CDR Domain Ratings', data: cdrData, border: tc.secondary }],
        max: 3, step: 0.5, height: 300, labelSize: 11
      });
    }

    // ── Neuroimaging severity bars ──
    var scans = S.get('neuroimaging.scans') || [];
    for (var ni = 0; ni < scans.length; ni++) {
      var scan = scans[ni];
      var containerId = 'chart-neuro-' + ni;
      var bars = [];
      if (scan.fazekasPV !== null && scan.fazekasPV !== undefined) bars.push({ label: 'Fazekas PV', value: scan.fazekasPV, max: 3 });
      if (scan.fazekasDWM !== null && scan.fazekasDWM !== undefined) bars.push({ label: 'Fazekas DWM', value: scan.fazekasDWM, max: 3 });
      if (scan.gca !== null && scan.gca !== undefined) bars.push({ label: 'GCA', value: scan.gca, max: 3 });
      if (scan.koedam !== null && scan.koedam !== undefined) bars.push({ label: 'Koedam', value: scan.koedam, max: 3 });
      if (scan.mtaLeft !== null && scan.mtaLeft !== undefined) bars.push({ label: 'MTA Left', value: scan.mtaLeft, max: 4 });
      if (scan.mtaRight !== null && scan.mtaRight !== undefined) bars.push({ label: 'MTA Right', value: scan.mtaRight, max: 4 });
      if (bars.length > 0) createSeverityBars(containerId, { items: bars });
    }

    // ── RBANS profile line chart ──
    createRBANSChart('chart-rbans');
  }

  return {
    renderReportCharts: renderReportCharts,
    _instances: _chartInstances
  };
})();
