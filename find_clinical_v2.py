#!/usr/bin/env python3
"""
Continue scrolling to find Clinical Interview section
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
            print(f"Loading {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(2)
            
            # Inject clinical interview data
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
            
            print("Injecting data...")
            await page.evaluate(inject_script)
            await asyncio.sleep(1)
            
            print("\nNavigating to Report tab...")
            await page.click("#tab-report")
            await asyncio.sleep(2)
            
            # Scroll to find Clinical Interview - start from 2000px
            print("\nScrolling to find Clinical Interview section...")
            
            for i in range(2, 25):  # Start from scroll 2 (2000px)
                scroll_pos = i * 1000
                await page.evaluate(f"window.scrollTo(0, {scroll_pos})")
                await asyncio.sleep(0.7)
                
                # Get visible text
                visible_text = await page.evaluate("""
                    () => {
                        const headings = Array.from(document.querySelectorAll('h3, h4, h5, h6'));
                        const visible = headings.filter(h => {
                            const rect = h.getBoundingClientRect();
                            return rect.top >= 0 && rect.top < window.innerHeight;
                        });
                        return visible.map(h => h.textContent.trim());
                    }
                """)
                
                print(f"   Scroll {i} ({scroll_pos}px): {visible_text[:2] if visible_text else 'None'}")
                
                # Check for Clinical Interview
                if any('Clinical Interview' in h for h in visible_text):
                    print(f"\n✓✓✓ FOUND Clinical Interview at scroll position {scroll_pos}px")
                    await page.screenshot(path=f"/home/tenebris/Desktop/BHMApp/clinical_header.png", full_page=False)
                    print(f"   📸 clinical_header.png")
                    
                    # Take progressive screenshots
                    for j in range(1, 6):
                        await page.evaluate(f"window.scrollBy(0, 400)")
                        await asyncio.sleep(0.5)
                        await page.screenshot(path=f"/home/tenebris/Desktop/BHMApp/clinical_content_{j}.png", full_page=False)
                        print(f"   📸 clinical_content_{j}.png")
                    
                    break
            
            await asyncio.sleep(2)
            print("\n✅ Done")
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
