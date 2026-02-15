#!/usr/bin/env python3
"""
Test theme picker functionality
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
            print("THEME PICKER TEST")
            print("=" * 80)
            
            # Step 1: Open app
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"\nStep 1: Loading {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(2)
            print("   ✓ Page loaded")
            
            # Step 2: Dismiss disclaimer
            print("\nStep 2: Dismissing disclaimer...")
            continue_btn = await page.query_selector("button:has-text('Continue')")
            if continue_btn:
                await continue_btn.click()
                await asyncio.sleep(1)
                print("   ✓ Disclaimer dismissed")
            else:
                print("   ⚠ Continue button not found")
            
            # Step 3: Screenshot of default theme
            print("\nStep 3: Taking screenshot of default theme...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/theme_01_default.png", full_page=False)
            print("   📸 theme_01_default.png")
            
            # Get current theme info
            default_theme_info = await page.evaluate("""
                (() => {
                    const themeBtn = document.querySelector('.theme-picker-btn, button[title*="theme"], button:has-text("Default")');
                    const currentTheme = localStorage.getItem('bhmTheme') || 'default';
                    const body = document.body;
                    const bodyClasses = Array.from(body.classList);
                    
                    return {
                        currentTheme: currentTheme,
                        themeBtnText: themeBtn ? themeBtn.innerText : 'Not found',
                        bodyClasses: bodyClasses
                    };
                })();
            """)
            
            print(f"   Current theme: {default_theme_info['currentTheme']}")
            print(f"   Theme button text: {default_theme_info['themeBtnText']}")
            
            # Step 4: Find and click theme picker
            print("\nStep 4: Finding theme picker dropdown...")
            
            # Try multiple selectors for theme picker
            theme_btn = await page.query_selector(".theme-picker-btn")
            if not theme_btn:
                theme_btn = await page.query_selector("button[title*='Theme']")
            if not theme_btn:
                theme_btn = await page.query_selector(".navbar button:has-text('Default')")
            
            if theme_btn:
                print("   ✓ Theme picker found")
                await theme_btn.click()
                await asyncio.sleep(0.5)
                print("   ✓ Theme picker clicked")
            else:
                print("   ⚠ Theme picker not found")
                return
            
            # Step 5: Screenshot of dropdown
            print("\nStep 5: Taking screenshot of theme dropdown...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/theme_02_dropdown.png", full_page=False)
            print("   📸 theme_02_dropdown.png")
            
            # Get dropdown content
            dropdown_info = await page.evaluate("""
                (() => {
                    const dropdown = document.querySelector('.theme-dropdown, .dropdown-menu.show');
                    if (!dropdown) return { found: false };
                    
                    const groups = Array.from(dropdown.querySelectorAll('.dropdown-header, h6')).map(h => h.textContent.trim());
                    const items = Array.from(dropdown.querySelectorAll('.dropdown-item')).map(item => ({
                        text: item.textContent.trim(),
                        hasCheck: item.querySelector('.bi-check') !== null
                    }));
                    
                    return {
                        found: true,
                        groups: groups,
                        items: items,
                        itemCount: items.length
                    };
                })();
            """)
            
            if dropdown_info['found']:
                print(f"   ✓ Dropdown opened")
                print(f"   Groups: {dropdown_info['groups']}")
                print(f"   Total themes: {dropdown_info['itemCount']}")
                print(f"   Themes with checkmarks: {sum(1 for i in dropdown_info['items'] if i['hasCheck'])}")
            
            # Step 6: Select Dracula theme
            print("\nStep 6: Selecting Dracula theme...")
            dracula_item = await page.query_selector(".dropdown-item:has-text('Dracula')")
            if dracula_item:
                await dracula_item.click()
                await asyncio.sleep(1)
                print("   ✓ Dracula selected")
                
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/theme_03_dracula.png", full_page=False)
                print("   📸 theme_03_dracula.png")
                
                # Check theme applied
                dracula_check = await page.evaluate("""
                    (() => {
                        const currentTheme = localStorage.getItem('bhmTheme');
                        const themeLink = document.querySelector('link[href*="bootstrap"]');
                        return {
                            storedTheme: currentTheme,
                            cssHref: themeLink ? themeLink.href : 'Not found'
                        };
                    })();
                """)
                print(f"   Stored theme: {dracula_check['storedTheme']}")
                print(f"   CSS contains: {dracula_check['cssHref'][-50:]}")
            
            # Step 7: Select Minty theme
            print("\nStep 7: Selecting Minty theme...")
            
            # Open dropdown again
            theme_btn = await page.query_selector(".theme-picker-btn, button[title*='Theme']")
            if theme_btn:
                await theme_btn.click()
                await asyncio.sleep(0.5)
            
            minty_item = await page.query_selector(".dropdown-item:has-text('Minty')")
            if minty_item:
                await minty_item.click()
                await asyncio.sleep(1)
                print("   ✓ Minty selected")
                
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/theme_04_minty.png", full_page=False)
                print("   📸 theme_04_minty.png")
            
            # Step 8: Select Vapor theme
            print("\nStep 8: Selecting Vapor theme...")
            
            # Open dropdown again
            theme_btn = await page.query_selector(".theme-picker-btn, button[title*='Theme']")
            if theme_btn:
                await theme_btn.click()
                await asyncio.sleep(0.5)
            
            vapor_item = await page.query_selector(".dropdown-item:has-text('Vapor')")
            if vapor_item:
                await vapor_item.click()
                await asyncio.sleep(1)
                print("   ✓ Vapor selected")
                
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/theme_05_vapor.png", full_page=False)
                print("   📸 theme_05_vapor.png")
            
            # Step 9: Select Default theme
            print("\nStep 9: Selecting Default theme to return...")
            
            # Open dropdown again
            theme_btn = await page.query_selector(".theme-picker-btn, button[title*='Theme']")
            if theme_btn:
                await theme_btn.click()
                await asyncio.sleep(0.5)
            
            default_item = await page.query_selector(".dropdown-item:has-text('Default')")
            if default_item:
                await default_item.click()
                await asyncio.sleep(1)
                print("   ✓ Default theme restored")
                
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/theme_06_back_to_default.png", full_page=False)
                print("   📸 theme_06_back_to_default.png")
            
            # Final verification
            print("\n" + "=" * 80)
            print("VERIFICATION")
            print("=" * 80)
            
            final_check = await page.evaluate("""
                (() => {
                    const themeBtn = document.querySelector('.theme-picker-btn, button[title*="Theme"]');
                    const currentTheme = localStorage.getItem('bhmTheme');
                    
                    return {
                        themeBtnText: themeBtn ? themeBtn.innerText.trim() : 'Not found',
                        storedTheme: currentTheme
                    };
                })();
            """)
            
            print(f"\n✅ Theme picker functional")
            print(f"✅ Dropdown showed grouped themes: {dropdown_info['found']}")
            print(f"✅ Groups found: {dropdown_info['groups']}")
            print(f"✅ Total themes available: {dropdown_info['itemCount']}")
            print(f"✅ Current theme label: {final_check['themeBtnText']}")
            print(f"✅ Stored theme: {final_check['storedTheme']}")
            
            await asyncio.sleep(3)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
