#!/usr/bin/env python3
"""
Test localhost app state and check for CSS/console errors
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
            print("LOCALHOST APP STATE CHECK")
            print("=" * 80)
            
            # Navigate to localhost
            print("\n1. Navigating to http://localhost:8767/index.html...")
            try:
                await page.goto("http://localhost:8767/index.html", wait_until="domcontentloaded", timeout=10000)
                await asyncio.sleep(3)
                print("   ✓ Page loaded")
            except Exception as e:
                print(f"   ❌ Failed to load: {e}")
                await browser.close()
                return
            
            # Take screenshot
            print("\n2. Taking screenshot...")
            await page.screenshot(path="/home/tenebris/Desktop/BHMApp/localhost_01_initial.png", full_page=True)
            print("   📸 localhost_01_initial.png")
            
            # Check page title
            title = await page.title()
            print(f"\n   Page title: {title}")
            
            # Check if page has styling
            print("\n3. Checking page styling...")
            
            styling_check = await page.evaluate("""
                (() => {
                    const body = document.body;
                    const computed = window.getComputedStyle(body);
                    
                    return {
                        backgroundColor: computed.backgroundColor,
                        fontFamily: computed.fontFamily,
                        fontSize: computed.fontSize,
                        hasBootstrap: !!document.querySelector('link[href*="bootstrap"]'),
                        totalStylesheets: document.querySelectorAll('link[rel="stylesheet"]').length,
                        totalStyles: document.querySelectorAll('style').length
                    };
                })();
            """)
            
            print(f"   Background color: {styling_check['backgroundColor']}")
            print(f"   Font family: {styling_check['fontFamily']}")
            print(f"   Font size: {styling_check['fontSize']}")
            print(f"   Has Bootstrap link: {styling_check['hasBootstrap']}")
            print(f"   Total stylesheets: {styling_check['totalStylesheets']}")
            print(f"   Total <style> tags: {styling_check['totalStyles']}")
            
            # Check Bootstrap CSS specifically
            print("\n4. Checking Bootstrap CSS link...")
            
            bootstrap_check = await page.evaluate("""
                (() => {
                    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
                    const bootstrapLinks = links.filter(l => l.href.includes('bootstrap'));
                    
                    return bootstrapLinks.map(link => ({
                        href: link.href,
                        loaded: link.sheet !== null,
                        disabled: link.disabled,
                        media: link.media,
                        crossOrigin: link.crossOrigin,
                        integrity: link.integrity
                    }));
                })();
            """)
            
            if bootstrap_check:
                for i, link in enumerate(bootstrap_check):
                    print(f"\n   Bootstrap link {i+1}:")
                    print(f"      href: {link['href']}")
                    print(f"      loaded: {link['loaded']}")
                    print(f"      disabled: {link['disabled']}")
                    print(f"      media: {link['media']}")
                    print(f"      crossOrigin: {link['crossOrigin']}")
                    print(f"      integrity: {link['integrity']}")
            else:
                print("   ⚠️ No Bootstrap CSS links found")
            
            # Check CSP meta tag
            print("\n5. Checking Content Security Policy...")
            
            csp_check = await page.evaluate("""
                (() => {
                    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
                    if (cspMeta) {
                        return {
                            exists: true,
                            content: cspMeta.getAttribute('content')
                        };
                    }
                    return { exists: false };
                })();
            """)
            
            if csp_check['exists']:
                print(f"   ✅ CSP meta tag found:")
                print(f"      Content: {csp_check['content']}")
            else:
                print("   ℹ️ No CSP meta tag found")
            
            # Check all stylesheets
            print("\n6. Checking all stylesheet links...")
            
            all_stylesheets = await page.evaluate("""
                (() => {
                    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
                    return links.map((link, i) => ({
                        index: i,
                        href: link.href,
                        loaded: link.sheet !== null,
                        disabled: link.disabled
                    }));
                })();
            """)
            
            for sheet in all_stylesheets:
                status = "✅ Loaded" if sheet['loaded'] else "❌ Failed"
                print(f"   {status} - {sheet['href']}")
            
            # Report console messages
            print("\n7. Console messages:")
            print("=" * 80)
            
            if console_messages:
                print(f"\n   Total messages: {len(console_messages)}\n")
                for msg in console_messages:
                    print(f"   {msg}")
                
                # Check for errors
                errors = [m for m in console_messages if '[error]' in m.lower() or 'error' in m.lower()]
                warnings = [m for m in console_messages if '[warning]' in m.lower() or 'warning' in m.lower()]
                
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
            else:
                print("\n   ℹ️ No console messages")
            
            # Report page errors
            if page_errors:
                print(f"\n8. Page errors ({len(page_errors)}):")
                for err in page_errors:
                    print(f"   {err}")
            else:
                print("\n8. Page errors: None")
            
            # Summary
            print("\n" + "=" * 80)
            print("SUMMARY")
            print("=" * 80)
            
            has_styling = styling_check['backgroundColor'] != 'rgba(0, 0, 0, 0)' or styling_check['hasBootstrap']
            
            print(f"\n1. Page styling: {'✅ Present' if has_styling else '❌ Missing'}")
            print(f"2. Console errors: {len([m for m in console_messages if 'error' in m.lower()])}")
            print(f"3. CSP meta tag: {'✅ Present' if csp_check['exists'] else '❌ Not found'}")
            
            if bootstrap_check:
                loaded_count = sum(1 for link in bootstrap_check if link['loaded'])
                print(f"4. Bootstrap CSS: {loaded_count}/{len(bootstrap_check)} loaded")
            else:
                print(f"4. Bootstrap CSS: ❌ No links found")
            
            await asyncio.sleep(3)
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
