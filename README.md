# ☕ CoffeeNote

A clean, minimal web app for logging the coffees you drink — no backend, no dependencies, runs entirely in the browser.

## Features

- **Phone + password login** — create an account with your phone number; each user's journal is stored separately
- **Rich coffee logging** — searchable dropdowns for drink type, bean origin, varietal, process method, and roast profile
- **Tasting notes picker** — 120+ preset flavors across 15 categories (fruit, chocolate, floral, spice…) plus a custom note input
- **Personal notes & star rating** — free-text notes and a 1–5 star rating per entry
- **Journal view** — browse, search, and filter all your past entries
- **Stats** — total coffees logged, average rating, unique origins tried
- **CSV export** — download your entire log as a spreadsheet

## Getting Started

No installation or server needed. Just open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge).

```
open index.html
```

> **Note:** Because the app uses `localStorage`, your data is tied to the browser and device you use. Clearing browser storage will erase all entries. Use **Export CSV** regularly to back up your log.

## Project Structure

```
coffeenote/
├── index.html          # App shell & HTML structure
├── css/
│   └── style.css       # All styles (CSS variables, components, responsive)
├── js/
│   ├── db.js           # Coffee database — all dropdown option data
│   ├── auth.js         # Phone + password login / register
│   └── app.js          # Main app logic (form, history, stats, export)
└── README.md
```

## Coffee Database

`js/db.js` contains curated lists for:

| Field | Options |
|-------|---------|
| Drink Types | 31 options — espresso-based, filter/pour over, immersion, cold |
| Bean Origins | 52 origins across Africa, Americas, Caribbean, Asia-Pacific |
| Varietals | 46 varieties — classic Arabica, Ethiopian heirlooms, Kenyan, hybrid |
| Process Methods | 23 methods — washed, natural, honey, anaerobic, specialty |
| Roast Profiles | 14 profiles — light (cinnamon) through extra dark (Italian) |
| Tasting Notes | 120+ flavors across 15 flavor categories |

All dropdowns are searchable — start typing to filter.

## Customizing the Database

Open `js/db.js` and add items to any group array, or add a new group object:

```js
{ group: 'My Custom Group', items: ['Item A', 'Item B'] }
```

Changes appear immediately the next time you open the app.

## Browser Support

Works in all modern browsers. Requires JavaScript enabled.

## License

MIT
