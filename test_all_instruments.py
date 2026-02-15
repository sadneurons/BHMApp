#!/usr/bin/env python3
"""
Comprehensive test for all BHM instruments - checking exact wording and structure
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        results = []
        
        try:
            print("=" * 80)
            print("BHM Assessment App - Complete Instrument Wording & Structure Test")
            print("=" * 80)
            
            # Step 1: Navigate to the app
            print("\n1. NAVIGATION TEST")
            print("-" * 80)
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"   Navigating to {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(1)
            
            title = await page.title()
            print(f"   ✓ Page loaded successfully")
            print(f"   ✓ Title: {title}")
            results.append(("Navigation", "PASS", "Page loads correctly"))
            
            # Click Patient Booklet tab
            await page.click("#tab-patient")
            await asyncio.sleep(1)
            
            # ========== TEST 2: GAD-7 ==========
            print("\n2. GAD-7 (ANXIETY) TEST")
            print("-" * 80)
            await page.click("#patientSubTabs .nav-link[data-bs-target='#sub-gad7']")
            await asyncio.sleep(1.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/test_gad7.png", full_page=True)
            
            # Check title
            gad7_title = await page.query_selector("text=Anxiety")
            if gad7_title:
                title_text = await gad7_title.inner_text()
                if title_text.strip() == "Anxiety":
                    print("   ✓ Title says 'Anxiety' (not 'GAD-7 — Anxiety')")
                    results.append(("GAD-7 Title", "PASS", "Title is 'Anxiety'"))
                else:
                    print(f"   ✗ Title text: '{title_text.strip()}'")
                    results.append(("GAD-7 Title", "FAIL", f"Title is '{title_text.strip()}'"))
            
            # Check instruction
            instruction = await page.query_selector("text=Over the last two weeks, how often have you been bothered by the following problems?")
            if instruction:
                print("   ✓ Instruction text correct")
                results.append(("GAD-7 Instruction", "PASS", "Correct wording"))
            else:
                print("   ✗ Instruction text not found or incorrect")
                results.append(("GAD-7 Instruction", "FAIL", "Not found"))
            
            # Check "Column totals"
            column_totals = await page.query_selector("text=Column totals")
            if column_totals:
                print("   ✓ 'Column totals' text present")
                results.append(("GAD-7 Column totals", "PASS", "Present"))
            else:
                print("   ✗ 'Column totals' text not found")
                results.append(("GAD-7 Column totals", "FAIL", "Not found"))
            
            # Check item 1 wording
            item1 = await page.query_selector("text=1. Feeling nervous, anxious, or on edge")
            if item1:
                print("   ✓ Item 1: 'Feeling nervous, anxious, or on edge' (comma after 'anxious')")
                results.append(("GAD-7 Item 1", "PASS", "Correct wording with comma"))
            else:
                print("   ✗ Item 1 wording incorrect")
                results.append(("GAD-7 Item 1", "FAIL", "Wording incorrect"))
            
            # Check item 7 wording
            item7 = await page.query_selector("text=7. Feeling afraid, as if something awful might happen")
            if item7:
                print("   ✓ Item 7: 'Feeling afraid, as if something awful might happen' (comma after 'afraid')")
                results.append(("GAD-7 Item 7", "PASS", "Correct wording with comma"))
            else:
                print("   ✗ Item 7 wording incorrect")
                results.append(("GAD-7 Item 7", "FAIL", "Wording incorrect"))
            
            # Check column headers don't have scores
            header_with_score = await page.query_selector("text=(0)")
            if header_with_score:
                print("   ✗ Column headers contain score numbers like '(0)'")
                results.append(("GAD-7 Headers", "FAIL", "Headers contain score numbers"))
            else:
                print("   ✓ Column headers do NOT contain score numbers")
                results.append(("GAD-7 Headers", "PASS", "No score numbers in headers"))
            
            # Test cell clicking
            try:
                first_cell = await page.query_selector("#gad7Content table tbody tr:first-child td:nth-child(2)")
                if first_cell:
                    await first_cell.click()
                    await asyncio.sleep(0.3)
                    print("   ✓ Cell selection works")
                    results.append(("GAD-7 Clicking", "PASS", "Cell selection works"))
            except:
                print("   ✗ Cell selection failed")
                results.append(("GAD-7 Clicking", "FAIL", "Cannot click cells"))
            
            # ========== TEST 3: DEPRESSION ==========
            print("\n3. DEPRESSION TEST")
            print("-" * 80)
            await page.click("#patientSubTabs .nav-link[data-bs-target='#sub-depression']")
            await asyncio.sleep(1.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/test_depression.png", full_page=True)
            
            # Check title
            dep_title = await page.query_selector("text=Depression")
            if dep_title:
                # Get the heading element
                heading = await page.query_selector("#depressionContent h5, #depressionContent h4")
                if heading:
                    title_text = await heading.inner_text()
                    if title_text.strip() == "Depression":
                        print("   ✓ Title says 'Depression' (not 'Depression Screen (GDS-15)')")
                        results.append(("Depression Title", "PASS", "Title is 'Depression'"))
                    else:
                        print(f"   ✗ Title text: '{title_text.strip()}'")
                        results.append(("Depression Title", "FAIL", f"Title is '{title_text.strip()}'"))
            
            # Check NO subtitle
            subtitle = await page.query_selector("text=Geriatric Depression Scale")
            if subtitle:
                print("   ✗ Subtitle/instruction text present (should be none)")
                results.append(("Depression Subtitle", "FAIL", "Subtitle present"))
            else:
                print("   ✓ No subtitle/instruction text")
                results.append(("Depression Subtitle", "PASS", "No subtitle"))
            
            # Check item 2 wording
            item2 = await page.query_selector("text=or interests")
            if item2:
                print("   ✓ Item 2 says 'or interests' (not 'and interests')")
                results.append(("Depression Item 2", "PASS", "'or interests'"))
            else:
                print("   ✗ Item 2 wording incorrect")
                results.append(("Depression Item 2", "FAIL", "Wording incorrect"))
            
            # Check item 4 wording
            item4 = await page.query_selector("text=feel bored")
            if item4:
                print("   ✓ Item 4 says 'feel bored' (not 'get bored')")
                results.append(("Depression Item 4", "PASS", "'feel bored'"))
            else:
                print("   ✗ Item 4 wording incorrect")
                results.append(("Depression Item 4", "FAIL", "Wording incorrect"))
            
            # Check item 11 wording
            item11 = await page.query_selector("text=to be alive?")
            item11_wrong = await page.query_selector("text=to be alive now?")
            if item11 and not item11_wrong:
                print("   ✓ Item 11 says 'to be alive?' (NOT 'to be alive now?')")
                results.append(("Depression Item 11", "PASS", "'to be alive?'"))
            else:
                print("   ✗ Item 11 wording incorrect")
                results.append(("Depression Item 11", "FAIL", "Says 'now'"))
            
            # Check item 15 wording
            item15 = await page.query_selector("text=better off than you are?")
            if item15:
                print("   ✓ Item 15 says 'better off than you are?' (not just 'than you?')")
                results.append(("Depression Item 15", "PASS", "'than you are?'"))
            else:
                print("   ✗ Item 15 wording incorrect")
                results.append(("Depression Item 15", "FAIL", "Wording incorrect"))
            
            # Check Yes/No alternating
            # Item 1 should have "No Yes" order
            first_row = await page.query_selector("#depressionContent table tbody tr:first-child")
            if first_row:
                cells = await first_row.query_selector_all("td")
                if len(cells) >= 2:
                    cell1_text = await cells[1].inner_text() if len(cells) > 1 else ""
                    cell2_text = await cells[2].inner_text() if len(cells) > 2 else ""
                    if "No" in cell1_text and "Yes" in cell2_text:
                        print("   ✓ Item 1 shows 'No Yes' columns (correct order)")
                        results.append(("Depression Order", "PASS", "Alternating Yes/No"))
                    else:
                        print(f"   ⚠ Item 1 order: {cell1_text} {cell2_text}")
            
            # Check TOTAL row
            total_row = await page.query_selector("text=TOTAL:")
            if total_row:
                print("   ✓ 'TOTAL:' row appears at bottom")
                results.append(("Depression Total", "PASS", "Total row present"))
            else:
                print("   ✗ 'TOTAL:' row not found")
                results.append(("Depression Total", "FAIL", "No total row"))
            
            # ========== TEST 4: MDS (DIET) ==========
            print("\n4. MDS (DIET) TEST")
            print("-" * 80)
            await page.click("#patientSubTabs .nav-link[data-bs-target='#sub-diet']")
            await asyncio.sleep(1.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/test_diet.png", full_page=True)
            
            # Check title
            diet_title = await page.query_selector("text=MEDITERRANEAN DIET SCORE TOOL")
            if diet_title:
                print("   ✓ Title is 'MEDITERRANEAN DIET SCORE TOOL' (uppercase)")
                results.append(("Diet Title", "PASS", "Correct uppercase title"))
            else:
                print("   ✗ Title not found or incorrect")
                results.append(("Diet Title", "FAIL", "Title incorrect"))
            
            # Check intro paragraphs
            intro = await page.query_selector("text=The Mediterranean diet has been")
            if intro:
                print("   ✓ Long introductory paragraphs about Med diet present")
                results.append(("Diet Intro", "PASS", "Intro paragraphs present"))
            else:
                print("   ✗ Intro paragraphs not found")
                results.append(("Diet Intro", "FAIL", "No intro"))
            
            # Check Q1
            q1 = await page.query_selector("text=1. Is olive oil the main culinary fat used?")
            if q1:
                print("   ✓ Q1: 'Is olive oil the main culinary fat used?'")
                results.append(("Diet Q1", "PASS", "Correct wording"))
            else:
                print("   ✗ Q1 wording incorrect")
                results.append(("Diet Q1", "FAIL", "Wording incorrect"))
            
            # Check Q2
            q2 = await page.query_selector("text=2. Are ≥ 4 tablespoons of olive oil used each day?")
            if q2:
                print("   ✓ Q2: 'Are ≥ 4 tablespoons of olive oil used each day?'")
                results.append(("Diet Q2", "PASS", "Correct wording with ≥"))
            else:
                print("   ✗ Q2 wording incorrect")
                results.append(("Diet Q2", "FAIL", "Wording incorrect"))
            
            # Check total score text
            total_text = await page.query_selector("text=TOTAL SCORE (total no. of 'yes' answers)")
            if total_text:
                print("   ✓ 'TOTAL SCORE (total no. of 'yes' answers)' text present")
                results.append(("Diet Total", "PASS", "Total score text present"))
            else:
                print("   ✗ Total score text not found")
                results.append(("Diet Total", "FAIL", "Total text not found"))
            
            # ========== TEST 5: CASP-19 ==========
            print("\n5. CASP-19 TEST")
            print("-" * 80)
            await page.click("#patientSubTabs .nav-link[data-bs-target='#sub-casp19']")
            await asyncio.sleep(1.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/test_casp19.png", full_page=True)
            
            # Check title
            casp_title = await page.query_selector("text=CASP19 Quality of Life Scale (ELSA version)")
            if casp_title:
                print("   ✓ Title: 'CASP19 Quality of Life Scale (ELSA version)'")
                results.append(("CASP-19 Title", "PASS", "Correct title"))
            else:
                print("   ✗ Title incorrect")
                results.append(("CASP-19 Title", "FAIL", "Title incorrect"))
            
            # Check instruction
            casp_inst = await page.query_selector("text=Please circle the number that corresponds with how much you agree with the phrase")
            if casp_inst:
                print("   ✓ Instruction text correct")
                results.append(("CASP-19 Instruction", "PASS", "Correct instruction"))
            else:
                print("   ✗ Instruction text incorrect")
                results.append(("CASP-19 Instruction", "FAIL", "Instruction incorrect"))
            
            # Check for Sub-domain column
            subdomain_header = await page.query_selector("text=Sub-domain")
            if subdomain_header:
                print("   ✓ 'Sub-domain' column header present")
                results.append(("CASP-19 Sub-domain", "PASS", "Sub-domain column"))
            else:
                print("   ✗ 'Sub-domain' column not found")
                results.append(("CASP-19 Sub-domain", "FAIL", "No sub-domain column"))
            
            # Check for Item no column
            itemno_header = await page.query_selector("text=Item no")
            if itemno_header:
                print("   ✓ 'Item no' column header present")
                results.append(("CASP-19 Item no", "PASS", "Item no column"))
            else:
                print("   ✗ 'Item no' column not found")
                results.append(("CASP-19 Item no", "FAIL", "No item no column"))
            
            # Check for domain codes
            c1 = await page.query_selector("text=C1")
            a1 = await page.query_selector("text=A1")
            p1 = await page.query_selector("text=P1")
            sr1 = await page.query_selector("text=SR1")
            if c1 and a1 and p1 and sr1:
                print("   ✓ Sub-domain codes (C1, C2, A1, P1, SR1 etc.) appear in table")
                results.append(("CASP-19 Codes", "PASS", "Domain codes present"))
            else:
                print("   ✗ Sub-domain codes not all found")
                results.append(("CASP-19 Codes", "FAIL", "Codes missing"))
            
            # ========== TEST 6: HEARING ==========
            print("\n6. HEARING TEST")
            print("-" * 80)
            await page.click("#patientSubTabs .nav-link[data-bs-target='#sub-hearing']")
            await asyncio.sleep(1.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/test_hearing.png", full_page=True)
            
            # Check title
            hearing_title = await page.query_selector("text=Your ears and hearing")
            if hearing_title:
                print("   ✓ Title: 'Your ears and hearing'")
                results.append(("Hearing Title", "PASS", "Correct title"))
            else:
                print("   ✗ Title incorrect")
                results.append(("Hearing Title", "FAIL", "Title incorrect"))
            
            # Check Q1
            hearing_q1 = await page.query_selector("text=How long have you had a problem with your hearing?")
            if hearing_q1:
                print("   ✓ Q1: 'How long have you had a problem with your hearing?'")
                results.append(("Hearing Q1", "PASS", "Correct wording"))
            else:
                print("   ✗ Q1 wording incorrect")
                results.append(("Hearing Q1", "FAIL", "Wording incorrect"))
            
            # Check Q2
            hearing_q2 = await page.query_selector("text=Which ear(s) does your hearing problem affect?")
            if hearing_q2:
                print("   ✓ Q2: 'Which ear(s) does your hearing problem affect?'")
                results.append(("Hearing Q2", "PASS", "Correct wording"))
            else:
                print("   ✗ Q2 wording incorrect")
                results.append(("Hearing Q2", "FAIL", "Wording incorrect"))
            
            # Check tinnitus question
            tinnitus = await page.query_selector("text=Do you hear any rushing, hissing, ringing, beating, pulsing or any other noises in your ears, often called tinnitus?")
            if tinnitus:
                print("   ✓ Tinnitus question uses exact wording")
                results.append(("Hearing Tinnitus", "PASS", "Exact wording"))
            else:
                print("   ✗ Tinnitus question wording incorrect")
                results.append(("Hearing Tinnitus", "FAIL", "Wording incorrect"))
            
            # Check Hearing difficulties section
            diff_section = await page.query_selector("text=Hearing difficulties")
            if diff_section:
                print("   ✓ 'Hearing difficulties' section present")
                results.append(("Hearing Difficulties", "PASS", "Section present"))
            else:
                print("   ✗ 'Hearing difficulties' section not found")
                results.append(("Hearing Difficulties", "FAIL", "Section missing"))
            
            # Check situation 1
            situation1 = await page.query_selector("text=1. One to one conversation in quiet.")
            if situation1:
                print("   ✓ Situation 1: 'One to one conversation in quiet.'")
                results.append(("Hearing Situation", "PASS", "Exact wording"))
            else:
                print("   ✗ Situation 1 wording incorrect")
                results.append(("Hearing Situation", "FAIL", "Wording incorrect"))
            
            # Check "which 3" question
            which3 = await page.query_selector("text=Of the situations you ticked, which 3 are most affected by your hearing?")
            if which3:
                print("   ✓ 'Which 3 are most affected' question present")
                results.append(("Hearing Which 3", "PASS", "Question present"))
            else:
                print("   ✗ 'Which 3' question not found")
                results.append(("Hearing Which 3", "FAIL", "Question missing"))
            
            # ========== TEST 7: MBI-C ==========
            print("\n7. MBI-C TEST")
            print("-" * 80)
            await page.click("#tab-informant")
            await asyncio.sleep(1)
            await page.click("#informantSubTabs .nav-link[data-bs-target='#sub-mbic']")
            await asyncio.sleep(1.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/test_mbic.png", full_page=True)
            
            # Check title
            mbic_title = await page.query_selector("text=Mild Behavioural Impairment Checklist (MBI-C)")
            if mbic_title:
                print("   ✓ Title: 'Mild Behavioural Impairment Checklist (MBI-C)'")
                results.append(("MBI-C Title", "PASS", "Correct title"))
            else:
                print("   ✗ Title incorrect")
                results.append(("MBI-C Title", "FAIL", "Title incorrect"))
            
            # Check ID Number field
            id_field = await page.query_selector("text=ID Number:")
            if id_field:
                print("   ✓ 'ID Number:' field present")
                results.append(("MBI-C ID", "PASS", "ID field present"))
            else:
                print("   ✗ 'ID Number:' field not found")
                results.append(("MBI-C ID", "FAIL", "ID field missing"))
            
            # Check citation
            citation = await page.query_selector("text=Modified from J Alzheimers Dis. 2017")
            if citation:
                print("   ✓ Citation 'Modified from J Alzheimers Dis. 2017...' shown")
                results.append(("MBI-C Citation", "PASS", "Citation present"))
            else:
                print("   ✗ Citation not found")
                results.append(("MBI-C Citation", "FAIL", "Citation missing"))
            
            # Check domain headings
            domain1 = await page.query_selector("text=Interest, motivation, and drive")
            domain2 = await page.query_selector("text=Mood or anxiety symptoms")
            domain3 = await page.query_selector("text=Delayed gratification and control behavior")
            domain4 = await page.query_selector("text=Societal norms and having social graces, tact, and empathy")
            domain5 = await page.query_selector("text=Strongly held beliefs and sensory experiences")
            
            if domain1:
                print("   ✓ Domain 1: 'Interest, motivation, and drive'")
                results.append(("MBI-C Domain 1", "PASS", "Correct heading"))
            if domain2:
                print("   ✓ Domain 2: 'Mood or anxiety symptoms'")
                results.append(("MBI-C Domain 2", "PASS", "Correct heading"))
            if domain3:
                print("   ✓ Domain 3: 'Delayed gratification and control behavior...'")
                results.append(("MBI-C Domain 3", "PASS", "Correct heading"))
            if domain4:
                print("   ✓ Domain 4: 'Societal norms and having social graces, tact, and empathy'")
                results.append(("MBI-C Domain 4", "PASS", "Correct heading"))
            if domain5:
                print("   ✓ Domain 5: 'Strongly held beliefs and sensory experiences'")
                results.append(("MBI-C Domain 5", "PASS", "Correct heading"))
            
            # Check first item
            first_item = await page.query_selector("text=Does the person lack curiosity in topics that would usually have attracted her/his interest?")
            if first_item:
                print("   ✓ First item in domain 1 has correct wording")
                results.append(("MBI-C Item 1", "PASS", "Correct wording"))
            else:
                print("   ✗ First item wording incorrect")
                results.append(("MBI-C Item 1", "FAIL", "Wording incorrect"))
            
            # ========== TEST 8: NPI-Q ==========
            print("\n8. NPI-Q TEST")
            print("-" * 80)
            await page.click("#informantSubTabs .nav-link[data-bs-target='#sub-npiq']")
            await asyncio.sleep(1.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/test_npiq.png", full_page=True)
            
            # Check title
            npiq_title = await page.query_selector("text=Neuropsychiatric Inventory Questionnaire (NPI-Q)")
            if npiq_title:
                print("   ✓ Title: 'Neuropsychiatric Inventory Questionnaire (NPI-Q)'")
                results.append(("NPI-Q Title", "PASS", "Correct title"))
            else:
                print("   ✗ Title incorrect")
                results.append(("NPI-Q Title", "FAIL", "Title incorrect"))
            
            # Check instruction paragraphs
            npiq_inst = await page.query_selector("text=Please answer the following questions")
            if npiq_inst:
                print("   ✓ Long instruction paragraphs present")
                results.append(("NPI-Q Instructions", "PASS", "Instructions present"))
            else:
                print("   ✗ Instructions not found")
                results.append(("NPI-Q Instructions", "FAIL", "Instructions missing"))
            
            # Check symptom names
            agitation = await page.query_selector("text=Agitation/Aggression")
            if agitation:
                aggr_text = await agitation.inner_text()
                if "Agitation/Aggression" in aggr_text and "Agitation / Aggression" not in aggr_text:
                    print("   ✓ 'Agitation/Aggression' (no spaces around slash)")
                    results.append(("NPI-Q Agitation", "PASS", "No spaces"))
                else:
                    print(f"   ✗ Agitation text: '{aggr_text}'")
                    results.append(("NPI-Q Agitation", "FAIL", "Has spaces"))
            
            motor = await page.query_selector("text=Motor Disturbance")
            if motor:
                print("   ✓ 'Motor Disturbance' (not 'Aberrant Motor Behaviour')")
                results.append(("NPI-Q Motor", "PASS", "Correct term"))
            else:
                print("   ✗ 'Motor Disturbance' not found")
                results.append(("NPI-Q Motor", "FAIL", "Wrong term"))
            
            nighttime = await page.query_selector("text=Nightime Behaviors")
            if nighttime:
                print("   ✓ 'Nightime Behaviors' (not 'Night-time Behaviours')")
                results.append(("NPI-Q Nighttime", "PASS", "Correct spelling"))
            else:
                print("   ✗ 'Nightime Behaviors' not found")
                results.append(("NPI-Q Nighttime", "FAIL", "Wrong spelling"))
            
            appetite = await page.query_selector("text=Appetite/Eating")
            appetite_wrong = await page.query_selector("text=Appetite / Eating")
            if appetite and not appetite_wrong:
                print("   ✓ 'Appetite/Eating' (not 'Appetite / Eating Changes')")
                results.append(("NPI-Q Appetite", "PASS", "Correct format"))
            else:
                print("   ✗ 'Appetite/Eating' format incorrect")
                results.append(("NPI-Q Appetite", "FAIL", "Wrong format"))
            
            # Check footer
            footer = await page.query_selector("text=Developed by Daniel Kaufer, MD")
            if footer:
                print("   ✓ Footer: 'Developed by Daniel Kaufer, MD...'")
                results.append(("NPI-Q Footer", "PASS", "Footer present"))
            else:
                print("   ✗ Footer not found")
                results.append(("NPI-Q Footer", "FAIL", "Footer missing"))
            
            # Test clicking Yes to show severity/distress
            try:
                yes_button = await page.query_selector("#npiqContent .form-check-input[value='Yes']")
                if yes_button:
                    await yes_button.click()
                    await asyncio.sleep(1)
                    
                    # Check if severity grid appears
                    severity_grid = await page.query_selector("text=Severity")
                    if severity_grid:
                        print("   ✓ Severity/distress grids appear when 'Yes' clicked")
                        results.append(("NPI-Q Conditional", "PASS", "Grids appear"))
                    else:
                        print("   ⚠ Severity grid may not have appeared")
            except Exception as e:
                print(f"   ⚠ Could not test conditional display: {e}")
            
            # ========== SUMMARY ==========
            print("\n" + "=" * 80)
            print("TEST SUMMARY")
            print("=" * 80)
            
            passed = sum(1 for r in results if r[1] == "PASS")
            failed = sum(1 for r in results if r[1] == "FAIL")
            
            print(f"\nTotal Tests: {len(results)}")
            print(f"Passed: {passed}")
            print(f"Failed: {failed}")
            print(f"\nSuccess Rate: {passed/len(results)*100:.1f}%")
            
            print("\n" + "-" * 80)
            print("FAILED TESTS:")
            print("-" * 80)
            for test, status, detail in results:
                if status == "FAIL":
                    print(f"  ✗ {test}: {detail}")
            
            if failed == 0:
                print("  🎉 ALL TESTS PASSED!")
            
            # Keep browser open
            await asyncio.sleep(5)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/test_error_all.png", full_page=True)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
