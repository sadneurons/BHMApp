#!/usr/bin/env python3
"""
Find Clinical Interview section in report
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        try:
            # Load and inject data
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(2)
            
            inject_script = """
            (function() {
              var c = BHM.State.getSession().instruments.clinical;
              Object.assign(c, {
                interviewDate: '2026-02-15', interviewer: 'Dr Smith', clientName: 'Margaret Thompson',
                memA1: 'yes', memA1_freq: 'daily', memA1_onset: '18 months ago',
                memA2: 'yes', memA2_freq: 'daily',
                langB1: 'yes', langB1_freq: 'daily',
                languageNotes: 'Circumlocution noted during interview.',
                visC2_present: 'yes', visC2_stopped: 'yes',
                visuospatialNotes: 'Got lost walking to shops.',
                birthPlace: 'Manchester', livingSituation: 'Lives with husband',
                headInjury: 'No',
                persSocAnx: 'low', persEmpathy: 'high',
                highestQual: 'GCSE', yearsEdu: 11, peakOccupation: 'Office manager',
                alcUnitsWk: '1-7',
                keyPositives: 'Progressive memory decline. Language difficulties. Wayfinding concerns.',
                safetyConcerns: 'Left oven on twice.'
              });
              BHM.Report.update();
              return 'Done';
            })();
            """
            await page.evaluate(inject_script)
            await asyncio.sleep(1)
            
            # Go to Report
            await page.click("#tab-report")
            await asyncio.sleep(2)
            
            # Search for "Clinical Interview" text
            print("Searching for Clinical Interview section...")
            
            # Get all text on the page
            body_text = await page.evaluate("document.body.innerText")
            
            if "Clinical Interview" in body_text:
                print("✓ 'Clinical Interview' text found in report")
                
                # Try to find and scroll to it
                headings = await page.query_selector_all("h3, h4, h5, h6")
                found = False
                for heading in headings:
                    text = await heading.inner_text()
                    if "Clinical Interview" in text:
                        print(f"   Found heading: {text}")
                        await heading.scroll_into_view_if_needed()
                        await asyncio.sleep(1)
                        await page.evaluate("window.scrollBy(0, -150)")
                        await page.screenshot(path="/home/tenebris/Desktop/BHMApp/clinical_section_found.png", full_page=False)
                        print("   📸 Screenshot saved")
                        found = True
                        break
                
                if not found:
                    # Search in paragraphs
                    print("   Not in headings, searching entire body...")
                    # Try to find via text search
                    elem = await page.query_selector("text=/Clinical Interview/i")
                    if elem:
                        await elem.scroll_into_view_if_needed()
                        await asyncio.sleep(1)
                        await page.screenshot(path="/home/tenebris/Desktop/BHMApp/clinical_via_text.png", full_page=False)
                        print("   📸 Found via text search")
            else:
                print("✗ 'Clinical Interview' NOT found in report")
                print("\n   Taking full page screenshot...")
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/full_report.png", full_page=True)
                
                # Print section headings that do exist
                print("\n   Found these section headings:")
                headings = await page.query_selector_all("h3, h4, h5")
                for h in headings[:15]:
                    text = await h.inner_text()
                    if text.strip():
                        print(f"      - {text.strip()}")
            
            await asyncio.sleep(3)
            
        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
