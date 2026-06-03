"""
Refresh expired Instagram CDN image URLs for all existing showroom JSONs.
Run AFTER scrape-ig-api.py to fix broken images on older posts.

Strategy:
- For each dealer, fetch their feed from Instagram API
- For any post already in our JSON, update the images[] with fresh CDN URLs
- Also sorts posts newest-first so fresh images appear at top
"""
import requests, json, time, random, re
from pathlib import Path

SESSION_ID    = "14667387564:DEDPyN3IhkDUuA:9:AYh5QWrd9kJZxYOLuyYNGaP8lIK-YU2tp1dwvwz_9Q"
SHOWROOMS_DIR = Path("src/data/showrooms")
MIN_SLEEP, MAX_SLEEP = 1.2, 2.8

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "x-ig-app-id": "936619743392459",
    "Referer": "https://www.instagram.com/",
}
COOKIES = {"sessionid": SESSION_ID}

def ig_get(url):
    for attempt in range(3):
        try:
            r = requests.get(url, headers=HEADERS, cookies=COOKIES, timeout=15)
            if r.status_code == 429:
                time.sleep(40); continue
            if r.status_code in (404, 400): return None
            r.raise_for_status()
            return r.json()
        except Exception as e:
            if attempt == 2: return None
            time.sleep(5 * (attempt + 1))
    return None

def extract_images(item):
    images = []
    if "carousel_media" in item:
        for m in item["carousel_media"]:
            cands = m.get("image_versions2", {}).get("candidates", [])
            if cands:
                best = sorted(cands, key=lambda c: c.get("width", 0), reverse=True)
                images.append(best[0]["url"])
    elif item.get("image_versions2", {}).get("candidates"):
        cands = item["image_versions2"]["candidates"]
        best = sorted(cands, key=lambda c: c.get("width", 0), reverse=True)
        images.append(best[0]["url"])
    return images[:8]

def get_user_id(username):
    d = ig_get(f"https://i.instagram.com/api/v1/users/web_profile_info/?username={username}")
    if not d: return None
    return d.get("data", {}).get("user", {}).get("id")

json_files = sorted(SHOWROOMS_DIR.glob("*.json"))
print(f"Refreshing images for {len(json_files)} dealers...")

for json_path in json_files:
    try:
        data = json.loads(json_path.read_text(encoding="utf-8"))
    except Exception:
        continue

    username = data.get("username") or json_path.stem
    posts = data.get("posts", [])
    if not posts:
        continue

    print(f"\n[{username}] {len(posts)} posts", flush=True)

    # Build lookup: shortcode → post index
    code_to_idx = {p.get("shortcode", ""): i for i, p in enumerate(posts) if p.get("shortcode")}

    user_id = get_user_id(username)
    if not user_id:
        # Sort by date even if we can't refresh
        posts.sort(key=lambda p: p.get("date", ""), reverse=True)
        data["posts"] = posts
        json_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"  Could not get user_id — sorted only", flush=True)
        continue

    time.sleep(random.uniform(MIN_SLEEP, MAX_SLEEP))

    refreshed = 0
    max_id = None
    fetched = 0

    while fetched < 200:
        url = f"https://i.instagram.com/api/v1/feed/user/{user_id}/?count=12"
        if max_id:
            url += f"&max_id={max_id}"
        feed = ig_get(url)
        if not feed: break
        items = feed.get("items", [])
        if not items: break

        for item in items:
            fetched += 1
            code = item.get("code", "")
            if code not in code_to_idx:
                continue
            # Refresh images for this existing post
            fresh_imgs = extract_images(item)
            if fresh_imgs:
                posts[code_to_idx[code]]["images"] = fresh_imgs
                refreshed += 1

        if not feed.get("more_available"): break
        max_id = feed.get("next_max_id")
        if not max_id: break
        time.sleep(random.uniform(MIN_SLEEP, MAX_SLEEP))

    # Sort newest-first so fresh images appear first on dealer page
    posts.sort(key=lambda p: p.get("date", ""), reverse=True)
    data["posts"] = posts
    json_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  Refreshed {refreshed}/{len(posts)} image sets, sorted newest-first", flush=True)

print("\nDone — all images refreshed.")
