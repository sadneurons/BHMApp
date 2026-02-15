#!/usr/bin/env python3
"""
Capture remaining CDR Assessment screenshots with manual scrolling
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        try:
            # Navigate
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(1)
            
            # Go to Clinical Interview → CDR Assessment
            await page.click("#tab-clinical")
            await asyncio.sleep(1)
            
            await page.click("button:has-text('CDR Assessment')")
            await asyncio.sleep(1.5)
            
            print("Taking screenshots with manual scrolling...")
            
            # Scroll increments
            scroll_positions = [0, 800, 1600, 2400, 3200, 4000]
            
            for i, pos in enumerate(scroll_positions, 1):
                await page.evaluate(f"window.scrollTo(0, {pos})")
                await asyncio.sleep(1)
                await page.screenshot(path=f"/home/tenebris/Desktop/BHMApp/cdr_scroll_{i}.png", full_page=False)
                print(f"✓ Screenshot {i}: cdr_scroll_{i}.png (scroll position {pos})")
            
            # Go to CDR Scoring tab
            print("\nSwitching to CDR Scoring tab...")
            await page.click("button:has-text('CDR Scoring')")
            await asyncio.sleep(1.5)
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_scoring_final.png", full_page=True)
            print("✓ Screenshot: cdr_scoring_final.png")
            
            print("\n✅ All screenshots captured!")
            await asyncio.sleep(3)
            
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
