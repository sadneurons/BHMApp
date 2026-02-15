/* ═══════════════════════════════════════════════════════
   BHM.Snippets — Boilerplate text snippet library
   Hybrid: hardcoded defaults (from build) + localStorage overrides
   Drag-and-drop from side panel into report drop zones
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};

/* Default snippets are inlined at build time as BHM_DEFAULT_SNIPPETS.
   During dev (served from src/), fall back to an empty array. */
var BHM_DEFAULT_SNIPPETS = (typeof BHM_DEFAULT_SNIPPETS !== 'undefined') ? BHM_DEFAULT_SNIPPETS : [];

BHM.Snippets = (function () {
  'use strict';

  var LS_KEY = 'bhm_snippets_v1';
  var _snippets = [];  // current working set

  // ── Initialise ──
  function init() {
    var stored = null;
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) stored = JSON.parse(raw);
    } catch (e) { /* ignore */ }

    if (stored && Array.isArray(stored) && stored.length > 0) {
      _snippets = stored;
    } else {
      _snippets = JSON.parse(JSON.stringify(BHM_DEFAULT_SNIPPETS));
    }
  }

  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(_snippets)); } catch (e) { /* ignore */ }
  }

  // ── CRUD ──
  function getAll() { return _snippets; }

  function getById(id) {
    for (var i = 0; i < _snippets.length; i++) {
      if (_snippets[i].id === id) return _snippets[i];
    }
    return null;
  }

  function getCategories() {
    var cats = {};
    for (var i = 0; i < _snippets.length; i++) {
      var c = _snippets[i].category || 'Uncategorised';
      if (!cats[c]) cats[c] = [];
      cats[c].push(_snippets[i]);
    }
    return cats;
  }

  function add(snippet) {
    if (!snippet.id) snippet.id = 'snip_' + Date.now();
    _snippets.push(snippet);
    save();
  }

  function update(id, fields) {
    var s = getById(id);
    if (!s) return;
    for (var k in fields) { if (fields.hasOwnProperty(k)) s[k] = fields[k]; }
    save();
  }

  function remove(id) {
    _snippets = _snippets.filter(function (s) { return s.id !== id; });
    save();
  }

  function resetToDefaults() {
    _snippets = JSON.parse(JSON.stringify(BHM_DEFAULT_SNIPPETS));
    save();
  }

  // ── Import / Export ──
  function exportJSON() {
    var blob = new Blob([JSON.stringify(_snippets, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'bhm-snippets.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(file, cb) {
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          _snippets = data;
          save();
          if (cb) cb(null, _snippets.length);
        } else {
          if (cb) cb('File does not contain a valid snippet array.');
        }
      } catch (err) {
        if (cb) cb('Invalid JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  // ═══════════════════════════════════════════
  //  SNIPPET PANEL (left side of Report tab)
  // ═══════════════════════════════════════════
  function renderPanel(container) {
    container.innerHTML = '';

    // Header
    var hdr = document.createElement('div');
    hdr.className = 'snippet-panel-header';
    hdr.innerHTML = '<h6 class="mb-0"><i class="bi bi-bookmarks me-1"></i>Snippets</h6>';
    container.appendChild(hdr);

    // Search box
    var search = document.createElement('input');
    search.type = 'text';
    search.className = 'form-control form-control-sm snippet-search';
    search.placeholder = 'Filter snippets\u2026';
    search.addEventListener('input', function () {
      filterSnippetList(container, search.value);
    });
    container.appendChild(search);

    // Snippet list (grouped by category)
    var listWrap = document.createElement('div');
    listWrap.className = 'snippet-list';
    renderSnippetList(listWrap, '');
    container.appendChild(listWrap);

    // Footer actions
    var footer = document.createElement('div');
    footer.className = 'snippet-panel-footer';

    var manageBtn = document.createElement('button');
    manageBtn.className = 'btn btn-outline-secondary btn-sm w-100 mb-1';
    manageBtn.innerHTML = '<i class="bi bi-gear me-1"></i>Manage Snippets';
    manageBtn.addEventListener('click', function () { openManager(); });
    footer.appendChild(manageBtn);

    container.appendChild(footer);
  }

  function renderSnippetList(container, filter) {
    container.innerHTML = '';
    var cats = getCategories();
    var filterLower = (filter || '').toLowerCase();
    var anyVisible = false;

    for (var cat in cats) {
      if (!cats.hasOwnProperty(cat)) continue;
      var items = cats[cat];
      var filtered = items.filter(function (s) {
        if (!filterLower) return true;
        return s.title.toLowerCase().indexOf(filterLower) >= 0 ||
               s.text.toLowerCase().indexOf(filterLower) >= 0 ||
               cat.toLowerCase().indexOf(filterLower) >= 0;
      });
      if (filtered.length === 0) continue;
      anyVisible = true;

      var catHeader = document.createElement('div');
      catHeader.className = 'snippet-cat-header';
      catHeader.textContent = cat;
      container.appendChild(catHeader);

      for (var i = 0; i < filtered.length; i++) {
        container.appendChild(createSnippetCard(filtered[i]));
      }
    }

    if (!anyVisible) {
      var empty = document.createElement('div');
      empty.className = 'text-muted text-center p-3';
      empty.style.fontSize = '0.82rem';
      empty.textContent = filter ? 'No matching snippets.' : 'No snippets yet.';
      container.appendChild(empty);
    }
  }

  function filterSnippetList(panel, filter) {
    var listWrap = panel.querySelector('.snippet-list');
    if (listWrap) renderSnippetList(listWrap, filter);
  }

  function createSnippetCard(snippet) {
    var card = document.createElement('div');
    card.className = 'snippet-card';
    card.draggable = true;
    card.title = 'Drag into a report drop zone';
    card.setAttribute('data-snippet-id', snippet.id);

    var title = document.createElement('div');
    title.className = 'snippet-card-title';
    title.innerHTML = '<i class="bi bi-grip-vertical me-1 text-muted"></i>' + esc(snippet.title);
    card.appendChild(title);

    var preview = document.createElement('div');
    preview.className = 'snippet-card-preview';
    preview.textContent = snippet.text.length > 80 ? snippet.text.substring(0, 80) + '\u2026' : snippet.text;
    card.appendChild(preview);

    // Drag start
    card.addEventListener('dragstart', function (e) {
      e.dataTransfer.setData('text/plain', snippet.text);
      e.dataTransfer.setData('application/x-bhm-snippet', snippet.id);
      e.dataTransfer.effectAllowed = 'copy';
      card.classList.add('dragging');
      // Highlight all drop zones
      var zones = document.querySelectorAll('.snippet-drop-zone');
      for (var z = 0; z < zones.length; z++) zones[z].classList.add('drop-ready');
    });

    card.addEventListener('dragend', function () {
      card.classList.remove('dragging');
      var zones = document.querySelectorAll('.snippet-drop-zone');
      for (var z = 0; z < zones.length; z++) zones[z].classList.remove('drop-ready', 'drop-hover');
    });

    return card;
  }

  // ═══════════════════════════════════════════
  //  DROP ZONES (in report sections)
  // ═══════════════════════════════════════════
  function createDropZone(sectionKey) {
    var statePath = 'snippetInserts.' + sectionKey;
    var existing = BHM.State.get(statePath) || '';

    var zone = document.createElement('div');
    zone.className = 'snippet-drop-zone' + (existing ? ' has-content' : '');
    zone.setAttribute('data-snippet-section', sectionKey);

    // Label row
    var label = document.createElement('div');
    label.className = 'snippet-drop-label';
    if (!existing) {
      label.innerHTML = '<i class="bi bi-tag me-1"></i>Patient information — drag a snippet here';
    } else {
      label.innerHTML = '<i class="bi bi-tag-fill me-1"></i>Patient information';
      var clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'btn btn-sm btn-link text-danger p-0 ms-2';
      clearBtn.style.fontSize = '0.75rem';
      clearBtn.innerHTML = '<i class="bi bi-x-circle"></i> clear';
      clearBtn.addEventListener('click', function () {
        BHM.State.set(statePath, '');
        // Re-render the report to update the zone
        if (BHM.Report && BHM.Report.update) BHM.Report.update();
      });
      label.appendChild(clearBtn);
    }
    zone.appendChild(label);

    // Content area (shows dropped text)
    if (existing) {
      var content = document.createElement('div');
      content.className = 'snippet-drop-content';
      content.textContent = existing;
      zone.appendChild(content);
    }

    // Drop handlers
    zone.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      zone.classList.add('drop-hover');
    });

    zone.addEventListener('dragleave', function () {
      zone.classList.remove('drop-hover');
    });

    zone.addEventListener('drop', function (e) {
      e.preventDefault();
      zone.classList.remove('drop-hover');
      var text = e.dataTransfer.getData('text/plain');
      if (text) {
        // Append if there's already content
        var cur = BHM.State.get(statePath) || '';
        var newVal = cur ? cur + '\n\n' + text : text;
        BHM.State.set(statePath, newVal);
        if (BHM.Report && BHM.Report.update) BHM.Report.update();
      }
    });

    return zone;
  }

  // ═══════════════════════════════════════════
  //  SNIPPET MANAGER (modal)
  // ═══════════════════════════════════════════
  function openManager() {
    // Remove existing modal if any
    var old = document.getElementById('snippetManagerModal');
    if (old) old.remove();

    var modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'snippetManagerModal';
    modal.setAttribute('tabindex', '-1');
    modal.innerHTML =
      '<div class="modal-dialog modal-lg modal-dialog-scrollable">' +
        '<div class="modal-content">' +
          '<div class="modal-header">' +
            '<h5 class="modal-title"><i class="bi bi-bookmarks me-2"></i>Manage Snippets</h5>' +
            '<button type="button" class="btn-close" data-bs-dismiss="modal"></button>' +
          '</div>' +
          '<div class="modal-body" id="snippetManagerBody"></div>' +
          '<div class="modal-footer">' +
            '<button type="button" class="btn btn-outline-secondary btn-sm" id="snippetExportBtn"><i class="bi bi-download me-1"></i>Export</button>' +
            '<label class="btn btn-outline-secondary btn-sm mb-0"><i class="bi bi-upload me-1"></i>Import<input type="file" accept=".json" id="snippetImportInput" style="display:none"></label>' +
            '<button type="button" class="btn btn-outline-warning btn-sm" id="snippetResetBtn"><i class="bi bi-arrow-counterclockwise me-1"></i>Reset to Defaults</button>' +
            '<button type="button" class="btn btn-primary btn-sm" id="snippetAddBtn"><i class="bi bi-plus-circle me-1"></i>Add Snippet</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);
    renderManagerList();

    // Bind footer actions
    document.getElementById('snippetExportBtn').addEventListener('click', exportJSON);
    document.getElementById('snippetImportInput').addEventListener('change', function () {
      if (this.files[0]) {
        importJSON(this.files[0], function (err, count) {
          if (err) { alert(err); return; }
          alert('Imported ' + count + ' snippets.');
          renderManagerList();
          refreshPanelIfVisible();
        });
      }
    });
    document.getElementById('snippetResetBtn').addEventListener('click', function () {
      if (confirm('Reset all snippets to the built-in defaults? Any custom snippets will be lost.')) {
        resetToDefaults();
        renderManagerList();
        refreshPanelIfVisible();
      }
    });
    document.getElementById('snippetAddBtn').addEventListener('click', function () {
      add({ title: 'New Snippet', category: 'Uncategorised', text: '' });
      renderManagerList();
      refreshPanelIfVisible();
      // Scroll to bottom to show new item
      var body = document.getElementById('snippetManagerBody');
      if (body) body.scrollTop = body.scrollHeight;
    });

    var bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    modal.addEventListener('hidden.bs.modal', function () {
      modal.remove();
      refreshPanelIfVisible();
    });
  }

  function renderManagerList() {
    var body = document.getElementById('snippetManagerBody');
    if (!body) return;
    body.innerHTML = '';

    var snippets = getAll();
    if (snippets.length === 0) {
      body.innerHTML = '<p class="text-muted text-center">No snippets. Click "Add Snippet" or "Reset to Defaults".</p>';
      return;
    }

    for (var i = 0; i < snippets.length; i++) {
      body.appendChild(createManagerItem(snippets[i]));
    }
  }

  function createManagerItem(snippet) {
    var item = document.createElement('div');
    item.className = 'card mb-2';
    item.innerHTML =
      '<div class="card-body p-2">' +
        '<div class="row g-2 mb-1">' +
          '<div class="col-md-5"><input type="text" class="form-control form-control-sm" data-field="title" value="' + escAttr(snippet.title) + '" placeholder="Title"></div>' +
          '<div class="col-md-4"><input type="text" class="form-control form-control-sm" data-field="category" value="' + escAttr(snippet.category || '') + '" placeholder="Category"></div>' +
          '<div class="col-md-3 text-end"><button type="button" class="btn btn-outline-danger btn-sm" data-action="delete"><i class="bi bi-trash me-1"></i>Delete</button></div>' +
        '</div>' +
        '<textarea class="form-control form-control-sm" data-field="text" rows="3" placeholder="Snippet text\u2026">' + esc(snippet.text) + '</textarea>' +
      '</div>';

    // Bind changes
    var inputs = item.querySelectorAll('[data-field]');
    for (var j = 0; j < inputs.length; j++) {
      (function (inp) {
        inp.addEventListener('input', function () {
          var fields = {};
          fields[inp.getAttribute('data-field')] = inp.value;
          update(snippet.id, fields);
        });
      })(inputs[j]);
    }

    // Delete
    item.querySelector('[data-action="delete"]').addEventListener('click', function () {
      if (confirm('Delete "' + snippet.title + '"?')) {
        remove(snippet.id);
        renderManagerList();
        refreshPanelIfVisible();
      }
    });

    return item;
  }

  function refreshPanelIfVisible() {
    var panel = document.getElementById('snippetPanel');
    if (panel) renderPanel(panel);
  }

  // ── Helpers ──
  function esc(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
  function escAttr(str) {
    return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  return {
    init: init,
    getAll: getAll,
    getById: getById,
    getCategories: getCategories,
    add: add,
    update: update,
    remove: remove,
    resetToDefaults: resetToDefaults,
    exportJSON: exportJSON,
    importJSON: importJSON,
    renderPanel: renderPanel,
    createDropZone: createDropZone,
    openManager: openManager
  };
})();
