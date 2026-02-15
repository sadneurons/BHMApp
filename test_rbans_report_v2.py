#!/usr/bin/env python3
"""
Test RBANS Report Integration - Focused on RBANS section
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
            print("RBANS Report Section - Detailed Test")
            print("=" * 80)
            
            # Navigate and setup RBANS data
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"\nNavigating to {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(1.5)
            
            # Fill RBANS data
            print("\nFilling RBANS data...")
            await page.click("#tab-rbans")
            await asyncio.sleep(1)
            
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
            print("   ✓ RBANS data calculated")
            
            # Go to Report tab
            print("\nOpening Report tab...")
            await page.click("#tab-report")
            await asyncio.sleep(2)
            
            # Search for RBANS section heading
            print("\nSearching for RBANS section...")
            
            # Try to find the exact heading
            rbans_heading = await page.query_selector("h4:has-text('Neuropsychological Assessment')")
            
            if rbans_heading:
                print("   ✓ Found RBANS section heading (h4)")
                # Scroll to it
                await rbans_heading.scroll_into_view_if_needed()
                await asyncio.sleep(1)
                
                # Scroll up a bit to show the heading
                await page.evaluate("window.scrollBy(0, -100)")
                await asyncio.sleep(0.5)
            else:
                # Try h6 for compact mode
                rbans_heading = await page.query_selector("h6:has-text('Neuropsychological Assessment')")
                if rbans_heading:
                    print("   ✓ Found RBANS section heading (h6 - compact mode)")
                    await rbans_heading.scroll_into_view_if_needed()
                    await asyncio.sleep(1)
                    await page.evaluate("window.scrollBy(0, -100)")
                    await asyncio.sleep(0.5)
            
            # Take screenshot showing the heading
            print("\nTaking screenshot of RBANS section with heading...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_report_heading.png", full_page=False)
            print("   ✓ Screenshot: rbans_report_heading.png")
            
            # Check for specific elements
            print("\nChecking RBANS report elements:")
            
            # Check for section title
            section_title = await page.query_selector("text=Neuropsychological Assessment")
            if section_title:
                title_text = await section_title.inner_text()
                print(f"   ✓ Section title: {title_text}")
            
            # Check for TOPF/FSIQ
            topf = await page.query_selector("text=Premorbid Functioning")
            if topf:
                print("   ✓ TOPF/Premorbid Functioning found")
                # Get the full text
                parent = await topf.evaluate_handle("el => el.closest('p')")
                topf_text = await parent.inner_text()
                print(f"      Text: {topf_text}")
            
            # Check for Total Scale Score
            total = await page.query_selector("text=Total Scale Score")
            if total:
                print("   ✓ Total Scale Score found")
                parent = await total.evaluate_handle("el => el.closest('p')")
                total_text = await parent.inner_text()
                print(f"      Text: {total_text}")
            
            # Check for Domain Index Scores table
            domain_table = await page.query_selector("text=Domain Index Scores")
            if domain_table:
                print("   ✓ Domain Index Scores table found")
            
            # Check for Effort
            effort = await page.query_selector("text=Effort")
            if effort:
                print("   ✓ Effort indices found")
                parent = await effort.evaluate_handle("el => el.closest('p')")
                effort_text = await parent.inner_text()
                print(f"      Text: {effort_text}")
            
            # Check for Cortical-Subcortical Index
            cortical = await page.query_selector("text=Cortical–Subcortical Index, text=Cortical-Subcortical Index")
            if cortical:
                print("   ✓ Cortical-Subcortical Index found")
                parent = await cortical.evaluate_handle("el => el.closest('p')")
                cortical_text = await parent.inner_text()
                print(f"      Text: {cortical_text}")
            
            # Scroll down to see full section
            print("\nScrolling through RBANS section...")
            await page.evaluate("window.scrollBy(0, 400)")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_report_full.png", full_page=False)
            print("   ✓ Screenshot: rbans_report_full.png")
            
            print("\n" + "=" * 80)
            print("RBANS REPORT SECTION TEST COMPLETED")
            print("=" * 80)
            
            await asyncio.sleep(5)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
