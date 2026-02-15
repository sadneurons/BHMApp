#!/usr/bin/env python3
"""
Simple Report Charts Check - Skip MBI-C/NPI-Q filling
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
            print("BHM REPORT CHARTS CHECK (Simplified)")
            print("=" * 80)
            
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(1.5)
            
            # Ensure RBANS is calculated
            await page.click("#tab-rbans")
            await asyncio.sleep(1)
            
            # Check if already filled, if not fill it
            topf_val = await page.input_value("#rbans-topf")
            if not topf_val:
                print("\nFilling RBANS data...")
                await page.fill("#rbans-topf", "50")
                await page.fill("#rbans-age", "65")
                await page.fill("#rbans-years_of_education", "16")
                await page.click("input.rbans-radio[data-key='gender'][value='Male']")
                await page.click("input.rbans-radio[data-key='ethnicity'][value='White']")
                
                subtests = [
                    ("listlearning", "25"), ("storylearning", "16"), ("figurecopy", "15"),
                    ("lineorientation", "14"), ("naming", "8"), ("semanticfluency", "20"),
                    ("digitspan", "10"), ("coding", "40"), ("listrecall", "5"),
                    ("listrecog", "17"), ("storyrecall", "8"), ("figurerecall", "12")
                ]
                
                for field_id, value in subtests:
                    await page.fill(f"#rbans-{field_id}", value)
                    await asyncio.sleep(0.05)
                
                await page.click("#rbans-calculate-btn")
                await asyncio.sleep(2)
                print("✓ RBANS calculated")
            else:
                print("\n✓ RBANS already filled")
            
            # Go to Report
            print("\nOpening Report tab...")
            await page.click("#tab-report")
            await asyncio.sleep(2)
            
            # Top of report
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/report_simple_01_top.png", full_page=False)
            print("📸 report_simple_01_top.png")
            
            # Check for various charts
            print("\nChecking for charts...")
            
            # PSQI bar chart
            psqi_canvas = await page.query_selector("canvas")
            all_canvases = await page.query_selector_all("canvas")
            print(f"\nTotal canvas elements found: {len(all_canvases)}")
            
            # Scroll through report and screenshot sections
            print("\nScrolling through report...")
            
            for i in range(8):
                await page.evaluate(f"window.scrollBy(0, 800)")
                await asyncio.sleep(0.8)
                await page.screenshot(path=f"/home/tenebris/Desktop/BHMApp/report_simple_scroll_{i+2:02d}.png", full_page=False)
                print(f"📸 report_simple_scroll_{i+2:02d}.png")
            
            # Full page
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/report_simple_fullpage.png", full_page=True)
            print("📸 report_simple_fullpage.png")
            
            print("\n✅ Test completed")
            await asyncio.sleep(3)
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
