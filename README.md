# ☕ CoffeeNote

A clean, mobile-first web app for logging the coffees you drink.
Built with vanilla HTML/CSS/JS and **Supabase** as the backend database.

---

## Features

- **Phone + password login** — powered by Supabase Auth
- **Cloud database** — entries sync across all your devices via Supabase
- **Rich coffee logging** — searchable dropdowns for drink type, bean origin, varietal, process method, and roast profile
- **Brew Log** — save home brew recipes with coffee amount, water amount, temperature, extraction time, tasting notes, rating, and notes
- **Tasting notes picker** — 120+ preset flavors + custom note input
- **Personal notes & star rating** — free-text notes and 1–5 stars
- **Journal view** — browse, search, and filter all past entries with stats
- **CSV export** — download your entire log as a spreadsheet
- **Mobile-first** — optimized for iPhone and Android browsers

---

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **New project**, give it a name (e.g. `coffeenote`), set a database password, choose a region close to you
3. Wait ~1 minute for the project to spin up

### 2. Create the database tables

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Copy the contents of `sql/setup.sql` and paste it in
4. Click **Run**

### 3. Disable email confirmation

By default Supabase sends a confirmation email before allowing login.  
Since we use a phone number (not a real email), disable this:

1. Go to **Authentication** → **Providers** → **Email**
2. Turn **OFF** "Confirm email"
3. Click **Save**

### 4. Add your Supabase credentials

1. Go to **Project Settings** (gear icon) → **API**
2. Copy **Project URL** (looks like `https://xxxx.supabase.co`)
3. Copy **anon / public** key (long string starting with `eyJ…`)
4. Open `js/config.js` and replace the two placeholder values:

```js
const SUPABASE_URL      = 'https://xxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOi...';
```

### 5. Deploy to GitHub Pages

```bash
cd coffeenote
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/coffeenote.git
git push -u origin main
```

Then go to your repo **Settings → Pages → Branch: main** and click **Save**.  
Your app will be live at `https://YOUR_USERNAME.github.io/coffeenote/`.

---

## Project Structure

```
coffeenote/
├── index.html          # App shell
├── css/
│   └── style.css       # Mobile-first styles
├── js/
│   ├── config.js       # ← YOUR Supabase URL + key go here
│   ├── db.js           # Coffee dropdown data (120+ options)
│   ├── auth.js         # Supabase Auth (phone + password)
│   └── app.js          # CRUD, UI logic, CSV export
├── sql/
│   └── setup.sql       # Run once in Supabase SQL Editor
└── README.md
```

---

## Database Schema

```sql
coffee_entries
├── id            UUID (primary key)
├── user_id       UUID (links to Supabase Auth user)
├── drink_type    TEXT
├── location      TEXT
├── origin        TEXT
├── varietal      TEXT
├── process       TEXT
├── roast         TEXT
├── tasting_notes TEXT[]   (array of flavor notes)
├── notes         TEXT
├── entry_date    DATE
├── rating        INTEGER  (1–5)
└── created_at    TIMESTAMPTZ
```

```sql
brew_entries
├── id              UUID (primary key)
├── user_id         UUID (links to Supabase Auth user)
├── drink_type      TEXT
├── coffee_amount   NUMERIC
├── water_amount    NUMERIC
├── temperature     NUMERIC
├── extraction_time TEXT
├── origin          TEXT
├── varietal        TEXT
├── process         TEXT
├── roast           TEXT
├── tasting_notes   TEXT[]   (array of flavor notes)
├── notes           TEXT
├── entry_date      DATE
├── rating          INTEGER  (1–5)
└── created_at      TIMESTAMPTZ
```

Row Level Security is enabled — each user can only access their own entries.

---

## Local Development

No build tools needed. Just open `index.html` in a browser.  
Note: Supabase requires a real URL (not `file://`), so use a local server:

```bash
# Python
python -m http.server 8080

# Node
npx serve .
```

Then open `http://localhost:8080`.

---

## License

MIT
