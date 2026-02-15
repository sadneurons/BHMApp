#!/usr/bin/env python3
"""
Test RBANS Calculator Tab - Corrected Version
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
            print("RBANS Calculator Test (Corrected)")
            print("=" * 80)
            
            # Step 1: Navigate
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"\nStep 1: Navigating to {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(1.5)
            print("   ✓ Page loaded")
            
            # Step 3: Click RBANS tab
            print("\nStep 3: Clicking RBANS tab...")
            await page.click("#tab-rbans")
            await asyncio.sleep(1.5)
            print("   ✓ RBANS tab clicked")
            
            # Step 4: Take snapshot of RBANS form
            print("\nStep 4: Taking snapshot of RBANS form...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_v2_01_form.png", full_page=False)
            print("   ✓ Screenshot: rbans_v2_01_form.png")
            
            # Step 5: Fill in demographics using correct IDs
            print("\nStep 5: Filling in demographics...")
            
            # TOPF
            print("   - Setting TOPF to 50...")
            await page.fill("#rbans-topf", "50")
            await asyncio.sleep(0.3)
            print("     ✓ TOPF = 50")
            
            # Age
            print("   - Setting Age to 65...")
            await page.fill("#rbans-age", "65")
            await asyncio.sleep(0.3)
            print("     ✓ Age = 65")
            
            # Years of Education (correct ID)
            print("   - Setting Years of Education to 16...")
            await page.fill("#rbans-years_of_education", "16")
            await asyncio.sleep(0.3)
            print("     ✓ Education = 16")
            
            # Gender: Male
            print("   - Selecting Gender: Male...")
            await page.click("input.rbans-radio[data-key='gender'][value='Male']")
            await asyncio.sleep(0.3)
            print("     ✓ Gender = Male")
            
            # Ethnicity: White
            print("   - Selecting Ethnicity: White...")
            await page.click("input.rbans-radio[data-key='ethnicity'][value='White']")
            await asyncio.sleep(0.3)
            print("     ✓ Ethnicity = White")
            
            # Step 6: Fill in subtest raw scores using correct IDs
            print("\nStep 6: Filling in subtest raw scores...")
            
            subtests = [
                ("listlearning", "25", "List Learning"),
                ("storylearning", "16", "Story Learning"),
                ("figurecopy", "15", "Figure Copy"),
                ("lineorientation", "14", "Line Orientation"),
                ("naming", "8", "Picture Naming"),
                ("semanticfluency", "20", "Semantic Fluency"),
                ("digitspan", "10", "Digit Span"),
                ("coding", "40", "Coding"),
                ("listrecall", "5", "List Recall"),
                ("listrecog", "17", "List Recognition"),
                ("storyrecall", "8", "Story Recall"),
                ("figurerecall", "12", "Figure Recall")
            ]
            
            for field_id, value, label in subtests:
                print(f"   - Setting {label} to {value}...")
                await page.fill(f"#rbans-{field_id}", value)
                await asyncio.sleep(0.2)
                print(f"     ✓ {label} = {value}")
            
            # Take snapshot after filling
            print("\n   Taking snapshot after filling form...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_v2_02_filled.png", full_page=False)
            print("   ✓ Screenshot: rbans_v2_02_filled.png")
            
            # Step 7: Click Calculate All Scores
            print("\nStep 7: Clicking 'Calculate All Scores' button...")
            await page.click("#rbans-calculate-btn")
            await asyncio.sleep(2)
            print("   ✓ Calculate button clicked")
            
            # Step 8: Take snapshot of results
            print("\nStep 8: Taking snapshot of results...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_v2_03_results_top.png", full_page=False)
            print("   ✓ Screenshot: rbans_v2_03_results_top.png")
            
            # Check for results elements
            print("\n   Checking results elements...")
            
            # Index Scores table
            index_table = await page.query_selector("text=Index Scores")
            if index_table:
                print("   ✓ Index Scores table found")
            else:
                print("   ⚠ Index Scores table not found")
            
            # Chart
            chart = await page.query_selector("canvas")
            if chart:
                print("   ✓ Chart canvas found")
            else:
                print("   ⚠ Chart not found")
            
            # Total Index
            total_index = await page.query_selector("text=Total Index")
            if total_index:
                print("   ✓ Total Index found")
            else:
                print("   ⚠ Total Index not found")
            
            # Step 9: Scroll down to see full results
            print("\nStep 9: Scrolling to see full results...")
            
            # Scroll to middle
            await page.evaluate("window.scrollBy(0, 900)")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_v2_04_middle.png", full_page=False)
            print("   ✓ Screenshot: rbans_v2_04_middle.png")
            
            # Check for Duff Norms
            duff_norms = await page.query_selector("text=Duff Norms")
            if duff_norms:
                print("   ✓ Duff Norms section found")
            else:
                print("   ⚠ Duff Norms not found")
            
            # Check for Effort Indices
            effort = await page.query_selector("text=Effort Indices")
            if effort:
                print("   ✓ Effort Indices section found")
            else:
                print("   ⚠ Effort Indices not found")
            
            # Check for Cortical-Subcortical Index
            csi = await page.query_selector("text=Cortical-Subcortical")
            if csi:
                print("   ✓ Cortical-Subcortical Index found")
            else:
                print("   ⚠ Cortical-Subcortical Index not found")
            
            # Scroll more
            await page.evaluate("window.scrollBy(0, 900)")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_v2_05_lower.png", full_page=False)
            print("   ✓ Screenshot: rbans_v2_05_lower.png")
            
            # Check for Domain Narratives
            narratives = await page.query_selector("text=Domain Narratives")
            if narratives:
                print("   ✓ Domain Narratives section found")
            else:
                print("   ⚠ Domain Narratives not found")
            
            # Scroll to bottom
            await page.evaluate("window.scrollBy(0, 900)")
            await asyncio.sleep(1)
            
            # Step 10: Take final snapshot at bottom
            print("\nStep 10: Taking final snapshot at bottom...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_v2_06_bottom.png", full_page=False)
            print("   ✓ Screenshot: rbans_v2_06_bottom.png")
            
            # Check for References
            references = await page.query_selector("text=References")
            if references:
                print("   ✓ References section found")
            else:
                print("   ⚠ References not found")
            
            # Step 11: Check for JavaScript errors
            print("\nStep 11: Checking for JavaScript errors...")
            if console_errors:
                print(f"   ✗ Found {len(console_errors)} console error(s):")
                for error in console_errors[:5]:
                    print(f"      - {error.text}")
            else:
                print("   ✓ No JavaScript errors detected")
            
            # Scroll back to top
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(1)
            
            # Take full page screenshot
            print("\nTaking full page screenshot...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_v2_07_fullpage.png", full_page=True)
            print("   ✓ Screenshot: rbans_v2_07_fullpage.png")
            
            print("\n" + "=" * 80)
            print("TEST COMPLETED SUCCESSFULLY")
            print("=" * 80)
            print("\n📸 Screenshots saved:")
            print("   - rbans_v2_01_form.png (RBANS form)")
            print("   - rbans_v2_02_filled.png (Form filled with data)")
            print("   - rbans_v2_03_results_top.png (Results - Index Scores & Chart)")
            print("   - rbans_v2_04_middle.png (Duff Norms, Effort, CSI)")
            print("   - rbans_v2_05_lower.png (Domain Narratives)")
            print("   - rbans_v2_06_bottom.png (References)")
            print("   - rbans_v2_07_fullpage.png (Full page view)")
            
            # Keep browser open
            await asyncio.sleep(5)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_error.png", full_page=True)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
