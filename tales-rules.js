"use strict";
window.QuarTalesRules = {
  title: "Quar Tales",
  source: "Quar Tales Rules.docx.pdf",
  recovery: {
    fodder: [
      ["66", "Full recovery; become a Character and gain one attribute increase (within limits)."],
      ["6-", "Full recovery; the Force gains 25 XP."],
      ["61", "Recover, but miss the next Skirmish."],
      ["--", "Full recovery."],
      ["1-", "Killed."],
      ["11", "Killed; their squad has -1 Skill next Skirmish, including replacements."]
    ],
    character: [
      ["66", "No injury; gain one attribute increase within advancement limits."],
      ["6-", "Start next Skirmish Gobsmacked; Recover grants no Pluck."],
      ["61", "Miss the next Skirmish."],
      ["--", "Permanent injury: -1 Skill and -1 Movement Allowance."],
      ["1-", "Permanent injury: -2 Toughness and -2 Movement Allowance."],
      ["11", "Killed; next Skirmish the entire Patrol, including vehicles, has -1 Skill (non-stacking)."]
    ],
    vehicle: [
      ["66", "Recovered and fully repaired for free."],
      ["6-", "Recovered, but Disabled until fully repaired."],
      ["61", "Recovered; choose an uninjured Patrol rhyfler and resolve a Fodder recovery roll."],
      ["--", "Recovered; permanently reduce both Movement Allowance values by 1."],
      ["1-", "Enemy chooses one main/integral weapon to destroy permanently. Destroy the vehicle if no weapons remain."],
      ["11", "Wrecked permanently; cannot be repaired or replaced."]
    ]
  },
  advances: [
    {id:"skill", name:"Skill +1", cost:100, max:2},
    {id:"toughness", name:"Toughness +1", cost:250, max:1},
    {id:"veteran", name:"Veteran", cost:150, max:1},
    {id:"hardened", name:"Hardened", cost:150, max:1},
    {id:"hero", name:"Hero (Veteran and Hardened)", cost:150, max:1}
  ],
  advantages: [
    {id:"reroll", name:"Re-roll any die", cost:25, max:5, text:"One die re-roll during the next Skirmish."},
    {id:"recover", name:"Automatic recovery from KIA", cost:50, max:null, text:"One automatic recovery at battle end. Assign to a pending non-vehicle recovery instead of rolling."},
    {id:"pluck", name:"Additional starting Pluck", cost:15, max:3, text:"One additional starting Pluck in the next Skirmish."},
    {id:"action", name:"Additional action", cost:25, max:3, text:"One extra action during a card in the next Skirmish."}
  ],
  shop: [
    {id:"trenches", name:"Trenches", cost:8, max:1, temporary:true, text:"Any number in your deployment zone next Skirmish; Difficult, Normal Obstructing Cover (-2).", page:9},
    {id:"wire", name:"Razor Wire / Barricade", cost:2, max:2, temporary:true, text:"One piece, up to the source's stated 6-foot length, outside enemy deployment. Light Obstructing Cover (-1), Difficult. Agree the printed measurement before play.", page:9},
    {id:"minefield", name:"Minefield", cost:6, max:1, temporary:true, text:"One impassable square or round area for next Skirmish. Source states 6 feet; agree this measurement before play.", page:9},
    {id:"pillbox", name:"Pillbox", cost:4, max:1, temporary:true, text:"One heavy defensive structure in your deployment zone; Heavy Obstructing Cover (-3).", page:9},
    {id:"artillery", name:"Artillery Support", cost:6, temporary:true, text:"Disclose before enemy deployment. After deployment place one Large Blast on their deployment zone; no attack Skill Check, 2D6 Might for each rhyfler hit.", page:10},
    {id:"map", name:"Map of the Local Area", cost:2, text:"Roll D6 for quality; assign to a Character. Fake: enemy picks next scenario. Vague: one next-Logistics re-roll. Trench: you choose next scenario. Accurate: three next-Logistics re-rolls. Aerial: one recurring Logistics re-roll while its bearer is neither incapacitated nor dead.", page:10},
    {id:"charm", name:"Lucky Charm", cost:2, text:"One per Character. After an attack Skill Check, before Reactions, force attacker to re-roll; accept the new result. Destroy after use.", page:10},
    {id:"helmet", name:"Sturdy Helmet", cost:2, text:"Destroy to replace a Gobsmacked or Out of Action result with Prone for the equipped Character.", page:10},
    {id:"lantern", name:"Lantern", cost:1, text:"Equipped Character ignores darkness penalties and benefits.", page:10},
    {id:"medicine", name:"Medicine", cost:1, text:"Remove a Character's next-Skirmish absence, whatever its cause; does not heal permanent stat penalties.", page:10},
    {id:"ammo", name:"Superior Ammunition", cost:8, temporary:true, text:"All Patrol rhyflers and vehicles gain +1 Skill for Ranged Combat Tasks next Skirmish.", page:10}
  ],
  mapQualities: ["Fake", "Vague", "Vague", "Trench", "Accurate", "Aerial"],
  encounters: [
    {size:2, face:1, name:"Well", page:5, text:"Choose an eligible Character; D6 no higher than Toughness earns 1 Supply. Failure makes them miss next Skirmish."},
    {size:2, face:2, name:"Shop", page:5, text:"D6 Supply, except a 6 gives one Lucky Charm instead."},
    {size:2, face:3, name:"Corpse", page:5, text:"D6: 1-2 = 1 Supply; 3 = Sturdy Helmet; 4 = Lantern; 5 = Lucky Charm; 6 = Map (roll quality)."},
    {size:2, face:4, name:"Straggler", page:5, text:"Recruit one basic rhyfler for free without exceeding the Force limit."},
    {size:2, face:5, name:"Overturned Cart", page:5, text:"Gain 1 Supply."},
    {size:2, face:6, name:"Ruined Homes", page:5, text:"Gain D3 Supply."},
    {size:3, face:1, name:"Tavern", page:5, text:"Highest-ranking Patrol rhyfler checks Skill. Pass: +10 Force XP. Fail: lose 1 Supply."},
    {size:3, face:2, name:"Smith", page:5, text:"Choose 1 Supply or one Sturdy Helmet (the encounter prints 'Study Helmet')."},
    {size:3, face:3, name:"Prisoners", page:5, text:"Choose D3 Supply for ransom, or one Map of the Local Area (roll its quality) for information."},
    {size:3, face:4, name:"Mechanic", page:5, text:"Repair D6 damage on one damaged vehicle for free. If none are damaged, gain D3 Supply."},
    {size:3, face:5, name:"Market", page:5, text:"Gain 2 Supply and 10 Force XP (source calls this 'Patrol XP')."},
    {size:3, face:6, name:"A Returned Favor", page:5, text:"Choose one free Defense for the next Skirmish."},
    {size:4, face:1, name:"Ammunition Factory", page:5, text:"Highest-ranking Patrol rhyfler checks Skill. Pass: one Superior Ammunition. Fail: choose a rhyfler and resolve Fodder recovery."},
    {size:4, face:2, name:"Shrine", page:5, text:"Each participating Character gains 10 XP."},
    {size:4, face:3, name:"Row Houses", page:6, text:"Optionally assist. Highest-ranking rhyfler checks Skill. Pass: 2 Supply and 10 Force XP. Fail: lose 10 Force XP."},
    {size:4, face:4, name:"Welder", page:6, text:"Pay 1 Supply to give one vehicle +1 armor to Tread, Hull or Engine (maximum 7), or +1 Toughness if it has no armor (maximum 6)."},
    {size:4, face:5, name:"Grave", page:6, text:"Optionally pay respects: lose 1 Supply and give one participating Character 20 XP."},
    {size:4, face:6, name:"Mass Grave", page:6, text:"Optionally bury the dead: free Trenches next Skirmish, but one eligible participating Character misses it. With no eligible Character, all Force Characters lose 10 XP."},
    {size:5, face:1, name:"Warehouse", page:6, text:"Gain 2D6 Supply."},
    {size:5, face:2, name:"Doctor", page:6, text:"Choose: remove one next-Skirmish absence; heal one injury and its stat penalty; or gain one Medicine."},
    {size:5, face:3, name:"Trinket Maker", page:6, text:"Pay 1 Supply to give every eligible participating Character a Lucky Charm (one per Character)."},
    {size:5, face:4, name:"Merchant Guild", page:6, text:"Gain 2D6 Supply. On 10-12 also choose a free standard vehicle/heavy weapon crew within the Force limit, or gain 9 more Supply. Dismiss units if necessary."},
    {size:5, face:5, name:"Shattered Buildings", page:6, text:"Gain D3 Supply. Highest-ranking Patrol rhyfler checks Skill. Pass: recruit a free rhyfler within the Force limit. Fail: a Fodder rhyfler makes a recovery roll."},
    {size:5, face:6, name:"Secret Tunnels", page:7, text:"Gain one permanent Logistics re-roll. Further discoveries do not stack: instead gain free Trenches next Skirmish."},
    {size:6, face:1, name:"Boxing Ring", page:7, text:"Optional unarmed melee between Leader and another Force Character; alternate 3D6 melee Skill Checks and normal Might. Loser is OOA and misses next Skirmish, never killed. Leader wins: +20 Leader XP. Leader loses: -20 Force XP."},
    {size:6, face:2, name:"Hidden Stockpile", page:7, text:"Gain 2D6 Supply. Roll separately for Charm, Helmet, Ammunition, Medicine and Artillery; each is found on 5+."},
    {size:6, face:3, name:"Engineer", page:7, text:"Gain two free Wire/Barricades. Roll separately for Trenches, Pillbox and Minefield; each is available next Skirmish on 5+."},
    {size:6, face:4, name:"Battlefield Remains", page:7, text:"Automatically gain 2D6 Supply. Separately on 5+ find: three Helmets; Ammunition; three Fodder of any rank/specialty (miss next Skirmish); Map (roll quality); Disabled standard vehicle; Disabled tractor; Artillery. All recruits fit Force limit; vehicles have maximum damage."},
    {size:6, face:5, name:"Training Manual", page:8, text:"Choose a Character to check Skill. Pass: free Skill +1, Toughness +1, Veteran or Hardened, within limits. Fail: manual is discarded, with no upgrade or resale."},
    {size:6, face:6, name:"Royal Fortress / Crusader Stronghold", page:8, text:"Automatically gain 3D6 Supply. Separately on 4+ receive: D6 Medicine; improve one Character weapon's Range and Snapshot by +1; one standard vehicle in perfect condition within Force limit."}
  ],
  notes: [
    "Use the PDF as the authority. Scenarios and narrative objectives are agreed by the players; every Skirmish lasts five rounds. No missions from Every Quar is His Own King are used.",
    "The app interprets recovery notation as two D6 in either order: 6/6 and 1/1 first, then 6/1, then any remaining 6 or 1, then neither. Remaining Pluck pays one per re-roll of a rhyfler recovery result or a Logistics die; the PDF does not spell out the exchange rate. It gives no Pluck re-roll for the vehicle chart, so vehicle exceptions require an agreement recorded in the journal.",
    "Force XP and Character XP remain separate. 'Patrol XP' in encounters is treated as Force XP. Draws have no stated outcome XP, so only recorded objectives award XP. No XP is awarded twice for a more-expensive incapacitation: it replaces the ordinary 25 XP, then Veteran/Character bonuses are added.",
    "Start with 2 Supply. The Force pool is 600-1000 points with one Leader plus one Character per complete 100 points. Patrols contain at most four other Characters and the Leader. The app enforces those caps even on Fodder promotions; free a slot before confirming a promotion.",
    "Character stat-increase limits are tracked across paid and free advances: Skill +2 and Toughness +1. The PDF gives no Movement/Might advancement limit or price; recovery attribute choices beyond these tracked stats must be agreed and recorded in notes, not invented by the app.",
    "Only one encounter is resolved per Logistics phase. If multiple matching sets qualify, choose one; larger sets may be used as a smaller matching set. The PDF gives no priority rule. Roll all dice but keep exactly six when seven or more are available.",
    "Injured Characters are excluded from Logistics and encounters, including Characters whose recovery table result was beneficial. Permanent injuries remain on the roster, but participation eligibility is assessed afresh each battle. Vehicles and weapon crews are single purchased roster entries; the PDF supplies no crew-cost splitting rules.",
    "The PDF does not price new vehicles or heavy weapon crews outside encounters, replacement Leaders, XP-based recovery beyond the listed 50-XP advantage, or recruitment of ranks above Yawdryl. The app does not invent costs: use encounter/manual awards with a journal explanation and agree exceptions with opponents.",
    "Complex encounters, free attribute choices other than Skill/Toughness, vehicle armor/weapon choices, squad membership, and tabletop tests are resolved by players using the displayed instructions, then recorded in the encounter and roster tools. Temporary benefits are tracked for the next battle; equipment uses must be marked by the player. Temporary maps are consumed when their relevant battle/Logistics phase ends; Aerial Maps persist with their bearer."
  ]
};
