#!/usr/bin/env python3
"""
Test MBI-C and NPI-Q Radar Charts with Injected Data
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
            print("MBI-C & NPI-Q RADAR CHARTS TEST")
            print("=" * 80)
            
            # Step 1: Navigate
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"\nStep 1: Navigating to {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(2)
            print("   ✓ Page loaded")
            
            # Step 2: Inject test data via console
            print("\nStep 2: Injecting MBI-C and NPI-Q test data via console...")
            
            inject_script = """
            (function() {
              // Inject MBI-C test data - set some responses across domains
              var mbicKeys = ['imd1','imd2','imd3','ma1','ma2','ma3','dg1','dg2','dg3','sn1','sn2','sb1','sb2'];
              var mbicVals = [2, 1, 3, 2, 1, 2, 3, 1, 0, 2, 1, 1, 2];
              for (var i = 0; i < mbicKeys.length; i++) {
                BHM.State.set('instruments.mbiC.' + mbicKeys[i], mbicVals[i]);
              }
              BHM.Scoring.mbiC();

              // Inject NPI-Q test data - 6 symptoms present with severity and distress
              var npiqSymptoms = ['delusions','hallucinations','agitation','depression','anxiety','apathy'];
              var npiqSev = [2, 1, 3, 2, 1, 2];
              var npiqDist = [3, 2, 4, 3, 1, 2];
              for (var j = 0; j < npiqSymptoms.length; j++) {
                BHM.State.set('instruments.npiQ.' + npiqSymptoms[j] + '_present', 'yes');
                BHM.State.set('instruments.npiQ.' + npiqSymptoms[j] + '_severity', npiqSev[j]);
                BHM.State.set('instruments.npiQ.' + npiqSymptoms[j] + '_distress', npiqDist[j]);
              }
              BHM.Scoring.npiQ();
              console.log('Test data injected successfully');
              return 'Data injection complete';
            })();
            """
            
            result = await page.evaluate(inject_script)
            print(f"   ✓ Console execution result: {result}")
            
            # Wait for any async operations
            await asyncio.sleep(1)
            
            # Check console messages
            print("\n   Console messages:")
            for msg in console_messages:
                print(f"      - {msg}")
            
            if console_errors:
                print("\n   ⚠ Console errors:")
                for err in console_errors:
                    print(f"      - {err}")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/radar_test_01_after_injection.png", full_page=False)
            print("\n   📸 Screenshot: radar_test_01_after_injection.png")
            
            # Step 3: Navigate to Report tab
            print("\nStep 3: Opening Report tab...")
            await page.click("#tab-report")
            await asyncio.sleep(2)
            print("   ✓ Report tab opened")
            
            # Top of report
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/radar_test_02_report_top.png", full_page=False)
            print("   📸 Screenshot: radar_test_02_report_top.png")
            
            # Step 4: Scroll to "Changes Noticed by Family or Friends" section
            print("\nStep 4: Scrolling to 'Changes Noticed by Family or Friends' section...")
            
            changes_section = await page.query_selector("text=Changes Noticed")
            if changes_section:
                await changes_section.scroll_into_view_if_needed()
                await asyncio.sleep(1)
                await page.evaluate("window.scrollBy(0, -100)")
                await asyncio.sleep(0.5)
                print("   ✓ Found Changes section")
            else:
                # Manual scroll
                print("   ⚠ Section heading not found, scrolling manually...")
                for i in range(5):
                    await page.evaluate("window.scrollBy(0, 800)")
                    await asyncio.sleep(0.5)
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/radar_test_03_changes_section.png", full_page=False)
            print("   📸 Screenshot: radar_test_03_changes_section.png")
            
            # Step 5: Check for radar charts
            print("\nStep 5: Checking for radar charts...")
            
            # Count all canvas elements
            all_canvases = await page.query_selector_all("canvas")
            print(f"\n   Total canvas elements on page: {len(all_canvases)}")
            
            # Check for MBI-C radar
            mbic_canvas = await page.query_selector("#chart-mbic")
            if mbic_canvas:
                print("   ✅ MBI-C RADAR chart canvas FOUND (id='chart-mbic')")
                # Get canvas dimensions
                mbic_box = await mbic_canvas.bounding_box()
                if mbic_box:
                    print(f"      Size: {mbic_box['width']}x{mbic_box['height']}px")
            else:
                print("   ❌ MBI-C RADAR chart canvas NOT FOUND")
            
            # Check for NPI-Q radar
            npiq_canvas = await page.query_selector("#chart-npiq")
            if npiq_canvas:
                print("   ✅ NPI-Q RADAR chart canvas FOUND (id='chart-npiq')")
                # Get canvas dimensions
                npiq_box = await npiq_canvas.bounding_box()
                if npiq_box:
                    print(f"      Size: {npiq_box['width']}x{npiq_box['height']}px")
            else:
                print("   ❌ NPI-Q RADAR chart canvas NOT FOUND")
            
            # Scroll down a bit to see both charts if they're large
            print("\nScrolling to see full charts...")
            await page.evaluate("window.scrollBy(0, 400)")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/radar_test_04_charts_lower.png", full_page=False)
            print("   📸 Screenshot: radar_test_04_charts_lower.png")
            
            # Continue scrolling
            await page.evaluate("window.scrollBy(0, 400)")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/radar_test_05_after_charts.png", full_page=False)
            print("   📸 Screenshot: radar_test_05_after_charts.png")
            
            # Step 6: Detailed analysis
            print("\n" + "=" * 80)
            print("DETAILED ANALYSIS")
            print("=" * 80)
            
            # Check for MBI-C domain labels
            print("\nChecking MBI-C radar content...")
            mbic_labels = [
                "Motivation", "Mood", "Impulse", "Social", "Beliefs"
            ]
            for label in mbic_labels:
                found = await page.query_selector(f"text={label}")
                if found:
                    print(f"   ✓ MBI-C domain label '{label}' found")
                else:
                    print(f"   ⚠ MBI-C domain label '{label}' NOT found")
            
            # Check for NPI-Q symptom labels
            print("\nChecking NPI-Q radar content...")
            npiq_labels = [
                "Delusions", "Hallucinations", "Agitation", "Depression", "Anxiety"
            ]
            for label in npiq_labels:
                found = await page.query_selector(f"text={label}")
                if found:
                    print(f"   ✓ NPI-Q symptom '{label}' found")
                else:
                    print(f"   ⚠ NPI-Q symptom '{label}' NOT found")
            
            # Take full page screenshot
            print("\nTaking full page screenshot...")
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/radar_test_06_fullpage.png", full_page=True)
            print("   📸 Screenshot: radar_test_06_fullpage.png")
            
            # Final error check
            print("\n" + "=" * 80)
            print("ERROR CHECK")
            print("=" * 80)
            if console_errors:
                print(f"   ⚠ Found {len(console_errors)} console error(s):")
                for err in console_errors[:10]:
                    print(f"      - {err}")
            else:
                print("   ✅ No JavaScript errors detected")
            
            print("\n" + "=" * 80)
            print("TEST COMPLETED")
            print("=" * 80)
            
            await asyncio.sleep(5)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/radar_test_error.png", full_page=True)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
