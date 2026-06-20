"""
Instagram car scraper for Motokah — uses Instagram web API, uploads to Supabase Storage.
Usage: python scrape_instagram.py [account1] [account2] ...
Environment vars: INSTAGRAM_SESSION_ID, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
"""

import json, os, sys, re, time, requests, hashlib
from datetime import datetime, timezone
from urllib.parse import unquote
from pathlib import Path

try:
    from supabase import create_client
except ImportError:
    print("ERROR: pip install supabase")
    sys.exit(1)

RUN_LIMIT_HOURS = 10
_start_time = time.time()

def time_is_up():
    return (time.time() - _start_time) > RUN_LIMIT_HOURS * 3600

# ── Config ────────────────────────────────────────────────────────────────────
SESSION_ID  = os.getenv("INSTAGRAM_SESSION_ID", "")
IG_USERNAME = "motokahafrica"
IG_USER_ID  = "65726780869"

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://eiofmomywxcsezbyzjth.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

ACCOUNTS = [
    "_svgmotors", "al_husnainmotors", "amjad_motors_international_ltd", "barari_motorstz",
    "best_truck_tz", "bongoauto_groups", "boxerpoa", "breemotors", "cholloh_magari_tz",
    "discountmotors_sales", "dula_magari", "evanamotors", "extreme_biketz_", "ezy_auto_motors",
    "faharimotors_sales", "fam_motors_mwanza", "fau_motors", "fkmotorstanzania", "gody_motorstz",
    "hanami.japan", "harabmotorstzltd", "helianmotors", "hupa_motors_ltd", "jaja_motors",
    "jambo_magari", "justin_motors_ltd", "keepitkeens", "kei_cars", "khushimotorsdaressalaam",
    "kk_magic_cars_", "lomaautos_", "magari_empire1", "manzese_showrooms", "mapigo_saba_magari",
    "mcimotors", "mgayamotors", "mottocarsmarket", "mr_pikipiki", "msafiri_automobile_expert",
    "nathan__motors", "ndinga_bei_poa", "njari_motors", "pikipiki_quality_tanzania", "rakincars.tz",
    "ruge_magari", "rwanko_motors", "tajirimfupi_magari", "tera_automobiles", "tesha_pikipiki_usedtz",
    "tgworldimports", "twenderide", "ukajapantz", "urassa_motors_company_limited", "wazirmotor",
]

MAX_POSTS  = 50
# ─────────────────────────────────────────────────────────────────────────────

supabase = None

def init_supabase():
    global supabase
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required")
        sys.exit(1)
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print(f"Supabase connected: {SUPABASE_URL}")

def make_session() -> requests.Session:
    if not SESSION_ID:
        print("ERROR: INSTAGRAM_SESSION_ID env var required")
        sys.exit(1)

    s = requests.Session()
    cookie_val = unquote(SESSION_ID)

    s.headers.update({
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    })

    s.cookies.set("sessionid",  cookie_val, domain=".instagram.com")
    s.cookies.set("ds_user_id", IG_USER_ID, domain=".instagram.com")

    try:
        r = s.get("https://www.instagram.com/", timeout=20)
        print(f"  Warmup: HTTP {r.status_code}")
    except Exception as e:
        print(f"  Warmup failed: {e}")

    csrf = s.cookies.get("csrftoken", "missing")
    s.headers.update({
        "x-ig-app-id":      "936619743392459",
        "x-csrftoken":      csrf,
        "x-requested-with": "XMLHttpRequest",
        "Referer":          "https://www.instagram.com/",
        "Origin":           "https://www.instagram.com",
    })
    return s


def fetch_profile(sess: requests.Session, username: str) -> dict | None:
    url = f"https://www.instagram.com/api/v1/users/web_profile_info/?username={username}"
    try:
        r = sess.get(url, timeout=20)
        if r.status_code == 200:
            return r.json().get("data", {}).get("user")
        return None
    except Exception as e:
        print(f"  Profile fetch error: {e}")
        return None


def fetch_posts(sess: requests.Session, user_id: str, max_posts: int) -> list:
    posts = []
    cursor = None
    page = 0

    while len(posts) < max_posts:
        page += 1
        params = {
            "count": 12,
            "user_id": user_id,
        }
        if cursor:
            params["max_id"] = cursor

        url = "https://www.instagram.com/api/v1/feed/user/" + user_id + "/"
        try:
            r = sess.get(url, params=params, timeout=20)
            if r.status_code != 200:
                break
            data = r.json()
        except Exception as e:
            print(f"  Feed error: {e}")
            break

        items = data.get("items", [])
        if not items:
            break

        for item in items:
            if len(posts) >= max_posts:
                break
            posts.append(item)

        more = data.get("more_available", False)
        cursor = data.get("next_max_id")
        if not more or not cursor:
            break

        time.sleep(1.5)

    return posts


def extract_images(item: dict) -> list[str]:
    urls = []
    if "carousel_media" in item:
        for node in item["carousel_media"]:
            candidates = node.get("image_versions2", {}).get("candidates", [])
            if candidates:
                urls.append(candidates[0]["url"])
    else:
        candidates = item.get("image_versions2", {}).get("candidates", [])
        if candidates:
            urls.append(candidates[0]["url"])
    return urls


def is_car_post(caption: str) -> bool:
    if not caption:
        return False
    c = caption.lower()
    return bool(
        re.search(r"yom\s*:", c) or
        re.search(r"(ext|exterior)\s*:", c) or
        re.search(r"price.{0,20}(tzs|ksh|ugx|usd|\$)", c) or
        re.search(r"bei\s*[:\-]", c) or
        re.search(r"rangi\s*[:\-]", c) or
        re.search(r"model\s*[:\-]", c) or
        re.search(r"make\s*[:\-]", c) or
        re.search(r"\bcc\s*[:\-]", c) or
        re.search(r"mwaka\s*[:\-]", c) or
        re.search(r"\d{1,3}[,\.]?\d{3}\s*(tzs|ksh|tsh)", c) or
        re.search(r"(toyota|nissan|honda|subaru|bmw|mercedes|mitsubishi|mazda|isuzu|suzuki|land rover|yamaha|bajaj|tvs|ktm|piaggio|ducati)", c) or
        re.search(r"\b(pikipiki|bodaboda|motorbike|motorcycle)\b", c)
    )


def extract_phone(text: str) -> str:
    if not text:
        return ""
    m = re.search(r"[\+\d][\d\s\-\(\)]{6,}", text)
    return m.group(0).strip() if m else ""


def upload_image_to_supabase(sess: requests.Session, img_url: str, username: str, shortcode: str, idx: int) -> str | None:
    """Download image + upload to Supabase Storage. Return Supabase URL or None."""
    try:
        r = sess.get(img_url, timeout=30)
        if r.status_code != 200:
            return None

        image_data = r.content
        filename = f"{username}/{shortcode}_{idx}.jpg"

        try:
            supabase.storage.from_("listing-images").upload(
                file=image_data,
                path=filename,
                file_options={"content-type": "image/jpeg", "upsert": "true"}
            )

            # Return public URL
            url = f"{SUPABASE_URL}/storage/v1/object/public/listing-images/{filename}"
            return url
        except Exception as e:
            print(f"    Supabase upload error: {e}")
            return None

    except Exception as e:
        print(f"    Image download error: {e}")
        return None


def scrape_account(sess: requests.Session, username: str) -> dict:
    print(f"\n{'='*50}")
    print(f"Scraping: @{username}")
    print(f"{'='*50}")

    user = fetch_profile(sess, username)
    if not user:
        print(f"  ERROR: could not fetch @{username}")
        return {}

    uid       = user.get("id", "")
    full_name = user.get("full_name", username)
    bio       = user.get("biography", "")
    followers = user.get("edge_followed_by", {}).get("count", 0)
    website   = user.get("external_url", "") or ""
    phone     = extract_phone(bio)

    print(f"  Name     : {full_name[:60]}")
    print(f"  Followers: {followers:,}")
    print(f"  Phone    : {(phone or '(not in bio)')}")

    account_data = {
        "username":   username,
        "full_name":  full_name,
        "bio":        bio,
        "phone":      phone,
        "followers":  followers,
        "website":    website,
        "scraped_at": datetime.now(timezone.utc).isoformat(),
        "posts":      [],
    }

    raw_posts = fetch_posts(sess, uid, MAX_POSTS)
    print(f"  Fetched {len(raw_posts)} raw posts")

    for item in raw_posts:
        caption = (item.get("caption") or {}).get("text", "") or ""
        shortcode = item.get("code", item.get("pk", ""))
        taken_at  = item.get("taken_at", 0)
        likes     = item.get("like_count", 0)
        post_date = datetime.fromtimestamp(taken_at, tz=timezone.utc).isoformat() if taken_at else ""

        if not is_car_post(caption):
            continue

        image_urls = extract_images(item)
        supabase_urls = []

        for idx, img_url in enumerate(image_urls[:10], 1):
            url = upload_image_to_supabase(sess, img_url, username, str(shortcode), idx)
            if url:
                supabase_urls.append(url)

        if not supabase_urls:
            continue

        account_data["posts"].append({
            "shortcode": str(shortcode),
            "date":      post_date,
            "caption":   caption,
            "likes":     likes,
            "images":    supabase_urls,  # Now stored as Supabase URLs (permanent)
            "url":       f"https://www.instagram.com/p/{shortcode}/",
        })

        print(f"  [+] {shortcode}  {caption[:55]}")
        time.sleep(0.5)

    return account_data


def save_account_json(username: str, account_data: dict):
    """Save account data to src/data/showrooms/{username}.json"""
    json_dir = Path(__file__).parent.parent / "src" / "data" / "showrooms"
    json_dir.mkdir(parents=True, exist_ok=True)

    json_path = json_dir / f"{username}.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(account_data, f, ensure_ascii=False, indent=2)

    print(f"  Saved {len(account_data['posts'])} car posts -> {json_path.name}")


def main():
    accounts = sys.argv[1:] if len(sys.argv) > 1 else ACCOUNTS

    init_supabase()

    sess = make_session()
    print(f"Session ready for @{IG_USERNAME}")

    for username in accounts:
        if time_is_up():
            print(f"\nRun time limit reached, stopping.")
            break

        data = scrape_account(sess, username)
        if data:
            save_account_json(username, data)

        time.sleep(2)

    print(f"\n{'='*50}")
    print("Done!")


if __name__ == "__main__":
    main()
