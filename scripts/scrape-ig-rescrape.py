"""
Re-scrapes 31 dealers that had broken local image paths.
Gets fresh Instagram CDN URLs.
"""
import sys
sys.path.insert(0, '.')

# Import the main scraper's functions
import requests, json, os, time, random, re
from pathlib import Path

SESSION_ID    = "14667387564:DEDPyN3IhkDUuA:9:AYh5QWrd9kJZxYOLuyYNGaP8lIK-YU2tp1dwvwz_9Q"
SHOWROOMS_DIR = Path("src/data/showrooms")
MAX_POSTS     = 25
MIN_SLEEP     = 1.2
MAX_SLEEP     = 2.8

ACCOUNTS = [
    "extreme_biketz_", "hanami.japan",
]

CAR_KEYWORDS = ["toyota","nissan","honda","subaru","mazda","mitsubishi","bmw","mercedes","audi",
    "isuzu","suzuki","volkswagen","hyundai","kia","ford","hiace","prado","landcruiser",
    "harrier","fortuner","hilux","navara","patrol","pikipiki","bodaboda","canter","truck",
    "price","bei","tsh","kes","ugx","piaggio","boxer","scooter","bajaj","tvs","ktm",
    "import","japan","yamaha","kawasaki","ducati","mcc","cc","engine","mileage",
    "motorcycle","motorbike","ndugu","gari","magari","unauzwa","unauzwa",]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "x-ig-app-id": "936619743392459",
    "Referer": "https://www.instagram.com/",
}
COOKIES = {"sessionid": SESSION_ID}

def ig_get(url, retries=3):
    for attempt in range(retries):
        try:
            r = requests.get(url, headers=HEADERS, cookies=COOKIES, timeout=15)
            if r.status_code == 429:
                time.sleep(30 + attempt * 20); continue
            if r.status_code == 404: return None
            r.raise_for_status()
            return r.json()
        except Exception as e:
            if attempt == retries - 1: return None
            time.sleep(5 * (attempt + 1))
    return None

def is_car(caption):
    low = caption.lower()
    return any(kw in low for kw in CAR_KEYWORDS) or bool(re.search(r"\b(19|20)\d{2}\b", caption))

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

for i, username in enumerate(ACCOUNTS, 1):
    print(f"[{i}/{len(ACCOUNTS)}] @{username}", flush=True)
    out_path = SHOWROOMS_DIR / f"{username}.json"
    existing = {"username": username, "full_name": "", "phone": "", "posts": []}
    if out_path.exists():
        try: existing = json.loads(out_path.read_text(encoding="utf-8"))
        except: pass

    # Get user ID
    profile_data = ig_get(f"https://i.instagram.com/api/v1/users/web_profile_info/?username={username}")
    if not profile_data:
        print(f"  Could not fetch @{username}"); continue
    user = profile_data.get("data", {}).get("user") or {}
    user_id = user.get("id", "")
    full_name = user.get("full_name", existing.get("full_name", username))
    bio = user.get("biography", "")
    phone_m = re.search(r"\+?\d[\d\s\-\.]{8,16}", bio)
    phone = phone_m.group(0).strip() if phone_m else existing.get("phone", "")
    followers = user.get("edge_followed_by", {}).get("count", 0)
    safe_name = full_name.encode('ascii', errors='replace').decode()
    print(f"  {safe_name} | {followers} followers | id={user_id}", flush=True)
    time.sleep(random.uniform(MIN_SLEEP, MAX_SLEEP))

    new_posts = []
    max_id = None
    fetched = 0
    existing_codes = set(p.get("shortcode","") for p in existing.get("posts",[]))

    while fetched < MAX_POSTS:
        url = f"https://i.instagram.com/api/v1/feed/user/{user_id}/?count=12"
        if max_id: url += f"&max_id={max_id}"
        data = ig_get(url)
        if not data: break
        items = data.get("items", [])
        if not items: break

        for item in items:
            fetched += 1
            code = item.get("code", "")
            is_video = item.get("is_video", False) or item.get("media_type", 1) == 2
            caption = (item.get("caption") or {}).get("text", "") if isinstance(item.get("caption"), dict) else ""
            taken_at = item.get("taken_at", 0)
            date_str = time.strftime("%Y-%m-%dT%H:%M:%S+00:00", time.gmtime(taken_at)) if taken_at else ""
            post_url = f"https://www.instagram.com/p/{code}/"
            likes = item.get("like_count") or 0
            if code in existing_codes or is_video: continue
            if not is_car(caption): continue
            images = extract_images(item)
            if not images: continue
            new_posts.append({"shortcode": code, "date": date_str, "caption": caption[:800], "likes": likes, "images": images, "url": post_url})
            existing_codes.add(code)

        if not data.get("more_available"): break
        max_id = data.get("next_max_id")
        if not max_id: break
        time.sleep(random.uniform(MIN_SLEEP, MAX_SLEEP))

    result = {**existing, "username": username, "full_name": full_name, "bio": bio[:300],
              "phone": phone, "followers": followers, "scraped_at": time.strftime("%Y-%m-%dT%H:%M:%S+00:00", time.gmtime()),
              "posts": new_posts}
    out_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  Saved {len(new_posts)} posts with CDN images", flush=True)
    time.sleep(random.uniform(1.5, 3.0))

print("\nDone! All 31 dealers re-scraped with fresh CDN image URLs.")
