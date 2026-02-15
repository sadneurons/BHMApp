#!/usr/bin/env python3
"""
Browser automation script to test the BHM Assessment App
"""
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service

def main():
    # Set up Firefox options
    options = Options()
    options.binary_location = "/usr/bin/firefox"
    # Uncomment the next line to run headless (no GUI)
    # options.add_argument('--headless')
    
    # Set up service with geckodriver path
    service = Service("/snap/bin/geckodriver")
    
    # Create driver
    driver = webdriver.Firefox(service=service, options=options)
    driver.set_window_size(1920, 1080)
    
    try:
        print("=" * 60)
        print("BHM Assessment App - Browser Test")
        print("=" * 60)
        
        # Step 1: Navigate to the app
        print("\n1. Navigating to http://localhost:8765/index.html...")
        driver.get("http://localhost:8765/index.html")
        time.sleep(2)  # Wait for page to load
        
        # Take screenshot of initial state
        driver.save_screenshot("/home/tenebris/Desktop/BHMApp/screenshot_01_initial.png")
        print("   ✓ Screenshot saved: screenshot_01_initial.png")
        print(f"   ✓ Page title: {driver.title}")
        
        # Verify Session tab is active
        session_tab = driver.find_element(By.ID, "tab-session")
        if "active" in session_tab.get_attribute("class"):
            print("   ✓ Session tab is active (correct initial state)")
        else:
            print("   ✗ Session tab is NOT active (unexpected)")
        
        # Step 2: Click on Patient Booklet tab
        print("\n2. Clicking on 'Patient Booklet' tab...")
        patient_tab = driver.find_element(By.ID, "tab-patient")
        patient_tab.click()
        time.sleep(1)
        
        # Take screenshot showing sub-tabs
        driver.save_screenshot("/home/tenebris/Desktop/BHMApp/screenshot_02_patient_booklet.png")
        print("   ✓ Screenshot saved: screenshot_02_patient_booklet.png")
        
        # Verify sub-tabs are visible
        sub_tabs = driver.find_elements(By.CSS_SELECTOR, "#patientSubTabs .nav-link")
        sub_tab_names = [tab.text for tab in sub_tabs]
        print(f"   ✓ Sub-tabs visible: {', '.join(sub_tab_names)}")
        
        # Step 3: Click on PSQI sub-tab (should already be active)
        print("\n3. Verifying PSQI sub-tab...")
        psqi_tab = driver.find_element(By.CSS_SELECTOR, "#patientSubTabs .nav-link[data-bs-target='#sub-psqi']")
        if "active" not in psqi_tab.get_attribute("class"):
            psqi_tab.click()
            time.sleep(1)
        
        # Wait for PSQI content to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "psqiContent"))
        )
        
        # Take screenshot of PSQI content
        driver.save_screenshot("/home/tenebris/Desktop/BHMApp/screenshot_03_psqi.png")
        print("   ✓ Screenshot saved: screenshot_03_psqi.png")
        
        # Check for clickable grid
        try:
            grids = driver.find_elements(By.CSS_SELECTOR, ".clickable-grid")
            print(f"   ✓ Found {len(grids)} clickable grid(s)")
            
            # Look for Q5 grid specifically
            q5_grids = driver.find_elements(By.CSS_SELECTOR, "table.clickable-grid")
            if q5_grids:
                print(f"   ✓ PSQI Q5 grid is visible")
                
                # Get the first row of the first grid (Q5a - Cannot get to sleep)
                first_grid = q5_grids[0]
                rows = first_grid.find_elements(By.CSS_SELECTOR, "tbody tr")
                print(f"   ✓ Grid has {len(rows)} rows (sleep disturbance items)")
            else:
                print("   ✗ No clickable grids found")
        except Exception as e:
            print(f"   ✗ Error finding clickable grid: {e}")
        
        # Step 4: Try clicking on a cell
        print("\n4. Clicking on a cell in PSQI Q5 grid...")
        try:
            # Find the first clickable cell (Less than once a week for first item)
            # The grid structure is: thead with headers, tbody with rows
            # Each row has: item description | radio | radio | radio | radio
            first_cell = driver.find_element(By.CSS_SELECTOR, "table.clickable-grid tbody tr:first-child td:nth-child(2)")
            first_cell.click()
            time.sleep(0.5)
            
            driver.save_screenshot("/home/tenebris/Desktop/BHMApp/screenshot_04_cell_clicked.png")
            print("   ✓ Screenshot saved: screenshot_04_cell_clicked.png")
            print("   ✓ Cell clicked successfully")
            
            # Check if the cell is now selected (has 'selected' class)
            if "selected" in first_cell.get_attribute("class"):
                print("   ✓ Cell is now marked as selected")
            else:
                print("   ⚠ Cell clicked but no 'selected' class applied")
        except Exception as e:
            print(f"   ✗ Error clicking cell: {e}")
        
        # Step 5: Click Report button in navbar
        print("\n5. Clicking 'Report' button in navbar...")
        try:
            report_btn = driver.find_element(By.ID, "toggleReportPanelBtn")
            report_btn.click()
            time.sleep(1)
            
            driver.save_screenshot("/home/tenebris/Desktop/BHMApp/screenshot_05_report_panel.png")
            print("   ✓ Screenshot saved: screenshot_05_report_panel.png")
            
            # Check if side panel is visible
            side_panel = driver.find_element(By.ID, "reportSidePanel")
            if "collapsed" not in side_panel.get_attribute("class"):
                print("   ✓ Report side panel is now visible")
            else:
                print("   ✗ Report side panel is still collapsed")
        except Exception as e:
            print(f"   ✗ Error toggling report panel: {e}")
        
        # Check for JavaScript errors in console
        print("\n6. Checking for JavaScript errors...")
        try:
            logs = driver.get_log('browser')
            errors = [log for log in logs if log['level'] == 'SEVERE']
            if errors:
                print(f"   ✗ Found {len(errors)} JavaScript error(s):")
                for error in errors[:5]:  # Show first 5 errors
                    print(f"      - {error['message']}")
            else:
                print("   ✓ No JavaScript errors found")
        except Exception as e:
            print(f"   ⚠ Could not retrieve console logs: {e}")
        
        print("\n" + "=" * 60)
        print("Test completed! Screenshots saved to BHMApp directory.")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        driver.save_screenshot("/home/tenebris/Desktop/BHMApp/screenshot_error.png")
        print("Error screenshot saved: screenshot_error.png")
    finally:
        # Keep browser open for 3 seconds so user can see final state
        time.sleep(3)
        driver.quit()

if __name__ == "__main__":
    main()
