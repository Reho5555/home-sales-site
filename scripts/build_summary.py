"""Build data/site_summary.json from data/college_town_home_sales.csv.

Run from the repository root:

    python3 scripts/build_summary.py

Uses only the Python standard library. The rules applied here are stated on the site:
- Prices: only sales of $10,000 or more are used for price figures.
- Price per sq ft: also needs living_area_sqft above 0.
- Days on market: contract_date minus list_date, only on rows that have both dates.
  A blank date is never treated as zero.
"""

import csv
import json
from collections import defaultdict
from datetime import date
from pathlib import Path
from statistics import median

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "college_town_home_sales.csv"
OUT = ROOT / "data" / "site_summary.json"

MIN_PRICE = 10_000
DISTANCE_BANDS = [(0, 1, "Under 1 mi"), (1, 3, "1–3 mi"), (3, 5, "3–5 mi"), (5, 99, "5 mi or more")]


def to_date(text):
    return date.fromisoformat(text) if text else None


def med(values):
    return round(median(values)) if values else None


def summarize(rows):
    priced = [r for r in rows if int(r["sale_price"]) >= MIN_PRICE]
    prices = [int(r["sale_price"]) for r in priced]
    ppsf = [
        int(r["sale_price"]) / int(r["living_area_sqft"])
        for r in priced
        if r["living_area_sqft"] and int(r["living_area_sqft"]) > 0
    ]
    dom = []
    for r in rows:
        listed, contract = to_date(r["list_date"]), to_date(r["contract_date"])
        if listed and contract:
            dom.append((contract - listed).days)

    by_year = defaultdict(list)
    for r in priced:
        if r["sale_date"]:
            by_year[r["sale_date"][:4]].append(int(r["sale_price"]))

    by_distance = []
    for lo, hi, label in DISTANCE_BANDS:
        band = [int(r["sale_price"]) for r in priced if lo <= float(r["miles_to_campus"]) < hi]
        by_distance.append({"band": label, "sales": len(band), "median_price": med(band)})

    return {
        "sales": len(rows),
        "priced_sales": len(priced),
        "median_price": med(prices),
        "median_price_per_sqft": med(ppsf),
        "price_per_sqft_sales": len(ppsf),
        "median_days_on_market": med(dom),
        "days_on_market_sales": len(dom),
        "median_price_by_year": {
            y: {"sales": len(v), "median_price": med(v)} for y, v in sorted(by_year.items())
        },
        "median_price_by_distance": by_distance,
    }


def main():
    with SRC.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    groups = defaultdict(list)
    for r in rows:
        groups[(r["city"], r["state"])].append(r)

    cities = []
    for (city, state), group in groups.items():
        universities = defaultdict(int)
        for r in group:
            universities[r["university"]] += 1
        entry = {"city": city, "state": state, "university": max(universities, key=universities.get)}
        entry.update(summarize(group))
        cities.append(entry)
    cities.sort(key=lambda c: -c["sales"])

    sale_dates = sorted(r["sale_date"] for r in rows if r["sale_date"])
    summary = {
        "source": "data/college_town_home_sales.csv",
        "rules": {
            "min_price": MIN_PRICE,
            "days_on_market": "contract_date minus list_date, rows with both dates only",
        },
        "first_sale_date": sale_dates[0],
        "last_sale_date": sale_dates[-1],
        "below_min_price": sum(1 for r in rows if int(r["sale_price"]) < MIN_PRICE),
        "overall": summarize(rows),
        "cities": cities,
    }
    OUT.write_text(json.dumps(summary, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {OUT.relative_to(ROOT)} with {len(cities)} cities from {len(rows)} rows")


if __name__ == "__main__":
    main()
