#!/usr/bin/env python3
"""
Test Clinical Notes Textareas and Language
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
            print("CLINICAL NOTES TEXTAREAS & LANGUAGE TEST")
            print("=" * 80)
            
            # Step 1: Navigate
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"\nStep 1: Navigating to {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(2)
            print("   ✓ Page loaded")
            
            # Step 2: Inject test data
            print("\nStep 2: Injecting test data...")
            
            inject_script = """
            (function() {
              var psqi = BHM.State.getSession().instruments.psqi;
              Object.assign(psqi, {q1_bedtime:'22:30', q2_latency_min:'30', q3_waketime:'07:00', q4_sleep_hours:6, q5a:2, q5b:3, q5c:1, q5d:0, q5e:0, q5f:2, q5g:3, q5h:0, q5i:1, q5j:0, q6_medication:0, q7_drowsiness:2, q8_enthusiasm:2, q9_quality:2, q10_partner:0});
              BHM.Scoring.psqi();
              var ep = BHM.State.getSession().instruments.epworth;
              Object.assign(ep, {e1:1, e2:2, e3:3, e4:2, e5:1, e6:0, e7:1, e8:3});
              BHM.Scoring.epworth();
              var gad = BHM.State.getSession().instruments.gad7;
              Object.assign(gad, {g1:2, g2:3, g3:2, g4:1, g5:0, g6:1, g7:2, impairment:'somewhat'});
              BHM.Scoring.gad7();
              var dep = BHM.State.getSession().instruments.depression;
              Object.assign(dep, {d1:'no', d2:'yes', d3:'yes', d4:'no', d5:'no', d6:'yes', d7:'no', d8:'yes', d9:'yes', d10:'yes', d11:'yes', d12:'no', d13:'no', d14:'no', d15:'no'});
              BHM.Scoring.depression();
              var aud = BHM.State.getSession().instruments.auditTool;
              Object.assign(aud, {a1:2, a2:1, a3:1, a4:0, a5:0, a6:0, a7:1, a8:0, a9:0, a10:0});
              BHM.Scoring.auditTool();
              var diet = BHM.State.getSession().instruments.diet;
              Object.assign(diet, {md1:'yes', md2:'no', md3:'yes', md4:'no', md5:'yes', md6:'yes', md7:'yes', md8:'no', md9:'no', md10:'yes', md11:'yes', md12:'yes', md13:'yes', md14:'no'});
              BHM.Scoring.diet();
              var casp = BHM.State.getSession().instruments.casp19;
              Object.assign(casp, {c1:1, c2:2, c3:1, c4:2, c5:1, c6:0, c7:0, c8:2, c9:1, c10:0, c11:0, c12:0, c13:0, c14:0, c15:2, c16:2, c17:1, c18:1, c19:2});
              BHM.Scoring.casp19();
              var hear = BHM.State.getSession().instruments.hearing;
              Object.assign(hear, {hs1:'no', hs2:'yes', hs3:'yes', hs4:'yes', hs5:'yes', hs6:'no', hs7:'yes', hs8:'yes', hs9:'no', hs10:'yes', hs11:'no', hs12:'no', hs13:'yes', hs14:'yes', hs15:'yes', hs16:'no', hs17:'no', top1:'4', top2:'10', top3:'13'});
              BHM.Scoring.hearing();
              console.log('Done');
              return 'Complete';
            })();
            """
            
            result = await page.evaluate(inject_script)
            print(f"   ✓ Data injection result: {result}")
            await asyncio.sleep(1)
            
            # Step 3: Navigate to Report tab
            print("\nStep 3: Opening Report tab...")
            await page.click("#tab-report")
            await asyncio.sleep(2)
            print("   ✓ Report tab opened")
            
            # Step 4: Take screenshot
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/notes_test_01_top.png", full_page=False)
            print("   📸 Screenshot: notes_test_01_top.png")
            
            # Step 5: Count clinical notes textareas
            print("\nStep 5: Counting clinical notes textareas...")
            
            # Look for textareas with "Clinical notes" label
            all_textareas = await page.query_selector_all("textarea")
            print(f"   Total textareas found: {len(all_textareas)}")
            
            # Look for yellow dashed boxes
            yellow_boxes = await page.query_selector_all("textarea[style*='dashed'], .clinical-notes, textarea.insert-box")
            print(f"   Yellow dashed box textareas: {len(yellow_boxes)}")
            
            # Search for "Clinical notes" text
            clinical_notes_labels = await page.query_selector_all("text=Clinical notes")
            print(f"   'Clinical notes' labels found: {len(clinical_notes_labels)}")
            
            # List each clinical notes section
            print("\n   Looking for specific clinical notes sections:")
            sections = [
                "Sleep", "Mood and Worry", "Alcohol", "Diet Pattern", 
                "Quality of Life", "Hearing", "Changes Noticed", 
                "Clinician Interview", "Staging", "Neuropsychological", "Lewy Body"
            ]
            
            for section in sections:
                label = await page.query_selector(f"text=Clinical notes — {section}")
                if not label:
                    label = await page.query_selector(f"text=Clinical notes{section}")
                if label:
                    print(f"      ✓ Found: Clinical notes — {section}")
                else:
                    print(f"      ⚠ Missing: Clinical notes — {section}")
            
            # Check for overall inserts
            print("\n   Looking for overall insert sections:")
            overall_sections = [
                "Overall Summary",
                "What We Agreed Today",
                "Safety and Follow-up"
            ]
            
            for section in overall_sections:
                label = await page.query_selector(f"text={section}")
                if label:
                    print(f"      ✓ Found: {section}")
                else:
                    print(f"      ⚠ Missing: {section}")
            
            # Step 6: Check for "your clinician" text
            print("\nStep 6: Checking for 'your clinician' references...")
            
            # Get all text content
            page_text = await page.evaluate("document.body.innerText")
            
            # Check for various forms
            your_clinician_count = page_text.lower().count("your clinician")
            
            if your_clinician_count > 0:
                print(f"   ❌ FOUND {your_clinician_count} instance(s) of 'your clinician'")
                
                # Try to find context
                lines = page_text.split('\n')
                for i, line in enumerate(lines):
                    if 'your clinician' in line.lower():
                        print(f"      Line {i}: {line.strip()[:100]}")
            else:
                print("   ✅ NO instances of 'your clinician' found")
            
            # Scroll through report and take screenshots
            print("\nStep 7: Scrolling through report...")
            
            scroll_positions = [0, 1000, 2000, 3000, 4000, 5000, 6000]
            for i, pos in enumerate(scroll_positions[1:], 2):
                await page.evaluate(f"window.scrollTo(0, {pos})")
                await asyncio.sleep(0.8)
                await page.screenshot(path=f"/home/tenebris/Desktop/BHMApp/notes_test_{i:02d}_scroll.png", full_page=False)
                print(f"   📸 Screenshot: notes_test_{i:02d}_scroll.png")
            
            # Scroll to very bottom
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/notes_test_08_bottom.png", full_page=False)
            print("   📸 Screenshot: notes_test_08_bottom.png")
            
            # Full page screenshot
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/notes_test_09_fullpage.png", full_page=True)
            print("   📸 Screenshot: notes_test_09_fullpage.png")
            
            # Console errors check
            print("\n" + "=" * 80)
            print("RESULTS SUMMARY")
            print("=" * 80)
            
            print(f"\n✅ Total textareas: {len(all_textareas)}")
            print(f"✅ 'Clinical notes' labels: {len(clinical_notes_labels)}")
            
            if your_clinician_count > 0:
                print(f"\n❌ 'your clinician' references: {your_clinician_count}")
            else:
                print(f"\n✅ 'your clinician' references: 0")
            
            if console_errors:
                print(f"\n⚠ Console errors: {len(console_errors)}")
                for err in console_errors[:5]:
                    print(f"   {err}")
            else:
                print("\n✅ Console errors: 0")
            
            print("\n" + "=" * 80)
            print("TEST COMPLETED")
            print("=" * 80)
            
            await asyncio.sleep(5)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/notes_test_error.png", full_page=True)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
