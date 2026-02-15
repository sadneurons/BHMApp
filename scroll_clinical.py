#!/usr/bin/env python3
"""
Manual scroll to find Clinical Interview section
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
            print(f"Loading {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(2)
            
            inject_script = """
            (function() {
              var c = BHM.State.getSession().instruments.clinical;
              Object.assign(c, {
                interviewDate: '2026-02-15', interviewer: 'Dr Smith', clientName: 'Margaret Thompson',
                informantName: 'John Thompson', informantRel: 'Husband',
                memA1: 'yes', memA1_freq: 'daily', memA1_onset: '18 months ago',
                memA2: 'yes', memA2_freq: 'daily', memA2_onset: '18 months ago',
                memoryNotes: 'Frequently asks what day it is.',
                langB1: 'yes', langB1_freq: 'daily',
                langB2: 'yes', langB2_freq: 'weekly',
                languageNotes: 'Circumlocution noted — described keys as "the things you open the door with".',
                visC2_present: 'yes', visC2_stopped: 'yes', visC2_safety: 'yes',
                visuospatialNotes: 'Got lost walking to shops.',
                birthPlace: 'Manchester', livingSituation: 'Lives with husband', siblings: '2',
                headInjury: 'No',
                persSocAnx: 'low', persEmpathy: 'high',
                highestQual: 'GCSE', yearsEdu: 11, peakOccupation: 'Office manager',
                alcUnitsWk: '1-7',
                keyPositives: 'Progressive memory decline. Language difficulties with circumlocution. Wayfinding concerns.',
                safetyConcerns: 'Has stopped driving. Left oven on twice.'
              });
              BHM.Report.update();
              return 'Done';
            })();
            """
            
            print("Injecting clinical interview data...")
            result = await page.evaluate(inject_script)
            print(f"   {result}")
            await asyncio.sleep(1)
            
            # Go to Report
            print("\nNavigating to Report tab...")
            await page.click("#tab-report")
            await asyncio.sleep(2)
            
            # Scroll to top first
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            
            print("\nScrolling through report in 1000px increments...")
            
            for i in range(15):
                scroll_pos = i * 1000
                await page.evaluate(f"window.scrollTo(0, {scroll_pos})")
                await asyncio.sleep(1)
                
                # Get visible headings
                headings = await page.evaluate("""
                    () => {
                        const headings = Array.from(document.querySelectorAll('h3, h4, h5, h6'));
                        const visible = headings.filter(h => {
                            const rect = h.getBoundingClientRect();
                            return rect.top >= 0 && rect.top < window.innerHeight;
                        });
                        return visible.map(h => h.textContent.trim());
                    }
                """)
                
                print(f"\n   Scroll {i}: {scroll_pos}px")
                for h in headings[:3]:
                    print(f"      - {h}")
                
                # Check if Clinical Interview is visible
                if any('Clinical Interview' in h for h in headings):
                    print(f"\n✓✓✓ FOUND Clinical Interview at scroll {i} ({scroll_pos}px)")
                    await page.screenshot(path=f"/home/tenebris/Desktop/BHMApp/clinical_found_scroll{i}.png", full_page=False)
                    print(f"   📸 Screenshot saved: clinical_found_scroll{i}.png")
                    
                    # Take a few more screenshots around this area
                    await page.evaluate(f"window.scrollBy(0, 300)")
                    await asyncio.sleep(0.5)
                    await page.screenshot(path=f"/home/tenebris/Desktop/BHMApp/clinical_detail_1.png", full_page=False)
                    
                    await page.evaluate(f"window.scrollBy(0, 300)")
                    await asyncio.sleep(0.5)
                    await page.screenshot(path=f"/home/tenebris/Desktop/BHMApp/clinical_detail_2.png", full_page=False)
                    
                    await page.evaluate(f"window.scrollBy(0, 300)")
                    await asyncio.sleep(0.5)
                    await page.screenshot(path=f"/home/tenebris/Desktop/BHMApp/clinical_detail_3.png", full_page=False)
                    
                    print("   📸 Detail screenshots saved")
                    break
            
            await asyncio.sleep(2)
            print("\n✅ Test complete")
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
