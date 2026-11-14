"use strict";
window.QuarMhuddball = (() => {
  const R = window.QuarMhuddballRules;
  const clone = value => JSON.parse(JSON.stringify(value));
  const number = (value,max = 99999) => Math.max(0,Math.min(max,Math.floor(Number(value) || 0)));
  const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,9);
  const die = () => 1+Math.floor(Math.random()*6);
  // A team built before the official Teams Expansion rosters keeps its old unofficial roster (team.legacy), so saved matches still open.
  const roster = team => (team.legacy ? R.retired : R.rosters).find(entry => entry.id === team.faction);
  const limit = unit => unit.max || (unit.id === "linequar" ? 4 : 1);
  const profile = (team,player) => roster(team)?.positions.find(entry => entry.id === player.position);
  const canCarry = player => player.onPitch && !["ooa","winded","removed"].includes(player.status);
  const ready = player => player.onPitch && player.status === "ready";
  // PC of this copy of a positional: the HVR Staff positionals print a different PC for a second copy (PDF p. 33).
  const memberPC = (team,player) => { const unit = profile(team,player), same = team.players.filter(entry => entry.position === player.position); return same.indexOf(player) > 0 && unit.pc2 !== undefined ? unit.pc2 : unit.pc; };
  const teamPC = team => team.players.reduce((total,player) => total+memberPC(team,player),0);
  const startingPluck = team => Math.max(0,7+teamPC(team));
  // Abilities in effect now: Adaptive tactics swaps between its two listed abilities (PDF p. 17).
  const abilitiesOf = (team,player) => { const unit = profile(team,player); return unit.adaptive ? [...unit.abilities,unit.adaptive[player.adapt ? 1 : 0]] : unit.abilities; };
  const hasAbility = (team,player,name) => abilitiesOf(team,player).some(item => item.toLowerCase().startsWith(name.toLowerCase()));
  const abilityNum = (list,name) => { const hit = list.find(item => item.toLowerCase().startsWith(name.toLowerCase())), found = hit && hit.match(/\((\d+)/); return found ? Number(found[1]) : 0; };
  // Staff Mhudders only join through a Retinue (PDF pp. 20, 33).
  function teamProblem(team) {
    const staff = team.players.filter(player => profile(team,player)?.staff).length; if (!staff) return "";
    const room = team.players.reduce((total,player) => total+abilityNum(profile(team,player)?.abilities || [],"Retinue"),0);
    if (!room) return "Staff Mhudders can only join through a Retinue: add the Gamesquar.";
    return staff > room ? `The Retinue has room for ${room} Staff Mhudders; this team has ${staff}.` : "";
  }
  function dice(values,count) {
    if (!Array.isArray(values) || values.length !== count || values.some(value => !Number.isInteger(value) || value < 1 || value > 6)) throw Error(`Enter ${count} dice, each from 1 to 6.`);
    return values.reduce((total,value) => total+value,0);
  }
  function faceKey(values) {
    dice(values,2); const [low,high] = [...values].sort((left,right) => left-right);
    return low === 6 ? "66" : high === 1 ? "11" : low === 1 && high === 6 ? "61" : high === 6 ? "6-" : low === 1 ? "1-" : "--";
  }
  function skillResult(kind,total,target) {
    if (!["pass","shoot","tackle","skill"].includes(kind)) throw Error("Choose a supported Skill check.");
    if (kind === "skill") return {code:total <= target ? "success" : "failure",text:total <= target ? "Skill check succeeds." : "Skill check fails."};
    if (total === 3) return {code:"perfect",text:kind === "shoot" ? "Automatic goal; all opponents on the shooting line become OOA; scoring team clears Gobsmacked." : kind === "pass" ? "Automatic pass; recipient gets a free Move." : "Automatic Tackle; triple the Might roll.", multiplier:kind === "tackle" ? 3 : 1};
    if (total <= 5) return {code:"power",text:kind === "shoot" ? "Automatic goal; one opponent on the shooting line becomes OOA." : kind === "pass" ? "Automatic pass; move the recipient 1 inch." : "Automatic Tackle; double the Might roll.", multiplier:kind === "tackle" ? 2 : 1};
    if (total === 18) return {code:"dislocation",text:kind === "tackle" ? "Automatic miss. Target chooses a free Tackle with double Might, or a free Move." : `Opponent chooses a Mhudder on the ${kind === "shoot" ? "shooting" : "passing"} line to take possession. Actor may not ${kind === "shoot" ? "Shoot" : "Pass"} again this game.`};
    if (total >= 16) return {code:"fluffed",text:kind === "tackle" ? "Automatic miss; target immediately gets a free Tackle." : `Opponent chooses a Mhudder on the ${kind === "shoot" ? "shooting" : "passing"} line to take possession.`};
    if (total <= target) return {code:"success",text:kind === "shoot" ? "Goal scored." : kind === "pass" ? "Pass succeeds; target takes possession." : "Tackle succeeds; compare Might to Toughness.",multiplier:1};
    return {code:"failure",text:kind === "tackle" ? "Tackle misses." : "Throw fails; use the shot/pass mishap chart."};
  }
  function mightResult(might,toughness,gobsmacked = false) {
    if (!Number.isFinite(might) || might < 0 || !Number.isFinite(toughness) || toughness < 1) throw Error("Enter a nonnegative Might result and positive Toughness.");
    if (might >= toughness*3) return "Target is removed for the remainder of the game.";
    if (might >= toughness*2) return "Target is OOA.";
    if (might > toughness) return gobsmacked ? "Target was Gobsmacked: now OOA; push target 2 inches." : "Target becomes Gobsmacked; push target 2 inches.";
    return might === toughness ? "No injury; attacker may push target 1 inch." : "No injury; defender may push the tackler 1 inch.";
  }
  const mishap = roll => roll === 6 ? "Keep possession; continue if actions remain." : roll >= 4 ? "Keep possession and become Gobsmacked." : roll === 3 ? "Nearest Mhudder to the target, other than the actor, takes possession." : roll === 2 ? "Gourd is grounded." : "Gourd is grounded and the actor is OOA.";
  const interception = values => ({"66":"Intercepted; take possession and a free Pass.","6-":"Intercepted; take possession.","61":"Knocked upward; nearest Mhudder to the interceptor rolls on this chart.","--":"No interception; continue the Pass.","1-":"Nearest Mhudder on the passing side takes possession.","11":"No interception; interceptor becomes OOA."})[faceKey(values)];
  function createEngine() {
    const state = match => match.mhuddball;
    const team = (match,side) => { if (![0,1].includes(side)) throw Error("Choose a team."); return state(match).teams[side]; };
    const player = (match,side,id) => { const entry = team(match,side).players.find(member => member.id === id); if (!entry) throw Error("Choose a Mhudder on that team."); return entry; };
    const log = (match,text) => { const data = state(match); data.log.push({at:Date.now(),round:data.round,text}); data.log = data.log.slice(-600); };
    function create(name,first,second) {
      const now = Date.now();
      return {id:"mhudd-"+uid(),system:"mhuddball",name:String(name || "A game of Mhuddball").slice(0,80),notes:"",created:now,updated:now,mhuddball:{version:2,phase:"setup",round:1,turn:1,active:0,reserve:6,gourds:[],suddenDeath:false,winner:null,weather:"bright",weatherEnabled:false,weatherCard:3,weatherPending:false,teams:[{name:"Home",faction:first,players:[],score:0,pluck:0},{name:"Away",faction:second,players:[],score:0,pluck:0}],log:[]}};
    }
    function normalize(match) {
      if (!match || match.system !== "mhuddball" || !match.mhuddball || typeof match.mhuddball !== "object") throw Error("Invalid Mhuddball record.");
      match.id = String(match.id || "mhudd-"+uid()); match.name = String(match.name || "Mhuddball").slice(0,80); match.notes = String(match.notes || "").slice(0,6000);
      match.created = number(match.created,Number.MAX_SAFE_INTEGER) || Date.now(); match.updated = number(match.updated,Number.MAX_SAFE_INTEGER) || match.created;
      const data = state(match);
      if (!["setup","playing","reset","finished"].includes(data.phase) || !Array.isArray(data.teams) || data.teams.length !== 2 || ![0,1].includes(data.active)) throw Error("Invalid Mhuddball phase or teams.");
      const ids = new Set();
      data.teams.forEach(entry => {
        entry.legacy = !!entry.legacy;
        if (data.version !== 2 && !entry.legacy && Array.isArray(entry.players) && entry.players.length && R.retired.some(item => item.id === entry.faction)) entry.legacy = true;
        if (!roster(entry) || !Array.isArray(entry.players) || entry.players.length > 6) throw Error("Unknown Mhuddball roster or too many players.");
        entry.name = String(entry.name || roster(entry).name).slice(0,60); entry.score = number(entry.score); entry.pluck = number(entry.pluck);
        entry.players.forEach(member => {
          if (!profile(entry,member) || !member.id || ids.has(member.id)) throw Error("Invalid or duplicate Mhudder.");
          member.id = String(member.id); ids.add(member.id); member.name = String(member.name || profile(entry,member).name).slice(0,80);
          if (!["ready","gobsmacked","ooa","winded","removed"].includes(member.status)) throw Error("Invalid Mhudder status.");
          ["onPitch","soggy","engaged","oneTask","hardenedUsed","aberganedUsed","ballUsed","completed","chargeReady","passBan","shotBan","sprinted"].forEach(key => { member[key] = !!member[key]; });
          member.actions = number(member.actions,2); member.spentActions = number(member.spentActions,2); member.steady = number(member.steady,1);
          member.adapt = member.adapt ? 1 : 0; member.once = Array.isArray(member.once) ? member.once.filter(item => typeof item === "string") : [];
          if (["removed","winded"].includes(member.status)) member.onPitch = false;
        });
        if (entry.players.filter(member => member.onPitch).length > 5) throw Error("Only five Mhudders may be on the pitch.");
        for (const position of roster(entry).positions) if (entry.players.filter(member => member.position === position.id).length > limit(position)) throw Error("Positional limit exceeded in backup.");
        if (data.phase !== "setup" && entry.players.length !== 6) throw Error("An ongoing match needs six registered Mhudders per team.");
      });
      if (!Array.isArray(data.gourds) || data.gourds.length !== (data.phase === "setup" ? 0 : 2)) throw Error("Invalid gourd pool.");
      data.gourds.forEach(gourd => {
        gourd.active = !!gourd.active;
        if (gourd.active && (!gourd.carrier || !data.teams.some(entry => entry.players.some(member => member.id === gourd.carrier && canCarry(member))))) throw Error("An active gourd needs an eligible on-pitch carrier.");
        if (!gourd.active) gourd.carrier = "";
      });
      if (new Set(data.gourds.map(gourd => gourd.id)).size !== data.gourds.length) throw Error("Duplicate gourd IDs.");
      data.reserve = number(data.reserve,6); if (data.reserve%2) throw Error("Gourds are issued in pairs.");
      if (data.phase === "playing" && !data.gourds.some(gourd => gourd.active) || data.phase === "reset" && data.gourds.some(gourd => gourd.active)) throw Error("Gourd state does not match the phase.");
      if (data.phase === "finished" && ![0,1].includes(data.winner)) throw Error("A finished match needs a winning team.");
      if (data.draft) {
        if (typeof data.draft !== "object" || !Array.isArray(data.draft.carriers) || data.draft.carriers.length !== 2) throw Error("Invalid deployment selections in backup.");
        data.draft = {carriers:data.draft.carriers.map(value => String(value || "")),attacker:["0","1"].includes(String(data.draft.attacker)) ? String(data.draft.attacker) : "",weatherEnabled:!!data.draft.weatherEnabled,card:Math.max(3,Math.min(5,number(data.draft.card)))};
      }
      data.round = Math.max(1,number(data.round)); data.turn = Math.max(1,number(data.turn)); data.suddenDeath = !!data.suddenDeath;
      if (!["bright","raining","wyndy"].includes(data.weather)) throw Error("Invalid weather.");
      data.weatherEnabled = !!data.weatherEnabled; data.weatherCard = Math.max(3,Math.min(5,number(data.weatherCard))); data.weatherPending = data.phase === "playing" && data.weatherEnabled && !!data.weatherPending;
      data.log = (Array.isArray(data.log) ? data.log : []).filter(entry => entry && typeof entry.text === "string").slice(-600);
      if (data.helper && (typeof data.helper !== "object" || typeof data.helper.text !== "string")) delete data.helper;
      if (data.helper) { data.helper.text = data.helper.text.slice(0,6000); data.helper.actor = String(data.helper.actor || "Mhudder").slice(0,80); data.helper.kind = String(data.helper.kind || "check").slice(0,40); }
      return match;
    }
    function add(match,side,position,name) {
      if (state(match).phase !== "setup") throw Error("Team membership locks when play starts.");
      const entry = team(match,side), unit = roster(entry).positions.find(item => item.id === position);
      if (!unit || entry.players.length >= 6) throw Error("Choose a positional; a team has six Mhudders.");
      if (entry.players.filter(member => member.position === position).length >= limit(unit)) throw Error("That positional is already at its limit.");
      if (unit.staff) {
        const room = entry.players.reduce((total,member) => total+abilityNum(profile(entry,member).abilities,"Retinue"),0), staff = entry.players.filter(member => profile(entry,member).staff).length;
        if (!room) throw Error("Staff Mhudders can only join through a Retinue: add the Gamesquar first.");
        if (staff >= room) throw Error(`The Retinue has room for ${room} Staff Mhudders.`);
      }
      // Default names are numbered when a team has more than one of a positional, so every Mhudder can be told apart in the lists.
      const same = entry.players.filter(item => item.position === position), max = limit(unit);
      if (!name && max > 1 && same.length === 1 && same[0].name === unit.name) same[0].name = unit.name + " 1";
      const taken = new Set(entry.players.map(item => item.name)); let auto = max > 1 ? unit.name + " " + (same.length + 1) : unit.name;
      for (let n = same.length + 2; max > 1 && taken.has(auto); n++) auto = unit.name + " " + n;
      const member = {id:"mp-"+uid(),position,name:String(name || auto).slice(0,80),onPitch:entry.players.filter(item => item.onPitch).length < 5,status:"ready",soggy:false,engaged:false,oneTask:false,hardenedUsed:false,aberganedUsed:false,adapt:0,once:[],actions:2,spentActions:0,steady:0,ballUsed:false,completed:false,chargeReady:false,passBan:false,shotBan:false,sprinted:false};
      entry.players.push(member); log(match,`${entry.name}: added ${member.name} (${unit.name}, PC ${memberPC(entry,member)}).`); return member;
    }
    function fill(match,side) {
      if (state(match).phase !== "setup") throw Error("Team membership locks when play starts.");
      const entry = team(match,side), ros = roster(entry).positions;
      const order = [...ros.filter(unit => unit.id !== "linequar"), ...ros.filter(unit => unit.id === "linequar")];
      let added = 0;
      const tryAdd = unit => { try { add(match,side,unit.id,""); added++; return true; } catch(error) { return false; } };
      // One of each specialist first, then Linesquar, then any second copies (HVR Staff) if there is still room.
      for (const unit of order) while (entry.players.length < 6 && entry.players.filter(item => item.position === unit.id).length < (unit.id === "linequar" ? limit(unit) : 1) && tryAdd(unit));
      for (const unit of order) while (entry.players.length < 6 && entry.players.filter(item => item.position === unit.id).length < limit(unit) && tryAdd(unit));
      if (!added) throw Error(entry.players.length >= 6 ? "This team already has six Mhudders." : "No positional has room left.");
    }
    function lineup(match,side,id,onPitch) {
      if (!["setup","reset"].includes(state(match).phase)) throw Error("Substitutions are allowed only before play or at a reset.");
      const member = player(match,side,id);
      if (onPitch && member.status === "removed") throw Error("A removed Mhudder cannot return this game.");
      if (onPitch && !member.onPitch && team(match,side).players.filter(entry => entry.onPitch).length >= 5) throw Error("Move someone to the sideline before deploying a replacement.");
      member.onPitch = onPitch;
    }
    function checkLineups(match,carriers,initial) {
      for (const side of [0,1]) {
        const entry = team(match,side), pitch = entry.players.filter(member => member.onPitch);
        if (entry.players.length !== 6) throw Error(`${entry.name} needs exactly six Mhudders.`);
        const problem = teamProblem(entry); if (problem) throw Error(`${entry.name}: ${problem}`);
        if (initial ? pitch.length !== 5 : pitch.length < 1 || pitch.length > 5) throw Error(initial ? "Deploy exactly five Mhudders per team to start." : "Deploy one to five available Mhudders per team.");
        const carrier = player(match,side,carriers[side]);
        if (!carrier.onPitch || ["removed","ooa"].includes(carrier.status) || initial && carrier.status === "winded") throw Error("Choose an available on-pitch Gourder for each team.");
      }
    }
    function turnReady(match) {
      team(match,state(match).active).players.forEach(member => { member.actions = member.oneTask ? 1 : 2; member.spentActions = 0; member.ballUsed = false; member.completed = false; member.steady = 0; member.chargeReady = false; member.sprinted = false; });
    }
    function issue(match,carriers) {
      const data = state(match);
      data.gourds = carriers.map((carrier,index) => ({id:`g-${data.round}-${index}`,active:true,carrier}));
      if (!data.suddenDeath) data.reserve -= 2;
    }
    function start(match,carriers,attacker,weatherEnabled = false,card = 3) {
      const data = state(match); if (data.phase !== "setup") throw Error("This match has already started.");
      checkLineups(match,carriers,true); team(match,attacker);
      if (weatherEnabled && ![3,4,5].includes(card)) throw Error("Starting weather card must be 3, 4 or 5.");
      data.teams.forEach(entry => { entry.pluck = startingPluck(entry); });
      data.active = attacker; data.weatherEnabled = weatherEnabled; data.weatherCard = card; data.weather = weatherEnabled ? ["bright","raining","wyndy"][card-3] : "bright";
      data.phase = "playing"; issue(match,carriers); turnReady(match);
      log(match,`Match started. ${team(match,attacker).name} attacks after the agreed roll-off. Starting Pluck: ${data.teams.map(entry => entry.name+" "+entry.pluck).join(", ")}. Two gourds issued; four remain in reserve. Weather: ${data.weather}.`);
    }
    function segmentEnded(match) {
      const data = state(match); if (data.phase === "finished" || data.gourds.some(gourd => gourd.active)) return;
      data.weatherPending = false;
      if (!data.suddenDeath && data.reserve === 0 && data.teams[0].score !== data.teams[1].score) {
        data.phase = "finished"; data.winner = data.teams[0].score > data.teams[1].score ? 0 : 1;
        log(match,`${team(match,data.winner).name} wins ${data.teams[0].score}-${data.teams[1].score}. All six regulation gourds have left play.`);
      } else {
        if (!data.reserve) data.suddenDeath = true;
        data.phase = "reset"; log(match,data.suddenDeath ? "Both gourds out of play; prepare a sudden-death reset with two new gourds. First goal wins." : "Both gourds out of play; substitute, redeploy, roll off and issue the next pair.");
      }
    }
    function reset(match,carriers,attacker) {
      const data = state(match); if (data.phase !== "reset") throw Error("Wait until both active gourds leave play.");
      checkLineups(match,carriers,false); team(match,attacker);
      data.teams.forEach(entry => { entry.pluck += 2; entry.players.forEach(member => { if (member.status === "winded") { member.status = "ready"; member.oneTask = true; } member.engaged = false; }); });
      data.round++; data.turn = 1; data.active = attacker; data.phase = "playing"; issue(match,carriers); turnReady(match);
      log(match,`Reset ${data.round}: +2 Pluck each; ${team(match,attacker).name} attacks after a fresh roll-off. ${data.suddenDeath ? "Sudden death: first goal wins." : data.reserve+" regulation gourds remain in reserve."}`);
    }
    function gourd(match,index) { const entry = state(match).gourds[index]; if (state(match).phase !== "playing" || !entry?.active) throw Error("Choose an active gourd during play."); if (state(match).weatherPending) throw Error("Apply the pending weather card before continuing play."); return entry; }
    function transfer(match,index,side,id) { const entry = gourd(match,index), member = player(match,side,id); if (!canCarry(member)) throw Error("Choose an available on-pitch Gourder."); entry.carrier = id; log(match,`Gourd ${index+1}: possession to ${team(match,side).name}'s ${member.name}.`); }
    function ground(match,index) { const entry = gourd(match,index); entry.active = false; entry.carrier = ""; log(match,`Gourd ${index+1} grounded / out of play; do not issue a replacement until both gourds are gone.`); segmentEnded(match); }
    function goal(match,index) {
      const entry = gourd(match,index), data = state(match), side = data.teams.findIndex(item => item.players.some(member => member.id === entry.carrier));
      if (side < 0) throw Error("The gourd must have a carrier before scoring.");
      team(match,side).score++; team(match,side).pluck++; entry.active = false; entry.carrier = "";
      log(match,`${team(match,side).name} scores with gourd ${index+1}; +1 goal, +1 Pluck. Score ${data.teams[0].score}-${data.teams[1].score}.`);
      if (data.suddenDeath) { data.phase = "finished"; data.winner = side; data.weatherPending = false; log(match,`${team(match,side).name} wins in sudden death.`); } else segmentEnded(match);
    }
    function pluck(match,side,delta,reason) {
      if (!Number.isInteger(delta) || !delta || !reason.trim()) throw Error("Choose a nonzero whole-number Pluck change and explain it.");
      const entry = team(match,side); if (entry.pluck+delta < 0) throw Error("Not enough Pluck."); entry.pluck += delta; log(match,`${entry.name}: ${delta > 0 ? "+" : ""}${delta} Pluck (${reason}).`);
    }
    function requirePlay(match) { if (state(match).phase !== "playing" || state(match).weatherPending) throw Error("Start/resume play and resolve the pending weather card first."); }
    function task(match,side,id,taskId,extra = 0,freeReason = "") {
      requirePlay(match); const data = state(match), entry = team(match,side), member = player(match,side,id), unit = profile(entry,member), rule = R.tasks.find(item => item.id === taskId);
      const has = name => hasAbility(entry,member,name), selfTend = taskId === "tend" && member.status === "ooa" && has("Resilient"), vetRecover = taskId === "recover" && has("Veteran");
      if (!rule || !member.onPitch || ["ooa","winded","removed"].includes(member.status) && !selfTend) throw Error("This Mhudder cannot perform a task.");
      if (member.status === "gobsmacked" && taskId !== "recover" && !rule.noAction) throw Error("A Gobsmacked Mhudder can only Recover.");
      if (["move","sprint"].includes(taskId) && member.engaged) throw Error("Move/Sprint cannot leave an engaged opponent; resolve Duke or another permitted effect first.");
      if (["duke","tackle"].includes(taskId) && !member.engaged) throw Error("Duke/Tackle requires engagement; update the marker after tabletop movement.");
      const bonus = taskId === "charge-tackle", instant = !!rule.noAction, free = !!freeReason.trim(), reaction = !!rule.reaction;
      if (!free && !instant && !reaction && !(bonus && member.chargeReady) && side !== data.active) throw Error("It is the other team's turn; a free/interruption task requires an explanation.");
      if (bonus && !member.chargeReady) throw Error("Record Charge before its bonus Tackle.");
      if (!bonus && !free && !instant && !reaction && !selfTend && (member.completed || member.actions < 1 && !vetRecover)) throw Error("No actions remain in this activation.");
      if (rule.needs && !has(rule.needs)) throw Error(`${rule.name} needs the ${rule.needs} ability.`);
      if (rule.once && member.once.includes(taskId)) throw Error(`${rule.name} can only be used once per game.`);
      if (taskId === "inspiring" && member.spentActions && !free) throw Error("Inspiring Presence uses the whole Activation: choose it before this Mhudder does anything else.");
      if (rule.ball && member.ballUsed && !free) throw Error("Only one Mhuddball task per activation.");
      if (["pass","aimed-pass"].includes(taskId) && (member.engaged || member.passBan)) throw Error("This Mhudder cannot Pass while engaged or after a passing dislocation.");
      if (taskId === "shoot" && member.shotBan) throw Error("This Mhudder may not Shoot again this game.");
      if (["pass","aimed-pass","shoot","handoff"].includes(taskId) && !data.gourds.some(gourd => gourd.active && gourd.carrier === member.id)) throw Error("This Mhudder is not carrying a gourd.");
      if (!Number.isInteger(extra) || extra < 0) throw Error("Additional Pluck spending must be a nonnegative whole number.");
      const cost = Math.max(0,rule.cost+extra-member.steady); if (entry.pluck < cost) throw Error("Not enough Pluck to pay for this task and its modifiers.");
      entry.pluck -= cost; member.steady = 0;
      if (!free && !bonus && !instant && !reaction && !selfTend && !vetRecover) { member.actions--; member.spentActions++; }
      if (rule.once) member.once.push(taskId);
      if (taskId === "switch") member.adapt = member.adapt ? 0 : 1;
      if (rule.ball && !free) member.ballUsed = true;
      if (bonus) member.chargeReady = false; else if (!instant) member.chargeReady = taskId === "charge" || taskId === "onslaught";
      if (taskId === "steady") member.steady = 1;
      if (taskId === "recover") member.status = "ready";
      if (taskId === "sprint") member.sprinted = true;
      if (rule.whole && !free) { member.actions = 0; member.chargeReady = false; }
      if (!instant && !member.actions && !member.chargeReady) member.completed = true;
      log(match,`${entry.name} / ${member.name}: ${rule.name}; ${cost} banked Pluck spent${free ? "; granted/free task: "+freeReason : ""}${vetRecover ? "; Veteran: no action used" : ""}${selfTend ? "; Resilient: tending itself" : ""}. ${rule.text}${taskId === "switch" ? " Now using: "+abilitiesOf(entry,member).slice(-1)[0]+"." : ""}`);
    }
    function finishActivation(match,side,id) {
      requirePlay(match); if (state(match).active !== side) throw Error("It is the other team's turn.");
      const member = player(match,side,id); member.completed = true; member.actions = 0; member.steady = 0; member.chargeReady = false;
      log(match,`${team(match,side).name} / ${member.name}: passed remaining actions.`);
    }
    function endTurn(match) {
      requirePlay(match); const data = state(match), previous = team(match,data.active);
      previous.players.forEach(member => { member.steady = 0; member.chargeReady = false; member.completed = true; member.actions = 0; });
      data.active = 1-data.active; data.turn++; turnReady(match); data.weatherPending = data.weatherEnabled;
      log(match,`${previous.name} ends its turn (unused activations passed); ${team(match,data.active).name} now attacks.${data.weatherPending ? " Flip a weather card before acting." : ""}`);
    }
    function weather(match,card) {
      const data = state(match); if (!data.weatherEnabled || data.phase !== "playing" || !data.weatherPending || ![3,4,5].includes(card)) throw Error("Flip a 3/4/5 activation card after a completed team turn.");
      const chart = ["bright","raining","wyndy"], previous = data.weather, step = card > data.weatherCard ? 1 : card < data.weatherCard ? -1 : 0;
      data.weather = chart[Math.max(0,Math.min(2,chart.indexOf(previous)+step))]; data.weatherCard = card; data.weatherPending = false;
      if (data.weather === "bright") data.teams.forEach(entry => entry.players.forEach(member => { member.soggy = false; }));
      log(match,`Weather card ${card}: ${previous} -> ${data.weather}.${data.weather === "bright" ? " Clear all puddles and Soggy markers." : data.weather === "raining" && previous !== "raining" ? " Each player places one Medium-template puddle in the opponent's half." : ""}`);
    }
    function flags(match,side,id,values) {
      const member = player(match,side,id);
      if (values.soggy && !member.soggy && !member.aberganedUsed && hasAbility(team(match,side),member,"Aberganed")) { member.aberganedUsed = true; values = {...values,soggy:false}; log(match,`${member.name}: Aberganed ignored the first Soggy result.`); }
      for (const key of ["soggy","engaged","oneTask","passBan","shotBan"]) if (key in values) member[key] = !!values[key];
      if (member.oneTask) { member.actions = Math.min(Math.max(0,1-member.spentActions),member.actions); if (!member.actions && !member.chargeReady) member.completed = true; }
      log(match,`${member.name}: markers updated (Soggy ${member.soggy}, engaged ${member.engaged}, one-task limit ${member.oneTask}, Pass banned ${member.passBan}, Shoot banned ${member.shotBan}).`);
    }
    function status(match,side,id,next,reason,recipient = "") {
      if (state(match).phase !== "playing" || !["ready","gobsmacked","ooa","winded","removed"].includes(next) || !reason.trim()) throw Error("Choose a status during play and explain the result.");
      const member = player(match,side,id), data = state(match);
      if (member.status === "removed" && next !== "removed") throw Error("Removed Mhudders cannot return this game; use Undo for a mistake.");
      if (["ooa","winded","removed"].includes(next)) {
        const carried = data.gourds.filter(gourd => gourd.active && gourd.carrier === id);
        const receiver = recipient ? team(match,1-side).players.find(entry => entry.id === recipient && canCarry(entry)) : null;
        if (carried.length && member.engaged && !receiver) throw Error("Choose the engaged opposing Mhudder receiving the dropped gourd, or clear an incorrect engagement marker first.");
        if (recipient && !receiver) throw Error("The dropped gourd needs an available on-pitch opposing recipient.");
        carried.forEach(gourd => { gourd.active = !!receiver; gourd.carrier = receiver?.id || ""; });
      }
      if (next === "gobsmacked" && member.status === "ready" && !member.hardenedUsed && hasAbility(team(match,side),member,"Hardened")) { member.hardenedUsed = true; log(match,`${team(match,side).name} / ${member.name}: Hardened ignored the first Gobsmacked result (${reason}).`); return; }
      member.status = next;
      if (["winded","removed"].includes(next)) member.onPitch = false;
      if (next === "winded") member.oneTask = true;
      log(match,`${team(match,side).name} / ${member.name}: ${next} (${reason}). Record any OOA Pluck reward separately.`); segmentEnded(match);
    }
    function tend(match,side,id,targetSide,targetId,roll) {
      requirePlay(match); const healer = player(match,side,id), patient = player(match,targetSide,targetId);
      const self = healer === patient && hasAbility(team(match,side),healer,"Resilient");
      if (!(ready(healer) || self) || !patient.onPitch || patient.status !== "ooa") throw Error("Choose a Ready on-pitch healer (or a Resilient Mhudder tending itself) and an on-pitch OOA patient.");
      dice([roll],1); const result = Math.min(6,roll+(profile(team(match,side),healer).abilities.includes("Medic") ? 1 : 0));
      if (result === 6) patient.status = "ready";
      else if (result >= 4) patient.status = "gobsmacked";
      else if (result === 3) { patient.status = "ready"; patient.oneTask = true; patient.actions = Math.min(Math.max(0,1-patient.spentActions),patient.actions); if (!patient.actions) patient.completed = true; }
      else { patient.status = result === 2 ? "winded" : "removed"; patient.onPitch = false; if (result === 2) patient.oneTask = true; }
      if (result >= 4) team(match,side).pluck++;
      log(match,`${healer.name} tended ${patient.name}: D6 ${roll}, modified ${result}; ${patient.status}${patient.oneTask ? ", one task per turn" : ""}${result >= 4 ? "; +1 Pluck to tending team" : ""}. This applies the result only; record the Tend task separately.`);
    }
    function calculate(match,params) {
      const entry = team(match,params.side), member = player(match,params.side,params.player), unit = profile(entry,member), kind = params.kind;
      const abil = abilitiesOf(entry,member), has = name => abil.some(item => item.toLowerCase().startsWith(name.toLowerCase())), reminders = [];
      const allowed = ["pass","shoot","tackle","skill","intercept","tend","mishap","might","rolloff"];
      if (!allowed.includes(kind)) throw Error("Choose a dice helper.");
      let text = "", values = [], original = [], target = null;
      const count = ["intercept","rolloff"].includes(kind) ? 2 : ["tend","mishap"].includes(kind) ? 1 : 3;
      if (kind !== "might") {
        values = params.dice ? [...params.dice] : Array.from({length:count},die); dice(values,count); original = [...values];
        if (!params.dice && (member.soggy || kind === "pass" && params.targetSoggy)) values = values.map(value => kind === "intercept" && value === 6 || ["pass","shoot"].includes(kind) && value === 1 ? die() : value);
      }
      if (["pass","shoot","tackle","skill"].includes(kind)) {
        let modifier = Number(params.modifier) || 0;
        if (!Number.isFinite(modifier) || !Number.isInteger(modifier) || Math.abs(modifier) > 9999 || !Number.isFinite(Number(params.distance || 0)) || Number(params.distance || 0) < 0) throw Error("Use a finite whole-number modifier and a nonnegative throw distance.");
        if (["pass","shoot"].includes(kind)) {
          if (params.aimed && (kind !== "pass" || !has("Dead eye"))) throw Error("Only a Dead eye Mhudder can use Aimed pass.");
          const grenade = kind === "pass" && has("Grenade"), ap = unit.ap+(grenade ? 2 : 0), wyndy = state(match).weather === "wyndy";
          const bands = params.aimed ? 0 : Math.max(0,Math.ceil((Number(params.distance) || 0)/ap)-1);
          modifier -= (grenade ? 0 : number(params.line)*(kind === "pass" ? 1 : 4))+number(params.contact)*4+bands*2+(params.sprinted ? 2 : 0)+(kind === "pass" ? number(params.targetContact)*4 : 0)+(wyndy ? 2 : 0);
          if (kind === "pass" && has("Nervous") && !member.engaged) modifier += 1;
          if (grenade) reminders.push("Grenade: opponents on the passing line ignored and +2 AP (PDF p. 18).");
          if (wyndy) reminders.push("Wyndy: -2 included (PDF p. 7).");
          if (kind === "pass" && has("Nervous") && !member.engaged) reminders.push("Nervous: +1 Passing included (not engaged).");
          if (has("Green")) reminders.push("Green: add Shooting/Passing +1 as a modifier if within its Leader's range.");
          if (kind === "pass" && has("Calm nerves")) reminders.push("Calm nerves: a follow-on pass after receiving the gourd gets +1; add it as a modifier.");
        }
        if (kind === "tackle") {
          modifier += number(params.friendly)-number(params.enemy)+(params.targetGobsmacked ? 2 : 0);
          if (params.killing) { if (!has("Killing strike")) throw Error("This Mhudder lacks Killing strike."); modifier -= 2; }
          if (has("Wallop")) { modifier += 1; reminders.push("Wallop: +1 Skill included; add +1 to Might too."); }
          if (has("Burly")) reminders.push("Burly: add +1 if the target doesn't have Burly.");
        }
        const ability = kind === "shoot" ? "Shooting" : kind === "pass" ? "Passing" : "Tackling";
        if (kind !== "skill") abil.forEach(value => { const found = value.match(new RegExp("^"+ability+"\\s*\\(([+-]?\\d+)\\)","i")); if (found) modifier += Number(found[1]); });
        target = unit.sk+modifier+number(params.boost);
        const result = skillResult(kind,dice(values,3),target); text = `Skill ${unit.sk}, net modifier ${modifier}, proposed Pluck boost ${number(params.boost)}: target ${target}. Rolled ${values.join(" + ")} = ${dice(values,3)}. ${result.text}`;
        if (kind === "tackle" && params.killing) text += " Killing strike also adds +2 to Might; apply it when determining the final Might result.";
        if (["pass","shoot"].includes(kind) && result.code === "failure") text += " Use the separate Mishap helper next.";
        if (reminders.length) text += " "+reminders.join(" ");
      }
      if (kind === "intercept") text = `${values.join(" / ")} (${faceKey(values)}): ${interception(values)}`;
      if (kind === "mishap") text = `D6 ${values[0]}: ${mishap(values[0])}`;
      if (kind === "tend") { const result = Math.min(6,values[0]+(unit.abilities.includes("Medic") ? 1 : 0)); text = `D6 ${values[0]}, modified ${result}: ${result === 6 ? "Ready; +1 Pluck" : result >= 4 ? "Gobsmacked instead of OOA; +1 Pluck" : result === 3 ? "Returns with one task per turn" : result === 2 ? "Sideline until reset, then one task per turn" : "Removed for the rest of this game"}. Apply via the Tend result control.`; }
      if (kind === "might") text = mightResult(Number(params.might),Number(params.toughness),params.targetGobsmacked);
      if (kind === "rolloff") text = values[0] === values[1] ? "Tie: roll off again." : `${team(match,values[0] > values[1] ? 0 : 1).name} wins the roll-off and CHOOSES which team attacks; do not automatically assign the winner to attack.`;
      if (original.some((value,index) => value !== values[index])) text += ` Original dice ${original.join(", ")}; qualifying Soggy dice re-rolled once.`;
      const helper = {kind,actor:member.name,text,values,target,recorded:false}; state(match).helper = helper; return helper;
    }
    return {create,normalize,team,player,log,add,fill,lineup,start,reset,transfer,ground,goal,pluck,turnReady,segmentEnded,task,finishActivation,endTurn,weather,flags,status,tend,calculate};
  }
  function create(context) {
    const E = createEngine(), esc = context.esc;
    let current = null, tab = "teams", confirming = "", markerPlayer = "";
    const view = () => document.getElementById("view-narr");
    const matches = () => context.getStories().filter(entry => entry.system === "mhuddball");
    const match = () => matches().find(entry => entry.id === current);
    const save = entry => { entry.updated = Date.now(); context.save(); };
    const panel = (title,text) => `<section class="card cp-panel"><header><h2>${title}</h2></header><div class="cp-body">${text}</div></section>`;
    const PRIMARY = new Set(["create","start","reset","end-turn"]), DANGER = new Set(["delete","remove"]);
    const savedTab = id => { try{ return localStorage.getItem("quar-narr-tab|" + id); }catch(e){ return null; } };
    const keepTab = (id, value) => { try{ localStorage.setItem("quar-narr-tab|" + id, value); }catch(e){} };
    const button = (action,text,attrs = "",disabled = false) => `<button type="button" class="btn ${PRIMARY.has(action) ? "cta" : DANGER.has(action) ? "danger" : "ghost"}" data-mb="${action}" ${attrs}${disabled ? " disabled" : ""}>${text}</button>`;
    const ui = context.ui, tile = (label,value) => `<div class="gt"><small>${ui.stl ? ui.stl(label,"mh") : label}</small><b>${esc(value)}</b></div>`;
    const sideFac = team => context.faction(team.faction);
    function board(entry) {
      const data = entry.mhuddball, live = data.phase !== "setup", on = data.phase === "playing";
      const sides = data.teams.map((team,side) => { const fac = sideFac(team); return `<div class="mb-side${on && data.active === side ? " act" : ""}" style="--fac:${esc(fac?.color || (side ? "#3c4f5c" : "#9a6a12"))}"><div class="mb-who">${fac ? context.flag(fac) : ""}<b>${esc(team.name)}</b></div><span class="hint">${esc(roster(team).name)}${roster(team).unofficial ? " (old unofficial)" : ""}${side ? " &middot; Away" : " &middot; Home"}</span><div class="mb-score">${team.score}<small>GOALS</small></div>${on && !data.weatherPending ? data.gourds.map((gourd,index) => gourd.active && team.players.some(member => member.id === gourd.carrier) ? button("goal",confirming === "goal-"+index ? `Confirm goal: ${esc(team.players.find(member => member.id === gourd.carrier).name)}` : `&#9917;&#xFE0E; Goal by ${esc(team.players.find(member => member.id === gourd.carrier).name)}`,`data-index="${index}"`) : "").join("") : ""}<div class="mb-pl">${live ? button("pluck","&minus;",`data-side="${side}" data-delta="-1" aria-label="Spend 1 Pluck"`,data.phase === "finished" || !team.pluck) : ""}<span>${ui.stl ? ui.stl("Pluck","mh") : "Pluck"} <b>${team.pluck}</b></span>${live ? button("pluck","+",`data-side="${side}" data-delta="1" aria-label="+1 Pluck"`,data.phase === "finished") : ""}</div>${live && data.phase !== "finished" ? `<select aria-label="Reason for the Pluck change" id="mb-pluck-reason-${side}">${[["Successful pass","Successful pass"],["Interception","Interception"],["Put opponent OOA","Put opponent OOA"],["Narrative agreement","Narrative agreement"]].map(([key,text]) => `<option value="${esc(key)}">${esc(text)}</option>`).join("")}</select>` : !live ? `<span class="hint">Starting Pluck when the team is complete: ${startingPluck(team)}</span>` : ""}</div>`; });
      return `<div class="mb-board">${sides[0]}<div class="mb-mid"><span class="mb-vs">VS</span><div class="mb-pill"><small>Round</small><b>${data.round}</b></div><div class="mb-pill"><small>Turn</small><b>${data.turn}</b></div><div class="mb-pill"><small>Gourds</small><b>${data.gourds.filter(gourd => gourd.active).length}</b><small>${data.reserve} spare</small></div></div>${sides[1]}</div>${live && data.phase !== "finished" ? '<p class="hint">Goals and applied Tend results already award their Pluck. Use + and &minus; only for passes, interceptions, OOA and agreed changes.</p>' : ""}`;
    }
    const input = (name,value,attrs = "") => `<label>${name}<input value="${esc(value)}" ${attrs}></label>`;
    const numeric = (name,value,attrs = "",max = 99999) => input(name,value,`type="number" step="1" min="0" max="${max}" ${attrs}`);
    const select = (name,choices,value,attrs = "") => `<label>${name}<select ${attrs}>${choices.map(([key,text]) => `<option value="${esc(key)}"${String(value) === String(key) ? " selected" : ""}>${esc(text)}</option>`).join("")}</select></label>`;
    const checkbox = (name,checked,attrs) => `<label class="mb-check"><input type="checkbox" ${attrs}${checked ? " checked" : ""}>${name}</label>`;
    const get = id => document.getElementById(id)?.value || "";
    const checked = id => !!document.getElementById(id)?.checked;
    const integer = id => Number(get(id));
    const members = entry => entry.mhuddball.teams.flatMap((team,side) => team.players.map(player => ({side,team,player})));
    const memberChoices = (entry,filter = () => true) => members(entry).filter(filter).map(item => [item.player.id,`${item.team.name}: ${item.player.name}`]);
    const locate = (entry,id) => { const result = members(entry).find(item => item.player.id === id); if (!result) throw Error("Choose a Mhudder."); return result; };
    const draft = entry => entry.mhuddball.draft ||= {carriers:["",""],attacker:"",weatherEnabled:false,card:3};
    function change(action) {
      const entry = match(); if (!entry) return; const before = clone(entry);
      try { const snapshot = clone(entry); delete snapshot.mhuddball.undo; entry.mhuddball.undo = snapshot; action(entry); save(entry); render(entry.id); moment(before,entry); }
      catch (error) { Object.keys(entry).forEach(key => delete entry[key]); Object.assign(entry,before); render(entry.id); context.toast(error.message || String(error)); }
    }
    // Match moments (v.51, site owner's request): compare the match before and after a change and show one art bubble for the
    // biggest thing that happened: full time > goal > a Mhudder knocked down / out > weather change. Display only; changes nothing.
    function moment(before,after) {
      if (!ui.moment) return; const b = before.mhuddball, a = after.mhuddball, teamName = side => a.teams[side].name, colour = side => sideFac(a.teams[side])?.color || "";
      if (b.phase !== "finished" && a.phase === "finished" && [0,1].includes(a.winner)) return ui.moment("referee","Full time!",`${teamName(a.winner)} win ${a.teams[0].score}-${a.teams[1].score}`,colour(a.winner));
      for (const side of [0,1]) if (number(a.teams[side].score) > number(b.teams[side].score)) return ui.moment("net","Goal!",`${teamName(side)} score · ${a.teams[0].score}-${a.teams[1].score}`,colour(side));
      const LABEL = {gobsmacked:["Gobsmacked!","scrum"],winded:["Winded!","scrum"],ooa:["Out of action!","leap"]};
      for (const side of [0,1]) for (const member of a.teams[side].players) { const old = b.teams[side].players.find(other => other.id === member.id);
        if (old && old.status !== member.status && LABEL[member.status]) return ui.moment(LABEL[member.status][1],LABEL[member.status][0],`${member.name} (${teamName(side)})`,colour(side)); }
      if (b.weather !== a.weather && a.weather) { const W = {raining:["leap","It's raining!","Puddles and Soggy Mhudders"],wyndy:["catch","Wyndy!","Hold on to your gourds"],bright:["linesquar","Bright skies","Puddles and Soggy markers clear"]}[a.weather]; if (W) return ui.moment(W[0],W[1],W[2]); }
    }
    function helperFields() {
      const kind = document.getElementById("mb-helper-kind")?.value; if (!kind) return;
      view().querySelectorAll("[data-for]").forEach(field => { const box = field.closest("label") || field; box.hidden = !field.dataset.for.split(" ").includes(kind); });
    }
    function render(id) {
      const entry = matches().find(item => item.id === id);
      if (id !== current) { current = id; const t = current && savedTab(current); tab = ["teams","desk","dice","journal","rules"].includes(t) ? t : entry?.mhuddball?.phase === "setup" ? "teams" : "desk"; confirming = ""; }
      if (!entry) { current = null; renderList(); return; }
      try { E.normalize(entry); } catch(error) { view().innerHTML = panel("Mhuddball unavailable",`<p>${esc(error.message)}</p><a href="#/narrative/mhuddball" data-go="#/narrative/mhuddball">All matches</a>`); return; }
      const data = entry.mhuddball; document.body.style.removeProperty("--fac");
      view().innerHTML = `<div class="cp mb">${ui.head(esc(entry.name),`<a class="btn ghost" href="#/narrative/mhuddball" data-go="#/narrative/mhuddball">&larr; Mhuddball</a>${button("undo",'<span class="cp-ul">Undo last action</span><span class="cp-us" aria-hidden="true">&#8630; Undo</span>',"",!data.undo)}`)}${board(entry)}${data.suddenDeath ? '<p class="cp-notice"><b>Sudden death:</b> the next goal wins.</p>' : ""}${data.phase === "finished" ? `<p class="cp-notice"><b>${esc(data.teams[data.winner]?.name || "Match")} wins ${data.teams[0].score}-${data.teams[1].score}${data.suddenDeath ? " in sudden death" : ""}.</b></p>` : ""}<nav class="cp-tabs" aria-label="Mhuddball pages">${[["teams","Teams"],["desk","Match desk"],["dice","Dice helpers"],["journal","Journal"],["rules","Rules"]].map(([key,text]) => button("tab",text,`data-tab="${key}" aria-pressed="${tab === key}"`)).join("")}</nav>${tab === "teams" ? teams(entry) : tab === "desk" ? desk(entry) : tab === "dice" ? helpers(entry) : tab === "journal" ? journal(entry) : panel("Mhuddball rules",manual())}</div>`;
      if (tab === "dice") helperFields();
    }
    function renderList() {
      document.body.style.removeProperty("--fac");
      const factions = R.rosters.map(entry => [entry.id,entry.name+(entry.unofficial ? " (Unofficial)" : "")]);
      const setup = `<section class="card cp-panel mb-setup"><header><h2>New match</h2></header><div class="cp-body">
        <div class="mb-setup-teams">
          <div class="mb-setup-side" data-factint>
            <h3>Home</h3><p class="hint">Choose the home team's roster</p>
            ${select("Home roster",factions,"fidwog",'id="mb-home" data-facpick')}
          </div>
          <div class="mb-setup-vs" aria-hidden="true"><span>VS</span></div>
          <div class="mb-setup-side mb-setup-away" data-factint>
            <h3>Away</h3><p class="hint">Choose the opposing team's roster</p>
            ${select("Away roster",factions,"toulmore",'id="mb-away" data-facpick')}
          </div>
        </div>
        <div class="mb-setup-name">${input("Match name (optional)","",'id="mb-name" maxlength="80" placeholder="The Alwyd cup"')}</div>
        <div class="mb-setup-go">${button("create","Create Mhuddball match")}<p class="hint">Pick your Mhudders and starting line-ups next.</p></div>
      </div></section>`;
      view().innerHTML = `<div class="cp mb">${ui.head("Mhuddball",'<a class="btn ghost" href="#/narrative" data-go="#/narrative">&larr; Narrative</a>')}<div class="cp-credits">${ui.credit("mhudd")}${ui.credit("gamer")}</div><p class="cp-inspired">Inspired by the <i>Mhudd rules of play</i> in <i>Tales of the Breach</i>, an official book by Zombiesmith.</p>${ui.warn()}${ui.tip("narr-mb","How Mhuddball works","Six Mhudders, five on the pitch, six gourds and one winner. Build two teams from the official rosters for all twelve factions (Mhuddball + Teams Expansion), then run the match: Pluck, substitutions, gourds, goals, weather and injuries. Nothing here touches your patrols or campaigns.")}${setup}${panel("Your matches",matches().length ? `<div class="cp-list cp-recs">${[...matches()].sort((left,right) => right.updated-left.updated).map(entry => `<article><div><h3>${esc(entry.name)}</h3><p class="cp-rec-meta">${esc(entry.mhuddball.teams[0].name)} ${number(entry.mhuddball.teams[0].score)} - ${number(entry.mhuddball.teams[1].score)} ${esc(entry.mhuddball.teams[1].name)} &middot; ${esc(entry.mhuddball.phase)}</p></div><a class="btn ghost" href="#/narrative/${esc(entry.id)}" data-go="#/narrative/${esc(entry.id)}">Open</a>${button("delete",confirming === entry.id ? "Confirm delete" : "Delete",`data-id="${esc(entry.id)}"`)}</article>`).join("")}</div>` : `<div class="mb-empty">${ui.mhuddPic ? ui.mhuddPic("referee") : ""}<p class="hint">No matches yet. Create one above and the referee will be waiting.</p></div>`)}${ui.fold("mb-manual","<b>Mhuddball rules reference</b>",manual())}</div>`;
    }
    // Quick reference on the Teams screen: this team's positionals (Teams Expansion pp. 22-34; limits p. 5),
    // with each special ability explained in a line and a quick Add button per positional while building the team.
    // Unofficial stand-in rosters (not in the original rules): labelled everywhere a roster is picked or shown.
    const UNOFF_NOTE = "This match was set up before the official Teams Expansion rosters, so it keeps the builder's old stand-in roster. New matches use the official roster.";
    const unoffTag = ros => ros && ros.unofficial ? ' <span class="mb-unoff" title="Old unofficial roster, kept for this saved match">Old unofficial</span>' : "";
    const signed = value => value > 0 ? "+"+value : String(value);
    // One-line meaning of each special ability, from the rules file (PDF pp. 17-21).
    const explain = a => {
      const hit = R.abilities.find(item => a.toLowerCase().startsWith(item.name.toLowerCase())); if (!hit) return "";
      const leader = /^leader/i.test(a) && a.match(/(\d+)\s*\/\s*(\d+)/);
      const level = a.match(/\((\d+)\)/);
      return leader ? `coordinates ${leader[1]} Mhudders within ${leader[2]} inches (Coordinated assault costs 1 Pluck)` : level ? hit.text.replace(/\bX\b/g,level[1]) : hit.text;
    };
    // Abilities named inside another ability's explanation are shown in bold, with their own meaning added after it (owner's request, 14 Nov).
    // Leader is left out: other abilities only borrow its range, they don't use it (owner, 14 Nov).
    const REF_NAMES = R.abilities.filter(item => item.page && item.name !== "Leader").map(item => item.name).sort((left,right) => right.length-left.length);
    const REF_RX = new RegExp("\\b("+REF_NAMES.map(name => name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")+")\\b( \\+\\d)?","g");
    const refs = (text,own,extra = []) => {
      const found = [...extra];
      const html = esc(text).replace(REF_RX,(match,name) => { if (name.toLowerCase() === String(own).toLowerCase()) return match; if (!found.includes(name)) found.push(name); return `<b>${match}</b>`; });
      const notes = found.filter(name => !/^(Shooting|Passing|Tackling)$/.test(name) || extra.includes(name)).map(name => /^(Shooting|Passing|Tackling)$/.test(name) ? `<b>${name} +1</b>: +1 to its ${name === "Tackling" ? "Tackle" : name} Skill checks` : `<b>${esc(name)}</b>: ${esc(R.abilities.find(item => item.name === name).text)}`);
      return html+(notes.length ? ` <small style="opacity:.75">[${notes.join("; ")}]</small>` : "");
    };
    const explainHTML = (a,unit) => {
      let text = explain(a); if (!text) return "";
      const hit = R.abilities.find(item => a.toLowerCase().startsWith(item.name.toLowerCase()));
      // Adaptive tactics (X / Y): explain both listed abilities too.
      const listed = /^Adaptive tactics/i.test(a) ? (a.match(/\((.*)\)/)?.[1] || "").split("/").map(part => REF_NAMES.find(name => part.trim().toLowerCase().startsWith(name.toLowerCase()))).filter(Boolean) : [];
      return refs(text,hit.name,listed);
    };
    function positionals(team,side,editing) {
      const ros = roster(team), full = team.players.length >= 6;
      const rows = ros.positions.map(unit => {
        const max = limit(unit), have = team.players.filter(member => member.position === unit.id).length;
        return `<article><div><h3>${esc(unit.name)} <span class="mb-lim${have >= max ? " full" : ""}">${have}/${max}</span></h3><div class="gtiles">${tile("Sk",unit.sk)}${tile("Mt",unit.mt)}${tile("MA",unit.ma)}${tile("T",unit.t)}${tile("AP",unit.ap)}${tile("PC",signed(unit.pc))}</div><p class="mb-abil">${unit.pc2 !== undefined ? `<p class="hint">A second ${esc(unit.name)} costs PC ${signed(unit.pc2)}.</p>` : ""}${unit.abilities.length ? unit.abilities.map(a => `<b>${esc(a)}</b>${explain(a) ? `: ${explainHTML(a,unit)}` : ""}`).join("; ") : "No special ability"}</p></div>${editing ? button("add","+ Add",`data-side="${side}" data-position="${esc(unit.id)}" aria-label="Add a ${esc(unit.name)}"`,full || have >= max) : ""}</article>`;
      }).join("");
      return ui.fold("mb-positionals",`<b>Positionals &middot; ${esc(ros.name)}</b>${ros.unofficial ? unoffTag(ros) : ` <span class="hint">(PDF p. ${ros.page})</span>`}`,`${ros.unofficial ? `<p class="cp-notice mb-unoff-note"><b>Old unofficial roster.</b> ${UNOFF_NOTE}</p>` : ""}${ros.blurb ? `<p class="hint"><i>${esc(ros.blurb)}</i></p>` : ""}<p class="hint">Pick 6: each positional once, Linesquar up to 4${ros.positions.some(unit => unit.staff) ? "; Staff Mhudders (up to 3 in all, at most 2 of each) only through the Gamesquar's Retinue" : ""}. Deploy 5; the sixth waits on the sideline as a substitute. The team's total PC is added to its starting Pluck (never below 0). (PDF p. 5)</p><div class="cp-list mb-pos">${rows}</div>`,true);
    }
    function teams(entry) {
      const data = entry.mhuddball, editing = data.phase === "setup", substitutions = ["setup","reset"].includes(data.phase);
      return `${ui.tip("mb-teams","How teams work","Build each team from its positionals below. Substitutions happen only at resets. Every faction has an official roster from the Mhuddball Teams Expansion. Matches made before it may still show an old unofficial roster.")}<div class="mb-team-grid">${data.teams.map((team,side) => panel(`${esc(team.name)} &middot; ${esc(roster(team).name)}${unoffTag(roster(team))}`,`<div class="cp-form">${input("Team name",team.name,`data-team-name="${side}" maxlength="60"`)}</div><p><b>${team.players.length} / 6 selected</b> &middot; ${team.players.filter(member => member.onPitch).length} / 5 on pitch &middot; PC ${teamPC(team)} &middot; starting Pluck ${startingPluck(team)}</p>${teamProblem(team) ? `<p class="cp-notice">${esc(teamProblem(team))}</p>` : ""}${positionals(team,side,editing)}${editing ? (() => { const open = roster(team).positions.filter(unit => team.players.filter(member => member.position === unit.id).length < limit(unit)), full = team.players.length >= 6 || !open.length; return `<div class="cp-form">${select("Positional",full ? [["","Team complete"]] : open.map(unit => [unit.id,`${unit.name} (PC ${unit.pc})`]),"",`id="mb-position-${side}"${full ? " disabled" : ""}`)}${input("Mhudder name (blank for a numbered name)","",`id="mb-player-name-${side}" data-rname maxlength="80"${full ? " disabled" : ""}`)}</div><div class="cp-actions">${button("add","Add Mhudder",`data-side="${side}"`,full)}${button("fill",`Fill team (${6 - team.players.length} left)`,`data-side="${side}"`,full)}</div><p class="hint">The first five you add start on the pitch; the sixth waits on the sideline as the substitute.</p>`; })() : ""}${team.players.length ? `<div class="cp-selall">${button("rand-names","&#127922; Random names for the whole team",`data-side="${side}"`)}<span class="hint">Names from the Patrol Builder's Quar name list.</span></div>` : ""}<div class="cp-list">${team.players.map(member => {
        const unit = profile(team,member);
        return `<article><div><h3>${esc(member.name)}</h3><p>${esc(unit.name)} &middot; ${member.onPitch ? "On pitch" : "Sideline"} &middot; ${esc(member.status)}${member.oneTask ? " &middot; one task / turn" : ""}</p><div class="gtiles">${tile("Sk",unit.sk)}${tile("Mt",unit.mt)}${tile("MA",unit.ma)}${tile("T",unit.t)}${tile("AP",unit.ap)}${tile("PC",memberPC(team,member))}</div><p class="hint">${unit.abilities.map(esc).join(", ")}${unit.adaptive ? " &middot; now: "+esc(abilitiesOf(team,member).slice(-1)[0]) : ""}</p>${checkbox("Deploy on pitch",member.onPitch,`data-lineup="${esc(member.id)}"${!substitutions || member.status === "removed" ? " disabled" : ""}`)}<details class="cp-kit"${confirming === member.id ? " open" : ""}><summary>${editing ? "Rename or remove" : "Rename"}</summary><div class="cp-kitbody">${input("Name",member.name,`data-player-name="${esc(member.id)}" data-rname maxlength="80"`)}${editing ? button("remove",confirming === member.id ? "Confirm remove" : "Remove",`data-side="${side}" data-player="${esc(member.id)}"`) : ""}</div></details></div></article>`;
      }).join("") || '<p class="hint">No Mhudders yet. Add six from the positionals above.</p>'}</div>`)).join("")}</div>`;
    }
    // Abilities that act before the first whistle (PDF p. 18): Got a feeling (weather) and Infiltrate (free move).
    function startNotes(entry) {
      const notes = [];
      entry.mhuddball.teams.forEach(team => team.players.filter(member => member.onPitch).forEach(member => {
        if (hasAbility(team,member,"Got a feeling")) notes.push(`${team.name}'s ${member.name} has Got a feeling: before the weather card is used, pick the weather and roll off for it, or spend 1 Pluck to just pick it (PDF p. 18).`);
        const reach = abilityNum(abilitiesOf(team,member),"Infiltrate");
        if (reach) notes.push(`${team.name}'s ${member.name} has Infiltrate (${reach}): a free ${reach}-inch move before the game, not into the other team's zone, and not as the Gourder (PDF p. 18).`);
      }));
      return notes.length ? `<div class="cp-notice"><b>Before the whistle</b><ul>${notes.map(note => `<li>${esc(note)}</li>`).join("")}</ul></div>` : "";
    }
    function deployment(entry) {
      const data = entry.mhuddball, setup = draft(entry), first = data.phase === "setup";
      return panel(first ? "Opening deployment" : "Reset, substitute & redeploy",`<p>${first ? "Build both teams and deploy five on Teams & profiles first. Starting Pluck is 7 plus signed PC." : "Both gourds are out of play. Make any substitutions on Teams & profiles, then redeploy in your goal zones. This reset grants each team 2 Pluck."} Choose one Gourder per side, roll off at the table, and select the attacker chosen by the higher roller (re-roll ties).</p>${first ? startNotes(entry) : ""}<div class="cp-form">${data.teams.map((team,side) => select(`${esc(team.name)} Gourder`,[["","Choose an on-pitch Gourder"],...team.players.filter(member => member.onPitch && !["ooa","removed"].includes(member.status)).map(member => [member.id,member.name])],setup.carriers[side],`id="mb-carrier-${side}" data-carrier="${side}"`)).join("")}${select("Attacker chosen after the roll-off",[["","Choose after rolling off"],...data.teams.map((team,side) => [side,team.name])],setup.attacker,'id="mb-attacker" data-setup="attacker"')}${first ? checkbox("Use optional weather",setup.weatherEnabled,'id="mb-use-weather" data-setup="weatherEnabled"')+select("Initial weather card",[[3,"3: Bright"],[4,"4: Raining"],[5,"5: Wyndy"]],setup.card,'id="mb-start-card" data-setup="card"') : ""}</div>${data.suddenDeath ? '<p class="cp-notice">Sudden death: issue two new gourds. First goal wins.</p>' : ""}${button(first ? "start" : "reset",first ? "Start match & issue two gourds" : "Reset play & issue two gourds")}`);
    }
    function desk(entry) {
      const data = entry.mhuddball;
      const scoreboard = "", summary = "";
      if (["setup","reset"].includes(data.phase)) return scoreboard+summary+deployment(entry);
      if (data.phase === "finished") return scoreboard+summary+panel("Match complete",'<p>Open the Match journal for the record, or return to the Mhuddball list to create another game. Undo can correct the last action.</p>');
      return scoreboard+summary+playControls(entry)+panel("Gourds & possession", `${ui.tip("mb-gourds-possession", "How this works", "A gourd may change teams without leaving play. A goal or grounding removes it; no replacement is issued until BOTH are gone. Possession transfers alone do not award Pluck: record successful passes or interceptions separately.")}${data.gourds.map((gourd,index) => `<div class="cp-mission"><h3>Gourd ${index+1}: ${gourd.active ? esc(locate(entry,gourd.carrier).player.name)+" ("+esc(locate(entry,gourd.carrier).team.name)+")" : "out of play"}</h3>${gourd.active ? `<div class="cp-form">${select("New carrier",memberChoices(entry,item => canCarry(item.player)),gourd.carrier,`id="mb-gourd-${index}"`)}</div>${button("transfer","Transfer possession",`data-index="${index}"`)}${button("goal",confirming === "goal-"+index ? "Confirm goal" : "Score goal",`data-index="${index}"`)}${button("ground",confirming === "ground-"+index ? "Confirm grounding" : "Ground / out of play",`data-index="${index}"`)}` : ""}</div>`).join("")}`);
    }
    // Both teams at a glance on the Match desk, with one-tap task buttons for the active team (5 Nov playtest pass).
    // The buttons call the same task engine as the full form below, with no extra Pluck and no free-task explanation.
    function pitch(entry) {
      const data = entry.mhuddball, blocked = data.weatherPending || data.phase !== "playing";
      const QUICK = {carry:["move","sprint","pass","aimed-pass","shoot","handoff","steady","switch"], free:["move","sprint","charge","tackle","duke","tend","coordinated","inspiring","rally","lie-in-wait","like-this","switch","steady"]};
      const card = (team,side,member) => {
        const unit = profile(team,member), carrying = data.gourds.some(gourd => gourd.active && gourd.carrier === member.id), acting = side === data.active;
        const has = re => unit.abilities.some(ability => re.test(ability));
        let ids = member.status === "gobsmacked" ? ["recover"] : (carrying ? QUICK.carry : QUICK.free);
        const needOk = id => { const rule = R.tasks.find(item => item.id === id); return rule && (!rule.needs || hasAbility(team,member,rule.needs)) && !(rule.once && member.once.includes(id)); };
        ids = ids.filter(id => needOk(id) && !(["duke","tackle"].includes(id) && !member.engaged) && !(["move","sprint","pass","aimed-pass"].includes(id) && member.engaged) && !(id === "shoot" && member.shotBan) && !(["pass","aimed-pass"].includes(id) && member.passBan));
        if (member.chargeReady) ids = ["charge-tackle", ...ids];
        const canAct = acting && !blocked && !member.completed && (member.actions > 0 || member.chargeReady) && !["ooa","winded","removed"].includes(member.status);
        const buttons = canAct ? ids.map(id => { const rule = R.tasks.find(item => item.id === id); return rule ? button("quick-task", `${esc(rule.name.replace(/ \(.*\)$/, "").replace("Bonus Tackle after Charge","Bonus Tackle"))}${rule.cost ? ` <small>${rule.cost}P</small>` : ""}`, `data-side="${side}" data-player="${esc(member.id)}" data-task="${id}" title="${esc(rule.text)}"`, rule.cost > team.pluck + member.steady || rule.ball && member.ballUsed && id !== "charge-tackle") : ""; }).join("") + button("finish-activation","Done",`data-side="${side}" data-player="${esc(member.id)}"`) : "";
        const flagsTxt = [member.soggy ? "Soggy" : "", member.oneTask ? "One task / turn" : "", member.passBan ? "No passes" : "", member.shotBan ? "No shots" : "", member.steady ? "+1 Steady" : ""].filter(Boolean).join(" · ");
        return `<article class="mb-pc${carrying ? " has-gourd" : ""}${["ooa","removed","winded"].includes(member.status) ? " is-out" : ""}${member.completed && acting ? " is-done" : ""}"><div class="mb-pc-top"><div><b>${esc(member.name)}</b>${carrying ? ' <span class="mb-gourd">Gourd</span>' : ""}<span class="hint">${esc(unit.name)} &middot; Sk ${unit.sk} Mt ${esc(unit.mt)} MA ${unit.ma} T ${unit.t} AP ${unit.ap}${unit.adaptive ? " &middot; "+esc(abilitiesOf(team,member).slice(-1)[0]) : ""}</span></div>${acting && data.phase === "playing" ? `<span class="mb-acts" title="Actions left">${member.completed ? "Done" : member.actions + " act."}</span>` : ""}</div><select aria-label="Status of ${esc(member.name)}" data-quick-status="${esc(member.id)}" data-side="${side}" data-seg="tone"${blocked && data.phase !== "playing" ? " disabled" : ""}>${[["ready","Ready"],["gobsmacked","Gobsmacked"],["ooa","OOA"],["winded","Winded"]].map(([key,text]) => `<option value="${key}"${member.status === key ? " selected" : ""}>${text}</option>`).join("")}${member.status === "removed" ? '<option value="removed" selected>Removed</option>' : ""}</select><div class="mb-pc-x">${button("engage", member.engaged ? "Engaged &#10003;" : "Not engaged", `data-side="${side}" data-player="${esc(member.id)}" aria-pressed="${member.engaged}"`, data.phase !== "playing")}${flagsTxt ? `<span class="hint">${esc(flagsTxt)}</span>` : ""}</div>${buttons ? `<div class="mb-pc-tasks">${buttons}</div>` : ""}</article>`;
      };
      return `<div class="mb-pitch">${data.teams.map((team,side) => `<div class="mb-pitch-side${side === data.active ? " act" : ""}" style="--fac:${esc(sideFac(team)?.color || "")}">${ui.fold(`mb-desk-side-${side}`,`<b>${esc(team.name)}</b>${side === data.active ? ' <span class="mb-turn">Their turn</span>' : ""} <span class="hint">${team.players.filter(member => member.onPitch && member.status === "ready").length} ready &middot; ${team.players.filter(member => member.onPitch && ["ooa","gobsmacked"].includes(member.status)).length} down</span>`,`${team.players.filter(member => member.onPitch).map(member => card(team,side,member)).join("")}${team.players.filter(member => !member.onPitch).length ? `<p class="hint">Sideline: ${team.players.filter(member => !member.onPitch).map(member => `${esc(member.name)} (${esc(member.status)})`).join(", ")}</p>` : ""}`,true)}</div>`).join("")}</div><p class="hint">Tap a task to spend its action and Pluck (P). Status taps are logged as table results; use the Markers panel below to hand a dropped gourd to an engaged opponent.</p>`;
    }
    function playControls(entry) {
      const data = entry.mhuddball, acting = data.teams[data.active];
      const markers = members(entry).find(item => item.player.id === markerPlayer) || members(entry).find(item => item.side === data.active) || members(entry)[0];
      const member = markers.player;
      return panel("Turns, actions & weather",`<h3>${esc(acting.name)} is the active team</h3><p>Weather: <b>${esc(data.weather)}</b>${data.weatherEnabled ? " &middot; last card "+data.weatherCard : " (optional weather off)"}. ${data.weather === "raining" ? "Place the required puddles on the tabletop." : ""}</p>${data.weatherPending ? `<p class="cp-notice">A team turn ended. Flip the next activation card before continuing.</p><div class="cp-form">${select("New weather card",[[3,"3"],[4,"4"],[5,"5"]],data.weatherCard,'id="mb-weather-card"')}</div>${button("weather","Apply weather card")}` : ""}${pitch(entry)}<details class="cp-mission"><summary>Extra Pluck, free tasks &amp; interruptions</summary><div class="cp-form">${select("Acting Mhudder (choose opponent only for a granted interruption)",memberChoices(entry,item => item.player.onPitch),acting.players.find(player => ready(player))?.id || "",'id="mb-task-player"')}${select("Task to record",R.tasks.map(rule => [rule.id,`${rule.name}${rule.cost ? " ("+rule.cost+" Pluck)" : ""}`]),"move",'id="mb-task"')}${numeric("Extra Pluck spent (Skill / Might boosts, etc.)",0,'id="mb-task-extra"')}${input("Free task / interruption explanation (blank for normal action)","",'id="mb-task-free" maxlength="500"')}</div><p class="hint">Record the task cost and action here, then resolve movement/checks at the table or with Dice helpers. A free-task explanation permits documented Support, coordinated actions, reactions or interruptions without spending normal activation allowances. For an interrupting Re position use Move, explain the interruption and enter 1 extra Pluck. Onslaught, Feint and Like This!! can be recorded on either team's turn. Record goals, possession, statuses and nonautomatic Pluck rewards separately.</p>${button("task","Record task & spend cost","",data.weatherPending)}</details>${button("end-turn","End team turn (pass unused activations)","",data.weatherPending)}`)+panel("Player markers & table results",`<div class="cp-form">${select("Mhudder",memberChoices(entry),member.id,'id="mb-marker-player" data-marker-player="1"')}${select("Status",[["ready","Ready"],["gobsmacked","Gobsmacked"],["ooa","Out of Action"],["winded","Winded: sideline until reset"],["removed","Removed for this game"]],member.status,'id="mb-status"')}${checkbox("Soggy",member.soggy,'id="mb-soggy"')}${checkbox("Engaged with an opponent",member.engaged,'id="mb-engaged"')}${checkbox("One task per turn (injury)",member.oneTask,'id="mb-one-task"')}${checkbox("Passing dislocation: no more Passes",member.passBan,'id="mb-pass-ban"')}${checkbox("Shooting dislocation: no more Shots",member.shotBan,'id="mb-shot-ban"')}${select("Engaged opponent taking a dropped gourd",[["","None: ground it if there is no engaged opponent"],...memberChoices(entry,item => item.side !== markers.side && canCarry(item.player))],"",'id="mb-drop-recipient"')}${input("Required explanation / check result","",'id="mb-status-reason" maxlength="500"')}</div><p class="hint">Choose the engaged opponent before putting a Gourder OOA; otherwise an unengaged Gourder's gourd is grounded. Aberganed ignores the first Soggy and Hardened the first Gobsmacked automatically. A second Gobsmacked result from a Tackle is OOA: select OOA explicitly. Status changes do not automatically award an OOA Pluck reward.</p>${button("status","Apply explained markers & status")}`)+panel("Apply a Tend Wounded result", `${ui.tip("mb-apply-a-tend-wounded-result", "How this works", "This applies the result and any Pluck reward. Record the Tend Wounded task separately in the action controls. A Physio's multi-patient task can be recorded once, then apply a result to each eligible patient within 2 inches.")}<div class="cp-form">${select("Tending Mhudder",memberChoices(entry,item => ready(item.player)),"",'id="mb-healer"')}${select("OOA patient (either team)",memberChoices(entry,item => item.player.onPitch && item.player.status === "ooa"),"",'id="mb-patient"')}${numeric("Unmodified physical D6",1,'id="mb-tend-die"',6)}</div>${button("tend-roll","Roll D6 & apply result","",data.weatherPending)}${button("tend-manual","Apply physical die result","",data.weatherPending)}`);
    }
    function helpers(entry) {
      const data = entry.mhuddball, helper = data.helper;
      return panel("Mhuddball dice helpers",`<p>Use printed Mhuddball stats, not patrol-builder profiles. These tools calculate and journal dice results only: they <b>do not</b> automatically spend actions/Pluck, move gourds, score goals or change statuses. Apply the outcome on Match desk once, after resolving interruptions, free actions and tabletop choices.</p><div class="cp-form">${select("Mhudder",memberChoices(entry),"",'id="mb-helper-player"')}${select("Check",[["pass","Pass"],["shoot","Shoot"],["tackle","Tackle"],["skill","General / opposed Skill"],["intercept","Intercept (two D6 face patterns)"],["tend","Tend Wounded (advice only)"],["mishap","Shot / pass mishap"],["might","Tackle Might vs Toughness"],["rolloff","Opening / reset roll-off"]],"pass",'id="mb-helper-kind" data-helper-kind')}${input("Physical dice (blank to roll in app)","",'id="mb-helper-dice" data-for="pass shoot tackle skill intercept tend mishap rolloff" placeholder="3d6: 2 3 4; interception: 6 1"')}${input("Other agreed modifier (Wyndy is added for you)",0,'id="mb-helper-modifier" data-for="pass shoot tackle skill" type="number" step="1" min="-99" max="99"')}${numeric("Pluck Skill boost (proposed; spend it on Match desk)",0,'id="mb-helper-boost" data-for="pass shoot tackle skill"')}${input("Throw distance in inches",0,'id="mb-helper-distance" data-for="pass shoot" type="number" min="0" step="0.1"')}${numeric("Opponents on passing / shooting line (a Hardened one counts as 2)",0,'id="mb-helper-line" data-for="pass shoot"',5)}${numeric("Opponents in contact with Gourder",0,'id="mb-helper-contact" data-for="pass shoot"',5)}${numeric("Opponents in contact with Pass target (0 if it has Steady hands)",0,'id="mb-helper-target-contact" data-for="pass"',5)}${checkbox("Gourder sprinted this activation",false,'id="mb-helper-sprinted" data-for="pass shoot"')}${checkbox("Passing target is Soggy",false,'id="mb-helper-target-soggy" data-for="pass"')}${checkbox("Aimed pass (requires Dead eye)",false,'id="mb-helper-aimed" data-for="pass"')}${numeric("Additional friendly Mhudders in Tackle",0,'id="mb-helper-friendly" data-for="tackle"',5)}${numeric("Additional opposing Mhudders in Tackle",0,'id="mb-helper-enemy" data-for="tackle"',5)}${checkbox("Tackle target already Gobsmacked",false,'id="mb-helper-target-gob" data-for="tackle might"')}${checkbox("Use Killing strike (-2 Skill, +2 Might)",false,'id="mb-helper-killing" data-for="tackle"')}${numeric("Final Might result (after critical multiplier / boosts)",0,'id="mb-helper-might" data-for="might"')}${numeric("Target Toughness (for Might helper)",4,'id="mb-helper-toughness" data-for="might"')}</div><p class="hint">Only relevant modifiers are used. Physical dice must already include required Soggy re-rolls; blank dice use one in-app re-roll per original qualifying die. Skill successes use 3D6 no higher than the target. Interception uses two face patterns, not their sum. For a Might helper, enter the FINAL total after any doubled/tripled Might and Killing strike. Geometry and opposed-check winners remain tabletop decisions.</p>${button("calculate","Calculate / roll result", "",!members(entry).length)}${helper ? `<div class="cp-mission" role="status"><h3>${esc(helper.actor)}: ${esc(helper.kind)}</h3><p>${esc(helper.text)}</p><p class="hint">No match effects have been applied. Record the result to the journal, then apply its actual table outcome on Match desk.</p>${button("record-helper",helper.recorded ? "Dice result recorded" : "Record dice result in journal","",!!helper.recorded)}</div>` : ""}`);
    }
    function journal(entry) {
      return panel("Match notes & journal",`<div class="cp-form">${input("Match name",entry.name,'data-match-field="name" maxlength="80"')}</div><label>Match story, agreed rules & notes<textarea data-match-field="notes" maxlength="6000">${esc(entry.notes)}</textarea></label><label>Add a journal entry<textarea id="mb-journal-text" maxlength="1500"></textarea></label>${button("journal","Record note")}<ol class="cp-journal">${[...entry.mhuddball.log].reverse().map(item => `<li><b>Round ${number(item.round)}</b> &middot; ${esc(new Date(item.at).toLocaleDateString())}<p>${esc(item.text)}</p></li>`).join("")}</ol>`);
    }
    // Small round pictures beside matching rules sections (v.51; pictures from the TomDrawsThings Mhuddball art)
    const RULE_ART = {"The game, pitch and victory":"referee","Team selection and initial deployment":"linesquar","Optional weather":"leap","Shooting results and diving saves":"net","Passing results, hand-offs and Support":"catch","Tackle Might, gourd stripping and Duke":"scrum"};
    function manual() {
      return `<p><b>Mhuddball + Teams Expansion (v1)</b> &middot; community sport supplement &middot; <i>${esc(R.source)}</i> (PDF pp. 1-34). Original ruleset by TomDrawsThings; Teams Expansion by GamerCouch; balancing and proofreading by both. Paraphrased reference; keep the PDF authoritative. Inspired by <i>Quar: Clash of Rhyfles</i> and the <i>Mhudd rules of play</i> in Zombiesmith&rsquo;s <i>Tales of the Breach</i>.</p>${R.sections.map(section => { const pic = RULE_ART[section.title]; return `<details class="cp-mission"><summary>${esc(section.title)} (PDF p. ${esc(section.page)})</summary>${pic && ui.mhuddPic ? `<div class="mb-rsec">${ui.mhuddPic(pic)}<p>${esc(section.text)}</p></div>` : `<p>${esc(section.text)}</p>`}</details>`; }).join("")}<details class="cp-mission"><summary>All tasks & printed Pluck costs (pp. 7-10, 14, 17-21)</summary><dl>${R.tasks.map(task => `<dt>${esc(task.name)}${task.cost ? " - "+task.cost+" Pluck" : ""}</dt><dd>${esc(task.text)}</dd>`).join("")}</dl></details><details class="cp-mission"><summary>Special abilities (pp. 17-21)</summary><dl>${R.abilities.filter(item => item.page).map(item => `<dt>${esc(item.name)}</dt><dd>${refs(item.text,item.name)} (p. ${item.page})</dd>`).join("")}</dl></details><details class="cp-mission" open><summary>Team rosters (pp. 22-34)</summary>${ui.mhuddPic ? `<div class="mb-rsec mb-rsec-solo">${ui.mhuddPic("daenyvn")}<p class="hint">Every Mhudder has Skill, Might, Movement, Toughness, Action Points and a Pluck Cost, plus any special ability.</p></div>` : ""}${R.rosters.map(team => `<h3>${esc(team.name)} <span class="hint">(p. ${team.page})</span></h3>${team.blurb ? `<p class="hint"><i>${esc(team.blurb)}</i></p>` : ""}<div class="scroll"><table class="stats"><thead><tr><th>Positional</th><th>${ui.stl ? ui.stl("Sk","mh") : "Sk"}</th><th>${ui.stl ? ui.stl("Mt","mh") : "Mt"}</th><th>${ui.stl ? ui.stl("MA","mh") : "MA"}</th><th>${ui.stl ? ui.stl("T","mh") : "T"}</th><th>${ui.stl ? ui.stl("AP","mh") : "AP"}</th><th>${ui.stl ? ui.stl("PC","mh") : "PC"}</th><th>Special</th></tr></thead><tbody>${team.positions.map(unit => `<tr><td>${esc(unit.name)}</td><td>${unit.sk}</td><td>${esc(unit.mt)}</td><td>${unit.ma}</td><td>${unit.t}</td><td>${unit.ap}</td><td>${signed(unit.pc)}${unit.pc2 !== undefined ? " / "+signed(unit.pc2)+"*" : ""}</td><td>${unit.abilities.map(esc).join(", ")}</td></tr>`).join("")}</tbody></table></div>${team.positions.some(unit => unit.pc2 !== undefined) ? '<p class="hint">* PC for taking that positional a second time.</p>' : ""}`).join("")}</details>${R.notes.length ? `<details class="cp-mission"><summary>Rulings and unclear points</summary><ul>${R.notes.map(note => `<li>${esc(note)}</li>`).join("")}</ul></details>` : ""}`;
    }
    document.addEventListener("change", event => {
      const target = event.target; if (!target.closest("#view-narr .mb")) return;
      const entry = match(); if (!entry) return;
      if (target.dataset.markerPlayer) { markerPlayer = target.value; render(entry.id); return; }
      if (target.dataset.quickStatus) { const side = Number(target.dataset.side), id = target.dataset.quickStatus, next = target.value; change(item => E.status(item,side,id,next,"marked at the table")); return; }
      if (target.dataset.helperKind !== undefined) { helperFields(); return; }
      if (target.dataset.lineup) { change(item => { const member = locate(item,target.dataset.lineup); E.lineup(item,member.side,member.player.id,target.checked); }); return; }
      if (target.dataset.teamName !== undefined) { const side = Number(target.dataset.teamName); E.team(entry,side).name = target.value.slice(0,60); save(entry); return; }
      if (target.dataset.playerName) { locate(entry,target.dataset.playerName).player.name = target.value.slice(0,80); save(entry); if (event.fromDice) render(entry.id); return; }
      if (["name","notes"].includes(target.dataset.matchField)) { entry[target.dataset.matchField] = target.value.slice(0,target.dataset.matchField === "name" ? 80 : 6000); save(entry); return; }
      if (target.dataset.carrier !== undefined) { draft(entry).carriers[Number(target.dataset.carrier)] = target.value; save(entry); return; }
      if (target.dataset.setup) { const key = target.dataset.setup; if (["attacker","weatherEnabled","card"].includes(key)) draft(entry)[key] = key === "weatherEnabled" ? target.checked : key === "card" ? Number(target.value) : target.value; save(entry); }
    });
    document.addEventListener("click", event => {
      const target = event.target.closest("[data-mb]"); if (!target || !target.closest("#view-narr .mb") || target.disabled) return;
      const action = target.dataset.mb;
      if (action === "create") {
        try {
          const entry = E.normalize(E.create(get("mb-name").trim() || "A game of Mhuddball",get("mb-home"),get("mb-away")));
          E.log(entry,"Match created using Mhuddball + Teams Expansion (v1). Select six Mhudders per side from the official rosters."); context.getStories().push(entry); save(entry); context.navigate(entry.id);
        } catch(error) { context.toast(error.message); }
        return;
      }
      if (action === "delete") {
        if (confirming !== target.dataset.id) { confirming = target.dataset.id; renderList(); return; }
        const list = context.getStories(), index = list.findIndex(item => item.id === target.dataset.id && item.system === "mhuddball"); if (index >= 0) list.splice(index,1); context.save(); confirming = ""; renderList(); return;
      }
      if (action === "tab") { tab = target.dataset.tab; keepTab(current, tab); confirming = ""; render(current); return; }
      const entry = match(); if (!entry) return;
      if (action === "undo") { const snapshot = entry.mhuddball.undo; if (!snapshot) return; Object.keys(entry).forEach(key => delete entry[key]); Object.assign(entry,clone(snapshot)); save(entry); render(entry.id); return; }
      if (["goal","ground","remove"].includes(action)) { const key = action+"-"+(target.dataset.index ?? target.dataset.player); if (confirming !== key && confirming !== target.dataset.player) { confirming = action === "remove" ? target.dataset.player : key; render(entry.id); return; } confirming = ""; }
      change(item => {
        const data = item.mhuddball, side = Number(target.dataset.side);
        if (action === "add") E.add(item,side,target.dataset.position || get("mb-position-"+side),get("mb-player-name-"+side).trim());
        if (action === "remove") {
          if (data.phase !== "setup") throw Error("Team membership locks when play starts.");
          const selected = E.team(item,side).players.findIndex(member => member.id === target.dataset.player); if (selected < 0) throw Error("Mhudder not found.");
          E.log(item,`Removed ${E.team(item,side).players[selected].name} from the pre-game roster.`); E.team(item,side).players.splice(selected,1);
          if (teamProblem(E.team(item,side))) throw Error("Remove the Staff Mhudders first: they can only stay through the Gamesquar's Retinue.");
        }
        if (action === "start" || action === "reset") {
          const setup = draft(item); if (!["0","1"].includes(String(setup.attacker))) throw Error("Roll off, then choose the opening attacker.");
          if (action === "start") E.start(item,setup.carriers,Number(setup.attacker),setup.weatherEnabled,Number(setup.card)); else E.reset(item,setup.carriers,Number(setup.attacker));
          delete data.draft; tab = "desk";
        }
        if (action === "transfer") { const recipient = locate(item,get("mb-gourd-"+target.dataset.index)); E.transfer(item,Number(target.dataset.index),recipient.side,recipient.player.id); }
        if (action === "goal") E.goal(item,Number(target.dataset.index));
        if (action === "ground") E.ground(item,Number(target.dataset.index));
        if (action === "pluck") E.pluck(item,side,Number(target.dataset.delta),get("mb-pluck-reason-"+side));
        if (action === "task") { const actor = locate(item,get("mb-task-player")); E.task(item,actor.side,actor.player.id,get("mb-task"),integer("mb-task-extra"),get("mb-task-free").trim()); }
        if (action === "finish-activation") E.finishActivation(item,side,target.dataset.player);
        if (action === "quick-task") E.task(item,side,target.dataset.player,target.dataset.task,0,"");
        if (action === "engage") { const member = E.player(item,side,target.dataset.player); E.flags(item,side,member.id,{engaged:!member.engaged}); }
        if (action === "fill") E.fill(item,side);
        if (action === "rand-names") { const used = members(item).map(other => other.player.name); E.team(item,side).players.forEach(member => { member.name = context.name(used) || member.name; used.push(member.name); }); E.log(item,`${E.team(item,side).name}: random names drawn for the team.`); }
        if (action === "end-turn") E.endTurn(item);
        if (action === "weather") E.weather(item,integer("mb-weather-card"));
        if (action === "status") {
          const actor = locate(item,get("mb-marker-player")); E.flags(item,actor.side,actor.player.id,{soggy:checked("mb-soggy"),engaged:checked("mb-engaged"),oneTask:checked("mb-one-task"),passBan:checked("mb-pass-ban"),shotBan:checked("mb-shot-ban")});
          E.status(item,actor.side,actor.player.id,get("mb-status"),get("mb-status-reason").trim(),get("mb-drop-recipient"));
        }
        if (action === "tend-roll" || action === "tend-manual") { const healer = locate(item,get("mb-healer")), patient = locate(item,get("mb-patient")); E.tend(item,healer.side,healer.player.id,patient.side,patient.player.id,action === "tend-roll" ? die() : integer("mb-tend-die")); }
        if (action === "calculate") {
          const actor = locate(item,get("mb-helper-player")), physical = get("mb-helper-dice").trim();
          E.calculate(item,{side:actor.side,player:actor.player.id,kind:get("mb-helper-kind"),dice:physical ? physical.split(/[\s,]+/).map(Number) : null,modifier:integer("mb-helper-modifier"),boost:integer("mb-helper-boost"),distance:integer("mb-helper-distance"),line:integer("mb-helper-line"),contact:integer("mb-helper-contact"),targetContact:integer("mb-helper-target-contact"),sprinted:checked("mb-helper-sprinted"),targetSoggy:checked("mb-helper-target-soggy"),aimed:checked("mb-helper-aimed"),friendly:integer("mb-helper-friendly"),enemy:integer("mb-helper-enemy"),targetGobsmacked:checked("mb-helper-target-gob"),killing:checked("mb-helper-killing"),might:integer("mb-helper-might"),toughness:integer("mb-helper-toughness")});
        }
        if (action === "record-helper") { if (!data.helper || data.helper.recorded) throw Error("Calculate a new result before recording it."); E.log(item,`Dice advice only, ${data.helper.actor} / ${data.helper.kind}: ${data.helper.text} Match effects must be applied separately.`); data.helper.recorded = true; }
        if (action === "journal") { const text = get("mb-journal-text").trim(); if (!text) throw Error("Write a journal note first."); E.log(item,text.slice(0,1500)); }
      });
    });
    return {render,importStory:value => { const entry = clone(value); delete entry.mhuddball?.undo; return E.normalize(entry); }};
  }
  return {create,createEngine,profile,roster,startingPluck,faceKey,skillResult,mightResult,mishap,interception,dice};
})();
