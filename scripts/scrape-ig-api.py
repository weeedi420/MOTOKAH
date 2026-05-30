"""
Motokah Instagram API scraper.
Uses the private Instagram mobile API (no graphql, works with session cookie).
Outputs showroom JSONs to src/data/showrooms/{username}.json

Run:
  python scripts/scrape-ig-api.py

Images stored as direct CDN URLs (no download needed).
"""

import requests
import json
import os
import sys
import time
import random
import re
from pathlib import Path
from tqdm import tqdm

# ── Config ────────────────────────────────────────────────────────────────────

SESSION_ID    = "14667387564:DEDPyN3IhkDUuA:9:AYh5QWrd9kJZxYOLuyYNGaP8lIK-YU2tp1dwvwz_9Q"
SHOWROOMS_DIR = Path(__file__).parent.parent / "src" / "data" / "showrooms"
LOG_FILE      = Path(r"D:\ig-scraper-log.txt")
MAX_POSTS     = 200   # per account (set higher to grab more)
MIN_SLEEP     = 1.5   # seconds between requests (be polite)
MAX_SLEEP     = 3.5

ACCOUNTS = [
    "_svgmotors", "al_husnainmotors", "amjad_motors_international_ltd",
    "barari_motorstz", "best_truck_tz", "bongoauto_groups", "boxerpoa",
    "breemotors", "cholloh_magari_tz", "discountmotors_sales", "dula_magari",
    "evanamotors", "extreme_biketz_", "ezy_auto_motors", "fam_motors_mwanza",
    "faharimotors_sales", "fau_motors", "fkmotorstanzania", "gody_motorstz",
    "hanami.japan", "harabmotorstzltd", "helianmotors", "hupa_motors_ltd",
    "jaja_motors", "jambo_magari", "justin_motors_ltd", "keepitkeens",
    "kei_cars", "khushimotorsdaressalaam", "kk_magic_cars_", "lomaautos_",
    "magari_empire1", "manzese_showrooms", "mapigo_saba_magari", "mcimotors",
    "mgayamotors", "mottocarsmarket", "mr_pikipiki", "msafiri_automobile_expert",
    "nathan__motors", "ndinga_bei_poa", "njari_motors", "pikipiki_quality_tanzania",
    "rakincars.tz", "ruge_magari", "rwanko_motors", "tajirimfupi_magari",
    "tera_automobiles", "tesha_pikipiki_usedtz", "tgworldimports", "twenderide",
    "ukajapantz", "urassa_motors_company_limited", "wazirmotor",
]

# ── Helpers ───────────────────────────────────────────────────────────────────

SHOWROOMS_DIR.mkdir(parents=True, exist_ok=True)
LOG_FILE.parent.mkdir(parents=True, exist_ok=True)

def log(msg):
    safe = msg.encode("ascii", errors="replace").decode("ascii")
    print(safe, flush=True)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(msg + "\n")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "x-ig-app-id": "936619743392459",
    "Referer": "https://www.instagram.com/",
}
COOKIES = {"sessionid": SESSION_ID}

def ig_get(url, retries=3, **kwargs):
    for attempt in range(retries):
        try:
            r = requests.get(url, headers=HEADERS, cookies=COOKIES, timeout=15, **kwargs)
            if r.status_code == 429:
                wait = 30 + attempt * 20
                log(f"  Rate limited — sleeping {wait}s...")
                time.sleep(wait)
                continue
            if r.status_code == 404:
                return None
            r.raise_for_status()
            return r.json()
        except Exception as e:
            if attempt == retries - 1:
                log(f"  Request failed: {e}")
                return None
            time.sleep(5 * (attempt + 1))
    return None

def sleep():
    time.sleep(random.uniform(MIN_SLEEP, MAX_SLEEP))

# ── Car keyword filter ────────────────────────────────────────────────────────

CAR_KEYWORDS = [
    "toyota","nissan","honda","subaru","mazda","mitsubishi","bmw","mercedes",
    "audi","ford","range rover","land rover","maserati","yamaha","bajaj","tvs",
    "ktm","piaggio","isuzu","suzuki","vw","volkswagen","hyundai","kia",
    "hilux","prado","harrier","fortuner","rav4","navara","patrol","vitz","aqua",
    "canter","fuso","daladala","minibus","pikipiki","bodaboda","boda",
    "price","bei","cc","mileage","transmission","engine",
]

def is_car_post(caption: str, is_video: bool) -> bool:
    if is_video:
        return False
    low = caption.lower()
    return any(kw in low for kw in CAR_KEYWORDS) or bool(re.search(r"\b(19|20)\d{2}\b", caption))

# ── Extract images from post item ─────────────────────────────────────────────

def extract_images(item: dict) -> list:
    images = []
    if "carousel_media" in item:
        for m in item["carousel_media"]:
            cands = m.get("image_versions2", {}).get("candidates", [])
            if cands:
                # Pick highest resolution (first = biggest usually, but check)
                best = sorted(cands, key=lambda c: c.get("width", 0), reverse=True)
                images.append(best[0]["url"])
    elif item.get("image_versions2", {}).get("candidates"):
        cands = item["image_versions2"]["candidates"]
        best = sorted(cands, key=lambda c: c.get("width", 0), reverse=True)
        images.append(best[0]["url"])
    return images[:8]  # max 8 images

# ── Scrape one account ────────────────────────────────────────────────────────

def scrape_account(username: str, outer_bar=None) -> dict | None:
    log(f"\n  Getting profile for @{username}...")
    profile_data = ig_get(f"https://i.instagram.com/api/v1/users/web_profile_info/?username={username}")
    if not profile_data:
        log(f"  Could not fetch profile for @{username}")
        return None

    user = profile_data.get("data", {}).get("user") or {}
    if not user:
        log(f"  Profile @{username} not found or private")
        return None

    user_id    = user.get("id", "")
    full_name  = user.get("full_name", username)
    bio        = user.get("biography", "")
    followers  = user.get("edge_followed_by", {}).get("count", 0)
    website    = user.get("external_url", "")

    # Extract phone from bio
    phone_match = re.search(r"(\+?\d[\d\s\-\.]{8,16})", bio)
    phone = phone_match.group(0).strip() if phone_match else ""

    log(f"  @{username} | {full_name} | {followers} followers | id={user_id}")

    # Load existing JSON if present (merge — don't overwrite)
    out_path = SHOWROOMS_DIR / f"{username}.json"
    existing_posts = []
    existing_codes = set()
    if out_path.exists():
        try:
            existing = json.loads(out_path.read_text(encoding="utf-8"))
            existing_posts = existing.get("posts", [])
            existing_codes = {p.get("shortcode", p.get("url", "")) for p in existing_posts}
            if not phone and existing.get("phone"):
                phone = existing["phone"]
            if not full_name and existing.get("full_name"):
                full_name = existing["full_name"]
            log(f"  Existing JSON has {len(existing_posts)} posts — will add new ones")
        except Exception:
            pass

    # Paginate feed
    new_posts = []
    max_id = None
    fetched = 0

    post_bar = tqdm(
        total=MAX_POSTS,
        desc=f"  └─ {username[:18]}",
        unit="post",
        leave=False,
        colour="cyan",
        bar_format="  {desc}: {percentage:3.0f}%|{bar}| {n}/{total} posts [new:{postfix}]",
        dynamic_ncols=True,
    )

    while fetched < MAX_POSTS:
        url = f"https://i.instagram.com/api/v1/feed/user/{user_id}/?count=12"
        if max_id:
            url += f"&max_id={max_id}"

        data = ig_get(url)
        if not data:
            break

        items = data.get("items", [])
        if not items:
            break

        for item in items:
            fetched += 1
            post_bar.update(1)
            post_bar.set_postfix_str(str(len(new_posts)), refresh=True)

            code       = item.get("code", "")
            is_video   = item.get("is_video", False) or item.get("media_type", 1) == 2
            caption    = (item.get("caption") or {}).get("text", "") if isinstance(item.get("caption"), dict) else ""
            taken_at   = item.get("taken_at", 0)
            date_str   = time.strftime("%Y-%m-%dT%H:%M:%S+00:00", time.gmtime(taken_at)) if taken_at else ""
            post_url   = f"https://www.instagram.com/p/{code}/"
            likes      = (item.get("like_count") or 0)

            if code in existing_codes or post_url in existing_codes:
                continue
            if is_video:
                continue
            if not is_car_post(caption, False):
                continue

            images = extract_images(item)
            if not images:
                continue

            new_posts.append({
                "shortcode": code,
                "date":      date_str,
                "caption":   caption[:800],
                "likes":     likes,
                "images":    images,
                "url":       post_url,
            })
            existing_codes.add(code)

        if not data.get("more_available"):
            break
        max_id = data.get("next_max_id")
        if not max_id:
            break

        sleep()

    post_bar.close()

    total_posts = existing_posts + new_posts
    result = {
        "username":    username,
        "full_name":   full_name,
        "bio":         bio[:300],
        "phone":       phone,
        "followers":   followers,
        "website":     website,
        "scraped_at":  time.strftime("%Y-%m-%dT%H:%M:%S+00:00", time.gmtime()),
        "posts":       total_posts,
    }

    out_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    log(f"  Saved {len(new_posts)} new + {len(existing_posts)} existing posts → {out_path.name}")
    return result

# ── Main ──────────────────────────────────────────────────────────────────────

log(f"\n{'='*60}")
log(f"Motokah Instagram API Scraper")
log(f"Accounts: {len(ACCOUNTS)} | Max posts per account: {MAX_POSTS}")
log(f"Output: {SHOWROOMS_DIR}")
log(f"{'='*60}\n")

failed     = []
results    = {}

account_bar = tqdm(
    ACCOUNTS,
    desc="Dealers",
    unit="dealer",
    colour="green",
    bar_format="{desc}: {percentage:3.0f}%|{bar}| {n}/{total} {postfix}",
    dynamic_ncols=True,
)

for username in account_bar:
    account_bar.set_postfix_str(f"@{username}", refresh=True)
    log(f"\n[{ACCOUNTS.index(username)+1}/{len(ACCOUNTS)}] @{username}")
    try:
        result = scrape_account(username, account_bar)
        if result is None:
            failed.append(username)
        else:
            results[username] = len(result.get("posts", []))
        sleep()
    except KeyboardInterrupt:
        log("\nInterrupted by user.")
        break
    except Exception as e:
        log(f"  ERROR: {e}")
        failed.append(username)

account_bar.close()

log(f"\n{'='*60}")
log(f"Done! {len(results)} dealers scraped.")
for u, cnt in results.items():
    log(f"  {u}: {cnt} total posts")
if failed:
    log(f"\nFailed ({len(failed)}): {', '.join(failed)}")
log("\nCommit with: git add src/data/showrooms && git commit -m 'feat: refresh all showroom data'")
