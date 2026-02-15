/* ═══════════════════════════════════════════════════════
   BHM.DocxExport — Export report as Word .docx
   Uses docx.js (IIFE build) + JSZip for font embedding
   Font: Gill Sans MT Std (embedded from base64 at build)
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};

BHM.DocxExport = (function () {
  'use strict';

  var S = BHM.State;

  // ── Shorthand references to docx library classes ──
  function D() { return window.docx; }

  // ── Font name constant ──
  var FONT = 'Gill Sans MT Std';
  var FONT_HEADING = 'Gill Sans MT Std';

  // ── Patient helpers ──
  function pat(key, fallback) { return S.get('patient.' + key) || fallback || ''; }
  function ts() { return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19); }
  function slug() { return (pat('name', 'unknown')).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30); }

  // ── Standard border preset for table cells ──
  var BORDER_STD = { style: 'single', size: 1, color: 'BBBBBB' };
  function cellBorders() {
    var d = D();
    return {
      top: { style: d.BorderStyle.SINGLE, size: 1, color: 'BBBBBB' },
      bottom: { style: d.BorderStyle.SINGLE, size: 1, color: 'BBBBBB' },
      left: { style: d.BorderStyle.SINGLE, size: 1, color: 'BBBBBB' },
      right: { style: d.BorderStyle.SINGLE, size: 1, color: 'BBBBBB' }
    };
  }

  // ═══════════════════════════════════════════
  //  DOM → docx conversion helpers
  // ═══════════════════════════════════════════

  /** Extract inline TextRun[] from a DOM node, preserving bold/italic */
  function inlineRuns(node, opts) {
    opts = opts || {};
    var runs = [];
    if (!node || !node.childNodes) return runs;

    for (var i = 0; i < node.childNodes.length; i++) {
      var child = node.childNodes[i];

      if (child.nodeType === 3) { // text
        var text = child.textContent;
        if (text && text.replace(/\s+/g, ' ').trim()) {
          runs.push(new (D().TextRun)({
            text: text.replace(/\s+/g, ' '),
            bold: !!opts.bold,
            italics: !!opts.italics,
            size: opts.size || 22,
            color: opts.color || '333333',
            font: opts.font || FONT
          }));
        }
      } else if (child.nodeType === 1) { // element
        var tag = child.tagName.toLowerCase();

        // Skip unwanted elements
        if (child.classList && child.classList.contains('dictation-btn')) continue;
        if (child.classList && child.classList.contains('snippet-drop-label')) continue;
        if (tag === 'button') continue;

        if (tag === 'strong' || tag === 'b') {
          runs = runs.concat(inlineRuns(child, { bold: true, italics: opts.italics, size: opts.size, color: opts.color, font: opts.font }));
        } else if (tag === 'em' || tag === 'i') {
          runs = runs.concat(inlineRuns(child, { bold: opts.bold, italics: true, size: opts.size, color: opts.color, font: opts.font }));
        } else if (tag === 'br') {
          runs.push(new (D().TextRun)({ break: 1 }));
        } else if (child.classList && child.classList.contains('score-badge')) {
          runs.push(new (D().TextRun)({
            text: child.textContent.trim(),
            bold: true,
            size: opts.size || 22,
            color: '2563EB',
            font: FONT
          }));
        } else {
          runs = runs.concat(inlineRuns(child, opts));
        }
      }
    }
    return runs;
  }

  /** Extract text from a table cell — robust, uses multiple strategies */
  function cellRuns(cellEl, opts) {
    // Strategy 1: try inlineRuns for rich content (bold, badges, etc.)
    var runs = inlineRuns(cellEl, opts);
    if (runs.length > 0) return runs;

    // Strategy 2: use innerText/textContent directly
    var text = (cellEl.innerText || cellEl.textContent || '').replace(/\s+/g, ' ').trim();
    if (text) {
      return [new (D().TextRun)({
        text: text,
        bold: !!opts.bold,
        italics: !!opts.italics,
        size: opts.size || 22,
        color: opts.color || '333333',
        font: opts.font || FONT
      })];
    }
    return [];
  }

  /** Convert an HTML <table> to a nicely styled docx Table */
  function convertTable(tableEl) {
    var d = D();

    // ── Collect rows via children property (most reliable) ──
    var trs = [];
    var thead = tableEl.querySelector('thead');
    var tbody = tableEl.querySelector('tbody');
    var tfoot = tableEl.querySelector('tfoot');

    function collectRows(parent) {
      if (!parent) return;
      for (var i = 0; i < parent.children.length; i++) {
        if (parent.children[i].tagName === 'TR') trs.push(parent.children[i]);
      }
    }

    if (thead || tbody || tfoot) {
      collectRows(thead);
      collectRows(tbody);
      collectRows(tfoot);
    }
    if (trs.length === 0) collectRows(tableEl);
    if (trs.length === 0) {
      var allTrs = tableEl.querySelectorAll('tr');
      for (var ai = 0; ai < allTrs.length; ai++) trs.push(allTrs[ai]);
    }
    if (!trs.length) return null;

    // ── Build rows ──
    var docRows = [];
    var dataRowIdx = 0; // track data rows separately for alternating colours

    for (var r = 0; r < trs.length; r++) {
      // Get cells via children property
      var tds = [];
      for (var ci = 0; ci < trs[r].children.length; ci++) {
        var ch = trs[r].children[ci];
        if (ch.tagName === 'TH' || ch.tagName === 'TD') tds.push(ch);
      }
      if (tds.length === 0) continue;

      var isHeader = tds[0].tagName === 'TH';
      var docCells = [];

      for (var c = 0; c < tds.length; c++) {
        var isThisHeader = tds[c].tagName === 'TH';
        var colspan = parseInt(tds[c].getAttribute('colspan'), 10) || 1;
        var rowspan = parseInt(tds[c].getAttribute('rowspan'), 10) || 1;

        // ── Shading & text colour — ALWAYS explicit ──
        var shading, textColor;
        if (isThisHeader) {
          // Dark navy header with white text
          shading = { fill: '1B3A5C', type: d.ShadingType.SOLID, color: '1B3A5C' };
          textColor = 'FFFFFF';
        } else if (dataRowIdx % 2 === 0) {
          // Alternating: light blue-grey
          shading = { fill: 'EDF1F7', type: d.ShadingType.SOLID, color: 'EDF1F7' };
          textColor = '222222';
        } else {
          // Alternating: white
          shading = { fill: 'FFFFFF', type: d.ShadingType.SOLID, color: 'FFFFFF' };
          textColor = '222222';
        }

        // ── Extract cell text ──
        var runs = cellRuns(tds[c], {
          bold: isThisHeader,
          size: isThisHeader ? 19 : 19,
          color: textColor,
          font: FONT
        });

        docCells.push(new d.TableCell({
          children: [new d.Paragraph({
            children: runs,
            spacing: { before: 40, after: 40 },
            alignment: isThisHeader ? d.AlignmentType.CENTER : undefined
          })],
          columnSpan: colspan > 1 ? colspan : undefined,
          rowSpan: rowspan > 1 ? rowspan : undefined,
          borders: cellBorders(),
          shading: shading,
          verticalAlign: d.VerticalAlign.CENTER
        }));
      }

      docRows.push(new d.TableRow({
        children: docCells,
        tableHeader: isHeader ? true : undefined
      }));

      if (!isHeader) dataRowIdx++;
    }

    if (docRows.length === 0) return null;
    return new d.Table({
      rows: docRows,
      width: { size: 100, type: d.WidthType.PERCENTAGE }
    });
  }

  /** Recursively walk the report DOM and build an array of docx elements */
  function walkNode(node, elements) {
    if (!node) return;
    if (node.nodeType === 3) return;
    if (node.nodeType !== 1) return;

    var d = D();
    var tag = node.tagName.toLowerCase();
    var cls = node.classList || { contains: function () { return false; } };

    // ── Skip elements ──
    if (cls.contains('chart-container')) return;
    if (cls.contains('dictation-btn')) return;
    if (cls.contains('report-header')) return;
    if (cls.contains('report-footer')) return;
    if (cls.contains('snippet-drop-label')) return;
    if (tag === 'button') return;
    if (tag === 'canvas') return;

    // ── Clinician insert → italic clinical notes paragraph ──
    if (cls.contains('clinician-insert')) {
      var ta = node.querySelector('textarea');
      if (ta) {
        var val = ta.value || S.get(ta.getAttribute('data-insert-key')) || '';
        if (val.trim()) {
          elements.push(new d.Paragraph({
            children: [
              new d.TextRun({ text: 'Clinical Notes: ', bold: true, italics: true, size: 20, color: '555555', font: FONT }),
              new d.TextRun({ text: val, italics: true, size: 20, color: '333333', font: FONT })
            ],
            spacing: { before: 80, after: 120 },
            border: {
              left: { style: d.BorderStyle.SINGLE, size: 3, color: '2d5aa0', space: 4 }
            }
          }));
        }
      }
      return;
    }

    // ── Snippet drop zone → only export the actual dropped content ──
    if (cls.contains('snippet-drop-zone') || node.getAttribute('data-snippet-zone') !== null) {
      // Only look at .snippet-drop-content child, ignore the label
      var contentEl = node.querySelector('.snippet-drop-content');
      if (contentEl) {
        var snippetText = (contentEl.textContent || '').trim();
        if (snippetText) {
          // Split on newlines to preserve paragraph breaks from snippet text
          var lines = snippetText.split(/\n/);
          for (var li = 0; li < lines.length; li++) {
            var line = lines[li].trim();
            if (line) {
              elements.push(new d.Paragraph({
                children: [new d.TextRun({ text: line, size: 22, font: FONT, color: '333333' })],
                spacing: { before: li === 0 ? 80 : 40, after: 40 }
              }));
            } else if (li > 0 && li < lines.length - 1) {
              // Blank line between paragraphs — add a spacer
              elements.push(new d.Paragraph({
                children: [],
                spacing: { before: 20, after: 20 }
              }));
            }
          }
          // Separator after the snippet block
          elements.push(new d.Paragraph({ children: [], spacing: { after: 80 } }));
        }
      }
      return;
    }

    // ── Headings — blue text with blue underline rule ──
    var HBLUE = '2080E5';
    if (tag === 'h3') {
      elements.push(new d.Paragraph({
        heading: d.HeadingLevel.HEADING_1,
        children: [new d.TextRun({ text: node.textContent.trim(), font: FONT_HEADING, color: HBLUE, bold: false })],
        spacing: { before: 300, after: 100 },
        border: { bottom: { style: d.BorderStyle.SINGLE, size: 6, color: HBLUE, space: 4 } }
      }));
      return;
    }
    if (tag === 'h4') {
      elements.push(new d.Paragraph({
        heading: d.HeadingLevel.HEADING_2,
        children: [new d.TextRun({ text: node.textContent.trim(), font: FONT_HEADING, color: HBLUE, bold: false })],
        spacing: { before: 240, after: 80 },
        border: { bottom: { style: d.BorderStyle.SINGLE, size: 4, color: HBLUE, space: 3 } }
      }));
      return;
    }
    if (tag === 'h5') {
      elements.push(new d.Paragraph({
        heading: d.HeadingLevel.HEADING_3,
        children: [new d.TextRun({ text: node.textContent.trim(), font: FONT_HEADING, color: '3A8FE8', bold: false })],
        spacing: { before: 200, after: 60 },
        border: { bottom: { style: d.BorderStyle.SINGLE, size: 3, color: '3A8FE8', space: 2 } }
      }));
      return;
    }
    if (tag === 'h6') {
      elements.push(new d.Paragraph({
        heading: d.HeadingLevel.HEADING_4,
        children: [new d.TextRun({ text: node.textContent.trim(), font: FONT_HEADING, color: '4A9AEF', bold: false })],
        spacing: { before: 160, after: 40 }
      }));
      return;
    }

    // ── Paragraphs ──
    if (tag === 'p') {
      var pRuns = inlineRuns(node);
      if (pRuns.length > 0) {
        elements.push(new d.Paragraph({
          children: pRuns,
          spacing: { after: 100 }
        }));
      }
      return;
    }

    // ── Tables ──
    if (tag === 'table') {
      var tbl = convertTable(node);
      if (tbl) {
        elements.push(tbl);
        elements.push(new d.Paragraph({ children: [], spacing: { after: 100 } }));
      }
      return;
    }

    // ── Lists ──
    if (tag === 'ul' || tag === 'ol') {
      var items = node.querySelectorAll(':scope > li');
      for (var li = 0; li < items.length; li++) {
        var liRuns = inlineRuns(items[li]);
        if (liRuns.length > 0) {
          elements.push(new d.Paragraph({
            children: liRuns,
            bullet: { level: 0 },
            spacing: { after: 40 }
          }));
        }
      }
      return;
    }

    // ── Horizontal rule ──
    if (tag === 'hr') {
      elements.push(new d.Paragraph({
        children: [],
        border: { bottom: { style: d.BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
        spacing: { before: 80, after: 80 }
      }));
      return;
    }

    // ── Generic container → recurse children ──
    for (var c = 0; c < node.childNodes.length; c++) {
      walkNode(node.childNodes[c], elements);
    }
  }

  // ═══════════════════════════════════════════
  //  Chart capture
  // ═══════════════════════════════════════════
  var CHART_IDS = [
    { id: 'chart-education', label: 'Education Level' },
    { id: 'chart-gds', label: 'GDS-15 Depressive Items' },
    { id: 'chart-gad7', label: 'GAD-7 Anxiety Profile' },
    { id: 'chart-psqi', label: 'PSQI Sleep Components' },
    { id: 'chart-epworth', label: 'Epworth Sleepiness Scale' },
    { id: 'chart-audit', label: 'AUDIT Alcohol Use' },
    { id: 'chart-casp19', label: 'CASP-19 Quality of Life Domains' },
    { id: 'chart-diet', label: 'Mediterranean Diet Adherence' },
    { id: 'chart-hearing', label: 'Hearing — Affected Situations' },
    { id: 'chart-mbic', label: 'MBI-C Behavioural Domains' },
    { id: 'chart-npiq', label: 'NPI-Q Symptom Severity & Distress' },
    { id: 'chart-stopbang', label: 'STOP-BANG Sleep Apnoea Screen' },
    { id: 'chart-qrisk3', label: 'QRISK3 10-Year CVD Risk' },
    { id: 'chart-cdr', label: 'CDR Domain Ratings' },
    { id: 'chart-rbans', label: 'RBANS Cognitive Index Profile' }
  ];

  // Also try neuroimaging charts dynamically
  function getNeuroChartIds() {
    var ids = [];
    var scans = BHM.State.get('neuroimaging.scans') || [];
    for (var i = 0; i < scans.length; i++) {
      ids.push({ id: 'chart-neuro-' + i, label: 'Neuroimaging — ' + (scans[i].modality || 'Scan ' + (i + 1)) });
    }
    return ids;
  }

  function captureCharts() {
    var allIds = CHART_IDS.concat(getNeuroChartIds());
    var canvasResults = [];
    var domPromises = [];
    for (var i = 0; i < allIds.length; i++) {
      var container = document.getElementById(allIds[i].id);
      if (!container) continue;
      // skip empty containers
      if (!container.innerHTML || container.innerHTML.trim() === '') continue;
      var canvas = container.querySelector('canvas');
      if (canvas) {
        // Canvas-based chart (Chart.js)
        try {
          var canvasId = canvas.id;
          var chartInstance = (BHM.Charts && BHM.Charts._instances) ? BHM.Charts._instances[canvasId] : null;
          var dataUrl;
          if (chartInstance && typeof chartInstance.toBase64Image === 'function') {
            try { dataUrl = chartInstance.toBase64Image('image/png', 1); } catch (e2) { dataUrl = null; }
          }
          if (!dataUrl || dataUrl.length < 200) {
            dataUrl = canvas.toDataURL('image/png');
          }
          if (dataUrl && dataUrl.length > 200) {
            var rect = canvas.getBoundingClientRect();
            var w = rect.width || canvas.offsetWidth || canvas.width;
            var h = rect.height || canvas.offsetHeight || canvas.height;
            canvasResults.push({ id: allIds[i].id, label: allIds[i].label, dataUrl: dataUrl, width: w, height: h });
          }
        } catch (e) {
          console.warn('DocxExport: canvas chart capture failed', allIds[i].id, e);
        }
      } else if (typeof Plotly !== 'undefined' && container.classList.contains('js-plotly-plot')) {
        // Plotly chart — use Plotly.toImage for reliable SVG→PNG capture
        domPromises.push((function (entry, el) {
          var pw = el.offsetWidth || 700;
          var ph = el.offsetHeight || 700;
          return Plotly.toImage(el, { format: 'png', width: pw * 2, height: ph * 2, scale: 1 }).then(function (url) {
            if (url && url.length > 200) {
              return { id: entry.id, label: entry.label, dataUrl: url, width: pw, height: ph };
            }
            return null;
          }).catch(function (err) {
            console.warn('DocxExport: Plotly chart capture failed', entry.id, err);
            return null;
          });
        })(allIds[i], container));
      } else if (typeof html2canvas === 'function') {
        // DOM-based chart — capture using html2canvas
        domPromises.push((function (entry, el) {
          return html2canvas(el, { backgroundColor: null, scale: 2, useCORS: true }).then(function (cvs) {
            var url = cvs.toDataURL('image/png');
            if (url && url.length > 200) {
              return { id: entry.id, label: entry.label, dataUrl: url, width: el.offsetWidth, height: el.offsetHeight };
            }
            return null;
          }).catch(function (err) {
            console.warn('DocxExport: DOM chart capture failed', entry.id, err);
            return null;
          });
        })(allIds[i], container));
      }
    }
    // Return a promise that resolves with all charts
    if (domPromises.length === 0) return Promise.resolve(canvasResults);
    return Promise.all(domPromises).then(function (domResults) {
      for (var j = 0; j < domResults.length; j++) {
        if (domResults[j]) canvasResults.push(domResults[j]);
      }
      return canvasResults;
    });
  }

  function dataUrlToUint8(dataUrl) {
    var base64 = dataUrl.split(',')[1];
    var binary = atob(base64);
    var arr = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
    return arr;
  }

  /** Build graphical summary — simple 2-column table. */
  function buildGraphicalSummary(charts) {
    var d = D();
    var children = [];

    // ═══════════════════════════════════════════════════════════════
    //  A4 PORTRAIT — Table-based Graphical Summary
    // ═══════════════════════════════════════════════════════════════
    //
    //  Layout:
    //   ┌──Col 0──┐ ┌──Col 1──┐ ┌──Col 2──┐ ┌───RBANS───┐
    //   │  Title  │ │  Title  │ │  Title  │ │           │
    //   │  Chart  │ │  Chart  │ │  Chart  │ │  Title    │
    //   ├─────────┤ ├─────────┤ ├─────────┤ │  2:1 v:h  │  ×3 rows
    //   │  …      │ │  …      │ │  …      │ │  chart    │
    //   └─────────┘ └─────────┘ └─────────┘ └───────────┘
    //   ┌───R4-0───┐ ┌───R4-1───┐ ┌───R4-2───┐ ┌───R4-3───┐
    //   │  Title   │ │  Title   │ │  Title   │ │  Title   │  overflow
    //   │  Chart   │ │  Chart   │ │  Chart   │ │  Chart   │
    //   └──────────┘ └──────────┘ └──────────┘ └──────────┘
    //
    //  Tall charts (windroses/radars) → full cell
    //  Short charts (bars/gauges/grids) → two stacked per cell
    // ═══════════════════════════════════════════════════════════════

    // Image sizing: A4 portrait usable width ≈ 495 pt
    // (11906 twip – 2×1000 twip margin = 9906 twip ÷ 20 = 495 pt)
    var PAGE_PT = 495;
    var GROWS = 3;
    var GCOLS = 3;

    // ── Title ──
    children.push(new d.Paragraph({
      heading: d.HeadingLevel.HEADING_1,
      children: [new d.TextRun({ text: 'Graphical Summary', font: FONT_HEADING, color: '2080E5', bold: false })],
      spacing: { after: 150 },
      border: { bottom: { style: d.BorderStyle.SINGLE, size: 6, color: '2080E5', space: 4 } }
    }));

    children.push(new d.Paragraph({
      children: [new d.TextRun({
        text: 'The charts below summarise the assessment scores across each instrument.',
        size: 22, font: FONT, color: '666666', italics: true
      })],
      spacing: { after: 120 }
    }));

    if (charts.length === 0) {
      children.push(new d.Paragraph({
        children: [new d.TextRun({ text: 'No charts available — ensure instruments are scored before exporting.', size: 22, font: FONT })]
      }));
      return children;
    }

    // ── Classify charts ──
    var rbansChart = null;
    var tallCharts = [];    // windroses / radars — full cell
    var shortCharts = [];   // bars, gauges, infographics — stack two per cell
    var TALL_SET = {
      'chart-gad7': 1, 'chart-casp19': 1,
      'chart-mbic': 1, 'chart-npiq': 1, 'chart-cdr': 1
    };

    for (var ci = 0; ci < charts.length; ci++) {
      var ch = charts[ci];
      if (ch.id === 'chart-rbans') { rbansChart = ch; continue; }
      if (TALL_SET[ch.id] || (ch.height && ch.width && ch.height / ch.width >= 0.85)) {
        tallCharts.push(ch);
      } else {
        shortCharts.push(ch);
      }
    }

    // ── Column widths (%) ──
    var hasRbans = !!rbansChart;
    var gridPct = hasRbans ? 22 : 25;       // each grid column
    var rbansPct = hasRbans ? (100 - 3 * gridPct) : 0; // RBANS gets remainder (34%)

    // ── Image dimension helpers ──
    // Full-cell image: fits one chart per cell
    var FULL_MAX_H = 210;    // pt — caps tall charts
    // Stacked image: two short charts in one cell
    var STACK_MAX_H = 95;    // pt — caps each stacked chart

    function chartImage(chart, widthPct, maxH) {
      var imgData = dataUrlToUint8(chart.dataUrl);
      var cellPt = Math.round(PAGE_PT * widthPct / 100);
      var maxW = cellPt - 10;
      var ratio = (chart.height && chart.width) ? (chart.height / chart.width) : 1;
      var imgW = maxW;
      var imgH = Math.round(maxW * ratio);
      if (imgH > maxH) { imgH = maxH; imgW = Math.round(maxH / ratio); }
      return { data: imgData, w: imgW, h: imgH };
    }

    // ── Cell builders ──
    // Zero cell margins for all chart cells
    var CELL_M = { top: 0, bottom: 0, left: 0, right: 0 };

    function titlePara(text) {
      return new d.Paragraph({
        children: [new d.TextRun({ text: text, bold: true, size: 16, font: FONT, color: '1a3c6e' })],
        alignment: d.AlignmentType.CENTER,
        spacing: { before: 0, after: 0 }
      });
    }

    function imagePara(img) {
      return new d.Paragraph({
        children: [new d.ImageRun({ data: img.data, transformation: { width: img.w, height: img.h } })],
        alignment: d.AlignmentType.CENTER,
        spacing: { before: 0, after: 0 }
      });
    }

    // Full cell: one chart with title
    function fullCell(chart, widthPct) {
      var img = chartImage(chart, widthPct, FULL_MAX_H);
      return new d.TableCell({
        children: [titlePara(chart.label), imagePara(img)],
        width: { size: widthPct, type: d.WidthType.PERCENTAGE },
        borders: cellBorders(),
        margins: CELL_M,
        shading: { fill: 'fafbfd', type: d.ShadingType.SOLID, color: 'auto' },
        verticalAlign: d.VerticalAlign.CENTER
      });
    }

    // Stacked cell: two short charts with titles
    function stackedCell(chart1, chart2, widthPct) {
      var cellChildren = [];
      if (chart1) {
        var img1 = chartImage(chart1, widthPct, STACK_MAX_H);
        cellChildren.push(titlePara(chart1.label));
        cellChildren.push(imagePara(img1));
      }
      if (chart2) {
        // Thin separator line
        cellChildren.push(new d.Paragraph({
          children: [],
          spacing: { before: 0, after: 0 },
          border: { bottom: { style: d.BorderStyle.SINGLE, size: 1, color: 'DDDDDD', space: 0 } }
        }));
        var img2 = chartImage(chart2, widthPct, STACK_MAX_H);
        cellChildren.push(titlePara(chart2.label));
        cellChildren.push(imagePara(img2));
      }
      if (cellChildren.length === 0) {
        cellChildren.push(new d.Paragraph({ children: [] }));
      }
      return new d.TableCell({
        children: cellChildren,
        width: { size: widthPct, type: d.WidthType.PERCENTAGE },
        borders: cellBorders(),
        margins: CELL_M,
        shading: { fill: 'fafbfd', type: d.ShadingType.SOLID, color: 'auto' },
        verticalAlign: d.VerticalAlign.TOP
      });
    }

    // Empty cell
    function emptyCell(widthPct) {
      return new d.TableCell({
        children: [new d.Paragraph({ children: [] })],
        width: { size: widthPct, type: d.WidthType.PERCENTAGE },
        margins: CELL_M,
        borders: {
          top: { style: d.BorderStyle.NONE }, bottom: { style: d.BorderStyle.NONE },
          left: { style: d.BorderStyle.NONE }, right: { style: d.BorderStyle.NONE }
        }
      });
    }

    // ── Build cell assignment list for the 3×3 grid ──
    // Each grid slot is either: a tall chart (full cell) or two stacked short charts
    var gridSlots = []; // each: { type:'full', chart } or { type:'stack', c1, c2 }
    var tI = 0, sI = 0;

    // Fill 9 grid slots (3 rows × 3 cols)
    for (var slot = 0; slot < GROWS * GCOLS; slot++) {
      if (tI < tallCharts.length) {
        gridSlots.push({ type: 'full', chart: tallCharts[tI++] });
      } else if (sI < shortCharts.length) {
        var c1 = shortCharts[sI++];
        var c2 = (sI < shortCharts.length) ? shortCharts[sI++] : null;
        gridSlots.push({ type: 'stack', c1: c1, c2: c2 });
      } else {
        gridSlots.push({ type: 'empty' });
      }
    }

    // ── Build main table rows ──
    var mainRows = [];
    for (var row = 0; row < GROWS; row++) {
      var cells = [];

      // 3 grid columns
      for (var col = 0; col < GCOLS; col++) {
        var gs = gridSlots[row * GCOLS + col];
        if (gs.type === 'full') {
          cells.push(fullCell(gs.chart, gridPct));
        } else if (gs.type === 'stack') {
          cells.push(stackedCell(gs.c1, gs.c2, gridPct));
        } else {
          cells.push(emptyCell(gridPct));
        }
      }

      // RBANS column (row 0 = merge start, row 1-2 = continue)
      if (hasRbans) {
        if (row === 0) {
          // RBANS: use natural aspect ratio (now rendered at 1:2 w:h = tall)
          var rbCellPt = Math.round(PAGE_PT * rbansPct / 100);
          var rbMaxW = rbCellPt - 12;
          var rbRatio = (rbansChart.height && rbansChart.width) ? (rbansChart.height / rbansChart.width) : 2;
          var rbImgW = rbMaxW;
          var rbImgH = Math.round(rbImgW * rbRatio);
          // Cap to reasonable page height
          if (rbImgH > 560) { rbImgH = 560; rbImgW = Math.round(560 / rbRatio); }
          var rbData = dataUrlToUint8(rbansChart.dataUrl);

          cells.push(new d.TableCell({
            children: [
              titlePara(rbansChart.label),
              new d.Paragraph({
                children: [new d.ImageRun({ data: rbData, transformation: { width: rbImgW, height: rbImgH } })],
                alignment: d.AlignmentType.CENTER,
                spacing: { before: 0, after: 0 }
              })
            ],
            width: { size: rbansPct, type: d.WidthType.PERCENTAGE },
            borders: cellBorders(),
            margins: CELL_M,
            shading: { fill: 'f0f4fa', type: d.ShadingType.SOLID, color: 'auto' },
            verticalMerge: d.VerticalMergeType.RESTART,
            verticalAlign: d.VerticalAlign.CENTER
          }));
        } else {
          cells.push(new d.TableCell({
            children: [new d.Paragraph({ children: [] })],
            width: { size: rbansPct, type: d.WidthType.PERCENTAGE },
            borders: cellBorders(),
            margins: CELL_M,
            verticalMerge: d.VerticalMergeType.CONTINUE
          }));
        }
      }

      mainRows.push(new d.TableRow({ children: cells }));
    }

    // ── Add main table ──
    children.push(new d.Table({
      rows: mainRows,
      width: { size: 100, type: d.WidthType.PERCENTAGE }
    }));

    // ── Row 4: overflow charts (full-width, 4 equal columns) ──
    var overflow = [];
    while (tI < tallCharts.length) overflow.push(tallCharts[tI++]);
    while (sI < shortCharts.length) overflow.push(shortCharts[sI++]);

    if (overflow.length > 0) {
      children.push(new d.Paragraph({
        children: [],
        spacing: { before: 80, after: 40 }
      }));

      var R4_PCT = 25;
      var overRows = [];
      for (var oi = 0; oi < overflow.length; oi += 4) {
        var overCells = [];
        for (var oj = 0; oj < 4; oj++) {
          var oIdx = oi + oj;
          if (oIdx < overflow.length) {
            overCells.push(fullCell(overflow[oIdx], R4_PCT));
          } else {
            overCells.push(emptyCell(R4_PCT));
          }
        }
        overRows.push(new d.TableRow({ children: overCells }));
      }

      children.push(new d.Table({
        rows: overRows,
        width: { size: 100, type: d.WidthType.PERCENTAGE }
      }));
    }

    return children;
  }

  // ═══════════════════════════════════════════
  //  Build the full document
  // ═══════════════════════════════════════════

  function buildDocument() {
    var d = D();

    var name = pat('name', '[Patient Name]');
    var dob = pat('dob', '[Date of Birth]');
    var nhs = pat('nhsNumber', '');
    var clinician = pat('clinicianName', '');
    var informant = pat('informantName', '');
    var informantRel = pat('informantRelationship', '');
    var dateCompleted = pat('dateOfCompletion', new Date().toLocaleDateString('en-GB'));

    // ── Header: patient name + DOB on every page ──
    var headerChildren = [
      new d.Paragraph({
        children: [
          new d.TextRun({ text: name, bold: true, size: 20, font: FONT }),
          new d.TextRun({ text: '     DOB: ' + dob, size: 18, font: FONT, color: '666666' })
        ],
        alignment: d.AlignmentType.LEFT,
        border: { bottom: { style: d.BorderStyle.SINGLE, size: 2, color: '1a3c6e' } },
        spacing: { after: 80 }
      })
    ];

    // ── Footer: clinic name + page number ──
    var footerChildren = [
      new d.Paragraph({
        children: [
          new d.TextRun({ text: 'Manchester Brain Health Centre', size: 16, font: FONT, color: '666666', italics: true }),
          new d.TextRun({ text: '       Page ', size: 16, font: FONT, color: '999999' }),
          new d.TextRun({ children: [d.PageNumber.CURRENT], size: 16, font: FONT, color: '999999' }),
          new d.TextRun({ text: ' of ', size: 16, font: FONT, color: '999999' }),
          new d.TextRun({ children: [d.PageNumber.TOTAL_PAGES], size: 16, font: FONT, color: '999999' })
        ],
        alignment: d.AlignmentType.CENTER,
        border: { top: { style: d.BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
        spacing: { before: 80 }
      })
    ];

    // ── Title page / demographics block ──
    var titleElements = [];

    titleElements.push(new d.Paragraph({
      children: [new d.TextRun({ text: 'Manchester Brain Health Centre', size: 36, bold: true, color: '2080E5', font: FONT_HEADING })],
      alignment: d.AlignmentType.CENTER,
      spacing: { after: 60 }
    }));

    titleElements.push(new d.Paragraph({
      children: [new d.TextRun({ text: 'Assessment Report', size: 28, color: '5AA0F0', font: FONT_HEADING })],
      alignment: d.AlignmentType.CENTER,
      spacing: { after: 300 }
    }));

    // Demographics table — clean two-column layout
    var sex = pat('sex', '');
    var dobAge = dob;
    var rawDob = BHM.State.get('patient.dob');
    if (rawDob) {
      var bd = new Date(rawDob); var nd = new Date();
      var ageY = nd.getFullYear() - bd.getFullYear();
      var mDiff = nd.getMonth() - bd.getMonth();
      if (mDiff < 0 || (mDiff === 0 && nd.getDate() < bd.getDate())) ageY--;
      dobAge = dob + '  (age ' + ageY + ')';
    }
    var demoRows = [
      ['Patient Name', name],
      ['Date of Birth', dobAge]
    ];
    if (sex) demoRows.push(['Sex', sex]);
    if (nhs) demoRows.push(['EPR Number', nhs]);
    demoRows.push(['Date of Assessment', dateCompleted]);
    if (clinician) demoRows.push(['Clinician', clinician]);
    if (informant) {
      var infText = informant;
      if (informantRel) infText += ' (' + informantRel + ')';
      demoRows.push(['Informant', infText]);
    }

    var demoTableRows = [];
    for (var dr = 0; dr < demoRows.length; dr++) {
      demoTableRows.push(new d.TableRow({
        children: [
          new d.TableCell({
            children: [new d.Paragraph({
              children: [new d.TextRun({ text: demoRows[dr][0], bold: true, size: 21, font: FONT, color: '1a3c6e' })],
              spacing: { before: 50, after: 50 }
            })],
            width: { size: 30, type: d.WidthType.PERCENTAGE },
            shading: { fill: 'eef2f9', type: d.ShadingType.SOLID, color: 'auto' },
            borders: cellBorders(),
            verticalAlign: d.VerticalAlign.CENTER
          }),
          new d.TableCell({
            children: [new d.Paragraph({
              children: [new d.TextRun({ text: demoRows[dr][1], size: 21, font: FONT })],
              spacing: { before: 50, after: 50 }
            })],
            width: { size: 70, type: d.WidthType.PERCENTAGE },
            borders: cellBorders(),
            verticalAlign: d.VerticalAlign.CENTER
          })
        ]
      }));
    }

    titleElements.push(new d.Table({
      rows: demoTableRows,
      width: { size: 100, type: d.WidthType.PERCENTAGE }
    }));

    titleElements.push(new d.Paragraph({ children: [], spacing: { after: 200 } }));

    // ── Diagnosis block ──
    var diagList = S.get('diagnoses') || [];
    if (diagList.length > 0) {
      var DiagMod = BHM.Instruments.Diagnosis;
      var sortedDiag = diagList.slice().sort(function (a, b) { return (b.primary ? 1 : 0) - (a.primary ? 1 : 0); });

      titleElements.push(new d.Paragraph({
        children: [new d.TextRun({ text: 'Diagnosis', bold: false, size: 30, font: FONT_HEADING, color: '2080E5' })],
        spacing: { before: 100, after: 100 },
        border: { bottom: { style: d.BorderStyle.SINGLE, size: 6, color: '2080E5', space: 4 } }
      }));

      for (var di = 0; di < sortedDiag.length; di++) {
        var dEntry = sortedDiag[di];
        var dObj = DiagMod ? DiagMod.findDiagnosis(dEntry.diagnosisId) : null;
        if (!dObj) continue;

        var qualLabel = '';
        if (dEntry.qualifier && DiagMod) {
          for (var qi = 0; qi < DiagMod.QUALIFIERS.length; qi++) {
            if (DiagMod.QUALIFIERS[qi].id === dEntry.qualifier) { qualLabel = DiagMod.QUALIFIERS[qi].label; break; }
          }
        }

        var diagRuns = [
          new d.TextRun({ text: (di + 1) + '. ' + dObj.label, bold: true, size: 22, font: FONT, color: '222222' })
        ];
        if (qualLabel) {
          diagRuns.push(new d.TextRun({ text: ' \u2014 ' + qualLabel, italics: true, size: 22, font: FONT, color: '444444' }));
        }
        if (dEntry.freeText) {
          diagRuns.push(new d.TextRun({ text: ' (' + dEntry.freeText + ')', size: 20, font: FONT, color: '666666' }));
        }
        diagRuns.push(new d.TextRun({ text: '    ICD-10: ' + dObj.icd10 + '  |  SNOMED: ' + dObj.snomed, size: 18, font: FONT, color: '888888' }));
        if (dEntry.primary) {
          diagRuns.push(new d.TextRun({ text: '  [PRIMARY]', bold: true, size: 18, font: FONT, color: 'b45309' }));
        }

        titleElements.push(new d.Paragraph({
          children: diagRuns,
          spacing: { before: 40, after: 40 }
        }));
      }

      titleElements.push(new d.Paragraph({ children: [], spacing: { after: 200 } }));
    }

    // ── Walk the rendered report DOM ──
    var reportContainer = document.querySelector('#reportFullContent .report-full');
    var reportElements = [];

    if (reportContainer) {
      for (var i = 0; i < reportContainer.childNodes.length; i++) {
        walkNode(reportContainer.childNodes[i], reportElements);
      }
    } else {
      reportElements.push(new d.Paragraph({
        children: [new d.TextRun({ text: 'Report content not available — please ensure the Report tab has been viewed before exporting.', size: 22, font: FONT })]
      }));
    }

    // ── Graphical summary (charts — may be async due to html2canvas) ──
    var chartsResult = captureCharts();

    function finishDoc(charts) {
      var summaryElements = buildGraphicalSummary(charts);

      var sharedStyles = {
        default: {
          document: {
            run: { font: FONT, size: 22 }
          },
          heading1: {
            run: { font: FONT_HEADING, size: 30, bold: false, color: '2080E5' },
            paragraph: { spacing: { before: 300, after: 100 } }
          },
          heading2: {
            run: { font: FONT_HEADING, size: 26, bold: false, color: '2080E5' },
            paragraph: { spacing: { before: 240, after: 80 } }
          },
          heading3: {
            run: { font: FONT_HEADING, size: 23, bold: false, color: '3A8FE8' },
            paragraph: { spacing: { before: 200, after: 60 } }
          },
          heading4: {
            run: { font: FONT_HEADING, size: 21, bold: false, color: '4A9AEF' },
            paragraph: { spacing: { before: 160, after: 40 } }
          }
        }
      };

      var sharedHeader = { default: new d.Header({ children: headerChildren }) };
      var sharedFooter = { default: new d.Footer({ children: footerChildren }) };

      var sections = [
        // Section 1: Report content — portrait
        {
          properties: {
            page: {
              margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 }
            }
          },
          headers: sharedHeader,
          footers: sharedFooter,
          children: titleElements.concat(reportElements)
        }
      ];

      // Section 2: Graphical summary — portrait (floating images)
      if (summaryElements.length > 0) {
        sections.push({
          properties: {
            page: {
              margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 }
            }
          },
          headers: sharedHeader,
          footers: sharedFooter,
          children: summaryElements
        });
      }

      return new d.Document({
        creator: 'Manchester Brain Health Centre Assessment App',
        title: 'Assessment Report — ' + name,
        description: 'Generated assessment report',
        styles: sharedStyles,
        sections: sections
      });
    }

    // chartsResult may be a Promise or an array
    if (chartsResult && typeof chartsResult.then === 'function') {
      return chartsResult.then(finishDoc);
    }
    return finishDoc(chartsResult);
  }

  // ═══════════════════════════════════════════
  //  OOXML Font Embedding (post-processing)
  // ═══════════════════════════════════════════

  /**
   * OOXML font obfuscation: XOR first 32 bytes of font data
   * with a GUID converted to 16 bytes (applied twice).
   */
  function obfuscateFont(fontData, guidStr) {
    // guidStr like '{XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}'
    var hex = guidStr.replace(/[{}\-]/g, '');
    // GUID byte order: first 4 bytes LE, next 2 LE, next 2 LE, rest BE
    var byteOrder = [6, 7, 4, 5, 2, 3, 0, 1, 8, 9, 10, 11, 12, 13, 14, 15];
    var guidBytes = new Uint8Array(16);
    for (var i = 0; i < 16; i++) {
      guidBytes[i] = parseInt(hex.substr(byteOrder[i] * 2, 2), 16);
    }
    var result = new Uint8Array(fontData);
    for (var b = 0; b < 32; b++) {
      result[b] = result[b] ^ guidBytes[b % 16];
    }
    return result;
  }

  /** Generate a pseudo-random GUID string */
  function generateGUID() {
    function s4() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); }
    return '{' + s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4() + '}';
  }

  /**
   * Post-process a DOCX blob to embed Gill Sans MT Std fonts.
   * Requires JSZip (global) and BHM_FONTS (base64 font data, inlined by build).
   */
  function embedFonts(docxBlob) {
    var JSZipLib = window.JSZip;
    var fonts = window.BHM_FONTS;
    if (!JSZipLib || !fonts) {
      console.log('DocxExport: font embedding skipped (JSZip or BHM_FONTS not available)');
      return Promise.resolve(docxBlob);
    }

    return JSZipLib.loadAsync(docxBlob).then(function (zip) {
      // Font variants to embed
      var variants = [
        { key: 'book', xmlTag: 'w:embedRegular', fileName: 'font_regular.odttf' },
        { key: 'bold', xmlTag: 'w:embedBold', fileName: 'font_bold.odttf' },
        { key: 'bookItalic', xmlTag: 'w:embedItalic', fileName: 'font_italic.odttf' }
      ];

      var guidMap = {};
      var relsEntries = [];
      var contentTypeEntries = [];
      var rIdBase = 100;  // High rId to avoid conflicts

      for (var v = 0; v < variants.length; v++) {
        var variant = variants[v];
        var b64 = fonts[variant.key];
        if (!b64) continue;

        // Decode base64 to Uint8Array
        var binary = atob(b64);
        var fontData = new Uint8Array(binary.length);
        for (var bi = 0; bi < binary.length; bi++) fontData[bi] = binary.charCodeAt(bi);

        // Generate GUID and obfuscate
        var guid = generateGUID();
        guidMap[variant.key] = guid;
        var obfuscated = obfuscateFont(fontData, guid);

        // Add to zip
        var fontPath = 'word/fonts/' + variant.fileName;
        zip.file(fontPath, obfuscated);

        var rId = 'rId' + (rIdBase + v);
        relsEntries.push({ rId: rId, target: 'fonts/' + variant.fileName, guid: guid, xmlTag: variant.xmlTag });
        contentTypeEntries.push(fontPath);
      }

      if (relsEntries.length === 0) return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

      // ── Update [Content_Types].xml ──
      return zip.file('[Content_Types].xml').async('string').then(function (ct) {
        // Add font content types if not present
        if (ct.indexOf('application/vnd.openxmlformats-officedocument.obfuscatedFont') === -1) {
          for (var ci = 0; ci < contentTypeEntries.length; ci++) {
            var override = '<Override PartName="/' + contentTypeEntries[ci] + '" ContentType="application/vnd.openxmlformats-officedocument.obfuscatedFont"/>';
            ct = ct.replace('</Types>', override + '</Types>');
          }
          zip.file('[Content_Types].xml', ct);
        }

        // ── Update or create word/_rels/fontTable.xml.rels ──
        var relsPath = 'word/_rels/fontTable.xml.rels';
        var relsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
        for (var ri = 0; ri < relsEntries.length; ri++) {
          relsXml += '<Relationship Id="' + relsEntries[ri].rId + '" ' +
            'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/font" ' +
            'Target="' + relsEntries[ri].target + '"/>';
        }
        relsXml += '</Relationships>';
        zip.file(relsPath, relsXml);

        // ── Update word/fontTable.xml to add embed references ──
        return zip.file('word/fontTable.xml').async('string').then(function (ftXml) {
          var fontName = FONT;
          var embedXml = '';
          for (var ei = 0; ei < relsEntries.length; ei++) {
            var e = relsEntries[ei];
            embedXml += '<' + e.xmlTag + ' r:id="' + e.rId + '" w:fontKey="' + e.guid + '"/>';
          }

          var newFontEntry = '<w:font w:name="' + fontName + '">' +
            '<w:charset w:val="00"/>' +
            '<w:family w:val="swiss"/>' +
            '<w:pitch w:val="variable"/>' +
            embedXml +
            '</w:font>';

          // Handle self-closing <w:fonts ... /> (produced by docx.js)
          if (ftXml.indexOf('</w:fonts>') !== -1) {
            // Normal closing tag — insert before it
            ftXml = ftXml.replace('</w:fonts>', newFontEntry + '</w:fonts>');
          } else if (ftXml.indexOf('/>') !== -1) {
            // Self-closing — convert to open/close and insert font entry
            var lastSelfClose = ftXml.lastIndexOf('/>');
            ftXml = ftXml.substring(0, lastSelfClose) + '>' + newFontEntry + '</w:fonts>';
          }

          zip.file('word/fontTable.xml', ftXml);

          return zip.generateAsync({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          });
        });
      });
    });
  }

  // ═══════════════════════════════════════════
  //  Export entry point
  // ═══════════════════════════════════════════

  function exportDocx() {
    var d = D();
    if (!d || !d.Document) {
      alert('Word export library (docx.js) not loaded. Please check your internet connection.');
      return;
    }

    // ── Strategy: ensure report tab is active and stable, then capture ──
    var reportTabEl = document.getElementById('tab-report');
    var isReportActive = reportTabEl && reportTabEl.classList.contains('active');

    function doExport() {
      // Disable Chart.js animations so canvases are fully drawn
      try {
        if (typeof Chart !== 'undefined' && Chart.instances) {
          var instances = Object.values ? Object.values(Chart.instances) : [];
          for (var ci = 0; ci < instances.length; ci++) {
            if (instances[ci] && instances[ci].options) {
              instances[ci].options.animation = false;
              instances[ci].resize();
              instances[ci].update('none');
            }
          }
        }
      } catch (e) {
        console.warn('DocxExport: could not disable chart animations', e);
      }

      // Small extra delay for canvas paint to complete
      setTimeout(function () {
        try {
          var docResult = buildDocument();
          // buildDocument may return a Promise (async chart capture) or a Document
          var docPromise = (docResult && typeof docResult.then === 'function') ? docResult : Promise.resolve(docResult);
          docPromise.then(function (doc) {
            return d.Packer.toBlob(doc);
          }).then(function (blob) {
            return embedFonts(blob);
          }).then(function (finalBlob) {
            var filename = 'MBHC_Report_' + slug() + '_' + ts() + '.docx';
            var url = URL.createObjectURL(finalBlob);
            var a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log('DocxExport: download triggered', filename);
          }).catch(function (err) {
            console.error('BHM DocxExport: packing/embedding failed', err);
            alert('Failed to generate Word document: ' + err.message);
          });
        } catch (err) {
          console.error('BHM DocxExport: build failed', err);
          alert('Failed to build Word document: ' + err.message);
        }
      }, 400);
    }

    if (isReportActive) {
      // Report tab already active — DOM is stable, export immediately
      doExport();
    } else {
      // Need to switch to report tab first, wait for it to fully render
      reportTabEl.addEventListener('shown.bs.tab', function onShown() {
        reportTabEl.removeEventListener('shown.bs.tab', onShown);
        // The shown.bs.tab handler in app.js calls BHM.Report.update()
        // and renders charts. Give it time to complete.
        setTimeout(doExport, 600);
      }, { once: true });
      var bsTab = new bootstrap.Tab(reportTabEl);
      bsTab.show();
    }
  }

  return {
    exportDocx: exportDocx
  };
})();
