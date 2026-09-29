from pathlib import Path
from bs4 import BeautifulSoup

SITE_DIR = Path("resources/site")

for path in sorted(SITE_DIR.glob("*.html")):
    if path.name == "nos_cantiques.html":
        continue

    html = path.read_text(encoding="utf-8")
    soup = BeautifulSoup(html, "html.parser")

    cards = soup.select(".card4")
    titles = soup.select(".card4 #copy23")
    lists = soup.select(".card4 ol")
    refrains = soup.find_all(string=lambda s: s and "Refrain" in s)
    comments = soup.find_all(string=lambda s: s and "Com:" in s)
    audios = soup.select(".card4 audio")

    print(f"{path.name:<38} cards={len(cards):3} titles={len(titles):3} ol={len(lists):3} refrain={len(refrains):3} com={len(comments):3} audio={len(audios):3}")
