#!/usr/bin/env python3
"""
Test web app for CSS issues across different URLs and themes
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
            text = f"[{msg.type}] {msg.text}"
            console_messages.append(text)
            print(f"   CONSOLE: {text}")
        
        page.on("console", handle_console)
        
        # Capture page errors
        page_errors = []
        def handle_page_error(error):
            page_errors.append(str(error))
            print(f"   PAGE ERROR: {error}")
        
        page.on("pageerror", handle_page_error)
        
        try:
            print("=" * 80)
            print("CSS ISSUES TEST")
            print("=" * 80)
            
            # Step 1: Navigate to src/index.html
            print("\n1. Navigating to http://localhost:8765/src/index.html...")
            try:
                await page.goto("http://localhost:8765/src/index.html", wait_until="domcontentloaded", timeout=10000)
                await asyncio.sleep(3)
                print("   ✓ Page loaded")
            except Exception as e:
                print(f"   ❌ Failed to load: {e}")
                await browser.close()
                return
            
            # Step 2: Screenshot initial state
            print("\n2. Taking screenshot of initial state...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/css_test_01_src_default.png", full_page=True)
            print("   📸 css_test_01_src_default.png")
            
            # Save console messages from initial load
            initial_console = console_messages.copy()
            
            # Step 3: Set Dracula theme
            print("\n3. Setting Dracula theme in localStorage...")
            await page.evaluate("localStorage.setItem('bhm-theme', 'dracula')")
            print("   ✓ Theme set to 'dracula'")
            
            # Step 4: Reload page
            print("\n4. Reloading page...")
            console_messages.clear()
            await page.reload(wait_until="domcontentloaded")
            await asyncio.sleep(3)
            print("   ✓ Page reloaded")
            
            # Step 5: Screenshot with Dracula theme
            print("\n5. Taking screenshot with Dracula theme...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/css_test_02_src_dracula.png", full_page=True)
            print("   📸 css_test_02_src_dracula.png")
            
            # Save console messages after reload
            reload_console = console_messages.copy()
            
            # Step 6: Check console for errors on src page
            print("\n6. Console messages for src/index.html:")
            print("=" * 80)
            
            print("\n   Initial load:")
            if initial_console:
                for msg in initial_console:
                    print(f"      {msg}")
            else:
                print("      (no messages)")
            
            print("\n   After reload with Dracula:")
            if reload_console:
                for msg in reload_console:
                    print(f"      {msg}")
            else:
                print("      (no messages)")
            
            # Analyze errors
            all_src_messages = initial_console + reload_console
            errors = [m for m in all_src_messages if '[error]' in m.lower() or 'error' in m.lower()]
            warnings = [m for m in all_src_messages if '[warning]' in m.lower() or 'warning' in m.lower()]
            
            if errors:
                print(f"\n   ⚠️ ERRORS ({len(errors)}):")
                for err in errors:
                    print(f"      {err}")
            
            if warnings:
                print(f"\n   ⚠️ WARNINGS ({len(warnings)}):")
                for warn in warnings:
                    print(f"      {warn}")
            
            if not errors and not warnings:
                print("\n   ✅ No errors or warnings")
            
            # Step 7: Navigate to dist/bhm-app.html
            print("\n7. Navigating to http://localhost:8765/dist/bhm-app.html...")
            console_messages.clear()
            page_errors.clear()
            
            try:
                await page.goto("http://localhost:8765/dist/bhm-app.html", wait_until="domcontentloaded", timeout=10000)
                await asyncio.sleep(3)
                print("   ✓ Page loaded")
            except Exception as e:
                print(f"   ❌ Failed to load: {e}")
                await browser.close()
                return
            
            # Step 8: Screenshot dist page
            print("\n8. Taking screenshot of dist/bhm-app.html...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/css_test_03_dist.png", full_page=True)
            print("   📸 css_test_03_dist.png")
            
            # Save console messages from dist page
            dist_console = console_messages.copy()
            
            # Step 9: Check console for errors on dist page
            print("\n9. Console messages for dist/bhm-app.html:")
            print("=" * 80)
            
            if dist_console:
                for msg in dist_console:
                    print(f"      {msg}")
            else:
                print("      (no messages)")
            
            # Analyze errors
            dist_errors = [m for m in dist_console if '[error]' in m.lower() or 'error' in m.lower()]
            dist_warnings = [m for m in dist_console if '[warning]' in m.lower() or 'warning' in m.lower()]
            
            if dist_errors:
                print(f"\n   ⚠️ ERRORS ({len(dist_errors)}):")
                for err in dist_errors:
                    print(f"      {err}")
            
            if dist_warnings:
                print(f"\n   ⚠️ WARNINGS ({len(dist_warnings)}):")
                for warn in dist_warnings:
                    print(f"      {warn}")
            
            if not dist_errors and not dist_warnings:
                print("\n   ✅ No errors or warnings")
            
            # Summary
            print("\n" + "=" * 80)
            print("SUMMARY")
            print("=" * 80)
            
            print(f"\n📸 Screenshots captured:")
            print(f"   1. css_test_01_src_default.png - src/index.html (default theme)")
            print(f"   2. css_test_02_src_dracula.png - src/index.html (Dracula theme)")
            print(f"   3. css_test_03_dist.png - dist/bhm-app.html")
            
            print(f"\n📊 Console messages:")
            print(f"   src/index.html (initial): {len(initial_console)} messages")
            print(f"   src/index.html (reload): {len(reload_console)} messages")
            print(f"   dist/bhm-app.html: {len(dist_console)} messages")
            
            print(f"\n⚠️ Issues found:")
            total_errors = len(errors) + len(dist_errors)
            total_warnings = len(warnings) + len(dist_warnings)
            print(f"   Total errors: {total_errors}")
            print(f"   Total warnings: {total_warnings}")
            
            if page_errors:
                print(f"\n❌ Page errors: {len(page_errors)}")
                for err in page_errors:
                    print(f"   {err}")
            else:
                print(f"\n✅ No page errors")
            
            await asyncio.sleep(3)
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
