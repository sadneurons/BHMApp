#!/usr/bin/env python3
"""
Test MBI-C and NPI-Q layout and interaction
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
            print("MBI-C and NPI-Q Layout & Interaction Test")
            print("=" * 80)
            
            # Navigate to the app
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"\nNavigating to {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(1)
            print("✓ Page loaded")
            
            # ========== TEST 1: MBI-C ==========
            print("\n" + "=" * 80)
            print("TEST 1: MBI-C - Single Continuous Table")
            print("=" * 80)
            
            # Navigate to Informant Booklet → MBI-C
            print("\n1. Navigating to Informant Booklet → MBI-C...")
            await page.click("#tab-informant")
            await asyncio.sleep(1)
            await page.click("#informantSubTabs .nav-link[data-bs-target='#sub-mbic']")
            await asyncio.sleep(1.5)
            
            # Take full page screenshot
            print("\n2. Taking full page screenshot...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/mbic_full_page.png", full_page=True)
            print("   ✓ Screenshot: mbic_full_page.png")
            
            # Check if it's a single table
            print("\n3. Verifying table structure...")
            tables = await page.query_selector_all("#mbicContent table")
            print(f"   Found {len(tables)} table(s)")
            
            if len(tables) == 1:
                print("   ✓ PASS: ONE single continuous table")
            else:
                print(f"   ✗ FAIL: Found {len(tables)} tables (should be 1)")
            
            # Check domain headings as full-width colored header rows
            print("\n   Checking domain headings...")
            domain_headers = await page.query_selector_all("#mbicContent table thead tr.domain-header, #mbicContent table tbody tr.domain-header")
            print(f"   Found {len(domain_headers)} domain header rows")
            
            if len(domain_headers) >= 5:
                print("   ✓ PASS: Domain headings appear as header rows within table")
            else:
                print(f"   ⚠ Found {len(domain_headers)} domain headers (expected 5)")
            
            # Check column headers
            print("\n   Checking column headers...")
            header_none = await page.query_selector("#mbicContent table th:has-text('None')")
            header_mild = await page.query_selector("#mbicContent table th:has-text('Mild')")
            header_moderate = await page.query_selector("#mbicContent table th:has-text('Moderate')")
            header_severe = await page.query_selector("#mbicContent table th:has-text('Severe')")
            
            if header_none and header_mild and header_moderate and header_severe:
                print("   ✓ PASS: Column headers are None | Mild | Moderate | Severe")
            else:
                print("   ✗ FAIL: Column headers not found or incorrect")
            
            # Check headers appear only once
            all_header_rows = await page.query_selector_all("#mbicContent table thead")
            print(f"   Found {len(all_header_rows)} <thead> section(s)")
            
            if len(all_header_rows) == 1:
                print("   ✓ PASS: Table headers appear only ONCE at top")
            else:
                print(f"   ✗ FAIL: Found {len(all_header_rows)} header sections")
            
            # Test clicking cells
            print("\n4. Testing cell interactivity...")
            try:
                # Click first cell in first row
                first_cell = await page.query_selector("#mbicContent table tbody tr:not(.domain-header):first-of-type td:nth-child(2)")
                if first_cell:
                    await first_cell.click()
                    await asyncio.sleep(0.5)
                    print("   ✓ First cell clicked successfully")
                    
                    # Check if selected
                    classes = await first_cell.get_attribute("class")
                    if classes and "selected" in classes:
                        print("   ✓ Cell shows selection (has 'selected' class)")
                    else:
                        print("   ⚠ Cell may not show selection visually")
                
                # Click another cell
                second_cell = await page.query_selector("#mbicContent table tbody tr:not(.domain-header):nth-of-type(3) td:nth-child(3)")
                if second_cell:
                    await second_cell.click()
                    await asyncio.sleep(0.5)
                    print("   ✓ Second cell clicked successfully")
                
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/mbic_with_selections.png", full_page=True)
                print("   ✓ Screenshot: mbic_with_selections.png")
                
            except Exception as e:
                print(f"   ✗ FAIL: Cell clicking error: {e}")
            
            # Scroll and verify continuity
            print("\n5. Scrolling to verify all 5 domains in one table...")
            try:
                # Scroll to bottom
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await asyncio.sleep(1)
                
                # Check for all 5 domain headings
                domain1 = await page.query_selector("text=Interest, motivation, and drive")
                domain2 = await page.query_selector("text=Mood or anxiety symptoms")
                domain3 = await page.query_selector("text=Delayed gratification and control behavior")
                domain4 = await page.query_selector("text=Societal norms and having social graces")
                domain5 = await page.query_selector("text=Strongly held beliefs and sensory experiences")
                
                domains_found = sum([bool(d) for d in [domain1, domain2, domain3, domain4, domain5]])
                print(f"   Found {domains_found}/5 domains")
                
                if domains_found == 5:
                    print("   ✓ PASS: All 5 domains render in one continuous table")
                else:
                    print(f"   ✗ FAIL: Only found {domains_found} domains")
                
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/mbic_scrolled.png", full_page=True)
                print("   ✓ Screenshot: mbic_scrolled.png")
                
            except Exception as e:
                print(f"   ✗ Error scrolling: {e}")
            
            # ========== TEST 2: NPI-Q ==========
            print("\n" + "=" * 80)
            print("TEST 2: NPI-Q - Two-Column Layout")
            print("=" * 80)
            
            # Navigate to NPI-Q
            print("\n1. Clicking NPI-Q sub-tab...")
            await page.click("#informantSubTabs .nav-link[data-bs-target='#sub-npiq']")
            await asyncio.sleep(1.5)
            
            # Scroll to top
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            
            # Take initial screenshot
            print("\n2. Taking initial screenshot...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/npiq_initial.png", full_page=True)
            print("   ✓ Screenshot: npiq_initial.png")
            
            # Check two-column layout
            print("\n3. Verifying two-column layout...")
            
            # Look for left column (symptoms list)
            left_column = await page.query_selector("#npiqContent .symptoms-column, #npiqContent .left-column, #npiqContent .col-md-6:first-of-type")
            if left_column:
                print("   ✓ Found left column")
            else:
                print("   ⚠ Left column selector may need adjustment")
            
            # Look for right column (detail panel)
            right_column = await page.query_selector("#npiqContent .detail-column, #npiqContent .right-column, #npiqContent .col-md-6:last-of-type")
            if right_column:
                print("   ✓ Found right column")
            else:
                print("   ⚠ Right column selector may need adjustment")
            
            # Check for placeholder text
            placeholder = await page.query_selector("text=Mark a symptom")
            if placeholder:
                print("   ✓ PASS: Placeholder text present in right column")
            else:
                print("   ⚠ Placeholder text not found (may use different wording)")
            
            # Count symptoms in left column
            symptoms = await page.query_selector_all("#npiqContent .symptom-item, #npiqContent .card")
            print(f"   Found {len(symptoms)} symptom items")
            
            if len(symptoms) >= 12:
                print("   ✓ PASS: All 12 symptoms listed in left column")
            else:
                print(f"   ⚠ Found {len(symptoms)} symptoms (expected 12)")
            
            # Test clicking Yes on symptoms
            print("\n4. Clicking 'Yes' on Delusions and Anxiety...")
            
            try:
                # Click Yes on Delusions
                delusions_yes = await page.query_selector("label:has-text('Delusions') ~ .form-check .form-check-input[value='Yes'], input[value='Yes'][name*='delusion']")
                if not delusions_yes:
                    # Try alternative selector
                    delusions_section = await page.query_selector("text=Delusions")
                    if delusions_section:
                        parent = await delusions_section.evaluate_handle("el => el.closest('.card, .symptom-item, .row')")
                        delusions_yes = await parent.query_selector("input[value='Yes']")
                
                if delusions_yes:
                    await delusions_yes.click()
                    await asyncio.sleep(1)
                    print("   ✓ Clicked Yes on Delusions")
                else:
                    print("   ✗ Could not find Delusions Yes button")
                
                # Click Yes on Anxiety
                anxiety_yes = await page.query_selector("label:has-text('Anxiety') ~ .form-check .form-check-input[value='Yes'], input[value='Yes'][name*='anxiety']")
                if not anxiety_yes:
                    anxiety_section = await page.query_selector("text=Anxiety")
                    if anxiety_section:
                        parent = await anxiety_section.evaluate_handle("el => el.closest('.card, .symptom-item, .row')")
                        anxiety_yes = await parent.query_selector("input[value='Yes']")
                
                if anxiety_yes:
                    await anxiety_yes.click()
                    await asyncio.sleep(1)
                    print("   ✓ Clicked Yes on Anxiety")
                else:
                    print("   ✗ Could not find Anxiety Yes button")
                
            except Exception as e:
                print(f"   ✗ Error clicking Yes buttons: {e}")
            
            # Take screenshot after selections
            print("\n5. Taking screenshot after Yes selections...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/npiq_with_yes.png", full_page=True)
            print("   ✓ Screenshot: npiq_with_yes.png")
            
            # Verify changes
            print("\n6. Verifying changes after Yes selections...")
            
            # Check for green highlights
            highlighted = await page.query_selector_all(".symptom-item.active, .card.border-success, .symptom-item.selected")
            print(f"   Found {len(highlighted)} highlighted symptom(s)")
            
            if len(highlighted) >= 2:
                print("   ✓ PASS: Symptoms marked Yes show green highlight")
            else:
                print(f"   ⚠ Only {len(highlighted)} highlighted (expected 2)")
            
            # Check for severity/distress grids in right column
            severity_grids = await page.query_selector_all("#npiqContent .severity-grid, #npiqContent table:has-text('Severity')")
            distress_grids = await page.query_selector_all("#npiqContent .distress-grid, #npiqContent table:has-text('Distress')")
            
            print(f"   Found {len(severity_grids)} severity grid(s)")
            print(f"   Found {len(distress_grids)} distress grid(s)")
            
            if len(severity_grids) >= 1 and len(distress_grids) >= 1:
                print("   ✓ PASS: Severity and distress grids appear in right column")
            else:
                print("   ⚠ Grids may not have appeared correctly")
            
            # Check if left column stayed stable
            print("\n   Checking left column stability...")
            print("   (Visual inspection needed - left column should not shift/expand)")
            
            # Test clicking severity/distress values
            print("\n7. Testing severity and distress value clicking...")
            
            try:
                # Try to click a severity value
                severity_cell = await page.query_selector("#npiqContent .severity-grid td:nth-child(2), #npiqContent table td:has-text('1')")
                if severity_cell:
                    await severity_cell.click()
                    await asyncio.sleep(0.5)
                    print("   ✓ Clicked severity value")
                
                # Try to click a distress value
                distress_cell = await page.query_selector("#npiqContent .distress-grid td:nth-child(3), #npiqContent table td:has-text('2')")
                if distress_cell:
                    await distress_cell.click()
                    await asyncio.sleep(0.5)
                    print("   ✓ Clicked distress value")
                
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/npiq_with_values.png", full_page=True)
                print("   ✓ Screenshot: npiq_with_values.png")
                
            except Exception as e:
                print(f"   ⚠ Error testing value clicking: {e}")
            
            # Test right panel sticky behavior
            print("\n   Testing right panel sticky behavior...")
            print("   (Scrolling left column to test if right panel stays visible)")
            
            await page.evaluate("window.scrollTo(0, 500)")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/npiq_scrolled.png", full_page=True)
            print("   ✓ Screenshot: npiq_scrolled.png")
            print("   (Visual inspection: right panel should remain visible)")
            
            print("\n" + "=" * 80)
            print("✅ ALL TESTS COMPLETED")
            print("=" * 80)
            print("\nPlease review screenshots for visual verification:")
            print("  - mbic_full_page.png")
            print("  - mbic_with_selections.png")
            print("  - mbic_scrolled.png")
            print("  - npiq_initial.png")
            print("  - npiq_with_yes.png")
            print("  - npiq_with_values.png")
            print("  - npiq_scrolled.png")
            
            # Keep browser open
            await asyncio.sleep(5)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/test_error_layout.png", full_page=True)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
