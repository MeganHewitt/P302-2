# Promotion Frequency and Baseline Erosion

## Project brief

Build a scroll-driven retail data story that examines whether frequent promotions create short-term sales while weakening the underlying, non-promotional sales base.

The story should be clear enough for a business audience to scan and should use charts and short explanatory chapters rather than a dashboard full of controls.

## Narrative

Use three categories across an 18-month period:

- Snacks: the warning case. Frequent promotions should coincide with a declining baseline, lower margin, and lower average transaction value.
- Household Cleaning: the stable comparison case. Baseline sales should remain broadly flat with moderate promotion activity.
- Personal Care: the healthier comparison case. Promotion frequency should be lowest, baseline sales should trend upward overall, and margin should remain strong.

The main argument is that total sales can hide a weakening baseline. Separate promotional sales from baseline sales so the reader can see the difference.

## Required story chapters

1. Overview: compare total sales across the three categories.
2. The split: show promotional sales versus baseline sales for the selected category.
3. The erosion: show baseline sales over time for all categories and annotate the Snacks decline.
4. The pattern: show SKU-level promotion frequency against baseline sales change using a scatter plot.
5. The takeaway: summarize the category comparison and the commercial implication.

The app should support category selection where useful, show progress through the story, and respond well to scrolling on desktop and mobile.

## Data requirements

Create `src/data/story.json` with 54 records: 18 months x 3 categories. Each record must include:

- `month`
- `category`
- `totalSales`
- `promoSales`
- `baselineSales`
- `marginRate`
- `promoWeeksThisMonth`
- `avgTransactionValue`

Create `src/data/skus.json` with 30 records: 10 SKUs per category. Each record must include:

- `id`
- `name`
- `category`
- `promoWeeksTotal`
- `baselineSalesDelta`

## Target data direction

The generated data does not need to represent a real retailer, but it must support the narrative:

- Snacks baseline change: approximately -18% over 18 months.
- Household Cleaning baseline change: approximately flat, around 0%.
- Personal Care baseline change: approximately +6%.
- Average promotion frequency should be highest for Snacks, moderate for Household Cleaning, and lowest for Personal Care.
- Snacks margin should decline over time; the other categories should remain comparatively stable.
- Snack SKUs should generally have negative baseline changes as promotion weeks increase.

## Implementation

Use local JSON data only. Build the experience with Vue 3 and TypeScript. Use Vuetify for the app shell and controls, and Chart.js through `vue-chartjs` for the visualizations.

Keep the visual design editorial and restrained: an off-white background, strong serif headings, readable body copy, clear category colors, and generous page spacing. The charts should support the narrative rather than overwhelm it.
