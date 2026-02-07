# WSU Financial Aid Index Charts

Standalone HTML/CSS/JavaScript index charts for **Weber State University** academic scholarships (new freshmen). Use SAT or ACT score and high school GPA to find your index score and see which scholarship you may receive.

## Live entry point

Open **`index.html`** in a browser to see the landing page with links to all three charts.

## Charts

| Page | Audience | File |
|------|----------|------|
| **Utah Resident** | In-state new freshmen | [indexchart.html](indexchart.html) |
| **Nonresident** | Out-of-state new freshmen | [NRindexchart.html](NRindexchart.html) |
| **International** | International new freshmen | [INTindexchart.html](INTindexchart.html) |

Each chart includes:

- Index score table (SAT/ACT × GPA)
- Color bands by scholarship tier
- Row/column crosshair on hover
- **Calculator**: enter test score and GPA to see your index score and eligible scholarship

## Project structure

- **`index.html`** — Landing page (start here)
- **`indexchart.html`** — Utah resident chart + calculator
- **`NRindexchart.html`** — Nonresident chart + calculator
- **`INTindexchart.html`** — International chart + calculator
- **`financial-aid-charts.css`** — Shared styles for all chart pages and landing
- **`wsu-css/`** — Weber State base CSS (framework, basecode, fonts)
- **`utah-index-calculator.js`**, **`nr-index-calculator.js`**, **`int-index-calculator.js`** — Calculator logic per chart
- **`int-index-chart-embed.js`** — Single-file script for International chart (for CMS/embed; crosshair + calculator)

## Running locally

1. Clone or download this repo.
2. Open `index.html` in a browser (or use a local server if you prefer).

No build step required. Charts work with the WSU CSS and the included JS files.

## Using on Weber CMS

For the **International** chart on apps.weber.edu (e.g. Display_Showcase_Dropdown):

- Paste the chart HTML into the page content (keep the structure: `.chart-page`, `#int-index-chart`, `.index-chart-table`, form with `name="score"` and `name="gpa"`).
- Add the script via template: host **`int-index-chart-embed.js`** and include it in the page template or &lt;head&gt;, **or** paste the contents of `int-index-chart-embed.js` into the CMS **Custom JavaScript** field.
- Load **`financial-aid-charts.css`** in the template or head.

See the comment block at the top of `INTindexchart.html` for more detail.

## Official info

Scholarship amounts and criteria: [Weber State University Financial Aid & Scholarships](https://www.weber.edu/FinancialAid/).

## License

This project is for reference and reuse in connection with Weber State University Financial Aid. Check with WSU for branding and usage guidelines.
