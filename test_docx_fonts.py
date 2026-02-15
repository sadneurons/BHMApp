#!/usr/bin/env python3
"""
Test DOCX export with font embedding
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        # Capture ALL console messages
        console_messages = []
        def handle_console(msg):
            text = msg.text
            console_messages.append(f"[{msg.type}] {text}")
            print(f"   CONSOLE: [{msg.type}] {text}")
        
        page.on("console", handle_console)
        
        # Track downloads
        downloads = []
        page.on("download", lambda d: downloads.append(d))
        
        try:
            print("=" * 80)
            print("DOCX EXPORT WITH FONT EMBEDDING TEST")
            print("=" * 80)
            
            # Step 1: Load app
            print("\n1. Loading app...")
            await page.goto("file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html", wait_until="domcontentloaded", timeout=60000)
            await asyncio.sleep(3)
            print("   ✓ App loaded")
            
            # Step 2: Dismiss disclaimer
            print("\n2. Dismissing disclaimer...")
            try:
                await page.click("button:has-text('Continue')", timeout=3000)
                await asyncio.sleep(1)
                print("   ✓ Disclaimer dismissed")
            except:
                print("   ℹ️ No disclaimer")
            
            # Step 3: Fill patient demographics
            print("\n3. Filling patient demographics...")
            
            # Patient Name
            await page.fill("input[placeholder*='shown on booklet']", "Jane Doe")
            print("   ✓ Patient Name: Jane Doe")
            
            # DOB
            await page.fill("input[type='date']", "1948-06-22")
            print("   ✓ DOB: 22/06/1948")
            
            # NHS Number
            nhs_input = await page.query_selector("input[placeholder*='Optional']")
            if nhs_input:
                await nhs_input.fill("987 654 3210")
                print("   ✓ NHS Number: 987 654 3210")
            
            # Clinician
            clinician_input = await page.query_selector("input[placeholder*='clinician'], input[name*='clinician']")
            if clinician_input:
                await clinician_input.fill("Dr Smith")
                print("   ✓ Clinician: Dr Smith")
            else:
                # Try alternative selector
                await page.evaluate("document.querySelector('input[placeholder*=\"Assessing\"]').value = 'Dr Smith'")
                print("   ✓ Clinician: Dr Smith (via JS)")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/fonts_01_demographics.png")
            print("   📸 fonts_01_demographics.png")
            
            # Step 4: Inject test data via console
            print("\n4. Injecting test data via console...")
            
            test_data_script = """
                // PSQI scores
                BHM.State.set('instruments.psqi.q1', '22:30');
                BHM.State.set('instruments.psqi.q2', '25');
                BHM.State.set('instruments.psqi.q3', '06:00');
                BHM.State.set('instruments.psqi.q4', '7');
                for(var i=0;i<10;i++) BHM.State.set('instruments.psqi.q5'+String.fromCharCode(97+i), Math.floor(Math.random()*4));
                BHM.State.set('instruments.psqi.q6', Math.floor(Math.random()*4));
                BHM.State.set('instruments.psqi.q7', Math.floor(Math.random()*4));
                BHM.State.set('instruments.psqi.q8', Math.floor(Math.random()*4));
                BHM.State.set('instruments.psqi.q9', Math.floor(Math.random()*4));
                BHM.Scoring.psqi();
                console.log('✓ PSQI data injected');

                // MBI-C scores
                for(var i=1; i<=34; i++) BHM.State.set('instruments.mbiC.q'+i, Math.floor(Math.random()*4));
                BHM.Scoring.mbiC();
                console.log('✓ MBI-C data injected');

                // NPI-Q scores
                var symptoms = ['delusions','hallucinations','agitation','depression','anxiety','elation','apathy','disinhibition','irritability','aberrantMotor','sleep','appetite'];
                symptoms.forEach(function(s){
                  BHM.State.set('instruments.npiQ.'+s+'_present','yes');
                  BHM.State.set('instruments.npiQ.'+s+'_severity', Math.floor(Math.random()*3)+1);
                  BHM.State.set('instruments.npiQ.'+s+'_distress', Math.floor(Math.random()*5)+1);
                });
                BHM.Scoring.npiQ();
                console.log('✓ NPI-Q data injected');

                // CDR scores
                BHM.State.set('scores.cdr.domainScores', {memory:1.5, orientation:1, judgment:0.5, community:1, homeHobbies:0.5, personalCare:0});
                BHM.State.set('scores.cdr.total', 1);
                BHM.State.set('scores.cdr.sumOfBoxes', 4.5);
                console.log('✓ CDR data injected');

                // Trigger report update
                BHM.Report.update();
                console.log('✓ Report updated');
            """
            
            await page.evaluate(test_data_script)
            await asyncio.sleep(1)
            print("   ✓ Test data injected")
            
            # Step 5: Go to Report tab
            print("\n5. Opening Report tab...")
            await page.click("#tab-report")
            await asyncio.sleep(1)
            print("   ✓ Report tab opened")
            
            # Step 6: Wait for charts to render
            print("\n6. Waiting 3 seconds for charts to render...")
            await asyncio.sleep(3)
            print("   ✓ Charts rendered")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/fonts_02_report_with_charts.png", full_page=True)
            print("   📸 fonts_02_report_with_charts.png (full page)")
            
            # Step 7: Export to Word
            print("\n7. Clicking Export → 'Export Word (.docx)'...")
            
            # Clear console messages to focus on export
            console_messages.clear()
            
            # Open dropdown
            await page.click("button[title='Export']")
            await asyncio.sleep(0.5)
            
            # Step 8: Click and wait for download
            print("\n8. Waiting for download...")
            try:
                async with page.expect_download(timeout=20000) as download_info:
                    await page.click("#exportDocx")
                    print("   ✓ Clicked Export Word")
                    
                    # Wait for export to complete
                    await asyncio.sleep(4)
                
                download = await download_info.value
                print(f"   ✅ Download completed!")
                print(f"      Filename: {download.suggested_filename}")
                
                save_path = f"/home/tenebris/Desktop/{download.suggested_filename}"
                await download.save_as(save_path)
                print(f"      Saved to: {save_path}")
                
                # Get file size
                import os
                file_size = os.path.getsize(save_path)
                print(f"      File size: {file_size:,} bytes ({file_size/1024:.1f} KB)")
                
            except Exception as e:
                print(f"   ⚠️ Download error: {e}")
                file_size = 0
            
            await asyncio.sleep(1)
            
            # Step 9: Check console messages
            print("\n9. Console messages during export:")
            print("=" * 80)
            
            if console_messages:
                # Filter DocxExport messages
                docx_messages = [m for m in console_messages if 'DocxExport' in m or 'docx' in m.lower()]
                
                if docx_messages:
                    print(f"\n   🔍 DocxExport messages ({len(docx_messages)}):")
                    for msg in docx_messages:
                        print(f"      {msg}")
                else:
                    print("\n   ℹ️ No 'DocxExport:' messages found")
                
                # Check for errors
                errors = [m for m in console_messages if 'error' in m.lower() or '[error]' in m.lower()]
                if errors:
                    print(f"\n   ⚠️ ERRORS ({len(errors)}):")
                    for err in errors:
                        print(f"      {err}")
                else:
                    print("\n   ✅ No errors in console")
                
                # Show all messages
                print(f"\n   📋 All console messages ({len(console_messages)} total):")
                for msg in console_messages:
                    print(f"      {msg}")
            else:
                print("   ℹ️ No console messages captured")
            
            # Step 10: Summary
            print("\n" + "=" * 80)
            print("SUMMARY")
            print("=" * 80)
            
            if downloads:
                print(f"✅ DOCX file downloaded: {downloads[0].suggested_filename}")
                print(f"   File size: {file_size:,} bytes ({file_size/1024:.1f} KB)")
            else:
                print("⚠️ No file downloaded")
            
            docx_logs = [m for m in console_messages if 'DocxExport' in m]
            print(f"\n📊 DocxExport messages: {len(docx_logs)}")
            
            error_count = len([m for m in console_messages if 'error' in m.lower()])
            if error_count > 0:
                print(f"⚠️ Errors found: {error_count}")
            else:
                print("✅ No errors")
            
            print("\n✅ Test complete")
            
            await asyncio.sleep(3)
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
            
            try:
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/fonts_error.png")
                print("📸 fonts_error.png")
            except:
                pass
                
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
