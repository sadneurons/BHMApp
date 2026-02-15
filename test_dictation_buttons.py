#!/usr/bin/env python3
"""
Test dictation microphone buttons in clinical notes textareas
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
        page.on("console", lambda msg: console_messages.append(f"{msg.type}: {msg.text}"))
        
        try:
            print("=" * 80)
            print("DICTATION MICROPHONE BUTTONS TEST")
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
            
            # Step 3: Look for clinical notes boxes with mic buttons
            print("\nStep 3: Looking for clinical notes boxes with microphone buttons...")
            
            # Scroll to find some clinical notes boxes
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            
            # Take initial screenshot
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/dictation_01_top.png", full_page=False)
            print("   📸 dictation_01_top.png")
            
            # Scroll down to see more
            await page.evaluate("window.scrollBy(0, 600)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/dictation_02_middle.png", full_page=False)
            print("   📸 dictation_02_middle.png")
            
            await page.evaluate("window.scrollBy(0, 600)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/dictation_03_lower.png", full_page=False)
            print("   📸 dictation_03_lower.png")
            
            # Step 5: Check speech API support and count buttons
            print("\nStep 5: Checking speech API support and button count...")
            
            check_script = """
            var supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
            console.log('Speech Recognition supported:', supported);
            var btns = document.querySelectorAll('.dictation-btn');
            console.log('Dictation buttons found:', btns.length);
            var unsupported = document.querySelectorAll('.dictation-btn.unsupported');
            console.log('Unsupported buttons:', unsupported.length);
            return {
                supported: supported,
                totalButtons: btns.length,
                unsupportedButtons: unsupported.length
            };
            """
            
            result = await page.evaluate(check_script)
            print(f"\n   Speech Recognition supported: {result['supported']}")
            print(f"   Dictation buttons found: {result['totalButtons']}")
            print(f"   Unsupported buttons: {result['unsupportedButtons']}")
            
            # Step 6: Show console output
            print("\nStep 6: Recent console messages:")
            for msg in console_messages[-10:]:
                print(f"   {msg}")
            
            # Step 7: Try clicking a mic button
            print("\nStep 7: Attempting to click first microphone button...")
            
            mic_button = await page.query_selector(".dictation-btn")
            if mic_button:
                print("   ✓ Found microphone button")
                
                # Get button state before click
                button_info = await mic_button.evaluate("""
                    btn => ({
                        classList: Array.from(btn.classList),
                        title: btn.getAttribute('title'),
                        disabled: btn.disabled
                    })
                """)
                print(f"   Button classes before click: {button_info['classList']}")
                print(f"   Button title: {button_info['title']}")
                print(f"   Button disabled: {button_info['disabled']}")
                
                try:
                    await mic_button.click()
                    await asyncio.sleep(1)
                    print("   ✓ Button clicked")
                    
                    # Get button state after click
                    button_info_after = await mic_button.evaluate("""
                        btn => ({
                            classList: Array.from(btn.classList),
                            title: btn.getAttribute('title')
                        })
                    """)
                    print(f"   Button classes after click: {button_info_after['classList']}")
                    print(f"   Button title after click: {button_info_after['title']}")
                    
                    # Step 8: Take screenshot after click
                    await page.screenshot(path="/home/tenebris/Desktop/BHMApp/dictation_04_after_click.png", full_page=False)
                    print("   📸 dictation_04_after_click.png")
                    
                except Exception as e:
                    print(f"   ⚠ Click error: {e}")
            else:
                print("   ✗ No microphone button found")
            
            # Step 9: Count all mic buttons and textareas
            print("\nStep 9: Counting all dictation buttons and clinical notes textareas...")
            
            counts = await page.evaluate("""
                () => {
                    var allButtons = document.querySelectorAll('.dictation-btn');
                    var allTextareas = document.querySelectorAll('textarea[data-insert-key]');
                    var inserts = document.querySelectorAll('.clinician-insert');
                    return {
                        buttons: allButtons.length,
                        textareas: allTextareas.length,
                        inserts: inserts.length
                    };
                }
            """)
            
            print(f"   Total microphone buttons: {counts['buttons']}")
            print(f"   Total clinical notes textareas: {counts['textareas']}")
            print(f"   Total clinical notes inserts: {counts['inserts']}")
            
            if counts['buttons'] == counts['textareas']:
                print("   ✅ Button count matches textarea count")
            else:
                print(f"   ⚠ Mismatch: {counts['buttons']} buttons vs {counts['textareas']} textareas")
            
            # Step 10: Verify button styling
            print("\nStep 10: Verifying microphone button styling...")
            
            if mic_button:
                styling = await mic_button.evaluate("""
                    btn => {
                        var computed = window.getComputedStyle(btn);
                        return {
                            backgroundColor: computed.backgroundColor,
                            borderRadius: computed.borderRadius,
                            display: computed.display,
                            width: computed.width,
                            height: computed.height
                        };
                    }
                """)
                
                print(f"   Background color: {styling['backgroundColor']}")
                print(f"   Border radius: {styling['borderRadius']}")
                print(f"   Display: {styling['display']}")
                print(f"   Width: {styling['width']}")
                print(f"   Height: {styling['height']}")
            
            # Take a final full screenshot showing multiple clinical notes boxes
            print("\nTaking final screenshot showing multiple clinical notes boxes...")
            await page.evaluate("window.scrollTo(0, 400)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/dictation_05_final.png", full_page=False)
            print("   📸 dictation_05_final.png")
            
            print("\n" + "=" * 80)
            print("SUMMARY")
            print("=" * 80)
            print(f"✅ Dictation buttons found: {counts['buttons']}")
            print(f"✅ Clinical notes textareas: {counts['textareas']}")
            print(f"✅ Speech Recognition API: {'Supported' if result['supported'] else 'Not supported'}")
            
            await asyncio.sleep(2)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/dictation_error.png", full_page=True)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
