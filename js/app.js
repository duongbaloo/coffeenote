/**
 * app.js — CoffeeNote main application
 * All data operations go through Supabase (_sb client from auth.js).
 * Depends on: db.js, auth.js (which exposes _sb and currentUser)
 */

/* ── App state ── */
let entries       = [];
let brewEntries   = [];
let rating        = 0;
let brewRating    = 0;
let selectedNotes = [];
let selectedBrewNotes = [];
let formValues    = { drinkType: '', origin: '', varietal: '', process: '', roast: '' };
let brewFormValues = { drinkType: '', origin: '', varietal: '', process: '', roast: '' };
let filterDrink   = '';
let filterRating  = '';
let activeTab      = 'log';

/* ══════════════════════════════════════════════
   DATA MAPPING  (Supabase snake_case ↔ JS camelCase)
══════════════════════════════════════════════ */
function toDb(entry) {
  return {
    user_id:       currentUser.id,
    drink_type:    entry.drinkType    || null,
    location:      entry.location     || null,
    origin:        entry.origin       || null,
    varietal:      entry.varietal     || null,
    process:       entry.process      || null,
    roast:         entry.roast        || null,
    tasting_notes: entry.tastingNotes || [],
    notes:         entry.notes        || null,
    entry_date:    entry.date         || null,
    rating:        entry.rating       || null,
  };
}

function fromDb(row) {
  return {
    id:           row.id,
    drinkType:    row.drink_type,
    location:     row.location,
    origin:       row.origin,
    varietal:     row.varietal,
    process:      row.process,
    roast:        row.roast,
    tastingNotes: row.tasting_notes || [],
    notes:        row.notes,
    date:         row.entry_date,
    rating:       row.rating,
    createdAt:    row.created_at,
  };
}

function toBrewDb(entry) {
  return {
    user_id:         currentUser.id,
    drink_type:      entry.drinkType    || null,
    coffee_amount:   entry.coffeeAmount || null,
    water_amount:    entry.waterAmount  || null,
    temperature:     entry.temperature  || null,
    extraction_time: entry.extractionTime || null,
    origin:          entry.origin       || null,
    varietal:        entry.varietal     || null,
    process:         entry.process      || null,
    roast:           entry.roast        || null,
    tasting_notes:   entry.tastingNotes || [],
    notes:           entry.notes        || null,
    entry_date:      entry.date         || null,
    rating:          entry.rating       || null,
  };
}

function fromBrewDb(row) {
  return {
    id:             row.id,
    drinkType:      row.drink_type,
    coffeeAmount:   row.coffee_amount,
    waterAmount:    row.water_amount,
    temperature:    row.temperature,
    extractionTime: row.extraction_time,
    origin:         row.origin,
    varietal:       row.varietal,
    process:        row.process,
    roast:          row.roast,
    tastingNotes:   row.tasting_notes || [],
    notes:          row.notes,
    date:           row.entry_date,
    rating:         row.rating,
    createdAt:      row.created_at,
  };
}

/* ══════════════════════════════════════════════
   SUPABASE CRUD
══════════════════════════════════════════════ */
async function loadUserData() {
  const { data, error } = await _sb
    .from('coffee_entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error('loadUserData:', error); return; }
  entries = (data || []).map(fromDb);

  const { data: brewData, error: brewError } = await _sb
    .from('brew_entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (brewError) {
    console.error('loadBrewData:', brewError);
    toast('Brew Log table missing — run sql/setup.sql in Supabase');
    brewEntries = [];
    return;
  }
  brewEntries = (brewData || []).map(fromBrewDb);
}

async function saveEntry() {
  if (!formValues.drinkType) { toast('Please select a drink type'); return; }

  setSaveLoading(true);

  const entry = {
    drinkType:    formValues.drinkType,
    location:     document.getElementById('f-location').value.trim(),
    origin:       formValues.origin,
    varietal:     formValues.varietal,
    process:      formValues.process,
    roast:        formValues.roast,
    tastingNotes: [...selectedNotes],
    notes:        document.getElementById('f-notes').value.trim(),
    date:         document.getElementById('f-date').value || today(),
    rating,
  };

  const { error } = await _sb
    .from('coffee_entries')
    .insert(toDb(entry));

  setSaveLoading(false);

  if (error) {
    console.error('saveEntry:', error);
    toast('Error saving entry — check your connection');
    return;
  }

  await loadUserData();
  resetForm();
  toast('Entry saved ✓');
}

async function deleteEntry(id) {
  if (!confirm('Delete this entry?')) return;

  const { error } = await _sb
    .from('coffee_entries')
    .delete()
    .eq('id', id);

  if (error) { console.error('deleteEntry:', error); toast('Error deleting entry'); return; }

  entries = entries.filter(e => e.id !== id);
  renderHistory();
  renderStats();
  toast('Entry deleted');
}

async function saveBrewEntry() {
  if (!brewFormValues.drinkType) { toast('Please select a drink type'); return; }

  setBrewSaveLoading(true);

  const entry = {
    drinkType:      brewFormValues.drinkType,
    coffeeAmount:   numberOrNull('b-coffeeAmount'),
    waterAmount:    numberOrNull('b-waterAmount'),
    temperature:    numberOrNull('b-temperature'),
    extractionTime: document.getElementById('b-extractionTime').value.trim(),
    origin:         brewFormValues.origin,
    varietal:       brewFormValues.varietal,
    process:        brewFormValues.process,
    roast:          brewFormValues.roast,
    tastingNotes:   [...selectedBrewNotes],
    notes:          document.getElementById('b-notes').value.trim(),
    date:           document.getElementById('b-date').value || today(),
    rating:         brewRating,
  };

  const { error } = await _sb
    .from('brew_entries')
    .insert(toBrewDb(entry));

  setBrewSaveLoading(false);

  if (error) {
    console.error('saveBrewEntry:', error);
    toast('Error saving brew — check Supabase setup');
    return;
  }

  await loadUserData();
  resetBrewForm();
  renderBrewHistory();
  renderBrewStats();
  toast('Brew saved ✓');
}

async function deleteBrewEntry(id) {
  if (!confirm('Delete this brew?')) return;

  const { error } = await _sb
    .from('brew_entries')
    .delete()
    .eq('id', id);

  if (error) { console.error('deleteBrewEntry:', error); toast('Error deleting brew'); return; }

  brewEntries = brewEntries.filter(e => e.id !== id);
  renderBrewHistory();
  renderBrewStats();
  toast('Brew deleted');
}

function setSaveLoading(on) {
  const btn = document.querySelector('.form-footer .btn-primary');
  if (!btn) return;
  btn.disabled    = on;
  btn.textContent = on ? 'Saving…' : 'Save Entry';
}

function setBrewSaveLoading(on) {
  const btn = document.getElementById('brewSaveBtn');
  if (!btn) return;
  btn.disabled    = on;
  btn.textContent = on ? 'Saving…' : 'Save Brew';
}

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
function today() {
  return new Date().toISOString().split('T')[0];
}

function numberOrNull(id) {
  const value = document.getElementById(id)?.value;
  return value === '' || value == null ? null : Number(value);
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2400);
}

/* ══════════════════════════════════════════════
   SEARCHABLE SELECT COMPONENT
══════════════════════════════════════════════ */
function makeSelect(containerId, groups, placeholder, onChange) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  wrap.innerHTML = '';

  const display = document.createElement('div');
  display.className   = 'select-display placeholder';
  display.textContent = placeholder;
  display.style.position = 'relative';

  const dropdown = document.createElement('div');
  dropdown.className = 'select-dropdown';

  const searchEl = document.createElement('input');
  searchEl.className   = 'select-search';
  searchEl.placeholder = 'Search…';
  searchEl.type        = 'text';

  const optList = document.createElement('div');
  optList.className = 'select-options';

  dropdown.appendChild(searchEl);
  dropdown.appendChild(optList);
  wrap.appendChild(display);
  wrap.appendChild(dropdown);

  let currentValue = '';

  function renderOptions(q) {
    q = (q || '').toLowerCase();
    optList.innerHTML = '';
    let any = false;

    groups.forEach(g => {
      const filtered = g.items.filter(it => !q || it.toLowerCase().includes(q));
      if (!filtered.length) return;
      any = true;

      const hdr = document.createElement('div');
      hdr.className   = 'select-group-header';
      hdr.textContent = g.group;
      optList.appendChild(hdr);

      filtered.forEach(item => {
        const opt = document.createElement('div');
        opt.className   = 'select-option' + (item === currentValue ? ' selected' : '');
        opt.textContent = item;
        opt.onclick = () => {
          currentValue = item;
          display.textContent = item;
          display.classList.remove('placeholder');
          closeDropdown();
          if (onChange) onChange(item);
        };
        optList.appendChild(opt);
      });
    });

    if (!any) {
      const none = document.createElement('div');
      none.className = 'select-option';
      none.style.color = 'var(--muted)';
      none.textContent = 'No results';
      optList.appendChild(none);
    }
  }

  function openDropdown() {
    document.querySelectorAll('.select-dropdown.open')
      .forEach(d => d.classList.remove('open'));
    dropdown.classList.add('open');
    searchEl.value = '';
    renderOptions('');
    searchEl.focus();
  }

  function closeDropdown() { dropdown.classList.remove('open'); }

  display.onclick = e => {
    e.stopPropagation();
    dropdown.classList.contains('open') ? closeDropdown() : openDropdown();
  };
  searchEl.oninput  = () => renderOptions(searchEl.value);
  searchEl.onkeydown = e => { if (e.key === 'Escape') closeDropdown(); };

  wrap._getValue = () => currentValue;
  wrap._setValue = v => {
    currentValue = v || '';
    if (v) { display.textContent = v; display.classList.remove('placeholder'); }
    else   { display.textContent = placeholder; display.classList.add('placeholder'); }
  };
}

document.addEventListener('click', () => {
  document.querySelectorAll('.select-dropdown.open')
    .forEach(d => d.classList.remove('open'));
});

/* ══════════════════════════════════════════════
   TASTING NOTES PICKER
══════════════════════════════════════════════ */
function buildNotesPicker(kind = 'coffee') {
  const isBrew = kind === 'brew';
  const cats = document.getElementById(isBrew ? 'brewNotesCategories' : 'notesCategories');
  const notesState = isBrew ? selectedBrewNotes : selectedNotes;
  if (!cats) return;
  cats.innerHTML = '';

  DB.tastingNotes.forEach(group => {
    const div = document.createElement('div');
    div.className = 'notes-category';
    div.innerHTML = `<div class="notes-cat-label">${group.group}</div><div class="notes-tags"></div>`;

    const tagsDiv = div.querySelector('.notes-tags');
    group.items.forEach(note => {
      const t = document.createElement('span');
      t.className   = 'notes-tag' + (notesState.includes(note) ? ' active' : '');
      t.textContent = note;
      t.onclick     = () => toggleNote(note, t, kind);
      tagsDiv.appendChild(t);
    });

    cats.appendChild(div);
  });

  renderNoteChips(kind);
}

function addCustomNote(kind = 'coffee') {
  const isBrew = kind === 'brew';
  const input = document.getElementById(isBrew ? 'brewCustomNoteInput' : 'customNoteInput');
  const val   = input.value.trim();
  if (!val) return;
  const notesState = isBrew ? selectedBrewNotes : selectedNotes;
  if (!notesState.includes(val)) {
    notesState.push(val);
    if (isBrew) selectedBrewNotes = notesState;
    else selectedNotes = notesState;
    renderNoteChips(kind);
  }
  input.value = '';
  input.focus();
}

function toggleNote(note, tagEl, kind = 'coffee') {
  const isBrew = kind === 'brew';
  let notesState = isBrew ? selectedBrewNotes : selectedNotes;
  if (notesState.includes(note)) {
    notesState = notesState.filter(n => n !== note);
    tagEl.classList.remove('active');
  } else {
    notesState.push(note);
    tagEl.classList.add('active');
  }
  if (isBrew) selectedBrewNotes = notesState;
  else selectedNotes = notesState;
  renderNoteChips(kind);
}

function removeNote(note, kind = 'coffee') {
  const isBrew = kind === 'brew';
  if (isBrew) selectedBrewNotes = selectedBrewNotes.filter(n => n !== note);
  else selectedNotes = selectedNotes.filter(n => n !== note);

  const pickerId = isBrew ? 'brewNotesPicker' : 'notesPicker';
  document.querySelectorAll(`#${pickerId} .notes-tag`)
    .forEach(t => { if (t.textContent === note) t.classList.remove('active'); });
  renderNoteChips(kind);
}

function renderNoteChips(kind = 'coffee') {
  const isBrew = kind === 'brew';
  const bar = document.getElementById(isBrew ? 'brewNotesSelectedBar' : 'notesSelectedBar');
  const notesState = isBrew ? selectedBrewNotes : selectedNotes;
  if (!bar) return;
  bar.innerHTML = '';

  if (!notesState.length) { bar.classList.add('empty'); return; }
  bar.classList.remove('empty');

  notesState.forEach(note => {
    const chip = document.createElement('span');
    chip.className = 'note-chip';
    const safe = note.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    chip.innerHTML = `${note} <span class="note-chip-x" onclick="removeNote('${safe}', '${kind}')">×</span>`;
    bar.appendChild(chip);
  });
}

/* ══════════════════════════════════════════════
   FORM INIT & RESET
══════════════════════════════════════════════ */
function initForm() {
  makeSelect('sw-drinkType', DB.drinkTypes,    'Select drink type…', v => { formValues.drinkType = v; });
  makeSelect('sw-origin',    DB.origins,        'Select origin…',     v => { formValues.origin    = v; });
  makeSelect('sw-varietal',  DB.varietals,      'Select varietal…',   v => { formValues.varietal  = v; });
  makeSelect('sw-process',   DB.processMethods, 'Select process…',    v => { formValues.process   = v; });
  makeSelect('sw-roast',     DB.roastProfiles,  'Select roast…',      v => { formValues.roast     = v; });

  makeSelect('bw-drinkType', DB.drinkTypes,    'Select drink type…', v => { brewFormValues.drinkType = v; });
  makeSelect('bw-origin',    DB.origins,        'Select origin…',     v => { brewFormValues.origin    = v; });
  makeSelect('bw-varietal',  DB.varietals,      'Select varietal…',   v => { brewFormValues.varietal  = v; });
  makeSelect('bw-process',   DB.processMethods, 'Select process…',    v => { brewFormValues.process   = v; });
  makeSelect('bw-roast',     DB.roastProfiles,  'Select roast…',      v => { brewFormValues.roast     = v; });

  const dateEl = document.getElementById('f-date');
  if (dateEl) dateEl.value = today();
  const brewDateEl = document.getElementById('b-date');
  if (brewDateEl) brewDateEl.value = today();

  selectedNotes = [];
  selectedBrewNotes = [];
  rating        = 0;
  brewRating    = 0;
  buildNotesPicker();
  buildNotesPicker('brew');
  renderBrewHistory();
  renderBrewStats();
}

function resetForm() {
  ['sw-drinkType','sw-origin','sw-varietal','sw-process','sw-roast'].forEach(id => {
    const w = document.getElementById(id);
    if (w && w._setValue) w._setValue('');
  });

  formValues = { drinkType: '', origin: '', varietal: '', process: '', roast: '' };

  const loc   = document.getElementById('f-location');
  const notes = document.getElementById('f-notes');
  const date  = document.getElementById('f-date');
  const ci    = document.getElementById('customNoteInput');
  if (loc)   loc.value   = '';
  if (notes) notes.value = '';
  if (date)  date.value  = today();
  if (ci)    ci.value    = '';

  selectedNotes = [];
  rating        = 0;
  document.querySelectorAll('#starInput .star').forEach(s => s.classList.remove('lit'));
  buildNotesPicker();
}

function resetBrewForm() {
  ['bw-drinkType','bw-origin','bw-varietal','bw-process','bw-roast'].forEach(id => {
    const w = document.getElementById(id);
    if (w && w._setValue) w._setValue('');
  });

  brewFormValues = { drinkType: '', origin: '', varietal: '', process: '', roast: '' };

  ['b-coffeeAmount','b-waterAmount','b-temperature','b-extractionTime','b-notes','brewCustomNoteInput'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  const date = document.getElementById('b-date');
  if (date) date.value = today();

  selectedBrewNotes = [];
  brewRating = 0;
  document.querySelectorAll('#brewStarInput .star').forEach(s => s.classList.remove('lit'));
  buildNotesPicker('brew');
}

/* ══════════════════════════════════════════════
   TABS
══════════════════════════════════════════════ */
function showTab(tab) {
  activeTab = tab;
  document.getElementById('tab-log').style.display     = tab === 'log'     ? '' : 'none';
  document.getElementById('tab-brew').style.display    = tab === 'brew'    ? '' : 'none';
  document.getElementById('tab-history').style.display = tab === 'history' ? '' : 'none';

  document.querySelectorAll('.tab').forEach((el, i) => {
    el.classList.toggle('active',
      (tab === 'log' && i === 0) || (tab === 'brew' && i === 1) || (tab === 'history' && i === 2)
    );
  });

  if (tab === 'brew') {
    renderBrewHistory();
    renderBrewStats();
  }

  if (tab === 'history') {
    initFilterSelects();
    renderHistory();
    renderStats();
  }
}

function initFilterSelects() {
  const types = [...new Set(entries.map(e => e.drinkType).filter(Boolean))].sort();
  const drinkGroups = types.length
    ? [{ group: 'Drink Types', items: types }]
    : [{ group: 'No entries yet', items: [] }];

  makeSelect('fw-filterDrink', drinkGroups, 'All drink types', v => {
    filterDrink = v; renderHistory();
  });
  makeSelect('fw-filterRating',
    [{ group: 'Minimum Rating', items: ['★★★★★ (5)', '★★★★ & up (4)', '★★★ & up (3)'] }],
    'Any rating',
    v => { filterRating = v ? parseInt(v.match(/\d+/)[0]) : ''; renderHistory(); }
  );
}

/* ══════════════════════════════════════════════
   STAR RATING
══════════════════════════════════════════════ */
function setRating(val) {
  rating = val;
  document.querySelectorAll('#starInput .star')
    .forEach((s, i) => s.classList.toggle('lit', i < val));
}

function setBrewRating(val) {
  brewRating = val;
  document.querySelectorAll('#brewStarInput .star')
    .forEach((s, i) => s.classList.toggle('lit', i < val));
}

/* ══════════════════════════════════════════════
   HISTORY
══════════════════════════════════════════════ */
function renderHistory() {
  const q = (document.getElementById('searchInput')?.value || '').toLowerCase();

  const list = entries.filter(e => {
    if (filterDrink  && e.drinkType !== filterDrink)     return false;
    if (filterRating && (e.rating || 0) < filterRating)  return false;
    if (q) {
      const hay = [
        e.drinkType, e.origin, e.varietal, e.process, e.roast,
        (e.tastingNotes || []).join(' '), e.notes, e.location,
      ].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const container = document.getElementById('entries');
  if (!list.length) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon">☕</div>
        <p>${entries.length ? 'No entries match your filters.' : 'No entries yet — log your first coffee!'}</p>
      </div>`;
    return;
  }
  container.innerHTML = list.map(entryHTML).join('');
}

function entryHTML(e) {
  const stars = Array.from({ length: 5 }, (_, i) =>
    `<span class="${i < (e.rating || 0) ? 'lit' : 'dim'}">★</span>`
  ).join('');

  const notes = e.tastingNotes || [];

  const tags = [
    e.origin   && `<span class="tag">${e.origin}</span>`,
    e.varietal && `<span class="tag">${e.varietal}</span>`,
    e.process  && `<span class="tag gray">${e.process}</span>`,
    e.roast    && `<span class="tag gray">${e.roast}</span>`,
  ].filter(Boolean).join('');

  const noteChips = notes.map(n => `<span class="tag amber">${n}</span>`).join('');

  const dateStr = e.date
    ? new Date(e.date + 'T12:00:00').toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : '';

  return `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-main">
          <div class="entry-drink">${e.drinkType || '—'}</div>
          <div class="entry-meta">${e.location || '<span style="color:#bbb">No location</span>'}</div>
        </div>
        <div class="entry-date">${dateStr}</div>
      </div>
      ${tags      ? `<div class="entry-tags">${tags}</div>`      : ''}
      ${noteChips ? `<div class="entry-tags">${noteChips}</div>` : ''}
      ${e.notes   ? `<div class="entry-notes">${e.notes}</div>`  : ''}
      <div class="entry-footer">
        <div class="entry-stars">${stars}</div>
        <button type="button" class="btn-danger" onclick="deleteEntry('${e.id}')">Delete</button>
      </div>
    </div>`;
}

function renderBrewHistory() {
  const container = document.getElementById('brewEntries');
  if (!container) return;

  if (!brewEntries.length) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon">☕</div>
        <p>No brews yet — save your first recipe.</p>
      </div>`;
    return;
  }

  container.innerHTML = brewEntries.map(brewEntryHTML).join('');
}

function brewEntryHTML(e) {
  const stars = Array.from({ length: 5 }, (_, i) =>
    `<span class="${i < (e.rating || 0) ? 'lit' : 'dim'}">★</span>`
  ).join('');

  const notes = e.tastingNotes || [];

  const beanTags = [
    e.origin   && `<span class="tag">${e.origin}</span>`,
    e.varietal && `<span class="tag">${e.varietal}</span>`,
    e.process  && `<span class="tag gray">${e.process}</span>`,
    e.roast    && `<span class="tag gray">${e.roast}</span>`,
  ].filter(Boolean).join('');

  const measureTags = [
    e.coffeeAmount   != null && `<span class="tag measure">${e.coffeeAmount}g coffee</span>`,
    e.waterAmount    != null && `<span class="tag measure">${e.waterAmount}g water</span>`,
    e.temperature    != null && `<span class="tag measure">${e.temperature}°C</span>`,
    e.extractionTime && `<span class="tag measure">${e.extractionTime}</span>`,
  ].filter(Boolean).join('');

  const noteChips = notes.map(n => `<span class="tag amber">${n}</span>`).join('');

  const dateStr = e.date
    ? new Date(e.date + 'T12:00:00').toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : '';

  return `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-main">
          <div class="entry-drink">${e.drinkType || '—'}</div>
          <div class="entry-meta">Brew recipe</div>
        </div>
        <div class="entry-date">${dateStr}</div>
      </div>
      ${measureTags ? `<div class="entry-tags">${measureTags}</div>` : ''}
      ${beanTags    ? `<div class="entry-tags">${beanTags}</div>`    : ''}
      ${noteChips   ? `<div class="entry-tags">${noteChips}</div>`   : ''}
      ${e.notes     ? `<div class="entry-notes">${e.notes}</div>`    : ''}
      <div class="entry-footer">
        <div class="entry-stars">${stars}</div>
        <button type="button" class="btn-danger" onclick="deleteBrewEntry('${e.id}')">Delete</button>
      </div>
    </div>`;
}

/* ══════════════════════════════════════════════
   STATS
══════════════════════════════════════════════ */
function renderStats() {
  const total   = entries.length;
  const rated   = entries.filter(e => e.rating);
  const avg     = rated.length
    ? (rated.reduce((s, e) => s + e.rating, 0) / rated.length).toFixed(1)
    : '—';
  const origins = new Set(entries.map(e => e.origin).filter(Boolean)).size;

  document.getElementById('statsBar').innerHTML = `
    <div class="stat-card">
      <div class="stat-num">${total}</div>
      <div class="stat-label">Total Coffees</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${avg}${avg !== '—' ? '★' : ''}</div>
      <div class="stat-label">Avg Rating</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${origins}</div>
      <div class="stat-label">Origins Tried</div>
    </div>`;
}

function renderBrewStats() {
  const stats = document.getElementById('brewStatsBar');
  if (!stats) return;

  const total = brewEntries.length;
  const rated = brewEntries.filter(e => e.rating);
  const avg = rated.length
    ? (rated.reduce((s, e) => s + e.rating, 0) / rated.length).toFixed(1)
    : '—';
  const recipesWithRatio = brewEntries.filter(e => e.coffeeAmount && e.waterAmount);
  const avgRatio = recipesWithRatio.length
    ? (recipesWithRatio.reduce((s, e) => s + (Number(e.waterAmount) / Number(e.coffeeAmount)), 0) / recipesWithRatio.length).toFixed(1)
    : '—';

  stats.innerHTML = `
    <div class="stat-card">
      <div class="stat-num">${total}</div>
      <div class="stat-label">Total Brews</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${avg}${avg !== '—' ? '★' : ''}</div>
      <div class="stat-label">Avg Rating</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${avgRatio !== '—' ? '1:' + avgRatio : '—'}</div>
      <div class="stat-label">Avg Ratio</div>
    </div>`;
}

/* ══════════════════════════════════════════════
   CSV EXPORT
══════════════════════════════════════════════ */
function exportCSV() {
  if (activeTab === 'brew') {
    exportBrewCSV();
    return;
  }

  if (!entries.length) { toast('Nothing to export yet!'); return; }

  const headers = ['Date','Drink Type','Location','Origin','Varietal',
                   'Process','Roast','Tasting Notes','Notes','Rating'];

  const rows = entries.map(e => [
    e.date, e.drinkType, e.location, e.origin, e.varietal,
    e.process, e.roast,
    (e.tastingNotes || []).join(', '),
    e.notes, e.rating,
  ].map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(','));

  const csv  = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = `coffee-log-${today()}.csv`;
  a.click();
  toast('CSV downloaded ✓');
}

function exportBrewCSV() {
  if (!brewEntries.length) { toast('Nothing to export yet!'); return; }

  const headers = ['Date','Drink Type','Coffee Amount (g)','Water Amount (g)',
                   'Temperature (C)','Extraction Time','Origin','Varietal',
                   'Process','Roast','Tasting Notes','Notes','Rating'];

  const rows = brewEntries.map(e => [
    e.date, e.drinkType, e.coffeeAmount, e.waterAmount,
    e.temperature, e.extractionTime, e.origin, e.varietal,
    e.process, e.roast,
    (e.tastingNotes || []).join(', '),
    e.notes, e.rating,
  ].map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(','));

  const csv  = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = `brew-log-${today()}.csv`;
  a.click();
  toast('Brew CSV downloaded ✓');
}
