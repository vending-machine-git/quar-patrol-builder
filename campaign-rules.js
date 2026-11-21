"use strict";
// Every Quar is His Own King, community campaign by WAR_TROUT. Source: "EQHOK Campaign.pdf" (29 pages, updated version added 21 Nov 2026).
window.QuarCampaignRules = {
  title: "Every Quar is His Own King",
  source: "EQHOK Campaign.pdf",
  levels: [0, 3, 7, 12],
  advances: {
    Raider: [
      ["Melee (+1)", "Killing Strike", "Slippery", "Bombardier", "+1 T", "Wallop"],
      ["Melee (+1)", "Skirmisher", "+1 Skill", "Hardened", "Parry", "Infiltrate"],
      ["Melee (+1)", "Veteran", "+1 Skill", "Brutal Attack", "Wallop", "Scout (2/3)"]
    ],
    Marksman: [
      ["Ranged (+1)", "Skirmisher", "Support", "+1 MA", "Dead-Eye", "+1 Skill"],
      ["Ranged (+1)", "Hardened", "Cautious", "Blunt-rounds", "Dead-Eye", "+1 Skill"],
      ["Ranged (+1)", "Veteran", "Multi-Attack (2)", "PykPyk (1)", "Dead-Eye", "Leader (2/3)"]
    ],
    Logistics: [
      ["Leader (1/2)", "Inspiring Presence (1)", "Support", "+1 MA", "Resilient", "+1 Skill"],
      ["Leader (1/2)", "Inspiring Presence (1)", "Communications", "+1 MA", "Medic", "+1 Skill"],
      ["Leader (1/2)", "Musician (2)", "Standard", "PykPyk (2)", "Field Surgeon", "Leader (2/3)"]
    ]
  },
  shop: [
    {name:"First aid kit", cost:5, item:true, rule:"Consume to reroll one Rhyfler's casualty-chart result."},
    {name:"Pykpyk Treats", cost:10, item:true, rule:"Consume before a game to choose the scenario and attacker or defender."},
    {name:"Local Map", cost:15, item:true, rule:"Consume to arrange the battlefield before determining roles and deployment."},
    {name:"Keg of Bugbrau", cost:10, item:true, rule:"Consume before a game: gain D3 extra Pluck at the start of that game."},
    {name:"Sword", cost:5, rule:"Changes Might to 2D6."},
    {name:"Pistol", cost:5, rule:"Additional pistol: Range 4, Sn -1."},
    {name:"Scope", cost:8, rule:"Attach to a weapon with no special ability; add 2 to its range. Record the eligible weapon in its attachment field."},
    {name:"Short Range Radio", cost:10, rule:"Grants Communications."},
    {name:"Trench Armor", cost:5, rule:"Grants Trench Armor."},
    {name:"AT Grenades", cost:5, rule:"Grants AT Grenades."},
    {name:"Extra Ammo", cost:5, rule:"Reroll one ranged-attack skill check each game."},
    {name:"Flask", cost:10, rule:"Once per game, perform Tend Wounded on yourself."},
    {name:"Sturdy Helmet", cost:8, rule:"Whenever this Rhyfler would become Gobsmacked, roll a D6: on a 4+ it is not Gobsmacked."}
  ],
  // Values the PDF gives recovered weapons from exploration (added to the carrying model's value).
  recovered: {"Harlech":3, "Bogen":3, "Cryfen":5, "Splagen":5, "Splagen torpedo":5, "Doru":5, "Grifkis Shotgun":5, "PYN-64 Bolt Action Rhyfle":8},
  // Lasting injuries: a second one (any combination) retires the model.
  lasting: [3, 4, 9, 10, 11],
  casualties: [
    "The ancestors welcome you: remove the model and all equipment.",
    "Deep wound: before each deployment, a D6 of 1 prevents participation.",
    "Lost eye: Ranged -1.",
    "He needs a second: miss the next game.", "He's good: no ill effects.", "He's good: no ill effects.", "He's good: no ill effects.",
    "Smashed hand: Might -1.", "Busted leg: MA -1.", "Bell rung: Skill -1.", "The ancestors smile upon you: gain 1 XP."
  ],
  exploration: {
    2: ["Nothing to be found: subtract these dice's 2 Marks from income.", "Lost Rhyfler: D6; on 6 add a basic Rhyfler from your force for free.", "Abandoned purse: gain D6 Marks.", "Enemies afoot: D6; on 1 a random searching leader misses the next game.", "Field supplies: D6; on 6 choose a Harlech or Bogen (3 Marks).", "First aid supplies: gain a First aid kit."],
    3: ["Highway Quar stick-up: lose 3D6 income Marks, minimum zero.", "Abandoned battlefield: D6; 1-2 gain D6 Marks, 3-5 a Harlech or Bogen (3 Marks), 6 a Cryfen (5 Marks).", "Abandoned camp: gain 2D6 Marks.", "Fallen specialist: choose a Splagen or Doru (5 Marks).", "Fallen officer: gain a Pistol and Sword.", "Fallen trench raider: gain Trench Armor."],
    4: ["Captured: a random searching leader is taken; ransom (with or without equipment) or Daring Rescue may recover them.", "So, there I was: a random searching leader gains D3 XP.", "Royal supply cache: gain 3D6 Marks.", "Crusader supply cache: gain a Grifkis Shotgun (5 Marks).", "One Quar's trash: choose a shop item worth up to 10 Marks.", "Another Quar's treasure: choose any shop item."],
    5: ["Minefield: a random searching leader rolls on the casualty chart now.", "There was a firefight!: every searching leader gains D3 XP.", "Like taking moth cakes from a kit: gain D6 Marks; your last opponent loses as many.", "Barrels of joy: gain a Keg of Bugbrau.", "An Honored Aunt arrives: remove one lasting injury from a Rhyfler you choose.", "Abandoned Maeg-Lau hulk: gain D6 Marks and a PYN-64 Bolt Action Rhyfle (8 Marks)."],
    6: ["Abandoned gold mine: you may send one searching leader in. D6: 1 lost below (removed), 2-3 deep wound, 4-5 gain 24 Marks, 6 gain 36 Marks and D3 XP.", "Do I have a story for y'all!: a random searching leader misses the next game and returns at level 3; roll the advancements now.", "Abandoned tractor: gain a damaged Tractor; exchange it to buy any tractor of your faction at half price (rounded down).", "Fallen patrol: add a Standard profile Rhyfler from any faction, with Skill -1.", "Blessing of the Honored Aunts: remove all lasting injuries from your patrol and gain D3 First aid kits.", "The Deserter: add any Standard, Specialist or Command Rhyfler from any faction to your roster."]
  },
  // Battlefield conditions, 2D6 before each battle (PDF p. 15): [from, to, name, effect]
  conditions: [
    [2, 3, "Downpour", "Models may not sprint or charge."],
    [4, 4, "Hostile partisans", "Add two event cards to the deck. Each time one is drawn, the Rhyfler closest to any board edge is the target of a Skill 9 ranged attack with no modifiers."],
    [5, 5, "Defender's home turf", "Add two event cards to the deck. Each time one is drawn, the defender may make a Tend Wounded roll for any Out of Action Rhyfler or gain 1 Pluck."],
    [6, 8, "A perfect day", "No effect."],
    [9, 9, "Scattered forces", "Split each patrol into two halves with as close to equal numbers of models as possible. One half deploys normally; the other deploys at the start of turn 2, touching its table edge in its deployment zone. Neither force can rout in turn 1."],
    [10, 10, "Sandstorm", "Add two event cards to the deck. Each time one is drawn, each player picks an enemy Rhyfler to take an automatic hit with 1D6+2 Might."],
    [11, 12, "Blizzard", "Add two event cards to the deck. The first time one is drawn, each card gives one fewer activation until an event card is drawn again."]
  ],
  missions: [
    {name:"Surround and Confound", pages:"16-17", setup:"3 x 3 feet. Defender deploys in a terrain-heavy central circle of radius 4 inches, ideally on a hill. Attacker deploys in 8-inch strips on both flanks; outer terrain is sparse. Roll off for roles; the Underquar may choose. Attacker goes first.", objective:"Defender scores the Marks value of friendly models still Ready, plus current round x 10 if the designated messenger escapes. Choose the messenger after deployment, before turn 1; from turn 2, end a turn within 3 inches of an edge and spend an activation to leave. Attacker scores the value of defending models OOA, plus 10 for each enemy Leader OOA or incapacitated. Defender seeks to survive through round 4.", twist:"Dawn raid: during turn 1, weapons fire only in their first range band.", reward:"A messenger escaping from turn 3 onward gains D3 XP.", end:"Round 4 (the source uses both round and turn terminology; agree the timing before play)."},
    {name:"Burn and Turn", pages:"18-19", setup:"3 x 3 feet. Attacker deployment depth 12 inches; defender 8 inches. Cache building smaller than 6 x 6 inches, centered 4 inches from defender's edge. Roll off for roles; Underquar may choose. Before deployment each defender rolls D6: 3+ deploys, 1-2 arrives from their home edge at turn 2 using Move or Sprint.", objective:"An attacker performs Place Demolition Charge on the cache. Countdown starts at 3 and loses 1 for every subsequent card drawn. At zero it explodes: all models within a rolled 2D6 inches suffer a 2D6 Mt blast-chart attack. A defender within 1 inch may Defuse with a successful skill check.", twist:"At each turn end, attacker may move one model a distance equal to activations on the discarded card. Defender cannot rout.", reward:"The model whose charge destroys the cache gains D3 XP; each successful Defuse gives its model 1 XP.", end:"End of turn 4, or end of the turn when the cache explodes."},
    {name:"Smash and Grab", pages:"20-21", setup:"3 x 3 feet; central village, at least 3 buildings, preferably over 6. The 3 most central buildings may hide the informant. Deploy within 9 inches of home edge; roll off for deployment order, alternate models; first deployer goes first. Infiltrators arrive on turn 2.", objective:"Enter a candidate house and roll D6: 1 causes a D6 blast hit to every model within 3 inches of the building edge; 2-4 gains that many Marks; 5-6 finds the informant. If two houses have been searched, the third automatically contains him. Escort him off your home edge. He stays within 1 inch of his guard, moves at standard infantry MA, cannot sprint, may ride transports. Guard may shoot, skedaddle and return fire, but not charge. Informant T4; if OOA, make a Tend Wounded roll for him before he returns to normal guard. Successful shots against guard hit informant on 1-3, guard on 4-6. If separated or guard becomes OOA, he cowers until a Ready model comes within 1 inch. In melee he cowers and joins the winner.", twist:"No blast weapons or grenades may target within 6 inches of buildings.", reward:"Winner gains 2D6 Marks. If one patrol kills the informant after putting him OOA, the other gains 2D6 Marks.", end:"Informant escapes, dies, or a patrol routs."},
    {name:"Take the Town", pages:"22-23", setup:"3 x 3 feet. Six objectives: a beacon centered 4 inches from each home edge; four caches 12 inches from home edges and 4 inches from side edges. Deployment within 8 inches of home edge, at least 12 inches from sides. Roll off to deploy first or second; first deployer goes first.", objective:"At each turn end, compare Ready models within 1.5 inches of each objective center (or any part of terrain representing it). Each held cache scores 2 VP, each beacon 1 VP. Holding both beacons gives immediate victory. Otherwise highest VP wins at turn 3 end.", twist:"A model within a cache's control distance may reroll one die on a ranged-attack skill check.", reward:"Normal campaign XP and exploration; no extra scenario reward.", end:"Both beacons held by one player, or end of turn 3."},
    {name:"Brave Little Quar", pages:"24-25", setup:"3 x 3 feet; dense town, at least 4 buildings, preferably over 6, with central brewery. Deployment zone extends 9 inches from home edge and 18 inches from your side edge (see source diagram). Roll off deployment order; first deployer goes first. Infiltrators arrive after 2 activation cards have been drawn. Put an ale barrel 3 inches in from each unoccupied corner.", objective:"Have most models within 2 inches of brewery at turn 3 end. A Ready model within 1 inch of a barrel generates 1 Pluck after the opponent's round; maximum 3 Pluck from both barrels per round.", twist:"After a round in which a barrel generates Pluck, roll separately for each barrel: 1 contributing model: 1 kicked, 2-5 flows, 6 gains D6 Marks; 2 models: 1-2 kicked, 3-4 flows, 5-6 gains 2D6 Marks; 3 models: 1-3 kicked, 4-6 gains 3D6 Marks. A kicked barrel is removed and one chosen friendly model is Gobsmacked. If both barrels are gone, the game ends at the end of that turn.", reward:"Ale-sale rolls add Marks to the bank. Normal campaign XP also applies.", end:"End of turn 3, or the end of the turn in which the last barrel is removed."},
    {name:"Daring Rescue", pages:"26-27", setup:"3 x 3 feet. Rescuing patrol attacks, captor defends. Attacker zone 8 inches deep; defender zone starts 8 inches beyond attacker zone (consult source diagram). Captive centered 10 inches from defender's edge.", objective:"Defender may treat captive as Heavy (1,3) until revealed. First Ready unengaged attacker ending a round within 1 inch rolls D6: 1-2 treat captive as incapacitated from Tend Wounded; 3-4 one non-combat action per turn, no special abilities; 5-6 pistol only, otherwise normal abilities/actions. Move captive within 3 inches of attacker's home edge, then spend a task to escape. Defender may target captive only on the 5-6 result.", twist:"Attacker tests Rout only at 50% casualties.", reward:"A defending model gains 1 XP each time it puts an enemy OOA with a task within 3 inches of captive. Escape returns the captive to their roster; gear retained depends on ransom/rescue agreement.", end:"Captive escapes, or end of turn 4."},
    {name:"PykPyk Pillagers", pages:"28-29", setup:"3 x 3 feet. Roll 2D6 objectives; alternate placing them more than 3 inches apart. Each deployment half extends 18 inches to mid-board. Roll off deployment order, alternate models at least 9 inches from enemies and 6 inches from friends. First deployer goes first and is attacker.", objective:"Within 1 inch, Investigate an objective, roll D6, then remove it: 1-2 nothing; 3-4 gain D6 Marks; 5-6 gain 3D3 Marks. Most investigated objectives wins. If one patrol routs, survivor automatically gathers remaining supplies, without XP for rolled sixes.", twist:"An investigation roll of 1 Gobsmacks its model; a 6 gives that model 1 XP as well as Marks, unless automatically collecting after a rout.", reward:"Investigation Marks go to the bank immediately; natural 6 gives 1 XP as described.", end:"All objectives claimed, a rout resolves remaining supplies, or end of turn 2."}
  ],
  notes: [
    "Exploration: each face gives one event, using its biggest set (a roll with five 3s is Five 3s, not a triple plus a double). Choose a smaller set for a face if your group agrees.",
    "Five 2s (There was a firefight!): the PDF doesn't say whether D3 is rolled once or for each leader. The builder rolls separately for each searching leader.",
    "Triple 1s says lose 3D6 Marks \"from your total\". The builder takes it from this exploration's income, to a minimum of zero (as before).",
    "Duplicate advancement abilities permit a choice from the same level's chart. Numeric improvements count as duplicates after they were rolled before, following the PDF's Ranged example. Starting Ranged/Melee modifiers also count.",
    "The Logistics level 3 chart lists Leader (2/3) with an asterisk (*), but the PDF has no matching footnote. The builder treats it as plain Leader (2/3).",
    "Upkeep: the PDF says both \"exceeds 400\" and \"at 400 points or more\". The builder uses 400 or more, checked when the Purchase step starts. It doesn't say how long Under-Supplied lasts; the builder applies it to the next battle only and checks again at the next Purchase step.",
    "Six 4s and Six 6s add a Rhyfler from any faction. They keep their own faction's profile and join for free; their printed cost counts toward patrol value. The Deserter is offered any Standard, Specialist or Command profile from any faction, since \"from any patrol\" isn't defined further.",
    "Six 2s: the leader is raised to 12 XP (level 3) and must roll each missing advancement before the next game. Gold mine \"deep wound\" counts as a lasting injury, so a second one retires the leader.",
    "Smashed hand with a Sword: the builder applies the -1 after the Sword (2D6-1).",
    "Weapons recovered in older campaigns that were waiting for an agreed price now take the PDF's value automatically."
  ]
};
