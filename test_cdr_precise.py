#!/usr/bin/env python3
"""
Precise CDR Assessment test with specific cell clicks
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
            print("CDR Assessment - Precise Cell Selection Test")
            print("=" * 80)
            
            # Navigate
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"\nNavigating to {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(1)
            print("✓ Page loaded")
            
            # Step 1: Click Clinical Interview tab
            print("\n1. Clicking Clinical Interview tab...")
            await page.click("#tab-clinical")
            await asyncio.sleep(1.5)
            print("   ✓ Clinical Interview tab opened")
            
            # Step 2: Click CDR Assessment sub-tab
            print("\n2. Clicking CDR Assessment sub-tab...")
            cdr_tab = await page.query_selector("button:has-text('CDR Assessment')")
            if cdr_tab:
                await cdr_tab.click()
                await asyncio.sleep(1.5)
                print("   ✓ CDR Assessment sub-tab opened")
            else:
                print("   ✗ CDR Assessment tab not found")
            
            # Find the CDR table
            cdr_table = await page.query_selector("#clinicalContent table")
            if not cdr_table:
                print("   ✗ CDR table not found")
                return
            
            print("\n3-8. Clicking cells in CDR assessment table...")
            
            # Step 3: Memory row, 0.5 column (row 1, col 2)
            print("\n   3. Memory → 0.5 column...")
            memory_cell = await page.query_selector("#clinicalContent table tbody tr:nth-child(1) td:nth-child(2)")
            if memory_cell:
                await memory_cell.click()
                await asyncio.sleep(0.5)
                print("      ✓ Clicked Memory → 0.5")
            else:
                print("      ✗ Memory cell not found")
            
            # Step 4: Orientation row, 0.5 column (row 2, col 2)
            print("   4. Orientation → 0.5 column...")
            orientation_cell = await page.query_selector("#clinicalContent table tbody tr:nth-child(2) td:nth-child(2)")
            if orientation_cell:
                await orientation_cell.click()
                await asyncio.sleep(0.5)
                print("      ✓ Clicked Orientation → 0.5")
            else:
                print("      ✗ Orientation cell not found")
            
            # Step 5: Judgment row, 0 column (row 3, col 1)
            print("   5. Judgment and problem-solving → 0 column...")
            judgment_cell = await page.query_selector("#clinicalContent table tbody tr:nth-child(3) td:nth-child(1)")
            if judgment_cell:
                await judgment_cell.click()
                await asyncio.sleep(0.5)
                print("      ✓ Clicked Judgment → 0")
            else:
                print("      ✗ Judgment cell not found")
            
            # Step 6: Community affairs row, 0 column (row 4, col 1)
            print("   6. Community affairs → 0 column...")
            community_cell = await page.query_selector("#clinicalContent table tbody tr:nth-child(4) td:nth-child(1)")
            if community_cell:
                await community_cell.click()
                await asyncio.sleep(0.5)
                print("      ✓ Clicked Community affairs → 0")
            else:
                print("      ✗ Community cell not found")
            
            # Step 7: Home and hobbies row, 0 column (row 5, col 1)
            print("   7. Home and hobbies → 0 column...")
            home_cell = await page.query_selector("#clinicalContent table tbody tr:nth-child(5) td:nth-child(1)")
            if home_cell:
                await home_cell.click()
                await asyncio.sleep(0.5)
                print("      ✓ Clicked Home and hobbies → 0")
            else:
                print("      ✗ Home cell not found")
            
            # Step 8: Personal care row, 0/0.5 column (row 6, col 1)
            print("   8. Personal care → 0/0.5 column (merged cell)...")
            personal_cell = await page.query_selector("#clinicalContent table tbody tr:nth-child(6) td:nth-child(1)")
            if personal_cell:
                await personal_cell.click()
                await asyncio.sleep(0.5)
                print("      ✓ Clicked Personal care → 0/0.5")
            else:
                print("      ✗ Personal care cell not found")
            
            # Step 9: Take screenshot of selections
            print("\n9. Taking screenshot of selections...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_selections.png", full_page=True)
            print("   ✓ Screenshot: cdr_selections.png")
            
            # Step 10: Check CDR Total and Sum of Boxes
            print("\n10. Checking CDR Total and Sum of Boxes values...")
            
            # Look for CDR Total
            cdr_total_elem = await page.query_selector("text=CDR Total")
            if cdr_total_elem:
                # Get the value near this element
                parent = await cdr_total_elem.evaluate_handle("el => el.closest('div, p, td')")
                total_text = await parent.inner_text()
                print(f"   ✓ CDR Total section: {total_text.strip()}")
                
                # Try to extract just the number
                total_value = await page.evaluate("""
                    () => {
                        const el = document.querySelector('#cdrTotalValue, [data-cdr-total], .cdr-total-value');
                        return el ? el.textContent.trim() : 'Not found';
                    }
                """)
                print(f"   ✓ CDR Total value: {total_value}")
            
            # Look for Sum of Boxes
            sum_boxes_elem = await page.query_selector("text=Sum of Boxes, text=CDR Sum")
            if sum_boxes_elem:
                parent = await sum_boxes_elem.evaluate_handle("el => el.closest('div, p, td')")
                boxes_text = await parent.inner_text()
                print(f"   ✓ CDR Sum of Boxes section: {boxes_text.strip()}")
                
                # Try to extract the number
                boxes_value = await page.evaluate("""
                    () => {
                        const el = document.querySelector('#cdrSumBoxes, [data-cdr-boxes], .cdr-boxes-value');
                        return el ? el.textContent.trim() : 'Not found';
                    }
                """)
                print(f"   ✓ CDR Sum of Boxes value: {boxes_value}")
            
            # Look for interpretation text
            interp_elem = await page.query_selector("text=Interpretation")
            if interp_elem:
                parent = await interp_elem.evaluate_handle("el => el.closest('div, section')")
                interp_text = await parent.inner_text()
                print(f"   ✓ Interpretation: {interp_text.strip()[:200]}...")
            
            # Step 11: Click CDR Scoring sub-tab
            print("\n11. Clicking CDR Scoring sub-tab...")
            scoring_tab = await page.query_selector("button:has-text('CDR Scoring'), button:has-text('Scoring')")
            if scoring_tab:
                await scoring_tab.click()
                await asyncio.sleep(1.5)
                print("   ✓ CDR Scoring sub-tab opened")
            else:
                print("   ✗ CDR Scoring tab not found")
            
            # Step 12: Screenshot of scoring tab
            print("\n12. Taking screenshot of CDR Scoring tab...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_scoring.png", full_page=True)
            print("   ✓ Screenshot: cdr_scoring.png")
            
            # Check scoring tab content
            print("\n   Checking scoring tab content...")
            
            # Look for Box Scores Summary
            box_scores = await page.query_selector("text=Box Scores")
            if box_scores:
                print("   ✓ Box Scores Summary found")
            else:
                print("   ⚠ Box Scores Summary not found")
            
            # Look for result text
            result_text = await page.evaluate("""
                () => {
                    const keywords = ['questionable', 'mild', 'moderate', 'severe', 'dementia'];
                    for (const keyword of keywords) {
                        const el = document.querySelector(`body *:not(script):not(style)`);
                        const text = document.body.innerText.toLowerCase();
                        if (text.includes(keyword)) {
                            return 'Result text found';
                        }
                    }
                    return 'Result text not found';
                }
            """)
            print(f"   ✓ {result_text}")
            
            # Step 13: Click Report main tab
            print("\n13. Clicking Report main tab...")
            report_tab = await page.query_selector("#tab-report")
            if report_tab:
                await report_tab.click()
                await asyncio.sleep(1.5)
                print("   ✓ Report tab opened")
            else:
                print("   ✗ Report tab not found")
            
            # Step 14: Scroll to find Staging section
            print("\n14. Looking for 'Staging' section...")
            staging = await page.query_selector("text=Staging")
            if staging:
                await staging.scroll_into_view_if_needed()
                await asyncio.sleep(1)
                print("   ✓ Staging section found and scrolled into view")
            else:
                print("   ⚠ Staging section not found, scrolling to search...")
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
                await asyncio.sleep(1)
            
            # Step 15: Screenshot of Staging section
            print("\n15. Taking screenshot of Report with Staging section...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_report_staging.png", full_page=True)
            print("   ✓ Screenshot: cdr_report_staging.png")
            
            # Extract final scores
            print("\n" + "=" * 80)
            print("FINAL SCORES SUMMARY")
            print("=" * 80)
            
            # Try to get CDR Total from page
            final_cdr_total = await page.evaluate("""
                () => {
                    const selectors = [
                        '#cdrTotalValue',
                        '[data-cdr-total]',
                        '.cdr-total-value'
                    ];
                    for (const sel of selectors) {
                        const el = document.querySelector(sel);
                        if (el) return el.textContent.trim();
                    }
                    // Try to find in text
                    const text = document.body.innerText;
                    const match = text.match(/CDR Total[:\\s]+([0-9.]+)/i);
                    return match ? match[1] : 'Not found';
                }
            """)
            
            final_cdr_boxes = await page.evaluate("""
                () => {
                    const selectors = [
                        '#cdrSumBoxes',
                        '[data-cdr-boxes]',
                        '.cdr-boxes-value'
                    ];
                    for (const sel of selectors) {
                        const el = document.querySelector(sel);
                        if (el) return el.textContent.trim();
                    }
                    // Try to find in text
                    const text = document.body.innerText;
                    const match = text.match(/Sum of Boxes[:\\s]+([0-9.]+)/i);
                    return match ? match[1] : 'Not found';
                }
            """)
            
            print(f"\n📊 CDR Total Score: {final_cdr_total}")
            print(f"📊 CDR Sum of Boxes Score: {final_cdr_boxes}")
            
            # Try to find interpretation
            interpretation = await page.evaluate("""
                () => {
                    const text = document.body.innerText.toLowerCase();
                    if (text.includes('questionable')) return 'Questionable dementia (CDR 0.5)';
                    if (text.includes('mild dementia')) return 'Mild dementia (CDR 1)';
                    if (text.includes('moderate')) return 'Moderate dementia (CDR 2)';
                    if (text.includes('severe')) return 'Severe dementia (CDR 3)';
                    if (text.includes('no dementia') || text.includes('normal')) return 'No dementia (CDR 0)';
                    return 'Interpretation not found';
                }
            """)
            
            print(f"📊 Interpretation: {interpretation}")
            
            print("\n" + "=" * 80)
            print("TEST COMPLETED")
            print("=" * 80)
            print("\n📸 Screenshots saved:")
            print("   - cdr_selections.png (CDR Assessment with selections)")
            print("   - cdr_scoring.png (CDR Scoring tab)")
            print("   - cdr_report_staging.png (Report tab with Staging)")
            
            # Keep browser open
            await asyncio.sleep(5)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/cdr_test_error.png", full_page=True)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
