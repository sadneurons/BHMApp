#!/usr/bin/env python3
"""
Test DOCX table export fix - verify tables are captured
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
            console_messages.append(text)
            print(f"   CONSOLE: {text}")
        
        page.on("console", handle_console)
        
        # Track downloads
        downloads = []
        page.on("download", lambda d: downloads.append(d))
        
        try:
            print("=" * 80)
            print("DOCX TABLE EXPORT FIX TEST")
            print("=" * 80)
            
            # Step 1: Load
            print("\n1. Loading app...")
            await page.goto("file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html", wait_until="domcontentloaded", timeout=60000)
            await asyncio.sleep(3)
            print("   ✓ Loaded")
            
            # Step 2: Dismiss disclaimer
            print("\n2. Dismissing disclaimer...")
            try:
                await page.click("button:has-text('Continue')", timeout=3000)
                await asyncio.sleep(1)
                print("   ✓ Dismissed")
            except:
                print("   ℹ️ No disclaimer")
            
            # Step 3: Fill Session data
            print("\n3. Filling Session tab...")
            await page.fill("input[placeholder*='shown on booklet']", "TableTest")
            await page.fill("input[type='date']", "1960-01-01")
            print("   ✓ Patient Name: TableTest")
            print("   ✓ DOB: 01/01/1960")
            
            # Step 4: Inject test data
            print("\n4. Injecting test data via console...")
            
            test_script = """
                // PSQI
                BHM.State.set('instruments.psqi.q1', '23:00');
                BHM.State.set('instruments.psqi.q2', '30');
                BHM.State.set('instruments.psqi.q3', '06:30');
                BHM.State.set('instruments.psqi.q4', '6.5');
                ['a','b','c','d','e','f','g','h','i','j'].forEach(function(l,i){ BHM.State.set('instruments.psqi.q5'+l, i%4); });
                BHM.State.set('instruments.psqi.q6', 2);
                BHM.State.set('instruments.psqi.q7', 1);
                BHM.State.set('instruments.psqi.q8', 2);
                BHM.State.set('instruments.psqi.q9', 1);
                BHM.Scoring.psqi();

                // GAD-7
                for(var i=1;i<=7;i++) BHM.State.set('instruments.gad7.q'+i, i%4);
                BHM.Scoring.gad7();

                BHM.Report.update();
                console.log('✓ Data injected and report updated');
            """
            
            await page.evaluate(test_script)
            await asyncio.sleep(1)
            print("   ✓ Data injected")
            
            # Step 5: IMPORTANT - Click Report tab and wait
            print("\n5. Clicking Report tab and waiting 3 seconds...")
            await page.click("#tab-report")
            await asyncio.sleep(3)
            print("   ✓ Report tab active (STAYING ON THIS TAB)")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/tables_01_report_view.png")
            print("   📸 tables_01_report_view.png")
            
            # Step 6: IMPORTANT - Verify tables exist in DOM
            print("\n6. Verifying tables exist in DOM...")
            
            verify_script = """
                var tables = document.querySelectorAll('#reportFullContent table');
                console.log('Tables in report DOM:', tables.length);
                tables.forEach(function(t,i){ 
                    console.log('  Table '+i+':', t.querySelectorAll('tr').length, 'rows, first cell:', t.querySelector('th,td')?.textContent?.substring(0,30)); 
                });
            """
            
            await page.evaluate(verify_script)
            await asyncio.sleep(1)
            
            # Step 7: Screenshot console output
            print("\n7. Taking screenshot of console output...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/tables_02_console_verify.png")
            print("   📸 tables_02_console_verify.png")
            
            # Step 8: Export to Word (WHILE STAYING ON REPORT TAB)
            print("\n8. Exporting to Word (staying on Report tab)...")
            
            # Clear console messages to focus on export
            console_messages.clear()
            
            # Open dropdown
            await page.click("button[title='Export']")
            await asyncio.sleep(0.5)
            
            # Step 9: Click and wait for download
            print("\n9. Waiting for download...")
            try:
                async with page.expect_download(timeout=20000) as download_info:
                    await page.click("#exportDocx")
                    print("   ✓ Clicked Export Word")
                    
                    # Wait for export to complete
                    await asyncio.sleep(5)
                
                download = await download_info.value
                print(f"   ✅ Downloaded: {download.suggested_filename}")
                
                save_path = f"/home/tenebris/Desktop/{download.suggested_filename}"
                await download.save_as(save_path)
                
                import os
                file_size = os.path.getsize(save_path)
                print(f"   📊 File size: {file_size:,} bytes ({file_size/1024:.1f} KB)")
                
            except Exception as e:
                print(f"   ⚠️ Download error: {e}")
                file_size = 0
            
            # Step 10: Check console for errors
            print("\n10. Checking console output...")
            print("=" * 80)
            
            if console_messages:
                print(f"\n📋 Console messages during export ({len(console_messages)}):\n")
                
                for msg in console_messages:
                    print(f"   {msg}")
                
                # Check for table capture
                table_msgs = [m for m in console_messages if 'table' in m.lower()]
                if table_msgs:
                    print(f"\n🔍 Table-related messages:")
                    for msg in table_msgs:
                        print(f"   {msg}")
                
                # Check for errors
                errors = [m for m in console_messages if 'error' in m.lower()]
                if errors:
                    print(f"\n⚠️ Errors:")
                    for err in errors:
                        print(f"   {err}")
                else:
                    print("\n✅ No errors")
                    
            else:
                print("\n⚠️ No console messages captured during export")
            
            # Summary
            print("\n" + "=" * 80)
            print("SUMMARY")
            print("=" * 80)
            
            if downloads:
                print(f"✅ File downloaded: {downloads[0].suggested_filename}")
                print(f"   Size: {file_size:,} bytes ({file_size/1024:.1f} KB)")
            else:
                print("❌ No file downloaded")
            
            # Check if tables were captured
            table_capture_msgs = [m for m in console_messages if 'captured' in m.lower() and 'table' in m.lower()]
            if table_capture_msgs:
                print(f"\n📊 Table capture status:")
                for msg in table_capture_msgs:
                    print(f"   {msg}")
            
            print("\n✅ Test complete")
            
            await asyncio.sleep(3)
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
