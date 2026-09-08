"""Rebuild the recorded host clips from a preserved source and reviewed cut points.

Requires ffmpeg and ffprobe on PATH; no speech model or API is used for cutting.
"""
from pathlib import Path
import hashlib
import json
import subprocess

ROOT = Path(__file__).resolve().parent.parent
spec = json.loads((ROOT / "docs/audio-cuts.json").read_text(encoding="utf-8"))
source = ROOT / spec["source"]
narration = json.loads((ROOT / "src/narration.json").read_text(encoding="utf-8"))
sha256 = lambda data: hashlib.sha256(data).hexdigest()
if sha256(source.read_bytes()) != spec["sourceSha256"]:
    raise SystemExit("Source hash differs from the reviewed recording. Review cut points first.")
if set(spec["clips"]) != set(narration):
    raise SystemExit("Cut list and narration IDs do not match.")

output = ROOT / "public/audio"
output.mkdir(parents=True, exist_ok=True)
manifest_path = output / "manifest.json"
manifest = {"ready": False, "provider": "user-recording", "clips": [], "assets": {},
            "sourceSha256": spec["sourceSha256"]}
manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
for clip_id, cut in spec["clips"].items():
    start, end = cut["start"], cut["end"]
    duration = end - start
    if not 0 <= start < end <= spec["sourceDuration"]:
        raise SystemExit(f"Invalid cut range: {clip_id}")
    if narration[clip_id]["file"] != f"audio/{clip_id}.mp3":
        raise SystemExit(f"Invalid clip path: {clip_id}")
    target = output / f"{clip_id}.mp3"
    # Re-encode from decoded samples for accurate boundaries, with short fades in silence.
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(source),
                    "-map_metadata", "-1", "-vn",
                    "-af", f"atrim=start={start}:end={end},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.01,afade=t=out:st={duration - 0.02:.4f}:d=0.02",
                    "-ar", "48000", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "128k", str(target)], check=True)
    probe = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries",
                         "format=duration", "-of", "json", str(target)], text=True))
    encoded_duration = float(probe["format"]["duration"])
    if abs(encoded_duration - duration) > 0.1:
        raise SystemExit(f"Unexpected output duration: {clip_id}")
    manifest["clips"].append(clip_id)
    manifest["assets"][clip_id] = {"start": start, "end": end, "duration": encoded_duration,
                                   "sha256": sha256(target.read_bytes()), "text": narration[clip_id]["text"]}
    print(f"{clip_id}: {start:.3f} - {end:.3f} ({encoded_duration:.3f}s)")
manifest["ready"] = True
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("All recorded clips are ready.")
