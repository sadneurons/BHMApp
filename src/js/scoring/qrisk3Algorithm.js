/* ═══════════════════════════════════════════════════════════════
   BHM.QRISK3Algorithm — QRISK3-2017 scoring engine
   Faithful port of ClinRisk Ltd. QRISK3-2017 (LGPL v3)
   Coefficients from https://qrisk.org/src.php
   ═══════════════════════════════════════════════════════════════

   Copyright 2017 ClinRisk Ltd.
   QRISK3-2017 is free software under GNU LGPL v3.

   DISCLAIMER: The initial version of this code faithfully implements
   QRISK3-2017. ClinRisk Ltd. stress that it is the responsibility of
   the end user to check that the source they receive produces the same
   results as the original code found at https://qrisk.org.
   Inaccurate implementations of risk scores can lead to wrong patients
   being given the wrong treatment.
   ═══════════════════════════════════════════════════════════════ */
var BHM = window.BHM || {};

BHM.QRISK3Algorithm = (function () {
  'use strict';

  // ── Female calculation ──
  function femaleScore(age, b_AF, b_atypicalantipsy, b_corticosteroids,
    b_migraine, b_ra, b_renal, b_semi, b_sle, b_treatedhyp,
    b_type1, b_type2, bmi, ethrisk, fh_cvd, rati, sbp, sbps5,
    smoke_cat, surv, town) {

    var survivor = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.988876402378082, 0, 0, 0, 0, 0];

    var Iethrisk = [0, 0, 0.28040314332995425, 0.56298994142075398,
      0.29590000851116516, 0.072785379877982545, -0.17072135508857317,
      -0.39371043314874971, -0.32632495283530272, -0.17127056883241784];

    var Ismoke = [0, 0.13386833786546262, 0.56200858012438537,
      0.66749593377502547, 0.84948177644830847];

    var dage = age / 10;
    var age_1 = Math.pow(dage, -2);
    var age_2 = dage;
    var dbmi = bmi / 10;
    var bmi_1 = Math.pow(dbmi, -2);
    var bmi_2 = Math.pow(dbmi, -2) * Math.log(dbmi);

    age_1 = age_1 - 0.053274843841791;
    age_2 = age_2 - 4.332503318786621;
    bmi_1 = bmi_1 - 0.154946178197861;
    bmi_2 = bmi_2 - 0.144462317228317;
    rati = rati - 3.47632646560669;
    sbp = sbp - 123.13001251220703;
    sbps5 = sbps5 - 9.002537727355957;
    town = town - 0.392308831214905;

    var a = 0;
    a += Iethrisk[ethrisk];
    a += Ismoke[smoke_cat];

    a += age_1 * -8.1388109247726188;
    a += age_2 * 0.79733376689699098;
    a += bmi_1 * 0.29236092275460052;
    a += bmi_2 * -4.1513300213837665;
    a += rati * 0.15338035820802554;
    a += sbp * 0.013131488407103424;
    a += sbps5 * 0.0078894541014586095;
    a += town * 0.077223790588590108;

    a += b_AF * 1.5923354969269663;
    a += b_atypicalantipsy * 0.25237642070115557;
    a += b_corticosteroids * 0.59520725304601851;
    a += b_migraine * 0.301267260870345;
    a += b_ra * 0.21364803435181942;
    a += b_renal * 0.65194569493845833;
    a += b_semi * 0.12555308058820178;
    a += b_sle * 0.75880938654267693;
    a += b_treatedhyp * 0.50931593683423004;
    a += b_type1 * 1.7267977510537347;
    a += b_type2 * 1.0688773244615468;
    a += fh_cvd * 0.45445319020896213;

    a += age_1 * (smoke_cat === 1 ? 1 : 0) * -4.7057161785851891;
    a += age_1 * (smoke_cat === 2 ? 1 : 0) * -2.7430383403573337;
    a += age_1 * (smoke_cat === 3 ? 1 : 0) * -0.86608088829392182;
    a += age_1 * (smoke_cat === 4 ? 1 : 0) * 0.90241562369710648;
    a += age_1 * b_AF * 19.938034889546561;
    a += age_1 * b_corticosteroids * -0.98408045235936281;
    a += age_1 * b_migraine * 1.7634979587872999;
    a += age_1 * b_renal * -3.5874047731694114;
    a += age_1 * b_sle * 19.690303738638292;
    a += age_1 * b_treatedhyp * 11.872809733921812;
    a += age_1 * b_type1 * -1.2444332714320747;
    a += age_1 * b_type2 * 6.8652342000009599;
    a += age_1 * bmi_1 * 23.802623412141742;
    a += age_1 * bmi_2 * -71.184947692087007;
    a += age_1 * fh_cvd * 0.99467807940435127;
    a += age_1 * sbp * 0.034131842338615485;
    a += age_1 * town * -1.0301180802035639;
    a += age_2 * (smoke_cat === 1 ? 1 : 0) * -0.075589244643193026;
    a += age_2 * (smoke_cat === 2 ? 1 : 0) * -0.11951192874867074;
    a += age_2 * (smoke_cat === 3 ? 1 : 0) * -0.10366306397571923;
    a += age_2 * (smoke_cat === 4 ? 1 : 0) * -0.13991853591718389;
    a += age_2 * b_AF * -0.076182651011162505;
    a += age_2 * b_corticosteroids * -0.12005364946742472;
    a += age_2 * b_migraine * -0.065586917898699859;
    a += age_2 * b_renal * -0.22688873086442507;
    a += age_2 * b_sle * 0.077347949679016273;
    a += age_2 * b_treatedhyp * 0.00096857823588174436;
    a += age_2 * b_type1 * -0.28724064624488949;
    a += age_2 * b_type2 * -0.097112252590695489;
    a += age_2 * bmi_1 * 0.52369958933664429;
    a += age_2 * bmi_2 * 0.045744190122323759;
    a += age_2 * fh_cvd * -0.076885051698423038;
    a += age_2 * sbp * -0.0015082501423272358;
    a += age_2 * town * -0.031593414674962329;

    return 100.0 * (1 - Math.pow(survivor[surv], Math.exp(a)));
  }

  // ── Male calculation ──
  function maleScore(age, b_AF, b_atypicalantipsy, b_corticosteroids,
    b_impotence2, b_migraine, b_ra, b_renal, b_semi, b_sle, b_treatedhyp,
    b_type1, b_type2, bmi, ethrisk, fh_cvd, rati, sbp, sbps5,
    smoke_cat, surv, town) {

    var survivor = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.977268040180206, 0, 0, 0, 0, 0];

    var Iethrisk = [0, 0, 0.27719248760308279, 0.47446360714931268,
      0.52961729919689371, 0.035100159186299017, -0.35807899669327919,
      -0.4005648523216514, -0.41522792889830173, -0.26321348134749967];

    var Ismoke = [0, 0.19128222863388983, 0.55241588192645552,
      0.63835053027506072, 0.78983819881858019];

    var dage = age / 10;
    var age_1 = Math.pow(dage, -1);
    var age_2 = Math.pow(dage, 3);
    var dbmi = bmi / 10;
    var bmi_1 = Math.pow(dbmi, -2);
    var bmi_2 = Math.pow(dbmi, -2) * Math.log(dbmi);

    age_1 = age_1 - 0.234766781330109;
    age_2 = age_2 - 77.284080505371094;
    bmi_1 = bmi_1 - 0.149176135659218;
    bmi_2 = bmi_2 - 0.141913309693336;
    rati = rati - 4.300998687744141;
    sbp = sbp - 128.57157897949219;
    sbps5 = sbps5 - 8.756621360778809;
    town = town - 0.52630490064621;

    var a = 0;
    a += Iethrisk[ethrisk];
    a += Ismoke[smoke_cat];

    a += age_1 * -17.839781666005575;
    a += age_2 * 0.0022964880605765492;
    a += bmi_1 * 2.4562776660536358;
    a += bmi_2 * -8.3011122314711354;
    a += rati * 0.17340196856327111;
    a += sbp * 0.012910126542553305;
    a += sbps5 * 0.010251914291290456;
    a += town * 0.033268201277287295;

    a += b_AF * 0.88209236928054657;
    a += b_atypicalantipsy * 0.13046879855173513;
    a += b_corticosteroids * 0.45485399750445543;
    a += b_impotence2 * 0.22251859086705383;
    a += b_migraine * 0.25584178074159913;
    a += b_ra * 0.20970658013956567;
    a += b_renal * 0.71853261288274384;
    a += b_semi * 0.12133039882047164;
    a += b_sle * 0.4401572174457522;
    a += b_treatedhyp * 0.51659871082695474;
    a += b_type1 * 1.2343425521675175;
    a += b_type2 * 0.85942071430932221;
    a += fh_cvd * 0.54055469009390156;

    a += age_1 * (smoke_cat === 1 ? 1 : 0) * -0.21011133933516346;
    a += age_1 * (smoke_cat === 2 ? 1 : 0) * 0.75268676447503191;
    a += age_1 * (smoke_cat === 3 ? 1 : 0) * 0.99315887556405791;
    a += age_1 * (smoke_cat === 4 ? 1 : 0) * 2.1331163414389076;
    a += age_1 * b_AF * 3.4896675530623207;
    a += age_1 * b_corticosteroids * 1.1708133653489108;
    a += age_1 * b_impotence2 * -1.506400985745431;
    a += age_1 * b_migraine * 2.3491159871402441;
    a += age_1 * b_renal * -0.50656716327223694;
    a += age_1 * b_treatedhyp * 6.5114581098532671;
    a += age_1 * b_type1 * 5.3379864878006531;
    a += age_1 * b_type2 * 3.6461817406221311;
    a += age_1 * bmi_1 * 31.004952956033886;
    a += age_1 * bmi_2 * -111.29157184391643;
    a += age_1 * fh_cvd * 2.7808628508531887;
    a += age_1 * sbp * 0.018858524469865853;
    a += age_1 * town * -0.1007554870063731;
    a += age_2 * (smoke_cat === 1 ? 1 : 0) * -0.00049854870275326121;
    a += age_2 * (smoke_cat === 2 ? 1 : 0) * -0.00079875633317385414;
    a += age_2 * (smoke_cat === 3 ? 1 : 0) * -0.00083706184266251296;
    a += age_2 * (smoke_cat === 4 ? 1 : 0) * -0.00078400319155637289;
    a += age_2 * b_AF * -0.00034995608340636049;
    a += age_2 * b_corticosteroids * -0.0002496045095297166;
    a += age_2 * b_impotence2 * -0.0011058218441227373;
    a += age_2 * b_migraine * 0.00019896446041478631;
    a += age_2 * b_renal * -0.0018325930166498813;
    a += age_2 * b_treatedhyp * 0.00063838053104165013;
    a += age_2 * b_type1 * 0.0006409780808752897;
    a += age_2 * b_type2 * -0.00024695695588868315;
    a += age_2 * bmi_1 * 0.0050380102356322029;
    a += age_2 * bmi_2 * -0.013074483002524319;
    a += age_2 * fh_cvd * -0.00024791809907396037;
    a += age_2 * sbp * -0.00001271874191588457;
    a += age_2 * town * -0.000093299642323272888;

    return 100.0 * (1 - Math.pow(survivor[surv], Math.exp(a)));
  }

  return {
    femaleScore: femaleScore,
    maleScore: maleScore
  };
})();
