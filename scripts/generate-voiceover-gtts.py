/**
 * Generate Motokah promo voiceover using gTTS (completely FREE)
 * Uses Google Translate's TTS - no API key needed!
 * 
 * Prerequisites:
 *   pip install gtts
 *   
 * Usage: python scripts/generate-voiceover-gtts.py
 * 
 * Note: gTTS has limited voice options (one per language)
 * but is 100% free and reliable.
 */

from gtts import gTTS
import os

TEXT = """Yo! Buying a car in East Africa used to be a headache. Endless WhatsApp groups, random listings, and sketchy prices? Not anymore! Motokah changes everything! Post your car in just two minutes — completely free! Buyers across Tanzania, Kenya, Uganda, Rwanda, Burundi, Ethiopia, Somalia, South Sudan, Djibouti, and DRC find you directly! No middlemen. No commission. Just your car, your price, your deal! Over ten thousand verified listings across ten countries on one massive platform! Motokah dot com! Let's go!"""

OUTPUT = "public/audio/voiceover.mp3"

# Ensure directory exists
os.makedirs("public/audio", exist_ok=True)

# Generate (English, slow=False for normal speed)
tts = gTTS(text=TEXT, lang='en', slow=False, tld='com')
tts.save(OUTPUT)

print(f"✓ Generated: {OUTPUT}")
print(f"  Size: {os.path.getsize(OUTPUT) / 1024:.0f} KB")
print("\nNote: gTTS has a single voice per language.")
print("For more voice options, use Microsoft Edge TTS (also free):")
print("  pip install edge-tts")
print("  edge-tts --voice en-US-GuyNeural --text \"...\" --write-media output.mp3")
