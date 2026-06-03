import subprocess
import os

video_path = "D:/remix-of-afriwheels-hub-main 2/remix-of-afriwheels-hub-main/out/premium-ad-v2.mp4"
output_dir = "D:/remix-of-afriwheels-hub-main 2/remix-of-afriwheels-hub-main/frames-detailed"

os.makedirs(output_dir, exist_ok=True)

# Extract EVERY frame (30fps = 210 frames total)
print("Extracting all 210 frames...")

cmd = [
    "ffmpeg", "-y", "-i", video_path,
    "-vf", "fps=30,scale=640:360",
    os.path.join(output_dir, "frame-%04d.png")
]

result = subprocess.run(cmd, capture_output=True, text=True)

if result.returncode == 0:
    frames = [f for f in os.listdir(output_dir) if f.endswith('.png')]
    print(f"Extracted {len(frames)} frames to {output_dir}")
else:
    print("Error:", result.stderr)
