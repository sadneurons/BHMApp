/* ═══════════════════════════════════════════════════════
   BHM.Themes — Theme picker (Bootstrap + Bootswatch + Dracula)
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};

BHM.Themes = (function () {
  'use strict';

  var BOOTSTRAP_CDN = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
  var BOOTSWATCH_CDN = 'https://cdn.jsdelivr.net/npm/bootswatch@5.3.3/dist/';

  var THEMES = [
    // ── Core ──
    { id: 'default',    name: 'Default',    group: 'Core',  dark: false, css: BOOTSTRAP_CDN },
    { id: 'dark',       name: 'Dark',       group: 'Core',  dark: true,  css: BOOTSTRAP_CDN },
    { id: 'dracula',    name: 'Dracula',    group: 'Core',  dark: true,  css: BOOTSTRAP_CDN },
    // ── Light themes (Bootswatch) ──
    { id: 'cosmo',      name: 'Cosmo',      group: 'Light', dark: false, css: BOOTSWATCH_CDN + 'cosmo/bootstrap.min.css' },
    { id: 'flatly',     name: 'Flatly',     group: 'Light', dark: false, css: BOOTSWATCH_CDN + 'flatly/bootstrap.min.css' },
    { id: 'journal',    name: 'Journal',    group: 'Light', dark: false, css: BOOTSWATCH_CDN + 'journal/bootstrap.min.css' },
    { id: 'lux',        name: 'Lux',        group: 'Light', dark: false, css: BOOTSWATCH_CDN + 'lux/bootstrap.min.css' },
    { id: 'minty',      name: 'Minty',      group: 'Light', dark: false, css: BOOTSWATCH_CDN + 'minty/bootstrap.min.css' },
    // ── Dark themes (Bootswatch) ──
    { id: 'cyborg',     name: 'Cyborg',     group: 'Dark',  dark: true,  css: BOOTSWATCH_CDN + 'cyborg/bootstrap.min.css' },
    { id: 'slate',      name: 'Slate',      group: 'Dark',  dark: true,  css: BOOTSWATCH_CDN + 'slate/bootstrap.min.css' },
    { id: 'solar',      name: 'Solar',      group: 'Dark',  dark: true,  css: BOOTSWATCH_CDN + 'solar/bootstrap.min.css' },
    { id: 'superhero',  name: 'Superhero',  group: 'Dark',  dark: true,  css: BOOTSWATCH_CDN + 'superhero/bootstrap.min.css' },
    { id: 'vapor',      name: 'Vapor',      group: 'Dark',  dark: true,  css: BOOTSWATCH_CDN + 'vapor/bootstrap.min.css' }
  ];

  var _current = localStorage.getItem('bhm-theme') || 'default';

  function getTheme(id) {
    for (var i = 0; i < THEMES.length; i++) {
      if (THEMES[i].id === id) return THEMES[i];
    }
    return THEMES[0]; // fallback to default
  }

  function apply(themeId) {
    var theme = getTheme(themeId);
    _current = theme.id;
    localStorage.setItem('bhm-theme', theme.id);

    // Swap CSS (remove SRI hash — Bootswatch themes have different hashes)
    var link = document.getElementById('bootstrapCSS');
    if (link) { link.removeAttribute('integrity'); link.href = theme.css; }

    // Dark mode attribute
    if (theme.dark) {
      document.documentElement.setAttribute('data-bs-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-bs-theme');
    }

    // Dracula custom attribute
    if (theme.id === 'dracula') {
      document.documentElement.setAttribute('data-bhm-theme', 'dracula');
    } else {
      document.documentElement.removeAttribute('data-bhm-theme');
    }

    // Update label
    var label = document.getElementById('currentThemeLabel');
    if (label) label.textContent = theme.name;

    // Re-render menu to show active state
    renderMenu();
  }

  function renderMenu() {
    var menu = document.getElementById('themeMenu');
    if (!menu) return;
    menu.innerHTML = '';

    var lastGroup = '';
    for (var i = 0; i < THEMES.length; i++) {
      var t = THEMES[i];

      // Group divider
      if (t.group !== lastGroup) {
        if (lastGroup !== '') {
          var divider = document.createElement('li');
          divider.innerHTML = '<hr class="dropdown-divider">';
          menu.appendChild(divider);
        }
        var header = document.createElement('li');
        header.innerHTML = '<h6 class="dropdown-header">' + t.group + ' Themes</h6>';
        menu.appendChild(header);
        lastGroup = t.group;
      }

      var li = document.createElement('li');
      var a = document.createElement('a');
      a.className = 'dropdown-item d-flex align-items-center' + (t.id === _current ? ' active' : '');
      a.href = '#';
      a.setAttribute('data-theme', t.id);

      // Icon: moon for dark, sun for light, active checkmark
      var icon = t.dark ? 'bi-moon-fill' : 'bi-sun';
      if (t.id === 'dracula') icon = 'bi-brush';
      a.innerHTML = '<i class="bi ' + icon + ' me-2"></i>' + t.name +
        (t.id === _current ? '<i class="bi bi-check2 ms-auto"></i>' : '');

      (function (id) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          apply(id);
        });
      })(t.id);

      li.appendChild(a);
      menu.appendChild(li);
    }
  }

  function init() {
    // Apply current theme (early script handles CSS, this handles DOM elements)
    var theme = getTheme(_current);
    var label = document.getElementById('currentThemeLabel');
    if (label) label.textContent = theme.name;
    renderMenu();
  }

  return {
    init: init,
    apply: apply,
    current: function () { return _current; }
  };
})();
