#!/usr/bin/env python3
"""
Test CASP-19 pronoun fix in report
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
            print("CASP-19 PRONOUN FIX TEST")
            print("=" * 80)
            
            # Step 1: Navigate
            file_path = "file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html"
            print(f"\nStep 1: Loading {file_path}...")
            await page.goto(file_path, wait_until="networkidle")
            await asyncio.sleep(2)
            print("   ✓ Page loaded")
            
            # Step 2: Inject CASP-19 test data
            print("\nStep 2: Injecting CASP-19 test data...")
            
            inject_script = """
            (function() {
              var casp = BHM.State.getSession().instruments.casp19;
              // Control domain (reverse items — concern when often/sometimes)
              casp.c1 = 1;  // "My age prevents me..." → sometimes (concern)
              casp.c2 = 0;  // "I feel that what happens to me is out of my control" → often (concern)
              casp.c3 = 2;  // "I feel free to plan for the future" → not often (concern, positive item)
              casp.c4 = 0;  // "I feel left out of things" → often (concern)
              
              // Autonomy domain
              casp.c5 = 2;  // "I can do the things that I want to do" → not often (concern)
              casp.c6 = 1;  // "Family responsibilities prevent me from doing what I want to do" → sometimes (concern)
              casp.c7 = 2;  // "I feel that I can please myself what I do" → not often (concern)
              casp.c8 = 1;  // "My health stops me from doing things I want to do" → sometimes (concern)
              casp.c9 = 0;  // "Shortage of money stops me from doing..." → often (concern)
              
              // Pleasure domain
              casp.c10 = 0; // "I look forward to each day" → often (positive)
              casp.c11 = 0; // "I feel that my life has meaning" → often (positive)
              casp.c12 = 0; // "I enjoy the things that I do" → often (positive)
              casp.c13 = 1; // "I enjoy being in the company of others" → sometimes (positive)
              casp.c14 = 2; // "On balance, I look back on my life with a sense of happiness" → not often (concern)
              
              // Self-realisation domain
              casp.c15 = 3; // "I feel full of energy these days" → never (concern)
              casp.c16 = 2; // "I choose to do things that I have never done before" → not often (concern)
              casp.c17 = 3; // "I feel satisfied with the way my life has turned out" → never (concern)
              casp.c18 = 2; // "I feel that life is full of opportunities" → not often (concern)
              casp.c19 = 3; // "I feel that the future looks good for me" → never (concern)
              
              BHM.Scoring.casp19();
              BHM.Report.update();
              console.log('CASP-19 data injected');
              return 'Done';
            })();
            """
            
            result = await page.evaluate(inject_script)
            print(f"   ✓ Data injection: {result}")
            await asyncio.sleep(1)
            
            # Step 3: Click Report tab
            print("\nStep 3: Clicking Report tab...")
            await page.click("#tab-report")
            await asyncio.sleep(2)
            print("   ✓ Report tab opened")
            
            # Step 4: Scroll to Quality of Life section
            print("\nStep 4: Scrolling to Quality of Life section...")
            
            # Find the Quality of Life heading
            qol_found = False
            for i in range(10):
                await page.evaluate(f"window.scrollTo(0, {i * 800})")
                await asyncio.sleep(0.5)
                
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
                
                if any('Quality of Life' in h for h in headings):
                    print(f"   ✓ Found Quality of Life section at scroll {i * 800}px")
                    qol_found = True
                    break
            
            if not qol_found:
                print("   ⚠ Quality of Life section not found, taking screenshot anyway")
            
            # Step 5: Take screenshot
            print("\nStep 5: Taking screenshot of CASP-19 section...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/casp19_pronoun_test.png", full_page=False)
            print("   📸 casp19_pronoun_test.png")
            
            # Step 6: Extract CASP-19 text content
            print("\nStep 6: Extracting CASP-19 text content...")
            
            # Get all text from the Quality of Life section
            casp_text = await page.evaluate("""
                () => {
                    // Find the Quality of Life heading
                    const headings = Array.from(document.querySelectorAll('h3, h4, h5'));
                    const qolHeading = headings.find(h => h.textContent.includes('Quality of Life'));
                    
                    if (!qolHeading) return 'Quality of Life section not found';
                    
                    // Get the parent container
                    let container = qolHeading.parentElement;
                    
                    // Find all paragraphs until the next section heading
                    let text = '';
                    let currentNode = qolHeading.nextElementSibling;
                    
                    while (currentNode) {
                        // Stop if we hit another section heading
                        if (currentNode.tagName && ['H3', 'H4', 'H5', 'H6'].includes(currentNode.tagName)) {
                            break;
                        }
                        
                        // Collect paragraph text
                        if (currentNode.tagName === 'P' && currentNode.textContent.trim()) {
                            text += currentNode.textContent.trim() + '\\n\\n';
                        }
                        
                        currentNode = currentNode.nextElementSibling;
                    }
                    
                    return text;
                }
            """)
            
            print("\n" + "=" * 80)
            print("CASP-19 REPORT TEXT (VERBATIM)")
            print("=" * 80)
            print(casp_text)
            print("=" * 80)
            
            # Step 7: Check for pronoun issues
            print("\nStep 7: Checking for pronoun issues...")
            
            issues = []
            
            # Check for problematic first-person pronouns
            problematic_patterns = [
                ('my age', 'your age'),
                ('my control', 'your control'),
                ('my life', 'your life'),
                ('my health', 'your health'),
                ('prevents me', 'prevents you'),
                ('stops me', 'stops you'),
                ('i feel', 'you feel'),
                ('i can', 'you can'),
                ('i choose', 'you choose'),
                ('i look', 'you look'),
                ('i enjoy', 'you enjoy'),
            ]
            
            casp_lower = casp_text.lower()
            
            for bad, good in problematic_patterns:
                if bad in casp_lower:
                    # Find the context
                    idx = casp_lower.find(bad)
                    context = casp_text[max(0, idx-30):min(len(casp_text), idx+50)]
                    issues.append(f"   ❌ Found '{bad}' (should be '{good}')")
                    issues.append(f"      Context: ...{context}...")
            
            # Check for grammatical issues
            if 'not often can' in casp_lower:
                issues.append("   ❌ Found 'not often can' (grammatical issue)")
            
            if 'feel that you feel' in casp_lower:
                issues.append("   ❌ Found 'feel that you feel' (doubled phrasing)")
            
            if issues:
                print("\n⚠️ PRONOUN ISSUES FOUND:")
                for issue in issues:
                    print(issue)
            else:
                print("\n✅ NO PRONOUN ISSUES FOUND")
                print("   All first-person pronouns correctly converted to second-person")
            
            # Check console
            if console_errors:
                print(f"\n⚠ Console errors: {len(console_errors)}")
                for err in console_errors[:3]:
                    print(f"   {err}")
            else:
                print("\n✅ No console errors")
            
            await asyncio.sleep(3)
            
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/casp19_error.png", full_page=True)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
