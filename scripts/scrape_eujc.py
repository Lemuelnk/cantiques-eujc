#!/usr/bin/env python3

import json
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Tag


SCHEMA_VERSION = 3

TITLE_RE = re.compile(r'^\s*(\d+)\.\s*(.*?)\s*$')
REFRAIN_RE = re.compile(r'^\s*Refrain\s*:?\s*(.*)$', re.IGNORECASE)
COMMENT_RE = re.compile(r'^\s*Com\s*:?\s*$', re.IGNORECASE)


def clean_line(value):
    value = value.replace('\xa0', ' ')
    value = re.sub(r'[ \t]+', ' ', value)
    return value.strip()


def html_lines(element):
    lines = []
    current = []

    for node in element.descendants:
        if isinstance(node, NavigableString):
            parts = str(node).split('\n')

            for index, part in enumerate(parts):
                if part:
                    current.append(part)

                if index < len(parts) - 1:
                    line = clean_line(''.join(current))
                    if line:
                        lines.append(line)
                    current = []

        elif isinstance(node, Tag) and node.name.lower() == 'br':
            line = clean_line(''.join(current))
            if line:
                lines.append(line)
            current = []

    line = clean_line(''.join(current))
    if line:
        lines.append(line)

    return lines


def repair_malformed_titles(html):
    pattern = re.compile(
        r'(<p\s+id=["\']copy23["\'][^>]*>[^<]*?)</h[1-6]\s*>',
        re.IGNORECASE
    )

    return pattern.sub(r'\1</p>', html)


def parse_title(element):
    text = clean_line(element.get_text(" ", strip=True))
    match = TITLE_RE.match(text)

    if not match:
        return None, text

    return match.group(1), match.group(2)


def split_comment(lines):
    normal_lines = []
    comments = []
    in_comment = False

    for line in lines:
        # Com: peut être seul, ou suivi immédiatement du contenu.
        match = re.match(r'^\s*Com\s*:?\s*(.*)$', line, re.IGNORECASE)

        if match:
            in_comment = True

            remainder = clean_line(match.group(1))

            if remainder:
                comments.append(remainder)

            continue

        if in_comment:
            comments.append(line)
        else:
            normal_lines.append(line)

    return normal_lines, comments

def is_refrain_line(line):
    return re.match(
        r'^\s*Refrain\s*:?\s*(.*)$',
        line,
        re.IGNORECASE
    )


def parse_refrain(element):
    lines = html_lines(element)

    if lines:
        # Refrain: peut être seul sur sa ligne ou suivi immédiatement
        # du texte du refrain.
        match = re.match(
            r'^\s*Refrain\s*:?\s*(.*)$',
            lines[0],
            re.IGNORECASE
        )

        if match:
            first_content = clean_line(match.group(1))

            if first_content:
                lines[0] = first_content
            else:
                lines = lines[1:]

    lines, comments = split_comment(lines)

    return {
        "type": "refrain",
        "lines": lines,
        "comment": comments
    }


def parse_source_block(element):
    return {
        "type": "source_block",
        "source_tag": element.get("id"),
        "lines": html_lines(element)
    }


def parse_verse(element, number):
    lines = html_lines(element)
    lines, comments = split_comment(lines)

    block = {
        "type": "verse",
        "number": number,
        "lines": lines
    }

    if comments:
        block["comment"] = comments

    return block


def parse_content_container(container):
    """
    Parse les enfants directs du <ol> dans leur ordre réel.

    <li>       -> couplet
    <p>Refrain -> refrain
    autre <p>  -> bloc source
    """
    content = []
    verse_number = 0

    for child in container.children:

        if isinstance(child, NavigableString):
            continue

        if not isinstance(child, Tag):
            continue

        name = child.name.lower()

        if name == "li":
            lines = html_lines(child)

            if not lines:
                continue

            verse_number += 1
            content.append(
                parse_verse(child, verse_number)
            )
            continue

        if name == "p":
            lines = html_lines(child)

            if not lines:
                continue

            if is_refrain_line(lines[0]):
                content.append(
                    parse_refrain(child)
                )
            else:
                content.append(
                    parse_source_block(child)
                )

    return content


def parse_copy19(element):
    lines = html_lines(element)

    if not lines:
        return None

    if is_refrain_line(lines[0]):
        return parse_refrain(element)

    return parse_source_block(element)


def parse_card(card):
    title_element = card.find("p", id="copy23")

    if not title_element:
        return None

    numero_source, titre = parse_title(title_element)

    content = []

    ordered_list = card.find("ol")

    if ordered_list:
        content.extend(
            parse_content_container(ordered_list)
        )

        # Certains blocs copy19 peuvent être hors du <ol>.
        for element in card.find_all("p", id="copy19"):

            if element.find_parent("ol") is ordered_list:
                continue

            block = parse_copy19(element)

            if block:
                content.append(block)

    else:
        # Cas comme 184 : pas de <ol>, mais le cantique
        # contient tout de même un contenu exploitable.
        for element in card.find_all("p"):

            if element is title_element:
                continue

            if element.get("id") != "copy19":
                continue

            block = parse_copy19(element)

            if block:
                content.append(block)

    return {
        "source_position": None,
        "source_reference": {
            "number": numero_source
        },
        "title": {
            "raw": titre
        },
        "content": content,
        "media": {
            "audio_present": card.find("audio") is not None
        }
    }

def parse_page(path):
    html = Path(path).read_text(encoding="utf-8")

    # Réparation ciblée des titres mal fermés AVANT BeautifulSoup.
    html = repair_malformed_titles(html)

    soup = BeautifulSoup(html, "html.parser")

    taxonomy = {
        "category": {
            "source_label": "Cantiques du culte de Dimanche"
        },
        "subcategory": {
            "source_label": "Cantiques de Lounange"
        }
    }

    records = []

    for position, card in enumerate(
        soup.select(".card4"),
        start=1
    ):
        record = parse_card(card)

        if record is None:
            continue

        record["source_position"] = position
        record["taxonomy"] = taxonomy.copy()

        records.append(record)

    return records

def main():
    if len(sys.argv) < 2:
        print(
            "Usage: python scripts/scrape_eujc.py "
            "<page.html> [output.json]"
        )
        sys.exit(1)

    input_path = Path(sys.argv[1])

    if len(sys.argv) >= 3:
        output_path = Path(sys.argv[2])
    else:
        output_path = (
            Path("data/raw/eujc")
            / f"{input_path.stem}.json"
        )

    records = parse_page(input_path)

    output = {
        "schema_version": SCHEMA_VERSION,
        "source": {
            "type": "website",
            "site": "EUJC",
            "source_file": str(input_path)
        },
        "records": records
    }

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    output_path.write_text(
        json.dumps(
            output,
            ensure_ascii=False,
            indent=2
        ),
        encoding="utf-8"
    )

    print(f"Page    : {input_path}")
    print(f"Records : {len(records)}")
    print(f"Sortie  : {output_path}")
    print()

    for record in records:
        number = record["source_reference"]["number"]
        title = record["title"]["raw"]
        content = record["content"]

        types = ",".join(
            block["type"]
            for block in content
        )

        audio = (
            "yes"
            if record["media"]["audio_present"]
            else "no"
        )

        print(
            f"{number or '??':>3} "
            f"{title[:45]:45} "
            f"blocks={len(content):<2} "
            f"{types:<45} "
            f"audio={audio}"
        )


if __name__ == "__main__":
    main()
