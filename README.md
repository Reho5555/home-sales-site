# College-Town Home Prices

## What this site is for

A dashboard for anyone curious about buying a home near a university, such as students, staff and families. It compares 18 college towns on median sale price, price per square foot and days on market. For each city (or all cities together) it also shows how the median price changed by year and how it varies with distance to campus.

## Live site

https://reho5555.github.io/home-sales-site/

## Data notes

- **Prices** leave out the 40 sales under $10,000, which are not real market prices. The site uses medians, not averages, because a few sales run into the tens of millions.
- **Price per square foot** also leaves out homes with no living area or a living area of 0 (the description sheet's warning 5).
- **Days on market** is `contract_date - list_date`, counted only on the 28,042 sales that have both dates. A blank date is never treated as 0 (warning 1). `sale_date` is not used for it.
- **Sales** counts every row, using `listing_id` as the key. Nothing is deduplicated by address (warning 2).
- **`home_type`** is not used (warning 4).
- **Years:** sales run from 2023-03-27 to 2026-03-25, so 2023 and 2026 are partial years and are marked as such on the site.
- **Distance to campus** uses the dataset's `miles_to_campus`, which is straight-line distance.

### How to rebuild the summary file

The site reads `data/site_summary.json`, not the 9 MB CSV. To rebuild it from `data/college_town_home_sales.csv` (Python 3, standard library only):

```
python3 scripts/build_summary.py
```

## Tools we used

- Claude Code (Claude Opus 5.5) as the AI coding agent
- Plain HTML, CSS and JavaScript, with no libraries
- Python 3 for `scripts/build_summary.py`
- GitHub Pages for hosting

## Citation

College-town home sales dataset, version 1.0 (2026). University of Illinois-Deloitte Foundation Center for Business Emerging Technologies. Data collected March 2026.
