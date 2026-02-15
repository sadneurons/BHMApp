#!/usr/bin/env python3
"""
Test theme picker - simplified version
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        try:
            print("THEME PICKER TEST")
            print("=" * 80)
            
            # Load and dismiss disclaimer
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(2)
            
            continue_btn = await page.query_selector("button:has-text('Continue')")
            if continue_btn:
                await continue_btn.click()
                await asyncio.sleep(1)
                print("✓ Disclaimer dismissed\n")
            
            # Screenshot default theme
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/themes_default.png", full_page=False)
            print("📸 themes_default.png - Default theme (Bootstrap blue)")
            
            # Find and click theme dropdown - try the button in navbar
            print("\nLooking for theme picker button...")
            theme_btn = await page.query_selector("button.dropdown-toggle")
            if theme_btn:
                btn_text = await theme_btn.inner_text()
                print(f"Found: {btn_text}")
                await theme_btn.click()
                await asyncio.sleep(0.5)
                
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/themes_dropdown.png", full_page=False)
                print("📸 themes_dropdown.png - Dropdown opened")
                
                # Select Dracula
                print("\nSelecting Dracula...")
                await page.click("text=Dracula")
                await asyncio.sleep(1)
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/themes_dracula.png", full_page=False)
                print("📸 themes_dracula.png")
                
                # Open dropdown again for Minty
                await page.click("button.dropdown-toggle")
                await asyncio.sleep(0.3)
                print("\nSelecting Minty...")
                await page.click("text=Minty")
                await asyncio.sleep(1)
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/themes_minty.png", full_page=False)
                print("📸 themes_minty.png")
                
                # Open dropdown again for Vapor
                await page.click("button.dropdown-toggle")
                await asyncio.sleep(0.3)
                print("\nSelecting Vapor...")
                await page.click("text=Vapor")
                await asyncio.sleep(1)
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/themes_vapor.png", full_page=False)
                print("📸 themes_vapor.png")
                
                # Return to Default
                await page.click("button.dropdown-toggle")
                await asyncio.sleep(0.3)
                print("\nReturning to Default...")
                await page.click("text=Default")
                await asyncio.sleep(1)
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/themes_return_default.png", full_page=False)
                print("📸 themes_return_default.png")
                
                print("\n✅ Theme picker test complete")
                
            await asyncio.sleep(2)
            
        except Exception as e:
            print(f"ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
