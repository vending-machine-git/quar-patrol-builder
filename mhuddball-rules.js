"use strict";
window.QuarMhuddballRules = {
  title:"Mhuddball",
  version:"1.1",
  source:"Mhudball.pdf",
  // Each roster: printed ones have page (PDF p. 18-19); unofficial:true ones are the builder's stand-ins with a "basis" (the core-game unit used).
  rosters:[
    {id:"fidwog", name:"Fidwog", page:18, positions:[
      {id:"caerten", name:"Is-Caerten", sk:13, mt:"2d6", ma:5, t:4, ap:2, pc:-1, abilities:["Leader (2/8)"]},
      {id:"linequar", name:"Linesquar", sk:12, mt:"1d6+1", ma:5, t:4, ap:4, pc:0, abilities:["Support"]},
      {id:"miner", name:"Miner", sk:13, mt:"2d6", ma:5, t:4, ap:2, pc:-1, abilities:["Hardened"]},
      {id:"playmaker", name:"Play maker", sk:12, mt:"1d6+1", ma:5, t:4, ap:8, pc:-2, abilities:["Dead eye"]}
    ]},
    {id:"toulmore", name:"Toulmore", page:18, positions:[
      {id:"caerten", name:"Is-Caerten", sk:12, mt:"1d6+2", ma:5, t:4, ap:4, pc:-2, abilities:["Leader (3/6)","Shooting (+1)"]},
      {id:"linequar", name:"Linesquar", sk:13, mt:"1d6+2", ma:5, t:4, ap:4, pc:-1, abilities:["Support"]},
      {id:"pathfinder", name:"Pathfinder", sk:13, mt:"2d6+1", ma:6, t:4, ap:2, pc:-1, abilities:["Killing strike"]},
      {id:"physio", name:"Physio", sk:12, mt:"1d6+2", ma:5, t:4, ap:4, pc:-1, abilities:["Medic"]}
    ]},
    // ---- UNOFFICIAL stand-in rosters (5 Nov 2026, site owner's request) ----
    // NOT in the original Mhuddball rules. Made with the author's own conversion method, which reproduces all 8 printed
    // Mhudders exactly: Sk/Mt/MA/T copied from the core profile; AP = longest weapon range - 2; PC from points
    // (19- +1, 20-25 0, 26-34 -1, 35+ -2), +1 per lost weapon trait, +1 if Veteran is dropped, -1 if AP is 8+.
    // Balance pass (v.29, owner's request): every positional has exactly ONE ability, taken only from the abilities the
    // author wrote for Mhuddball (Leader, Support, Hardened, Dead eye, Killing strike, Medic, Shooting/Passing/Tackling (+X));
    // leader = Leader, Linesquar = Support (Gwynt: "Steady Under Fire", works exactly like Support), two specialists with
    // different abilities. PC then nudged so a Mhudder matching one of the printed ones costs the same Pluck.
    // v.30 (owner): teams that came out weaker than the printed Fidwog team get ONE positional with a second ability
    // (like the printed Toulmore Is-Caerten): Crusaders Is-Caerten, Western Arnyara Askyldae, Tollyn Maeryn Auld Buck
    // (all restore an ability the core unit has), Maebwysh Trench Raider, Gloam Hyyn Buccaneer, Hoblyn Valley Gamesquar.
    {id:"coftyrans", name:"Coftyrans", unofficial:true, positions:[
      {id:"caerten", name:"Is-Caerten", sk:12, mt:"1d6+2", ma:5, t:4, ap:6, pc:-1, abilities:["Leader (2/5)"], basis:"is-Caerten (Harlech), 35 pts (Profiles p10)"},
      {id:"linequar", name:"Linesquar", sk:12, mt:"2d6-1", ma:5, t:4, ap:6, pc:0, abilities:["Support"], basis:"Rhyfler (Harlech), 25 pts (Profiles p9)"},
      {id:"raider", name:"Trench Raider", sk:13, mt:"2d6+1", ma:6, t:4, ap:2, pc:-1, abilities:["Killing strike"], basis:"Trench Raider (Doru & Sword), 42 pts (Profiles p10)"},
      {id:"playmaker", name:"Play maker", sk:13, mt:"1d6+1", ma:5, t:4, ap:6, pc:-2, abilities:["Dead eye"], basis:"Sharpshooter (Harlech), 35 pts (Profiles p10)"}
    ]},
    {id:"creevin", name:"Creevin", unofficial:true, positions:[
      {id:"yawdryl", name:"Yawdryl", sk:12, mt:"2d6-1", ma:5, t:4, ap:6, pc:-1, abilities:["Leader (3/4)"], basis:"Yawdryl (Gybyl–Hawlyr Rhyfle), 30 pts (Profiles p16)"},
      {id:"linequar", name:"Linesquar", sk:12, mt:"1d6+2", ma:5, t:4, ap:6, pc:0, abilities:["Support"], basis:"Rhyfler (Gybyl–Hawlyr Rhyfle), 25 pts (Profiles p16)"},
      {id:"ferryt", name:"Trench Ferryt", sk:13, mt:"2d6", ma:5, t:4, ap:2, pc:-1, abilities:["Hardened"], basis:"Trench Ferryts (Trench Pistol), 44 pts (Profiles p16)"},
      {id:"scout", name:"Scout", sk:12, mt:"1d6+2", ma:6, t:4, ap:6, pc:-1, abilities:["Passing (+1)"], basis:"Scout (Gybyl–Hawlyr Rhyfle), 30 pts (Profiles p16)"}
    ]},
    {id:"crusaders", name:"Crusaders", unofficial:true, positions:[
      {id:"caerten", name:"Is-Caerten", sk:12, mt:"1d6+2", ma:5, t:4, ap:4, pc:-1, abilities:["Leader (3/6)", "Shooting (+1)"], basis:"is-Caerten (Bogen), 36 pts (Profiles p19)"},
      {id:"linequar", name:"Linesquar", sk:12, mt:"1d6+2", ma:5, t:4, ap:4, pc:0, abilities:["Support"], basis:"Rhyfler (Bogen), 25 pts (Profiles p18)"},
      {id:"playmaker", name:"Play maker", sk:12, mt:"1d6+2", ma:5, t:4, ap:4, pc:-1, abilities:["Dead eye"], basis:"Squad Marksquar (Bogen), 27 pts (Profiles p18)"},
      {id:"physio", name:"Physio", sk:12, mt:"1d6+2", ma:5, t:4, ap:4, pc:-1, abilities:["Medic"], basis:"Cook (Bogen), 30 pts (Profiles p19)"}
    ]},
    {id:"western-arnyara", name:"Western Arnyara/Aber", unofficial:true, positions:[
      {id:"bosun", name:"Bosun", sk:12, mt:"1d6+2", ma:5, t:4, ap:4, pc:-1, abilities:["Leader (3/4)"], basis:"Bosun (MAR SMG), 33 pts (Profiles p28)"},
      {id:"linequar", name:"Linesquar", sk:11, mt:"1d6", ma:5, t:4, ap:4, pc:1, abilities:["Support"], basis:"Able (MAR SMG), 19 pts (Profiles p28)"},
      {id:"askyldae", name:"Askyldae", sk:11, mt:"2d6-1", ma:6, t:4, ap:4, pc:-1, abilities:["Hardened", "Shooting (+1)"], basis:"Askyldae (MAR SMG & Anti-tractor Grenades), 40 pts (Profiles p28)"},
      {id:"sharpshooter", name:"Sharpshooter", sk:12, mt:"1d6+1", ma:5, t:4, ap:8, pc:-2, abilities:["Dead eye"], basis:"Sharpshooter (PYN-64 Rifle), 34 pts (Profiles p28)"}
    ]},
    {id:"gwynt", name:"Principality of Gwynt", unofficial:true, positions:[
      {id:"caerten", name:"Is-Caerten", sk:12, mt:"1d6+2", ma:5, t:4, ap:6, pc:-1, abilities:["Leader (2/5)"], basis:"is-Caerten (Harlech), 35 pts (Profiles p31)"},
      {id:"linequar", name:"Linesquar", sk:12, mt:"2d6-1", ma:5, t:4, ap:6, pc:0, abilities:["Steady Under Fire"], basis:"Rhyfler (Harlech), 28 pts (Profiles p30)"},
      {id:"courier", name:"Courier", sk:13, mt:"2d6", ma:6, t:4, ap:4, pc:-1, abilities:["Killing strike"], basis:"Courier (Harlech Carbine w/ Bayonet), 42 pts (Profiles p30)"},
      {id:"physio", name:"Physio", sk:12, mt:"1d6+2", ma:5, t:4, ap:6, pc:-1, abilities:["Medic"], basis:"Cook (Harlech), 30 pts (Profiles p31)"}
    ]},
    {id:"ergydiwr", name:"Ergydiwr", unofficial:true, positions:[
      {id:"caerten", name:"Is-Caerten", sk:12, mt:"2d6+1", ma:5, t:4, ap:2, pc:-1, abilities:["Leader (3/5)"], basis:"is-Caerten (Mace & Pistol), 35 pts (Profiles p41)"},
      {id:"linequar", name:"Linesquar", sk:12, mt:"2d6-1", ma:5, t:4, ap:6, pc:0, abilities:["Support"], basis:"Rhyfler (Tefsyn Rhyfle), 25 pts (Profiles p41)"},
      {id:"raider", name:"Trench Raider", sk:13, mt:"2d6+1", ma:6, t:4, ap:2, pc:-1, abilities:["Killing strike"], basis:"Trench Raiders (Pistol & Billhook Knife), 46 pts (Profiles p41)"},
      {id:"physio", name:"Physio", sk:12, mt:"1d6+2", ma:5, t:4, ap:6, pc:-1, abilities:["Medic"], basis:"Cook (Tefsyn Rhyfle), 30 pts (Profiles p41)"}
    ]},
    {id:"gloam-hyyn", name:"Rhyflers of Gloam Hyyn", unofficial:true, positions:[
      {id:"caerten", name:"Is-Caerten", sk:12, mt:"2d6", ma:5, t:4, ap:2, pc:-1, abilities:["Leader (2/5)"], basis:"is-Caerten (Pistol & Sword), 30 pts (Profiles p44)"},
      {id:"linequar", name:"Linesquar", sk:12, mt:"2d6-1", ma:5, t:4, ap:4, pc:0, abilities:["Support"], basis:"Rhyfler (Harlech Carbine), 25 pts (Profiles p43)"},
      {id:"buccaneer", name:"Buccaneer", sk:12, mt:"2d6", ma:5, t:4, ap:2, pc:0, abilities:["Hardened", "Tackling (+1)"], basis:"Buccaneer (Paired Flyntlock Pistols), 36 pts (Profiles p44)"},
      {id:"playmaker", name:"Play maker", sk:12, mt:"1d6+1", ma:5, t:4, ap:4, pc:-1, abilities:["Dead eye"], basis:"Marksquar (Harlech Carbine), 28 pts (Profiles p44)"}
    ]},
    {id:"hoblyn-valley", name:"Hoblyn Valley Rangers", unofficial:true, positions:[
      {id:"yawdryl", name:"Yawdryl", sk:11, mt:"1d6+1", ma:5, t:4, ap:4, pc:0, abilities:["Leader (3/6)"], basis:"Yawdryl (Sketych), 25 pts (Profiles p46)"},
      {id:"linequar", name:"Linesquar", sk:10, mt:"1d6+1", ma:5, t:4, ap:4, pc:1, abilities:["Support"], basis:"Gaefyn (Sketych), 18 pts (Profiles p46)"},
      {id:"gamesquar", name:"Gamesquar", sk:12, mt:"2d6", ma:5, t:4, ap:2, pc:0, abilities:["Tackling (+1)", "Hardened"], basis:"Gamesquar (Shotgun & Dirk), 34 pts (Profiles p47)"},
      {id:"bushbuck", name:"Bushbuck", sk:12, mt:"1d6+1", ma:5, t:4, ap:8, pc:-2, abilities:["Dead eye"], basis:"Bushbuck (is-Haem Long Rhyfle), 28 pts (Profiles p47)"}
    ]},
    {id:"maebwysh", name:"Maebwysh", unofficial:true, positions:[
      {id:"caerten", name:"Is-Caerten", sk:12, mt:"1d6+2", ma:5, t:4, ap:2, pc:-1, abilities:["Leader (3/6)"], basis:"is-Caerten (Pistol), 31 pts (Profiles p51)"},
      {id:"linequar", name:"Linesquar", sk:12, mt:"1d6+1", ma:5, t:4, ap:4, pc:0, abilities:["Support"], basis:"Rhyfler (Jokyn SMG), 25 pts (Profiles p50)"},
      {id:"raider", name:"Trench Raider", sk:13, mt:"2d6", ma:5, t:4, ap:4, pc:-1, abilities:["Hardened", "Tackling (+1)"], basis:"Trench Raiders (Jokyn), 32 pts (Profiles p50)"},
      {id:"physio", name:"Physio", sk:12, mt:"1d6+2", ma:5, t:4, ap:4, pc:-1, abilities:["Medic"], basis:"Cook (Jokyn), 30 pts (Profiles p51)"}
    ]},
    {id:"tollyn-maeryn", name:"Tollyn Maeryn", unofficial:true, positions:[
      {id:"auldbuck", name:"Auld Buck", sk:12, mt:"2d6-1", ma:5, t:4, ap:6, pc:-1, abilities:["Leader (3/5)", "Support"], basis:"Auld Buck Yawdryl (Bostad rev53), 33 pts (Profiles p53)"},
      {id:"linequar", name:"Linesquar", sk:10, mt:"1d6+2", ma:5, t:4, ap:6, pc:1, abilities:["Support"], basis:"Militia Rhyfler (Bostad rev53), 18 pts (Profiles p53)"},
      {id:"lonebuck", name:"Lone Buck", sk:13, mt:"2d6", ma:6, t:4, ap:8, pc:-2, abilities:["Shooting (+1)"], basis:"Irascible Lone Buck (Bolt Action Rhyfle), 45 pts (Profiles p53)"},
      {id:"pykplucker", name:"Pykplucker", sk:11, mt:"1d6+2", ma:5, t:4, ap:6, pc:0, abilities:["Passing (+1)"], basis:"Militia Pykpluckers (Bostad rev53), 25 pts (Profiles p53)"}
    ]}
  ],
  tasks:[
    {id:"pluck-move", name:"Pluck move (1 inch, no Task)", cost:1, noAction:true, text:"Move up to 1 inch without using an action. Spend Steady's temporary point first if available; otherwise spend one banked Pluck."},
    {id:"move", name:"Move", cost:0, text:"Move up to MA inches. Cannot move through other Mhudders or use Move while engaged with a non-OOA opponent."},
    {id:"sprint", name:"Sprint", cost:0, text:"Move up to twice MA; cannot come within 2 inches of an opponent."},
    {id:"charge", name:"Charge", cost:1, text:"Move up to twice MA, ending engaged with an opponent. May then Tackle without using the activation's one Mhuddball task."},
    {id:"charge-tackle", name:"Bonus Tackle after Charge", cost:0, bonus:true, text:"Resolve the Tackle granted by Charge, without spending a further action or Mhuddball-task allowance (implementation interpretation; agree before play)."},
    {id:"duke", name:"Duke", cost:0, text:"Begin engaged; all engaged Mhudders make opposed 3D6 Skill checks. Lowest successful roll chooses a free Move or Tackle. Re-roll ties; if all fail they remain engaged."},
    {id:"pass", name:"Pass", cost:0, ball:true, text:"Pass to a friendly Mhudder in front, neither engaged nor Gobsmacked. Check the passing line and 3D6 result table."},
    {id:"aimed-pass", name:"Aimed pass", cost:1, ball:true, text:"Dead eye only: pass without extra AP range-band penalties."},
    {id:"shoot", name:"Shoot", cost:1, ball:true, text:"Shoot at the opposing hoop. Declare a possible diving save, gather modifiers and check the shooting result table."},
    {id:"tackle", name:"Tackle", cost:0, ball:true, text:"Attack an engaged opponent. Check 3D6 against modified Skill, then Might against Toughness."},
    {id:"handoff", name:"Hand off", cost:0, text:"Spend one action to give the gourd to an adjacent model. A Soggy recipient must pass Skill or resolve the mishap chart."},
    {id:"coordinated", name:"Coordinated assault", cost:1, text:"Leader ability required. Coordinate the allowed nearby Mhudders; their actions cannot be interrupted. Use the printed Leader X/Y range, not the conflicting task wording."},
    {id:"steady", name:"Steady", cost:0, text:"Gain one temporary Pluck for the next Task only, then lose any unspent point. This credit is tracked separately from the team's bank."},
    {id:"recover", name:"Recover", cost:0, text:"Remove Gobsmacked. This is the only task allowed while Gobsmacked."},
    {id:"tend", name:"Tend Wounded", cost:0, text:"Move up to 1 inch into contact with an OOA Mhudder (even an opponent), then roll D6. A Physio may affect all Mhudders within 2 inches with one task."}
  ],
  sections:[
    {title:"The game, pitch and victory", page:"1-2, 5-6", text:"Two teams of six Mhudders, at most five deployed per side. Play on a 2-foot-square pitch facing diagonally. Center a Large template on each opposing corner for the goal zones; place a hoop token at each goal-zone edge and divide the pitch into two halves. Goals are gourd throws through the opposing hoop. Six gourds are shared across regulation play. The highest goal total wins once all six are out of play. A tie resets play with two new gourds, one per team; the first goal wins sudden death."},
    {title:"Team selection and initial deployment", page:"3, 5, 18-19", text:"Choose six from one printed faction roster. Every positional is limited to one except Linesquar/Linequar, limited to four. Deploy five in your goal zone and keep one on the sideline. Starting Pluck is 7 plus the signed sum of PC, never below zero. Choose one deployed Gourder per team. Roll D6 against your opponent; highest chooses attacker or defender, re-rolling ties. The attacker starts the round."},
    {title:"Turns, activations and interruptions", page:"5, 7-9", text:"The attacking side activates its five Mhudders in any order, or passes unused activations, then the turn passes to the other side. Each activation grants two actions, only one of them a Mhuddball task. Injured players may be limited to one. One interruption is allowed per movement or Mhuddball task. Interrupting Charge costs 1 Pluck and moves up to twice MA into contact before a Tackle. Re position costs 1 Pluck and moves up to MA. Intercept is available on the passing line or in contact with the intended target."},
    {title:"Gourds, resets and substitutions", page:"2, 5-6", text:"Each side starts with one of the six gourds. A gourd that touches the ground or leaves the pitch is removed; a goal also removes its gourd. Stolen gourds remain in play. Do not replace a gourd immediately after scoring. Only when BOTH gourds are gone do teams reset, substitute from their sidelines, redeploy, receive one new gourd each and roll off again. Each reset grants both sides 2 Pluck. The tracker counts gourds as used when issued; regulation ends only when no reserve AND no active gourds remain."},
    {title:"Skill, range bands and measuring", page:"2-3, 10-12", text:"Roll 3D6 no higher than modified Skill to succeed. Modifiers alter the target number, not the dice. For a pass or shot, each AP range band beyond the first gives a cumulative -2. Measure throwing distances base to base; measure movement from the same forward base edge before and after moving. Measure freely at any time."},
    {title:"Pluck", page:"3-4, 6, 9", text:"Spend one Pluck to improve a Skill Check by one, improve Might by one, move a Mhudder 1 inch without a task, or pay a task's stated cost. Players may agree other narrative uses and bargain over the price. Gain one for a successful pass, an interception, a goal, putting a Mhudder OOA, or a Tend Wounded result of 4-6. Steady's one temporary point is for the next task only, not banked indefinitely. The app's dice helpers do not spend or award Pluck automatically: record tasks and resulting Pluck explicitly on the match desk."},
    {title:"Optional weather", page:"6", text:"After deployment flip an activation card: 3 starts Bright, 4 Raining, 5 Wyndy. After EVERY completed team turn, flip another card; a higher value moves one weather step toward Wyndy, a lower one toward Bright, and an equal one leaves it unchanged. Bright clears all puddles and Soggy markers. Raining adds one Medium-template puddle per player in the opposing half. Entering or being pushed through a puddle causes Soggy until Bright. The PDF mentions Wyndy passing/shooting penalties but gives no numeric value: agree the modifier and enter it in the helper."},
    {title:"Passing and shooting modifiers", page:"10-13", text:"Draw a line base to base to the target or hoop. Shooting: -4 per opposing Mhudder on the line, -4 per opposing Mhudder in contact with the Gourder, -2 per extra AP band, and -2 if the Gourder sprinted this activation. Passing: -1 per opposing Mhudder on the line, -4 per opposing Mhudder in contact with the Gourder, -4 per opposing Mhudder in contact with the target, -2 per extra AP band, and -2 after Sprint. Add any Shooting/Passing ability. Aimed pass (Dead eye, 1 Pluck) ignores extra range-band penalties. Soggy shooter: re-roll 1s on the Skill dice. Soggy passer OR recipient: re-roll 1s."},
    {title:"Shooting results and diving saves", page:"10-11", text:"3: automatic goal; all opponents on the shooting line are OOA and the scoring team clears Gobsmacked. 4-5: automatic goal and one opponent on the line is OOA. Ordinary success: goal. 16-17: opposing player selects a Mhudder on the shooting line to take possession. 18: same transfer, and the shooter cannot Shoot again this game. A failure below 16 uses the shot/pass mishap table. A declared Diving save moves a defender within MA onto the shooting line; the defender must be neither Gobsmacked nor Soggy. The draft's normal-shot text calls misses grounded, but its specific mishap table can retain or transfer possession; the helper uses the more specific table."},
    {title:"Passing results, hand-offs and Support", page:"11-13, 17", text:"3: automatic pass and the recipient gets a free Move. 4-5: automatic pass and move the recipient 1 inch. Ordinary success: transfer the gourd. 16-17: opponent chooses a Mhudder on the passing line to receive it. 18: same transfer, and the passer cannot Pass again this game. A failure below 16 uses the mishap table. A hand-off costs one action to give the gourd to an adjacent model; a Soggy recipient checks Skill and uses the mishap table on failure. Support lets a successful recipient immediately pass onward to another in-range Mhudder without using its normal Mhuddball-task allowance."},
    {title:"Shot / pass mishaps (D6)", page:"13", text:"6: keep possession and continue if actions remain. 4-5: keep possession and become Gobsmacked. 3: the nearest Mhudder to the target other than the actor gets possession. 2: ground the gourd. 1: ground it and put the acting Mhudder OOA. Determine nearest models and geometry at the table, then record the possession/status changes."},
    {title:"Interception (two D6 face patterns)", page:"7-8", text:"6/6: take possession and gain a free Pass. 6/-: take possession. 6/1: nearest Mhudder to the interceptor rolls on this chart. -/-: no interception; continue the Pass. 1/-: nearest Mhudder on the passing side takes possession. 1/1: no interception, but the interceptor is OOA. Read special pairs first, in either order. Soggy interceptors re-roll 6s. A successful interception grants 1 Pluck."},
    {title:"Tackle Skill checks", page:"14", text:"Target must be an engaged opponent. Add +1 per additional friendly Mhudder, -1 per additional opposing Mhudder, and +2 if the target is Gobsmacked. Add any Tackling ability. Killing strike trades -2 to the target number for +2 Might. A Gobsmacked attacker must Recover first. Skill dice total 3: automatic hit and triple Might. 4-5: automatic hit and double Might. Ordinary success: roll Might. 16-17: miss and target gets a free Tackle. 18: miss and target chooses a free Tackle with double Might or a free Move."},
    {title:"Tackle Might, gourd stripping and Duke", page:"15", text:"Might below Toughness: defender may push the attacker 1 inch. Equal: attacker may push the defender 1 inch. Greater: Gobsmack and push defender 2 inches; if already Gobsmacked, they become OOA. At least twice Toughness: OOA. At least triple: removed for the remainder of the game. A successful tackle against a Gourder triggers opposed 3D6 Skill checks: lowest success wins possession, re-roll ties, subtract 1 from your roll for greater Might and add 1 if Soggy. Both failing leaves possession unchanged. An OOA/removed Gourder drops its gourd; an engaged opponent takes it instead if present. Duke uses opposed Skill checks among all engaged models; lowest success chooses free Move or Tackle, ties re-roll, all failing stay engaged."},
    {title:"Tend Wounded (D6)", page:"9, 16", text:"6: Ready. 4-5: Gobsmacked instead of OOA. 3: returns with one task per turn. 2: goes to the sideline, may return at the next reset with one task per turn. 1: removed for the rest of the game. Medic adds 1; the helper caps the modified result at 6 because the chart has no 7 row. Physio may Tend all eligible Mhudders within 2 inches with one task; resolve each patient manually. Results 4-6 grant the tending team 1 Pluck."},
    {title:"Statuses and special abilities", page:"15-17", text:"Ready: normal tasks. Engaged: base contact with an opponent; cannot Pass or be targeted by Pass. Gobsmacked: only Recover until cleared; repeated Gobsmacked normally does not worsen status, except from Tackles. OOA: cannot act, but can be tended. Soggy: affects throwing and interceptions. Hardened ignores the FIRST Soggy result of the game. Dead eye grants Aimed pass. Killing strike trades -2 Skill for +2 Might on a Tackle. Leader X/Y coordinates X models within Y inches. Medic adds 1 to Tend. Shooting/Passing/Tackling modifiers affect the named task. Support grants a free follow-on pass after receiving a successful pass."}
  ],
  notes:[
    "This is the standalone 19-page Mhuddball v1.1 supplement. It adds no campaign XP, Supply, injuries, faction points or recruitment rules from the other narrative systems.",
    "Use the printed Fidwog and Toulmore sport profiles exactly as shown, including their AP and signed PC. The draft conversion note on p. 18 says reduce ranges by 2 inches; points 19 or below give PC +1, 20-25 give 0, 26-34 give -1, 35+ give -2, and each lost weapon ability adds +1. It does not fully specify other factions or retained abilities. The printed Fidwog and Toulmore profiles are used exactly as printed. The other ten factions have UNOFFICIAL stand-in rosters added by the builder (not in the original rules), made with that conversion note plus the patterns in the printed rosters (see the Unofficial rosters section); they should be replaced when the author publishes official ones.",
    "The PDF varies 'Linequar' and 'Linesquar' and 'Dead eye'/'Deadeye'; these are treated as the same positional/ability. PC is added as a signed adjustment to 7, not subtracted twice.",
    "Opening attacker is a player choice after the D6 roll-off, not automatically the higher roller. Repeat the roll-off at every reset, including sudden death. Team turns alternate; there is no five-round or activation-card duration limit imported from the other systems.",
    "Resets do not automatically heal Gobsmacked/OOA players or clear Soggy: no such recovery is stated. A player winded by Tend result 2 can return at the next reset with a one-task limit. Removed players cannot return. If injuries leave fewer than five available, the tracker permits a reduced lineup after the initial deployment; agree how your group handles this unspecified case.",
    "Charge's granted Tackle is tracked as a free bonus without consuming the usual Mhuddball-task allowance. Steady consumes an action; its point expires on the next recorded task. Coordinated assault and interruption/free-task timing still need tabletop adjudication and a written explanation for free-task bookkeeping.",
    "The manual and helpers do not adjudicate physical distances, lines, engagement, pushes, diving saves, opposed-check ties, or free movement. Dice helper results are provisional advice until you record them; recording the dice result only adds it to the journal. Apply the outcome using match-desk possession, goal, status, task and Pluck controls, avoiding double awards.",
    "For physical dice, enter the final values after any Soggy re-rolls. In-app Soggy dice receive one re-roll of each original qualifying die; a re-rolled 1/6 is kept, an interpretation of the usual re-roll convention. Wyndy's penalty must be agreed because the PDF omits its magnitude. Additional Pluck changes the Skill target, not the dice; apply any spend explicitly.",
    "A gourd can be scored by either team after changing hands. The shared reserve is not replenished mid-round. The tracker does not impose an unstated one-gourd-per-Mhudder limit. If a fluffed pass/shot has no eligible model on its line, agree and record a resolution rather than assuming it was a goal or grounding it automatically."
  ]
};
