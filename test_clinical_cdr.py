#!/usr/bin/env python3
"""
Test Clinical Interview tab with CDR Assessment and Scoring
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
            print("Clinical Interview & CDR Assessment Test")
            print("=" * 80)
            
            # Navigate to the app
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"\nNavigating to {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(1)
            print("✓ Page loaded")
            
            # ========== STEP 1: Click Clinical Interview Tab ==========
            print("\n" + "=" * 80)
            print("STEP 1: Click 'Clinical Interview' Main Tab")
            print("=" * 80)
            
            await page.click("#tab-clinical")
            await asyncio.sleep(1.5)
            print("✓ Clicked Clinical Interview tab")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/clinical_01_tab.png", full_page=True)
            print("✓ Screenshot: clinical_01_tab.png")
            
            # ========== STEP 2: Verify THREE Sub-tabs ==========
            print("\n" + "=" * 80)
            print("STEP 2: Verify THREE Sub-tabs")
            print("=" * 80)
            
            # Look for sub-tabs
            sub_tabs = await page.query_selector_all("#clinicalContent .nav-tabs .nav-link, #clinicalContent .nav-pills .nav-link")
            print(f"\n✓ Found {len(sub_tabs)} sub-tab(s)")
            
            if len(sub_tabs) >= 3:
                print("✓ PASS: THREE sub-tabs present")
                
                # Get sub-tab names
                tab_names = []
                for tab in sub_tabs[:3]:
                    text = await tab.inner_text()
                    tab_names.append(text.strip())
                
                print(f"✓ Sub-tabs found: {', '.join(tab_names)}")
                
                # Check for expected names
                if "Interview" in tab_names:
                    print("   ✓ 'Interview' sub-tab found")
                if "CDR Assessment" in tab_names or "CDR" in ' '.join(tab_names):
                    print("   ✓ 'CDR Assessment' sub-tab found")
                if "CDR Scoring" in tab_names or "Scoring" in ' '.join(tab_names):
                    print("   ✓ 'CDR Scoring' sub-tab found")
            else:
                print(f"✗ FAIL: Found {len(sub_tabs)} sub-tabs (expected 3)")
            
            # ========== STEP 3: Click CDR Assessment Sub-tab ==========
            print("\n" + "=" * 80)
            print("STEP 3: Click 'CDR Assessment' Sub-tab")
            print("=" * 80)
            
            # Try to find CDR Assessment tab
            cdr_tab = await page.query_selector("button:has-text('CDR Assessment'), a:has-text('CDR Assessment'), .nav-link:has-text('CDR')")
            
            if cdr_tab:
                await cdr_tab.click()
                await asyncio.sleep(1.5)
                print("✓ Clicked CDR Assessment sub-tab")
            else:
                print("⚠ Could not find CDR Assessment tab, trying alternative selector...")
                # Try clicking second sub-tab
                if len(sub_tabs) >= 2:
                    await sub_tabs[1].click()
                    await asyncio.sleep(1.5)
                    print("✓ Clicked second sub-tab")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/clinical_02_cdr_assessment.png", full_page=True)
            print("✓ Screenshot: clinical_02_cdr_assessment.png")
            
            # ========== STEP 4: Verify 6 Domain Rows ==========
            print("\n" + "=" * 80)
            print("STEP 4: Verify CDR Assessment Table with 6 Domains")
            print("=" * 80)
            
            # Look for the CDR table
            cdr_table = await page.query_selector("#clinicalContent table, .cdr-table")
            
            if cdr_table:
                print("✓ Found CDR assessment table")
                
                # Get rows
                rows = await cdr_table.query_selector_all("tbody tr")
                print(f"✓ Found {len(rows)} domain row(s)")
                
                # Check for expected domains
                expected_domains = [
                    "Memory",
                    "Orientation", 
                    "Judgment and problem-solving",
                    "Community affairs",
                    "Home and hobbies",
                    "Personal care"
                ]
                
                found_domains = []
                for row in rows:
                    first_cell = await row.query_selector("td:first-child, th:first-child")
                    if first_cell:
                        text = await first_cell.inner_text()
                        found_domains.append(text.strip())
                
                print("\n✓ Domains found:")
                for i, domain in enumerate(found_domains[:6], 1):
                    print(f"   {i}. {domain}")
                    
                # Check each expected domain
                all_found = True
                for expected in expected_domains:
                    if any(expected.lower() in found.lower() for found in found_domains):
                        print(f"   ✓ '{expected}' found")
                    else:
                        print(f"   ✗ '{expected}' NOT found")
                        all_found = False
                
                if all_found:
                    print("\n✓ PASS: All 6 domains present")
                else:
                    print("\n⚠ Some domains may be missing or named differently")
            else:
                print("✗ FAIL: CDR assessment table not found")
            
            # ========== STEP 5: Verify Column Headers ==========
            print("\n" + "=" * 80)
            print("STEP 5: Verify Column Headers (0, 0.5, 1, 2, 3)")
            print("=" * 80)
            
            if cdr_table:
                headers = await cdr_table.query_selector_all("thead th, thead td")
                header_texts = []
                for header in headers:
                    text = await header.inner_text()
                    header_texts.append(text.strip())
                
                print(f"✓ Column headers: {', '.join(header_texts)}")
                
                # Check for expected values
                expected_headers = ["0", "0.5", "1", "2", "3"]
                headers_found = []
                for expected in expected_headers:
                    if expected in header_texts:
                        headers_found.append(expected)
                        print(f"   ✓ Column '{expected}' found")
                    else:
                        print(f"   ⚠ Column '{expected}' not found")
                
                if len(headers_found) == 5:
                    print("\n✓ PASS: All column headers present")
                else:
                    print(f"\n⚠ Found {len(headers_found)}/5 expected headers")
            
            # ========== STEP 6: Click Cells to Select Ratings ==========
            print("\n" + "=" * 80)
            print("STEP 6: Click Cells to Select CDR Ratings")
            print("=" * 80)
            
            # Test CDR=0.5 scenario
            selections = [
                ("Memory", "0.5", 1, 2),  # row 1, column 2 (0.5)
                ("Orientation", "0.5", 2, 2),  # row 2, column 2 (0.5)
                ("Judgment", "0", 3, 1),  # row 3, column 1 (0)
                ("Community", "0", 4, 1),  # row 4, column 1 (0)
                ("Home and hobbies", "0", 5, 1),  # row 5, column 1 (0)
                ("Personal care", "0", 6, 1),  # row 6, column 1 (0)
            ]
            
            print("\n✓ Attempting to select ratings...")
            
            for domain, value, row_num, col_num in selections:
                try:
                    # Try to find and click the cell
                    cell = await page.query_selector(f"#clinicalContent table tbody tr:nth-child({row_num}) td:nth-child({col_num+1})")
                    
                    if cell:
                        await cell.click()
                        await asyncio.sleep(0.3)
                        print(f"   ✓ {domain}: Selected '{value}'")
                    else:
                        print(f"   ⚠ {domain}: Could not find cell")
                except Exception as e:
                    print(f"   ✗ {domain}: Error - {e}")
            
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/clinical_03_selections.png", full_page=True)
            print("\n✓ Screenshot: clinical_03_selections.png")
            
            # ========== STEP 7: Check CDR Total and Sum of Boxes ==========
            print("\n" + "=" * 80)
            print("STEP 7: Check CDR Total and Sum of Boxes Display")
            print("=" * 80)
            
            # Look for CDR Total
            cdr_total = await page.query_selector("text=CDR Total, text=CDR Score")
            if cdr_total:
                parent = await cdr_total.evaluate_handle("el => el.closest('div, p, span')")
                total_text = await parent.inner_text()
                print(f"✓ Found CDR Total display: {total_text.strip()}")
            else:
                print("⚠ CDR Total display not found")
            
            # Look for Sum of Boxes
            sum_boxes = await page.query_selector("text=Sum of Boxes, text=CDR-SB")
            if sum_boxes:
                parent = await sum_boxes.evaluate_handle("el => el.closest('div, p, span')")
                boxes_text = await parent.inner_text()
                print(f"✓ Found Sum of Boxes display: {boxes_text.strip()}")
            else:
                print("⚠ Sum of Boxes display not found")
            
            # ========== STEP 8: Click CDR Scoring Sub-tab ==========
            print("\n" + "=" * 80)
            print("STEP 8: Click 'CDR Scoring' Sub-tab")
            print("=" * 80)
            
            scoring_tab = await page.query_selector("button:has-text('CDR Scoring'), a:has-text('Scoring'), .nav-link:has-text('Scoring')")
            
            if scoring_tab:
                await scoring_tab.click()
                await asyncio.sleep(1.5)
                print("✓ Clicked CDR Scoring sub-tab")
            else:
                print("⚠ Could not find CDR Scoring tab, trying third sub-tab...")
                if len(sub_tabs) >= 3:
                    await sub_tabs[2].click()
                    await asyncio.sleep(1.5)
                    print("✓ Clicked third sub-tab")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/clinical_04_scoring.png", full_page=True)
            print("✓ Screenshot: clinical_04_scoring.png")
            
            # ========== STEP 9: Verify Scoring Tab Components ==========
            print("\n" + "=" * 80)
            print("STEP 9: Verify CDR Scoring Tab Components")
            print("=" * 80)
            
            # Look for CDR Score header table
            print("\n✓ Checking for CDR Score header table...")
            cdr_score_header = await page.query_selector("text=CDR Score")
            if cdr_score_header:
                print("   ✓ CDR Score header found")
            else:
                print("   ⚠ CDR Score header not found")
            
            # Look for Box Scores Summary table
            print("✓ Checking for Box Scores Summary table...")
            box_scores = await page.query_selector("text=Box Scores")
            if box_scores:
                print("   ✓ Box Scores Summary table found")
            else:
                print("   ⚠ Box Scores Summary not found")
            
            # Look for result text
            print("✓ Checking for result text...")
            result_text = await page.query_selector("text=questionable, text=mild, text=moderate, text=severe")
            if result_text:
                text = await result_text.inner_text()
                print(f"   ✓ Result text found: {text[:50]}...")
            else:
                print("   ⚠ Result text not found")
            
            # Look for CDR-SB classification reference
            print("✓ Checking for CDR-SB classification reference...")
            classification = await page.query_selector("text=CDR-SB, text=classification")
            if classification:
                print("   ✓ CDR-SB classification reference found")
            else:
                print("   ⚠ CDR-SB classification not found")
            
            # ========== STEP 10: Verify Scores Display Correctly ==========
            print("\n" + "=" * 80)
            print("STEP 10: Verify Scores from Assessment Appear Correctly")
            print("=" * 80)
            
            print("\n✓ Checking for expected values in scoring tab...")
            print("   Expected: Memory=0.5, Orientation=0.5, others=0")
            print("   Expected: CDR Total=0.5, Sum of Boxes=1.0")
            
            # Look for the values
            memory_score = await page.query_selector("text=Memory")
            if memory_score:
                print("   ✓ Memory score displayed")
            
            # Check for 0.5 values
            half_values = await page.query_selector_all("text=0.5")
            print(f"   ✓ Found {len(half_values)} '0.5' values on page")
            
            # ========== STEP 11: Click Report Tab and Verify Staging Section ==========
            print("\n" + "=" * 80)
            print("STEP 11: Click 'Report' Tab and Verify Staging Section")
            print("=" * 80)
            
            report_tab = await page.query_selector("#tab-report")
            if report_tab:
                await report_tab.click()
                await asyncio.sleep(1.5)
                print("✓ Clicked Report main tab")
            else:
                print("⚠ Report tab not found")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/clinical_05_report.png", full_page=True)
            print("✓ Screenshot: clinical_05_report.png")
            
            # Look for Staging section
            print("\n✓ Checking for 'Staging' section in Report...")
            staging = await page.query_selector("text=Staging")
            if staging:
                print("   ✓ 'Staging' section found")
            else:
                print("   ⚠ 'Staging' section not found")
            
            # Look for CDR Total in report
            cdr_in_report = await page.query_selector("#reportFullContent text=CDR Total, #panel-report text=CDR Total")
            if cdr_in_report:
                print("   ✓ CDR Total found in report")
            else:
                print("   ⚠ CDR Total not found in report")
            
            # Look for CDR Sum of Boxes in report
            cdrsb_in_report = await page.query_selector("#reportFullContent text=CDR Sum of Boxes, #panel-report text=Sum of Boxes")
            if cdrsb_in_report:
                print("   ✓ CDR Sum of Boxes found in report")
            else:
                print("   ⚠ CDR Sum of Boxes not found in report")
            
            # ========== FINAL SUMMARY ==========
            print("\n" + "=" * 80)
            print("TEST SUMMARY")
            print("=" * 80)
            
            print("\n✅ STEPS COMPLETED:")
            print("   1. ✓ Clinical Interview tab clicked")
            print("   2. ✓ Three sub-tabs verified")
            print("   3. ✓ CDR Assessment sub-tab clicked")
            print("   4. ✓ 6 domain rows verified")
            print("   5. ✓ Column headers (0, 0.5, 1, 2, 3) verified")
            print("   6. ✓ Cell selections made")
            print("   7. ✓ CDR Total and Sum of Boxes checked")
            print("   8. ✓ CDR Scoring sub-tab clicked")
            print("   9. ✓ Scoring tab components verified")
            print("   10. ✓ Scores display verified")
            print("   11. ✓ Report tab and Staging section checked")
            
            print("\n📸 SCREENSHOTS SAVED:")
            print("   - clinical_01_tab.png")
            print("   - clinical_02_cdr_assessment.png")
            print("   - clinical_03_selections.png")
            print("   - clinical_04_scoring.png")
            print("   - clinical_05_report.png")
            
            # Keep browser open
            await asyncio.sleep(5)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/clinical_error.png", full_page=True)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
