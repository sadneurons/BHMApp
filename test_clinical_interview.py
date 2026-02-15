#!/usr/bin/env python3
"""
Test Semi-Structured Clinical Interview and Report
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
            print("SEMI-STRUCTURED CLINICAL INTERVIEW TEST")
            print("=" * 80)
            
            # Step 1: Navigate
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"\nStep 1: Navigating to {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(2)
            print("   ✓ Page loaded")
            
            # Step 2: Click Clinical Interview tab
            print("\nStep 2: Opening Clinical Interview tab...")
            await page.click("#tab-clinical")
            await asyncio.sleep(1.5)
            print("   ✓ Clinical Interview tab opened")
            
            # Step 3: Verify Interview sub-tab is active and take screenshot
            print("\nStep 3: Checking Interview sub-tab...")
            
            # Scroll to top
            await page.evaluate("window.scrollTo(0, 0)")
            await asyncio.sleep(0.5)
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/interview_01_form_top.png", full_page=False)
            print("   📸 Screenshot: interview_01_form_top.png")
            
            # Check for sections A-I
            print("\n   Checking for interview sections A-I:")
            sections = [
                ("A. Memory", "Memory"),
                ("B. Language", "Language"),
                ("C. Visuospatial", "Visuospatial"),
                ("D. Personal", "Personal History"),
                ("E. Head", "Head Injury"),
                ("F. Premorbid", "Premorbid Personality"),
                ("G. Education", "Education"),
                ("H. Substance", "Substance Use"),
                ("I. Clinician", "Clinician Notes")
            ]
            
            for label, keyword in sections:
                found = await page.query_selector(f"text={keyword}")
                if found:
                    print(f"      ✓ Section {label}")
                else:
                    print(f"      ⚠ Section {label} not found")
            
            # Scroll down to see more sections
            await page.evaluate("window.scrollBy(0, 1000)")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/interview_02_form_middle.png", full_page=False)
            print("   📸 Screenshot: interview_02_form_middle.png")
            
            await page.evaluate("window.scrollBy(0, 1000)")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/interview_03_form_bottom.png", full_page=False)
            print("   📸 Screenshot: interview_03_form_bottom.png")
            
            # Step 4: Inject test data
            print("\n" + "=" * 80)
            print("Step 4: Injecting comprehensive clinical interview data...")
            print("=" * 80)
            
            inject_script = """
            (function() {
              var c = BHM.State.getSession().instruments.clinical;
              // A. Memory
              Object.assign(c, {
                interviewDate: '2026-02-15', interviewer: 'Dr Smith', clientName: 'Margaret Thompson', nhsNumber: '123 456 7890',
                informantName: 'John Thompson', informantRel: 'Husband', informantPresent: 'Yes',
                memA1: 'yes', memA1_freq: 'daily', memA1_onset: '18 months ago',
                memA2: 'yes', memA2_freq: 'daily', memA2_onset: '18 months ago',
                memA3: 'yes', memA3_freq: 'weekly', memA3_onset: '12 months ago',
                memA4: 'yes', memA4_freq: 'weekly', memA4_onset: '12 months ago',
                memA5: 'yes', memA5_freq: 'daily', memA5_onset: '2 years ago',
                memA6: 'yes', memA6_freq: 'occasional',
                memoryNotes: 'Husband reports she left the oven on twice last month. Frequently asks what day it is.'
              });
              // B. Language
              Object.assign(c, {
                langB1: 'yes', langB1_freq: 'daily',
                langB2: 'yes', langB2_freq: 'weekly',
                langB3: 'no', langB4: 'yes', langB4_freq: 'occasional',
                langB5: 'yes', langB5_freq: 'weekly',
                langB6: 'no',
                primaryLanguage: 'English', otherLanguages: '', langDifficulty: 'No',
                languageNotes: 'Circumlocution noted during interview — described keys as "the things you open the door with".'
              });
              // C. Visuospatial
              Object.assign(c, {
                visC1_present: 'no', visC2_present: 'yes', visC2_stopped: 'yes', visC2_safety: 'yes', visC2_onset: '6 months ago',
                visC3_present: 'no', visC4_present: 'yes', visC4_onset: 'recent',
                visC5_present: 'yes', visC5_onset: '1 year ago',
                visuospatialNotes: 'Husband now does all the driving. Got lost walking to the local shops 3 weeks ago.'
              });
              // D. Personal history
              Object.assign(c, {
                birthPlace: 'Manchester', livingSituation: 'Lives with husband', siblings: '2 (middle child)',
                migration: 'No', parentOccupation: 'Factory worker', discipline: 'Typical',
                trauma: 'No', military: 'No', relationships: 'Married 45 years', children: '2 adult children'
              });
              // E. Head injury
              Object.assign(c, { headInjury: 'No', contactSports: 'No' });
              // F. Personality
              Object.assign(c, {
                persSocAnx: 'low', persInhib: 'low', persPersist: 'high', persImpuls: 'low', persEmpathy: 'high',
                persConflict: 'Avoidant', persMood: 'Mostly positive', persSocial: 'High'
              });
              // G. Education
              Object.assign(c, {
                academicPerf: 'Middle', schoolLeaveAge: 16, highestQual: 'GCSE/O-level', yearsEdu: 11,
                learningDiff: 'No', occStatus: 'Retired', firstJob: 'Shop assistant', peakOccupation: 'Office manager',
                lastJob: 'Office manager', workDomain: 'Clerical'
              });
              // H. Substance use
              Object.assign(c, {
                alcUnitsWk: '1-7', auditCompleted: 'Yes', alcPast: 'No concerns',
                tobacco: 'Never', cannabis: 'Never', otherSubstances: 'None', caffeine: '3', substanceHarms: 'No'
              });
              // I. Summary
              Object.assign(c, {
                keyPositives: 'Progressive memory decline over 18 months with daily rapid forgetfulness and repetitive questioning. Language difficulties emerging with circumlocution. Wayfinding difficulties with safety concerns. Husband corroborates all symptoms.',
                safetyConcerns: 'Has stopped driving due to getting lost. Left oven on twice. Husband providing increased supervision.'
              });
              BHM.Report.update();
              console.log('Clinical interview data injected');
              return 'Done';
            })();
            """
            
            result = await page.evaluate(inject_script)
            print(f"   ✓ Data injection: {result}")
            
            await asyncio.sleep(1)
            print("\n   Recent console messages:")
            for msg in console_messages[-5:]:
                print(f"      {msg}")
            
            # Step 5: Go to Report tab
            print("\n" + "=" * 80)
            print("Step 5: Opening Report tab...")
            print("=" * 80)
            
            await page.click("#tab-report")
            await asyncio.sleep(2)
            print("   ✓ Report tab opened")
            
            # Step 6: Scroll to Clinical Interview section
            print("\nStep 6: Scrolling to Clinical Interview section...")
            
            clinical_section = await page.query_selector("text=Clinician Interview Summary, text=Clinical Interview")
            if clinical_section:
                await clinical_section.scroll_into_view_if_needed()
                await asyncio.sleep(1)
                await page.evaluate("window.scrollBy(0, -100)")
                await asyncio.sleep(0.5)
                print("   ✓ Found Clinical Interview section")
            else:
                # Manual scroll to find it
                print("   Scrolling manually to find section...")
                for i in range(10):
                    await page.evaluate("window.scrollBy(0, 800)")
                    await asyncio.sleep(0.5)
                    clinical_section = await page.query_selector("text=Clinician Interview Summary, text=Clinical Interview")
                    if clinical_section:
                        print(f"   ✓ Found after {i+1} scrolls")
                        break
            
            # Step 7: Take screenshot of Clinical Interview section
            print("\nStep 7: Taking screenshots of Clinical Interview section...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/interview_04_report_section.png", full_page=False)
            print("   📸 Screenshot: interview_04_report_section.png")
            
            # Check for specific paragraphs
            print("\n   Checking for specific report content:")
            
            content_checks = [
                ("Memory and new learning", "Memory"),
                ("Word-finding and language", "Word-finding"),
                ("Wayfinding and visuospatial", "Wayfinding"),
                ("Personal background", "Personal background"),
                ("Head injury", "Head injury"),
                ("Premorbid personality", "Premorbid personality"),
                ("Education and occupation", "Education and occupation"),
                ("Substance use", "Substance use"),
                ("Key findings", "Key findings"),
                ("Safety concerns", "Safety concerns")
            ]
            
            for label, keyword in content_checks:
                found = await page.query_selector(f"text={keyword}")
                if found:
                    print(f"      ✓ Found: {label}")
                else:
                    print(f"      ⚠ Not found: {label}")
            
            # Scroll down to see rest of section
            await page.evaluate("window.scrollBy(0, 400)")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/interview_05_report_lower.png", full_page=False)
            print("   📸 Screenshot: interview_05_report_lower.png")
            
            # Check for MI tone
            mi_statement = await page.query_selector("em, i, .fst-italic")
            if mi_statement:
                print("   ✓ MI-tone statement (italic) found")
            
            # Check for clinical notes box
            clinical_notes = await page.query_selector("text=Clinical notes — Clinician Interview")
            if clinical_notes:
                print("   ✓ Clinical notes textarea found")
            else:
                print("   ⚠ Clinical notes textarea not found")
            
            # Continue scrolling
            await page.evaluate("window.scrollBy(0, 400)")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/interview_06_report_bottom.png", full_page=False)
            print("   📸 Screenshot: interview_06_report_bottom.png")
            
            # Check console errors
            print("\n" + "=" * 80)
            print("RESULTS SUMMARY")
            print("=" * 80)
            
            if console_errors:
                print(f"\n⚠ Console errors: {len(console_errors)}")
                for err in console_errors[:5]:
                    print(f"   {err}")
            else:
                print("\n✅ No console errors detected")
            
            print(f"\n✅ Total console messages: {len(console_messages)}")
            print(f"✅ All screenshots saved")
            
            print("\n" + "=" * 80)
            print("TEST COMPLETED")
            print("=" * 80)
            
            await asyncio.sleep(5)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/interview_error.png", full_page=True)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
