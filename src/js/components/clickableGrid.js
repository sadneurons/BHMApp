/* ═══════════════════════════════════════════════════════
   BHM.ClickableGrid — Reusable radio-table grid component
   ═══════════════════════════════════════════════════════
   Renders a table where each row is a question and columns
   are response options. Clicking a cell selects that option.
   Supports keyboard navigation (arrow keys, Enter/Space).
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};

BHM.ClickableGrid = (function () {
  'use strict';

  /**
   * Create a clickable grid table.
   * @param {Object} config
   * @param {string}   config.id          - Unique ID for the grid
   * @param {string}   config.statePath   - Base state path (e.g. 'instruments.gad7')
   * @param {string[]} config.columns     - Column header labels
   * @param {(number|string)[]} config.values - Value for each column
   * @param {Object[]} config.rows        - Array of { key, label, sublabel? }
   * @param {Function} [config.onChange]   - Called after value change (key, value)
   * @returns {HTMLElement} The table element
   */
  function create(config) {
    var table = document.createElement('table');
    table.className = 'clickable-grid';
    table.id = config.id;
    table.setAttribute('role', 'grid');

    // ── Header ──
    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    var th0 = document.createElement('th');
    th0.textContent = '';
    th0.style.minWidth = '200px';
    headerRow.appendChild(th0);
    for (var c = 0; c < config.columns.length; c++) {
      var th = document.createElement('th');
      th.textContent = config.columns[c];
      th.scope = 'col';
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // ── Body ──
    var tbody = document.createElement('tbody');
    for (var r = 0; r < config.rows.length; r++) {
      var row = config.rows[r];
      var tr = document.createElement('tr');
      tr.setAttribute('role', 'row');

      // Label cell
      var tdLabel = document.createElement('td');
      tdLabel.className = 'cg-label';
      tdLabel.innerHTML = row.label + (row.sublabel ? '<br><small class="text-muted">' + row.sublabel + '</small>' : '');
      tr.appendChild(tdLabel);

      // Option cells
      for (var ci = 0; ci < config.values.length; ci++) {
        var td = document.createElement('td');
        td.className = 'cg-cell';
        td.setAttribute('role', 'gridcell');
        td.setAttribute('tabindex', (r === 0 && ci === 0) ? '0' : '-1');
        td.dataset.row = row.key;
        td.dataset.col = ci;
        td.dataset.value = config.values[ci];
        td.textContent = config.columns[ci];

        // Restore from state
        var currentVal = BHM.State.get(config.statePath + '.' + row.key);
        if (currentVal !== undefined && String(currentVal) === String(config.values[ci])) {
          td.classList.add('selected');
        }

        td.addEventListener('click', cellClickHandler(config, row.key, config.values[ci], tr));
        td.addEventListener('keydown', cellKeyHandler(config));

        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    return table;
  }

  function cellClickHandler(config, rowKey, value, tr) {
    return function () {
      // Deselect siblings in same row
      var cells = tr.querySelectorAll('.cg-cell');
      for (var i = 0; i < cells.length; i++) cells[i].classList.remove('selected');
      this.classList.add('selected');
      this.focus();

      BHM.State.set(config.statePath + '.' + rowKey, value);
      if (config.onChange) config.onChange(rowKey, value);
    };
  }

  function cellKeyHandler(config) {
    return function (e) {
      var td = e.target;
      var table = td.closest('table');
      var row = parseInt(td.dataset.col, 10);
      var allRows = table.querySelectorAll('tbody tr');
      var parentTr = td.closest('tr');
      var rowIdx = Array.prototype.indexOf.call(allRows, parentTr);
      var cells = parentTr.querySelectorAll('.cg-cell');
      var colIdx = Array.prototype.indexOf.call(cells, td);
      var target = null;

      switch (e.key) {
        case 'ArrowRight':
          if (colIdx < cells.length - 1) target = cells[colIdx + 1];
          break;
        case 'ArrowLeft':
          if (colIdx > 0) target = cells[colIdx - 1];
          break;
        case 'ArrowDown':
          if (rowIdx < allRows.length - 1) {
            var nextCells = allRows[rowIdx + 1].querySelectorAll('.cg-cell');
            if (nextCells[colIdx]) target = nextCells[colIdx];
          }
          break;
        case 'ArrowUp':
          if (rowIdx > 0) {
            var prevCells = allRows[rowIdx - 1].querySelectorAll('.cg-cell');
            if (prevCells[colIdx]) target = prevCells[colIdx];
          }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          td.click();
          return;
      }

      if (target) {
        e.preventDefault();
        td.setAttribute('tabindex', '-1');
        target.setAttribute('tabindex', '0');
        target.focus();
      }
    };
  }

  /**
   * Create a Yes/No toggle pair.
   * @param {Object} config
   * @param {string} config.statePath - Full state path
   * @param {string} [config.yesLabel='Yes']
   * @param {string} [config.noLabel='No']
   * @param {Function} [config.onChange]
   * @returns {HTMLElement}
   */
  function createYesNo(config) {
    var group = document.createElement('div');
    group.className = 'yn-group';

    var yesBtn = document.createElement('button');
    yesBtn.type = 'button';
    yesBtn.className = 'yn-btn';
    yesBtn.textContent = config.yesLabel || 'Yes';
    yesBtn.dataset.value = 'yes';

    var noBtn = document.createElement('button');
    noBtn.type = 'button';
    noBtn.className = 'yn-btn';
    noBtn.textContent = config.noLabel || 'No';
    noBtn.dataset.value = 'no';

    // Restore state
    var current = BHM.State.get(config.statePath);
    if (current === 'yes' || current === true) yesBtn.classList.add('selected-yes');
    if (current === 'no' || current === false) noBtn.classList.add('selected-no');

    yesBtn.addEventListener('click', function () {
      noBtn.classList.remove('selected-no');
      yesBtn.classList.add('selected-yes');
      BHM.State.set(config.statePath, 'yes');
      if (config.onChange) config.onChange('yes');
    });
    noBtn.addEventListener('click', function () {
      yesBtn.classList.remove('selected-yes');
      noBtn.classList.add('selected-no');
      BHM.State.set(config.statePath, 'no');
      if (config.onChange) config.onChange('no');
    });

    group.appendChild(yesBtn);
    group.appendChild(noBtn);
    return group;
  }

  /**
   * Helper: create a labelled text/number input bound to state.
   */
  function createField(config) {
    var div = document.createElement('div');
    div.className = 'bhm-field-group';
    if (config.colClass) div.classList.add(config.colClass);

    var label = document.createElement('label');
    label.textContent = config.label;
    label.htmlFor = config.id || config.statePath;
    div.appendChild(label);

    var input;
    if (config.type === 'textarea') {
      input = document.createElement('textarea');
      input.rows = config.rows || 3;
    } else if (config.type === 'select') {
      input = document.createElement('select');
      input.className = 'form-select';
      if (config.options) {
        var blank = document.createElement('option');
        blank.value = '';
        blank.textContent = config.placeholder || '-- Select --';
        input.appendChild(blank);
        for (var i = 0; i < config.options.length; i++) {
          var opt = document.createElement('option');
          opt.value = config.options[i].value !== undefined ? config.options[i].value : config.options[i];
          opt.textContent = config.options[i].label || config.options[i];
          input.appendChild(opt);
        }
      }
    } else {
      input = document.createElement('input');
      input.type = config.type || 'text';
      if (config.min !== undefined) input.min = config.min;
      if (config.max !== undefined) input.max = config.max;
      if (config.step !== undefined) input.step = config.step;
    }

    if (input.tagName !== 'SELECT') input.className = 'form-control';
    input.id = config.id || config.statePath;
    if (config.placeholder) input.placeholder = config.placeholder;

    // Restore state
    var current = BHM.State.get(config.statePath);
    if (current !== undefined && current !== null) input.value = current;

    input.addEventListener('change', function () {
      BHM.State.set(config.statePath, this.value);
      if (config.onChange) config.onChange(this.value);
    });
    if (config.type !== 'select') {
      input.addEventListener('input', function () {
        BHM.State.set(config.statePath, this.value);
        if (config.onChange) config.onChange(this.value);
      });
    }

    div.appendChild(input);

    if (config.helpText) {
      var help = document.createElement('div');
      help.className = 'form-text';
      help.textContent = config.helpText;
      div.appendChild(help);
    }

    return div;
  }

  /**
   * Helper: compute completeness for a grid.
   * @param {string} statePath - Base path
   * @param {string[]} keys - Expected row keys
   * @returns {{ completed: number, total: number, pct: number }}
   */
  function completeness(statePath, keys) {
    var completed = 0;
    for (var i = 0; i < keys.length; i++) {
      var val = BHM.State.get(statePath + '.' + keys[i]);
      if (val !== undefined && val !== null && val !== '') completed++;
    }
    return {
      completed: completed,
      total: keys.length,
      pct: keys.length > 0 ? Math.round((completed / keys.length) * 100) : 0
    };
  }

  /**
   * Helper: render a completeness bar element.
   */
  function completenessBar(statePath, keys) {
    var c = completeness(statePath, keys);
    var wrapper = document.createElement('div');

    var text = document.createElement('div');
    text.className = 'completeness-text';
    text.textContent = c.completed + ' of ' + c.total + ' completed (' + c.pct + '%)';

    var bar = document.createElement('div');
    bar.className = 'completeness-bar';
    var fill = document.createElement('div');
    fill.className = 'fill';
    fill.style.width = c.pct + '%';
    bar.appendChild(fill);

    wrapper.appendChild(text);
    wrapper.appendChild(bar);
    wrapper.dataset.statePath = statePath;
    wrapper.dataset.keys = keys.join(',');
    wrapper.className = 'mb-2';
    return wrapper;
  }

  return {
    create: create,
    createYesNo: createYesNo,
    createField: createField,
    completeness: completeness,
    completenessBar: completenessBar
  };
})();
