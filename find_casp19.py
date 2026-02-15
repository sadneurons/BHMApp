#!/usr/bin/env python3
"""
Find and extract CASP-19 Quality of Life text
"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1200})
        
        try:
            # Load and inject data
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"Loading {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(2)
            
            # Inject CASP-19 data
            inject_script = """
            (function() {
              var casp = BHM.State.getSession().instruments.casp19;
              casp.c1 = 1; casp.c2 = 0; casp.c3 = 2; casp.c4 = 0;
              casp.c5 = 2; casp.c6 = 1; casp.c7 = 2; casp.c8 = 1; casp.c9 = 0;
              casp.c10 = 0; casp.c11 = 0; casp.c12 = 0; casp.c13 = 1; casp.c14 = 2;
              casp.c15 = 3; casp.c16 = 2; casp.c17 = 3; casp.c18 = 2; casp.c19 = 3;
              BHM.Scoring.casp19();
              BHM.Report.update();
              return 'Done';
            })();
            """
            
            print("Injecting CASP-19 data...")
            await page.evaluate(inject_script)
            await asyncio.sleep(1)
            
            print("Navigating to Report tab...")
            await page.click("#tab-report")
            await asyncio.sleep(2)
            
            print("\nSearching for Quality of Life section...")
            
            # Scroll through report to find Quality of Life
            for i in range(20):
                scroll_pos = i * 600
                await page.evaluate(f"window.scrollTo(0, {scroll_pos})")
                await asyncio.sleep(0.4)
                
                # Check visible headings
                headings = await page.evaluate("""
                    () => {
                        const headings = Array.from(document.querySelectorAll('h3, h4, h5'));
                        const visible = headings.filter(h => {
                            const rect = h.getBoundingClientRect();
                            return rect.top >= 0 && rect.top < window.innerHeight;
                        });
                        return visible.map(h => h.textContent.trim());
                    }
                """)
                
                print(f"   Scroll {i} ({scroll_pos}px): {headings[:2] if headings else 'None'}")
                
                if any('Quality of Life' in h for h in headings):
                    print(f"\n✓✓✓ FOUND Quality of Life at {scroll_pos}px")
                    
                    # Take screenshot
                    await page.screenshot(path="/home/tenebris/Desktop/BHMApp/casp19_qol_found.png", full_page=False)
                    print("   📸 casp19_qol_found.png")
                    
                    # Scroll down a bit to see more content
                    await page.evaluate("window.scrollBy(0, 400)")
                    await asyncio.sleep(0.5)
                    await page.screenshot(path="/home/tenebris/Desktop/BHMApp/casp19_qol_detail.png", full_page=False)
                    print("   📸 casp19_qol_detail.png")
                    
                    # Extract text using a more robust method
                    print("\nExtracting CASP-19 text...")
                    
                    casp_text = await page.evaluate("""
                        () => {
                            // Find Quality of Life heading
                            const allText = document.body.innerText;
                            const qolIndex = allText.indexOf('Quality of Life');
                            
                            if (qolIndex === -1) return 'Not found';
                            
                            // Get text from Quality of Life to the next major section
                            const afterQol = allText.substring(qolIndex);
                            
                            // Find the next section (Hearing, Changes Noticed, etc.)
                            const nextSections = ['Hearing', 'Changes Noticed', 'Clinical Interview', 'Staging'];
                            let endIndex = afterQol.length;
                            
                            for (const section of nextSections) {
                                const idx = afterQol.indexOf(section);
                                if (idx > 0 && idx < endIndex) {
                                    endIndex = idx;
                                }
                            }
                            
                            return afterQol.substring(0, endIndex).trim();
                        }
                    """)
                    
                    print("\n" + "=" * 80)
                    print("CASP-19 QUALITY OF LIFE TEXT (VERBATIM)")
                    print("=" * 80)
                    print(casp_text)
                    print("=" * 80)
                    
                    # Check for pronoun issues
                    print("\nChecking for pronoun issues...")
                    
                    issues = []
                    casp_lower = casp_text.lower()
                    
                    # Problematic patterns
                    checks = [
                        ('my age', 'your age'),
                        ('my control', 'your control'),
                        ('my life', 'your life'),
                        ('my health', 'your health'),
                        ('prevents me', 'prevents you'),
                        ('stops me', 'stops you'),
                        (' i feel', ' you feel'),
                        (' i can', ' you can'),
                        (' i choose', ' you choose'),
                        (' i look', ' you look'),
                        (' i enjoy', ' you enjoy'),
                    ]
                    
                    for bad, good in checks:
                        if bad in casp_lower:
                            idx = casp_lower.find(bad)
                            context = casp_text[max(0, idx-40):min(len(casp_text), idx+60)]
                            issues.append(f"❌ Found '{bad}' (should be '{good}')")
                            issues.append(f"   Context: ...{context}...")
                    
                    if issues:
                        print("\n⚠️ PRONOUN ISSUES FOUND:")
                        for issue in issues:
                            print(f"   {issue}")
                    else:
                        print("\n✅ NO PRONOUN ISSUES FOUND")
                        print("   All pronouns correctly converted to second-person")
                    
                    break
            
            await asyncio.sleep(2)
            print("\n✅ Test complete")
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
