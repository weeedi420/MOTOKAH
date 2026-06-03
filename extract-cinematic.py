import subprocess
import os

video_path = "D:/remix-of-afriwheels-hub-main 2/remix-of-afriwheels-hub-main/out/premium-ad-cinematic.mp4"
output_dir = "D:/remix-of-afriwheels-hub-main 2/remix-of-afriwheels-hub-main/screenshots-cinematic"

os.makedirs(output_dir, exist_ok=True)

# Extract frames at key moments
timestamps = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5]

for i, ts in enumerate(timestamps):
    output_file = os.path.join(output_dir, f"cine-{i+1:02d}-{ts:.1f}s.png")
    cmd = [
        "ffmpeg", "-y", "-i", video_path,
        "-ss", str(ts), "-vframes", "1",
        "-vf", "scale=1280:720",
        output_file
    ]
    subprocess.run(cmd, capture_output=True)
    print(f"Frame {i+1} at {ts}s")

print("Done!")
