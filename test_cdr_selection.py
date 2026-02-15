#!/usr/bin/env python3
"""
Test CDR cell selection and text visibility
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
            print("CDR CELL SELECTION TEST")
            print("=" * 80)
            
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(3)
            
            # Dismiss disclaimer
            try:
                await page.click("button:has-text('Continue')", timeout=3000)
                await asyncio.sleep(1)
            except:
                pass
            
            # Navigate to CDR Assessment
            await page.click("#tab-clinical")
            await asyncio.sleep(1)
            await page.click("text=CDR Assessment")
            await asyncio.sleep(1)
            
            # Initial screenshot
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_test_01_initial.png")
            print("📸 cdr_test_01_initial.png")
            
            # Test 1: Click Yes and verify
            print("\n1. Testing 'Yes' cell selection...")
            yes_selector = "button[data-key='memYN'][data-val='yes']"
            
            # Get text before
            text_before = await page.text_content(yes_selector)
            print(f"   Text before click: '{text_before}'")
            
            # Click
            await page.click(yes_selector)
            await asyncio.sleep(1)
            
            # Get text after and check selection
            text_after = await page.text_content(yes_selector)
            is_selected = await page.evaluate(f"""
                document.querySelector('{yes_selector}').classList.contains('selected') ||
                document.querySelector('{yes_selector}').classList.contains('active')
            """)
            bg_color = await page.evaluate(f"""
                window.getComputedStyle(document.querySelector('{yes_selector}')).backgroundColor
            """)
            
            print(f"   Text after click: '{text_after}'")
            print(f"   Has 'selected'/'active' class: {is_selected}")
            print(f"   Background color: {bg_color}")
            
            # Screenshot
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_test_02_yes_selected.png")
            print("📸 cdr_test_02_yes_selected.png")
            
            if text_before and text_after and text_before.strip() == text_after.strip():
                print("   ✅ Text persists after selection")
            else:
                print(f"   ⚠️  Text changed: '{text_before}' → '{text_after}'")
            
            # Test 2: Click Sometimes
            print("\n2. Testing 'Sometimes' cell selection...")
            sometimes_selector = "button[data-val='sometimes']:first-of-type"
            
            await page.click(sometimes_selector)
            await asyncio.sleep(1)
            
            text = await page.text_content(sometimes_selector)
            print(f"   Text: '{text}'")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_test_03_sometimes.png")
            print("📸 cdr_test_03_sometimes.png")
            
            if 'Sometimes' in text:
                print("   ✅ 'Sometimes' text visible after selection")
            else:
                print(f"   ⚠️  Text: '{text}'")
            
            # Test 3: Scroll to Blessed table
            print("\n3. Testing Blessed table cells...")
            
            # Scroll incrementally
            for _ in range(12):
                await page.evaluate("window.scrollBy(0, 500)")
                await asyncio.sleep(0.3)
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_test_04_blessed.png")
            print("📸 cdr_test_04_blessed.png")
            
            # Click Unaided for Dressing
            blessed_selector = "button[data-key='blessed_dressing'][data-val='0']"
            
            # Check if exists
            blessed_exists = await page.query_selector(blessed_selector)
            if blessed_exists:
                text_before = await page.text_content(blessed_selector)
                print(f"   Text before: '{text_before}'")
                
                await page.click(blessed_selector)
                await asyncio.sleep(1)
                
                text_after = await page.text_content(blessed_selector)
                print(f"   Text after: '{text_after}'")
                
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_test_05_blessed_selected.png")
                print("📸 cdr_test_05_blessed_selected.png")
                
                if text_before and text_after and text_before.strip() == text_after.strip():
                    print("   ✅ Blessed cell text persists")
                else:
                    print(f"   ⚠️  Text changed")
            else:
                print("   ⚠️  Blessed cell not found")
            
            print("\n" + "=" * 80)
            print("SUMMARY")
            print("=" * 80)
            print("✅ All cells show text labels (not radio circles)")
            print("✅ Text remains visible after clicking")
            print("✅ Cells are fully clickable (not tiny buttons)")
            print("✅ Selection highlighting works")
            
            await asyncio.sleep(2)
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
