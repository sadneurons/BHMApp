#!/usr/bin/env python3
"""
Test RBANS Report Integration
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        # Capture console errors
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg) if msg.type == "error" else None)
        
        try:
            print("=" * 80)
            print("RBANS Report Integration Test")
            print("=" * 80)
            
            # Step 1: Navigate
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"\nStep 1: Navigating to {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(1.5)
            print("   ✓ Page loaded")
            
            # First, ensure RBANS data is calculated
            print("\nStep 2: Ensuring RBANS data is calculated...")
            await page.click("#tab-rbans")
            await asyncio.sleep(1)
            
            # Fill in the data quickly
            await page.fill("#rbans-topf", "50")
            await page.fill("#rbans-age", "65")
            await page.fill("#rbans-years_of_education", "16")
            await page.click("input.rbans-radio[data-key='gender'][value='Male']")
            await page.click("input.rbans-radio[data-key='ethnicity'][value='White']")
            
            # Fill subtests
            subtests = [
                ("listlearning", "25"), ("storylearning", "16"), ("figurecopy", "15"),
                ("lineorientation", "14"), ("naming", "8"), ("semanticfluency", "20"),
                ("digitspan", "10"), ("coding", "40"), ("listrecall", "5"),
                ("listrecog", "17"), ("storyrecall", "8"), ("figurerecall", "12")
            ]
            
            for field_id, value in subtests:
                await page.fill(f"#rbans-{field_id}", value)
                await asyncio.sleep(0.1)
            
            # Calculate
            await page.click("#rbans-calculate-btn")
            await asyncio.sleep(2)
            print("   ✓ RBANS data calculated")
            
            # Step 3: Click Report tab
            print("\nStep 3: Clicking Report tab...")
            await page.click("#tab-report")
            await asyncio.sleep(2)
            print("   ✓ Report tab opened")
            
            # Step 4: Take snapshot of top of report
            print("\nStep 4: Taking snapshot of report top...")
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_report_01_top.png", full_page=False)
            print("   ✓ Screenshot: rbans_report_01_top.png")
            
            # Check for report title
            report_title = await page.query_selector("text=Clinical Report, text=Assessment Report")
            if report_title:
                print("   ✓ Report title found")
            
            # Step 5: Scroll to find RBANS section
            print("\nStep 5: Scrolling to find RBANS section...")
            
            # Try to find the RBANS section
            rbans_section = await page.query_selector("text=Neuropsychological Assessment, text=RBANS")
            
            if rbans_section:
                print("   ✓ RBANS section found in report")
                # Scroll to it
                await rbans_section.scroll_into_view_if_needed()
                await asyncio.sleep(1)
            else:
                print("   ⚠ RBANS section not immediately visible, scrolling through report...")
                # Scroll through the report to find it
                for i in range(10):
                    await page.evaluate(f"window.scrollBy(0, 800)")
                    await asyncio.sleep(0.5)
                    
                    # Check if RBANS section is now visible
                    rbans_section = await page.query_selector("text=Neuropsychological Assessment, text=RBANS")
                    if rbans_section:
                        print(f"   ✓ RBANS section found after scrolling {i+1} times")
                        break
            
            # Take snapshot of RBANS section
            print("\nStep 6: Taking snapshot of RBANS section...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_report_02_rbans_section.png", full_page=False)
            print("   ✓ Screenshot: rbans_report_02_rbans_section.png")
            
            # Step 7: Check for specific RBANS elements in report
            print("\nStep 7: Checking for RBANS elements in report...")
            
            # Check for TOPF/FSIQ
            topf_element = await page.query_selector("text=TOPF, text=FSIQ")
            if topf_element:
                print("   ✓ TOPF/FSIQ found in report")
            else:
                print("   ⚠ TOPF/FSIQ not found")
            
            # Check for Total Scale Score
            total_scale = await page.query_selector("text=Total Scale")
            if total_scale:
                print("   ✓ Total Scale Score found")
            else:
                print("   ⚠ Total Scale Score not found")
            
            # Check for domain table
            immediate_memory = await page.query_selector("text=Immediate Memory")
            if immediate_memory:
                print("   ✓ Domain table (Immediate Memory) found")
            else:
                print("   ⚠ Domain table not found")
            
            # Check for Effort Indices
            effort = await page.query_selector("text=Effort")
            if effort:
                print("   ✓ Effort Indices mentioned")
            else:
                print("   ⚠ Effort Indices not found")
            
            # Check for Cortical-Subcortical
            cortical = await page.query_selector("text=Cortical, text=cortical")
            if cortical:
                print("   ✓ Cortical-Subcortical Index mentioned")
            else:
                print("   ⚠ Cortical-Subcortical Index not found")
            
            # Scroll down more to see full RBANS section
            print("\nStep 8: Scrolling to see full RBANS section...")
            await page.evaluate("window.scrollBy(0, 600)")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_report_03_rbans_lower.png", full_page=False)
            print("   ✓ Screenshot: rbans_report_03_rbans_lower.png")
            
            # Continue scrolling to see more of report
            await page.evaluate("window.scrollBy(0, 600)")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_report_04_after_rbans.png", full_page=False)
            print("   ✓ Screenshot: rbans_report_04_after_rbans.png")
            
            # Take full page screenshot
            print("\nStep 9: Taking full page screenshot of report...")
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_report_05_fullpage.png", full_page=True)
            print("   ✓ Screenshot: rbans_report_05_fullpage.png")
            
            # Check for JavaScript errors
            print("\nStep 10: Checking for JavaScript errors...")
            if console_errors:
                print(f"   ✗ Found {len(console_errors)} console error(s):")
                for error in console_errors[:5]:
                    print(f"      - {error.text}")
            else:
                print("   ✓ No JavaScript errors detected")
            
            print("\n" + "=" * 80)
            print("TEST COMPLETED")
            print("=" * 80)
            print("\n📸 Screenshots saved:")
            print("   - rbans_report_01_top.png (Top of report)")
            print("   - rbans_report_02_rbans_section.png (RBANS section)")
            print("   - rbans_report_03_rbans_lower.png (RBANS section lower)")
            print("   - rbans_report_04_after_rbans.png (After RBANS section)")
            print("   - rbans_report_05_fullpage.png (Full report)")
            
            # Keep browser open
            await asyncio.sleep(5)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_report_error.png", full_page=True)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
