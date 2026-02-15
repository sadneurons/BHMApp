#!/usr/bin/env python3
"""
Debug DOCX table export issue - capture ALL console output
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        # Capture ALL console messages with timestamps
        console_messages = []
        def handle_console(msg):
            text = msg.text
            console_messages.append(text)
            # Print in real-time
            print(f"   CONSOLE: {text}")
        
        page.on("console", handle_console)
        
        # Track downloads
        downloads = []
        page.on("download", lambda d: downloads.append(d))
        
        try:
            print("=" * 80)
            print("DOCX TABLE EXPORT DEBUG")
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
            
            # Step 3: Inject test data
            print("\n3. Injecting test data via console...")
            
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

                // MBI-C
                for(var i=1;i<=34;i++) BHM.State.set('instruments.mbiC.q'+i, i%4);
                BHM.Scoring.mbiC();

                // NPI-Q
                ['delusions','hallucinations','agitation','depression','anxiety','elation','apathy','disinhibition','irritability','aberrantMotor','sleep','appetite'].forEach(function(s,i){
                  BHM.State.set('instruments.npiQ.'+s+'_present','yes');
                  BHM.State.set('instruments.npiQ.'+s+'_severity', (i%3)+1);
                  BHM.State.set('instruments.npiQ.'+s+'_distress', (i%5)+1);
                });
                BHM.Scoring.npiQ();

                BHM.Report.update();
                console.log('=== Data injected ===');
            """
            
            await page.evaluate(test_script)
            await asyncio.sleep(1)
            print("   ✓ Data injected")
            
            # Step 4: Go to Report tab
            print("\n4. Opening Report tab...")
            await page.click("#tab-report")
            await asyncio.sleep(1)
            print("   ✓ Report opened")
            
            # Step 5: Wait for charts
            print("\n5. Waiting 3 seconds for charts to render...")
            await asyncio.sleep(3)
            print("   ✓ Charts rendered")
            
            # Step 6: Clear console
            print("\n6. Clearing console...")
            console_messages.clear()
            await page.evaluate("console.clear()")
            print("   ✓ Console cleared")
            
            # Step 7: Export to Word
            print("\n7. Clicking Export → 'Export Word (.docx)'...")
            await page.click("button[title='Export']")
            await asyncio.sleep(0.5)
            
            # Step 8: Click and wait for download
            print("\n8. Waiting for download...")
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
            
            # Step 9: Report console output
            print("\n" + "=" * 80)
            print("9. CONSOLE OUTPUT (ALL MESSAGES)")
            print("=" * 80)
            
            if console_messages:
                print(f"\n📋 Total messages: {len(console_messages)}\n")
                
                # Print all messages verbatim
                for i, msg in enumerate(console_messages, 1):
                    print(f"{i:3d}. {msg}")
                
                # Extract DocxExport messages
                docx_messages = [m for m in console_messages if 'DocxExport' in m]
                
                if docx_messages:
                    print("\n" + "=" * 80)
                    print(f"🔍 DOCXEXPORT MESSAGES ({len(docx_messages)})")
                    print("=" * 80)
                    for msg in docx_messages:
                        print(f"   {msg}")
                
                # Extract table-related messages
                table_messages = [m for m in console_messages if 'table' in m.lower() or 'children' in m.lower()]
                
                if table_messages:
                    print("\n" + "=" * 80)
                    print(f"📊 TABLE-RELATED MESSAGES ({len(table_messages)})")
                    print("=" * 80)
                    for msg in table_messages:
                        print(f"   {msg}")
                
                # Check for errors
                errors = [m for m in console_messages if 'error' in m.lower() or 'fail' in m.lower()]
                
                if errors:
                    print("\n" + "=" * 80)
                    print(f"⚠️ ERRORS ({len(errors)})")
                    print("=" * 80)
                    for msg in errors:
                        print(f"   {msg}")
                else:
                    print("\n✅ No error messages")
                    
            else:
                print("\n⚠️ No console messages captured")
            
            # Take screenshot of console
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/debug_console.png")
            print("\n📸 Screenshot saved: debug_console.png")
            
            await asyncio.sleep(2)
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
