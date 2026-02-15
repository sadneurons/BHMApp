#!/usr/bin/env python3
"""
Inspect actual report HTML structure to see what elements exist
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
            print("REPORT STRUCTURE INSPECTION")
            print("=" * 80)
            
            # Load
            await page.goto("file:///home/tenebris/Desktop/BHMApp/dist/bhm-app.html", wait_until="domcontentloaded", timeout=60000)
            await asyncio.sleep(2)
            
            # Dismiss disclaimer
            try:
                await page.click("button:has-text('Continue')", timeout=3000)
                await asyncio.sleep(1)
            except:
                pass
            
            # Fill data
            await page.fill("input[placeholder*='shown on booklet']", "InspectTest")
            
            # Inject test data
            await page.evaluate("""
                BHM.State.set('instruments.psqi.q1', '23:00');
                BHM.State.set('instruments.psqi.q2', '30');
                BHM.State.set('instruments.psqi.q3', '06:30');
                BHM.State.set('instruments.psqi.q4', '6.5');
                ['a','b','c','d','e','f','g','h','i','j'].forEach(function(l,i){ BHM.State.set('instruments.psqi.q5'+l, i%4); });
                BHM.State.set('instruments.psqi.q6', 2);
                BHM.State.set('instruments.psqi.q7', 1);
                BHM.State.set('instruments.psqi.q8', 2);
                BHM.State.set('instruments.psqi.q9', 1);
                BHM.Scoring.psqi();
                
                for(var i=1;i<=7;i++) BHM.State.set('instruments.gad7.q'+i, i%4);
                BHM.Scoring.gad7();
                
                BHM.Report.update();
            """)
            await asyncio.sleep(1)
            
            # Go to Report tab
            await page.click("#tab-report")
            await asyncio.sleep(2)
            
            print("\n🔍 Inspecting report structure...\n")
            
            # Inspect report structure
            structure = await page.evaluate("""
                (() => {
                    const container = document.getElementById('reportFullContent');
                    if (!container) return { error: 'Report container not found' };
                    
                    return {
                        containerExists: true,
                        containerTag: container.tagName,
                        containerClasses: container.className,
                        childCount: container.children.length,
                        
                        // Count different element types
                        tables: container.querySelectorAll('table').length,
                        divs: container.querySelectorAll('div').length,
                        paragraphs: container.querySelectorAll('p').length,
                        headings: container.querySelectorAll('h1,h2,h3,h4,h5,h6').length,
                        lists: container.querySelectorAll('ul,ol').length,
                        
                        // Check for table-like structures
                        roleTable: container.querySelectorAll('[role="table"]').length,
                        classTable: container.querySelectorAll('.table').length,
                        tableResponsive: container.querySelectorAll('.table-responsive').length,
                        
                        // Get first few child elements
                        firstChildren: Array.from(container.children).slice(0, 10).map(el => ({
                            tag: el.tagName,
                            classes: el.className,
                            id: el.id,
                            text: el.textContent?.substring(0, 50)
                        }))
                    };
                })();
            """)
            
            print(f"Container: <{structure['containerTag']}> class='{structure['containerClasses']}'")
            print(f"Total children: {structure['childCount']}")
            print()
            print("Element counts:")
            print(f"  <table>: {structure['tables']}")
            print(f"  <div>: {structure['divs']}")
            print(f"  <p>: {structure['paragraphs']}")
            print(f"  <h1-h6>: {structure['headings']}")
            print(f"  <ul>/<ol>: {structure['lists']}")
            print()
            print("Table-like structures:")
            print(f"  [role='table']: {structure['roleTable']}")
            print(f"  .table: {structure['classTable']}")
            print(f"  .table-responsive: {structure['tableResponsive']}")
            print()
            print("First 10 child elements:")
            for i, child in enumerate(structure['firstChildren'], 1):
                print(f"  {i}. <{child['tag']}> class='{child['classes']}' id='{child['id']}'")
                if child['text']:
                    print(f"     Text: {child['text']}...")
            
            # Check if there are any tables anywhere in the document
            all_tables = await page.evaluate("document.querySelectorAll('table').length")
            print(f"\n📊 Total <table> elements in entire document: {all_tables}")
            
            if all_tables > 0:
                table_locations = await page.evaluate("""
                    Array.from(document.querySelectorAll('table')).map(t => ({
                        parent: t.parentElement?.tagName,
                        parentClass: t.parentElement?.className,
                        parentId: t.parentElement?.id,
                        rows: t.querySelectorAll('tr').length
                    }))
                """)
                print("\nTable locations:")
                for i, loc in enumerate(table_locations, 1):
                    print(f"  {i}. Parent: <{loc['parent']}> class='{loc['parentClass']}' id='{loc['parentId']}' ({loc['rows']} rows)")
            
            await asyncio.sleep(2)
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
