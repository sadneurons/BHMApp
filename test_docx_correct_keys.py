#!/usr/bin/env python3
"""
Test DOCX export with correct state key names
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
            print("DOCX EXPORT TEST - CORRECT STATE KEYS")
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
            
            # Step 3: Fill patient name
            print("\n3. Filling patient name...")
            await page.fill("input[placeholder*='shown on booklet']", "TableTest2")
            print("   ✓ Patient Name: TableTest2")
            
            # Step 4: Inject data with CORRECT keys
            print("\n4. Injecting data with CORRECT state keys...")
            
            inject_script = """
                // PSQI with correct keys
                BHM.State.set('instruments.psqi.q1_bedtime', '23:00');
                BHM.State.set('instruments.psqi.q2_latency_min', '30');
                BHM.State.set('instruments.psqi.q3_waketime', '06:30');
                BHM.State.set('instruments.psqi.q4_sleep_hours', '6.5');
                BHM.State.set('instruments.psqi.q5a', 2);
                BHM.State.set('instruments.psqi.q5b', 1);
                BHM.State.set('instruments.psqi.q5c', 3);
                BHM.State.set('instruments.psqi.q5d', 0);
                BHM.State.set('instruments.psqi.q5e', 1);
                BHM.State.set('instruments.psqi.q5f', 2);
                BHM.State.set('instruments.psqi.q5g', 1);
                BHM.State.set('instruments.psqi.q5h', 0);
                BHM.State.set('instruments.psqi.q5i', 2);
                BHM.State.set('instruments.psqi.q5j', 1);
                BHM.State.set('instruments.psqi.q6_medication', 2);
                BHM.State.set('instruments.psqi.q7_drowsiness', 1);
                BHM.State.set('instruments.psqi.q8_enthusiasm', 2);
                BHM.State.set('instruments.psqi.q9_quality', 2);
                BHM.Scoring.psqi();

                // GAD-7 with correct keys
                BHM.State.set('instruments.gad7.g1', 2);
                BHM.State.set('instruments.gad7.g2', 1);
                BHM.State.set('instruments.gad7.g3', 3);
                BHM.State.set('instruments.gad7.g4', 1);
                BHM.State.set('instruments.gad7.g5', 2);
                BHM.State.set('instruments.gad7.g6', 1);
                BHM.State.set('instruments.gad7.g7', 2);
                BHM.State.set('instruments.gad7.impairment', 'somewhat');
                BHM.Scoring.gad7();

                // Check scores
                console.log('PSQI score:', JSON.stringify(BHM.State.getScore('psqi')));
                console.log('GAD-7 score:', JSON.stringify(BHM.State.getScore('gad7')));
            """
            
            await page.evaluate(inject_script)
            await asyncio.sleep(1)
            print("   ✓ Data injected")
            
            # Step 5: Check console for score values
            print("\n5. Checking score values from console...")
            score_messages = [m for m in console_messages if 'score:' in m.lower()]
            if score_messages:
                for msg in score_messages:
                    print(f"   {msg}")
            else:
                print("   ⚠️ No score messages found")
            
            # Step 6: Go to Report tab
            print("\n6. Opening Report tab and waiting 3 seconds...")
            await page.click("#tab-report")
            await asyncio.sleep(3)
            print("   ✓ Report tab active")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/correct_keys_01_report.png")
            print("   📸 correct_keys_01_report.png")
            
            # Step 7: Check for tables in report
            print("\n7. Checking for tables in report...")
            
            table_check_script = """
                var tables = document.querySelectorAll('#reportFullContent table');
                console.log('Tables in report:', tables.length);
                for(var i=0; i<Math.min(tables.length,5); i++) {
                  var t = tables[i];
                  console.log('  Table '+i+':', t.querySelectorAll('tr').length, 'rows');
                }
            """
            
            await page.evaluate(table_check_script)
            await asyncio.sleep(1)
            
            # Get table count from console
            table_count_msgs = [m for m in console_messages if 'Tables in report:' in m]
            table_count = 0
            if table_count_msgs:
                try:
                    table_count = int(table_count_msgs[-1].split(':')[-1].strip())
                except:
                    pass
            
            print(f"   📊 Tables found: {table_count}")
            
            # Step 8: Export if tables exist
            if table_count > 0:
                print(f"\n8. Tables exist ({table_count}), exporting to Word...")
                
                # Clear console messages
                console_messages.clear()
                
                # Open dropdown
                await page.click("button[title='Export']")
                await asyncio.sleep(0.5)
                
                # Click and wait for download
                try:
                    async with page.expect_download(timeout=20000) as download_info:
                        await page.click("#exportDocx")
                        print("   ✓ Clicked Export Word")
                        
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
            else:
                print(f"\n8. No tables found ({table_count}), skipping export")
                file_size = 0
            
            # Step 9: Report results
            print("\n" + "=" * 80)
            print("RESULTS")
            print("=" * 80)
            
            # Extract score values
            psqi_score_msg = [m for m in console_messages if 'PSQI score:' in m]
            gad7_score_msg = [m for m in console_messages if 'GAD-7 score:' in m]
            
            print("\n📊 Score Values:")
            if psqi_score_msg:
                print(f"   PSQI: {psqi_score_msg[0].split(':', 1)[1].strip()}")
            else:
                print("   PSQI: Not found in console")
            
            if gad7_score_msg:
                print(f"   GAD-7: {gad7_score_msg[0].split(':', 1)[1].strip()}")
            else:
                print("   GAD-7: Not found in console")
            
            print(f"\n📊 Table Count: {table_count}")
            
            if file_size > 0:
                print(f"\n📄 Downloaded File:")
                print(f"   Size: {file_size:,} bytes ({file_size/1024:.1f} KB)")
            else:
                print(f"\n📄 No file downloaded (no tables to export)")
            
            # Check for errors
            errors = [m for m in console_messages if 'error' in m.lower()]
            if errors:
                print(f"\n⚠️ Errors ({len(errors)}):")
                for err in errors:
                    print(f"   {err}")
            else:
                print("\n✅ No errors")
            
            await asyncio.sleep(2)
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
