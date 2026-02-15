#!/usr/bin/env python3
"""
Comprehensive BHM Assessment App Walkthrough
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        
        try:
            print("=" * 80)
            print("BHM ASSESSMENT APP - COMPREHENSIVE WALKTHROUGH")
            print("=" * 80)
            
            # ═══════════════════════════════════════════════════════════════
            # STEP 1: LANDING PAGE
            # ═══════════════════════════════════════════════════════════════
            print("\n" + "=" * 80)
            print("STEP 1: LANDING PAGE")
            print("=" * 80)
            
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"\nNavigating to {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(2)
            print("✓ Page loaded")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/walkthrough_01_landing.png", full_page=False)
            print("📸 Screenshot: walkthrough_01_landing.png")
            
            # ═══════════════════════════════════════════════════════════════
            # STEP 2: INJECT COMPREHENSIVE TEST DATA
            # ═══════════════════════════════════════════════════════════════
            print("\n" + "=" * 80)
            print("STEP 2: INJECT COMPREHENSIVE TEST DATA")
            print("=" * 80)
            
            inject_script = """
            (function() {
              // Patient info
              BHM.State.set('patient.name', 'Margaret Thompson');
              BHM.State.set('patient.dateOfCompletion', '2026-02-15');

              // PSQI
              var psqi = BHM.State.getSession().instruments.psqi;
              Object.assign(psqi, {q1_bedtime:'23:00', q2_latency_min:'45', q3_waketime:'06:30', q4_sleep_hours:5.5, q5a:3, q5b:3, q5c:2, q5d:0, q5e:1, q5f:2, q5g:3, q5h:1, q5i:2, q5j:0, q6_medication:2, q7_drowsiness:2, q8_enthusiasm:2, q9_quality:3, q10_partner:0});
              BHM.Scoring.psqi();

              // Epworth
              var ep = BHM.State.getSession().instruments.epworth;
              Object.assign(ep, {e1:2, e2:3, e3:3, e4:2, e5:2, e6:1, e7:2, e8:3});
              BHM.Scoring.epworth();

              // GAD-7
              var gad = BHM.State.getSession().instruments.gad7;
              Object.assign(gad, {g1:2, g2:3, g3:2, g4:2, g5:1, g6:2, g7:3, impairment:'very'});
              BHM.Scoring.gad7();

              // GDS-15
              var dep = BHM.State.getSession().instruments.depression;
              Object.assign(dep, {d1:'no', d2:'yes', d3:'yes', d4:'yes', d5:'no', d6:'yes', d7:'no', d8:'yes', d9:'yes', d10:'yes', d11:'yes', d12:'no', d13:'no', d14:'yes', d15:'yes'});
              BHM.Scoring.depression();

              // AUDIT
              var aud = BHM.State.getSession().instruments.auditTool;
              Object.assign(aud, {a1:3, a2:2, a3:2, a4:1, a5:1, a6:0, a7:2, a8:1, a9:0, a10:2});
              BHM.Scoring.auditTool();

              // Diet
              var diet = BHM.State.getSession().instruments.diet;
              Object.assign(diet, {md1:'yes', md2:'no', md3:'yes', md4:'no', md5:'no', md6:'yes', md7:'yes', md8:'yes', md9:'no', md10:'no', md11:'no', md12:'yes', md13:'no', md14:'no'});
              BHM.Scoring.diet();

              // CASP-19
              var casp = BHM.State.getSession().instruments.casp19;
              Object.assign(casp, {c1:1, c2:2, c3:2, c4:2, c5:2, c6:1, c7:1, c8:2, c9:1, c10:0, c11:0, c12:1, c13:0, c14:1, c15:2, c16:3, c17:1, c18:2, c19:2});
              BHM.Scoring.casp19();

              // Hearing
              var hear = BHM.State.getSession().instruments.hearing;
              Object.assign(hear, {duration:'3 years', earAffected:'Both ears', suddenChange:'no', fluctuation:'no', pain:'no', discharge:'no', operations:'no', perforation:'no', tinnitus:'yes', hyperacusis:'yes', hearingAids:'No', wantHearingAids:'Yes', hs1:'no', hs2:'yes', hs3:'yes', hs4:'yes', hs5:'yes', hs6:'no', hs7:'yes', hs8:'yes', hs9:'no', hs10:'yes', hs11:'no', hs12:'no', hs13:'yes', hs14:'yes', hs15:'yes', hs16:'yes', hs17:'no', top1:'4', top2:'10', top3:'13'});
              BHM.Scoring.hearing();

              // MBI-C (some endorsed items)
              var mbic = BHM.State.getSession().instruments.mbiC;
              Object.assign(mbic, {imd1:2, imd2:1, imd3:2, imd4:1, imd5:0, ma1:1, ma2:2, ma3:0, ma4:0, ma5:1, ma6:0, dg1:1, dg2:0, dg3:1, dg4:0, dg5:2, dg6:0, dg7:1, dg8:0, dg9:0, dg10:0, dg11:0, dg12:0, sn1:1, sn2:0, sn3:0, sn4:1, sn5:0, sb1:0, sb2:1, sb3:0, sb4:0, sb5:0});
              BHM.Scoring.mbiC();

              // NPI-Q
              var npiq = BHM.State.getSession().instruments.npiQ;
              Object.assign(npiq, {
                delusions_present:'no', hallucinations_present:'no',
                agitation_present:'yes', agitation_severity:2, agitation_distress:3,
                depression_present:'yes', depression_severity:2, depression_distress:2,
                anxiety_present:'yes', anxiety_severity:1, anxiety_distress:2,
                elation_present:'no',
                apathy_present:'yes', apathy_severity:2, apathy_distress:3,
                disinhibition_present:'no',
                irritability_present:'yes', irritability_severity:2, irritability_distress:3,
                motorDisturbance_present:'no',
                nightBehaviour_present:'yes', nightBehaviour_severity:1, nightBehaviour_distress:2,
                appetite_present:'no'
              });
              BHM.Scoring.npiQ();

              console.log('All data injected successfully');
              return 'Complete';
            })();
            """
            
            print("\nInjecting comprehensive test data...")
            result = await page.evaluate(inject_script)
            print(f"✓ Data injection: {result}")
            await asyncio.sleep(1)
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/walkthrough_02_data_injected.png", full_page=False)
            print("📸 Screenshot: walkthrough_02_data_injected.png")
            
            # ═══════════════════════════════════════════════════════════════
            # STEP 3: BROWSE INSTRUMENT TABS
            # ═══════════════════════════════════════════════════════════════
            print("\n" + "=" * 80)
            print("STEP 3: BROWSE INSTRUMENT TABS")
            print("=" * 80)
            
            # Click Pre-Assessment / Patient Booklet tab
            print("\nClicking Pre-Assessment tab...")
            await page.click("#tab-patient")
            await asyncio.sleep(1.5)
            print("✓ Pre-Assessment tab opened")
            
            # PSQI should be default active
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/walkthrough_03_psqi.png", full_page=False)
            print("📸 Screenshot: walkthrough_03_psqi.png (PSQI with data)")
            
            # Click Epworth sub-tab
            print("\nClicking Epworth sub-tab...")
            await page.click("button[data-bs-target='#sub-epworth']")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/walkthrough_04_epworth.png", full_page=False)
            print("📸 Screenshot: walkthrough_04_epworth.png")
            
            # Click GAD-7 sub-tab
            print("\nClicking GAD-7 sub-tab...")
            await page.click("button[data-bs-target='#sub-gad7']")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/walkthrough_05_gad7.png", full_page=False)
            print("📸 Screenshot: walkthrough_05_gad7.png")
            
            # ═══════════════════════════════════════════════════════════════
            # STEP 4: NAVIGATE TO REPORT TAB
            # ═══════════════════════════════════════════════════════════════
            print("\n" + "=" * 80)
            print("STEP 4: NAVIGATE TO REPORT TAB")
            print("=" * 80)
            
            print("\nClicking Report tab...")
            await page.click("#tab-report")
            await asyncio.sleep(2)
            print("✓ Report tab opened")
            
            # Top of report
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/walkthrough_06_report_top.png", full_page=False)
            print("📸 Screenshot: walkthrough_06_report_top.png (Report header and start)")
            
            # Scroll to Sleep section with notes box
            print("\nScrolling to Sleep section...")
            await page.evaluate("window.scrollBy(0, 1000)")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/walkthrough_07_sleep_notes.png", full_page=False)
            print("📸 Screenshot: walkthrough_07_sleep_notes.png (Sleep with clinical notes box)")
            
            # ═══════════════════════════════════════════════════════════════
            # STEP 5: TYPE CLINICAL NOTES
            # ═══════════════════════════════════════════════════════════════
            print("\n" + "=" * 80)
            print("STEP 5: TYPE CLINICAL NOTES")
            print("=" * 80)
            
            # Find Sleep clinical notes textarea
            print("\nFinding 'Clinical notes — Sleep' textarea...")
            sleep_textarea = await page.query_selector("textarea[placeholder*='Type clinical notes']")
            if sleep_textarea:
                sleep_note = "Patient reports chronic insomnia pattern. Consider referral to sleep clinic. Trial of sleep hygiene advice leaflet provided."
                await sleep_textarea.fill(sleep_note)
                await asyncio.sleep(0.5)
                print(f"✓ Typed into Sleep notes: {sleep_note[:50]}...")
                
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/walkthrough_08_sleep_typed.png", full_page=False)
                print("📸 Screenshot: walkthrough_08_sleep_typed.png")
            else:
                print("⚠ Could not find Sleep clinical notes textarea")
            
            # Scroll to Mood and Worry section
            print("\nScrolling to Mood and Worry section...")
            await page.evaluate("window.scrollBy(0, 800)")
            await asyncio.sleep(1)
            
            # Find all textareas and select the second one (Mood and Worry)
            print("Finding 'Clinical notes — Mood and Worry' textarea...")
            all_textareas = await page.query_selector_all("textarea[placeholder*='Type clinical notes']")
            if len(all_textareas) > 1:
                mood_note = "Significant anxiety and depression. PHQ-9 to be administered at follow-up. Discussed self-referral to IAPT."
                await all_textareas[1].fill(mood_note)
                await asyncio.sleep(0.5)
                print(f"✓ Typed into Mood notes: {mood_note[:50]}...")
                
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/walkthrough_09_mood_typed.png", full_page=False)
                print("📸 Screenshot: walkthrough_09_mood_typed.png")
            else:
                print("⚠ Could not find Mood and Worry clinical notes textarea")
            
            # ═══════════════════════════════════════════════════════════════
            # STEP 6: SCROLL THROUGH REST OF REPORT
            # ═══════════════════════════════════════════════════════════════
            print("\n" + "=" * 80)
            print("STEP 6: SCROLL THROUGH REST OF REPORT")
            print("=" * 80)
            
            # Alcohol section
            print("\nScrolling to Alcohol section...")
            await page.evaluate("window.scrollBy(0, 600)")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/walkthrough_10_alcohol.png", full_page=False)
            print("📸 Screenshot: walkthrough_10_alcohol.png")
            
            # Diet section
            print("\nScrolling to Diet section...")
            await page.evaluate("window.scrollBy(0, 600)")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/walkthrough_11_diet.png", full_page=False)
            print("📸 Screenshot: walkthrough_11_diet.png")
            
            # Quality of Life section (CASP-19 chart)
            print("\nScrolling to Quality of Life section...")
            await page.evaluate("window.scrollBy(0, 800)")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/walkthrough_12_quality.png", full_page=False)
            print("📸 Screenshot: walkthrough_12_quality.png (CASP-19 chart)")
            
            # Hearing section
            print("\nScrolling to Hearing section...")
            await page.evaluate("window.scrollBy(0, 800)")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/walkthrough_13_hearing.png", full_page=False)
            print("📸 Screenshot: walkthrough_13_hearing.png")
            
            # Changes Noticed section (MBI-C/NPI-Q radar charts)
            print("\nScrolling to Changes Noticed section...")
            await page.evaluate("window.scrollBy(0, 800)")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/walkthrough_14_changes.png", full_page=False)
            print("📸 Screenshot: walkthrough_14_changes.png (Radar charts)")
            
            # Scroll to bottom for Overall Summary inserts
            print("\nScrolling to bottom (Overall Summary inserts)...")
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/walkthrough_15_bottom_before.png", full_page=False)
            print("📸 Screenshot: walkthrough_15_bottom_before.png")
            
            # Type into Overall Summary
            print("\nTyping into Overall Summary...")
            summary_text = "Mrs Thompson presents with significant sleep disturbance, moderate-severe anxiety and depression, and early behavioural changes reported by informant. Cognitive assessment recommended."
            
            # Find all textareas again and locate the ones near the bottom
            all_textareas = await page.query_selector_all("textarea")
            print(f"Found {len(all_textareas)} total textareas")
            
            # Try to find by looking near "Overall Summary" text
            overall_textarea = await page.query_selector("textarea:near(:text('Overall Summary'))")
            if overall_textarea:
                await overall_textarea.fill(summary_text)
                await asyncio.sleep(0.5)
                print(f"✓ Typed into Overall Summary")
            else:
                # Fallback: use one of the last few textareas
                if len(all_textareas) > 3:
                    await all_textareas[-3].fill(summary_text)
                    await asyncio.sleep(0.5)
                    print(f"✓ Typed into Overall Summary (fallback)")
            
            # Type into What We Agreed Today
            print("\nTyping into What We Agreed Today...")
            agreed_text = "1. Referral to sleep clinic\\n2. Self-referral to IAPT for anxiety/depression\\n3. Follow-up appointment in 6 weeks for cognitive assessment"
            
            agreed_textarea = await page.query_selector("textarea:near(:text('What We Agreed Today'))")
            if agreed_textarea:
                await agreed_textarea.fill(agreed_text)
                await asyncio.sleep(0.5)
                print(f"✓ Typed into What We Agreed Today")
            else:
                if len(all_textareas) > 2:
                    await all_textareas[-2].fill(agreed_text)
                    await asyncio.sleep(0.5)
                    print(f"✓ Typed into What We Agreed Today (fallback)")
            
            # Final screenshot
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/walkthrough_16_bottom_complete.png", full_page=False)
            print("📸 Screenshot: walkthrough_16_bottom_complete.png (Final with typed inserts)")
            
            # Full page screenshot
            print("\nTaking full page screenshot...")
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/walkthrough_17_fullpage.png", full_page=True)
            print("📸 Screenshot: walkthrough_17_fullpage.png")
            
            # ═══════════════════════════════════════════════════════════════
            # STEP 7: SUMMARY
            # ═══════════════════════════════════════════════════════════════
            print("\n" + "=" * 80)
            print("WALKTHROUGH COMPLETE - SUMMARY")
            print("=" * 80)
            
            print("\n✅ Screenshots captured:")
            print("   01: Landing page")
            print("   02: After data injection")
            print("   03: PSQI with data")
            print("   04: Epworth with data")
            print("   05: GAD-7 with data")
            print("   06: Report top (header, About)")
            print("   07: Sleep section with clinical notes box")
            print("   08: Sleep notes typed")
            print("   09: Mood notes typed")
            print("   10: Alcohol section")
            print("   11: Diet section")
            print("   12: Quality of Life (CASP-19 chart)")
            print("   13: Hearing section")
            print("   14: Changes Noticed (radar charts)")
            print("   15: Bottom before typing")
            print("   16: Bottom with inserts typed")
            print("   17: Full page")
            
            if console_errors:
                print(f"\n⚠ Console errors: {len(console_errors)}")
                for err in console_errors[:5]:
                    print(f"   {err}")
            else:
                print("\n✅ No console errors")
            
            print("\n" + "=" * 80)
            
            await asyncio.sleep(5)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/walkthrough_error.png", full_page=True)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
