"""
Instaloader batch downloader for Motokah car dealer profiles.
Downloads photos + captions (.txt) for all accounts.

Run with:
  python scripts/instaloader-run.py

It will ask for your Instagram username/password ONCE,
save a session file, then download all 25 accounts.
"""

import instaloader
import os
import sys
import getpass

OUTPUT_DIR = r"D:\ig-captions"

ACCOUNTS = [
    "lomaautos_",
    "khushimotorsdaressalaam",
    "mgayamotors",
    "ruge_magari",
    "rakincars.tz",
    "tgworldimports",
    "rwanko_motors",
    "fau_motors",
    "amjad_motors_international_ltd",
    "wazirmotor",
    "barari_motorstz",
    "breemotors",
    "fkmotorstanzania",
    "ezy_auto_motors",
    "manzese_showrooms",
    "evanamotors",
    "njari_motors",
    "cholloh_magari_tz",
    "magari_empire1",
    "al_husnainmotors",
    "faharimotors_sales",
    "dula_magari",
    "hanami.japan",
    "ndinga_bei_poa",
    "ukajapantz",
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
        for post in profile.get_posts():
            try:
                L.download_post(post, target=username)
                count += 1
            except Exception as e:
                print(f"  Skipped post {post.shortcode}: {e}")
        total_posts += count
        print(f"  Done: {count} posts")
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
