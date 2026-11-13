# Quar Patrol Builder

An unofficial, fan-made patrol (army) builder and quick-reference for **Quar: Clash of Rhyfles** by [Zombiesmith](https://www.zombiesmith.com).

Build a patrol, see your points and Force Allowance as you go, and get warned the moment a list breaks a rule. Or just browse any faction's units, weapons and special rules without building anything.

## Features

- **All 12 factions** from the *Faction Profiles 10/26*: Coftyrans, Creevin, Crusaders, Fidwog, Western Arnyara/Aber, Principality of Gwynt, Crusaders of Toulmore, Ergydiwr, Rhyflers of Gloam Hyyn, Hoblyn Valley Rangers, Maebwysh and Tollyn Maeryn.
- **Faction reference pages**: every unit profile, weapon and special rule for a faction on one page, grouped by unit type.
- **Patrol builder**:
  - live points total and Force Allowance counts;
  - checks the limits printed in the book: Force Allowance, "one per X points" limits, units that require other units, Retinue/Staff and the Tollyn Maeryn Advisor;
  - tap any trait or ability to read what it does.
- **Starter patrols**: Beginner-friendly example patrols from the Quar website (Coftyrans, Creevin, Western Arnyara, Crusaders and Fidwog, from [rhyfler.com/example-patrols](https://rhyfler.com/example-patrols/)) appear at the top of the Muster Roll when you build one of those factions. Tap **Use starter patrol** to fill in the list, then save or change it. Points always come from the Faction Profiles. The Coftyran starter comes to 303 points: that exact list shows as **Approved** (3 over 300, not technically legal), and any other list over the limit is still an error.
- **Name your rhyflers**: tap **Name** next to any unit in your patrol for a random Quar name (from Joshua Qualtieri's Quar Squad Record Generator), re-roll it with the dice, or type your own. Names show on the Roster, the print sheet, share links, text lists, the Game Tracker and battle reports, with the unit's name kept beside them.
- **Save your patrols** in your browser, and sort them by last edited, name, faction or points, or drag them into your own order.
- **Share a patrol as a link.** The whole patrol is stored inside the link, so anyone who opens it sees your list and can save their own copy. No accounts needed.
- **Print a quick-reference sheet**: one line per unit with stats and weapons, then every rule your patrol uses written out once. Most patrols fit on a single page.
- **Copy a list as text**, with any rule problems included, and **import it back**: paste the text (or open a .txt file) to rebuild the patrol.
- **Narrative campaigns**: implements **Every Quar is His Own King** from the community **Quar Campaign System.pdf**. Start a fresh 250-Mark muster or independently copy a saved patrol costing at most 250 Marks. Play through guided battle preparation, casualty rolls and rerolls, permanent injuries/death/retirement, XP and three locked specialization tracks, Leader-based exploration and all 18 matching-dice events, then recruitment and the full equipment shop. Track the bank, assigned equipment and patrol value; use scenario tools for all seven campaign missions. Campaign profiles show permanent stat changes. Everything stays separate from normal patrols and is included in browser backups. Existing stories retain names, notes and service records; the old relationship system is not part of campaign play.
- **Backups**: **Save backup file** (on My Patrols, the Game Tracker and the Narrative tab) saves your patrols, stories, the game in progress and saved battles in one file; **Load backup file** brings them back on this device or another (it only adds new things or newer copies, never deletes). A small note shows when you last backed up and nudges you if it's been a while since your last changes. The site also asks the browser to keep its storage so it isn't cleared to free up space.
- **Saved battles**: when a game is over, press **Save battle** to keep it. Saved battles are listed on the Game Tracker, where you can view each one's battle report (print, download or copy it) and edit it: name, date, sides, mission, VP, Pluck, result and commander's notes.
- **Game Tracker**: pick one of the Full Book's 10 missions (or a custom game), which sets the number of Turns, who goes first and starting Pluck, then load one of your saved patrols, import one from a share link or text list (handy on a shared tablet), or play without one (and optionally load your opponent's, from their share link or text list, or pick a second one of your own saved patrols to play both sides, also possible mid-game) and track Turns, Rounds (9 per Turn, alternating sides), Pluck and Victory Points for both sides, end the game for a results summary and a designed **battle report** you can print or save as a PDF, download as a standalone page, or copy as text, with each side's starting and ending units, the notable Rounds, an outcome headline (over 40 wordings, such as Landslide, Rout!, Last Gasp Victory or Nail-Biter), battle tags (such as Heads Ringing, Tractor Down or Daring Rescue), flagged Rounds (First blood, Lead change, Last one standing, Final blow and more), **Commanders' honours** (a title for each player based on how they played, such as Bloodthirsty for fast, heavy killing, Head Thumper for Gobsmacking the enemy, Stretcher Bearer, Ever Watchful or Never Say Die, plus up to two more earned along the way), and your own notes, plus every rhyfler's Status and Tasks used this Round. Statuses follow the rulebooks for each unit type: rhyflers (Engaged, Overwatch, Prone, Gobsmacked, Prepared, Primed, Flesh Wound, Incapacitated, Carried Off, Out of Action, Killed), cavalry (Dismounted, Mount Wounded, Mount Disabled, Rattled), weapon crews (crew damage, HMG Heat markers, Rattled, Disabled) and vehicles (Rattled, Immobilized, Main Gun Jammed, Needs Reload, Buttoned Up/Unbuttoned, Disabled, and damage per location).
- **My models**: press the **My models** button in the header (under Theme and Text size; the little miniature on phones) to open the My Models page. Pick a faction from the dropdown, press **+** for each model you own, and tick **Built** and **Painted** for each model to track your hobby progress (a unit with several models shows "Built 2/3"; open it to tick each one). Filter by unit type with the category bubbles, fold categories away, and tap any unit to see its full profile. The **Collection** tab shows the models you own (the **Database** tab is where you add them) as reference cards (how many, points, built/painted progress and the full profile). Turn on **Only my models** (next to *Show rulebook pages*; the **Built models** / **Painted models** switches on the My Models page narrow it down further) and the Factions page, the faction pages and the Muster Roll show only the models you have; faction pages then list only the weapons and special rules your models use. Saved in your browser and included in the backup file.
- **Show rulebook pages** switch: turn on page references to look anything up in your books.
- **Rules changelog**: lists every place where the builder differs from the printed book, and what changes in each new rulebook version.
- Light and dark themes, plus a **Text size** button under the theme button that opens a slider (85%–140%); works on desktop and phone.

## Run locally

On Windows, double-click **Open Local Site.bat** to start a local server and open the site in your default browser. Python 3 must be installed. Keep the server window open while using the site; close it or press Ctrl+C to stop. The site is served only on this computer at `http://127.0.0.1:8000`.

Local browser saves are separate from the hosted site's saves. Use **Save backup file** and **Load backup file** to transfer your patrols and games between them.

## Where the data comes from

Unit profiles, points and core rules come from the official rulebooks:

- *Clash of Rhyfles Faction Profiles* (version 10/26)
- *Clash of Rhyfles* Full Book

Every points value and stat was checked by hand against the printed page. Where the book has an obvious misprint, the builder uses the corrected value. Two corrections were confirmed by the game's designer. All of them are listed on the site's **Rules changelog** page. Where the book leaves something unclear, the builder shows a note instead of guessing.

## Narrative campaign rules

The Narrative / Community tab offers three independent options: **Every Quar is His Own King**, **Quar Tales** and **Mhuddball**. Each has its own saved records, rosters and rules. Existing campaigns remain unchanged. All three use browser storage and are included in full backups; imported records are routed to the correct rules engine.

### Mhuddball

Integrates **Mhudball.pdf**, titled **Mhuddball v1.1** (19 pages), as a standalone sport rather than a campaign variant:

- **Teams**: both printed Fidwog and Toulmore rosters with their exact Skill, Might, Movement, Toughness, Arm Power, Pluck Cost and abilities. Select six per team, at most one of each positional except four Linesquar, and deploy five initially. Starting Pluck is `max(0, 7 + signed PC total)`. The draft conversion note does not fully define other factions, so the app does not invent additional sport rosters or modify printed ranges a second time.
- **Unofficial rosters for the other ten factions** (not in the original rules): stand-ins made by this builder with the author's own conversion note (PDF p. 18) and the patterns in his printed rosters, a method that rebuilds all eight printed Mhudders exactly. Sk/Mt/MA/T come from the faction's core profile, AP is the longest weapon range minus 2, and PC comes from the unit's points (+1 per lost weapon ability, +1 if Veteran is dropped, -1 for AP 8+). Each is labelled Unofficial wherever it appears and lists the core unit it is based on. They should be replaced when the author publishes official rosters.
- **Match desk**: track both teams, goal totals, banked Pluck, active team, individual action allowances, the one-Mhuddball-task limit, Steady's temporary credit and Charge's bonus Tackle. Record granted free actions/interruptions with an explanation. Goals automatically grant their 1 Pluck; passes, interceptions and OOA rewards have explicit Pluck controls.
- **Gourds and victory**: six shared regulation gourds, issued two at a time. A score or grounding removes only that active gourd; stolen gourds can score for either side. Substitutions, fresh deployment, a new roll-off and +2 Pluck per team occur only once both active gourds are gone. Regulation ends when the reserve and active pool are exhausted; ties issue sudden-death pairs until the first goal wins.
- **Players and weather**: Ready/Gobsmacked/OOA/winded/removed states, Soggy and engagement markers, Hardened's first-Soggy protection, one-task injuries, and passing/shooting dislocations. Apply Tend Wounded results (including Medic's bonus and Pluck awards) separately from recording the task. Optional activation-card weather updates after each team turn; Bright clears Soggy, while Raining puddles are placed on the tabletop.
- **Dice helpers and reference**: pass/shot range bands and modifiers, Tackle modifiers and critical results, interception face patterns, mishaps, Tend, Might vs Toughness, general/opposed Skill checks and roll-offs. Physical dice or in-app dice; helper outputs are advice and journal entries only, not automatic match effects. Resolve geometry, free movement, reactions and opposed results at the table, then record resulting tasks, possessions, goals and statuses once. The field manual paraphrases all rule sections with PDF page references and lists ambiguities, including Wyndy's unspecified numeric penalty.
- **Saving**: teams, current lineups, gourd ownership/reserve, weather, tasks, player markers, scores, dice advice and journal persist in browser storage and full backup files. Undo corrects the last action. Nothing alters normal patrols, Quar Tales forces or Every Quar is His Own King campaigns.

### Quar Tales

Implements the community **Quar Tales Rules.docx.pdf** (10 pages), without borrowing rules or scenarios from Every Quar is His Own King:

- **Force pool and Patrols**: choose a 600-1000-point Force limit, start with 2 Supply, muster a fresh independent Force or copy a saved patrol. Designate one Leader and one other Character per 100 Force points. Select a Patrol for each five-round Skirmish; check points, Force Allowance, faction dependencies and the four-Characters-plus-Leader limit. Mobilization Supply is paid per battle; initial Force assembly is free.
- **Recovery**: separate two-D6 face-pattern charts for Fodder, Characters and Disabled vehicles. Enter physical dice or roll in-app; review provisional results and spend remaining Pluck on re-rolls before confirming. Track death, permanent stat injuries, missed Skirmishes, Gobsmacked starts, squad/Patrol morale penalties, vehicle damage and destroyed weapons. Medicine clears Character absences; repairs cost 1 Supply per damage box.
- **Experience**: record Character deeds and Force result/objectives separately. More-expensive incapacitations replace, rather than stack with, ordinary incapacitation XP. Buy permanent Character advances within the printed limits or temporary Force advantages for the next battle. XP awards cannot be committed twice.
- **Logistics and encounters**: roll eligible Character dice plus the victory die, use maps/tunnels/remaining Pluck to re-roll, keep up to six dice and collect Supply from the PDF bands. Choose one qualifying encounter from matching faces. All 30 encounters have paraphrased instructions and PDF page references. Resolve tabletop tests and complex choices manually, then record the explained Supply, XP, item, free-advance, healing or repair results. Encounter accidents can open a Fodder recovery flow and return to the encounter without awarding battle XP again.
- **Supply and equipment**: all printed Defenses/upgrades, recruitment tiers, per-Skirmish mobilization costs, Force XP advantages, map qualities and equipment bearers. Temporary benefits move to the next battle; spent consumables are marked manually. Zero Supply applies -1 Skill to Force profiles. Death/retirement removes the bearer's equipment.
- **Persistence**: stage, selected Patrol, provisional recovery dice, current battle, Logistics rolls, roster, inventories and journal survive reload and full backup export/import. Undo reverses the last campaign action. Normal patrols and the other community system are never changed by Quar Tales actions.

The in-app field manual lists source interpretations and manual boundaries. Recovery face patterns are read in either order; one remaining Pluck pays one re-roll. Multiple qualifying encounter sets require a player choice because no priority is printed. 'Patrol XP' is treated as Force XP. Skill/Toughness advancement limits include free advances; other attribute changes and vehicle armor/weapon improvements require an agreement recorded in roster notes. Source ambiguities are exposed rather than silently importing conventions from the other system. Keep the PDF authoritative.

### Every Quar is His Own King

The Narrative tab implements the community supplement **Every Quar is His Own King**, supplied as **Quar Campaign System.pdf**, separately from official core-rule data. The in-app Rules & scenarios page contains paraphrased campaign tables, all seven scenario briefings and source PDF page references, with redrawn deployment schematics for all seven scenarios. Keep the PDF as the authoritative reference.

- **Start**: use a fresh 250-Mark bank or copy a saved patrol at or below 250 Marks. All faction profiles are recruitable at their listed price, without normal builder Force Allowance enforcement. Unspent starting Marks stay in the bank.
- **Play**: record opponent value, Underquar band, deep-wound availability, deployment, scenario, role, ending statuses, Tend Wounded sixes, objectives and MVQ. Scenario tools log rewards; do not enter their XP a second time as manual objective XP.
- **Casualties**: OOA screening and 2D6 results can use physical dice or built-in rolls. Results remain provisional for First aid kit / Field Surgeon rerolls until confirmed. Death, retirement and capture remove the model and its equipment from patrol value. Vehicles return automatically.
- **Advance**: XP thresholds are 0 / 3 / 7 / 12. Senior categories begin at level 1 without a free advancement or surcharge. Specializations lock when the first advancement resolves. Duplicate abilities allow a chart choice. Earned stat changes and equipment remain visible on the independent roster.
- **Explore and purchase**: surviving Leaders provide up to six dice; winner adds one, discarding one if seven were rolled. Kept dice, events, follow-up rolls and income are recorded. Buy new models/equipment and transfer purchased equipment during Purchase; original equipment stays locked. Consumables remain in supply; three equipment pieces is the stated maximum.
- **Save**: campaign stage, battle data, roster, inventory, bank and journal are kept under the existing narrative browser-storage key and in full backups. Undo reverses the last campaign action. Existing story records migrate when opened; old relationship data is retained in backups but no longer displayed. Normal patrols are never edited by campaign actions.

The source leaves several cases unspecified. The app explicitly lists its conventions: non-cumulative Underquar bands; one highest exploration event per face capped at quadruples (with a selectable group size); one reroll per casualty result; any second lasting-injury result triggers retirement. Recovered faction weapons have no invented price: agree their added value before assigning them. Ransoming/rescuing without equipment keeps original profile cost but marks starting equipment as lost, so agree any disarmed weapon-dependent combat stats. Weapon crews are tracked as their purchased team entry; the PDF gives no per-crew recruitment or cost-splitting rules. Deployment measurements and victory conditions remain tabletop decisions, not automatic adjudication.

## Spotted a mistake?

Please open an **Issue** on this repository, or contact **vending_machine** (@tsuiki2664) on Discord. Include the faction, the unit and the page number if you can.

## Support

If the builder helps your games, you can buy me a coffee on [Ko-fi](https://ko-fi.com/vending_machine0890). Thank you!

## How it's made

The site uses an `index.html` page, a separate campaign rules/logic module and stylesheet, and a faction data file. There's no server, no accounts and no tracking. Saved patrols stay in your own browser.

```
index.html              the page
campaign.js             campaign engine, narrative UI and persistence integration
campaign-rules.js       community campaign tables, shop and scenario summaries
tales-rules.js          Quar Tales tables, encounter summaries and source interpretations
tales.js                independent Quar Tales engine, roster and campaign UI
mhuddball-rules.js      Mhuddball v1.1 printed sport rosters and rule summaries
mhuddball.js            independent Mhuddball team builder, match tracker and dice tools
campaign.css            responsive campaign layouts (uses existing theme variables)
data/quar-data.json     all units, weapons, rules and the changelog
data/flags/             faction flags (from the rulebooks)
data/art/               faction art (from the rulebooks)
icons/                  website icon
```

When a new version of the Faction Profiles is released, the data file is updated and the changes are added to the Rules changelog.

Built by vending_machine with help from Claude (AI). Every stat was checked by hand against the books.

## Credits and legal

**Clash of Rhyfles © Zombiesmith 2025.** Quar and Clash of Rhyfles are created and published by [Zombiesmith](https://www.zombiesmith.com). All rules summaries, unit profiles, faction flags and artwork used here are taken from the *Clash of Rhyfles* Full Book and Faction Profiles (10/26) and remain the property of Zombiesmith.

- Rules design: Joshua Qualtieri & Anthony Brown
- World design: Joshua Qualtieri, Pete Murray, Pete McKenna & Edward McEneely
- Art: Joshua Qualtieri
- Starter patrols: Joshua Qualtieri, [rhyfler.com/example-patrols](https://rhyfler.com/example-patrols/), used with permission
- Unit and weapon profiles from the *Clash of Rhyfles* Full Rulebook: used with permission from Joshua Qualtieri
- Random rhyfler names: Joshua Qualtieri's [Quar Squad Record Generator](https://www.rhyfler.com/files/quar_squad_gen/QuarSquadGenerator.html), used with permission
- Narrative community modes, used with their creators' permission (Discord names and pictures shown with their OK):
  - *Every Quar is His Own King*: WAR_TROUT
  - *Quar Tales*: Dr. Michael
  - *Mhuddball*: TomDrawsThings (inspired by *Quar: Clash of Rhyfles* and the *Mhudd rules of play* in Zombiesmith's *Tales of the Breach*)

Visits are counted anonymously with [GoatCounter](https://www.goatcounter.com): no cookies and nothing personal, just which pages are used and a few actions such as patrols saved and games started.

This is an unofficial fan project. It is not affiliated with or endorsed by Zombiesmith. Please support the creators by getting the rulebooks from [zombiesmith.com](https://www.zombiesmith.com).
