#!/usr/bin/env python3
"""
Test DOCX export with chart data - capture console logs
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
            print("DOCX EXPORT WITH CHARTS TEST")
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
            await page.fill("input[placeholder*='shown on booklet']", "Test Patient")
            await page.fill("input[type='date']", "1955-03-15")
            print("   ✓ Patient Name: Test Patient")
            print("   ✓ DOB: 15/03/1955")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/charts_01_demographics.png")
            print("   📸 charts_01_demographics.png")
            
            # Step 4: Fill PSQI data
            print("\n4. Filling PSQI data...")
            await page.click("#tab-patient")
            await asyncio.sleep(0.5)
            
            # Fill PSQI via JavaScript for speed
            await page.evaluate("""
                var psqi = BHM.State.getSession().instruments.psqi;
                psqi.q1_bedtime = '23:00';
                psqi.q2_latency_min = '30';
                psqi.q3_waketime = '07:00';
                psqi.q4_sleep_hours = 6;
                psqi.q5a = 2;
                psqi.q5b = 3;
                psqi.q5c = 1;
                psqi.q5d = 0;
                psqi.q5e = 2;
                psqi.q5f = 2;
                psqi.q5g = 3;
                psqi.q5h = 1;
                psqi.q5i = 2;
                psqi.q5j = 0;
                psqi.q6_medication = 2;
                psqi.q7_drowsiness = 2;
                psqi.q8_enthusiasm = 2;
                psqi.q9_quality = 3;
                BHM.Scoring.psqi();
                console.log('PSQI data filled');
            """)
            await asyncio.sleep(0.5)
            print("   ✓ PSQI data filled")
            
            # Step 5: Fill GAD-7 data
            print("\n5. Filling GAD-7 data...")
            await page.click("button:has-text('GAD-7')")
            await asyncio.sleep(0.5)
            
            await page.evaluate("""
                var gad = BHM.State.getSession().instruments.gad7;
                gad.g1 = 2;
                gad.g2 = 3;
                gad.g3 = 2;
                gad.g4 = 1;
                gad.g5 = 2;
                gad.g6 = 2;
                gad.g7 = 3;
                gad.impairment = 'very';
                BHM.Scoring.gad7();
                console.log('GAD-7 data filled');
            """)
            await asyncio.sleep(0.5)
            print("   ✓ GAD-7 data filled")
            
            # Step 6: Inject chart data via console
            print("\n6. Injecting chart data (MBI-C, NPI-Q, CDR)...")
            
            chart_script = """
                // Set some MBI-C scores
                for(var i=1; i<=34; i++) BHM.State.set('instruments.mbiC.q'+i, Math.floor(Math.random()*4));
                BHM.Scoring.mbiC();
                console.log('MBI-C scores injected');
                
                // Set some NPI-Q scores  
                var symptoms = ['delusions','hallucinations','agitation','depression','anxiety','elation','apathy','disinhibition','irritability','aberrantMotor','sleep','appetite'];
                symptoms.forEach(function(s){
                  BHM.State.set('instruments.npiQ.'+s+'_present','yes');
                  BHM.State.set('instruments.npiQ.'+s+'_severity', Math.floor(Math.random()*3)+1);
                  BHM.State.set('instruments.npiQ.'+s+'_distress', Math.floor(Math.random()*5)+1);
                });
                BHM.Scoring.npiQ();
                console.log('NPI-Q scores injected');
                
                // Set CDR scores
                var cdrDomains = ['memory','orientation','judgment','community','homeHobbies','personalCare'];
                cdrDomains.forEach(function(d){ BHM.State.set('scores.cdr.domainScores.'+d, Math.random()*2); });
                BHM.State.set('scores.cdr.total', 1);
                BHM.State.set('scores.cdr.sumOfBoxes', 6);
                console.log('CDR scores injected');
                
                console.log('All chart data injected successfully');
            """
            
            await page.evaluate(chart_script)
            await asyncio.sleep(1)
            print("   ✓ Chart data injected")
            
            # Step 7: Go to Report tab
            print("\n7. Opening Report tab...")
            await page.click("#tab-report")
            await asyncio.sleep(2)  # Give charts time to render
            print("   ✓ Report tab opened")
            
            # Step 8: Screenshot report with charts
            print("\n8. Taking screenshot of report with charts...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/charts_02_report_with_charts.png", full_page=True)
            print("   📸 charts_02_report_with_charts.png (full page)")
            
            # Scroll to find charts
            await page.evaluate("window.scrollTo(0, 2000)")
            await asyncio.sleep(0.5)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/charts_03_report_charts_detail.png")
            print("   📸 charts_03_report_charts_detail.png")
            
            # Step 9: Clear console and prepare for export
            print("\n9. Clearing console and preparing for export...")
            console_messages.clear()  # Clear Python list
            await page.evaluate("console.clear()")
            print("   ✓ Console cleared")
            
            # Step 10: Click Export → Word
            print("\n10. Clicking Export → 'Export Word (.docx)'...")
            print("    (Watching console for DocxExport: messages...)")
            
            # Open dropdown
            await page.click("button[title='Export']")
            await asyncio.sleep(0.5)
            
            # Click Export Word and wait for download
            try:
                async with page.expect_download(timeout=15000) as download_info:
                    await page.click("#exportDocx")
                    print("    ✓ Clicked Export Word")
                    
                    # Wait a bit for console messages
                    await asyncio.sleep(3)
                
                download = await download_info.value
                print(f"    ✅ Download completed!")
                print(f"       Filename: {download.suggested_filename}")
                
                save_path = f"/home/tenebris/Desktop/{download.suggested_filename}"
                await download.save_as(save_path)
                print(f"       Saved to: {save_path}")
                
                # Get file size
                import os
                file_size = os.path.getsize(save_path)
                print(f"       File size: {file_size:,} bytes ({file_size/1024:.1f} KB)")
                
            except Exception as e:
                print(f"    ⚠️ Download error: {e}")
            
            # Take screenshot of console
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/charts_04_console_after_export.png")
            print("    📸 charts_04_console_after_export.png")
            
            # Step 11: Report console messages
            print("\n11. Console messages during export:")
            print("=" * 80)
            
            if console_messages:
                docx_messages = [m for m in console_messages if 'DocxExport' in m or 'docx' in m.lower() or 'export' in m.lower()]
                
                if docx_messages:
                    print(f"\n   🔍 Found {len(docx_messages)} DocxExport-related messages:")
                    for msg in docx_messages:
                        print(f"      {msg}")
                else:
                    print("\n   ⚠️ No 'DocxExport:' messages found")
                
                print(f"\n   📋 All console messages ({len(console_messages)} total):")
                for msg in console_messages:
                    print(f"      {msg}")
            else:
                print("   ℹ️ No console messages captured after export")
            
            # Step 12: Summary
            print("\n" + "=" * 80)
            print("SUMMARY")
            print("=" * 80)
            
            if downloads:
                print(f"✅ DOCX file downloaded: {downloads[0].suggested_filename}")
                print(f"   File size: {file_size:,} bytes ({file_size/1024:.1f} KB)")
            else:
                print("⚠️ No file downloaded")
            
            docx_logs = [m for m in console_messages if 'DocxExport' in m]
            if docx_logs:
                print(f"✅ Found {len(docx_logs)} DocxExport console messages")
            else:
                print("⚠️ No DocxExport console messages captured")
            
            print("\n✅ Test complete")
            
            await asyncio.sleep(3)
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
            
            try:
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/charts_error.png")
                print("📸 charts_error.png")
            except:
                pass
                
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
