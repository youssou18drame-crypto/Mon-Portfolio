#!/usr/bin/env python3
"""Récupère des flux RSS/Atom publics et génère des données pour le portfolio."""
import datetime as dt
import email.utils
import html
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

FEEDS = [
    ("Le Monde Informatique", "https://www.lemondeinformatique.fr/flux-rss/thematique/intelligence-artificielle/rss.xml"),
    ("LinuxFr.org", "https://linuxfr.org/tags/intelligence_artificielle/public.atom"),
    ("Les Numériques", "https://www.lesnumeriques.com/intelligence-artificielle/rss.xml"),
    ("Le Monde", "https://www.lemonde.fr/intelligence-artificielle/rss_full.xml"),
    ("LinuxFr sécurité", "https://linuxfr.org/tags/securite/public.atom"),
    ("Le Monde Informatique sécurité", "https://www.lemondeinformatique.fr/flux-rss/thematique/securite/rss.xml"),
]
AI_KEYWORDS = ("intelligence artificielle", " ia ", "ia :", "ia,", "ia.", "agent", "copilot", "développe", "programm", "codage", "code ", "logiciel", "modèle", "llm", "open source", "open-source", "chatgpt", "mistral", "claude", "gemini", "automatis")

CYBER_KEYWORDS = ("cybersécur", "sécurit", "vulnérab", "faille", "pirat", "ransomware", "malware", "phishing", "authentification", "injection sql", "cve-", "attaque", "correctif")

ATOM = "{http://www.w3.org/2005/Atom}"

def clean(value):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]*>", " ", value or ""))).strip()

def date_iso(value):
    if not value:
        return ""
    try:
        return email.utils.parsedate_to_datetime(value).astimezone(dt.timezone.utc).isoformat()
    except (TypeError, ValueError):
        try:
            return dt.datetime.fromisoformat(value.replace("Z", "+00:00")).isoformat()
        except ValueError:
            return ""

def parse_feed(data, source):
    root = ET.fromstring(data)
    entries = []
    if root.tag.endswith("rss") or root.tag.endswith("RDF"):
        for item in root.findall(".//item"):
            def val(name):
                el = item.find(name)
                return "".join(el.itertext()) if el is not None else ""
            entries.append((val("title"), val("link"), val("description"), val("pubDate")))
    else:
        for item in root.findall(f"{ATOM}entry"):
            def val(name):
                el = item.find(f"{ATOM}{name}")
                return "".join(el.itertext()) if el is not None else ""
            links = item.findall(f"{ATOM}link")
            link = next((el.get("href", "") for el in links if el.get("rel", "alternate") == "alternate"), "")
            entries.append((val("title"), link, val("summary") or val("content"), val("published") or val("updated")))
    out = []
    for title, link, summary, published in entries:
        title, summary = clean(title), clean(summary)
        if not title or not link.startswith("https://"):
            continue
        topic = "cybersecurite" if any(k in title.lower() for k in CYBER_KEYWORDS) else ("ia" if any(k in title.lower() for k in AI_KEYWORDS) else "")
        if not topic:
            continue
        out.append({"title": title[:160], "url": link, "summary": summary[:240], "date": date_iso(published), "source": source, "topic": topic})
    return out

def main():
    all_items = []
    failures = []
    for name, url in FEEDS:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Portfolio-RSS-Reader/1.0"})
            with urllib.request.urlopen(req, timeout=25) as response:
                all_items.extend(parse_feed(response.read(2_000_000), name))
        except Exception as exc:
            failures.append(f"{name}: {exc}")
    target = Path("data/veille-rss.json")
    if not all_items:
        if target.exists():
            print("Flux indisponibles, conservation des données précédentes:", failures)
            return
        raise RuntimeError("Aucun flux RSS disponible: " + "; ".join(failures))
    unique = {}
    for item in all_items:
        unique.setdefault(item["url"].rstrip("/"), item)
    ordered = sorted(unique.values(), key=lambda x: x["date"], reverse=True)
    ai = next((item for item in ordered if item["topic"] == "ia"), None)
    cyber = next((item for item in ordered if item["topic"] == "cybersecurite" and (ai is None or item["source"] != ai["source"])), None)
    articles = [item for item in (ai, cyber) if item]
    if len(articles) < 2:
        print("Un sujet manque dans les flux : aucune actualité inventée.")
    payload = {"updated_at": dt.datetime.now(dt.timezone.utc).isoformat(), "feeds": [{"name": n, "url": u} for n, u in FEEDS], "articles": articles}
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(articles)} articles RSS sauvegardés. Erreurs: {failures}")

if __name__ == "__main__":
    main()
