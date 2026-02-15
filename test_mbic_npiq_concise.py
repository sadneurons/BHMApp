#!/usr/bin/env python3
"""
Test MBI-C and NPI-Q report sections for conciseness
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
            print("MBI-C AND NPI-Q CONCISE REPORT TEST")
            print("=" * 80)
            
            # Step 1: Navigate
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"\nStep 1: Loading {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(2)
            print("   ✓ Page loaded")
            
            # Step 2: Inject MBI-C and NPI-Q test data
            print("\nStep 2: Injecting MBI-C and NPI-Q test data...")
            
            inject_script = """
            (function() {
              var mb = BHM.State.getSession().instruments.mbiC;
              // Motivation & drive (6 items: imd1-imd6)
              mb.imd1 = 0; mb.imd2 = 1; mb.imd3 = 2; mb.imd4 = 1; mb.imd5 = 2; mb.imd6 = 0;
              // Mood & anxiety (6 items: ma1-ma6)
              mb.ma1 = 0; mb.ma2 = 2; mb.ma3 = 2; mb.ma4 = 2; mb.ma5 = 3; mb.ma6 = 0;
              // Impulse control (9 items: dg1-dg9)
              mb.dg1 = 1; mb.dg2 = 0; mb.dg3 = 1; mb.dg4 = 0; mb.dg5 = 1; mb.dg6 = 1; mb.dg7 = 2; mb.dg8 = 2; mb.dg9 = 0;
              // Social appropriateness (5 items: sn1-sn5)
              mb.sn1 = 1; mb.sn2 = 2; mb.sn3 = 2; mb.sn4 = 1; mb.sn5 = 0;
              // Beliefs & perception (5 items: bp1-bp5)
              mb.bp1 = 1; mb.bp2 = 2; mb.bp3 = 3; mb.bp4 = 2; mb.bp5 = 0;
              
              var npi = BHM.State.getSession().instruments.npiQ;
              // NPI-Q: present some symptoms
              npi.delusions_present = 'yes'; npi.delusions_severity = 2; npi.delusions_distress = 3;
              npi.hallucinations_present = 'yes'; npi.hallucinations_severity = 3; npi.hallucinations_distress = 4;
              npi.agitation_present = 'yes'; npi.agitation_severity = 1; npi.agitation_distress = 2;
              npi.depression_present = 'yes'; npi.depression_severity = 2; npi.depression_distress = 3;
              npi.anxiety_present = 'yes'; npi.anxiety_severity = 2; npi.anxiety_distress = 2;
              npi.elation_present = 'no';
              npi.apathy_present = 'yes'; npi.apathy_severity = 1; npi.apathy_distress = 1;
              npi.disinhibition_present = 'no';
              npi.irritability_present = 'yes'; npi.irritability_severity = 2; npi.irritability_distress = 3;
              npi.motorBehaviour_present = 'no';
              npi.nightBehaviour_present = 'yes'; npi.nightBehaviour_severity = 1; npi.nightBehaviour_distress = 2;
              npi.appetite_present = 'no';
              
              BHM.Scoring.mbiC();
              BHM.Scoring.npiQ();
              BHM.Report.update();
              console.log('Informant data injected');
              return 'Done';
            })();
            """
            
            result = await page.evaluate(inject_script)
            print(f"   ✓ Data injection: {result}")
            await asyncio.sleep(1)
            
            # Step 3: Click Report tab
            print("\nStep 3: Clicking Report tab...")
            await page.click("#tab-report")
            await asyncio.sleep(2)
            print("   ✓ Report tab opened")
            
            # Step 4: Scroll to "Changes Noticed by Family or Friends" section
            print("\nStep 4: Scrolling to 'Changes Noticed by Family or Friends' section...")
            
            found = False
            for i in range(25):
                scroll_pos = i * 700
                await page.evaluate(f"window.scrollTo(0, {scroll_pos})")
                await asyncio.sleep(0.4)
                
                visible_text = await page.evaluate("""
                    () => {
                        const headings = Array.from(document.querySelectorAll('h3, h4, h5'));
                        const visible = headings.filter(h => {
                            const rect = h.getBoundingClientRect();
                            return rect.top >= 0 && rect.top < window.innerHeight;
                        });
                        return visible.map(h => h.textContent.trim()).join(' | ');
                    }
                """)
                
                if 'Changes Noticed' in visible_text or 'Family or Friends' in visible_text:
                    print(f"   ✓ Found section at {scroll_pos}px")
                    found = True
                    break
            
            if not found:
                print("   ⚠ Section not found, continuing anyway")
            
            # Step 5: Take screenshots
            print("\nStep 5-6: Taking screenshots of MBI-C and NPI-Q sections...")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/mbic_npiq_01.png", full_page=False)
            print("   📸 mbic_npiq_01.png")
            
            await page.evaluate("window.scrollBy(0, 450)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/mbic_npiq_02.png", full_page=False)
            print("   📸 mbic_npiq_02.png")
            
            await page.evaluate("window.scrollBy(0, 450)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/mbic_npiq_03.png", full_page=False)
            print("   📸 mbic_npiq_03.png")
            
            await page.evaluate("window.scrollBy(0, 450)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/mbic_npiq_04.png", full_page=False)
            print("   📸 mbic_npiq_04.png")
            
            # Step 7-8: Extract text content
            print("\nStep 7-8: Extracting MBI-C and NPI-Q narrative text...")
            
            text_content = await page.evaluate("""
                () => {
                    // Find the "Changes Noticed" section
                    const allText = document.body.innerText;
                    const changesIndex = allText.indexOf('Changes Noticed');
                    
                    if (changesIndex === -1) return 'Section not found';
                    
                    // Extract text from Changes Noticed to the next major section
                    const afterChanges = allText.substring(changesIndex);
                    
                    // Find the end (next major section)
                    const nextSections = ['Clinical Interview', 'Staging', 'Neuropsychological'];
                    let endIndex = afterChanges.length;
                    
                    for (const section of nextSections) {
                        const idx = afterChanges.indexOf(section);
                        if (idx > 0 && idx < endIndex) {
                            endIndex = idx;
                        }
                    }
                    
                    return afterChanges.substring(0, endIndex).trim();
                }
            """)
            
            print("\n" + "=" * 80)
            print("MBI-C AND NPI-Q SECTION TEXT (VERBATIM)")
            print("=" * 80)
            print(text_content)
            print("=" * 80)
            
            # Step 9: Check for verbose patterns
            print("\nChecking for conciseness...")
            
            issues = []
            
            # Check if the text is too long (rough heuristic)
            if len(text_content) > 3000:
                issues.append("   ⚠ Text seems very long (>3000 chars)")
            
            # Check for verbose patterns
            if 'Does the person lack curiosity' in text_content:
                issues.append("   ❌ Contains full question text (should be concise)")
            
            if text_content.lower().count('mild') > 10:
                issues.append("   ⚠ Word 'mild' appears many times (possible verbosity)")
            
            # Check for table presence
            if 'Domain' in text_content and 'Score' in text_content:
                print("   ✅ MBI-C table present (Domain/Score columns)")
            else:
                print("   ⚠ MBI-C summary table not found")
            
            # Check for severity grouping
            if 'Severe' in text_content and 'Moderate' in text_content:
                print("   ✅ Severity grouping present")
            else:
                print("   ⚠ Severity grouping not found")
            
            if issues:
                print("\n⚠️ POTENTIAL VERBOSITY ISSUES:")
                for issue in issues:
                    print(issue)
            else:
                print("\n✅ NO VERBOSITY ISSUES DETECTED")
            
            # Check console errors
            if console_errors:
                print(f"\n⚠ Console errors: {len(console_errors)}")
                for err in console_errors[:3]:
                    print(f"   {err}")
            else:
                print("\n✅ No console errors")
            
            await asyncio.sleep(3)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/mbic_npiq_error.png", full_page=True)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
