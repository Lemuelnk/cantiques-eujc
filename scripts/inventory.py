import sys, re
from pathlib import Path
from pypdf import PdfReader

PDF_DIR = Path(sys.argv[1])
ROMAN = re.compile(r'^[IVXL]+\.\s+\S', re.MULTILINE)
NUM   = re.compile(r'^\d+\.\s+\S', re.MULTILINE)

# petits indices lexicaux de langue
INDICES = {
    'fr': ['le ', 'la ', 'les ', 'Dieu', 'Seigneur', 'Éternel', 'Jésus'],
    'ln': ['na ', 'ya ', 'mpe ', 'Nkolo', 'Nzambe', 'Yesu', 'bato'],
    'lu': ['ne ', 'wa ', 'mu ', 'Mfumu', 'Nzambe', 'Yesu', 'bantu'],
    'sw': ['na ', 'ya ', 'kwa ', 'Bwana', 'Mungu', 'Yesu', 'watu'],
}

def detect_lang(text):
    scores = {k: sum(text.count(w) for w in v) for k, v in INDICES.items()}
    best = max(scores, key=scores.get)
    return best, scores

for pdf in sorted(PDF_DIR.glob('*.pdf')):
    print('=' * 70)
    print(f"FICHIER : {pdf.name}")
    print(f"TAILLE  : {pdf.stat().st_size / 1024:.0f} Ko")
    try:
        r = PdfReader(str(pdf))
    except Exception as e:
        print(f"  !! erreur d'ouverture : {e}")
        continue
    n = len(r.pages)
    print(f"PAGES   : {n}")

    # page 1 : titre du recueil
    p1 = (r.pages[0].extract_text() or '')
    # page 3 : souvent table des matières
    p3 = (r.pages[2].extract_text() or '') if n >= 3 else ''

    # échantillon de texte pour langue
    sample = (p1 + p3)[:5000]
    lang, scores = detect_lang(sample)
    print(f"LANGUE  : ~{lang}  (scores: {scores})")

    # comptage indicatif de cantiques
    c_roman = len(ROMAN.findall(p3 or p1))
    c_num   = len(NUM.findall(p3 or p1))
    print(f"INDICES : romains={c_roman}  numérotés={c_num}")

    # aperçu de la page 1 (100 premiers caractères utiles)
    clean1 = ' '.join(p1.split())[:200]
    print(f"APERÇU  : {clean1}")
