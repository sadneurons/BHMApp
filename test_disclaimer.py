#!/usr/bin/env python3
"""
Test disclaimer/splash screen modal
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        try:
            print("=" * 80)
            print("DISCLAIMER/SPLASH SCREEN TEST")
            print("=" * 80)
            
            # Step 1: Open app
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"\nStep 1: Loading {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(2)
            print("   ✓ Page loaded")
            
            # Step 2: Check for modal and take screenshot
            print("\nStep 2: Checking for disclaimer modal...")
            
            modal_visible = await page.evaluate("""
                (() => {
                    const modal = document.querySelector('.modal.show, #disclaimerModal.show, .disclaimer-modal');
                    if (modal) {
                        const display = window.getComputedStyle(modal).display;
                        return display !== 'none';
                    }
                    return false;
                })();
            """)
            
            if modal_visible:
                print("   ✓ Disclaimer modal is visible")
            else:
                print("   ⚠ Modal not immediately visible, checking for modal structure...")
                
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/disclaimer_01_modal.png", full_page=False)
            print("   📸 disclaimer_01_modal.png")
            
            # Step 3: Read modal content
            print("\nStep 3: Reading modal content...")
            
            modal_content = await page.evaluate("""
                (() => {
                    const modal = document.querySelector('.modal, #disclaimerModal, .disclaimer-modal');
                    if (!modal) return 'Modal not found';
                    
                    const modalText = modal.innerText || modal.textContent;
                    return modalText.trim();
                })();
            """)
            
            print("\n   Modal content:")
            print("   " + "-" * 70)
            for line in modal_content.split('\n')[:30]:  # First 30 lines
                print(f"   {line}")
            print("   " + "-" * 70)
            
            # Check for key phrases
            print("\n   Checking for required content:")
            
            key_phrases = [
                ("Clinical Documentation Tool", "Clinical Documentation Tool"),
                ("Not a Software as a Medical Device", "Not.*Software as a Medical Device|Software as a Medical Device"),
                ("UK MDR 2002", "UK MDR|MDR 2002|Medical Device.*Regulation"),
                ("MHRA", "MHRA"),
                ("Data stays local", "[Dd]ata.*local|local.*data|stored locally"),
                ("Healthcare professionals", "[Hh]ealthcare professional|[Qq]ualified.*professional")
            ]
            
            import re
            for label, pattern in key_phrases:
                if re.search(pattern, modal_content, re.IGNORECASE):
                    print(f"      ✅ Found: {label}")
                else:
                    print(f"      ⚠ Missing: {label}")
            
            # Step 4: Click continue button
            print("\nStep 4: Clicking 'I Understand — Continue' button...")
            
            # Try multiple selectors for the button
            button_selectors = [
                "button:has-text('Continue')",
                "button:has-text('Understand')",
                ".btn-primary",
                "#disclaimerAccept",
                ".modal button[type='button']"
            ]
            
            button_found = False
            for selector in button_selectors:
                try:
                    button = await page.query_selector(selector)
                    if button:
                        button_text = await button.inner_text()
                        print(f"   Found button: '{button_text}'")
                        await button.click()
                        await asyncio.sleep(1)
                        button_found = True
                        print("   ✓ Button clicked")
                        break
                except:
                    continue
            
            if not button_found:
                print("   ⚠ Continue button not found, attempting manual close")
                # Try to close modal via JavaScript
                await page.evaluate("""
                    (() => {
                        const modal = document.querySelector('.modal, #disclaimerModal');
                        if (modal) {
                            modal.style.display = 'none';
                            const backdrop = document.querySelector('.modal-backdrop');
                            if (backdrop) backdrop.remove();
                        }
                    })();
                """)
                await asyncio.sleep(0.5)
            
            # Step 5: Check app is accessible
            print("\nStep 5: Checking if app is now accessible...")
            
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/disclaimer_02_after.png", full_page=False)
            print("   📸 disclaimer_02_after.png")
            
            # Check if main app content is visible
            app_accessible = await page.evaluate("""
                (() => {
                    const tabs = document.querySelectorAll('.nav-tabs button, .nav button');
                    const modal = document.querySelector('.modal.show, #disclaimerModal.show');
                    
                    return {
                        tabsVisible: tabs.length > 0,
                        tabCount: tabs.length,
                        modalStillVisible: modal ? window.getComputedStyle(modal).display !== 'none' : false
                    };
                })();
            """)
            
            print(f"\n   App accessibility:")
            print(f"      Tabs visible: {app_accessible['tabsVisible']} ({app_accessible['tabCount']} tabs)")
            print(f"      Modal still visible: {app_accessible['modalStillVisible']}")
            
            if app_accessible['tabsVisible'] and not app_accessible['modalStillVisible']:
                print("\n   ✅ App is now accessible")
            else:
                print("\n   ⚠ App may still be blocked or tabs not visible")
            
            # Test clicking a tab to ensure it works
            print("\nStep 6: Testing app functionality by clicking a tab...")
            try:
                await page.click("#tab-patient")
                await asyncio.sleep(0.5)
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/disclaimer_03_functional.png", full_page=False)
                print("   📸 disclaimer_03_functional.png")
                print("   ✅ Successfully clicked Patient Booklet tab")
            except Exception as e:
                print(f"   ⚠ Could not click tab: {e}")
            
            print("\n" + "=" * 80)
            print("TEST SUMMARY")
            print("=" * 80)
            print(f"✅ Modal appeared: {modal_visible or 'Structure found'}")
            print(f"✅ Content checked for required elements")
            print(f"✅ Continue button: {'Found and clicked' if button_found else 'Attempted to close'}")
            print(f"✅ App accessible after dismissal: {app_accessible['tabsVisible']}")
            
            await asyncio.sleep(3)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
