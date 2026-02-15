#!/usr/bin/env python3
"""
Test RBANS Calculator Tab
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
            print("RBANS Calculator Test")
            print("=" * 80)
            
            # Step 1: Navigate
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"\nStep 1: Navigating to {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(1.5)
            print("   ✓ Page loaded")
            
            # Step 2: Take initial snapshot
            print("\nStep 2: Taking snapshot of initial page...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_01_initial.png", full_page=False)
            print("   ✓ Screenshot: rbans_01_initial.png")
            
            # Check for RBANS tab
            rbans_tab = await page.query_selector("#tab-rbans, button:has-text('RBANS')")
            if rbans_tab:
                print("   ✓ RBANS tab found in navigation")
            else:
                print("   ⚠ RBANS tab not found, checking all tabs...")
                all_tabs = await page.query_selector_all(".navbar-nav .nav-link")
                for tab in all_tabs:
                    text = await tab.inner_text()
                    print(f"      Tab: {text}")
            
            # Step 3: Click RBANS tab
            print("\nStep 3: Clicking RBANS tab...")
            await page.click("#tab-rbans")
            await asyncio.sleep(1.5)
            print("   ✓ RBANS tab clicked")
            
            # Step 4: Take snapshot of RBANS form
            print("\nStep 4: Taking snapshot of RBANS form...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_02_form.png", full_page=False)
            print("   ✓ Screenshot: rbans_02_form.png")
            
            # Check form elements
            print("\n   Checking form elements...")
            
            # Check title
            title = await page.query_selector("text=RBANS")
            if title:
                print("   ✓ RBANS title found")
            
            # Check calculator icon
            calc_icon = await page.query_selector(".bi-calculator, i.bi-calculator")
            if calc_icon:
                print("   ✓ Calculator icon found")
            
            # Step 5: Fill in demographics
            print("\nStep 5: Filling in demographics...")
            
            # TOPF
            print("   - Setting TOPF to 50...")
            await page.fill("input[name='topf'], #rbans-topf", "50")
            await asyncio.sleep(0.3)
            print("     ✓ TOPF = 50")
            
            # Age
            print("   - Setting Age to 65...")
            await page.fill("input[name='age'], #rbans-age", "65")
            await asyncio.sleep(0.3)
            print("     ✓ Age = 65")
            
            # Years of Education
            print("   - Setting Years of Education to 16...")
            await page.fill("input[name='education'], #rbans-education", "16")
            await asyncio.sleep(0.3)
            print("     ✓ Education = 16")
            
            # Gender: Male
            print("   - Selecting Gender: Male...")
            male_radio = await page.query_selector("input[type='radio'][value='male'], input[type='radio'][value='Male']")
            if male_radio:
                await male_radio.click()
                await asyncio.sleep(0.3)
                print("     ✓ Gender = Male")
            else:
                print("     ⚠ Male radio button not found")
            
            # Ethnicity: White
            print("   - Selecting Ethnicity: White...")
            white_radio = await page.query_selector("input[type='radio'][value='white'], input[type='radio'][value='White']")
            if white_radio:
                await white_radio.click()
                await asyncio.sleep(0.3)
                print("     ✓ Ethnicity = White")
            else:
                print("     ⚠ White radio button not found")
            
            # Step 6: Fill in subtest raw scores
            print("\nStep 6: Filling in subtest raw scores...")
            
            subtests = [
                ("listLearning", "25", "List Learning"),
                ("storyLearning", "16", "Story Learning"),
                ("figureCopy", "15", "Figure Copy"),
                ("lineOrientation", "14", "Line Orientation"),
                ("pictureNaming", "8", "Picture Naming"),
                ("semanticFluency", "20", "Semantic Fluency"),
                ("digitSpan", "10", "Digit Span"),
                ("coding", "40", "Coding"),
                ("listRecall", "5", "List Recall"),
                ("listRecognition", "17", "List Recognition"),
                ("storyRecall", "8", "Story Recall"),
                ("figureRecall", "12", "Figure Recall")
            ]
            
            for field_name, value, label in subtests:
                print(f"   - Setting {label} to {value}...")
                # Try multiple selector patterns
                selector = f"input[name='{field_name}'], #rbans-{field_name}, input[id*='{field_name}']"
                try:
                    await page.fill(selector, value)
                    await asyncio.sleep(0.2)
                    print(f"     ✓ {label} = {value}")
                except Exception as e:
                    print(f"     ⚠ Could not fill {label}: {e}")
            
            # Take snapshot after filling
            print("\n   Taking snapshot after filling form...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_03_filled.png", full_page=False)
            print("   ✓ Screenshot: rbans_03_filled.png")
            
            # Step 7: Click Calculate All Scores
            print("\nStep 7: Clicking 'Calculate All Scores' button...")
            calc_button = await page.query_selector("button:has-text('Calculate'), button:has-text('Calculate All Scores')")
            if calc_button:
                await calc_button.click()
                await asyncio.sleep(2)
                print("   ✓ Calculate button clicked")
            else:
                print("   ⚠ Calculate button not found")
            
            # Step 8: Take snapshot of results
            print("\nStep 8: Taking snapshot of results...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_04_results.png", full_page=False)
            print("   ✓ Screenshot: rbans_04_results.png")
            
            # Check for results elements
            print("\n   Checking results elements...")
            
            # Index Scores table
            index_table = await page.query_selector("text=Index Scores, table:has-text('Index')")
            if index_table:
                print("   ✓ Index Scores table found")
            else:
                print("   ⚠ Index Scores table not found")
            
            # Chart
            chart = await page.query_selector("canvas, .chart-container")
            if chart:
                print("   ✓ Chart found")
            else:
                print("   ⚠ Chart not found")
            
            # Step 9: Scroll down to see full results
            print("\nStep 9: Scrolling to see full results...")
            
            # Scroll to middle
            await page.evaluate("window.scrollBy(0, 800)")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_05_middle.png", full_page=False)
            print("   ✓ Screenshot: rbans_05_middle.png")
            
            # Check for Duff Norms
            duff_norms = await page.query_selector("text=Duff Norms, text=Duff")
            if duff_norms:
                print("   ✓ Duff Norms section found")
            else:
                print("   ⚠ Duff Norms not found")
            
            # Check for Effort Indices
            effort = await page.query_selector("text=Effort Indices, text=Effort")
            if effort:
                print("   ✓ Effort Indices section found")
            else:
                print("   ⚠ Effort Indices not found")
            
            # Check for Cortical-Subcortical Index
            csi = await page.query_selector("text=Cortical-Subcortical, text=Cortical")
            if csi:
                print("   ✓ Cortical-Subcortical Index found")
            else:
                print("   ⚠ Cortical-Subcortical Index not found")
            
            # Scroll to bottom
            await page.evaluate("window.scrollBy(0, 1000)")
            await asyncio.sleep(1)
            
            # Step 10: Take final snapshot at bottom
            print("\nStep 10: Taking final snapshot at bottom...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_06_bottom.png", full_page=False)
            print("   ✓ Screenshot: rbans_06_bottom.png")
            
            # Check for Domain Narratives
            narratives = await page.query_selector("text=Domain Narratives, text=Narratives")
            if narratives:
                print("   ✓ Domain Narratives section found")
            else:
                print("   ⚠ Domain Narratives not found")
            
            # Check for References
            references = await page.query_selector("text=References, text=Reference")
            if references:
                print("   ✓ References section found")
            else:
                print("   ⚠ References not found")
            
            # Step 11: Check for JavaScript errors
            print("\nStep 11: Checking for JavaScript errors...")
            if console_errors:
                print(f"   ✗ Found {len(console_errors)} console error(s):")
                for error in console_errors[:5]:
                    print(f"      - {error.text}")
            else:
                print("   ✓ No JavaScript errors detected")
            
            # Scroll back to top to see full results
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(1)
            
            # Take full page screenshot
            print("\nTaking full page screenshot...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_07_fullpage.png", full_page=True)
            print("   ✓ Screenshot: rbans_07_fullpage.png")
            
            print("\n" + "=" * 80)
            print("TEST COMPLETED")
            print("=" * 80)
            print("\n📸 Screenshots saved:")
            print("   - rbans_01_initial.png (Initial page)")
            print("   - rbans_02_form.png (RBANS form)")
            print("   - rbans_03_filled.png (Form filled with data)")
            print("   - rbans_04_results.png (Results after calculation)")
            print("   - rbans_05_middle.png (Middle section - Duff/Effort/CSI)")
            print("   - rbans_06_bottom.png (Bottom section - Narratives/References)")
            print("   - rbans_07_fullpage.png (Full page view)")
            
            # Keep browser open
            await asyncio.sleep(5)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/rbans_error.png", full_page=True)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
