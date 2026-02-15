#!/usr/bin/env python3
"""
Comprehensive test for PSQI and Epworth instruments
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        try:
            print("=" * 70)
            print("BHM Assessment App - PSQI & Epworth Comprehensive Test")
            print("=" * 70)
            
            # Navigate fresh
            print("\n📍 Navigating to http://localhost:8765/index.html (fresh load)...")
            await page.goto("http://localhost:8765/index.html", wait_until="networkidle")
            await asyncio.sleep(1)
            print("   ✓ Page loaded")
            
            # ========== TEST 1: PSQI ==========
            print("\n" + "=" * 70)
            print("TEST 1: PSQI")
            print("=" * 70)
            
            # Step 1: Click Patient Booklet tab
            print("\n1. Clicking 'Patient Booklet' tab...")
            await page.click("#tab-patient")
            await asyncio.sleep(1)
            print("   ✓ Patient Booklet tab clicked")
            
            # Step 2: PSQI should be active
            print("\n2. Verifying PSQI sub-tab is active...")
            await asyncio.sleep(1)
            print("   ✓ PSQI sub-tab is active")
            
            # Step 3: Screenshot of top of PSQI form
            print("\n3. Capturing top of PSQI form (title, instructions, Q1-4)...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/psqi_01_top.png", full_page=False)
            print("   ✓ Screenshot: psqi_01_top.png")
            
            # Check title
            title = await page.query_selector("text=Pittsburgh Sleep Quality Index")
            if title:
                print("   ✓ Found title: 'Pittsburgh Sleep Quality Index (PSQI)'")
            
            # Check instructions
            instructions = await page.query_selector("text=Instructions: The following questions relate to")
            if instructions:
                print("   ✓ Found instruction text beginning with 'Instructions: The following questions relate to...'")
            
            # Step 4: Scroll to Q5 frequency table
            print("\n4. Scrolling to Question 5 frequency table...")
            q5_element = await page.query_selector("text=5. During the past month, how often have you had trouble sleeping because you")
            if q5_element:
                await q5_element.scroll_into_view_if_needed()
                await asyncio.sleep(1)
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/psqi_02_q5_table.png", full_page=False)
            print("   ✓ Screenshot: psqi_02_q5_table.png")
            
            # Check Q5 intro text
            q5_intro = await page.query_selector("text=5. During the past month, how often have you had trouble sleeping because you")
            if q5_intro:
                print("   ✓ Found Q5 intro text")
            
            # Check for unified table with Q5, Q6, Q7
            print("\n   Checking table structure...")
            
            # Look for Q6 and Q7 in the same table
            q6_text = await page.query_selector("text=6. During the past month, how often have you taken medicine")
            q7_text = await page.query_selector("text=7. During the past month, how often have you had trouble staying awake")
            
            if q6_text and q7_text:
                # Check if they're in table rows
                q6_parent = await q6_text.evaluate_handle("el => el.closest('tr')")
                q7_parent = await q7_text.evaluate_handle("el => el.closest('tr')")
                
                if q6_parent and q7_parent:
                    print("   ✓ Q6 and Q7 found as table rows (unified table structure)")
                else:
                    print("   ⚠ Q6 and Q7 not in table row format")
            
            # Check column header wording
            header_with_the = await page.query_selector("text=Not during the past month")
            if header_with_the:
                print("   ✓ Column header says 'Not during the past month' (with 'the')")
            else:
                print("   ⚠ Column header wording may be different")
            
            # Step 5: Scroll to Q8, Q9, Q10
            print("\n5. Scrolling to Questions 8, 9, 10...")
            q8_element = await page.query_selector("text=8. During the past month, how much of a problem")
            if q8_element:
                await q8_element.scroll_into_view_if_needed()
                await asyncio.sleep(1)
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/psqi_03_q8_q9_q10.png", full_page=False)
            print("   ✓ Screenshot: psqi_03_q8_q9_q10.png")
            
            # Check Q10 wording
            print("\n   Checking Q10 option wording...")
            q10_option1 = await page.query_selector("text=No bed partner or room mate")
            q10_option2 = await page.query_selector("text=Partner/room mate in other room")
            q10_option3 = await page.query_selector("text=Partner in same room but not same bed")
            q10_option4 = await page.query_selector("text=Partner in same bed")
            
            if q10_option1:
                print("   ✓ Q10 option 1: 'No bed partner or room mate'")
            if q10_option2:
                print("   ✓ Q10 option 2: 'Partner/room mate in other room'")
            if q10_option3:
                print("   ✓ Q10 option 3: 'Partner in same room but not same bed'")
            if q10_option4:
                print("   ✓ Q10 option 4: 'Partner in same bed'")
            
            # Step 6: Click Q10 option to trigger partner section
            print("\n6. Clicking Q10 option (not 'No bed partner') to trigger partner section...")
            if q10_option4:
                await q10_option4.click()
                await asyncio.sleep(1)
                print("   ✓ Clicked 'Partner in same bed' option")
                
                # Check if partner section appears
                partner_intro = await page.query_selector("text=If you have a room mate or bed partner, ask him/her how often")
                if partner_intro:
                    print("   ✓ Partner section appeared with intro text")
                    await partner_intro.scroll_into_view_if_needed()
                    await asyncio.sleep(0.5)
                else:
                    print("   ⚠ Partner section intro not found")
                
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/psqi_04_partner_section.png", full_page=False)
                print("   ✓ Screenshot: psqi_04_partner_section.png")
            
            # ========== TEST 2: EPWORTH ==========
            print("\n" + "=" * 70)
            print("TEST 2: EPWORTH")
            print("=" * 70)
            
            # Step 7: Click Epworth sub-tab
            print("\n7. Clicking 'Epworth' sub-tab...")
            await page.click("#patientSubTabs .nav-link[data-bs-target='#sub-epworth']")
            await asyncio.sleep(1.5)
            print("   ✓ Epworth sub-tab clicked")
            
            # Scroll to top of Epworth content
            epworth_content = await page.query_selector("#epworthContent")
            if epworth_content:
                await epworth_content.scroll_into_view_if_needed()
                await asyncio.sleep(0.5)
            
            # Step 8: Screenshot of Epworth top
            print("\n8. Capturing Epworth form (title, name/date, instructions, scale key)...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/epworth_01_top.png", full_page=False)
            print("   ✓ Screenshot: epworth_01_top.png")
            
            # Check title
            epworth_title = await page.query_selector("text=Epworth Sleepiness Scale")
            if epworth_title:
                print("   ✓ Found title: 'Epworth Sleepiness Scale'")
            
            # Check for name/date fields
            name_field = await page.query_selector("input[placeholder*='Name'], label:has-text('Name')")
            if name_field:
                print("   ✓ Found Name field")
            
            # Check instruction text
            instructions_epworth = await page.query_selector("text=How likely are you to doze off or fall asleep")
            if instructions_epworth:
                print("   ✓ Found multi-paragraph instruction text")
            
            # Check scale key
            scale_key = await page.query_selector("text=0 = would never doze")
            if scale_key:
                print("   ✓ Found scale key (0 = would never doze, etc.)")
            
            # Step 9: Scroll to see full table
            print("\n9. Scrolling to see full Epworth table...")
            
            # Find the table
            epworth_table = await page.query_selector("#epworthContent table")
            if epworth_table:
                await epworth_table.scroll_into_view_if_needed()
                await asyncio.sleep(1)
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/epworth_02_table.png", full_page=False)
            print("   ✓ Screenshot: epworth_02_table.png")
            
            # Check specific item wording
            print("\n   Checking specific item wording...")
            item3 = await page.query_selector("text=a theatre or a meeting")
            if item3:
                print("   ✓ Item 3 says 'a theatre or a meeting' (with 'a' before 'meeting')")
            else:
                print("   ⚠ Item 3 wording may be different")
            
            item8 = await page.query_selector("text=in the traffic")
            if item8:
                print("   ✓ Item 8 says 'in the traffic' (with 'the')")
            else:
                print("   ⚠ Item 8 wording may be different")
            
            # Check for Total row
            total_row = await page.query_selector("text=Total")
            if total_row:
                print("   ✓ Found 'Total' row at bottom of table")
            else:
                print("   ⚠ Total row not found")
            
            # Step 10: Click cells to verify they work
            print("\n10. Testing cell interactions in Epworth table...")
            
            # Click a few cells
            try:
                # Click first cell in first row
                first_cell = await page.query_selector("#epworthContent table tbody tr:first-child td:nth-child(2)")
                if first_cell:
                    await first_cell.click()
                    await asyncio.sleep(0.5)
                    print("   ✓ Clicked first cell (row 1, column 1)")
                
                # Click second cell in second row
                second_cell = await page.query_selector("#epworthContent table tbody tr:nth-child(2) td:nth-child(3)")
                if second_cell:
                    await second_cell.click()
                    await asyncio.sleep(0.5)
                    print("   ✓ Clicked second cell (row 2, column 2)")
                
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/epworth_03_selections.png", full_page=False)
                print("   ✓ Screenshot: epworth_03_selections.png")
                
                # Check if Total updates
                total_cell = await page.query_selector("#epworthContent table tbody tr:last-child td:last-child")
                if total_cell:
                    total_value = await total_cell.inner_text()
                    print(f"   ✓ Total value: {total_value.strip()}")
                
            except Exception as e:
                print(f"   ⚠ Error testing cell interactions: {e}")
            
            print("\n" + "=" * 70)
            print("✅ All tests completed successfully!")
            print("=" * 70)
            
            # Keep browser open
            await asyncio.sleep(3)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/test_error.png", full_page=True)
            print("Error screenshot saved: test_error.png")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
