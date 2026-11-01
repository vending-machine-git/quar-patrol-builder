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
- **Game Tracker**: pick one of the Full Book's 10 missions (or a custom game), which sets the number of Turns, who goes first and starting Pluck, then load one of your saved patrols, import one from a share link or text list (handy on a shared tablet), or play without one (and optionally load your opponent's, from their share link or text list) and track Turns, Rounds (9 per Turn, alternating sides), Pluck and Victory Points for both sides, end the game for a results summary and a designed **battle report** you can print or save as a PDF, download as a standalone page, or copy as text, with each side's starting and ending units, the notable Rounds, an outcome headline (over 40 wordings, such as Landslide, Rout!, Last Gasp Victory or Nail-Biter), battle tags (such as Heads Ringing, Tractor Down or Daring Rescue), flagged Rounds (First blood, Lead change, Last one standing, Final blow and more), **Commanders' honours** (a title for each player based on how they played, such as Bloodthirsty for fast, heavy killing, Head Thumper for Gobsmacking the enemy, Stretcher Bearer, Ever Watchful or Never Say Die, plus up to two more earned along the way), and your own notes, plus every rhyfler's Status and Tasks used this Round. Statuses follow the rulebooks for each unit type: rhyflers (Engaged, Overwatch, Prone, Gobsmacked, Prepared, Primed, Flesh Wound, Incapacitated, Carried Off, Out of Action, Killed), cavalry (Dismounted, Mount Wounded, Mount Disabled, Rattled), weapon crews (crew damage, HMG Heat markers, Rattled, Disabled) and vehicles (Rattled, Immobilized, Main Gun Jammed, Needs Reload, Buttoned Up/Unbuttoned, Disabled, and damage per location).
- **Show rulebook pages** switch: turn on page references to look anything up in your books.
- **Rules changelog**: lists every place where the builder differs from the printed book, and what changes in each new rulebook version.
- Light and dark themes, plus a **Text size** button under the theme button that opens a slider (85%–140%); works on desktop and phone.

## Where the data comes from

All unit profiles, points and rules come only from the official rulebooks:

- *Clash of Rhyfles Faction Profiles* (version 10/26)
- *Clash of Rhyfles* Full Book

Every points value and stat was checked by hand against the printed page. Where the book has an obvious misprint, the builder uses the corrected value. Two corrections were confirmed by the game's designer. All of them are listed on the site's **Rules changelog** page. Where the book leaves something unclear, the builder shows a note instead of guessing.

## Spotted a mistake?

Please open an **Issue** on this repository, or contact **vending_machine** (@tsuiki2664) on Discord. Include the faction, the unit and the page number if you can.

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
- Random rhyfler names: Joshua Qualtieri's [Quar Squad Record Generator](https://www.rhyfler.com/files/quar_squad_gen/QuarSquadGenerator.html), used with permission

This is an unofficial fan project. It is not affiliated with or endorsed by Zombiesmith. Please support the creators by getting the rulebooks from [zombiesmith.com](https://www.zombiesmith.com).
