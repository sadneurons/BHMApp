#!/usr/bin/env python3
"""
Test clinical notes textarea typing - no scroll jump or character loss
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        console_messages = []
        console_errors = []
        page.on("console", lambda msg: (
            console_messages.append(msg.text) if msg.type == "log" else
            console_errors.append(msg.text) if msg.type == "error" else None
        ))
        
        try:
            print("=" * 80)
            print("CLINICAL NOTES TEXTAREA TYPING TEST")
            print("=" * 80)
            
            # Step 1: Navigate
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"\nStep 1: Loading {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(2)
            print("   ✓ Page loaded")
            
            # Step 2: Click Report tab
            print("\nStep 2: Clicking Report tab...")
            await page.click("#tab-report")
            await asyncio.sleep(2)
            print("   ✓ Report tab opened")
            
            # Step 3: Take initial screenshot
            print("\nStep 3: Taking initial screenshot...")
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/typing_test_01_initial.png", full_page=False)
            print("   📸 typing_test_01_initial.png")
            
            # Step 4: Find first clinical notes textarea
            print("\nStep 4: Finding first clinical notes textarea...")
            
            # Scroll down to find a textarea
            for i in range(5):
                await page.evaluate("window.scrollBy(0, 400)")
                await asyncio.sleep(0.3)
                
                textareas = await page.query_selector_all("textarea[data-insert-key]")
                if textareas:
                    print(f"   ✓ Found {len(textareas)} clinical notes textareas")
                    break
            
            # Step 5: Click into first textarea
            print("\nStep 5: Clicking into first textarea...")
            first_textarea = await page.query_selector("textarea[data-insert-key]")
            if not first_textarea:
                print("   ✗ No textarea found!")
                return
            
            # Get scroll position before clicking
            scroll_before = await page.evaluate("window.pageYOffset")
            print(f"   Scroll position before click: {scroll_before}px")
            
            await first_textarea.click()
            await asyncio.sleep(0.5)
            
            scroll_after_click = await page.evaluate("window.pageYOffset")
            print(f"   Scroll position after click: {scroll_after_click}px")
            
            # Step 6: Type test text
            print("\nStep 6: Typing test text...")
            test_text_1 = "This is a test of typing in the clinical notes field. It should not cause the page to scroll or lose characters."
            
            await first_textarea.type(test_text_1, delay=20)  # 20ms delay between chars
            await asyncio.sleep(1)
            
            scroll_after_typing = await page.evaluate("window.pageYOffset")
            print(f"   Scroll position after typing: {scroll_after_typing}px")
            
            # Step 7: Take screenshot
            print("\nStep 7: Taking screenshot after first typing...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/typing_test_02_first_text.png", full_page=False)
            print("   📸 typing_test_02_first_text.png")
            
            # Step 8: Verify text content
            print("\nStep 8: Verifying first textarea content...")
            actual_text = await first_textarea.input_value()
            
            if actual_text == test_text_1:
                print(f"   ✅ PASS: Full text present ({len(actual_text)} chars)")
            else:
                print(f"   ❌ FAIL: Text mismatch!")
                print(f"      Expected: {len(test_text_1)} chars")
                print(f"      Got: {len(actual_text)} chars")
                print(f"      Missing: {len(test_text_1) - len(actual_text)} chars")
            
            # Check scroll stability
            scroll_delta = abs(scroll_after_typing - scroll_before)
            if scroll_delta < 50:  # Allow small scroll adjustments
                print(f"   ✅ PASS: Page scroll stable (delta: {scroll_delta}px)")
            else:
                print(f"   ❌ FAIL: Page scrolled unexpectedly (delta: {scroll_delta}px)")
            
            # Step 9: Find and type in second textarea
            print("\nStep 9: Finding second clinical notes textarea...")
            await page.evaluate("window.scrollBy(0, 600)")
            await asyncio.sleep(0.5)
            
            all_textareas = await page.query_selector_all("textarea[data-insert-key]")
            if len(all_textareas) > 1:
                print(f"   ✓ Found {len(all_textareas)} textareas total")
                
                second_textarea = all_textareas[1]
                
                scroll_before_2 = await page.evaluate("window.pageYOffset")
                print(f"   Scroll position before second click: {scroll_before_2}px")
                
                await second_textarea.click()
                await asyncio.sleep(0.5)
                
                print("\nStep 10: Typing in second textarea...")
                test_text_2 = "Second test of typing functionality works correctly."
                
                await second_textarea.type(test_text_2, delay=20)
                await asyncio.sleep(1)
                
                scroll_after_2 = await page.evaluate("window.pageYOffset")
                print(f"   Scroll position after second typing: {scroll_after_2}px")
                
                # Take screenshot
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/typing_test_03_second_text.png", full_page=False)
                print("   📸 typing_test_03_second_text.png")
                
                # Verify second textarea
                actual_text_2 = await second_textarea.input_value()
                
                if actual_text_2 == test_text_2:
                    print(f"   ✅ PASS: Second textarea full text present ({len(actual_text_2)} chars)")
                else:
                    print(f"   ❌ FAIL: Second textarea text mismatch!")
                    print(f"      Expected: {len(test_text_2)} chars")
                    print(f"      Got: {len(actual_text_2)} chars")
                
                scroll_delta_2 = abs(scroll_after_2 - scroll_before_2)
                if scroll_delta_2 < 50:
                    print(f"   ✅ PASS: Second textarea scroll stable (delta: {scroll_delta_2}px)")
                else:
                    print(f"   ❌ FAIL: Second textarea scroll jumped (delta: {scroll_delta_2}px)")
            else:
                print("   ⚠ Only one textarea found, skipping second test")
            
            # Check console errors
            print("\n" + "=" * 80)
            print("RESULTS SUMMARY")
            print("=" * 80)
            
            if console_errors:
                print(f"\n⚠ Console errors: {len(console_errors)}")
                for err in console_errors[:5]:
                    print(f"   {err}")
            else:
                print("\n✅ No console errors")
            
            print(f"\n✅ Test completed - {len(all_textareas)} textareas tested")
            
            await asyncio.sleep(3)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/typing_test_error.png", full_page=True)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
