import sys
from pypdf import PdfReader

pdf_path = sys.argv[1]
reader = PdfReader(pdf_path)

print(f"Fichier : {pdf_path}")
print(f"Nombre de pages : {len(reader.pages)}")
print(f"Métadonnées : {reader.metadata}")
print("=" * 60)

# Affiche le texte des 3 premières pages
for i in range(min(3, len(reader.pages))):
    page = reader.pages[i]
    text = page.extract_text() or ""
    print(f"\n--- PAGE {i + 1} ---")
    print(text[:2000])  # 2000 premiers caractères
    print(f"[... longueur totale du texte page : {len(text)} caractères]")
