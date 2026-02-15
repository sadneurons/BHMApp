#!/usr/bin/env python3
"""
Test BHM Granular Plain-Language Report
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        console_messages = []
        console_errors = []
        page.on("console", lambda msg: (
            console_messages.append(msg.text) if msg.type == "log" else
            console_errors.append(msg.text) if msg.type == "error" else None
        ))
        
        try:
            print("=" * 80)
            print("BHM GRANULAR PLAIN-LANGUAGE REPORT TEST")
            print("=" * 80)
            
            # Step 1: Navigate
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"\nStep 1: Navigating to {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(2)
            print("   ✓ Page loaded")
            
            # Step 2: Inject comprehensive test data
            print("\nStep 2: Injecting comprehensive test data...")
            
            inject_script = """
            (function() {
              // PSQI
              var psqi = BHM.State.getSession().instruments.psqi;
              Object.assign(psqi, {q1_bedtime:'22:30', q2_latency_min:'30', q3_waketime:'07:00', q4_sleep_hours:6, q5a:2, q5b:3, q5c:1, q5d:0, q5e:0, q5f:2, q5g:3, q5h:0, q5i:1, q5j:0, q6_medication:0, q7_drowsiness:2, q8_enthusiasm:2, q9_quality:2, q10_partner:0});
              BHM.Scoring.psqi();
              console.log('✓ PSQI data injected');

              // Epworth  
              var ep = BHM.State.getSession().instruments.epworth;
              Object.assign(ep, {e1:1, e2:2, e3:3, e4:2, e5:1, e6:0, e7:1, e8:3});
              BHM.Scoring.epworth();
              console.log('✓ Epworth data injected');

              // GAD-7
              var gad = BHM.State.getSession().instruments.gad7;
              Object.assign(gad, {g1:2, g2:3, g3:2, g4:1, g5:0, g6:1, g7:2, impairment:'somewhat'});
              BHM.Scoring.gad7();
              console.log('✓ GAD-7 data injected');

              // GDS-15
              var dep = BHM.State.getSession().instruments.depression;
              Object.assign(dep, {d1:'no', d2:'yes', d3:'yes', d4:'no', d5:'no', d6:'yes', d7:'no', d8:'yes', d9:'yes', d10:'yes', d11:'yes', d12:'no', d13:'no', d14:'no', d15:'no'});
              BHM.Scoring.depression();
              console.log('✓ Depression data injected');

              // AUDIT
              var aud = BHM.State.getSession().instruments.auditTool;
              Object.assign(aud, {a1:2, a2:1, a3:1, a4:0, a5:0, a6:0, a7:1, a8:0, a9:0, a10:0});
              BHM.Scoring.auditTool();
              console.log('✓ AUDIT data injected');

              // Diet  
              var diet = BHM.State.getSession().instruments.diet;
              Object.assign(diet, {md1:'yes', md2:'no', md3:'yes', md4:'no', md5:'yes', md6:'yes', md7:'yes', md8:'no', md9:'no', md10:'yes', md11:'yes', md12:'yes', md13:'yes', md14:'no'});
              BHM.Scoring.diet();
              console.log('✓ Diet data injected');

              // CASP-19
              var casp = BHM.State.getSession().instruments.casp19;
              Object.assign(casp, {c1:1, c2:2, c3:1, c4:2, c5:1, c6:0, c7:0, c8:2, c9:1, c10:0, c11:0, c12:0, c13:0, c14:0, c15:2, c16:2, c17:1, c18:1, c19:2});
              BHM.Scoring.casp19();
              console.log('✓ CASP-19 data injected');

              // Hearing
              var hear = BHM.State.getSession().instruments.hearing;
              Object.assign(hear, {hs1:'no', hs2:'yes', hs3:'yes', hs4:'yes', hs5:'yes', hs6:'no', hs7:'yes', hs8:'yes', hs9:'no', hs10:'yes', hs11:'no', hs12:'no', hs13:'yes', hs14:'yes', hs15:'yes', hs16:'no', hs17:'no', top1:'4', top2:'10', top3:'13'});
              BHM.Scoring.hearing();
              console.log('✓ Hearing data injected');
              
              console.log('All test data injected successfully');
              return 'Complete';
            })();
            """
            
            result = await page.evaluate(inject_script)
            print(f"   ✓ Data injection result: {result}")
            
            await asyncio.sleep(1)
            
            # Check console messages
            print("\n   Console messages:")
            for msg in console_messages[-10:]:
                print(f"      {msg}")
            
            if console_errors:
                print("\n   ⚠ Console errors detected:")
                for err in console_errors:
                    print(f"      {err}")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/report_granular_01_after_injection.png", full_page=False)
            print("\n   📸 Screenshot: report_granular_01_after_injection.png")
            
            # Step 3: Navigate to Report tab
            print("\nStep 3: Opening Report tab...")
            await page.click("#tab-report")
            await asyncio.sleep(2)
            print("   ✓ Report tab opened")
            
            # Top of report
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/report_granular_02_top.png", full_page=False)
            print("   📸 Screenshot: report_granular_02_top.png")
            
            # Step 4: Check for granular content sections
            print("\nStep 4: Checking for granular report sections...")
            
            sections = [
                ("Sleep", "PSQI"),
                ("Mood and Worry", "GAD-7"),
                ("Alcohol", "AUDIT"),
                ("Diet Pattern", "Mediterranean"),
                ("Quality of Life", "CASP"),
                ("Hearing", "hearing")
            ]
            
            for section_name, keyword in sections:
                section = await page.query_selector(f"text={section_name}")
                if section:
                    print(f"   ✓ Found '{section_name}' section")
                else:
                    print(f"   ⚠ '{section_name}' section not found")
            
            # Scroll through report and take screenshots
            print("\nStep 5: Scrolling through report sections...")
            
            scroll_positions = [0, 800, 1600, 2400, 3200, 4000, 4800, 5600]
            for i, pos in enumerate(scroll_positions):
                await page.evaluate(f"window.scrollTo(0, {pos})")
                await asyncio.sleep(0.8)
                await page.screenshot(path=f"/home/tenebris/Desktop/BHMApp/report_granular_scroll_{i+3:02d}.png", full_page=False)
                print(f"   📸 Screenshot: report_granular_scroll_{i+3:02d}.png")
            
            # Step 6: Check for MI tone elements (italics)
            print("\nStep 6: Checking for MI tone (empathetic italicized text)...")
            
            # Look for italic elements
            italic_elements = await page.query_selector_all("em, i, .fst-italic, [style*='italic']")
            print(f"   Found {len(italic_elements)} italic text elements")
            
            # Sample some italic text
            if len(italic_elements) > 0:
                print("   Sample italic text found:")
                for i, elem in enumerate(italic_elements[:5]):
                    try:
                        text = await elem.inner_text()
                        if len(text) > 50:
                            print(f"      {i+1}. {text[:80]}...")
                        else:
                            print(f"      {i+1}. {text}")
                    except:
                        pass
            
            # Check for specific MI phrases
            mi_phrases = [
                "It looks like",
                "You mentioned",
                "This suggests",
                "might be worth",
                "consider",
                "may want"
            ]
            
            print("\n   Checking for MI-style phrases:")
            for phrase in mi_phrases:
                found = await page.query_selector(f"text={phrase}")
                if found:
                    print(f"      ✓ Found phrase: '{phrase}'")
            
            # Full page screenshot
            print("\nStep 7: Taking full page screenshot...")
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/report_granular_fullpage.png", full_page=True)
            print("   📸 Screenshot: report_granular_fullpage.png")
            
            # Final console check
            print("\n" + "=" * 80)
            print("FINAL STATUS")
            print("=" * 80)
            
            if console_errors:
                print(f"\n⚠ JavaScript Errors: {len(console_errors)}")
                for err in console_errors[:5]:
                    print(f"   {err}")
            else:
                print("\n✅ No JavaScript errors detected")
            
            print(f"\n✅ Total console messages: {len(console_messages)}")
            print(f"✅ All screenshots saved to /home/tenebris/Desktop/BHMApp/")
            
            print("\n" + "=" * 80)
            print("TEST COMPLETED")
            print("=" * 80)
            
            await asyncio.sleep(5)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/report_granular_error.png", full_page=True)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
