"use strict";
window.QuarMhuddballRules = {
  title:"Mhuddball",
  version:"Teams Expansion v1",
  source:"Mhudball + Teams Expansion.pdf",
  // Mhuddball + Teams Expansion (v1), 34 pages. Original ruleset by TomDrawsThings, Teams Expansion by GamerCouch,
  // balancing and proofreading by both (PDF p. 1). Official rosters for all twelve factions (PDF pp. 22-34).
  // Positional fields: max = how many a team may take (default 1; Linesquar 4); pc2 = PC of a second copy (HVR Staff, p. 33);
  // staff = only through a Retinue; adaptive = the two abilities an "Adaptive tactics" Mhudder switches between (first is active).
  // Spelling evened out: "Croftyrans" -> Coftyrans (p. 28), "Hardend" -> Hardened (p. 32), "Deadeye"/"Dead-eye" -> Dead eye (pp. 23, 28),
  // "Shooting +1" -> Shooting (+1). Faction names follow the rest of the site.
  rosters:[
    {id:"fidwog", name:"Fidwog", page:23, blurb:"Shorter in stature than other quar, but tougher than most and can Mhud with the best of them.", positions:[
      {id:"caerten", name:"Is-Caerten", sk:13, mt:"2d6", ma:5, t:4, ap:2, pc:-1, abilities:["Leader (2/8)"]},
      {id:"linequar", name:"Linesquar", sk:12, mt:"1d6+1", ma:5, t:5, ap:4, pc:0, abilities:["Support"]},
      {id:"miner", name:"Miner", sk:13, mt:"2d6", ma:5, t:5, ap:2, pc:-1, abilities:["Hardened"]},
      {id:"playmaker", name:"Playmaker", sk:12, mt:"1d6+1", ma:5, t:4, ap:8, pc:-1, abilities:["Dead eye"]}
    ]},
    {id:"toulmore", name:"Toulmore", page:24, blurb:"Veteran players of Mhudball. Each player is a master of the gourd game in their own right.", positions:[
      {id:"caerten", name:"Is-Caerten", sk:12, mt:"1d6+2", ma:5, t:4, ap:4, pc:-2, abilities:["Leader (3/6)","Shooting (+1)"]},
      {id:"linequar", name:"Linesquar", sk:13, mt:"1d6+2", ma:5, t:4, ap:4, pc:-1, abilities:["Support"]},
      {id:"pathfinder", name:"Pathfinder", sk:13, mt:"2d6+1", ma:6, t:4, ap:2, pc:-1, abilities:["Veteran","Killing strike"]},
      {id:"physio", name:"Physio", sk:12, mt:"1d6+2", ma:5, t:4, ap:4, pc:-1, abilities:["Medic"]}
    ]},
    {id:"tollyn-maeryn", name:"Tollyn Maeryn", page:25, blurb:"Kits from local leagues without much experience, but with the help of their veteran coaches they tend to put on a good show.", positions:[
      {id:"auldbuck", name:"Veteran Auld Buck", sk:12, mt:"2d6+1", ma:5, t:4, ap:2, pc:-2, abilities:["Leader (3/5)","Like This!!"]},
      {id:"linequar", name:"Linesquar", sk:10, mt:"1d6+2", ma:5, t:4, ap:6, pc:1, abilities:["Green","Support"]},
      {id:"pinner", name:"Milwer Pinner", sk:11, mt:"2d6-1", ma:5, t:4, ap:4, pc:-1, abilities:["Inspiring Presence (1)","Burly"]},
      {id:"lonebuck", name:"Lone Buck Runner", sk:13, mt:"2d6-1", ma:5, t:4, ap:8, pc:-1, abilities:["Infiltrate (4)","Resilient"]}
    ]},
    {id:"gloam-hyyn", name:"Rhyflers of Gloam Hyyn", page:26, blurb:"Enjoyers of only the wettest of Mhudball games; they take control of the game with their natural instincts.", positions:[
      {id:"yawdryl", name:"Yawdryl", sk:12, mt:"1d6+2", ma:5, t:4, ap:2, pc:-1, abilities:["Leader (3/5)","The Gloam has Eyes"]},
      {id:"linequar", name:"Linesquar", sk:12, mt:"2d6-1", ma:5, t:4, ap:2, pc:0, abilities:["Support"]},
      {id:"suppressor", name:"Suppressor", sk:13, mt:"2d6-1", ma:5, t:4, ap:4, pc:-2, abilities:["Aberganed","Trapper"]},
      {id:"bootlegger", name:"Bootlegger", sk:12, mt:"1d6+2", ma:5, t:4, ap:2, pc:-2, abilities:["Grenade","Aberganed"]}
    ]},
    {id:"crusaders", name:"Crusaders", page:27, blurb:"Players drafted from all across Alwyd, mixing offensive and defensive tactics to get the most out of every play.", positions:[
      {id:"caerten", name:"Caerten", sk:12, mt:"1d6+2", ma:5, t:4, ap:4, pc:-2, abilities:["Leader (2/5)","Inspiring Presence (2)"]},
      {id:"linequar", name:"Linesquar", sk:12, mt:"1d6+2", ma:5, t:4, ap:4, pc:0, abilities:["Support"]},
      {id:"stormer", name:"Pitch Stormer", sk:13, mt:"2d6+1", ma:6, t:4, ap:2, pc:-2, abilities:["Wallop","Infiltrate (2)"]},
      {id:"singer", name:"Singer", sk:12, mt:"1d6+2", ma:5, t:4, ap:4, pc:-1, abilities:["Musician (4)"]}
    ]},
    {id:"coftyrans", name:"Coftyrans", page:28, blurb:"Proud defenders of the great wall, who prefer a long passing game to rushing in and getting their uniforms dirty.", positions:[
      {id:"caerten", name:"Is-Caerten", sk:12, mt:"1d6+2", ma:5, t:4, ap:6, pc:-2, abilities:["Leader (2/5)","Shooting (+1)"]},
      {id:"linequar", name:"Linesquar", sk:12, mt:"2d6-1", ma:5, t:4, ap:4, pc:0, abilities:["Support"]},
      {id:"longballer", name:"Long Baller", sk:13, mt:"1d6+1", ma:5, t:4, ap:6, pc:-2, abilities:["Dead eye","Feint"]},
      {id:"grabber", name:"Pass Grabber", sk:12, mt:"1d6+1", ma:5, t:4, ap:6, pc:-1, abilities:["Steady hands"]}
    ]},
    {id:"creevin", name:"Creevin", page:29, blurb:"A cautious game: extra protection, or speed over an outright tackle-heavy game.", positions:[
      {id:"yawdryl", name:"Yawdryl", sk:12, mt:"2d6-1", ma:5, t:4, ap:6, pc:-1, abilities:["Leader (3/4)"]},
      {id:"linequar", name:"Linesquar", sk:12, mt:"1d6+2", ma:5, t:4, ap:6, pc:0, abilities:["Support"]},
      {id:"runnerup", name:"Runnerup", sk:12, mt:"1d6+2", ma:6, t:4, ap:6, pc:-1, abilities:["Scout"]},
      {id:"ferryt", name:"Mhud Ferryt", sk:13, mt:"2d6", ma:5, t:4, ap:2, pc:-1, abilities:["Extra padding"]}
    ]},
    {id:"western-arnyara", name:"Western Arnyara/Aber", page:30, blurb:"Aberite and Arnyaran teams play much the same game: tackle the other team at every possible opportunity.", positions:[
      {id:"coach", name:"House Coach", sk:12, mt:"2d6+2", ma:5, t:4, ap:2, pc:-2, abilities:["Leader (2/5)","Inspiring Presence (3)"]},
      {id:"linequar", name:"Linesquar", sk:11, mt:"2d6", ma:5, t:4, ap:2, pc:0, abilities:["Tackling (+1)"]},
      {id:"jollie", name:"Jollie", sk:11, mt:"1d6+2", ma:6, t:4, ap:4, pc:-1, abilities:["Grenade"]},
      {id:"mate", name:"Mate", sk:12, mt:"2d6+1", ma:5, t:4, ap:2, pc:-1, abilities:["Onslaught"]}
    ]},
    {id:"gwynt", name:"Principality of Gwynt", page:31, blurb:"From the richest principality of the Crymuster, with a firm claim to have invented Mhudball, they play with rare skill.", positions:[
      {id:"yawdryl", name:"Yawdryl", sk:13, mt:"2d6", ma:5, t:4, ap:2, pc:-2, abilities:["Leader (3/4)"]},
      {id:"linequar", name:"Linesquar", sk:12, mt:"2d6-1", ma:5, t:4, ap:4, pc:-1, abilities:["Calm nerves"]},
      {id:"grenadier", name:"Grenadier", sk:12, mt:"2d6-1", ma:5, t:4, ap:6, pc:-1, abilities:["Grenade"]},
      {id:"physio", name:"Physio", sk:12, mt:"1d6+2", ma:5, t:4, ap:4, pc:-1, abilities:["Medic"]}
    ]},
    {id:"ergydiwr", name:"Ergydiwr", page:32, blurb:"From an island city state of Easky, used to the rapidly changing pitch conditions there.", positions:[
      {id:"yawdryl", name:"Yawdryl", sk:13, mt:"2d6", ma:5, t:4, ap:4, pc:-1, abilities:["Leader (3/4)"]},
      {id:"linequar", name:"Linesquar", sk:12, mt:"2d6-1", ma:5, t:4, ap:4, pc:0, abilities:["Support"]},
      {id:"weatherbuck", name:"Weatherbuck", sk:12, mt:"1d6+2", ma:5, t:4, ap:6, pc:-1, abilities:["Got a feeling"]},
      {id:"runner", name:"Mhud Runner", sk:13, mt:"2d6+1", ma:6, t:4, ap:2, pc:-2, abilities:["Aberganed","Hardened"]}
    ]},
    {id:"hoblyn-valley", name:"Hoblyn Valley Rangers", page:33, blurb:"Rangers of Fidwog's Hoblyn Valley who dream of playing professionally; the richest Gamesquar make it happen.", positions:[
      {id:"gamesquar", name:"Gamesquar", sk:12, mt:"2d6", ma:5, t:4, ap:4, pc:-1, abilities:["Leader (3/4)","Retinue (3)"]},
      {id:"linequar", name:"Linesquar", sk:10, mt:"1d6+1", ma:5, t:3, ap:4, pc:1, abilities:["Support","Nervous"]},
      {id:"bushbuck", name:"Bushbuck", sk:12, mt:"1d6+1", ma:5, t:4, ap:8, pc:-2, pc2:-3, max:2, staff:true, abilities:["Staff","Infiltrate (3)"]},
      {id:"flusher", name:"Flusher Buck", sk:11, mt:"1d6+1", ma:5, t:4, ap:4, pc:-1, pc2:-2, max:2, staff:true, abilities:["Staff","Grenade"]}
    ]},
    {id:"maebwysh", name:"Maebwysh", page:34, blurb:"A tough folk from an arid city state, and very good tacticians, able to switch their gameplan on the fly.", positions:[
      {id:"caerten", name:"Is-Caerten", sk:12, mt:"1d6+2", ma:5, t:4, ap:2, pc:-1, abilities:["Leader (3/6)"]},
      {id:"linequar", name:"Linesquar", sk:12, mt:"1d6+1", ma:5, t:4, ap:4, pc:0, abilities:["Support"]},
      {id:"tactician", name:"Tactician", sk:12, mt:"1d6+2", ma:5, t:4, ap:4, pc:-1, abilities:["Adaptive tactics (Passing +1 / Shooting +1)"], adaptive:["Passing (+1)","Shooting (+1)"]},
      {id:"wrangler", name:"Wrangler", sk:13, mt:"2d6", ma:5, t:4, ap:2, pc:-2, abilities:["Adaptive tactics (Skirmisher / Wallop)"], adaptive:["Skirmisher","Wallop"]}
    ]}
  ],
  // Special abilities (PDF pp. 17-21), short paraphrases. "match" is tested against the start of an ability name.
  abilities:[
    {name:"Aberganed", page:17, text:"ignores the first Soggy result of the game"},
    {name:"Adaptive tactics", page:17, text:"has the first listed ability; the Switch up gameplan Task swaps to the second, and back again"},
    {name:"Burly", page:17, text:"Tackling +1 against Mhudders without Burly; when Charging may push the target 2d6-4 inches straight away instead of rolling Might"},
    {name:"Calm nerves", page:17, text:"chain passes: after receiving a successful pass, may pass on at once with Passing +1 to a Mhudder without Calm nerves, without using its Mhuddball task"},
    {name:"Dead eye", page:17, text:"can make an Aimed pass (1 Pluck): no range-band penalties"},
    {name:"Extra padding", page:18, text:"tacklers get an extra -1 to Might against it and cannot spend Pluck to raise that roll; Sprints 4 inches shorter"},
    {name:"Feint", page:18, text:"once per game, after an opponent Intercepts its pass, spend 1 Pluck to switch the pass to another friendly Mhudder; no Intercept allowed"},
    {name:"Got a feeling", page:18, text:"at the start of the game, pick the weather and roll off for it (or spend 1 Pluck to just pick it)"},
    {name:"Green", page:18, text:"gains Shooting +1 and Passing +1 while within a friendly Leader's range"},
    {name:"Grenade", page:18, text:"ignores opponents on the passing line, and +2 AP when passing"},
    {name:"Hardened", page:18, text:"counts as two Mhudders on passing and shooting lines; ignores its first Gobsmacked"},
    {name:"Infiltrate", page:18, text:"free move of X inches before the game starts (not into the other team's zone, and not as the Gourder)"},
    {name:"Inspiring Presence", page:19, text:"at the start of a new Round, spend its Activation on a bonus up to its level: 1 = free Steady within 3 in; 2 = +1 MA within 5 in; 3 = +1 Sk within 3 in for the round"},
    {name:"Killing strike", page:19, text:"Tackle at -2 Skill for +2 Might"},
    {name:"Leader", page:19, text:"Coordinated assault (1 Pluck): X Mhudders within Y inches each take one action that can't be interrupted"},
    {name:"Like This!!", page:19, text:"once per game, spend 1+ Pluck: an adjacent friendly Linesquar Gourder hands it the gourd for free, then it Shoots or Passes with +3 AP and a bonus equal to the Pluck spent (a Shot needs 1 more Pluck with no bonus); doesn't use its Mhuddball task"},
    {name:"Medic", page:19, text:"+1 to Tend Wounded; a Physio can also tend every Mhudder within 2 inches with one Task"},
    {name:"Musician", page:19, text:"Rallying song Task: Recover every friendly Mhudder within X inches"},
    {name:"Nervous", page:19, text:"Passing +1 when not engaged with an opponent"},
    {name:"Onslaught", page:20, text:"when a friendly Mhudder within 6 inches fails a Tackle, spend 2 Pluck to Charge at once with Tackling +1"},
    {name:"Resilient", page:20, text:"can Tend Wounded on itself"},
    {name:"Retinue", page:20, text:"may bring up to X Staff Mhudders (at most 2 of each Staff positional)"},
    {name:"Scout", page:20, text:"Sprints 2 inches further"},
    {name:"Shooting", page:20, text:"modifies its Shooting Skill checks"},
    {name:"Passing", page:20, text:"modifies its Passing Skill checks"},
    {name:"Tackling", page:20, text:"modifies its Tackle Skill checks"},
    {name:"Skirmisher", page:20, text:"may re-roll one die when Duking"},
    {name:"Staff", page:20, text:"can only join a team through another Mhudder's Retinue"},
    {name:"Steady hands", page:20, text:"when it is the pass target, ignore the penalty for opponents in contact with it"},
    {name:"Support", page:20, text:"chain passes: after receiving a successful pass, may pass on at once without using its Mhuddball task"},
    {name:"The Gloam has Eyes", page:21, text:"friendly Mhudders that activate within its Leader range gain Skirmisher for the rest of the round"},
    {name:"Trapper", page:21, text:"Lie in wait Task: ends its activation; when an opponent activates or moves within 5 inches, it may move in and Tackle (a reaction)"},
    {name:"Veteran", page:21, text:"Recover doesn't use one of its two actions"},
    {name:"Wallop", page:21, text:"+1 Skill and +1 Might on Tackles"},
    // Only used by the retired unofficial rosters kept for older saved matches.
    {name:"Steady Under Fire", page:null, text:"works like Support (old unofficial roster)"}
  ],
  tasks:[
    {id:"pluck-move", name:"Pluck move (1 inch, no Task)", cost:1, noAction:true, text:"Move up to 1 inch without using an action. Spend Steady's temporary point first if available; otherwise spend one banked Pluck."},
    {id:"move", name:"Move", cost:0, text:"Move up to MA inches. Cannot move through other Mhudders or use Move while engaged with a non-OOA opponent."},
    {id:"sprint", name:"Sprint", cost:0, text:"Move up to twice MA; cannot come within 2 inches of an opponent. Scout: 2 inches further. Extra padding: 4 inches less."},
    {id:"charge", name:"Charge", cost:1, text:"Move up to twice MA, ending engaged with an opponent. May then Tackle without using the activation's one Mhuddball task. Burly may push the target 2d6-4 inches instead of rolling Might."},
    {id:"charge-tackle", name:"Bonus Tackle after Charge", cost:0, bonus:true, text:"Resolve the Tackle granted by Charge (or Onslaught), without spending a further action or Mhuddball-task allowance."},
    {id:"duke", name:"Duke", cost:0, text:"Begin engaged; all engaged Mhudders make opposed 3D6 Skill checks. Lowest successful roll chooses a free Move or Tackle. Re-roll ties; if all fail they remain engaged. Skirmisher may re-roll one die."},
    {id:"pass", name:"Pass", cost:0, ball:true, text:"Pass to a friendly Mhudder in front, neither engaged nor Gobsmacked. Check the passing line and 3D6 result table."},
    {id:"aimed-pass", name:"Aimed pass", cost:1, ball:true, needs:"Dead eye", text:"Dead eye only: pass without range-band penalties."},
    {id:"shoot", name:"Shoot", cost:1, ball:true, text:"Shoot at the opposing hoop. Declare a possible diving save, gather modifiers and check the shooting result table."},
    {id:"tackle", name:"Tackle", cost:0, ball:true, text:"Attack an engaged opponent. Check 3D6 against modified Skill, then Might against Toughness."},
    {id:"handoff", name:"Hand off", cost:0, text:"Spend one action to give the gourd to an adjacent model. A Soggy recipient must pass Skill or resolve the mishap chart."},
    {id:"coordinated", name:"Coordinated assault", cost:1, needs:"Leader", text:"Leader only: X Mhudders within Y inches (including this one) each take one action; these actions cannot be interrupted."},
    {id:"inspiring", name:"Inspiring Presence", cost:0, needs:"Inspiring Presence", whole:true, text:"At the start of a new Round, spend this Mhudder's Activation: Level 1 = free Steady for Mhudders within 3 in this round; 2 = +1 MA within 5 in until your next Activation; 3 = +1 Sk within 3 in until the next round. Pick a level no higher than its own."},
    {id:"rally", name:"Rallying song", cost:0, needs:"Musician", text:"Musician only: Recover every friendly Mhudder within X inches. Clear their Gobsmacked markers on the Match desk."},
    {id:"switch", name:"Switch up gameplan", cost:0, needs:"Adaptive tactics", text:"Adaptive tactics only: swap to the other listed ability until this Task is done again."},
    {id:"lie-in-wait", name:"Lie in wait", cost:0, needs:"Trapper", whole:true, text:"Trapper only: ends the activation. Until it moves, when an opponent activates or moves within 5 inches it may move in and Tackle as a reaction, cancelling that opponent's remaining move."},
    {id:"onslaught", name:"Onslaught", cost:2, needs:"Onslaught", reaction:true, text:"Onslaught only, when a friendly Mhudder within 6 inches fails a Tackle: Charge at once with Tackling +1 (2 Pluck: 1 for Onslaught, 1 for the Charge). Then record the bonus Tackle."},
    {id:"like-this", name:"Like This!!", cost:1, needs:"Like This!!", reaction:true, once:true, text:"Once per game, with an adjacent friendly Linesquar Gourder: free Handoff to this Mhudder, then it Shoots or Passes with +3 AP and a bonus equal to the Pluck spent. A Shot needs 1 more Pluck that gives no bonus. Enter extra Pluck below."},
    {id:"feint", name:"Feint", cost:1, needs:"Feint", reaction:true, once:true, text:"Once per game, after an opponent Intercepts this Mhudder's pass: switch the pass to another friendly Mhudder. No Intercept can be made for it."},
    {id:"steady", name:"Steady", cost:0, text:"Gain one temporary Pluck for the next Task only, then lose any unspent point."},
    {id:"recover", name:"Recover", cost:0, text:"Remove Gobsmacked. This is the only task allowed while Gobsmacked. Veteran: doesn't use an action."},
    {id:"tend", name:"Tend Wounded", cost:0, text:"Move up to 1 inch into contact with an OOA Mhudder (even an opponent), then roll D6. A Physio Medic may affect all Mhudders within 2 inches with one task. Resilient may tend itself."}
  ],
  sections:[
    {title:"The game, pitch and victory", page:"1-2, 6-7", text:"Two teams of six Mhudders, at most five deployed per side. Play on a 2-foot-square pitch facing diagonally. Centre a Large template on each opposing corner for the goal zones; place a hoop token at each goal-zone edge and divide the pitch into two halves. Goals are gourd throws through the opposing hoop. Six gourds are shared across regulation play. The highest goal total wins once all six are out of play. A tie resets play with two new gourds, one per team; the first goal wins sudden death."},
    {title:"Team selection and initial deployment", page:"5-6, 20, 22-34", text:"Choose six Mhudders from your faction's roster. Every positional is limited to one except Linesquar, who may make up four of the six. Hoblyn Valley Rangers: the Gamesquar's Retinue (3) brings up to three Staff Mhudders (Bushbuck, Flusher Buck), at most two of each; a second copy of a Staff positional costs the second PC printed. Deploy five in your goal zone and keep one on the sideline. Starting Pluck is 7 plus the signed sum of PC, never below zero. Choose one deployed Gourder per team. Roll D6 against your opponent; highest chooses attacker or defender, re-rolling ties. The attacker starts the round. Infiltrate Mhudders may take their free move before the game; a Got a feeling Mhudder may pick the weather."},
    {title:"Turns, activations and interruptions", page:"7-9", text:"The attacking side activates its five Mhudders in any order, or passes unused activations, then the turn passes to the other side. Each activation grants two actions, only one of them a Mhuddball task. Injured players may be limited to one. One interruption is allowed per movement or Mhuddball task. Interrupting Charge costs 1 Pluck and moves up to twice MA into contact before a Tackle. Re position costs 1 Pluck and moves up to MA. Intercept is available on the passing line or in contact with the intended target."},
    {title:"Gourds, resets and substitutions", page:"6-7", text:"Each side starts with one of the six gourds. A gourd that touches the ground or leaves the pitch is removed; a goal also removes its gourd. Stolen gourds remain in play. Do not replace a gourd immediately after scoring. Only when BOTH gourds are gone do teams reset, substitute from their sidelines, redeploy, receive one new gourd each and roll off again. Each reset grants both sides 2 Pluck."},
    {title:"Skill, range bands and measuring", page:"3-4, 11-13", text:"Roll 3D6 no higher than modified Skill to succeed. Modifiers alter the target number, not the dice. For a pass or shot, each AP range band beyond the first gives a cumulative -2. Measure throwing distances base to base; measure movement from the same forward base edge before and after moving. Measure freely at any time."},
    {title:"Pluck", page:"4, 6-7, 9", text:"Spend one Pluck to improve a Skill Check by one, improve Might by one, move a Mhudder 1 inch without a task, or pay a task's stated cost. Players may agree other narrative uses and bargain over the price. Gain one for a successful pass, an interception, a goal, putting a Mhudder OOA, or a Tend Wounded result of 4-6. Steady's one temporary point is for the next task only."},
    {title:"Optional weather", page:"6-7", text:"After deployment flip an activation card: 3 starts Bright, 4 Raining, 5 Wyndy. After EVERY completed team turn, flip another card; a higher value moves one weather step toward Wyndy, a lower one toward Bright, and an equal one leaves it unchanged. Bright clears all puddles and Soggy markers. Raining adds one Medium-template puddle per player in the opposing half. Entering or being pushed through a puddle causes Soggy until Bright. Wyndy gives -2 to every Pass and Shot. Aberganed ignores the first Soggy."},
    {title:"Passing and shooting modifiers", page:"10-13", text:"Draw a line base to base to the target or hoop. Shooting: -4 per opposing Mhudder on the line, -4 per opposing Mhudder in contact with the Gourder, -2 per extra AP band, -2 if the Gourder sprinted this activation, -2 if Wyndy. Passing: -1 per opposing Mhudder on the line, -4 per opposing Mhudder in contact with the Gourder, -4 per opposing Mhudder in contact with the target, -2 per extra AP band, -2 after Sprint, -2 if Wyndy. A Hardened opponent counts as two on the line. Grenade passers ignore opponents on the line and get +2 AP. Steady hands targets ignore the contact penalty. Add any Shooting/Passing ability. Aimed pass (Dead eye, 1 Pluck) ignores range-band penalties. Soggy shooter: re-roll 1s on the Skill dice. Soggy passer OR recipient: re-roll 1s."},
    {title:"Shooting results and diving saves", page:"11-12", text:"3: automatic goal; all opponents on the shooting line are OOA and the scoring team clears Gobsmacked. 4-5: automatic goal and one opponent on the line is OOA. Ordinary success: goal. 16-17: opposing player selects a Mhudder on the shooting line to take possession. 18: same transfer, and the shooter cannot Shoot again this game. A failure below 16 uses the shot/pass mishap table. A declared Diving save moves a defender within MA onto the shooting line; the defender must be neither Gobsmacked nor Soggy."},
    {title:"Passing results, hand-offs and Support", page:"12-14, 17, 20", text:"3: automatic pass and the recipient gets a free Move. 4-5: automatic pass and move the recipient 1 inch. Ordinary success: transfer the gourd. 16-17: opponent chooses a Mhudder on the passing line to receive it. 18: same transfer, and the passer cannot Pass again this game. A failure below 16 uses the mishap table. A hand-off costs one action to give the gourd to an adjacent model; a Soggy recipient checks Skill and uses the mishap table on failure. Support lets a successful recipient immediately pass onward without using its Mhuddball task; Calm nerves does the same with Passing +1, but not to another Calm nerves Mhudder."},
    {title:"Shot / pass mishaps (D6)", page:"14", text:"6: keep possession and continue if actions remain. 4-5: keep possession and become Gobsmacked. 3: the nearest Mhudder to the target other than the actor gets possession. 2: ground the gourd. 1: ground it and put the acting Mhudder OOA."},
    {title:"Interception (two D6 face patterns)", page:"8", text:"6/6: take possession and gain a free Pass. 6/-: take possession. 6/1: nearest Mhudder to the interceptor rolls on this chart. -/-: no interception; continue the Pass. 1/-: nearest Mhudder on the passing side takes possession. 1/1: no interception, but the interceptor is OOA. Read special pairs first, in either order. Soggy interceptors re-roll 6s. A successful interception grants 1 Pluck."},
    {title:"Tackle Skill checks", page:"14-15", text:"Target must be an engaged opponent. Add +1 per additional friendly Mhudder, -1 per additional opposing Mhudder, and +2 if the target is Gobsmacked. Add any Tackling ability; Burly gets +1 against non-Burly targets; Wallop +1 Skill and +1 Might. Killing strike trades -2 to the target number for +2 Might. A Gobsmacked attacker must Recover first. Skill dice total 3: automatic hit and triple Might. 4-5: automatic hit and double Might. Ordinary success: roll Might. 16-17: miss and target gets a free Tackle. 18: miss and target chooses a free Tackle with double Might or a free Move."},
    {title:"Tackle Might, gourd stripping and Duke", page:"15-16", text:"Might below Toughness: defender may push the attacker 1 inch. Equal: attacker may push the defender 1 inch. Greater: Gobsmack and push defender 2 inches; if already Gobsmacked, they become OOA. At least twice Toughness: OOA. Triple: removed for the remainder of the game. Extra padding targets give the tackler -1 Might, which can't be bought back with Pluck. A successful tackle against a Gourder triggers opposed 3D6 Skill checks: lowest success wins possession, re-roll ties, subtract 1 from your roll for greater Might and add 1 if Soggy. Both failing leaves possession unchanged. An OOA/removed Gourder drops its gourd; an engaged opponent takes it instead if present. Duke uses opposed Skill checks among all engaged models; lowest success chooses free Move or Tackle, ties re-roll, all failing stay engaged; Skirmisher may re-roll one die."},
    {title:"Tend Wounded (D6)", page:"9-10", text:"6: Ready. 4-5: Gobsmacked instead of OOA. 3: returns with one task per turn. 2: goes to the sideline, may return at the next reset with one task per turn. 1: removed for the rest of the game. Medic adds 1 (a modified 7 counts as 6). A Physio Medic may Tend all eligible Mhudders within 2 inches with one task. Resilient Mhudders may tend themselves. Results 4-6 grant the tending team 1 Pluck."},
    {title:"Statuses", page:"16-17", text:"Ready: normal tasks. Engaged: base contact with an opponent; cannot Pass or be targeted by Pass. Gobsmacked: only Recover until cleared; repeated Gobsmacked normally does not worsen status, except from Tackles. Hardened ignores its first Gobsmacked. OOA: cannot act, but can be tended. Soggy: affects throwing and interceptions; Aberganed ignores the first Soggy."}
  ],
  notes:[
    "Hoblyn Valley Staff (p. 33): the second printed PC (Bushbuck -3, Flusher Buck -2) is read as the PC of the second copy, not an extra amount on top. The Retinue text (p. 20) mentions 'the normal required minimum amount of 3 Linesquar', but the team rules (p. 5) set no minimum, only a maximum of four, so no minimum is enforced.",
    "Resilient (p. 20) lets a Mhudder Tend Wounded on itself. Read here as: it may tend itself while Out of Action.",
    "Resets do not automatically heal Gobsmacked/OOA players or clear Soggy: no such recovery is stated. A player winded by Tend result 2 can return at the next reset with a one-task limit. Removed players cannot return.",
  ],
  // Retired: the builder's unofficial stand-in rosters (5 Nov 2026), replaced by the official Teams Expansion rosters (13 Nov 2026).
  // Kept ONLY so matches saved with them still open. Never offered for new matches.
  retired:[
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
  ]
};
