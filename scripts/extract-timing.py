import subprocess
import json
import re

def detect_silence(audio_path):
    """Detect silence to find speech segments"""
    cmd = [
        'ffmpeg', '-i', audio_path,
        '-af', 'silencedetect=noise=-40dB:d=0.3',
        '-f', 'null', '-'
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    output = result.stderr
    
    # Parse silence detection output
    silence_starts = re.findall(r'silence_start: ([\d.]+)', output)
    silence_ends = re.findall(r'silence_end: ([\d.]+)', output)
    
    print("=== SILENCE DETECTION ===")
    print(f"Silence periods found: {len(silence_starts)}")
    
    # Calculate speech segments (between silences)
    speech_segments = []
    prev_end = 0
    
    for i, (start, end) in enumerate(zip(silence_starts, silence_ends)):
        if float(start) > prev_end:
            speech_segments.append({
                'start': prev_end,
                'end': float(start),
                'duration': float(start) - prev_end
            })
        prev_end = float(end)
    
    # Add final segment
    duration_cmd = ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', 
                    '-of', 'default=noprint_wrappers=1:nokey=1', audio_path]
    duration = float(subprocess.run(duration_cmd, capture_output=True, text=True).stdout.strip())
    
    if prev_end < duration:
        speech_segments.append({
            'start': prev_end,
            'end': duration,
            'duration': duration - prev_end
        })
    
    return speech_segments, duration

def main():
    audio_file = r"C:\Users\rapid\Downloads\ElevenLabs_2026-05-20T21_09_54_Ayinde - young British Nigerian_pvc_sp100_s50_sb75_se43_b_m2.mp3"
    
    print("Analyzing audio for speech segments...")
    segments, total_duration = detect_silence(audio_file)
    
    print(f"\nTotal Duration: {total_duration:.2f}s = {int(total_duration * 30)} frames")
    print("\n=== SPEECH SEGMENTS ===")
    
    for i, seg in enumerate(segments):
        start_frame = int(seg['start'] * 30)
        end_frame = int(seg['end'] * 30)
        print(f"\nSegment {i+1}:")
        print(f"  Time: {seg['start']:.2f}s - {seg['end']:.2f}s")
        print(f"  Frames: {start_frame} - {end_frame}")
        print(f"  Duration: {seg['duration']:.2f}s")
    
    # Generate timing template
    print("\n\n=== TIMING TEMPLATE ===")
    print("Copy this into src/remotion/timing.ts:\n")
    
    print(f"""export const T = {{
  s1:  0,     // Start
  s2:  {int(segments[0]['end'] * 30) if segments else 180},   // After first speech
  s3:  {int(segments[1]['start'] * 30) if len(segments) > 1 else 420},   // Next segment
  s4:  {int(segments[2]['start'] * 30) if len(segments) > 2 else 600},
  s5:  {int(segments[3]['start'] * 30) if len(segments) > 3 else 750},
  s6:  {int(segments[4]['start'] * 30) if len(segments) > 4 else 960},
  s7:  {int(segments[5]['start'] * 30) if len(segments) > 5 else 1260},
  s8:  {int(segments[6]['start'] * 30) if len(segments) > 6 else 1440},
  s9:  {int(segments[7]['start'] * 30) if len(segments) > 7 else 1590},
  s10: {int(segments[8]['start'] * 30) if len(segments) > 8 else 1740},
  end: {int(total_duration * 30)},
}};

export const TIMING = {{
  fps: 30,
  totalDuration: {int(total_duration * 30)},
  overlap: 12,
  audio: {{
    hasVoiceover: true,
    hasMusic: false,
    voiceoverVolume: 1,
    musicVolume: 0.18,
    sfxVolume: 0.7,
  }},
  scenes: {{
    s1_Hook:      0,
    s2_Problem:   {int(segments[0]['end'] * 30) if segments else 180},
    s3_Brand:     {int(segments[1]['start'] * 30) if len(segments) > 1 else 420},
    s4_Home:      {int(segments[2]['start'] * 30) if len(segments) > 2 else 600},
    s4b_PostCar:  {int(segments[3]['start'] * 30) if len(segments) > 3 else 750},
    s5_Coverage:  {int(segments[4]['start'] * 30) if len(segments) > 4 else 960},
    s6_Listing:   {int(segments[5]['start'] * 30) if len(segments) > 5 else 1260},
    s6b_Chat:     {int(segments[6]['start'] * 30) if len(segments) > 6 else 1440},
    s7_Stats:     {int(segments[7]['start'] * 30) if len(segments) > 7 else 1590},
    s8_CTA:       {int(segments[8]['start'] * 30) if len(segments) > 8 else 1740},
  }},
}};
""")

if __name__ == "__main__":
    main()
