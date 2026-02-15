#!/usr/bin/env python3
"""
Test CDR Assessment cells - robust version
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        try:
            print("CDR ASSESSMENT CELLS TEST")
            print("=" * 80)
            
            # Load app
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(3)
            
            # Dismiss disclaimer with better selector
            print("\nDismissing disclaimer...")
            try:
                await page.wait_for_selector("button", timeout=5000)
                await page.click("button >> text=/Continue|Understand/", timeout=5000)
                await asyncio.sleep(1)
                print("✓ Dismissed")
            except:
                print("ℹ️ No disclaimer or already dismissed")
            
            # Click Clinical Interview
            print("\nOpening Clinical Interview > CDR Assessment...")
            await page.click("#tab-clinical", timeout=5000)
            await asyncio.sleep(1)
            
            # Click CDR Assessment
            await page.click("text=CDR Assessment >> nth=0", timeout=5000)
            await asyncio.sleep(1)
            print("✓ CDR Assessment opened")
            
            # Screenshot initial
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_01_initial.png", full_page=False)
            print("📸 cdr_01_initial.png - Initial CDR assessment view")
            
            # Click Yes
            print("\nClicking 'Yes' button...")
            yes_btn = await page.query_selector("button[data-key='memYN'][data-val='yes']")
            if yes_btn:
                await yes_btn.click()
                await asyncio.sleep(0.5)
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_02_yes_selected.png", full_page=False)
                print("📸 cdr_02_yes_selected.png - 'Yes' selected")
            
            # Click Sometimes
            print("\nClicking 'Sometimes' button...")
            sometimes_btn = await page.query_selector("button[data-val='sometimes']")
            if sometimes_btn:
                await sometimes_btn.click()
                await asyncio.sleep(0.5)
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_03_sometimes_selected.png", full_page=False)
                print("📸 cdr_03_sometimes_selected.png - 'Sometimes' selected")
            
            # Scroll to Personal Care
            print("\nScrolling to Personal Care / Blessed table...")
            for i in range(15):
                await page.evaluate("window.scrollBy(0, 500)")
                await asyncio.sleep(0.2)
                
                text = await page.evaluate("document.body.innerText")
                if 'Personal Care' in text or 'Blessed' in text:
                    print(f"✓ Found Personal Care section")
                    break
            
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_04_blessed_table.png", full_page=False)
            print("📸 cdr_04_blessed_table.png - Blessed scoring table")
            
            # Click Unaided for Dressing
            print("\nClicking 'Unaided' for Dressing...")
            unaided_btn = await page.query_selector("button[data-key='blessed_dressing'][data-val='0']")
            if unaided_btn:
                await unaided_btn.click()
                await asyncio.sleep(0.5)
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_05_blessed_selected.png", full_page=False)
                print("📸 cdr_05_blessed_selected.png - Blessed cell selected")
            
            print("\n✅ Test complete - check screenshots for visibility")
            await asyncio.sleep(2)
            
        except Exception as e:
            print(f"ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
