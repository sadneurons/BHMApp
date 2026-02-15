#!/usr/bin/env python3
"""
Test BHM Assessment App DOCX export feature
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        # Track downloads
        downloads = []
        page.on("download", lambda download: downloads.append(download))
        
        # Track console messages
        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        
        try:
            print("=" * 80)
            print("BHM ASSESSMENT APP - DOCX EXPORT TEST")
            print("=" * 80)
            
            # Step 1: Navigate to app
            print("\n1. Loading app...")
            await page.goto("file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html", wait_until="domcontentloaded", timeout=60000)
            await asyncio.sleep(3)
            print("   ✓ App loaded")
            
            # Step 2: Dismiss disclaimer
            print("\n2. Dismissing disclaimer...")
            try:
                await page.click("button:has-text('Continue')", timeout=5000)
                await asyncio.sleep(1)
                print("   ✓ Disclaimer dismissed")
            except Exception as e:
                print(f"   ℹ️ No disclaimer or already dismissed: {e}")
            
            # Step 3: Check for Export dropdown
            print("\n3. Checking for Export dropdown...")
            
            # Look for Export button/dropdown
            export_btn = await page.query_selector("button:has-text('Export'), a:has-text('Export'), .dropdown-toggle:has-text('Export')")
            
            if export_btn:
                print("   ✓ Found Export button/dropdown")
                
                # Take screenshot before clicking
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/docx_01_export_button.png")
                print("   📸 docx_01_export_button.png")
                
                # Click to open dropdown
                await export_btn.click()
                await asyncio.sleep(0.5)
                
                # Take screenshot of dropdown menu
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/docx_02_export_dropdown.png")
                print("   📸 docx_02_export_dropdown.png")
                
                # Check for Word option
                word_option = await page.query_selector("text=/Export Word|Word.*docx|\.docx/i")
                if word_option:
                    print("   ✅ Found 'Export Word (.docx)' option")
                else:
                    print("   ⚠️ Word export option not found in dropdown")
                    
                    # List all dropdown items
                    dropdown_items = await page.evaluate("""
                        Array.from(document.querySelectorAll('.dropdown-menu a, .dropdown-menu button'))
                            .map(el => el.textContent.trim())
                    """)
                    print(f"   Available options: {dropdown_items}")
            else:
                print("   ❌ Export button/dropdown not found")
                
                # Check navbar for any export-related elements
                navbar_text = await page.evaluate("document.querySelector('.navbar')?.innerText || 'No navbar found'")
                print(f"   Navbar content: {navbar_text[:200]}")
            
            # Step 4: Fill in patient data
            print("\n4. Filling in patient data...")
            
            # Click Session tab
            session_tab = await page.query_selector("#tab-session, a:has-text('Session'), button:has-text('Session')")
            if session_tab:
                await session_tab.click()
                await asyncio.sleep(0.5)
                print("   ✓ Clicked Session tab")
            
            # Fill in patient name
            name_input = await page.query_selector("input[name='patientName'], #patientName, input[placeholder*='name' i]")
            if name_input:
                await name_input.fill("John Smith")
                print("   ✓ Filled patient name: John Smith")
            else:
                print("   ⚠️ Patient name input not found")
            
            # Fill in DOB
            dob_input = await page.query_selector("input[name='dob'], #dob, input[type='date']")
            if dob_input:
                await dob_input.fill("1950-01-01")
                print("   ✓ Filled DOB: 01/01/1950")
            else:
                print("   ⚠️ DOB input not found")
            
            # Fill in NHS Number
            nhs_input = await page.query_selector("input[name='nhsNumber'], #nhsNumber, input[placeholder*='NHS' i]")
            if nhs_input:
                await nhs_input.fill("123 456 7890")
                print("   ✓ Filled NHS Number: 123 456 7890")
            else:
                print("   ⚠️ NHS Number input not found")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/docx_03_patient_data.png")
            print("   📸 docx_03_patient_data.png")
            
            # Step 5: Click Report tab
            print("\n5. Opening Report tab...")
            report_tab = await page.query_selector("#tab-report, a:has-text('Report'), button:has-text('Report')")
            if report_tab:
                await report_tab.click()
                await asyncio.sleep(1)
                print("   ✓ Report tab opened")
                
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/docx_04_report_view.png")
                print("   📸 docx_04_report_view.png")
            else:
                print("   ⚠️ Report tab not found")
            
            # Step 6: Take screenshot of Export dropdown with Word option
            print("\n6. Taking screenshot of Export dropdown...")
            
            # Re-open dropdown if needed
            export_btn = await page.query_selector("button:has-text('Export'), a:has-text('Export'), .dropdown-toggle:has-text('Export')")
            if export_btn:
                await export_btn.click()
                await asyncio.sleep(0.5)
                
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/docx_05_export_menu.png")
                print("   📸 docx_05_export_menu.png - Export menu with Word option")
            
            # Step 7: Click Export Word (.docx)
            print("\n7. Clicking 'Export Word (.docx)'...")
            
            word_option = await page.query_selector("text=/Export Word|Word.*docx|\.docx/i")
            if word_option:
                # Set up download listener
                async with page.expect_download(timeout=10000) as download_info:
                    await word_option.click()
                    print("   ✓ Clicked 'Export Word (.docx)'")
                
                download = await download_info.value
                print(f"   ✅ Download started!")
                print(f"      Filename: {download.suggested_filename}")
                print(f"      Path: {await download.path()}")
                
                # Save to Desktop
                save_path = f"/home/tenebris/Desktop/{download.suggested_filename}"
                await download.save_as(save_path)
                print(f"   ✅ File saved to: {save_path}")
                
            else:
                print("   ❌ Could not find 'Export Word (.docx)' option")
                
                # Try alternative selectors
                alternatives = [
                    "a:has-text('Word')",
                    "button:has-text('Word')",
                    "[data-export='docx']",
                    ".export-docx"
                ]
                
                for selector in alternatives:
                    element = await page.query_selector(selector)
                    if element:
                        print(f"   Found alternative: {selector}")
                        await element.click()
                        await asyncio.sleep(2)
                        break
            
            await asyncio.sleep(2)
            
            # Step 8: Check console for errors
            print("\n8. Checking browser console...")
            
            if console_messages:
                print(f"   Found {len(console_messages)} console messages:")
                for msg in console_messages[-20:]:  # Last 20 messages
                    print(f"      {msg}")
            else:
                print("   ℹ️ No console messages captured")
            
            # Check for errors specifically
            errors = [msg for msg in console_messages if '[error]' in msg.lower() or 'error' in msg.lower()]
            if errors:
                print(f"\n   ⚠️ ERRORS FOUND:")
                for err in errors:
                    print(f"      {err}")
            else:
                print("   ✅ No JavaScript errors detected")
            
            # Final screenshot
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/docx_06_final_state.png")
            print("\n   📸 docx_06_final_state.png - Final state")
            
            # Summary
            print("\n" + "=" * 80)
            print("SUMMARY")
            print("=" * 80)
            
            if downloads:
                print(f"✅ DOCX export successful - {len(downloads)} file(s) downloaded")
            else:
                print("⚠️ No file download detected")
            
            if errors:
                print(f"⚠️ {len(errors)} JavaScript error(s) found")
            else:
                print("✅ No JavaScript errors")
            
            print("\n✅ Test complete")
            
            await asyncio.sleep(2)
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
            
            # Take error screenshot
            try:
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/docx_error.png")
                print("📸 docx_error.png - Error state captured")
            except:
                pass
                
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
