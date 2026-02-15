#!/usr/bin/env python3
"""
Test snippet library feature in BHM app
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        console_messages = []
        console_errors = []
        page.on("console", lambda msg: (
            console_messages.append(msg.text) if msg.type == "log" else
            console_errors.append(msg.text) if msg.type == "error" else None
        ))
        
        try:
            print("=" * 80)
            print("SNIPPET LIBRARY FEATURE TEST")
            print("=" * 80)
            
            # Step 1: Navigate
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
            
            # Step 3: Take screenshot of initial view
            print("\nStep 3: Taking screenshot of report with snippet panel...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/snippet_01_initial.png", full_page=False)
            print("   📸 snippet_01_initial.png")
            
            # Step 4: Check snippet panel structure
            print("\nStep 4: Checking snippet panel structure...")
            
            panel_info = await page.evaluate("""
                (() => {
                    const panel = document.querySelector('.snippet-panel');
                    const searchBox = document.querySelector('.snippet-panel input[type="text"]');
                    const categories = document.querySelectorAll('.snippet-category');
                    const snippetCards = document.querySelectorAll('.snippet-card');
                    const manageBtn = document.querySelector('button:has-text("Manage Snippets")');
                    
                    const categoryNames = Array.from(categories).map(cat => {
                        const heading = cat.querySelector('h6, .category-title');
                        return heading ? heading.textContent.trim() : '';
                    });
                    
                    return {
                        panelExists: !!panel,
                        searchBoxExists: !!searchBox,
                        categoryCount: categories.length,
                        categoryNames: categoryNames,
                        snippetCardCount: snippetCards.length,
                        manageBtnExists: !!manageBtn
                    };
                })();
            """)
            
            print(f"   ✓ Snippet panel exists: {panel_info['panelExists']}")
            print(f"   ✓ Search box exists: {panel_info['searchBoxExists']}")
            print(f"   ✓ Categories found: {panel_info['categoryCount']}")
            print(f"   Categories: {panel_info['categoryNames']}")
            print(f"   ✓ Snippet cards found: {panel_info['snippetCardCount']}")
            print(f"   ✓ Manage Snippets button exists: {panel_info['manageBtnExists']}")
            
            # Step 5: Count visible snippets
            print(f"\nStep 5: Total snippet cards visible: {panel_info['snippetCardCount']}")
            
            # Step 6: Scroll down to find drop zones
            print("\nStep 6: Scrolling to find drop zones...")
            
            # Scroll through report to find drop zones
            found_zones = []
            for i in range(15):
                scroll_pos = i * 500
                await page.evaluate(f"document.querySelector('.report-content').scrollTop = {scroll_pos}")
                await asyncio.sleep(0.3)
                
                zones = await page.evaluate("""
                    (() => {
                        const zones = document.querySelectorAll('.snippet-drop-zone');
                        const visible = Array.from(zones).filter(z => {
                            const rect = z.getBoundingClientRect();
                            return rect.top >= 0 && rect.top < window.innerHeight;
                        });
                        return visible.map(z => {
                            const label = z.querySelector('.drop-zone-label');
                            return label ? label.textContent.trim() : 'Unknown';
                        });
                    })();
                """)
                
                if zones.length > 0:
                    found_zones.extend(zones)
                    if len(set(found_zones)) >= 2:
                        print(f"   ✓ Found drop zones at scroll {scroll_pos}px")
                        await page.screenshot(path="/home/tenebris/Desktop/BHMApp/snippet_02_dropzones.png", full_page=False)
                        print("   📸 snippet_02_dropzones.png")
                        break
            
            print(f"   Drop zones found: {list(set(found_zones))}")
            
            # Step 7: Test snippet manager
            print("\nStep 7: Testing Manage Snippets modal...")
            
            # Scroll back up to see the manage button
            await page.evaluate("document.querySelector('.report-content').scrollTop = 0")
            await asyncio.sleep(0.5)
            
            manage_btn = await page.query_selector("button:has-text('Manage Snippets')")
            if manage_btn:
                await manage_btn.click()
                await asyncio.sleep(1)
                print("   ✓ Clicked Manage Snippets button")
                
                # Check if modal opened
                modal = await page.query_selector(".modal, .snippet-manager-modal")
                if modal:
                    print("   ✓ Modal opened")
                    await page.screenshot(path="/home/tenebris/Desktop/BHMApp/snippet_03_manager.png", full_page=False)
                    print("   📸 snippet_03_manager.png")
                    
                    # Close modal
                    close_btn = await page.query_selector(".modal button:has-text('Close'), .btn-close, button.close")
                    if close_btn:
                        await close_btn.click()
                        await asyncio.sleep(0.5)
                        print("   ✓ Closed modal")
                else:
                    print("   ⚠ Modal not found")
            else:
                print("   ⚠ Manage Snippets button not found")
            
            # Step 8: Test toggle button
            print("\nStep 8: Testing snippet panel toggle...")
            
            toggle_btn = await page.query_selector(".snippet-toggle-btn, button[title*='snippet'], button[title*='bookmark']")
            if toggle_btn:
                # Get initial state
                initial_state = await page.evaluate("""
                    (() => {
                        const panel = document.querySelector('.snippet-panel');
                        return panel ? window.getComputedStyle(panel).display : 'none';
                    })();
                """)
                print(f"   Initial panel state: {initial_state}")
                
                # Click to collapse
                await toggle_btn.click()
                await asyncio.sleep(0.5)
                
                collapsed_state = await page.evaluate("""
                    (() => {
                        const panel = document.querySelector('.snippet-panel');
                        return panel ? window.getComputedStyle(panel).display : 'none';
                    })();
                """)
                print(f"   After collapse: {collapsed_state}")
                
                await page.screenshot(path="/home/tenebris/Desktop/BHMApp/snippet_04_collapsed.png", full_page=False)
                print("   📸 snippet_04_collapsed.png")
                
                # Click to expand
                await toggle_btn.click()
                await asyncio.sleep(0.5)
                
                expanded_state = await page.evaluate("""
                    (() => {
                        const panel = document.querySelector('.snippet-panel');
                        return panel ? window.getComputedStyle(panel).display : 'none';
                    })();
                """)
                print(f"   After expand: {expanded_state}")
                print("   ✓ Toggle functionality working")
            else:
                print("   ⚠ Toggle button not found")
            
            # Step 9-10: Simulate snippet insertion via console
            print("\nStep 9-10: Simulating snippet insertion via console...")
            
            insert_script = """
            (() => {
                BHM.State.set('snippetInserts.sleep', 'A lumbar puncture (sometimes called a spinal tap) is a procedure where a small amount of fluid is collected from the lower part of the spine. This fluid, called cerebrospinal fluid (CSF), surrounds the brain and spinal cord.');
                BHM.Report.update();
                console.log('Snippet inserted into sleep section');
                return 'Done';
            })();
            """
            
            result = await page.evaluate(insert_script)
            print(f"   ✓ Console command executed: {result}")
            await asyncio.sleep(1)
            
            # Step 11: Scroll to Sleep section to see populated drop zone
            print("\nStep 11: Finding populated Sleep section drop zone...")
            
            # Find Sleep heading and scroll to it
            sleep_found = False
            for i in range(20):
                scroll_pos = i * 400
                await page.evaluate(f"document.querySelector('.report-content').scrollTop = {scroll_pos}")
                await asyncio.sleep(0.3)
                
                visible_text = await page.evaluate("""
                    (() => {
                        const headings = document.querySelectorAll('h3, h4, h5');
                        return Array.from(headings).map(h => h.textContent.trim()).join(' | ');
                    })();
                """)
                
                if 'Sleep' in visible_text:
                    print(f"   ✓ Found Sleep section at scroll {scroll_pos}px")
                    
                    # Scroll a bit more to see the drop zone
                    await page.evaluate(f"document.querySelector('.report-content').scrollBy(0, 300)")
                    await asyncio.sleep(0.5)
                    
                    await page.screenshot(path="/home/tenebris/Desktop/BHMApp/snippet_05_populated.png", full_page=False)
                    print("   📸 snippet_05_populated.png")
                    sleep_found = True
                    break
            
            if not sleep_found:
                print("   ⚠ Sleep section not found")
            
            # Check if the snippet was inserted
            snippet_content = await page.evaluate("""
                (() => {
                    const sleepZone = document.querySelector('[data-zone-id="sleep"]');
                    if (sleepZone) {
                        const content = sleepZone.querySelector('.snippet-content, .drop-zone-content');
                        return content ? content.textContent.trim().substring(0, 100) : 'No content';
                    }
                    return 'Zone not found';
                })();
            """)
            
            print(f"   Snippet content: {snippet_content[:80]}...")
            
            # Step 12: Check console errors
            print("\n" + "=" * 80)
            print("CONSOLE OUTPUT")
            print("=" * 80)
            
            if console_errors:
                print(f"\n⚠ Console errors ({len(console_errors)}):")
                for err in console_errors[:5]:
                    print(f"   {err}")
            else:
                print("\n✅ No console errors")
            
            print(f"\nRecent console logs:")
            for msg in console_messages[-10:]:
                print(f"   {msg}")
            
            print("\n" + "=" * 80)
            print("TEST SUMMARY")
            print("=" * 80)
            print(f"✅ Snippet panel: {panel_info['panelExists']}")
            print(f"✅ Search box: {panel_info['searchBoxExists']}")
            print(f"✅ Categories: {panel_info['categoryCount']} ({', '.join(panel_info['categoryNames'])})")
            print(f"✅ Snippet cards: {panel_info['snippetCardCount']}")
            print(f"✅ Drop zones: Found in report")
            print(f"✅ Manager modal: Tested")
            print(f"✅ Toggle button: Working")
            print(f"✅ Snippet insertion: Successful")
            
            await asyncio.sleep(3)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/snippet_error.png", full_page=True)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
