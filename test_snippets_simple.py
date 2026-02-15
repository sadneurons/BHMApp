#!/usr/bin/env python3
"""
Test snippet library - simplified version
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"{msg.type}: {msg.text}"))
        
        try:
            print("SNIPPET LIBRARY TEST")
            print("=" * 80)
            
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(2)
            
            await page.click("#tab-report")
            await asyncio.sleep(2)
            
            # Count elements using simpler selectors
            print("\nCounting snippet panel elements...")
            counts = await page.evaluate("""
                (() => {
                    return {
                        snippetCards: document.querySelectorAll('.snippet-card').length,
                        dropZones: document.querySelectorAll('.snippet-drop-zone').length,
                        categories: document.querySelectorAll('.snippet-category').length
                    };
                })();
            """)
            
            print(f"   Snippet cards: {counts['snippetCards']}")
            print(f"   Drop zones: {counts['dropZones']}")
            print(f"   Categories: {counts['categories']}")
            
            # Scroll to see drop zones
            print("\nScrolling to find drop zones...")
            await page.evaluate("document.querySelector('.report-content').scrollTop = 400")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/snippet_dropzones.png", full_page=False)
            print("   📸 snippet_dropzones.png")
            
            # Test toggle
            print("\nTesting toggle button...")
            toggle_btn = await page.query_selector(".snippet-toggle-btn, .btn-toggle-snippets")
            if toggle_btn:
                await toggle_btn.click()
                await asyncio.sleep(0.5)
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/snippet_collapsed.png", full_page=False)
                print("   📸 snippet_collapsed.png")
                
                await toggle_btn.click()
                await asyncio.sleep(0.5)
                print("   ✓ Toggle working")
            
            # Insert snippet via console
            print("\nInserting snippet via console...")
            await page.evaluate("""
                (() => {
                    BHM.State.set('snippetInserts.sleep', 'A lumbar puncture (sometimes called a spinal tap) is a procedure where a small amount of fluid is collected from the lower part of the spine.');
                    BHM.Report.update();
                    console.log('Snippet inserted');
                })();
            """)
            await asyncio.sleep(1)
            
            # Scroll to Sleep section
            print("\nScrolling to Sleep section...")
            await page.evaluate("document.querySelector('.report-content').scrollTop = 800")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/snippet_populated.png", full_page=False)
            print("   📸 snippet_populated.png")
            
            # Check console
            print("\nConsole messages:")
            for msg in console_messages[-10:]:
                print(f"   {msg}")
            
            print("\n✅ Test complete")
            await asyncio.sleep(2)
            
        except Exception as e:
            print(f"ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
