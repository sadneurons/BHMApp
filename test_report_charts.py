#!/usr/bin/env python3
"""
Comprehensive BHM Report Charts Test
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg) if msg.type == "error" else None)
        
        try:
            print("=" * 80)
            print("BHM REPORT CHARTS COMPREHENSIVE TEST")
            print("=" * 80)
            
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"\nNavigating to {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(1.5)
            print("   ✓ Page loaded")
            
            # ═══════════════════════════════════════════════════════════════
            # STEP 1: RBANS DATA ENTRY
            # ═══════════════════════════════════════════════════════════════
            print("\n" + "=" * 80)
            print("STEP 1: RBANS DATA ENTRY")
            print("=" * 80)
            
            await page.click("#tab-rbans")
            await asyncio.sleep(1)
            print("\n✓ RBANS tab opened")
            
            # Demographics
            print("\nFilling demographics...")
            await page.fill("#rbans-topf", "50")
            await page.fill("#rbans-age", "65")
            await page.fill("#rbans-years_of_education", "16")
            await page.click("input.rbans-radio[data-key='gender'][value='Male']")
            await page.click("input.rbans-radio[data-key='ethnicity'][value='White']")
            print("   ✓ Demographics filled")
            
            # Subtests
            print("\nFilling subtest scores...")
            subtests = [
                ("listlearning", "25"), ("storylearning", "16"), ("figurecopy", "15"),
                ("lineorientation", "14"), ("naming", "8"), ("semanticfluency", "20"),
                ("digitspan", "10"), ("coding", "40"), ("listrecall", "5"),
                ("listrecog", "17"), ("storyrecall", "8"), ("figurerecall", "12")
            ]
            
            for field_id, value in subtests:
                await page.fill(f"#rbans-{field_id}", value)
                await asyncio.sleep(0.05)
            print("   ✓ All subtests filled")
            
            # Calculate
            print("\nCalculating scores...")
            await page.click("#rbans-calculate-btn")
            await asyncio.sleep(2)
            print("   ✓ Scores calculated")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/report_test_01_rbans_calculated.png", full_page=False)
            print("   📸 Screenshot: report_test_01_rbans_calculated.png")
            
            # ═══════════════════════════════════════════════════════════════
            # STEP 2: MBI-C DATA ENTRY
            # ═══════════════════════════════════════════════════════════════
            print("\n" + "=" * 80)
            print("STEP 2: MBI-C DATA ENTRY")
            print("=" * 80)
            
            await page.click("#tab-informant")
            await asyncio.sleep(1)
            await page.click("button[data-bs-target='#sub-mbic']")
            await asyncio.sleep(1)
            print("\n✓ MBI-C tab opened")
            
            # Click some cells for the first 10 items with varying severities
            print("\nFilling MBI-C items...")
            severities = [1, 2, 0, 1, 3, 2, 1, 0, 2, 1]
            
            for i, severity in enumerate(severities, 1):
                try:
                    # Try to find and click cells
                    selector = f"button.cdr-ws-btn[data-val='{severity}']"
                    buttons = await page.query_selector_all(selector)
                    if buttons and i-1 < len(buttons):
                        await buttons[i-1].click()
                        await asyncio.sleep(0.2)
                        print(f"   ✓ Item {i}: severity {severity}")
                except Exception as e:
                    print(f"   ⚠ Item {i}: could not click - {e}")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/report_test_02_mbic_filled.png", full_page=False)
            print("   📸 Screenshot: report_test_02_mbic_filled.png")
            
            # ═══════════════════════════════════════════════════════════════
            # STEP 3: NPI-Q DATA ENTRY
            # ═══════════════════════════════════════════════════════════════
            print("\n" + "=" * 80)
            print("STEP 3: NPI-Q DATA ENTRY")
            print("=" * 80)
            
            await page.click("button[data-bs-target='#sub-npiq']")
            await asyncio.sleep(1)
            print("\n✓ NPI-Q tab opened")
            
            # Click Yes for first 5 symptoms and set severity/distress
            print("\nFilling NPI-Q symptoms...")
            symptoms = [
                ("delusions", 2, 3),
                ("hallucinations", 1, 2),
                ("agitation", 3, 4),
                ("depression", 2, 3),
                ("anxiety", 2, 2)
            ]
            
            for symptom, severity, distress in symptoms:
                try:
                    # Click Yes button
                    yes_btn = await page.query_selector(f"button[data-key='{symptom}'][data-val='yes']")
                    if yes_btn:
                        await yes_btn.click()
                        await asyncio.sleep(0.3)
                        
                        # Click severity
                        sev_btn = await page.query_selector(f"button[data-key='{symptom}_severity'][data-val='{severity}']")
                        if sev_btn:
                            await sev_btn.click()
                            await asyncio.sleep(0.2)
                        
                        # Click distress
                        dist_btn = await page.query_selector(f"button[data-key='{symptom}_distress'][data-val='{distress}']")
                        if dist_btn:
                            await dist_btn.click()
                            await asyncio.sleep(0.2)
                        
                        print(f"   ✓ {symptom}: Yes, severity={severity}, distress={distress}")
                except Exception as e:
                    print(f"   ⚠ {symptom}: error - {e}")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/report_test_03_npiq_filled.png", full_page=False)
            print("   📸 Screenshot: report_test_03_npiq_filled.png")
            
            # ═══════════════════════════════════════════════════════════════
            # STEP 4: CHECK THE REPORT
            # ═══════════════════════════════════════════════════════════════
            print("\n" + "=" * 80)
            print("STEP 4: CHECK THE REPORT")
            print("=" * 80)
            
            await page.click("#tab-report")
            await asyncio.sleep(2)
            print("\n✓ Report tab opened")
            
            # Top of report
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/report_test_04_report_top.png", full_page=False)
            print("   📸 Screenshot: report_test_04_report_top.png")
            
            # Look for charts as we scroll
            print("\n" + "-" * 80)
            print("CHECKING FOR CHARTS IN REPORT")
            print("-" * 80)
            
            # Check for PSQI chart
            psqi_chart = await page.query_selector("canvas[id*='psqi'], #chart-psqi")
            if psqi_chart:
                print("   ✅ PSQI bar chart FOUND")
            else:
                print("   ❌ PSQI bar chart NOT FOUND")
            
            # Check for Epworth (should NOT be chart)
            epworth_chart = await page.query_selector("canvas[id*='epworth'], #chart-epworth")
            if epworth_chart:
                print("   ⚠ Epworth chart FOUND (should be text only)")
            else:
                print("   ✅ Epworth chart correctly NOT present (text only)")
            
            # Scroll to Changes section (MBI-C, NPI-Q)
            print("\nScrolling to 'Changes Noticed by Family or Friends' section...")
            changes_section = await page.query_selector("text=Changes Noticed")
            if changes_section:
                await changes_section.scroll_into_view_if_needed()
                await asyncio.sleep(1)
                await page.evaluate("window.scrollBy(0, -100)")
                await asyncio.sleep(0.5)
                print("   ✓ Found Changes section")
            else:
                # Manual scroll
                for i in range(5):
                    await page.evaluate("window.scrollBy(0, 800)")
                    await asyncio.sleep(0.5)
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/report_test_05_changes_section.png", full_page=False)
            print("   📸 Screenshot: report_test_05_changes_section.png")
            
            # Check for MBI-C radar
            mbic_chart = await page.query_selector("canvas[id*='mbic'], #chart-mbic")
            if mbic_chart:
                print("   ✅ MBI-C RADAR chart FOUND")
            else:
                print("   ❌ MBI-C RADAR chart NOT FOUND")
            
            # Check for NPI-Q radar
            npiq_chart = await page.query_selector("canvas[id*='npiq'], #chart-npiq")
            if npiq_chart:
                print("   ✅ NPI-Q RADAR chart FOUND")
            else:
                print("   ❌ NPI-Q RADAR chart NOT FOUND")
            
            # Scroll to Staging section
            print("\nScrolling to 'Staging' section...")
            staging_section = await page.query_selector("text=Staging, h4:has-text('Staging')")
            if staging_section:
                await staging_section.scroll_into_view_if_needed()
                await asyncio.sleep(1)
                await page.evaluate("window.scrollBy(0, -100)")
                await asyncio.sleep(0.5)
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/report_test_06_staging_section.png", full_page=False)
            print("   📸 Screenshot: report_test_06_staging_section.png")
            
            # Check for CDR radar
            cdr_chart = await page.query_selector("canvas[id*='cdr'], #chart-cdr")
            if cdr_chart:
                print("   ✅ CDR RADAR chart FOUND")
            else:
                print("   ℹ CDR RADAR chart not present (CDR not completed)")
            
            # Scroll to RBANS section
            print("\nScrolling to 'Neuropsychological Assessment (RBANS)' section...")
            rbans_section = await page.query_selector("text=Neuropsychological Assessment")
            if rbans_section:
                await rbans_section.scroll_into_view_if_needed()
                await asyncio.sleep(1)
                await page.evaluate("window.scrollBy(0, -100)")
                await asyncio.sleep(0.5)
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/report_test_07_rbans_section.png", full_page=False)
            print("   📸 Screenshot: report_test_07_rbans_section.png")
            
            # Check for RBANS line chart
            rbans_chart = await page.query_selector("canvas[id*='rbans'], #chart-rbans")
            if rbans_chart:
                print("   ✅ RBANS LINE chart FOUND")
            else:
                print("   ❌ RBANS LINE chart NOT FOUND")
            
            # Check for Classification column in table
            classification = await page.query_selector("text=Classification")
            if classification:
                print("   ✅ Classification column FOUND in RBANS table")
            else:
                print("   ❌ Classification column NOT FOUND")
            
            # Check for domain narratives
            print("\n   Checking for RBANS domain narratives...")
            narratives = [
                ("Immediate Memory", "immediatemem"),
                ("Visuospatial", "visuospatial"),
                ("Language", "language"),
                ("Attention", "attention"),
                ("Delayed Memory", "delayedmem"),
                ("Overall", "overall")
            ]
            
            for narrative_name, _ in narratives:
                found = await page.query_selector(f"text={narrative_name}")
                if found:
                    print(f"      ✅ {narrative_name} narrative found")
                else:
                    print(f"      ❌ {narrative_name} narrative NOT found")
            
            # Scroll down more to see supplementary indices
            print("\nScrolling to see supplementary indices...")
            await page.evaluate("window.scrollBy(0, 600)")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/report_test_08_rbans_lower.png", full_page=False)
            print("   📸 Screenshot: report_test_08_rbans_lower.png")
            
            # Check for supplementary indices
            effort_indices = await page.query_selector("text=Effort Indices, text=Silverberg")
            if effort_indices:
                print("   ✅ Supplementary indices (Effort) FOUND")
            else:
                print("   ❌ Supplementary indices NOT FOUND")
            
            # Take full page screenshot
            print("\nTaking full page screenshot...")
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/report_test_09_fullpage.png", full_page=True)
            print("   📸 Screenshot: report_test_09_fullpage.png")
            
            # Check for JavaScript errors
            print("\n" + "-" * 80)
            print("CHECKING FOR ERRORS")
            print("-" * 80)
            if console_errors:
                print(f"   ⚠ Found {len(console_errors)} console error(s):")
                for error in console_errors[:10]:
                    print(f"      - {error.text}")
            else:
                print("   ✅ No JavaScript errors detected")
            
            print("\n" + "=" * 80)
            print("TEST COMPLETED")
            print("=" * 80)
            print("\n📸 All screenshots saved in /home/tenebris/Desktop/BHMApp/")
            
            await asyncio.sleep(5)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/report_test_error.png", full_page=True)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
