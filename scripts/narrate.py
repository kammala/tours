# /// script
# dependencies = ["pyyaml"]
# ///
import re
import subprocess
import sys
import time
from pathlib import Path

import yaml

VOICE = 'ru-RU-SvetlanaNeural'
ATTEMPTS = 4


def plain(md):
    lines = [l for l in md.splitlines() if not l.startswith('![') and not re.match(r'^\*(Фото|Photo)', l)]
    text = '\n'.join(lines)
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    text = re.sub(r'[*_]{1,2}([^*_]+)[*_]{1,2}', r'\1', text)
    text = text.replace('Совет:', 'Совет.')
    return re.sub(r'\n{2,}', '\n\n', text).strip()


def narration(point, script_path):
    if script_path.exists():
        return plain(script_path.read_text())
    return f"{point['name']['ru']}.\n\n{plain(point['short']['ru'])}\n\n{plain(point['long']['ru'])}"


def synthesize(text, target):
    for attempt in range(ATTEMPTS):
        result = subprocess.run(
            ['uvx', 'edge-tts', '--voice', VOICE, '--rate=-5%', '--text', text, '--write-media', str(target)],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0 and target.stat().st_size > 0:
            return
        print('retry', target, result.stderr.strip().splitlines()[-1:], flush=True)
        time.sleep(30 * (attempt + 1))
    raise SystemExit(f'failed: {target}')


def main():
    tour_path, only = Path(sys.argv[1]), set(sys.argv[2:])
    tour = yaml.safe_load(tour_path.read_text())
    for point in tour['points']:
        audio = point.get('audio', {}).get('ru')
        if not audio or (only and Path(audio).name not in only):
            continue
        target = Path('public') / audio
        target.parent.mkdir(parents=True, exist_ok=True)
        synthesize(narration(point, Path('audio-scripts') / Path(audio).relative_to('audio').with_suffix('.md')), target)
        print(target, flush=True)


main()
