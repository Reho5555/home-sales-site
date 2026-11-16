// Reads data/site_summary.json (made by scripts/build_summary.py) and fills the page.
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const count = new Intl.NumberFormat("en-US");

const FORMAT = {
  sales: (v) => count.format(v),
  days_on_market_sales: (v) => count.format(v),
  median_price: (v) => (v == null ? "–" : money.format(v)),
  median_price_per_sqft: (v) => (v == null ? "–" : money.format(v)),
  median_days_on_market: (v) => (v == null ? "–" : `${v} days`),
};
const METRIC_LABEL = {
  median_price: "Median sale price",
  median_price_per_sqft: "Median price / sq ft",
  median_days_on_market: "Median days on market",
  sales: "Number of sales",
};

let data;
let sortKey = "sales";
let sortDir = -1;
let selected = "all";

function fill(root, stats) {
  root.querySelectorAll("[data-fill]").forEach((el) => {
    const key = el.dataset.fill;
    if (key in stats) el.textContent = FORMAT[key](stats[key]);
  });
}

function cityId(c) {
  return `${c.city}, ${c.state}`;
}

function renderTable() {
  const metric = document.getElementById("metric").value;
  document.getElementById("bar-head").textContent = METRIC_LABEL[metric];
  const max = Math.max(...data.cities.map((c) => c[metric] || 0));

  const rows = [...data.cities].sort((a, b) => {
    const x = a[sortKey], y = b[sortKey];
    return typeof x === "string" ? sortDir * x.localeCompare(y) : sortDir * (x - y);
  });

  document.querySelectorAll("th[data-sort]").forEach((th) => {
    th.setAttribute("aria-sort", th.dataset.sort === sortKey ? (sortDir > 0 ? "ascending" : "descending") : "none");
  });

  const tbody = document.querySelector("#city-table tbody");
  tbody.innerHTML = "";
  for (const c of rows) {
    const tr = document.createElement("tr");
    tr.dataset.id = cityId(c);
    if (selected === cityId(c)) tr.classList.add("selected");
    const pct = max ? ((c[metric] || 0) / max) * 100 : 0;
    tr.innerHTML = `
      <td>${c.city}<span class="city-state">${c.state}</span></td>
      <td class="num">${FORMAT.sales(c.sales)}</td>
      <td class="num">${FORMAT.median_price(c.median_price)}</td>
      <td class="num">${FORMAT.median_price_per_sqft(c.median_price_per_sqft)}</td>
      <td class="num">${c.median_days_on_market ?? "–"}</td>
      <td><div class="bar-track" title="${FORMAT[metric](c[metric])}"><div class="bar-fill" style="width:${pct}%"></div></div></td>`;
    tr.addEventListener("click", () => selectCity(cityId(c), true));
    tbody.appendChild(tr);
  }
}

function barRows(container, items) {
  const max = Math.max(...items.map((i) => i.value || 0));
  container.innerHTML = "";
  for (const i of items) {
    const row = document.createElement("div");
    row.className = "bar-row" + (i.partial ? " partial" : "");
    const pct = max ? ((i.value || 0) / max) * 100 : 0;
    row.innerHTML = `
      <span class="label">${i.label}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
      <span class="value">${FORMAT.median_price(i.value)}<small>${count.format(i.sales)} sales</small></span>`;
    container.appendChild(row);
  }
}

function renderDetail() {
  const stats = selected === "all" ? data.overall : data.cities.find((c) => cityId(c) === selected);
  document.getElementById("detail-title").textContent = selected === "all" ? "All cities" : selected;
  document.getElementById("detail-sub").textContent =
    selected === "all"
      ? `${count.format(stats.sales)} sales across 18 cities.`
      : `Nearest campus: ${stats.university}. ${count.format(stats.sales)} sales, median ${FORMAT.median_price(stats.median_price)}.`;

  const lastYear = data.last_sale_date.slice(0, 4);
  const firstYear = data.first_sale_date.slice(0, 4);
  barRows(
    document.getElementById("year-bars"),
    Object.entries(stats.median_price_by_year).map(([year, v]) => ({
      label: year === lastYear || year === firstYear ? `${year}*` : year,
      value: v.median_price,
      sales: v.sales,
      partial: year === lastYear || year === firstYear,
    }))
  );
  document.getElementById("year-note").textContent =
    `* Partial year. Sales run from ${data.first_sale_date} to ${data.last_sale_date}.`;

  barRows(
    document.getElementById("distance-bars"),
    stats.median_price_by_distance.map((d) => ({ label: d.band, value: d.median_price, sales: d.sales }))
  );
}

function selectCity(id, scroll) {
  selected = id;
  document.getElementById("city-select").value = id;
  renderTable();
  renderDetail();
  if (scroll) document.getElementById("detail").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function main() {
  const res = await fetch("data/site_summary.json");
  data = await res.json();

  fill(document, data.overall);
  document.querySelectorAll("[data-fill-root]").forEach((el) => {
    el.textContent = count.format(data[el.dataset.fillRoot]);
  });
  document.getElementById("date-range").textContent =
    `${data.first_sale_date.slice(0, 4)}–${data.last_sale_date.slice(0, 4)}`;

  const select = document.getElementById("city-select");
  select.innerHTML = `<option value="all">All cities</option>` +
    [...data.cities].sort((a, b) => a.city.localeCompare(b.city))
      .map((c) => `<option value="${cityId(c)}">${cityId(c)}</option>`).join("");
  select.addEventListener("change", () => selectCity(select.value, false));

  document.getElementById("metric").addEventListener("change", renderTable);
  document.querySelectorAll("th[data-sort]").forEach((th) => {
    th.addEventListener("click", () => {
      if (sortKey === th.dataset.sort) sortDir = -sortDir;
      else { sortKey = th.dataset.sort; sortDir = sortKey === "city" ? 1 : -1; }
      renderTable();
    });
  });

  renderTable();
  renderDetail();
}

main().catch((err) => {
  document.querySelector("main").insertAdjacentHTML("afterbegin",
    `<p class="card">Could not load the data: ${err.message}</p>`);
});
