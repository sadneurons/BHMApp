#!/usr/bin/env python3
"""
Browser automation script to test the AUDIT table - version 2
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        try:
            print("=" * 60)
            print("BHM Assessment App - AUDIT Table Test v2")
            print("=" * 60)
            
            # Navigate and setup
            print("\n1. Navigating to http://localhost:8765/index.html...")
            await page.goto("http://localhost:8765/index.html")
            await page.wait_for_load_state("networkidle")
            
            print("2. Clicking Patient Booklet tab...")
            await page.click("#tab-patient")
            await asyncio.sleep(1)
            
            print("3. Clicking AUDIT sub-tab...")
            await page.click("#patientSubTabs .nav-link[data-bs-target='#sub-audit-tool']")
            await asyncio.sleep(1.5)
            
            # Take initial screenshot
            print("\n4. Taking initial AUDIT table screenshot...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/audit_01_initial.png", full_page=True)
            print("   ✓ Screenshot: audit_01_initial.png")
            
            # Click cells using page.click with CSS selectors
            print("\n5. Clicking cells to test interaction...")
            
            # Find the AUDIT table container
            audit_content = await page.query_selector("#auditToolContent")
            if audit_content:
                # Click "Monthly or less" for Q1 using a more specific approach
                print("   - Clicking 'Monthly or less' for Q1...")
                # Use text content to find the right cell
                await page.click("text=Monthly or less >> nth=0")
                await asyncio.sleep(0.5)
                print("     ✓ Q1 clicked")
                
                # Click "3 to 4" for Q2
                print("   - Clicking '3 to 4' for Q2...")
                await page.click("text=3 to 4 >> nth=0")
                await asyncio.sleep(0.5)
                print("     ✓ Q2 clicked")
                
                # Take screenshot after selections
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/audit_02_selections.png", full_page=True)
                print("   ✓ Screenshot: audit_02_selections.png")
            
            # Scroll to bottom to see Q9-10
            print("\n6. Scrolling to Q9-10 area...")
            
            # Scroll within the content area
            await page.evaluate("document.querySelector('#auditToolContent').scrollIntoView({behavior: 'smooth', block: 'end'})")
            await asyncio.sleep(1)
            
            # Take screenshot of Q9-10
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/audit_03_q9_q10.png", full_page=True)
            print("   ✓ Screenshot: audit_03_q9_q10.png")
            
            # Get the AUDIT score
            score_element = await page.query_selector("text=AUDIT Score:")
            if score_element:
                parent = await score_element.evaluate_handle("el => el.parentElement")
                score_text = await parent.inner_text()
                print(f"\n7. Current AUDIT Score: {score_text.strip()}")
            
            print("\n" + "=" * 60)
            print("Test completed successfully!")
            print("=" * 60)
            
            # Keep browser open
            await asyncio.sleep(3)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/audit_error_v2.png", full_page=True)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
