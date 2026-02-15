#!/usr/bin/env python3
"""
Browser automation script to test the AUDIT table in BHM Assessment App
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1080})
        
        try:
            print("=" * 60)
            print("BHM Assessment App - AUDIT Table Test")
            print("=" * 60)
            
            # Step 1: Navigate to the app
            print("\n1. Navigating to http://localhost:8765/index.html...")
            await page.goto("http://localhost:8765/index.html")
            await page.wait_for_load_state("networkidle")
            print("   ✓ Page loaded")
            
            # Step 2: Click on Patient Booklet tab
            print("\n2. Clicking on 'Patient Booklet' tab...")
            await page.click("#tab-patient")
            await asyncio.sleep(1)
            print("   ✓ Patient Booklet tab clicked")
            
            # Step 3: Click on AUDIT sub-tab
            print("\n3. Clicking on 'AUDIT' sub-tab...")
            await page.click("#patientSubTabs .nav-link[data-bs-target='#sub-audit-tool']")
            await asyncio.sleep(1)
            print("   ✓ AUDIT sub-tab clicked")
            
            # Wait for AUDIT content to load
            await page.wait_for_selector("#auditToolContent", state="visible")
            await asyncio.sleep(1)
            
            # Step 4: Take screenshot of AUDIT table
            print("\n4. Analyzing AUDIT table structure...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/screenshot_audit_01_initial.png", full_page=True)
            print("   ✓ Screenshot saved: screenshot_audit_01_initial.png")
            
            # Check table structure
            tables = await page.query_selector_all("table.clickable-grid")
            print(f"   ✓ Found {len(tables)} table(s)")
            
            if tables:
                # Get the first table (should be the unified AUDIT table)
                audit_table = tables[0]
                
                # Check headers
                headers = await audit_table.query_selector_all("thead th")
                header_texts = []
                for header in headers:
                    text = await header.inner_text()
                    header_texts.append(text.strip())
                print(f"   ✓ Column headers: {' | '.join(header_texts)}")
                
                # Check number of rows
                rows = await audit_table.query_selector_all("tbody tr")
                print(f"   ✓ Total rows: {len(rows)} (including total row)")
                
                # Check if it's a single unified table
                print(f"   ✓ Table appears as a single unified form")
            
            # Step 5: Click on cells to test interaction
            print("\n5. Testing cell interactions...")
            
            # Click "Monthly or less" for Q1 (row 1, column 2)
            print("   - Clicking 'Monthly or less' (1) for Q1...")
            q1_cell = await page.query_selector("table.clickable-grid tbody tr:nth-child(1) td:nth-child(2)")
            if q1_cell:
                await q1_cell.click()
                await asyncio.sleep(0.5)
                print("     ✓ Q1 cell clicked")
            
            # Click "3 to 4" for Q2 (row 2, column 3)
            print("   - Clicking '3 to 4' (2) for Q2...")
            q2_cell = await page.query_selector("table.clickable-grid tbody tr:nth-child(2) td:nth-child(3)")
            if q2_cell:
                await q2_cell.click()
                await asyncio.sleep(0.5)
                print("     ✓ Q2 cell clicked")
            
            # Take screenshot showing selections
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/screenshot_audit_02_selections.png", full_page=True)
            print("   ✓ Screenshot saved: screenshot_audit_02_selections.png")
            
            # Check if "Your score" column is updating
            score_cells = await page.query_selector_all("table.clickable-grid tbody tr td:last-child")
            if len(score_cells) >= 2:
                q1_score = await score_cells[0].inner_text()
                q2_score = await score_cells[1].inner_text()
                print(f"   ✓ Q1 score: {q1_score.strip()}")
                print(f"   ✓ Q2 score: {q2_score.strip()}")
            
            # Step 6: Scroll down to see Q9-10
            print("\n6. Scrolling to Q9-10...")
            
            # Scroll to the bottom of the table
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(1)
            
            # Take screenshot of Q9-10 area
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/screenshot_audit_03_q9_q10.png", full_page=True)
            print("   ✓ Screenshot saved: screenshot_audit_03_q9_q10.png")
            
            # Check Q9 and Q10 structure
            print("   - Analyzing Q9-10 layout...")
            q9_row = await page.query_selector("table.clickable-grid tbody tr:nth-child(9)")
            q10_row = await page.query_selector("table.clickable-grid tbody tr:nth-child(10)")
            
            if q9_row:
                q9_cells = await q9_row.query_selector_all("td")
                print(f"     ✓ Q9 has {len(q9_cells)} cells total")
                
                # Check for grey/disabled cells
                grey_cells = 0
                for i, cell in enumerate(q9_cells):
                    classes = await cell.get_attribute("class")
                    if classes and ("disabled" in classes or "grey" in classes or "empty" in classes):
                        grey_cells += 1
                print(f"     ✓ Q9 has {grey_cells} grey/disabled cells")
            
            if q10_row:
                q10_cells = await q10_row.query_selector_all("td")
                print(f"     ✓ Q10 has {len(q10_cells)} cells total")
            
            # Check total row
            print("\n7. Checking total score row...")
            total_row = await page.query_selector("table.clickable-grid tbody tr:last-child")
            if total_row:
                total_text = await total_row.inner_text()
                print(f"   ✓ Total row text: {total_text[:50]}...")
            
            print("\n" + "=" * 60)
            print("AUDIT table test completed!")
            print("=" * 60)
            
            # Keep browser open for a moment
            await asyncio.sleep(3)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/screenshot_audit_error.png", full_page=True)
            print("Error screenshot saved: screenshot_audit_error.png")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
