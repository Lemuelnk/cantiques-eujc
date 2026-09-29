import re, json, sys
from pathlib import Path

ROMAN   = re.compile(r'^([IVXL]+)\.\s*$')
COUPLET = re.compile(r'^(\d+)\.\s*(.*)$')
REFRAIN = re.compile(r'^R[ée]\s*f\s*:?\s*(.*)$', re.IGNORECASE)
PAGE    = re.compile(r'^=+ PAGE \d+ / \d+ =+\s*$')

def parse(path):
    text = Path(path).read_text(encoding='utf-8')
    lines = [l.rstrip() for l in text.split('\n')]
    lines = [l for l in lines if not PAGE.match(l)]

    cantiques, i, n = [], 0, len(lines)
    while i < n:
        m = ROMAN.match(lines[i])
        if not m:
            i += 1
            continue
        numero = m.group(1)
        i += 1
        while i < n and not lines[i].strip():
            i += 1
        titre = lines[i].strip() if i < n else ""
        i += 1

        block = []
        while i < n and not ROMAN.match(lines[i]):
            block.append(lines[i])
            i += 1

        refrain_lines, couplets, cur, state = [], [], None, None
        for line in block:
            s = line.strip()
            if not s:
                continue
            if REFRAIN.match(s):
                state = 'refrain'
                r = REFRAIN.match(s).group(1)
                if r:
                    refrain_lines.append(r)
                continue
            cm = COUPLET.match(s)
            if cm:
                if cur is not None:
                    couplets.append(cur)
                cur = {'ordre': int(cm.group(1)), 'lignes': []}
                if cm.group(2):
                    cur['lignes'].append(cm.group(2))
                state = 'couplet'
                continue
            if state == 'couplet' and cur is not None:
                cur['lignes'].append(s)
            else:
                refrain_lines.append(s)
        if cur is not None:
            couplets.append(cur)

        cantiques.append({
            'numero_source': numero,
            'langue': 'fr',
            'titre': titre,
            'refrain': refrain_lines,
            'couplets': couplets,
        })
    return cantiques

if __name__ == '__main__':
    data = parse(sys.argv[1])
    out = sys.argv[2] if len(sys.argv) > 2 else None
    txt = json.dumps(data, ensure_ascii=False, indent=2)
    if out:
        Path(out).write_text(txt, encoding='utf-8')
        print(f"Écrit : {out}")
        print(f"Cantiques extraits : {len(data)}")
        for c in data:
            print(f"  {c['numero_source']:>6}  {c['titre'][:50]:<50}  "
                  f"refrain={len(c['refrain'])} lignes, "
                  f"couplets={len(c['couplets'])}")
    else:
        print(txt)
