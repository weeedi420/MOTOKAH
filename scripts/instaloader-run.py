"""
Instaloader batch downloader for Motokah car dealer profiles.
Downloads photos + captions (.txt) for all accounts.
Skips videos/reels automatically (download_videos=False + is_video check).

Run with:
  python scripts/instaloader-run.py

It will ask for your Instagram username/password ONCE,
save a session file, then download all accounts.
"""

import instaloader
import os
import sys
import getpass

OUTPUT_DIR = r"D:\ig-captions"

# 53 unique East African car dealer accounts — sorted alphabetically
ACCOUNTS = [
    "_svgmotors",
    "al_husnainmotors",
    "amjad_motors_international_ltd",
    "barari_motorstz",
    "best_truck_tz",
    "bongoauto_groups",
    "boxerpoa",
    "breemotors",
    "cholloh_magari_tz",
    "discountmotors_sales",
    "dula_magari",
    "evanamotors",
    "extreme_biketz_",
    "ezy_auto_motors",
    "fam_motors_mwanza",
    "faharimotors_sales",
    "fau_motors",
    "fkmotorstanzania",
    "gody_motorstz",
    "hanami.japan",
    "harabmotorstzltd",
    "helianmotors",
    "hupa_motors_ltd",
    "jaja_motors",
    "jambo_magari",
    "justin_motors_ltd",
    "keepitkeens",
    "kei_cars",
    "khushimotorsdaressalaam",
    "kk_magic_cars_",
    "lomaautos_",
    "magari_empire1",
    "manzese_showrooms",
    "mapigo_saba_magari",
    "mcimotors",
    "mgayamotors",
    "mottocarsmarket",
    "mr_pikipiki",
    "msafiri_automobile_expert",
    "nathan__motors",
    "ndinga_bei_poa",
    "njari_motors",
    "pikipiki_quality_tanzania",
    "rakincars.tz",
    "ruge_magari",
    "rwanko_motors",
    "tajirimfupi_magari",
    "tera_automobiles",
    "tesha_pikipiki_usedtz",
    "tgworldimports",
    "twenderide",
    "ukajapantz",
    "urassa_motors_company_limited",
    "wazirmotor",
]

SESSION_FILE = os.path.join(os.path.expanduser("~"), ".motokah_ig_session")

os.makedirs(OUTPUT_DIR, exist_ok=True)

L = instaloader.Instaloader(
    dirname_pattern=os.path.join(OUTPUT_DIR, "{target}"),
    filename_pattern="{shortcode}",
    download_videos=False,
    download_video_thumbnails=False,
    download_geotags=False,
    download_comments=False,
    save_metadata=False,
    compress_json=False,
    post_metadata_txt_pattern="{caption}",   # saves caption as {shortcode}.txt
    storyitem_metadata_txt_pattern="",
    quiet=False,
)

# ── Login ────────────────────────────────────────────────────
if os.path.exists(SESSION_FILE):
    print(f"Loading saved session from {SESSION_FILE}")
    try:
        L.load_session_from_file("motokah_session", SESSION_FILE)
        print("Session loaded OK.\n")
    except Exception as e:
        print(f"Session load failed ({e}), logging in fresh...")
        os.remove(SESSION_FILE)

if not L.context.is_logged_in:
    print("=" * 50)
    print("  Instagram Login Required")
    print("=" * 50)
    username = input("Instagram username: ").strip()
    password = getpass.getpass("Instagram password: ")
    try:
        L.login(username, password)
        L.save_session_to_file(SESSION_FILE)
        print(f"\nLogged in as @{username}. Session saved.\n")
    except instaloader.exceptions.BadCredentialsException:
        print("\nWrong username or password. Try again.")
        sys.exit(1)
    except instaloader.exceptions.TwoFactorAuthRequiredException:
        code = input("Two-factor code: ").strip()
        L.two_factor_login(code)
        L.save_session_to_file(SESSION_FILE)
        print("Logged in with 2FA.\n")

# ── Download all accounts ─────────────────────────────────────
total_posts = 0
failed = []

for i, username in enumerate(ACCOUNTS, 1):
    print(f"\n[{i}/{len(ACCOUNTS)}] Downloading @{username} ...")
    try:
        profile = instaloader.Profile.from_username(L.context, username)
        count = 0
        skipped_reels = 0
        for post in profile.get_posts():
            if post.is_video:
                skipped_reels += 1
                continue  # skip reels and videos entirely
            try:
                L.download_post(post, target=username)
                count += 1
            except Exception as e:
                print(f"  Skipped post {post.shortcode}: {e}")
        total_posts += count
        print(f"  Done: {count} posts (skipped {skipped_reels} reels/videos)")
    except instaloader.exceptions.ProfileNotExistsException:
        print(f"  Profile @{username} not found — skipping")
        failed.append(username)
    except Exception as e:
        print(f"  Error on @{username}: {e}")
        failed.append(username)

print("\n" + "=" * 50)
print(f"Finished! {total_posts} posts downloaded to {OUTPUT_DIR}")
if failed:
    print(f"Failed accounts: {', '.join(failed)}")
print("\nNow run:")
print("  node scripts/parse-ig-captions.cjs")
