#!/usr/bin/env python3
"""
Test dark theme text visibility and adaptation
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
            print("DARK THEME TEXT VISIBILITY TEST")
            print("=" * 80)
            
            # Step 1: Load app
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"\nLoading {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(2)
            
            # Step 2: Dismiss disclaimer
            print("Dismissing disclaimer...")
            continue_btn = await page.query_selector("button:has-text('Continue')")
            if continue_btn:
                await continue_btn.click()
                await asyncio.sleep(1)
            
            # Step 3: Screenshot Session tab in default theme
            print("\nStep 3: Screenshot Session tab - Default theme (baseline)")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/dark_test_01_default_session.png", full_page=False)
            print("   📸 dark_test_01_default_session.png")
            
            # Step 4: Select Slate theme
            print("\nStep 4: Selecting Slate theme...")
            await page.click("button.dropdown-toggle")
            await asyncio.sleep(0.3)
            await page.click("text=Slate")
            await asyncio.sleep(1)
            print("   ✓ Slate theme applied")
            
            # Step 5: Screenshot Session tab in Slate
            print("\nStep 5: Screenshot Session tab - Slate theme")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/dark_test_02_slate_session.png", full_page=False)
            print("   📸 dark_test_02_slate_session.png")
            
            # Scroll down to see more form elements
            await page.evaluate("window.scrollBy(0, 300)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/dark_test_03_slate_session_lower.png", full_page=False)
            print("   📸 dark_test_03_slate_session_lower.png")
            
            # Step 6-7: Click Patient Booklet and PSQI
            print("\nStep 6-7: Opening Patient Booklet > PSQI in Slate theme")
            await page.click("#tab-patient")
            await asyncio.sleep(0.5)
            await page.click("text=PSQI")
            await asyncio.sleep(0.5)
            
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.3)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/dark_test_04_slate_psqi_top.png", full_page=False)
            print("   📸 dark_test_04_slate_psqi_top.png")
            
            # Scroll to see grid
            await page.evaluate("window.scrollBy(0, 600)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/dark_test_05_slate_psqi_grid.png", full_page=False)
            print("   📸 dark_test_05_slate_psqi_grid.png")
            
            # Step 8-9: Switch to Dracula
            print("\nStep 8-9: Switching to Dracula theme...")
            await page.click("button.dropdown-toggle")
            await asyncio.sleep(0.3)
            await page.click("text=Dracula")
            await asyncio.sleep(1)
            print("   ✓ Dracula theme applied")
            
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.3)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/dark_test_06_dracula_psqi.png", full_page=False)
            print("   📸 dark_test_06_dracula_psqi.png")
            
            # Scroll to grid in Dracula
            await page.evaluate("window.scrollBy(0, 600)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/dark_test_07_dracula_grid.png", full_page=False)
            print("   📸 dark_test_07_dracula_grid.png")
            
            # Step 10-11: Switch to Vapor
            print("\nStep 10-11: Switching to Vapor theme...")
            await page.click("button.dropdown-toggle")
            await asyncio.sleep(0.3)
            await page.click("text=Vapor")
            await asyncio.sleep(1)
            print("   ✓ Vapor theme applied")
            
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.3)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/dark_test_08_vapor_psqi.png", full_page=False)
            print("   📸 dark_test_08_vapor_psqi.png")
            
            # Scroll to grid in Vapor
            await page.evaluate("window.scrollBy(0, 600)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/dark_test_09_vapor_grid.png", full_page=False)
            print("   📸 dark_test_09_vapor_grid.png")
            
            # Step 12: Return to Default
            print("\nStep 12: Returning to Default theme...")
            await page.click("button.dropdown-toggle")
            await asyncio.sleep(0.3)
            await page.click("text=Default")
            await asyncio.sleep(1)
            print("   ✓ Default theme restored")
            
            print("\n" + "=" * 80)
            print("TEST COMPLETE")
            print("=" * 80)
            print("✅ All themes tested")
            print("✅ Screenshots captured for visibility analysis")
            
            await asyncio.sleep(2)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
