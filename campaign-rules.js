"use strict";
window.QuarCampaignRules = {
  title: "Every Quar is His Own King",
  source: "Quar Campaign System.pdf",
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
    {name:"Sword", cost:5, rule:"Changes Might to 2D6."},
    {name:"Pistol", cost:5, rule:"Additional pistol: Range 4, Sn -1."},
    {name:"Scope", cost:8, rule:"Attach to a weapon with no special ability; add 2 to its range. Record the eligible weapon in its attachment field."},
    {name:"Short Range Radio", cost:10, rule:"Grants Communications."},
    {name:"Trench Armor", cost:5, rule:"Grants Trench Armor."},
    {name:"AT Grenades", cost:5, rule:"Grants AT Grenades."},
    {name:"Extra Ammo", cost:5, rule:"Reroll one ranged-attack skill check each game."},
    {name:"Flask", cost:10, rule:"Once per game, perform Tend Wounded on yourself."}
  ],
  casualties: [
    "Death: remove the model and all equipment.",
    "Deep wound: before each deployment, a D6 of 1 prevents participation.",
    "Lost eye: Ranged -1.",
    "Miss the next game.", "No lasting effect.", "No lasting effect.", "No lasting effect.",
    "Miss the next game.", "Busted leg: MA -1.", "Bell rung: Skill -1.", "Gain 1 XP."
  ],
  exploration: {
    2: ["Nothing: subtract these dice's 2 Marks from income.", "Lost Rhyfler: D6; on 6 recruit a basic Rhyfler for free.", "Abandoned purse: gain D6 Marks.", "Enemies afoot: D6; on 1 a random searching leader misses the next game.", "Field supplies: D6; on 6 choose a Harlech or Bogen.", "First aid supplies: gain a First aid kit."],
    3: ["Highway robbery: lose 3D6 income Marks, minimum zero.", "Battlefield: D6; 1-2 gain D6 Marks, 3-5 a Harlech or Bogen, 6 a Cryfen.", "Abandoned camp: gain 2D6 Marks.", "Fallen specialist: choose a Splagen torpedo or Doru.", "Fallen officer: gain a Pistol and Sword.", "Trench raider: gain Trench Armor."],
    4: ["Captured: a random searching leader is taken with their equipment; ransom or Daring Rescue may recover them.", "So, there I was: a random searching leader gains D3 XP.", "Royal cache: gain 3D6 Marks.", "Crusader cache: gain a Grifkis Shotgun.", "One Quar's trash: choose a shop item worth up to 10 Marks.", "Another Quar's treasure: choose any shop item."]
  },
  missions: [
    {name:"Surround and Confound", pages:"12-13", setup:"3 x 3 feet. Defender deploys in a terrain-heavy central circle of radius 4 inches, ideally on a hill. Attacker deploys in 8-inch strips on both flanks; outer terrain is sparse. Roll off for roles; the Underquar may choose. Attacker goes first.", objective:"Defender scores the Marks value of friendly models still Ready, plus current round x 10 if the designated messenger escapes. Choose the messenger after deployment, before turn 1; from turn 2, end a turn within 3 inches of an edge and spend an activation to leave. Attacker scores the value of defending models OOA, plus 10 for each enemy Leader OOA or incapacitated. Defender seeks to survive through round 4.", twist:"Dawn raid: during turn 1, weapons fire only in their first range band.", reward:"A messenger escaping from turn 3 onward gains D3 XP.", end:"Round 4 (the source uses both round and turn terminology; agree the timing before play)."},
    {name:"Burn and Turn", pages:"14-15", setup:"3 x 3 feet. Attacker deployment depth 12 inches; defender 8 inches. Cache building smaller than 6 x 6 inches, centered 4 inches from defender's edge. Roll off for roles; Underquar may choose. Before deployment each defender rolls D6: 3+ deploys, 1-2 arrives from their home edge at turn 2 using Move or Sprint.", objective:"An attacker performs Place Demolition Charge on the cache. Countdown starts at 3 and loses 1 for every subsequent card drawn. At zero it explodes: all models within a rolled 2D6 inches suffer a 2D6 Mt blast-chart attack. A defender within 1 inch may Defuse with a successful skill check.", twist:"At each turn end, attacker may move one model a distance equal to activations on the discarded card. Defender cannot rout.", reward:"The model whose charge destroys the cache gains D3 XP; each successful Defuse gives its model 1 XP.", end:"End of turn 4, or end of the turn when the cache explodes."},
    {name:"Smash and Grab", pages:"16-17", setup:"3 x 3 feet; central village, at least 3 buildings, preferably over 6. The 3 most central buildings may hide the informant. Deploy within 9 inches of home edge; roll off for deployment order, alternate models; first deployer goes first. Infiltrators arrive on turn 2.", objective:"Enter a candidate house and roll D6: 1 causes a D6 blast hit to every model within 3 inches of the building edge; 2-4 gains that many Marks; 5-6 finds the informant. If two houses have been searched, the third automatically contains him. Escort him off your home edge. He stays within 1 inch of his guard, moves at standard infantry MA, cannot sprint, may ride transports. Guard may shoot, skedaddle and return fire, but not charge. Informant T4; OOA informant can be carried or tended. Successful shots against guard hit informant on 1-3, guard on 4-6. If separated or guard becomes OOA, he cowers until another non-OOA model comes within 1 inch. In melee he cowers and joins the winner.", twist:"No blast weapons or grenades may target within 6 inches of buildings.", reward:"Winner gains 2D6 Marks. If one patrol kills the informant after putting him OOA, the other gains 2D6 Marks.", end:"Informant escapes, dies, or a patrol routs."},
    {name:"Take the Town", pages:"18-19", setup:"3 x 3 feet. Six objectives: a beacon centered 4 inches from each home edge; four caches 12 inches from home edges and 4 inches from side edges. Deployment within 8 inches of home edge, at least 12 inches from sides. Roll off to deploy first or second; first deployer goes first.", objective:"At each turn end, compare Ready models within 1.5 inches of each objective center (or any part of terrain representing it). Each held cache scores 2 VP, each beacon 1 VP. Holding both beacons gives immediate victory. Otherwise highest VP wins at turn 3 end.", twist:"A model within a cache's control distance may reroll one die on a ranged-attack skill check.", reward:"Normal campaign XP and exploration; no extra scenario reward.", end:"Both beacons held by one player, or end of turn 3."},
    {name:"Brave Little Quar", pages:"20-21", setup:"3 x 3 feet; dense town, at least 4 buildings, preferably over 6, with central brewery. Deployment zone extends 9 inches from home edge and 18 inches from your side edge (see source diagram). Roll off deployment order; first deployer goes first. Infiltrators arrive after their player draws 2 activation cards. Put an ale barrel 3 inches in from each unoccupied corner.", objective:"Have most models within 2 inches of brewery at turn 3 end. A Ready model within 1 inch of a barrel generates 1 Pluck after the opponent's round; maximum 3 Pluck from both barrels per round.", twist:"After a round in which a barrel generates Pluck, roll separately for each barrel: 1 contributing model: 1 kicked, 2-5 flows, 6 gains D6 Marks; 2 models: 1-2 kicked, 3-4 flows, 5-6 gains 2D6 Marks; 3 models: 1-3 kicked, 4-6 gains 3D6 Marks. A kicked barrel is removed and one chosen friendly model is Gobsmacked.", reward:"Ale-sale rolls add Marks to the bank. Normal campaign XP also applies.", end:"End of turn 3."},
    {name:"Daring Rescue", pages:"22-23", setup:"3 x 3 feet. Rescuing patrol attacks, captor defends. Attacker zone 8 inches deep; defender zone starts 8 inches beyond attacker zone (consult source diagram). Captive centered 10 inches from defender's edge.", objective:"Defender may treat captive as Heavy (1,3) until revealed. First Ready unengaged attacker ending a round within 1 inch rolls D6: 1-2 treat captive as incapacitated from Tend Wounded; 3-4 one non-combat action per turn, no special abilities; 5-6 pistol only, otherwise normal abilities/actions. Move captive within 3 inches of attacker's home edge, then spend a task to escape. Defender may target captive only on the 5-6 result.", twist:"Attacker tests Rout only at 50% casualties.", reward:"A defending model gains 1 XP each time it puts an enemy OOA with a task within 3 inches of captive. Escape returns the captive to their roster; gear retained depends on ransom/rescue agreement.", end:"Captive escapes, or end of turn 4."},
    {name:"PykPyk Pillagers", pages:"24-25", setup:"3 x 3 feet. Roll 2D6 objectives; alternate placing them more than 3 inches apart. Each deployment half extends 18 inches to mid-board. Roll off deployment order, alternate models at least 9 inches from enemies and 6 inches from friends. First deployer goes first and is attacker.", objective:"Within 1 inch, Investigate an objective, roll D6, then remove it: 1-2 nothing; 3-4 gain D6 Marks; 5-6 gain 3D3 Marks. Most investigated objectives wins. If one patrol routs, survivor automatically gathers remaining supplies, without XP for rolled sixes.", twist:"An investigation roll of 1 Gobsmacks its model; a 6 gives that model 1 XP as well as Marks, unless automatically collecting after a rout.", reward:"Investigation Marks go to the bank immediately; natural 6 gives 1 XP as described.", end:"All objectives claimed, a rout resolves remaining supplies, or end of turn 2."}
  ],
  notes: [
    "Underquar bonuses stack: the Underquar gets the bonus for its own difference band and every band above it in the chart (e.g. 40 Marks behind = D3 Pluck, choose the scenario and two PykPyks). Ruling by the site owner, 5 Nov 2026.",
    "Exploration does not specify overlapping sets or five/six of a kind. Default here: one highest event per face, capped at quadruples; choose 2/3/4 per face before resolving if your group agrees differently.",
    "Marksman level 2, roll 4 grants Blunt-rounds; the adjacent +1 MA belongs to the level 1 column. Consult the core rules for the ability effect.",
    "Duplicate advancement abilities permit a choice from the same level's chart. Numeric improvements count as duplicates after they were rolled before, following the PDF's Ranged example. Starting Ranged/Melee modifiers also count.",
    "The PDF does not assign shop prices to recovered faction weapons. They may be equipped, but their added value must be agreed and entered; no price is invented.",
    "No initial-equipment count exception is stated. Listed starting equipment is locked; newly assigned equipment is limited to the remaining space within 3 pieces. Discuss abstract equipment and weapon-team entries with your opponent.",
    "A second result anywhere in the lasting-injury group (3, 4, 10, 11) retires a model; the source does not explicitly say whether the second must be identical. This implementation counts any second result from that group."
  ]
};
