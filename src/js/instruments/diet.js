/* ═══════════════════════════════════════════════════════
   BHM.Instruments.Diet — MEDITERRANEAN DIET SCORE TOOL
   Exact wording from Pre-Assessment Booklet pages 5-6.
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};
BHM.Instruments = BHM.Instruments || {};

BHM.Instruments.Diet = (function () {
  'use strict';

  var SP = 'instruments.diet';
  var F = BHM.ClickableGrid;

  // Items — exact wording from booklet (Question column)
  var ITEMS = [
    { key: 'md1',  label: '1. Is olive oil the main culinary fat used?' },
    { key: 'md2',  label: '2. Are \u2265 4 tablespoons of olive oil used each day?' },
    { key: 'md3',  label: '3. Are \u2265 2 servings (of 200g each) of vegetables eaten each day?' },
    { key: 'md4',  label: '4. Are \u2265 3 servings of fruit (of 80g each) eaten each day?' },
    { key: 'md5',  label: '5. Is < 1 serving (100-150g) of red meat/ hamburgers/ other meat products eaten each day?' },
    { key: 'md6',  label: '6. Is < 1 serving (12g) of butter, margarine or cream eaten each day?' },
    { key: 'md7',  label: '7. Is < 1 serving (330ml) of sweet or sugar sweetened carbonated beverages consumed each day?' },
    { key: 'md8',  label: '8. Are \u2265 3 glasses (of 125ml) of wine consumed each week?' },
    { key: 'md9',  label: '9. Are \u2265 3 servings (of 150g) of legumes consumed each week?' },
    { key: 'md10', label: '10. Are \u2265 3 servings of fish (100-150g) or seafood (200g) eaten each week?' },
    { key: 'md11', label: '11. Is < 3 servings of commercial sweets/pastries eaten each week?' },
    { key: 'md12', label: '12. Is \u2265 1 serving (of 30g) of nuts consumed each week?' },
    { key: 'md13', label: '13. Is chicken, turkey or rabbit routinely eaten instead of veal, pork, hamburger or sausage?' },
    { key: 'md14', label: '14. Are pasta, vegetable or rice dishes flavoured with garlic, tomato, leek or onion eaten \u2265 twice a week?' }
  ];

  function render(container) {
    container.innerHTML = '';

    var card = document.createElement('div');
    card.className = 'instrument-card';

    // Title — exact from booklet (all caps) + version line
    card.innerHTML =
      '<p style="font-size:0.75rem; color:#6c757d; margin-bottom:0.25rem;">26.09.13 Version 1 Alison Hornby, Katherine Paterson</p>' +
      '<h5 style="text-transform:uppercase; letter-spacing:0.5px;">Mediterranean Diet Score Tool</h5>';

    // Introductory paragraphs — exact from booklet
    var intro = document.createElement('div');
    intro.className = 'instrument-subtitle';
    intro.style.fontSize = '0.82rem';
    intro.innerHTML =
      '<p>A Mediterranean dietary pattern (\u2018Med diet\u2019) is typically one based on whole or minimally processed foods. ' +
      'It\u2019s rich in protective foods (fruits, vegetables, legumes, wholegrains, fish and olive oil) and low in adverse dietary ' +
      'factors (fast food, sugar-sweetened beverages, refined grain products and processed or energy-dense foods) with moderate ' +
      'red meat and alcohol intake.</p>' +
      '<p>Evidence shows overall dietary pattern (reflected in TOTAL SCORE) as well as individual components reflect risk; a higher ' +
      'score is associated with lower risk of CVD and all-cause mortality (BMJ 2008;337:a1344). During rehabilitation patient scores ' +
      'should ideally rise in response to dietary advice and support.</p>' +
      '<p>This tool can be used by health professionals with appropriate nutritional knowledge and competencies, such as Registered ' +
      'Dietitians (NICE, 2007, 2013). It can be used as both an audit tool and as part of a dietary assessment at baseline, end of ' +
      'programme and 1 year follow-up, along with assessment and advice for weight management, salt intake and eating behaviours. ' +
      'For information on complete requirements for dietary assessments and advice, please refer to the latest NICE/Joint British ' +
      'Societies guidelines (BACPR, 2012. The BACPR Standards and Core Components for Cardiovascular Disease Prevention and ' +
      'Rehabilitation, 2nd Ed.).</p>';
    card.appendChild(intro);

    // Score summary
    var summary = document.createElement('div');
    summary.className = 'score-summary';
    summary.innerHTML = '<span class="score-label">TOTAL SCORE (total no. of \u2018yes\u2019 answers):</span>' +
      '<span class="score-value" id="diet-total">--</span>' +
      '<span class="score-interp" id="diet-interp">out of 14</span>';
    card.appendChild(summary);

    // Build table matching booklet: Question | Yes | No
    var grid = F.create({
      id: 'diet-grid',
      statePath: SP,
      columns: ['Yes', 'No'],
      values: ['yes', 'no'],
      rows: ITEMS.map(function (item) {
        return { key: item.key, label: item.label };
      }),
      onChange: recalc
    });
    card.appendChild(grid);

    // Total row label — exact from booklet
    var totalDiv = document.createElement('div');
    totalDiv.className = 'score-summary mt-2';
    totalDiv.innerHTML =
      '<span class="score-label">TOTAL SCORE (total no. of \u2018yes\u2019 answers):</span>' +
      '<span class="score-value" id="diet-total-bottom">--</span>';
    card.appendChild(totalDiv);

    var keys = ITEMS.map(function (i) { return i.key; });
    card.appendChild(F.completenessBar(SP, keys));

    container.appendChild(card);
    recalc();
  }

  function recalc() {
    if (BHM.Scoring && BHM.Scoring.diet) BHM.Scoring.diet();

    // Also update bottom total
    var total = 0, answered = 0;
    for (var i = 1; i <= 14; i++) {
      var val = BHM.State.get(SP + '.md' + i);
      if (val === 'yes') { total++; answered++; }
      else if (val === 'no') { answered++; }
    }
    var el = document.getElementById('diet-total-bottom');
    if (el) el.textContent = answered > 0 ? total : '--';
  }

  return { render: render };
})();
