#!/usr/bin/env python3
"""
Simple DOCX export test
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        console_logs = []
        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        
        downloads = []
        page.on("download", lambda d: downloads.append(d))
        
        try:
            print("DOCX EXPORT TEST")
            print("=" * 80)
            
            # Load
            print("\n1. Loading app...")
            await page.goto("file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html", wait_until="domcontentloaded", timeout=60000)
            await asyncio.sleep(3)
            
            # Dismiss disclaimer
            print("2. Dismissing disclaimer...")
            try:
                await page.click("button:has-text('Continue')", timeout=3000)
                await asyncio.sleep(1)
            except:
                pass
            
            # Screenshot navbar
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/docx_test_01_navbar.png")
            print("   📸 docx_test_01_navbar.png")
            
            # Fill patient data
            print("\n3. Filling patient data...")
            await page.fill("input[placeholder*='shown on booklet']", "John Smith")
            await page.fill("input[type='date']", "1950-01-01")
            await page.fill("input[placeholder*='Optional']", "123 456 7890")
            print("   ✓ Patient data filled")
            
            # Go to Report tab
            print("\n4. Opening Report tab...")
            await page.click("#tab-report")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/docx_test_02_report.png")
            print("   📸 docx_test_02_report.png")
            
            # Click Export dropdown button (download icon)
            print("\n5. Opening Export dropdown...")
            await page.click("button[title='Export']")
            await asyncio.sleep(0.5)
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/docx_test_03_dropdown.png")
            print("   📸 docx_test_03_dropdown.png - Export dropdown menu")
            
            # Check if Word option is visible
            word_visible = await page.is_visible("#exportDocx")
            print(f"   Export Word (.docx) visible: {word_visible}")
            
            # Click Export Word
            print("\n6. Clicking 'Export Word (.docx)'...")
            
            # Wait for download
            try:
                async with page.expect_download(timeout=10000) as download_info:
                    await page.click("#exportDocx")
                    print("   ✓ Clicked Export Word")
                
                download = await download_info.value
                print(f"   ✅ Download started!")
                print(f"      Filename: {download.suggested_filename}")
                
                save_path = f"/home/tenebris/Desktop/{download.suggested_filename}"
                await download.save_as(save_path)
                print(f"   ✅ Saved to: {save_path}")
                
            except Exception as e:
                print(f"   ⚠️ No download or error: {e}")
                
                # Take screenshot of state
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/docx_test_04_after_click.png")
                print("   📸 docx_test_04_after_click.png")
            
            await asyncio.sleep(2)
            
            # Check console
            print("\n7. Console messages:")
            if console_logs:
                for log in console_logs[-15:]:
                    print(f"   {log}")
            else:
                print("   (none)")
            
            errors = [l for l in console_logs if 'error' in l.lower()]
            if errors:
                print(f"\n   ⚠️ {len(errors)} error(s) found:")
                for err in errors:
                    print(f"      {err}")
            else:
                print("   ✅ No errors")
            
            print("\n" + "=" * 80)
            if downloads:
                print(f"✅ SUCCESS - {len(downloads)} file(s) downloaded")
            else:
                print("⚠️ No download detected")
            
            await asyncio.sleep(2)
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
