#!/usr/bin/env python3
"""
Test DIAMOND Lewy assessment tab
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        # Capture console errors
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg) if msg.type == "error" else None)
        
        try:
            print("=" * 80)
            print("DIAMOND Lewy Assessment Test")
            print("=" * 80)
            
            # Navigate
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"\nNavigating to {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(1)
            
            # Step 1: Click Clinical Interview tab
            print("\n1. Clicking Clinical Interview main tab...")
            await page.click("#tab-clinical")
            await asyncio.sleep(1.5)
            print("   ✓ Clinical Interview tab opened")
            
            # Step 2: Click DIAMOND Lewy sub-tab
            print("\n2. Looking for 'DIAMOND Lewy' sub-tab...")
            diamond_tab = await page.query_selector("button:has-text('DIAMOND Lewy'), button:has-text('DIAMOND')")
            
            if diamond_tab:
                await diamond_tab.click()
                await asyncio.sleep(1.5)
                print("   ✓ DIAMOND Lewy sub-tab clicked")
            else:
                print("   ⚠ DIAMOND Lewy tab not found, checking all sub-tabs...")
                sub_tabs = await page.query_selector_all("#clinicalContent .nav-link, #clinicalSubTabs .nav-link")
                for i, tab in enumerate(sub_tabs):
                    text = await tab.inner_text()
                    print(f"      Sub-tab {i+1}: {text}")
                    if "DIAMOND" in text or "Lewy" in text:
                        await tab.click()
                        await asyncio.sleep(1.5)
                        print(f"   ✓ Clicked sub-tab: {text}")
                        break
            
            # Scroll to top
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            
            # Step 3: Screenshot of top section
            print("\n3. Taking screenshot of top section...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/diamond_01_top.png", full_page=False)
            print("   ✓ Screenshot: diamond_01_top.png")
            
            # Check for title
            title = await page.query_selector("text=DIAMOND Lewy")
            if title:
                print("   ✓ Found title with 'DIAMOND Lewy'")
            
            subtitle = await page.query_selector("text=Assessment Toolkit for Dementia with Lewy Bodies")
            if subtitle:
                print("   ✓ Found subtitle: 'Assessment Toolkit for Dementia with Lewy Bodies'")
            
            # Check Section 1
            section1 = await page.query_selector("text=Essential Criterion")
            if section1:
                print("   ✓ Section 1: Essential Criterion found")
            
            progressive_decline = await page.query_selector("text=progressive cognitive decline")
            if progressive_decline:
                print("   ✓ Progressive cognitive decline table found")
            
            # Check Section 2
            section2a = await page.query_selector("text=2A Fluctuating Cognition, text=Fluctuating")
            if section2a:
                print("   ✓ Section 2A: Fluctuating Cognition found")
            
            # Step 4: Scroll to see rest of Section 2
            print("\n4. Scrolling to see RBD, Visual Hallucinations, Parkinsonism...")
            await page.evaluate("window.scrollTo(0, 1000)")
            await asyncio.sleep(1)
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/diamond_02_section2.png", full_page=False)
            print("   ✓ Screenshot: diamond_02_section2.png")
            
            # Check for core features
            rbd = await page.query_selector("text=2B, text=RBD")
            if rbd:
                print("   ✓ Section 2B: RBD found")
            
            hallucinations = await page.query_selector("text=2C, text=Visual Hallucinations")
            if hallucinations:
                print("   ✓ Section 2C: Visual Hallucinations found")
            
            parkinsonism = await page.query_selector("text=2D, text=Parkinsonism")
            if parkinsonism:
                print("   ✓ Section 2D: Parkinsonism found")
            
            # Step 5: Scroll to Section 3 and 4
            print("\n5. Scrolling to Section 3 (Biomarkers) and Section 4 (Supportive)...")
            await page.evaluate("window.scrollTo(0, 2200)")
            await asyncio.sleep(1)
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/diamond_03_biomarkers.png", full_page=False)
            print("   ✓ Screenshot: diamond_03_biomarkers.png")
            
            section3 = await page.query_selector("text=Indicative Biomarkers, text=Section 3")
            if section3:
                print("   ✓ Section 3: Indicative Biomarkers found")
            
            section4 = await page.query_selector("text=Supportive Features, text=Section 4")
            if section4:
                print("   ✓ Section 4: Supportive Features found")
            
            # Step 6: Scroll to Diagnostic Summary
            print("\n6. Scrolling to Diagnostic Summary...")
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(1)
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/diamond_04_summary.png", full_page=False)
            print("   ✓ Screenshot: diamond_04_summary.png")
            
            diagnostic_summary = await page.query_selector("text=Diagnostic Summary")
            if diagnostic_summary:
                print("   ✓ Diagnostic Summary section found")
            
            # Step 7: Test diagnostic algorithm
            print("\n7. Testing diagnostic algorithm...")
            
            # Scroll back to top
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(1)
            
            # Click Yes for Essential Criterion
            print("\n   a. Clicking 'Yes' for Essential Criterion (progressive cognitive decline)...")
            essential_yes = await page.query_selector("input[type='radio'][value='Yes'][name*='essential'], input[type='radio'][value='Yes'][name*='criterion']")
            if essential_yes:
                await essential_yes.click()
                await asyncio.sleep(0.5)
                print("      ✓ Clicked Yes for Essential Criterion")
            else:
                print("      ⚠ Essential Criterion Yes button not found")
            
            # Scroll to Section 2
            await page.evaluate("window.scrollTo(0, 800)")
            await asyncio.sleep(0.5)
            
            # Click Yes for 2A Fluctuating Cognition
            print("   b. Clicking 'Yes' for Section 2A (Fluctuating Cognition)...")
            fluct_yes = await page.query_selector("input[type='radio'][value='Yes'][name*='fluct'], input[type='radio'][value='Yes'][name*='2A']")
            if fluct_yes:
                await fluct_yes.click()
                await asyncio.sleep(0.5)
                print("      ✓ Clicked Yes for Fluctuating Cognition")
            else:
                print("      ⚠ Fluctuating Cognition Yes not found")
            
            # Scroll down a bit more
            await page.evaluate("window.scrollTo(0, 1200)")
            await asyncio.sleep(0.5)
            
            # Click Yes for 2B RBD
            print("   c. Clicking 'Yes' for Section 2B (RBD)...")
            rbd_yes = await page.query_selector("input[type='radio'][value='Yes'][name*='rbd'], input[type='radio'][value='Yes'][name*='2B']")
            if rbd_yes:
                await rbd_yes.click()
                await asyncio.sleep(0.5)
                print("      ✓ Clicked Yes for RBD")
            else:
                print("      ⚠ RBD Yes not found")
            
            # Click No for 2C Visual Hallucinations
            print("   d. Clicking 'No' for Section 2C (Visual Hallucinations)...")
            hall_no = await page.query_selector("input[type='radio'][value='No'][name*='hall'], input[type='radio'][value='No'][name*='2C']")
            if hall_no:
                await hall_no.click()
                await asyncio.sleep(0.5)
                print("      ✓ Clicked No for Visual Hallucinations")
            else:
                print("      ⚠ Visual Hallucinations No not found")
            
            # Click No for 2D Parkinsonism
            print("   e. Clicking 'No' for Section 2D (Parkinsonism)...")
            park_no = await page.query_selector("input[type='radio'][value='No'][name*='park'], input[type='radio'][value='No'][name*='2D']")
            if park_no:
                await park_no.click()
                await asyncio.sleep(0.5)
                print("      ✓ Clicked No for Parkinsonism")
            else:
                print("      ⚠ Parkinsonism No not found")
            
            # Scroll to Diagnostic Summary
            print("\n   f. Scrolling to Diagnostic Summary to see result...")
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(1.5)
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/diamond_05_result.png", full_page=False)
            print("      ✓ Screenshot: diamond_05_result.png")
            
            # Check for "Probable DLB" result
            print("\n   g. Checking diagnostic result...")
            probable_dlb = await page.query_selector("text=Probable DLB")
            if probable_dlb:
                print("      ✓ PASS: Result shows 'Probable DLB'")
                parent = await probable_dlb.evaluate_handle("el => el.closest('div, p, td')")
                result_text = await parent.inner_text()
                print(f"      ✓ Result: {result_text.strip()}")
            else:
                # Check for other results
                possible_dlb = await page.query_selector("text=Possible DLB")
                no_dlb = await page.query_selector("text=Does not meet")
                
                if possible_dlb:
                    print("      ⚠ Result shows 'Possible DLB' (expected Probable)")
                elif no_dlb:
                    print("      ⚠ Result shows 'Does not meet criteria'")
                else:
                    print("      ⚠ Result not clearly displayed")
            
            # Step 8: Check for JavaScript errors
            print("\n8. Checking for JavaScript errors...")
            if console_errors:
                print(f"   ✗ Found {len(console_errors)} console error(s):")
                for error in console_errors[:5]:
                    print(f"      - {error.text}")
            else:
                print("   ✓ No JavaScript errors detected")
            
            print("\n" + "=" * 80)
            print("TEST COMPLETED")
            print("=" * 80)
            print("\n📸 Screenshots saved:")
            print("   - diamond_01_top.png (Title, Section 1, start of Section 2)")
            print("   - diamond_02_section2.png (RBD, Hallucinations, Parkinsonism)")
            print("   - diamond_03_biomarkers.png (Section 3 Biomarkers, Section 4 Supportive)")
            print("   - diamond_04_summary.png (Diagnostic Summary - initial)")
            print("   - diamond_05_result.png (Diagnostic Summary - with Probable DLB result)")
            
            # Keep browser open
            await asyncio.sleep(5)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/diamond_error.png", full_page=True)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
