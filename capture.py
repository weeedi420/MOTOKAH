from playwright.sync_api import sync_playwright
import os

out_dir = "D:/remix-of-afriwheels-hub-main 2/remix-of-afriwheels-hub-main/screenshots"
os.makedirs(out_dir, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 800})
    
    print("Navigating to promo page...")
    page.goto("http://localhost:8080/promo", wait_until="networkidle")
    page.wait_for_timeout(2000)
    
    print("Clicking Premium Motion Ad...")
    page.click('button:has-text("Premium Motion Ad")')
    page.wait_for_timeout(1500)
    
    # Take screenshots at different timestamps
    timestamps = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 5.0, 6.0]
    
    for i, ts in enumerate(timestamps):
        # Seek video
        page.evaluate(f"""
            const video = document.querySelector('video');
            if (video) {{ video.currentTime = {ts}; video.pause(); }}
        """)
        page.wait_for_timeout(400)
        
        filename = f"frame-{i+1:02d}-{ts:.1f}s.png"
        page.screenshot(path=os.path.join(out_dir, filename))
        print(f"Screenshot: {filename}")
    
    # Full page screenshot
    page.screenshot(path=os.path.join(out_dir, "full-page.png"), full_page=True)
    print("Screenshot: full-page.png")
    
    browser.close()
    print("\nAll screenshots captured!")
