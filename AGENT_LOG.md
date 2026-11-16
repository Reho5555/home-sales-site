# Agent log

Add a dated entry each time you work with your AI coding agent, with the newest entry at the bottom. Each entry records what you asked the agent, what it produced, and what you checked or changed. Paste your key prompts in exactly as you typed them. Include at least one time the agent got something wrong, and how you caught it.

Copy this outline for each entry:

```markdown
## YYYY-MM-DD: What you worked on

- **Asked:** "Paste your prompt here."
- **Agent produced:** What it made or changed.
- **Checked or changed:** How you checked it, and what you fixed.
```

## 2026-11-16: First version of the dashboard

- **Asked:** "我要給你什麼你才能做" (what do you need from me to build it), after creating the repository from the template, turning on GitHub Pages and adding the site address to About.
- **Agent produced:** Read `AGENTS.md` and `docs/data_description_sheet.md`, then wrote `scripts/build_summary.py`, which computes `data/site_summary.json` from the CSV. Replaced the placeholder `index.html` with a dashboard (`index.html`, `style.css`, `app.js`): headline figures, a sortable table of 18 cities, and per-city charts of median price by year and by distance to campus. Filled in the README.
- **Checked or changed:** Compared the city medians with the table in the description sheet: Gainesville $350,000, Madison $421,000 and Champaign $240,000 match, and Ann Arbor shows $572,000 against the sheet's $571,000 because the site leaves out sales under $10,000 while the sheet's table leaves out sales under $1,000. The year chart first looked as if prices fell in 2026, but 2026 only has sales through March 25 (and 2023 starts March 27), so both are now marked as partial years.
