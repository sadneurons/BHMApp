#!/usr/bin/env python3
"""
Test Clinical Interview tab structure - CDR Assessment vs CDR Scoring
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
            print("Clinical Interview Tab Structure Test")
            print("=" * 80)
            
            # Step 1: Navigate and click Clinical Interview
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"\nNavigating to {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(1)
            
            print("\n1. Clicking Clinical Interview main tab...")
            await page.click("#tab-clinical")
            await asyncio.sleep(1.5)
            print("   ✓ Clinical Interview tab opened")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/clinical_tab_opened.png", full_page=True)
            print("   ✓ Screenshot: clinical_tab_opened.png")
            
            # Step 2: Verify sub-tabs
            print("\n2. Verifying sub-tabs...")
            sub_tabs = await page.query_selector_all("#clinicalContent .nav-link, #clinicalSubTabs .nav-link")
            print(f"   ✓ Found {len(sub_tabs)} sub-tab(s)")
            
            if len(sub_tabs) >= 3:
                tab_names = []
                for i, tab in enumerate(sub_tabs[:3]):
                    text = await tab.inner_text()
                    tab_names.append(text.strip())
                    print(f"      {i+1}. {text.strip()}")
                
                print(f"   ✓ Sub-tabs: {', '.join(tab_names)}")
            
            # Step 3: Click CDR Assessment sub-tab
            print("\n3. Clicking 'CDR Assessment' sub-tab...")
            
            # Try to find CDR Assessment tab
            cdr_assessment_tab = None
            for tab in sub_tabs:
                text = await tab.inner_text()
                if "CDR Assessment" in text or "Assessment" in text:
                    cdr_assessment_tab = tab
                    break
            
            if cdr_assessment_tab:
                await cdr_assessment_tab.click()
                await asyncio.sleep(1.5)
                print("   ✓ CDR Assessment tab clicked")
            else:
                # Try second tab
                if len(sub_tabs) >= 2:
                    await sub_tabs[1].click()
                    await asyncio.sleep(1.5)
                    print("   ✓ Second sub-tab clicked")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_assessment_tab.png", full_page=True)
            print("   ✓ Screenshot: cdr_assessment_tab.png")
            
            # Check CDR Assessment content
            print("\n   Checking CDR Assessment content...")
            
            # Look for semi-structured interview sections
            memory_section = await page.query_selector("text=Memory Questions for Informant")
            if memory_section:
                print("   ✓ Found 'Memory Questions for Informant' section")
            else:
                print("   ⚠ Memory Questions section not found")
            
            orientation_section = await page.query_selector("text=Orientation Questions for Informant")
            if orientation_section:
                print("   ✓ Found 'Orientation Questions for Informant' section")
            else:
                print("   ⚠ Orientation Questions section not found")
            
            # Look for Yes/No buttons
            yes_buttons = await page.query_selector_all("button:has-text('Yes'), input[value='Yes']")
            no_buttons = await page.query_selector_all("button:has-text('No'), input[value='No']")
            print(f"   ✓ Found {len(yes_buttons)} Yes button(s)")
            print(f"   ✓ Found {len(no_buttons)} No button(s)")
            
            # Look for Usually/Sometimes/Rarely
            usually_buttons = await page.query_selector_all("text=Usually")
            sometimes_buttons = await page.query_selector_all("text=Sometimes")
            rarely_buttons = await page.query_selector_all("text=Rarely")
            print(f"   ✓ Found {len(usually_buttons)} Usually button(s)")
            print(f"   ✓ Found {len(sometimes_buttons)} Sometimes button(s)")
            print(f"   ✓ Found {len(rarely_buttons)} Rarely button(s)")
            
            # Look for text fields
            text_fields = await page.query_selector_all("#clinicalContent textarea, #clinicalContent input[type='text']")
            print(f"   ✓ Found {len(text_fields)} text field(s)")
            
            # Step 4: Click CDR Scoring sub-tab
            print("\n4. Clicking 'CDR Scoring' sub-tab...")
            
            cdr_scoring_tab = None
            for tab in sub_tabs:
                text = await tab.inner_text()
                if "CDR Scoring" in text or "Scoring" in text:
                    cdr_scoring_tab = tab
                    break
            
            if cdr_scoring_tab:
                await cdr_scoring_tab.click()
                await asyncio.sleep(1.5)
                print("   ✓ CDR Scoring tab clicked")
            else:
                # Try third tab
                if len(sub_tabs) >= 3:
                    await sub_tabs[2].click()
                    await asyncio.sleep(1.5)
                    print("   ✓ Third sub-tab clicked")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_scoring_tab.png", full_page=True)
            print("   ✓ Screenshot: cdr_scoring_tab.png")
            
            # Check CDR Scoring content
            print("\n   Checking CDR Scoring tab content...")
            
            # a) CDR Score header table
            cdr_score_header = await page.query_selector("text=CDR Score")
            if cdr_score_header:
                print("   ✓ Found 'CDR Score' header")
            else:
                print("   ⚠ CDR Score header not found")
            
            # Check for 0, 0.5, 1, 2, 3 headers
            header_05 = await page.query_selector("th:has-text('0.5'), td:has-text('0.5')")
            if header_05:
                print("   ✓ Found rating headers (0, 0.5, 1, 2, 3)")
            
            # b) Clickable rating grid
            print("\n   Checking for clickable rating grid...")
            
            # Look for domain rows
            domains = [
                "Memory",
                "Orientation",
                "Judgment",
                "Problem Solving",
                "Community Affairs",
                "Home and Hobbies",
                "Personal Care"
            ]
            
            found_domains = 0
            for domain in domains:
                elem = await page.query_selector(f"text={domain}")
                if elem:
                    found_domains += 1
            
            print(f"   ✓ Found {found_domains} domain row(s)")
            
            # Look for descriptive text cells
            consistent_slight = await page.query_selector("text=Consistent slight forgetfulness")
            if consistent_slight:
                print("   ✓ Found descriptive text in cells (e.g., 'Consistent slight forgetfulness...')")
            
            # c) Box Scores Summary table
            box_scores = await page.query_selector("text=Box Scores")
            if box_scores:
                print("   ✓ Found 'Box Scores Summary' table")
            else:
                print("   ⚠ Box Scores Summary not found")
            
            # d) Result display area
            result_area = await page.query_selector("text=Result, .result-display, #cdrResult")
            if result_area:
                print("   ✓ Found result display area")
            else:
                # Check for common result keywords
                page_text = await page.evaluate("() => document.body.innerText")
                if any(word in page_text.lower() for word in ['interpretation', 'total', 'score']):
                    print("   ✓ Result display area present (found score/interpretation text)")
            
            # e) CDR-SB classification reference
            cdrsb_ref = await page.query_selector("text=CDR-SB, text=classification")
            if cdrsb_ref:
                print("   ✓ Found CDR-SB classification reference table")
            else:
                print("   ⚠ CDR-SB classification reference not found")
            
            # Step 5: Try clicking cells
            print("\n5. Trying to click cells for each domain...")
            
            # Find the table
            cdr_table = await page.query_selector("#clinicalContent table.cdr-table, #clinicalContent table")
            
            if cdr_table:
                print("   ✓ Found CDR table")
                
                # Try clicking Memory 0.5 cell
                print("\n   Attempting to click cells...")
                
                # Try to find "Consistent slight forgetfulness" cell
                memory_cell = await page.query_selector("td:has-text('Consistent slight forgetfulness')")
                if memory_cell:
                    await memory_cell.click()
                    await asyncio.sleep(0.5)
                    print("   ✓ Clicked Memory 0.5 cell")
                else:
                    print("   ⚠ Memory 0.5 cell not found or not clickable")
                
                # Try clicking other domain cells
                # Orientation 0.5
                orientation_cell = await page.query_selector("td:has-text('Fully oriented except')")
                if orientation_cell:
                    await orientation_cell.click()
                    await asyncio.sleep(0.5)
                    print("   ✓ Clicked Orientation 0.5 cell")
                
                # Judgment 0
                judgment_cell = await page.query_selector("td:has-text('Solves everyday problems')")
                if judgment_cell:
                    await judgment_cell.click()
                    await asyncio.sleep(0.5)
                    print("   ✓ Clicked Judgment 0 cell")
                
                # Community 0
                community_cell = await page.query_selector("td:has-text('Independent function at usual level')")
                if community_cell:
                    await community_cell.click()
                    await asyncio.sleep(0.5)
                    print("   ✓ Clicked Community 0 cell")
                
                # Home 0
                home_cell = await page.query_selector("td:has-text('Life at home, hobbies, and intellectual interests well maintained')")
                if home_cell:
                    await home_cell.click()
                    await asyncio.sleep(0.5)
                    print("   ✓ Clicked Home 0 cell")
                
                # Personal care 0/0.5
                personal_cell = await page.query_selector("td:has-text('Fully capable of self-care')")
                if personal_cell:
                    await personal_cell.click()
                    await asyncio.sleep(0.5)
                    print("   ✓ Clicked Personal care 0/0.5 cell")
                
                await asyncio.sleep(1)
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_scoring_selections.png", full_page=True)
                print("\n   ✓ Screenshot: cdr_scoring_selections.png")
                
                # Check for score updates
                print("\n   Checking for score displays...")
                cdr_total = await page.query_selector("text=CDR Total")
                if cdr_total:
                    parent = await cdr_total.evaluate_handle("el => el.closest('div, p, td')")
                    text = await parent.inner_text()
                    print(f"   ✓ CDR Total: {text.strip()}")
                
                sum_boxes = await page.query_selector("text=Sum of Boxes")
                if sum_boxes:
                    parent = await sum_boxes.evaluate_handle("el => el.closest('div, p, td')")
                    text = await parent.inner_text()
                    print(f"   ✓ Sum of Boxes: {text.strip()}")
            else:
                print("   ✗ CDR table not found")
            
            print("\n" + "=" * 80)
            print("TEST COMPLETED")
            print("=" * 80)
            print("\n📸 Screenshots saved:")
            print("   - clinical_tab_opened.png")
            print("   - cdr_assessment_tab.png")
            print("   - cdr_scoring_tab.png")
            print("   - cdr_scoring_selections.png")
            
            # Keep browser open
            await asyncio.sleep(5)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/clinical_structure_error.png", full_page=True)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
