#!/usr/bin/env python3
"""
Browser automation script to test the BHM Assessment App using Playwright
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
            print("BHM Assessment App - Browser Test")
            print("=" * 60)
            
            # Step 1: Navigate to the app
            print("\n1. Navigating to http://localhost:8765/index.html...")
            await page.goto("http://localhost:8765/index.html")
            await page.wait_for_load_state("networkidle")
            
            # Take screenshot of initial state
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/screenshot_01_initial.png", full_page=True)
            print("   ✓ Screenshot saved: screenshot_01_initial.png")
            print(f"   ✓ Page title: {await page.title()}")
            
            # Verify Session tab is active
            session_tab = await page.query_selector("#tab-session")
            if session_tab:
                classes = await session_tab.get_attribute("class")
                if "active" in classes:
                    print("   ✓ Session tab is active (correct initial state)")
                else:
                    print("   ✗ Session tab is NOT active (unexpected)")
            
            # Step 2: Click on Patient Booklet tab
            print("\n2. Clicking on 'Patient Booklet' tab...")
            await page.click("#tab-patient")
            await asyncio.sleep(1)
            
            # Take screenshot showing sub-tabs
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/screenshot_02_patient_booklet.png", full_page=True)
            print("   ✓ Screenshot saved: screenshot_02_patient_booklet.png")
            
            # Verify sub-tabs are visible
            sub_tabs = await page.query_selector_all("#patientSubTabs .nav-link")
            sub_tab_names = []
            for tab in sub_tabs:
                text = await tab.inner_text()
                sub_tab_names.append(text)
            print(f"   ✓ Sub-tabs visible: {', '.join(sub_tab_names)}")
            
            # Step 3: Verify PSQI sub-tab
            print("\n3. Verifying PSQI sub-tab...")
            psqi_tab = await page.query_selector("#patientSubTabs .nav-link[data-bs-target='#sub-psqi']")
            if psqi_tab:
                classes = await psqi_tab.get_attribute("class")
                if "active" not in classes:
                    await psqi_tab.click()
                    await asyncio.sleep(1)
            
            # Wait for PSQI content to load
            await page.wait_for_selector("#psqiContent", state="visible")
            await asyncio.sleep(1)  # Give time for content to render
            
            # Take screenshot of PSQI content
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/screenshot_03_psqi.png", full_page=True)
            print("   ✓ Screenshot saved: screenshot_03_psqi.png")
            
            # Check for clickable grid
            grids = await page.query_selector_all(".clickable-grid")
            print(f"   ✓ Found {len(grids)} clickable grid(s)")
            
            if grids:
                print(f"   ✓ PSQI Q5 grid is visible")
                
                # Get rows in the first grid
                rows = await grids[0].query_selector_all("tbody tr")
                print(f"   ✓ Grid has {len(rows)} rows (sleep disturbance items)")
            else:
                print("   ✗ No clickable grids found")
            
            # Step 4: Try clicking on a cell
            print("\n4. Clicking on a cell in PSQI Q5 grid...")
            try:
                # Find the first clickable cell (Less than once a week for first item)
                first_cell = await page.query_selector("table.clickable-grid tbody tr:first-child td:nth-child(2)")
                if first_cell:
                    await first_cell.click()
                    await asyncio.sleep(0.5)
                    
                    await page.screenshot(path="/home/tenebris/Desktop/BHMApp/screenshot_04_cell_clicked.png", full_page=True)
                    print("   ✓ Screenshot saved: screenshot_04_cell_clicked.png")
                    print("   ✓ Cell clicked successfully")
                    
                    # Check if the cell is now selected
                    classes = await first_cell.get_attribute("class")
                    if "selected" in classes:
                        print("   ✓ Cell is now marked as selected")
                    else:
                        print("   ⚠ Cell clicked but no 'selected' class applied")
                else:
                    print("   ✗ Could not find cell to click")
            except Exception as e:
                print(f"   ✗ Error clicking cell: {e}")
            
            # Step 5: Click Report button in navbar
            print("\n5. Clicking 'Report' button in navbar...")
            try:
                await page.click("#toggleReportPanelBtn")
                await asyncio.sleep(1)
                
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/screenshot_05_report_panel.png", full_page=True)
                print("   ✓ Screenshot saved: screenshot_05_report_panel.png")
                
                # Check if side panel is visible
                side_panel = await page.query_selector("#reportSidePanel")
                if side_panel:
                    classes = await side_panel.get_attribute("class")
                    if "collapsed" not in classes:
                        print("   ✓ Report side panel is now visible")
                    else:
                        print("   ✗ Report side panel is still collapsed")
            except Exception as e:
                print(f"   ✗ Error toggling report panel: {e}")
            
            # Check for JavaScript errors in console
            print("\n6. Checking for JavaScript errors...")
            console_messages = []
            page.on("console", lambda msg: console_messages.append(msg))
            
            # Check for any error messages already logged
            errors = [msg for msg in console_messages if msg.type == "error"]
            if errors:
                print(f"   ✗ Found {len(errors)} JavaScript error(s):")
                for error in errors[:5]:
                    print(f"      - {error.text}")
            else:
                print("   ✓ No JavaScript errors detected")
            
            print("\n" + "=" * 60)
            print("Test completed! Screenshots saved to BHMApp directory.")
            print("=" * 60)
            
            # Keep browser open for a moment
            await asyncio.sleep(3)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/screenshot_error.png", full_page=True)
            print("Error screenshot saved: screenshot_error.png")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
