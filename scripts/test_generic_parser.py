#!/usr/bin/env python3

import json
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Tag

import scrape_eujc as base


REF_RE = re.compile(r'^\s*(?:Refrain|Ref)\s*:?\s*(.*)$', re.IGNORECASE)
TITLE_RE = re.compile(r'^\s*(\d+)\.\s*(.*?)\s*$')
NUMBERED_RE = re.compile(r'^\s*(\d+)\.\s*(.*)$')


def split_comment(lines):
    normal = []
    comments = []
    in_comment = False

    for line in lines:
        match = re.search(r'\bCom\s*:\s*', line, re.IGNORECASE)

        if match:
            before = base.clean_line(line[:match.start()])
            after = base.clean_line(line[match.end():])

            if before and not in_comment:
                normal.append(before)

            in_comment = True

            if after:
                comments.append(after)

            continue

        if in_comment:
            comments.append(line)
        else:
            normal.append(line)

    return normal, comments


def is_refrain(line):
    return REF_RE.match(line)


def parse_refrain(element):
    lines = base.html_lines(element)

    if lines:
        match = REF_RE.match(lines[0])

        if match:
            first = base.clean_line(match.group(1))

            if first:
                lines[0] = first
            else:
                lines = lines[1:]

    lines, comments = split_comment(lines)

    block = {
        "type": "refrain",
        "lines": lines
    }

    if comments:
        block["comment"] = comments

    return block


def parse_verse(element, number=None):
    lines = base.html_lines(element)

    explicit = None

    if lines:
        match = NUMBERED_RE.match(lines[0])

        if match:
            explicit = int(match.group(1))
            first = base.clean_line(match.group(2))

            if first:
                lines[0] = first
            else:
                lines = lines[1:]

    lines, comments = split_comment(lines)

    block = {
        "type": "verse",
        "number": explicit if explicit is not None else number,
        "lines": lines
    }

    if comments:
        block["comment"] = comments

    return block


def parse_other(element):
    lines = base.html_lines(element)

    if not lines:
        return None

    if is_refrain(lines[0]):
        return parse_refrain(element)

    match = NUMBERED_RE.match(lines[0])

    if match:
        return parse_verse(element, int(match.group(1)))

    return {
        "type": "source_block",
        "source_tag": element.name,
        "source_id": element.get("id"),
        "lines": lines
    }


def find_title(card):
    for element in card.find_all(["p", "h3"], recursive=True):
        text = base.clean_line(element.get_text(" ", strip=True))

        if TITLE_RE.match(text):
            number, title = TITLE_RE.match(text).groups()
            return element, number, title

    return None, None, None


def parse_card(card):
    title_element, number, title = find_title(card)

    if title_element is None:
        return None

    content = []
    ordered_list = card.find("ol")

    if ordered_list is not None:
        verse_number = 0

        for child in ordered_list.children:
            if isinstance(child, NavigableString):
                continue

            if not isinstance(child, Tag):
                continue

            name = child.name.lower()

            if name == "li":
                verse_number += 1
                content.append(parse_verse(child, verse_number))

            elif name in {"p", "h4"}:
                block = parse_other(child)

                if block:
                    content.append(block)

    else:
        for child in card.children:
            if isinstance(child, NavigableString):
                continue

            if not isinstance(child, Tag):
                continue

            if child is title_element:
                continue

            if child.name.lower() not in {"p", "h4", "h3"}:
                continue

            block = parse_other(child)

            if block:
                content.append(block)

    return {
        "source_position": None,
        "source_reference": {
            "number": number
        },
        "title": {
            "raw": title
        },
        "content": content,
        "media": {
            "audio_present": card.find("audio") is not None
        }
    }


def parse_page(path):
    html = Path(path).read_text(encoding="utf-8")
    html = base.repair_malformed_titles(html)

    soup = BeautifulSoup(html, "html.parser")

    cards = soup.select(".card4")

    if not cards:
        cards = soup.select(".card")

    records = []

    for position, card in enumerate(cards, start=1):
        record = parse_card(card)

        if record is None:
            continue

        record["source_position"] = position
        records.append(record)

    return records


def main():
    for filename in sys.argv[1:]:
        records = parse_page(filename)

        print(f"\n=== {filename} ===")
        print("ENTREES :", len(records))

        for record in records[:5]:
            types = [block["type"] for block in record["content"]]

            print(
                record["source_reference"]["number"],
                record["title"]["raw"],
                "=>",
                types,
                "audio=" + (
                    "yes"
                    if record["media"]["audio_present"]
                    else "no"
                )
            )


if __name__ == "__main__":
    main()
