#!/usr/bin/env python3
"""Index prototype toast call sites that have not migrated to message IDs."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'krane-b2c.html'
target = ROOT / 'handoff' / 'runtime-copy-inventory.json'
lines = source.read_text(encoding='utf-8').splitlines()
rows = []
for number, line in enumerate(lines, 1):
    for match in re.finditer(r'\bshowActionToast\s*\(', line):
        if re.search(r'\bfunction\s+$', line[:match.start()]):
            continue
        snippet = line[match.start():].strip()
        if len(snippet) < 52 and number < len(lines):
            snippet += ' ' + lines[number].strip()
        rows.append({
            'source': 'krane-b2c.html',
            'line': number,
            'messageId': None,
            'callSite': snippet[:240],
        })
target.write_text(json.dumps({
    'description': 'Prototype toast call sites; null messageId means the copy is not yet wired to the ID catalog.',
    'count': len(rows),
    'items': rows,
}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{target.relative_to(ROOT)}: {len(rows)} toast call sites')
