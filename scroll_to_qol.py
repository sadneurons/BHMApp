#!/usr/bin/env python3
"""
Scroll to Quality of Life section specifically
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        try:
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(2)
            
            # Inject CASP-19 data
            inject_script = """
            (function() {
              var casp = BHM.State.getSession().instruments.casp19;
              casp.c1 = 1; casp.c2 = 0; casp.c3 = 2; casp.c4 = 0;
              casp.c5 = 2; casp.c6 = 1; casp.c7 = 2; casp.c8 = 1; casp.c9 = 0;
              casp.c10 = 0; casp.c11 = 0; casp.c12 = 0; casp.c13 = 1; casp.c14 = 2;
              casp.c15 = 3; casp.c16 = 2; casp.c17 = 3; casp.c18 = 2; casp.c19 = 3;
              BHM.Scoring.casp19();
              BHM.Report.update();
              return 'Done';
            })();
            """
            
            await page.evaluate(inject_script)
            await asyncio.sleep(1)
            
            await page.click("#tab-report")
            await asyncio.sleep(2)
            
            print("Scrolling to find Quality of Life...")
            
            # Scroll in larger increments
            for i in range(30):
                scroll_pos = i * 800
                await page.evaluate(f"window.scrollTo(0, {scroll_pos})")
                await asyncio.sleep(0.3)
                
                # Check for Quality of Life in the visible text
                visible_text = await page.evaluate("""
                    () => {
                        const viewportHeight = window.innerHeight;
                        const allElements = Array.from(document.querySelectorAll('h3, h4, h5, p'));
                        const visible = allElements.filter(el => {
                            const rect = el.getBoundingClientRect();
                            return rect.top >= 0 && rect.top < viewportHeight;
                        });
                        return visible.map(el => el.textContent.trim()).join(' ');
                    }
                """)
                
                if 'Quality of Life' in visible_text and 'CASP-19' in visible_text:
                    print(f"\n✓ Found Quality of Life section at {scroll_pos}px")
                    
                    # Take screenshots
                    await page.screenshot(path="/home/tenebris/Desktop/BHMApp/casp19_screen1.png", full_page=False)
                    print("   📸 casp19_screen1.png")
                    
                    await page.evaluate("window.scrollBy(0, 300)")
                    await asyncio.sleep(0.5)
                    await page.screenshot(path="/home/tenebris/Desktop/BHMApp/casp19_screen2.png", full_page=False)
                    print("   📸 casp19_screen2.png")
                    
                    await page.evaluate("window.scrollBy(0, 300)")
                    await asyncio.sleep(0.5)
                    await page.screenshot(path="/home/tenebris/Desktop/BHMApp/casp19_screen3.png", full_page=False)
                    print("   📸 casp19_screen3.png")
                    
                    break
            
            await asyncio.sleep(2)
            
        except Exception as e:
            print(f"ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
