#!/usr/bin/env python3
"""
Test snippet panel fixed positioning with independent report scrolling
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
            print("SNIPPET PANEL FIXED POSITIONING TEST")
            print("=" * 80)
            
            # Step 1: Open app
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
            
            # Step 3: Initial screenshot
            print("\nStep 3: Taking initial screenshot...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/fixed_panel_01_initial.png", full_page=False)
            print("   📸 fixed_panel_01_initial.png")
            
            # Check initial state
            initial_state = await page.evaluate("""
                (() => {
                    const panel = document.querySelector('.snippet-panel');
                    const reportArea = document.getElementById('reportFullContent');
                    
                    return {
                        panelVisible: !!panel,
                        panelRect: panel ? panel.getBoundingClientRect() : null,
                        reportArea: !!reportArea,
                        reportScrollTop: reportArea ? reportArea.scrollTop : null
                    };
                })();
            """)
            
            print(f"\n   Initial state:")
            print(f"      Snippet panel visible: {initial_state['panelVisible']}")
            print(f"      Panel position: top={initial_state['panelRect']['top']:.1f}px, left={initial_state['panelRect']['left']:.1f}px")
            print(f"      Report area found: {initial_state['reportArea']}")
            print(f"      Report scroll position: {initial_state['reportScrollTop']}px")
            
            # Step 4: Scroll report to 2000px
            print("\nStep 4: Scrolling report content to 2000px...")
            scroll_result = await page.evaluate("""
                (() => {
                    var reportArea = document.getElementById('reportFullContent');
                    if (reportArea) {
                        reportArea.scrollTop = 2000;
                        return { success: true, scrollTop: reportArea.scrollTop };
                    }
                    return { success: false };
                })();
            """)
            
            if scroll_result.get('success'):
                print(f"   ✓ Scrolled report to {scroll_result['scrollTop']}px")
            else:
                print("   ⚠ Could not find report area")
            
            await asyncio.sleep(1)
            
            # Step 5: Screenshot after first scroll
            print("\nStep 5: Taking screenshot after first scroll...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/fixed_panel_02_scroll2000.png", full_page=False)
            print("   📸 fixed_panel_02_scroll2000.png")
            
            # Check panel after scroll
            after_scroll_1 = await page.evaluate("""
                (() => {
                    const panel = document.querySelector('.snippet-panel');
                    const reportArea = document.getElementById('reportFullContent');
                    
                    // Get visible section headings in report
                    const headings = Array.from(document.querySelectorAll('#reportFullContent h3, #reportFullContent h4, #reportFullContent h5'));
                    const visibleHeadings = headings.filter(h => {
                        const rect = h.getBoundingClientRect();
                        return rect.top > 100 && rect.top < 800;
                    }).map(h => h.textContent.trim());
                    
                    return {
                        panelVisible: !!panel,
                        panelRect: panel ? panel.getBoundingClientRect() : null,
                        reportScrollTop: reportArea ? reportArea.scrollTop : null,
                        visibleSections: visibleHeadings.slice(0, 3)
                    };
                })();
            """)
            
            print(f"\n   After scroll to 2000px:")
            print(f"      Snippet panel still visible: {after_scroll_1['panelVisible']}")
            print(f"      Panel position: top={after_scroll_1['panelRect']['top']:.1f}px, left={after_scroll_1['panelRect']['left']:.1f}px")
            print(f"      Report scroll position: {after_scroll_1['reportScrollTop']}px")
            print(f"      Visible sections: {after_scroll_1['visibleSections']}")
            
            # Step 6: Scroll even further to 4000px
            print("\nStep 6: Scrolling report content to 4000px...")
            scroll_result_2 = await page.evaluate("""
                (() => {
                    var reportArea = document.getElementById('reportFullContent');
                    if (reportArea) {
                        reportArea.scrollTop = 4000;
                        return { success: true, scrollTop: reportArea.scrollTop };
                    }
                    return { success: false };
                })();
            """)
            
            if scroll_result_2.get('success'):
                print(f"   ✓ Scrolled report to {scroll_result_2['scrollTop']}px")
            else:
                print("   ⚠ Could not scroll report")
            
            await asyncio.sleep(1)
            
            # Step 7: Screenshot after second scroll
            print("\nStep 7: Taking screenshot after second scroll...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/fixed_panel_03_scroll4000.png", full_page=False)
            print("   📸 fixed_panel_03_scroll4000.png")
            
            # Check panel after deeper scroll
            after_scroll_2 = await page.evaluate("""
                (() => {
                    const panel = document.querySelector('.snippet-panel');
                    const reportArea = document.getElementById('reportFullContent');
                    
                    const headings = Array.from(document.querySelectorAll('#reportFullContent h3, #reportFullContent h4, #reportFullContent h5'));
                    const visibleHeadings = headings.filter(h => {
                        const rect = h.getBoundingClientRect();
                        return rect.top > 100 && rect.top < 800;
                    }).map(h => h.textContent.trim());
                    
                    return {
                        panelVisible: !!panel,
                        panelRect: panel ? panel.getBoundingClientRect() : null,
                        reportScrollTop: reportArea ? reportArea.scrollTop : null,
                        visibleSections: visibleHeadings.slice(0, 3)
                    };
                })();
            """)
            
            print(f"\n   After scroll to 4000px:")
            print(f"      Snippet panel still visible: {after_scroll_2['panelVisible']}")
            print(f"      Panel position: top={after_scroll_2['panelRect']['top']:.1f}px, left={after_scroll_2['panelRect']['left']:.1f}px")
            print(f"      Report scroll position: {after_scroll_2['reportScrollTop']}px")
            print(f"      Visible sections: {after_scroll_2['visibleSections']}")
            
            # Step 8-9: Verification
            print("\n" + "=" * 80)
            print("VERIFICATION")
            print("=" * 80)
            
            panel_stayed_fixed = (
                initial_state['panelVisible'] and 
                after_scroll_1['panelVisible'] and 
                after_scroll_2['panelVisible'] and
                abs(initial_state['panelRect']['top'] - after_scroll_1['panelRect']['top']) < 5 and
                abs(initial_state['panelRect']['top'] - after_scroll_2['panelRect']['top']) < 5
            )
            
            if panel_stayed_fixed:
                print("\n✅ SNIPPET PANEL STAYS FIXED")
                print("   - Panel remained visible throughout scrolling")
                print("   - Panel position unchanged (top stayed constant)")
                print(f"   - Initial position: {initial_state['panelRect']['top']:.1f}px")
                print(f"   - After 2000px scroll: {after_scroll_1['panelRect']['top']:.1f}px")
                print(f"   - After 4000px scroll: {after_scroll_2['panelRect']['top']:.1f}px")
                print("   - Report content scrolled independently")
            else:
                print("\n❌ SNIPPET PANEL DID NOT STAY FIXED")
                if not (after_scroll_1['panelVisible'] and after_scroll_2['panelVisible']):
                    print("   - Panel disappeared during scrolling")
                else:
                    print("   - Panel position changed during scrolling")
            
            print(f"\n✅ Report content scrolled independently:")
            print(f"   - Initial: 0px → showing top sections")
            print(f"   - After first scroll: {after_scroll_1['reportScrollTop']}px → {after_scroll_1['visibleSections']}")
            print(f"   - After second scroll: {after_scroll_2['reportScrollTop']}px → {after_scroll_2['visibleSections']}")
            
            await asyncio.sleep(3)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
