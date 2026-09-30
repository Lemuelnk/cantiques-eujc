from pathlib import Path
from urllib.parse import urljoin
from urllib.request import Request, urlopen
from bs4 import BeautifulSoup

BASE_URL = "http://eujc.church/"
INDEX_FILE = Path("resources/site/nos_cantiques.html")
OUTPUT_DIR = Path("resources/site")

def get_pages():
    html = INDEX_FILE.read_text(encoding="utf-8")
    soup = BeautifulSoup(html, "html.parser")

    pages = []

    excluded = {
        "index.html",
        "Nos contiques.html",
        "nos_cantiques_en_audio.html",
        "nos_videos.html",
        "dictionnaire biblique.html",
        "VocSpi.html",
        "simon.html",
    }

    for option in soup.select("option[value]"):
        value = option.get("value", "").strip()
        label = option.get_text(" ", strip=True)

        if not value or not value.lower().endswith(".html"):
            continue

        if value in excluded:
            continue

        pages.append({
            "file": value,
            "label": label,
            "url": urljoin(BASE_URL, value),
        })

    return pages



def download(url):
    request = Request(
        url,
        headers={"User-Agent": "Mozilla/5.0"}
    )

    with urlopen(request, timeout=30) as response:
        return response.read()


if __name__ == "__main__":
    pages = get_pages()
    print("Pages trouvées :", len(pages))
    print()

    for page in pages:
        output = OUTPUT_DIR / page["file"]
        print(page["file"], end=" ... ")

        try:
            data = download(page["url"])
            output.write_bytes(data)
            print("OK", len(data), "octets")
        except Exception as exc:
            print("ERREUR", exc)
