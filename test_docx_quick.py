#!/usr/bin/env python3
"""
Quick DOCX export test - font table fix verification
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        # Capture console messages
        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        
        # Track downloads
        downloads = []
        page.on("download", lambda d: downloads.append(d))
        
        try:
            print("QUICK DOCX EXPORT TEST - Font Table Fix")
            print("=" * 60)
            
            # Step 1: Load
            print("\n1. Loading app...")
            await page.goto("file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html", wait_until="domcontentloaded", timeout=60000)
            await asyncio.sleep(2)
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
            await page.fill("input[placeholder*='shown on booklet']", "FontTest")
            print("   ✓ Patient Name: FontTest")
            
            # Step 4: Go to Report tab
            print("\n4. Opening Report tab...")
            await page.click("#tab-report")
            await asyncio.sleep(1)
            print("   ✓ Report opened")
            
            # Step 5: Export to Word
            print("\n5. Exporting to Word...")
            await page.click("button[title='Export']")
            await asyncio.sleep(0.5)
            
            # Step 6: Wait for download
            print("\n6. Waiting for download...")
            try:
                async with page.expect_download(timeout=15000) as download_info:
                    await page.click("#exportDocx")
                    await asyncio.sleep(2)
                
                download = await download_info.value
                print(f"   ✅ Downloaded!")
                
                save_path = f"/home/tenebris/Desktop/{download.suggested_filename}"
                await download.save_as(save_path)
                
                # Get file size
                import os
                file_size = os.path.getsize(save_path)
                
                print(f"\n   📄 Filename: {download.suggested_filename}")
                print(f"   📊 File size: {file_size:,} bytes ({file_size/1024:.1f} KB)")
                
            except Exception as e:
                print(f"   ❌ Download error: {e}")
                file_size = 0
            
            # Check for errors
            errors = [m for m in console_messages if 'error' in m.lower()]
            if errors:
                print(f"\n⚠️ Console errors ({len(errors)}):")
                for err in errors:
                    print(f"   {err}")
            else:
                print("\n✅ No console errors")
            
            # Summary
            print("\n" + "=" * 60)
            if downloads:
                print(f"✅ SUCCESS")
                print(f"   File: {downloads[0].suggested_filename}")
                print(f"   Size: {file_size:,} bytes ({file_size/1024:.1f} KB)")
            else:
                print("❌ FAILED - No download")
            
            await asyncio.sleep(2)
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
