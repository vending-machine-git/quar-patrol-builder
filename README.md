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
- **Narrative**: copy any saved patrol into a **story patrol** of its own (changing one never changes the other). Give every rhyfler a name and a backstory, mark the fallen, write the patrol's story so far, and set out relationships between rhyflers: Friendship (Acquaintance → Sworn Kin), Rivalry (Friendly Competition → Sworn Enemy), Family (sibling, twin, parent, grandparent, aunt/uncle, cousin, in-law, foster; Estranged → Inseparable), Romance (Old Flame → Wed) and Mentorship (Showing the Ropes → Like a Parent), each with an optional note. Stories are saved in your browser and included in the backup file. It's all storytelling: nothing in the Narrative tab changes any rule or stat.
- **Backups**: **Save backup file** (on My Patrols, the Game Tracker and the Narrative tab) saves your patrols, stories, the game in progress and saved battles in one file; **Load backup file** brings them back on this device or another (it only adds new things or newer copies, never deletes). A small note shows when you last backed up and nudges you if it's been a while since your last changes. The site also asks the browser to keep its storage so it isn't cleared to free up space.
- **Saved battles**: when a game is over, press **Save battle** to keep it. Saved battles are listed on the Game Tracker, where you can view each one's battle report (print, download or copy it) and edit it: name, date, sides, mission, VP, Pluck, result and commander's notes.
- **Game Tracker**: pick one of the Full Book's 10 missions (or a custom game), which sets the number of Turns, who goes first and starting Pluck, then load one of your saved patrols, import one from a share link or text list (handy on a shared tablet), or play without one (and optionally load your opponent's, from their share link or text list) and track Turns, Rounds (9 per Turn, alternating sides), Pluck and Victory Points for both sides, end the game for a results summary and a designed **battle report** you can print or save as a PDF, download as a standalone page, or copy as text, with each side's starting and ending units, the notable Rounds, an outcome headline (over 40 wordings, such as Landslide, Rout!, Last Gasp Victory or Nail-Biter), battle tags (such as Heads Ringing, Tractor Down or Daring Rescue), flagged Rounds (First blood, Lead change, Last one standing, Final blow and more), **Commanders' honours** (a title for each player based on how they played, such as Bloodthirsty for fast, heavy killing, Head Thumper for Gobsmacking the enemy, Stretcher Bearer, Ever Watchful or Never Say Die, plus up to two more earned along the way), and your own notes, plus every rhyfler's Status and Tasks used this Round. Statuses follow the rulebooks for each unit type: rhyflers (Engaged, Overwatch, Prone, Gobsmacked, Prepared, Primed, Flesh Wound, Incapacitated, Carried Off, Out of Action, Killed), cavalry (Dismounted, Mount Wounded, Mount Disabled, Rattled), weapon crews (crew damage, HMG Heat markers, Rattled, Disabled) and vehicles (Rattled, Immobilized, Main Gun Jammed, Needs Reload, Buttoned Up/Unbuttoned, Disabled, and damage per location).
- **My models**: press the **My models** button in the header (under Theme and Text size; the little miniature on phones) to open the My Models page. Pick a faction from the dropdown, press **+** for each model you own, and tick **Built** and **Painted** for each model to track your hobby progress (a unit with several models shows "Built 2/3"; open it to tick each one). Filter by unit type with the category bubbles, fold categories away, and tap any unit to see its full profile. The **Collection** tab shows the models you own (the **Database** tab is where you add them) as reference cards (how many, points, built/painted progress and the full profile). Turn on **Only my models** (next to *Show rulebook pages*; the **Built models** / **Painted models** switches on the My Models page narrow it down further) and the Factions page, the faction pages and the Muster Roll show only the models you have; faction pages then list only the weapons and special rules your models use. Saved in your browser and included in the backup file.
- **Show rulebook pages** switch: turn on page references to look anything up in your books.
- **Rules changelog**: lists every place where the builder differs from the printed book, and what changes in each new rulebook version.
- Light and dark themes, plus a **Text size** button under the theme button that opens a slider (85%–140%); works on desktop and phone.

## Run locally

On Windows, double-click **Open Local Site.bat** to start a local server and open the site in your default browser. Python 3 must be installed. Keep the server window open while using the site; close it or press Ctrl+C to stop. The site is served only on this computer at `http://127.0.0.1:8000`.

Local browser saves are separate from the hosted site's saves. Use **Save backup file** and **Load backup file** to transfer your patrols and games between them.

## Where the data comes from

All unit profiles, points and rules come only from the official rulebooks:

- *Clash of Rhyfles Faction Profiles* (version 10/26)
- *Clash of Rhyfles* Full Book

Every points value and stat was checked by hand against the printed page. Where the book has an obvious misprint, the builder uses the corrected value. Two corrections were confirmed by the game's designer. All of them are listed on the site's **Rules changelog** page. Where the book leaves something unclear, the builder shows a note instead of guessing.

## Spotted a mistake?

Please open an **Issue** on this repository, or contact **vending_machine** (@tsuiki2664) on Discord. Include the faction, the unit and the page number if you can.

## Support

If the builder helps your games, you can buy me a coffee on [Ko-fi](https://ko-fi.com/vending_machine0890). Thank you!

## How it's made

The site is a single `index.html` page plus a data file. There's no server, no accounts and no tracking. Saved patrols stay in your own browser.

```
index.html              the page
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

Visits are counted anonymously with [GoatCounter](https://www.goatcounter.com): no cookies and nothing personal, just which pages are used and a few actions such as patrols saved and games started.

This is an unofficial fan project. It is not affiliated with or endorsed by Zombiesmith. Please support the creators by getting the rulebooks from [zombiesmith.com](https://www.zombiesmith.com).
