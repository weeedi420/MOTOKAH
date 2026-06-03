import subprocess
import os

video_path = "D:/remix-of-afriwheels-hub-main 2/remix-of-afriwheels-hub-main/out/premium-ad-v3.mp4"
output_dir = "D:/remix-of-afriwheels-hub-main 2/remix-of-afriwheels-hub-main/screenshots-v3"

os.makedirs(output_dir, exist_ok=True)

# Extract key frames at specific timestamps
timestamps = [0, 1.5, 3, 4.5, 6]

for i, ts in enumerate(timestamps):
    output_file = os.path.join(output_dir, f"frame-{i+1:02d}-{ts:.1f}s.png")
    cmd = [
        "ffmpeg", "-y", "-i", video_path,
        "-ss", str(ts), "-vframes", "1",
        "-vf", "scale=1280:720",
        output_file
    ]
    subprocess.run(cmd, capture_output=True)
    print(f"Extracted frame at {ts}s")

print("Done! Frames saved to screenshots-v3/")
