/* ═══════════════════════════════════════════════════════
   BHM.Scoring — All instrument scoring engines
   ═══════════════════════════════════════════════════════ */
var BHM = window.BHM || {};

BHM.Scoring = (function () {
  'use strict';

  var S = BHM.State;

  // ── Helper: sum numeric values from state ──
  function sumKeys(basePath, keys) {
    var total = 0, count = 0;
    for (var i = 0; i < keys.length; i++) {
      var val = S.get(basePath + '.' + keys[i]);
      if (val !== undefined && val !== null && val !== '') {
        total += Number(val);
        count++;
      }
    }
    return { total: total, answered: count, expected: keys.length };
  }

  function updateElement(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ═══════════════════════════════════════════
  // PSQI — Pittsburgh Sleep Quality Index
  // ═══════════════════════════════════════════
  function psqi() {
    var SP = 'instruments.psqi';
    var d = S.getSession().instruments.psqi || {};

    // Parse helper for time
    function parseTime(str) {
      if (!str) return null;
      str = str.trim().toLowerCase();
      // Handle "2230", "22:30", "10:30pm"
      var match = str.match(/^(\d{1,2}):?(\d{2})\s*(am|pm)?$/);
      if (!match) return null;
      var h = parseInt(match[1], 10);
      var m = parseInt(match[2], 10);
      if (match[3] === 'pm' && h < 12) h += 12;
      if (match[3] === 'am' && h === 12) h = 0;
      return h * 60 + m;
    }

    // Parse latency minutes (handle ranges like "15-30" -> midpoint)
    function parseLatency(str) {
      if (!str) return null;
      str = str.trim();
      var rangeMatch = str.match(/^(\d+)\s*[-–]\s*(\d+)$/);
      if (rangeMatch) {
        return (parseInt(rangeMatch[1], 10) + parseInt(rangeMatch[2], 10)) / 2;
      }
      var num = parseFloat(str);
      return isNaN(num) ? null : num;
    }

    var bedtime = parseTime(d.q1_bedtime);
    var waketime = parseTime(d.q3_waketime);
    var latencyMin = parseLatency(d.q2_latency_min);
    var sleepHours = d.q4_sleep_hours ? parseFloat(d.q4_sleep_hours) : null;

    // Component 1: Subjective Sleep Quality (Q9)
    var c1 = d.q9_quality !== undefined ? Number(d.q9_quality) : null;

    // Component 2: Sleep Latency (Q2 + Q5a)
    var c2 = null;
    if (latencyMin !== null && d.q5a !== undefined) {
      var q2score = latencyMin <= 15 ? 0 : latencyMin <= 30 ? 1 : latencyMin <= 60 ? 2 : 3;
      var q5aScore = Number(d.q5a);
      var c2sum = q2score + q5aScore;
      c2 = c2sum === 0 ? 0 : c2sum <= 2 ? 1 : c2sum <= 4 ? 2 : 3;
    }

    // Component 3: Sleep Duration (Q4)
    var c3 = null;
    if (sleepHours !== null) {
      c3 = sleepHours > 7 ? 0 : sleepHours >= 6 ? 1 : sleepHours >= 5 ? 2 : 3;
    }

    // Component 4: Habitual Sleep Efficiency
    var c4 = null;
    if (bedtime !== null && waketime !== null && sleepHours !== null) {
      var timeInBed = waketime - bedtime;
      if (timeInBed <= 0) timeInBed += 24 * 60; // crosses midnight
      var hoursInBed = timeInBed / 60;
      var efficiency = hoursInBed > 0 ? (sleepHours / hoursInBed) * 100 : 0;
      c4 = efficiency >= 85 ? 0 : efficiency >= 75 ? 1 : efficiency >= 65 ? 2 : 3;
    }

    // Component 5: Sleep Disturbance (Q5b–Q5i, plus Q5j if answered)
    var distKeys = ['q5b', 'q5c', 'q5d', 'q5e', 'q5f', 'q5g', 'q5h', 'q5i'];
    var distSum = 0, distCount = 0;
    for (var i = 0; i < distKeys.length; i++) {
      var val = d[distKeys[i]];
      if (val !== undefined && val !== null) { distSum += Number(val); distCount++; }
    }
    // Q5j: include if answered (per PSQI scoring doc)
    if (d.q5j !== undefined && d.q5j !== null) {
      distSum += Number(d.q5j);
      distCount++;
    }
    var c5 = null;
    if (distCount > 0) {
      c5 = distSum === 0 ? 0 : distSum <= 9 ? 1 : distSum <= 18 ? 2 : 3;
    }

    // Component 6: Use of Sleep Medication (Q6)
    var c6 = d.q6_medication !== undefined ? Number(d.q6_medication) : null;

    // Component 7: Daytime Dysfunction (Q7 + Q8)
    var c7 = null;
    if (d.q7_drowsiness !== undefined && d.q8_enthusiasm !== undefined) {
      var c7sum = Number(d.q7_drowsiness) + Number(d.q8_enthusiasm);
      c7 = c7sum === 0 ? 0 : c7sum <= 2 ? 1 : c7sum <= 4 ? 2 : 3;
    }

    var components = [c1, c2, c3, c4, c5, c6, c7];
    var globalTotal = null;
    var allPresent = true;
    for (var j = 0; j < components.length; j++) {
      if (components[j] === null) { allPresent = false; break; }
    }
    if (allPresent) {
      globalTotal = components.reduce(function (a, b) { return a + b; }, 0);
    }

    var scoreObj = {
      components: {
        subjectiveQuality: c1,
        sleepLatency: c2,
        sleepDuration: c3,
        sleepEfficiency: c4,
        sleepDisturbance: c5,
        sleepMedication: c6,
        daytimeDysfunction: c7
      },
      globalTotal: globalTotal
    };
    S.setScore('psqi', scoreObj);

    // Update UI
    updateElement('psqi-total', globalTotal !== null ? globalTotal : '--');
    if (globalTotal !== null) {
      var interp = globalTotal <= 5
        ? 'Good sleep quality (score ≤ 5)'
        : 'Poor sleep quality (score > 5)';
      updateElement('psqi-interp', interp + ' — out of 21');
    } else {
      updateElement('psqi-interp', 'Complete all required items to calculate');
    }

    triggerReport();
  }

  // ═══════════════════════════════════════════
  // Epworth Sleepiness Scale
  // ═══════════════════════════════════════════
  function epworth() {
    var keys = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'];
    var result = sumKeys('instruments.epworth', keys);
    var total = result.answered === 8 ? result.total : null;

    S.setScore('epworth', { total: total, answered: result.answered });

    updateElement('epworth-total', total !== null ? total : '--');
    if (total !== null) {
      var interp = total <= 10 ? 'Normal daytime sleepiness'
        : total <= 14 ? 'Mild excessive daytime sleepiness'
        : total <= 18 ? 'Moderate excessive daytime sleepiness'
        : 'Severe excessive daytime sleepiness';
      updateElement('epworth-interp', interp + ' (out of 24)');
    }
    triggerReport();
  }

  // ═══════════════════════════════════════════
  // GAD-7
  // ═══════════════════════════════════════════
  function gad7() {
    var keys = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'];
    var result = sumKeys('instruments.gad7', keys);
    var total = result.answered === 7 ? result.total : null;
    var impairment = S.get('instruments.gad7.impairment') || null;

    S.setScore('gad7', { total: total, impairment: impairment, answered: result.answered });

    updateElement('gad7-total', total !== null ? total : '--');
    if (total !== null) {
      var interp = total <= 4 ? 'Minimal anxiety'
        : total <= 9 ? 'Mild anxiety'
        : total <= 14 ? 'Moderate anxiety'
        : 'Severe anxiety';
      updateElement('gad7-interp', interp + ' (out of 21)');
    }
    triggerReport();
  }

  // ═══════════════════════════════════════════
  // Depression (GDS-15)
  // ═══════════════════════════════════════════
  function depression() {
    var items = BHM.Instruments.Depression.getItems();
    var total = 0, answered = 0;
    for (var i = 0; i < items.length; i++) {
      var val = S.get('instruments.depression.' + items[i].key);
      if (val !== undefined && val !== null && val !== '') {
        answered++;
        if (val === items[i].depressiveAnswer) total++;
      }
    }
    var score = answered === 15 ? total : null;

    S.setScore('depression', { total: score, answered: answered });

    updateElement('depression-total', score !== null ? score : '--');
    if (score !== null) {
      var interp = score <= 4 ? 'Normal'
        : score <= 8 ? 'Mild depression'
        : score <= 11 ? 'Moderate depression'
        : 'Severe depression';
      updateElement('depression-interp', interp + ' (out of 15)');
    }
    triggerReport();
  }

  // ═══════════════════════════════════════════
  // Mediterranean Diet
  // ═══════════════════════════════════════════
  function diet() {
    var keys = [];
    for (var i = 1; i <= 14; i++) keys.push('md' + i);
    var total = 0, answered = 0;
    for (var j = 0; j < keys.length; j++) {
      var val = S.get('instruments.diet.' + keys[j]);
      if (val !== undefined && val !== null && val !== '') {
        answered++;
        if (val === 'yes') total++;
      }
    }
    var score = answered === 14 ? total : null;

    S.setScore('diet', { total: score, answered: answered });

    updateElement('diet-total', score !== null ? score : '--');
    if (score !== null) {
      var interp = score >= 10 ? 'Good adherence to Mediterranean diet'
        : score >= 7 ? 'Moderate adherence'
        : 'Low adherence to Mediterranean diet';
      updateElement('diet-interp', interp + ' (out of 14)');
    }
    triggerReport();
  }

  // ═══════════════════════════════════════════
  // AUDIT
  // ═══════════════════════════════════════════
  function auditTool() {
    var keys = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10'];
    var result = sumKeys('instruments.auditTool', keys);
    var total = result.answered === 10 ? result.total : null;

    S.setScore('auditTool', { total: total, answered: result.answered });

    updateElement('audit-total', total !== null ? total : '--');
    if (total !== null) {
      var interp = total <= 7 ? 'Low risk'
        : total <= 15 ? 'Increasing risk'
        : total <= 19 ? 'Higher risk'
        : 'Possible dependence';
      updateElement('audit-interp', interp + ' (out of 40)');
    }
    triggerReport();
  }

  // ═══════════════════════════════════════════
  // CASP-19
  // ═══════════════════════════════════════════
  function casp19() {
    var items = BHM.Instruments.CASP19.getItems();
    var total = 0, answered = 0;
    var domainTotals = {};
    for (var i = 0; i < items.length; i++) {
      var val = S.get('instruments.casp19.' + items[i].key);
      if (val !== undefined && val !== null && val !== '') {
        answered++;
        var rawVal = Number(val);
        // Reverse-scored items: Often(0)=0, Never(3)=3 for positive; Often(0)=3, Never(3)=0 for reverse
        var scored;
        if (items[i].reverse) {
          scored = rawVal; // reverse items: Often=0->score 0, Never=3->score 3 (stored as column index)
        } else {
          scored = 3 - rawVal; // positive items: Often=0->score 3, Never=3->score 0
        }
        total += scored;
        if (!domainTotals[items[i].domain]) domainTotals[items[i].domain] = 0;
        domainTotals[items[i].domain] += scored;
      }
    }
    var score = answered === 19 ? total : null;

    S.setScore('casp19', { total: score, domainTotals: domainTotals, answered: answered });

    updateElement('casp19-total', score !== null ? score : '--');
    if (score !== null) {
      updateElement('casp19-interp', 'out of 57 (higher = better quality of life)');
    }
    triggerReport();
  }

  // ═══════════════════════════════════════════
  // Hearing
  // ═══════════════════════════════════════════
  function hearing() {
    var count = 0;
    for (var i = 1; i <= 17; i++) {
      var val = S.get('instruments.hearing.hs' + i);
      if (val === 'yes') count++;
    }

    S.setScore('hearing', { affectedCount: count });

    updateElement('hearing-count', count);
    updateElement('hearing-interp', 'out of 17 situations');
    triggerReport();
  }

  // ═══════════════════════════════════════════
  // MBI-C
  // ═══════════════════════════════════════════
  function mbiC() {
    var domains = BHM.Instruments.MBIC.getDomains();
    var grandTotal = 0, answered = 0;

    for (var d = 0; d < domains.length; d++) {
      var domainTotal = 0, domainAnswered = 0;
      for (var i = 0; i < domains[d].items.length; i++) {
        var val = S.get('instruments.mbiC.' + domains[d].items[i].key);
        if (val !== undefined && val !== null && val !== '') {
          domainTotal += Number(val);
          domainAnswered++;
          answered++;
        }
      }
      grandTotal += domainTotal;
      var badge = document.getElementById('mbic-domain-' + d);
      if (badge) {
        var shortName = domains[d].name.length > 30 ? domains[d].name.substring(0, 30) + '\u2026' : domains[d].name;
        badge.textContent = shortName + ': ' + (domainAnswered > 0 ? domainTotal : '--');
        badge.title = domains[d].name + ': ' + (domainAnswered > 0 ? domainTotal : '--');
      }
    }

    S.setScore('mbiC', { total: answered > 0 ? grandTotal : null, answered: answered });

    updateElement('mbic-total', answered > 0 ? grandTotal : '--');
    triggerReport();
  }

  // ═══════════════════════════════════════════
  // NPI-Q
  // ═══════════════════════════════════════════
  function npiQ() {
    var symptoms = BHM.Instruments.NPIQ.getSymptoms();
    var count = 0, sevTotal = 0, distTotal = 0;

    for (var i = 0; i < symptoms.length; i++) {
      var present = S.get('instruments.npiQ.' + symptoms[i].key + '_present');
      if (present === 'yes') {
        count++;
        var sev = S.get('instruments.npiQ.' + symptoms[i].key + '_severity');
        var dist = S.get('instruments.npiQ.' + symptoms[i].key + '_distress');
        if (sev !== undefined && sev !== null) sevTotal += Number(sev);
        if (dist !== undefined && dist !== null) distTotal += Number(dist);
      }
    }

    S.setScore('npiQ', { count: count, severityTotal: sevTotal, distressTotal: distTotal });

    updateElement('npiq-count', count);
    updateElement('npiq-severity', sevTotal);
    updateElement('npiq-distress', distTotal);
    triggerReport();
  }

  // ═══════════════════════════════════════════
  // RBANS
  // ═══════════════════════════════════════════
  function rbans() {
    // RBANS scoring is handled internally by BHM.Instruments.RBANS.calculate()
    // triggered by the Calculate button; this is a pass-through
    if (BHM.Instruments.RBANS && BHM.Instruments.RBANS.calculate) {
      BHM.Instruments.RBANS.calculate();
    }
  }

  // ═══════════════════════════════════════════
  // CDR — Clinical Dementia Rating
  // ═══════════════════════════════════════════
  function cdr() {
    // CDR scoring is handled internally by BHM.Instruments.CDR.recalc()
    // This function is a pass-through to ensure consistency
    if (BHM.Instruments.CDR && BHM.Instruments.CDR.recalc) {
      BHM.Instruments.CDR.recalc();
    }
  }

  // ═══════════════════════════════════════════
  // DIAMOND Lewy
  // ═══════════════════════════════════════════
  function diamondLewy() {
    if (BHM.Instruments.DiamondLewy && BHM.Instruments.DiamondLewy.recalc) {
      BHM.Instruments.DiamondLewy.recalc();
    }
  }

  // ═══════════════════════════════════════════
  // STOP-BANG (auto-derived from multi-instrument data)
  // ═══════════════════════════════════════════
  function stopBang() {
    var items = {};
    var unknown = {};
    var total = 0;

    // S — Snoring: PSQI q5e >= 1 (at least once a week) OR partner q10a >= 1
    var q5e = S.get('instruments.psqi.q5e');
    var q10a = S.get('instruments.psqi.q10a');
    if (q5e !== undefined && q5e !== null && q5e !== '') {
      items.snoring = Number(q5e) >= 1;
    } else if (q10a !== undefined && q10a !== null && q10a !== '') {
      items.snoring = Number(q10a) >= 1;
    } else {
      items.snoring = false;
      unknown.snoring = true;
    }
    if (items.snoring) total++;

    // T — Tired: Epworth total > 10
    var epworthScore = S.getScore('epworth');
    if (epworthScore && epworthScore.total !== null) {
      items.tired = epworthScore.total > 10;
    } else {
      items.tired = false;
      unknown.tired = true;
    }
    if (items.tired) total++;

    // O — Observed apnea: PSQI partner q10b >= 1
    var q10b = S.get('instruments.psqi.q10b');
    if (q10b !== undefined && q10b !== null && q10b !== '') {
      items.observed = Number(q10b) >= 1;
    } else {
      items.observed = false;
      unknown.observed = true;
    }
    if (items.observed) total++;

    // P — Blood Pressure: medical history hypertension checkbox
    var cvRisk = S.get('medicalHistory.cvRisk') || {};
    items.pressure = !!cvRisk.hypertension;
    if (items.pressure) total++;

    // B — BMI > 35
    var bmi = parseFloat(S.get('physicalExam.bmi'));
    if (!isNaN(bmi) && bmi > 0) {
      items.bmi = bmi > 35;
    } else {
      items.bmi = false;
      unknown.bmi = true;
    }
    if (items.bmi) total++;

    // A — Age > 50 (from DOB)
    var dob = S.get('patient.dob');
    if (dob) {
      var birthDate = new Date(dob);
      var today = new Date();
      var age = today.getFullYear() - birthDate.getFullYear();
      var m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      items.age = age > 50;
    } else {
      items.age = false;
      unknown.age = true;
    }
    if (items.age) total++;

    // N — Neck circumference > 40 cm
    var neck = parseFloat(S.get('physicalExam.neckCircCm'));
    if (!isNaN(neck) && neck > 0) {
      items.neck = neck > 40;
    } else {
      items.neck = false;
      unknown.neck = true;
    }
    if (items.neck) total++;

    // G — Sex: male (from patient.sex on Session tab)
    var sex = S.get('patient.sex');
    if (sex) {
      items.gender = sex === 'Male';
    } else {
      items.gender = false;
      unknown.gender = true;
    }
    if (items.gender) total++;

    var unknownCount = Object.keys(unknown).length;
    var interp = total >= 5 ? 'High risk' : total >= 3 ? 'Intermediate risk' : 'Low risk';

    var result = {
      total: total,
      items: items,
      unknown: unknown,
      unknownCount: unknownCount,
      interp: interp
    };

    S.setScore('stopBang', result);

    // Update display on physical exam tab
    if (BHM.Instruments.PhysicalExam && BHM.Instruments.PhysicalExam.updateStopBangDisplay) {
      BHM.Instruments.PhysicalExam.updateStopBangDisplay(result);
    }
  }

  // ═══════════════════════════════════════════
  //  QRISK3
  // ═══════════════════════════════════════════
  function qrisk3() {
    var Q = BHM.QRISK3Algorithm;
    if (!Q) return;

    var qr = function (k) { return S.get('qrisk3.' + k); };
    var warnings = [];

    // Age
    var dob = S.get('patient.dob');
    var age = null;
    if (dob) {
      var b = new Date(dob); var n = new Date();
      age = n.getFullYear() - b.getFullYear();
      var m = n.getMonth() - b.getMonth();
      if (m < 0 || (m === 0 && n.getDate() < b.getDate())) age--;
    }
    if (age === null || age < 25 || age > 84) {
      S.setScore('qrisk3', { error: 'Age must be 25-84 (set DOB on Session tab). Current: ' + (age !== null ? age : 'not set') });
      return;
    }

    // Sex
    var sex = S.get('patient.sex');
    if (!sex) {
      S.setScore('qrisk3', { error: 'Sex not set (Session tab)' });
      return;
    }

    // BMI
    var bmi = parseFloat(S.get('physicalExam.bmi'));
    if (isNaN(bmi) || bmi < 10) {
      bmi = 25; // population average default
      warnings.push('BMI defaulted to 25 (not recorded)');
    }

    // SBP
    var sbp = parseFloat(S.get('physicalExam.bpSystolic'));
    if (isNaN(sbp) || sbp < 50) {
      sbp = 125; // population average default
      warnings.push('Systolic BP defaulted to 125 mmHg (not recorded)');
    }

    // SBP SD
    var sbps5 = parseFloat(qr('sbpSD'));
    if (isNaN(sbps5)) sbps5 = 0;

    // Cholesterol / HDL ratio
    var tc = parseFloat(qr('totalChol'));
    var hdl = parseFloat(qr('hdlChol'));
    var rati;
    if (tc > 0 && hdl > 0) {
      rati = tc / hdl;
    } else {
      rati = sex === 'Male' ? 4.3 : 3.5;
      warnings.push('Cholesterol/HDL ratio defaulted to ' + rati.toFixed(1) + ' (population average)');
    }

    // Townsend
    var town = parseFloat(qr('townsend'));
    if (isNaN(town)) town = 0;

    // Ethnicity
    var eth = parseInt(qr('ethnicity'), 10);
    if (isNaN(eth) || eth < 0 || eth > 9) {
      eth = 1; // White/not stated
      warnings.push('Ethnicity defaulted to White/not stated');
    }

    // Smoking
    var smokingOverride = qr('smokingOverride');
    var smoke_cat;
    if (smokingOverride !== undefined && smokingOverride !== null && smokingOverride !== '') {
      smoke_cat = parseInt(smokingOverride, 10);
    } else {
      // Infer from clinical interview
      var tob = S.get('instruments.clinical.tobacco');
      if (tob === 'Never') smoke_cat = 0;
      else if (tob === 'Ex-smoker') smoke_cat = 1;
      else if (tob === 'Current') {
        var packs = parseFloat(S.get('instruments.clinical.tobaccoPacks'));
        if (!isNaN(packs)) {
          var cigs = packs * 20;
          smoke_cat = cigs < 10 ? 2 : cigs < 20 ? 3 : 4;
        } else {
          smoke_cat = 2;
          warnings.push('Current smoker: intensity defaulted to light');
        }
      } else {
        smoke_cat = 0;
        warnings.push('Smoking status defaulted to non-smoker');
      }
    }

    // Boolean conditions — merge auto-detected with QRISK3 overrides
    function boolOr(autoPath, overrideKey) {
      return !!(S.get(autoPath) || qr(overrideKey));
    }

    var b_AF = boolOr('medicalHistory.cvRisk.atrial_fibrillation', 'overrideAF');
    var b_type1 = boolOr('medicalHistory.cvRisk.diabetes_t1', 'overrideDM1');
    var b_type2 = boolOr('medicalHistory.cvRisk.diabetes_t2', 'overrideDM2');
    var b_treatedhyp = boolOr('medicalHistory.cvRisk.hypertension', 'overrideHTN');
    var b_migraine = boolOr('medicalHistory.neuro.migraine', 'overrideMigraine');
    var b_semi = !!(S.get('medicalHistory.psych.bipolar') || S.get('medicalHistory.psych.psychosis') || qr('overrideSMI'));
    var b_ra = !!qr('rheumatoidArthritis');
    var b_renal = !!qr('ckd345');
    var b_sle = !!qr('sle');

    // Medications — auto-detect + override
    var b_atypicalantipsy = !!qr('overrideAntipsych');
    if (!b_atypicalantipsy) {
      var meds = S.get('medications.list');
      if (meds && Array.isArray(meds)) {
        var atypicals = ['amisulpride', 'aripiprazole', 'clozapine', 'lurasidone', 'olanzapine',
          'paliperidone', 'quetiapine', 'risperidone', 'sertindole', 'zotepine'];
        for (var mi = 0; mi < meds.length && !b_atypicalantipsy; mi++) {
          var mname = (meds[mi].name || '').toLowerCase();
          for (var aj = 0; aj < atypicals.length; aj++) {
            if (mname.indexOf(atypicals[aj]) !== -1) { b_atypicalantipsy = true; break; }
          }
        }
      }
    }

    var b_corticosteroids = !!qr('overrideSteroids');
    if (!b_corticosteroids) {
      var meds2 = S.get('medications.list');
      if (meds2 && Array.isArray(meds2)) {
        var steroids = ['prednisolone', 'prednisone', 'betamethasone', 'cortisone', 'dexamethasone',
          'deflazacort', 'hydrocortisone', 'methylprednisolone', 'triamcinolone'];
        for (var si = 0; si < meds2.length && !b_corticosteroids; si++) {
          var sname = (meds2[si].name || '').toLowerCase();
          for (var sj = 0; sj < steroids.length; sj++) {
            if (sname.indexOf(steroids[sj]) !== -1) { b_corticosteroids = true; break; }
          }
        }
      }
    }

    var fh_cvd = !!qr('familyCHD');
    var surv = 10; // 10-year survival index

    var score;
    if (sex === 'Male') {
      var b_impotence = !!qr('erectileDysfunction');
      score = Q.maleScore(age, b_AF ? 1 : 0, b_atypicalantipsy ? 1 : 0, b_corticosteroids ? 1 : 0,
        b_impotence ? 1 : 0, b_migraine ? 1 : 0, b_ra ? 1 : 0, b_renal ? 1 : 0, b_semi ? 1 : 0,
        b_sle ? 1 : 0, b_treatedhyp ? 1 : 0, b_type1 ? 1 : 0, b_type2 ? 1 : 0,
        bmi, eth, fh_cvd ? 1 : 0, rati, sbp, sbps5, smoke_cat, surv, town);
    } else {
      score = Q.femaleScore(age, b_AF ? 1 : 0, b_atypicalantipsy ? 1 : 0, b_corticosteroids ? 1 : 0,
        b_migraine ? 1 : 0, b_ra ? 1 : 0, b_renal ? 1 : 0, b_semi ? 1 : 0,
        b_sle ? 1 : 0, b_treatedhyp ? 1 : 0, b_type1 ? 1 : 0, b_type2 ? 1 : 0,
        bmi, eth, fh_cvd ? 1 : 0, rati, sbp, sbps5, smoke_cat, surv, town);
    }

    if (isNaN(score) || score < 0) score = 0;
    if (score > 100) score = 100;

    S.setScore('qrisk3', {
      score: score,
      warnings: warnings,
      inputs: { age: age, sex: sex, bmi: bmi, sbp: sbp, sbps5: sbps5, rati: rati, town: town, eth: eth, smoke_cat: smoke_cat }
    });

    if (BHM.Instruments.QRISK3 && BHM.Instruments.QRISK3.showScore) {
      BHM.Instruments.QRISK3.showScore();
    }
  }

  // ── Trigger report update ──
  function triggerReport() {
    if (BHM.Report && BHM.Report.update) {
      // Small debounce to avoid excessive updates during rapid entry
      clearTimeout(BHM.Scoring._reportTimer);
      BHM.Scoring._reportTimer = setTimeout(function () {
        BHM.Report.update();
      }, 100);
    }
  }

  return {
    psqi: psqi,
    epworth: epworth,
    gad7: gad7,
    depression: depression,
    diet: diet,
    auditTool: auditTool,
    casp19: casp19,
    hearing: hearing,
    mbiC: mbiC,
    npiQ: npiQ,
    rbans: rbans,
    cdr: cdr,
    diamondLewy: diamondLewy,
    stopBang: stopBang,
    qrisk3: qrisk3,
    triggerReport: triggerReport,
    _reportTimer: null
  };
})();
