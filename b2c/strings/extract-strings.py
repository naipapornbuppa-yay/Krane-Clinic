#!/usr/bin/env python3
"""Rebuild the string catalogue from krane-b2c.html.

Run from the b2c directory:  python3 strings/extract-strings.py

Copy lives in markup, so scripts, styles, comments and SVG sprites are dropped
first. Each screen is then sliced at its own closing </section>, counting nested
sections, so a string is always attributed to the screen it actually appears on.
"""
import re, io, json, html, os, sys
from collections import OrderedDict, defaultdict, deque

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

ROLE_RULES = [
    (r'<h1\b|class="[^"]*\bh1\b', 'title'),
    (r'<h2\b', 'title'),
    (r'<h3\b|form-group__title|section-label', 'heading'),
    (r'<button\b|class="[^"]*\bbtn\b', 'action'),
    (r'a-title', 'alertTitle'),
    (r'opt-title', 'option'),
    (r'<label\b', 'label'),
    (r'class="[^"]*\bhint\b|<small\b|class="[^"]*\bmuted\b', 'hint'),
    (r'<p\b', 'body'),
]

is_thai = lambda s: bool(re.search(r'[฀-๿]', s))


def role_for(tag):
    for pattern, name in ROLE_RULES:
        if re.search(pattern, tag):
            return name
    return 'text'


def strip_non_copy(raw):
    out = re.sub(r'<script\b[^>]*>.*?</script>', '', raw, flags=re.S)
    out = re.sub(r'<style\b[^>]*>.*?</style>', '', out, flags=re.S)
    out = re.sub(r'<!--.*?-->', '', out, flags=re.S)
    return re.sub(r'<svg\b.*?</svg>', '', out, flags=re.S)


def screen_spans(src):
    """Yield (screen id, inner markup) for every <section class="... screen ...">."""
    opener = r'<section[^>]*class="[^"]*\bscreen\b[^"]*"[^>]*id="([^"]+)"[^>]*>'
    for match in re.finditer(opener, src):
        sid, start, depth = match.group(1), match.end(), 1
        for token in re.finditer(r'<section\b|</section>', src[start:]):
            depth += 1 if token.group(0) == '<section' else -1
            if depth == 0:
                yield sid, src[start:start + token.start()]
                break


def thai_to_english():
    path = os.path.join(ROOT, 'th-en.js')
    if not os.path.exists(path):
        return {}
    text = io.open(path, encoding='utf-8').read()
    pairs = re.finditer(r'"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"', text)
    return {m.group(1): m.group(2) for m in pairs if is_thai(m.group(1))}


def build_catalog(src, known_en):
    catalog = OrderedDict()
    for sid, chunk in screen_spans(src):
        counts = defaultdict(int)
        for match in re.finditer(r'(<[a-zA-Z][^>]*>)([^<>{}]+)<', chunk):
            tag = match.group(1)
            text = re.sub(r'\s+', ' ', html.unescape(match.group(2)).strip())
            if len(text) < 2 or not re.search(r'[A-Za-z฀-๿]', text):
                continue
            role = role_for(tag)
            counts[role] += 1
            key = '%s.%s%02d' % (sid, role, counts[role])
            if key in catalog:
                continue
            thai = text if is_thai(text) else ''
            catalog[key] = OrderedDict([
                ('th', thai),
                ('en', known_en.get(text, '') if is_thai(text) else text),
                ('screen', sid),
                ('role', role),
            ])
    return catalog


def param_name(expr):
    expr = expr.strip()
    if re.search(r'\?.*:', expr):
        return None                      # a whole-phrase branch, not a value slot
    if re.fullmatch(r'[A-Za-z_$][\w$]*', expr):
        return expr
    dotted = re.findall(r'\.([A-Za-z_$][\w$]*)', expr)
    if dotted:
        return dotted[-1]
    call = re.match(r'([A-Za-z_$][\w$]*)\(', expr)
    return call.group(1) if call else None


NOISE = re.compile(
    r'translate\(|calc\(|--\{|:field:|float-field|treatment-medicine-group'
    r'|\[data-|:scope|=\"|input\[|\[name=')


def build_dynamic(raw):
    rows, seen, n = OrderedDict(), set(), 0
    for match in re.finditer(r'`([^`\n]{4,200}?\$\{[^`]{0,160}?)`', raw):
        literal = match.group(1)
        if '<' in literal or 'class=' in literal or NOISE.search(literal):
            continue
        if not re.search(r'[A-Za-z฀-๿]{3}', literal):
            continue
        names = []

        def slot(m):
            name = param_name(m.group(1))
            names.append(name)
            return '{%s}' % name if name else '{choice}'

        pattern = re.sub(r'\$\{([^}]+)\}', slot, literal).strip()
        pattern = re.sub(r'\s+', ' ', pattern)
        if pattern in seen or NOISE.search(pattern):
            continue
        seen.add(pattern)
        n += 1
        rows['dynamic.msg%02d' % n] = OrderedDict([
            ('pattern', pattern),
            ('params', [x for x in names if x]),
            ('hasConditional', any(x is None for x in names)),
            ('lang', 'th' if is_thai(literal) else 'en'),
        ])
    return rows


def write(name, data):
    path = os.path.join(HERE, name)
    io.open(path, 'w', encoding='utf-8').write(
        json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    print('%-36s %d entries' % (name, len(data)))


def read(name):
    path = os.path.join(HERE, name)
    return json.load(io.open(path, encoding='utf-8')) if os.path.exists(path) else {}


def stable_catalog(generated, existing, dynamic=False):
    """Keep IDs for unchanged copy and mark removed copy as retired.

    The previous extractor numbered every string by page order. Inserting one
    label could therefore rename all later IDs. Matching the actual copy before
    allocating an ID makes this safe to rerun during developer handoff.
    """
    exact, loose, next_number = defaultdict(deque), defaultdict(deque), defaultdict(int)
    for key, row in existing.items():
        if dynamic:
            exact[(row.get('pattern'), row.get('lang'))].append(key)
            number = re.fullmatch(r'dynamic\.msg(\d+)', key)
            if number:
                next_number['dynamic'] = max(next_number['dynamic'], int(number.group(1)))
        else:
            copy = row.get('th') or row.get('en')
            exact[(row.get('screen'), row.get('role'), copy)].append(key)
            loose[(row.get('screen'), copy)].append(key)
            number = re.fullmatch(r'(.+)\.([a-zA-Z]+)(\d+)', key)
            if number:
                group = (number.group(1), number.group(2))
                next_number[group] = max(next_number[group], int(number.group(3)))

    result, used = OrderedDict(), set()
    for provisional, row in generated.items():
        if dynamic:
            queue = exact[(row['pattern'], row['lang'])]
        else:
            copy = row.get('th') or row.get('en')
            queue = exact[(row['screen'], row['role'], copy)]
        key = next((candidate for candidate in queue if candidate not in used), None)
        if key is None and not dynamic:
            key = next((candidate for candidate in loose[(row['screen'], copy)] if candidate not in used), None)
        if key is None:
            if dynamic:
                next_number['dynamic'] += 1
                key = 'dynamic.msg%02d' % next_number['dynamic']
            else:
                group = (row['screen'], row['role'])
                next_number[group] += 1
                key = '%s.%s%02d' % (group[0], group[1], next_number[group])
        used.add(key)
        result[key] = row

    for key, row in existing.items():
        if key not in used:
            result[key] = OrderedDict(row, status='retired')
    return result


def main():
    source = os.path.join(ROOT, 'krane-b2c.html')
    if not os.path.exists(source):
        sys.exit('cannot find %s' % source)
    raw = io.open(source, encoding='utf-8').read()
    catalog = stable_catalog(build_catalog(strip_non_copy(raw), thai_to_english()),
                             read('krane-strings.json'))
    dynamic = stable_catalog(build_dynamic(raw),
                             read('krane-strings-dynamic.json'), dynamic=True)
    write('krane-strings.json', catalog)
    write('krane-strings-dynamic.json', dynamic)
    write('krane-strings-missing-en.json', OrderedDict(
        (k, v['th']) for k, v in catalog.items()
        if v.get('status') != 'retired' and v['th'] and not v['en']))


if __name__ == '__main__':
    main()
