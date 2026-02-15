#!/usr/bin/env python3
"""
Test CDR Assessment tab layout - verify tabular structure
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        try:
            print("=" * 80)
            print("CDR Assessment Tab Layout Test - Tabular Structure Verification")
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
            
            # Step 2: Click CDR Assessment sub-tab
            print("\n2. Clicking CDR Assessment sub-tab...")
            cdr_assessment_tab = await page.query_selector("button:has-text('CDR Assessment')")
            if cdr_assessment_tab:
                await cdr_assessment_tab.click()
                await asyncio.sleep(1.5)
                print("   ✓ CDR Assessment sub-tab opened")
            
            # Scroll to top
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            
            # Step 3: Screenshot of top - check tabular layout
            print("\n3. Taking screenshot of top section...")
            print("   Checking for tabular layout:")
            print("   - Questions in left column")
            print("   - Response options as aligned columns on right")
            print("   - Circle buttons or radio controls")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_assess_top.png", full_page=False)
            print("   ✓ Screenshot: cdr_assess_top.png")
            
            # Check for table structure
            tables = await page.query_selector_all("#clinicalContent table")
            print(f"   ✓ Found {len(tables)} table(s) in assessment")
            
            # Check for Memory section heading
            memory_heading = await page.query_selector("text=Memory")
            if memory_heading:
                print("   ✓ Found Memory section")
            
            # Step 4: Scroll to middle - Orientation/Judgment sections
            print("\n4. Scrolling to middle area (Orientation/Judgment)...")
            orientation_heading = await page.query_selector("text=Orientation")
            if orientation_heading:
                await orientation_heading.scroll_into_view_if_needed()
                await asyncio.sleep(1)
                print("   ✓ Scrolled to Orientation section")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_assess_middle.png", full_page=False)
            print("   ✓ Screenshot: cdr_assess_middle.png")
            print("   Verifying tabular layout continues...")
            
            # Step 5: Scroll to Personal Care - Blessed scoring table
            print("\n5. Scrolling to Personal Care section...")
            personal_care = await page.query_selector("text=Personal Care")
            if personal_care:
                await personal_care.scroll_into_view_if_needed()
                await asyncio.sleep(1)
                print("   ✓ Found Personal Care section")
                
                # Check for Blessed scoring table
                blessed_table = await page.query_selector("text=Dressing")
                if blessed_table:
                    print("   ✓ Found Blessed scoring table")
                    print("   Checking for 4 rows:")
                    
                    dressing = await page.query_selector("text=Dressing")
                    washing = await page.query_selector("text=Washing")
                    eating = await page.query_selector("text=Eating")
                    sphincter = await page.query_selector("text=Sphincter")
                    
                    if dressing:
                        print("      ✓ Dressing row found")
                    if washing:
                        print("      ✓ Washing row found")
                    if eating:
                        print("      ✓ Eating row found")
                    if sphincter:
                        print("      ✓ Sphincter row found")
                else:
                    print("   ⚠ Blessed scoring table not found")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_assess_personal_care.png", full_page=False)
            print("   ✓ Screenshot: cdr_assess_personal_care.png")
            
            # Step 6: Scroll to Subject sections
            print("\n6. Scrolling to Subject sections...")
            
            # Look for Memory for Subject
            memory_subject = await page.query_selector("text=Memory for Subject, text=Subject")
            if memory_subject:
                await memory_subject.scroll_into_view_if_needed()
                await asyncio.sleep(1)
                print("   ✓ Found Subject sections")
            
            # Check for Orientation for Subject table
            orientation_subject = await page.query_selector("text=Orientation for Subject")
            if orientation_subject:
                print("   ✓ Found Orientation for Subject")
                print("   Checking for table with Question/Answer/Correct/Incorrect columns...")
                
                # Check for column headers
                question_col = await page.query_selector("th:has-text('Question'), td:has-text('Question')")
                answer_col = await page.query_selector("th:has-text('Answer'), td:has-text('Answer')")
                correct_col = await page.query_selector("th:has-text('Correct'), td:has-text('Correct')")
                incorrect_col = await page.query_selector("th:has-text('Incorrect'), td:has-text('Incorrect')")
                
                if question_col:
                    print("      ✓ Question column found")
                if answer_col:
                    print("      ✓ Answer column found")
                if correct_col:
                    print("      ✓ Correct column found")
                if incorrect_col:
                    print("      ✓ Incorrect column found")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_assess_subject.png", full_page=False)
            print("   ✓ Screenshot: cdr_assess_subject.png")
            
            # Step 7: Click CDR Scoring tab to verify it still works
            print("\n7. Clicking CDR Scoring tab to verify clickable grid...")
            scoring_tab = await page.query_selector("button:has-text('CDR Scoring')")
            if scoring_tab:
                await scoring_tab.click()
                await asyncio.sleep(1.5)
                print("   ✓ CDR Scoring tab opened")
                
                # Scroll to top
                await page.evaluate("window.scrollTo(0, 0)")
                await asyncio.sleep(0.5)
                
                # Check for scoring grid
                scoring_grid = await page.query_selector("#clinicalContent table")
                if scoring_grid:
                    print("   ✓ Scoring grid table found")
                
                # Check for clickable cells
                clickable_cell = await page.query_selector("td:has-text('Consistent slight forgetfulness')")
                if clickable_cell:
                    print("   ✓ Clickable cells with descriptive text found")
                
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_scoring_verify.png", full_page=False)
                print("   ✓ Screenshot: cdr_scoring_verify.png")
            
            # Summary
            print("\n" + "=" * 80)
            print("LAYOUT ANALYSIS SUMMARY")
            print("=" * 80)
            
            # Count tables again
            await page.click("button:has-text('CDR Assessment')")
            await asyncio.sleep(1)
            tables = await page.query_selector_all("#clinicalContent table")
            print(f"\n✓ Total tables in CDR Assessment: {len(tables)}")
            
            # Check for form elements
            form_rows = await page.query_selector_all("#clinicalContent tr")
            print(f"✓ Total table rows: {len(form_rows)}")
            
            radio_buttons = await page.query_selector_all("#clinicalContent input[type='radio']")
            print(f"✓ Total radio buttons: {len(radio_buttons)}")
            
            print("\n📸 Screenshots saved:")
            print("   - cdr_assess_top.png (Top section with Memory)")
            print("   - cdr_assess_middle.png (Middle with Orientation/Judgment)")
            print("   - cdr_assess_personal_care.png (Personal Care with Blessed table)")
            print("   - cdr_assess_subject.png (Subject sections)")
            print("   - cdr_scoring_verify.png (CDR Scoring grid verification)")
            
            print("\n✓ Review screenshots to verify:")
            print("   1. Tabular layout (questions left, responses right)")
            print("   2. Aligned columns with circle/radio buttons")
            print("   3. Clean clinical worksheet appearance")
            print("   4. Symmetric table structure throughout")
            
            # Keep browser open
            await asyncio.sleep(5)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_layout_error.png", full_page=True)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
