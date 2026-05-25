/**
 * app.js — CoffeeNote main application
 * All data operations go through Supabase (_sb client from auth.js).
 * Depends on: db.js, auth.js (which exposes _sb and currentUser)
 */

/* ── App state ── */
let entries       = [];
let rating        = 0;
let selectedNotes = [];
let formValues    = { drinkType: '', origin: '', varietal: '', process: '', roast: '' };
let filterDrink   = '';
let filterRating  = '';

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

function setSaveLoading(on) {
  const btn = document.querySelector('.form-footer .btn-primary');
  if (!btn) return;
  btn.disabled    = on;
  btn.textContent = on ? 'Saving…' : 'Save Entry';
}

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
function today() {
  return new Date().toISOString().split('T')[0];
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
function buildNotesPicker() {
  const cats = document.getElementById('notesCategories');
  if (!cats) return;
  cats.innerHTML = '';

  DB.tastingNotes.forEach(group => {
    const div = document.createElement('div');
    div.className = 'notes-category';
    div.innerHTML = `<div class="notes-cat-label">${group.group}</div><div class="notes-tags"></div>`;

    const tagsDiv = div.querySelector('.notes-tags');
    group.items.forEach(note => {
      const t = document.createElement('span');
      t.className   = 'notes-tag' + (selectedNotes.includes(note) ? ' active' : '');
      t.textContent = note;
      t.onclick     = () => toggleNote(note, t);
      tagsDiv.appendChild(t);
    });

    cats.appendChild(div);
  });

  renderNoteChips();
}

function addCustomNote() {
  const input = document.getElementById('customNoteInput');
  const val   = input.value.trim();
  if (!val) return;
  if (!selectedNotes.includes(val)) {
    selectedNotes.push(val);
    renderNoteChips();
  }
  input.value = '';
  input.focus();
}

function toggleNote(note, tagEl) {
  if (selectedNotes.includes(note)) {
    selectedNotes = selectedNotes.filter(n => n !== note);
    tagEl.classList.remove('active');
  } else {
    selectedNotes.push(note);
    tagEl.classList.add('active');
  }
  renderNoteChips();
}

function removeNote(note) {
  selectedNotes = selectedNotes.filter(n => n !== note);
  document.querySelectorAll('.notes-tag')
    .forEach(t => { if (t.textContent === note) t.classList.remove('active'); });
  renderNoteChips();
}

function renderNoteChips() {
  const bar = document.getElementById('notesSelectedBar');
  if (!bar) return;
  bar.innerHTML = '';

  if (!selectedNotes.length) { bar.classList.add('empty'); return; }
  bar.classList.remove('empty');

  selectedNotes.forEach(note => {
    const chip = document.createElement('span');
    chip.className = 'note-chip';
    const safe = note.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    chip.innerHTML = `${note} <span class="note-chip-x" onclick="removeNote('${safe}')">×</span>`;
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

  const dateEl = document.getElementById('f-date');
  if (dateEl) dateEl.value = today();

  selectedNotes = [];
  rating        = 0;
  buildNotesPicker();
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

/* ══════════════════════════════════════════════
   TABS
══════════════════════════════════════════════ */
function showTab(tab) {
  document.getElementById('tab-log').style.display     = tab === 'log'     ? '' : 'none';
  document.getElementById('tab-history').style.display = tab === 'history' ? '' : 'none';

  document.querySelectorAll('.tab').forEach((el, i) => {
    el.classList.toggle('active',
      (tab === 'log' && i === 0) || (tab === 'history' && i === 1)
    );
  });

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

/* ══════════════════════════════════════════════
   CSV EXPORT
══════════════════════════════════════════════ */
function exportCSV() {
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
