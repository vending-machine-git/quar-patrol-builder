# Narrative ↔ Main Game Separation Rule

_Set by the owner, 5 Nov 2026. Checked against the files in this folder on the same date._

## The rule

The Narrative tab (Every Quar is His Own King, Quar Tales, Mhuddball) and the main game (patrol builder, My Patrols, profiles, Game Tracker, battle reports) work **one way only**:

1. **Narrative never changes the main game.** No narrative rule, stat change, injury, advance, price or item may show up on, or alter, a normal patrol, profile card, the Game Tracker, saved battles or `data/quar-data.json`.
2. **Main game changes are allowed to flow into narrative.** Fixing a stat, points value, ability or patrol rule in the main data may update narrative pages too (updated 5 Nov 2026: owner is OK with this).
3. **Starting a campaign from a patrol makes a copy.** Changes inside the campaign never reach the patrol.
4. Each narrative mode keeps its own rules file. The main data file holds no narrative rules, and main pages never read narrative rules.

Anyone (human or AI) working on this project should check new work against these four points.

---

## Check results (5 Nov 2026)

### ✅ Rule 1 — Narrative → main game: PASSES

- No narrative file writes to saved patrols, the unit data, the Game Tracker or saved battles. Narrative only saves into its own storage slot (`quar-narrative-v1`).
- Narrative rules live in their own files (`campaign-rules.js`, `tales-rules.js`, `mhuddball-rules.js`). The main page never reads them.
- `data/quar-data.json` contains nothing about campaigns, Tales or Mhuddball.
- `campaign.css` only styles narrative pages (everything is scoped to narrative class names), so it can't restyle main pages.
- Starting a campaign or Tale "from a patrol" only reads the patrol; the patrol itself is untouched.

### ✅ Rule 2 — Main game → narrative: allowed, and that's how it works now

Every Quar is His Own King and Quar Tales read unit stats, points, abilities, equipment and ability wording live from the main data, and Quar Tales uses the main builder's Force Allowance checks. So main-game fixes show up in narrative automatically. Mhuddball uses its own rosters, so main-game changes don't affect it.

### ✅ Rule 3 — Patrol copy: PASSES

### ✅ Rule 4 — Separate rules files: PASSES

### ⚠️ One risk to watch (not a rule break)

If a unit's internal ID is **renamed, merged or removed** in the main data, campaign and Tales rosters silently **drop** any character of that unit the next time the campaign opens and saves — losing its name, XP, advances and injuries (only a backup file keeps them). A changed faction ID stops that campaign opening.
**Until fixed:** don't change or remove unit/faction IDs in `quar-data.json`; changing stats, points and display names is fine. A small fix (keep the character and show "unit no longer in the data" instead of deleting it) is available if wanted.

### Other notes

- The **backup file** is shared (one file holds patrols and narrative). That's fine — it doesn't mix rules.
- The project note `claude/narrative.md` still says the campaign integration was removed (1 Nov). It has since been rebuilt, so that note is out of date.
- Not checked here: whether each narrative rule matches its source PDF. This only checks separation.
