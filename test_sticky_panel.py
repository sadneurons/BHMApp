#!/usr/bin/env python3
"""
Demonstrate sticky snippet panel behavior
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
            print("STICKY SNIPPET PANEL DEMONSTRATION")
            print("=" * 80)
            
            # Step 1: Open BHM app
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"\nStep 1: Loading {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(2)
            print("   ✓ Page loaded")
            
            # Step 2: Click Report tab
            print("\nStep 2: Clicking Report tab...")
            await page.click("#tab-report")
            await asyncio.sleep(2)
            print("   ✓ Report tab opened")
            
            # Step 3: Take initial screenshot
            print("\nStep 3: Taking screenshot of initial state...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/sticky_panel_01_initial.png", full_page=False)
            print("   📸 sticky_panel_01_initial.png")
            print("   - Snippet panel visible on LEFT")
            print("   - Report content on RIGHT")
            print("   - Panel at top of page")
            
            # Check panel position
            panel_info = await page.evaluate("""
                (() => {
                    const panel = document.querySelector('.snippet-panel');
                    if (!panel) return 'Panel not found';
                    
                    const computed = window.getComputedStyle(panel);
                    const rect = panel.getBoundingClientRect();
                    
                    return {
                        position: computed.position,
                        top: computed.top,
                        left: computed.left,
                        width: computed.width,
                        rectTop: rect.top,
                        rectLeft: rect.left
                    };
                })();
            """)
            
            print(f"\n   Panel CSS properties:")
            print(f"      Position: {panel_info.get('position', 'unknown')}")
            print(f"      Top: {panel_info.get('top', 'unknown')}")
            print(f"      Left: {panel_info.get('left', 'unknown')}")
            print(f"      Width: {panel_info.get('width', 'unknown')}")
            
            # Step 4: Scroll down significantly
            print("\nStep 4: Scrolling down significantly in the report...")
            print("   Scrolling past Sleep, Mood, Alcohol sections...")
            
            # Scroll in increments to show progression
            for i in range(1, 6):
                scroll_amount = i * 400
                await page.evaluate(f"window.scrollTo(0, {scroll_amount})")
                await asyncio.sleep(0.3)
                
                if i == 5:
                    print(f"   ✓ Scrolled to {scroll_amount}px")
            
            await asyncio.sleep(1)
            
            # Step 5: Take screenshot after scrolling
            print("\nStep 5: Taking screenshot after scrolling...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/sticky_panel_02_scrolled.png", full_page=False)
            print("   📸 sticky_panel_02_scrolled.png")
            
            # Check panel position after scrolling
            panel_info_scrolled = await page.evaluate("""
                (() => {
                    const panel = document.querySelector('.snippet-panel');
                    if (!panel) return 'Panel not found';
                    
                    const computed = window.getComputedStyle(panel);
                    const rect = panel.getBoundingClientRect();
                    
                    return {
                        position: computed.position,
                        top: computed.top,
                        rectTop: rect.top,
                        isVisible: rect.top >= 0 && rect.bottom <= window.innerHeight
                    };
                })();
            """)
            
            print(f"\n   Panel position after scrolling:")
            print(f"      Position: {panel_info_scrolled.get('position', 'unknown')}")
            print(f"      Top: {panel_info_scrolled.get('top', 'unknown')}")
            print(f"      Viewport rect.top: {panel_info_scrolled.get('rectTop', 'unknown')}px")
            print(f"      Visible: {panel_info_scrolled.get('isVisible', 'unknown')}")
            
            # Step 6: Analyze stickiness
            print("\n" + "=" * 80)
            print("ANALYSIS")
            print("=" * 80)
            
            if panel_info.get('position') == 'fixed' or panel_info.get('position') == 'sticky':
                print("\n✅ SNIPPET PANEL IS STICKY")
                print(f"   - CSS position: {panel_info.get('position')}")
                print(f"   - Panel stays in viewport while content scrolls")
                print(f"   - Fixed at top-left of viewport")
            elif panel_info_scrolled.get('rectTop', 0) < 100:
                print("\n✅ SNIPPET PANEL APPEARS STICKY")
                print(f"   - Panel remains near top of viewport after scrolling")
                print(f"   - Rect top: {panel_info_scrolled.get('rectTop')}px")
            else:
                print("\n⚠ SNIPPET PANEL MAY NOT BE STICKY")
                print(f"   - Position: {panel_info.get('position')}")
                print(f"   - Panel may scroll with content")
            
            # Additional scroll test
            print("\nAdditional test: Scrolling further...")
            await page.evaluate("window.scrollTo(0, 3000)")
            await asyncio.sleep(1)
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/sticky_panel_03_far_scroll.png", full_page=False)
            print("   📸 sticky_panel_03_far_scroll.png (scrolled to 3000px)")
            
            final_panel_check = await page.evaluate("""
                (() => {
                    const panel = document.querySelector('.snippet-panel');
                    if (!panel) return { visible: false };
                    
                    const rect = panel.getBoundingClientRect();
                    return {
                        visible: rect.top >= 0 && rect.top < window.innerHeight,
                        rectTop: rect.top,
                        rectLeft: rect.left
                    };
                })();
            """)
            
            if final_panel_check.get('visible'):
                print(f"\n✅ Panel still visible at 3000px scroll")
                print(f"   Position: top={final_panel_check.get('rectTop')}px, left={final_panel_check.get('rectLeft')}px")
            else:
                print(f"\n⚠ Panel not visible at 3000px scroll")
            
            await asyncio.sleep(3)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
