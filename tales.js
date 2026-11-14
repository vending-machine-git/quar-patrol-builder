"use strict";
window.QuarTales = (() => {
  const R = window.QuarTalesRules;
  const clone = value => JSON.parse(JSON.stringify(value));
  const amount = (value, max = 999999) => Math.max(0, Math.min(max, Math.floor(Number(value) || 0)));
  const signed = value => Math.max(-999999, Math.min(999999, Math.trunc(Number(value) || 0)));
  const uid = () => "qt" + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  const die = () => 1 + Math.floor(Math.random() * 6);
  const vehicle = unit => !!unit.vehicle;
  const eligible = unit => !vehicle(unit) && !unit.crew && !/animal|weapon team|weapon crew/i.test(unit.cat) && !/pack \(/i.test(JSON.stringify(unit.profiles || []));
  const label = unit => unit.name + (unit.variant ? " - " + unit.variant : "");
  function recoveryKey(rolls) {
    if (!Array.isArray(rolls) || rolls.length !== 2 || rolls.some(value => !Number.isInteger(value) || value < 1 || value > 6)) throw Error("Recovery needs two dice, each from 1 to 6.");
    const [low, high] = [...rolls].sort((left, right) => left - right);
    return low === 6 ? "66" : high === 1 ? "11" : low === 1 && high === 6 ? "61" : high === 6 ? "6-" : low === 1 ? "1-" : "--";
  }
  const supplies = total => total < 1 ? 0 : total < 6 ? 1 : total < 12 ? 2 : total < 18 ? 3 : total < 25 ? 4 : total < 31 ? 5 : total < 36 ? 6 : 7;
  const matches = rolls => R.encounters.filter(entry => rolls.filter(value => value === entry.face).length >= entry.size);
  function createEngine(getData) {
    const faction = tale => getData().factions.find(entry => entry.id === tale.faction);
    const unit = (tale, member) => faction(tale)?.units.find(entry => entry.id === member.unitId);
    const alive = tale => tale.chars.filter(member => member.status === "active");
    const characters = tale => alive(tale).filter(member => member.role !== "fodder");
    const value = tale => alive(tale).reduce((total, member) => total + unit(tale, member).pts, 0);
    const characterLimit = tale => Math.floor(tale.tales.limit / 100);
    const log = (tale, text) => { tale.tales.log.push({at:Date.now(), game:tale.tales.game, text}); tale.tales.log = tale.tales.log.slice(-500); };
    const requireMember = (tale, id) => { const member = tale.chars.find(entry => entry.id === id); if (!member) throw Error("Choose a roster member."); return member; };
    const between = tale => { if (!["muster", "supply", "encounter"].includes(tale.tales.phase)) throw Error("Make roster and purchase changes between Skirmishes."); };
    function member(unitData, name) {
      return {id:uid(), unitId:unitData.id, name:String(name || unitData.name).slice(0,80), role:"fodder", xp:0, status:"active", skip:0, jitters:false, damage:0, disabled:false, lostWeapons:0, squad:"", notes:"", advances:{skill:0, toughness:0}, injuries:[]};
    }
    function normalize(tale) {
      if (!tale || tale.system !== "quar-tales" || !tale.tales || typeof tale.tales !== "object" || !faction(tale) || !Array.isArray(tale.chars)) throw Error("Invalid Quar Tales force.");
      const state = tale.tales;
      tale.id = String(tale.id || "tale-" + uid()); tale.name = String(tale.name || "Unnamed Tale").slice(0,60); tale.notes = String(tale.notes || "").slice(0,6000);
      tale.created = amount(tale.created,Number.MAX_SAFE_INTEGER) || Date.now(); tale.updated = amount(tale.updated,Number.MAX_SAFE_INTEGER) || tale.created;
      state.limit = Math.max(600,Math.min(1000,amount(state.limit))); state.supply = amount(state.supply); state.xp = amount(state.xp); state.game = Math.max(1,amount(state.game));
      if (!["muster","battle","recovery","experience","logistics","encounter","supply"].includes(state.phase)) throw Error("Unknown Quar Tales campaign stage.");
      state.log = (Array.isArray(state.log) ? state.log : []).filter(entry => entry && typeof entry.text === "string").slice(-500);
      state.inventory = (Array.isArray(state.inventory) ? state.inventory : []).filter(item => item && R.shop.some(rule => rule.id === item.type)).map(item => ({id:String(item.id || uid()), type:item.type, bearer:String(item.bearer || ""), quality:amount(item.quality,6), earned:amount(item.earned), ...(item.bought ? {bought:{win:amount(item.bought.win), cost:amount(item.bought.cost)}} : {})})).slice(0,300);
      state.advantages = state.advantages && typeof state.advantages === "object" && !Array.isArray(state.advantages) ? state.advantages : {};
      R.advantages.forEach(rule => { state.advantages[rule.id] = amount(state.advantages[rule.id],rule.max || 100); });
      state.nextPenalty = amount(state.nextPenalty,1); state.nextSquads = (Array.isArray(state.nextSquads) ? state.nextSquads : []).map(entry => String(entry).slice(0,60)).slice(0,100); state.tunnels = !!state.tunnels;
      tale.chars = tale.chars.filter(entry => entry && unit(tale,entry)).slice(0,200).map(entry => {
        const clean = {...member(unit(tale,entry),entry.name), ...entry};
        clean.id = String(clean.id); clean.name = String(clean.name).slice(0,80); clean.notes = String(clean.notes || "").slice(0,4000); clean.squad = String(clean.squad || "").slice(0,60);
        clean.role = ["leader","character","fodder"].includes(clean.role) && eligible(unit(tale,clean)) ? clean.role : "fodder";
        clean.status = ["active","dead","retired"].includes(clean.status) ? clean.status : "active";
        ["xp","damage","lostWeapons"].forEach(key => { clean[key] = amount(clean[key]); }); clean.skip = amount(clean.skip,1);
        clean.advances = {skill:amount(clean.advances?.skill,2), toughness:amount(clean.advances?.toughness,1), veteran:!!clean.advances?.veteran, hardened:!!clean.advances?.hardened};
        clean.injuries = (Array.isArray(clean.injuries) ? clean.injuries : []).filter(injury => injury && typeof injury.text === "string").map(injury => ({text:injury.text.slice(0,500), sk:signed(injury.sk), t:signed(injury.t), ma:signed(injury.ma)})).slice(0,100);
        clean.jitters = !!clean.jitters; clean.disabled = !!clean.disabled; return clean;
      });
      if (new Set(tale.chars.map(entry => entry.id)).size !== tale.chars.length) throw Error("Duplicate Quar Tales roster IDs.");
      state.inventory = state.inventory.filter(item => !item.bearer || tale.chars.some(entry => entry.id === item.bearer && entry.status === "active"));
      if (state.draft) {
        state.draft = {limit:Math.max(1,amount(state.draft.limit)), scenario:String(state.draft.scenario || "").slice(0,200), deployed:(Array.isArray(state.draft.deployed) ? state.draft.deployed : []).filter(id => tale.chars.some(entry => entry.id === id))};
      }
      if (!["muster","supply"].includes(state.phase)) {
        const battle = state.battle;
        if (!battle || !Array.isArray(battle.deployed) || !battle.rows || typeof battle.rows !== "object" || battle.deployed.some(id => !tale.chars.some(entry => entry.id === id) || !battle.rows[id])) throw Error("Incomplete Quar Tales battle record.");
        if (new Set(battle.deployed).size !== battle.deployed.length) throw Error("Duplicate Quar Tales deployment IDs.");
        battle.advantages = battle.advantages && typeof battle.advantages === "object" ? battle.advantages : {};
        R.advantages.forEach(rule => { battle.advantages[rule.id] = amount(battle.advantages[rule.id],rule.max || 100); });
        battle.benefits = (Array.isArray(battle.benefits) ? battle.benefits : []).filter(item => item && R.shop.some(rule => rule.id === item.type));
        battle.squads = (Array.isArray(battle.squads) ? battle.squads : []).map(String); battle.penalty = amount(battle.penalty,1); battle.pluck = amount(battle.pluck);
        battle.scenario = String(battle.scenario || "Agreed scenario").slice(0,200); battle.notes = String(battle.notes || "").slice(0,4000);
        battle.deployed.forEach(id => {
          const row = battle.rows[id]; if (!row || typeof row !== "object") throw Error("Invalid battle participant.");
          if (row.roll) recoveryKey(row.roll);
          ["damage","normal","expensive","veteran","character","primary","secondary","narrative","revive"].forEach(key => { row[key] = amount(row[key]); });
        });
        if (battle.logistics) {
          const search = battle.logistics;
          if (!Array.isArray(search.rolls) || search.rolls.length > 200 || search.rolls.some(result => !Number.isInteger(result) || result < 1 || result > 6) || !Array.isArray(search.kept) || search.kept.some(index => !Number.isInteger(index) || index < 0 || index >= search.rolls.length)) throw Error("Invalid Logistics dice in backup.");
          search.free = amount(search.free);
        }
        if (state.phase === "encounter" && !R.encounters.some(entry => `${entry.size}-${entry.face}` === battle.logistics?.encounter)) throw Error("Missing encounter in backup.");
      }
      return tale;
    }
    function create(name, factionId, limit) {
      const now = Date.now();
      const tale = {id:"tale-"+uid(), system:"quar-tales", name, faction:factionId, notes:"", chars:[], created:now, updated:now, tales:{version:1, limit, supply:2, xp:0, phase:"muster", game:1, inventory:[], advantages:{}, nextPenalty:0, nextSquads:[], log:[]}};
      normalize(tale); log(tale,"Force founded with 2 Supply. Muster a 600-1000-point Force pool; normal patrols remain independent."); return tale;
    }
    function spend(tale, key, cost) {
      if (tale.tales[key] < cost) throw Error(`Not enough ${key === "xp" ? "Force XP" : "Supply"}.`);
      tale.tales[key] -= cost;
    }
    function recruit(tale, unitId, name, cost = 0, reason = "") {
      between(tale); const data = faction(tale).units.find(entry => entry.id === unitId);
      if (!data || !Number.isFinite(data.pts)) throw Error("Choose a recruitable faction unit.");
      if (value(tale)+data.pts > tale.tales.limit) throw Error("This recruit exceeds the Force's point limit.");
      if (tale.chars.length >= 200) throw Error("The roster is full.");
      const freeMuster = tale.tales.game === 1 && tale.tales.phase === "muster";
      if (!freeMuster && !reason) {
        if (!eligible(data) || /caerten|command|master yawdryl/i.test(data.name+" "+data.cat)) throw Error("No printed recruitment price: record an encounter award with an explanation.");
        if (![1,2,3].includes(cost)) throw Error("Choose a recruitment cost: basic rifle 1, other weapon/Milwer 2, Yawdryl 3.");
        if (/yawdryl/i.test(data.name) && cost !== 3 || /milwer/i.test(data.name) && cost !== 2) throw Error("Milwers cost 2 Supply; Yawdryls cost 3 Supply.");
        spend(tale,"supply",cost);
      }
      const entry = member(data,name); entry.fresh = {win:amount(tale.tales.battles), paid:!freeMuster && !reason ? cost : 0}; tale.chars.push(entry);
      log(tale,`Recruited ${entry.name}: ${label(data)}, ${data.pts} points${freeMuster ? " (initial pool)" : reason ? " (agreed award: "+reason+")" : ", "+cost+" Supply"}.`); return entry;
    }
    function setRole(tale, entry, role) {
      between(tale);
      if (!["leader","character","fodder"].includes(role) || !eligible(unit(tale,entry)) || entry.status !== "active") throw Error("Only active individual rhyflers can be Characters or the Leader.");
      if (role === "leader" && characters(tale).some(other => other.id !== entry.id && other.role === "leader")) throw Error("A Force has only one Leader.");
      if (role === "character" && characters(tale).filter(other => other.id !== entry.id && other.role === "character").length >= characterLimit(tale)) throw Error("The Force's Character slots are full.");
      if (role === "fodder" && (entry.xp || entry.advances.skill || entry.advances.toughness || entry.advances.veteran || entry.advances.hardened)) throw Error("An experienced Character cannot become Fodder; retire them instead.");
      entry.role = role; log(tale,`${entry.name} designated ${role}.`);
    }
    function advance(tale, entry, id, free = false) {
      if (entry.role === "fodder" || entry.status !== "active") throw Error("Only living Characters gain advances.");
      const rule = R.advances.find(item => item.id === id); if (!rule) throw Error("Choose an advance.");
      const stats = entry.advances, base = unit(tale,entry).profiles?.flatMap(profile => profile.abilities || []) || [];
      const veteran = stats.veteran || base.some(ability => /^(veteran|hero)$/i.test(ability)), hardened = stats.hardened || base.some(ability => /^(hardened|hero)$/i.test(ability));
      if (id === "skill" && stats.skill >= 2 || id === "toughness" && stats.toughness >= 1 || id === "veteran" && veteran || id === "hardened" && hardened || id === "hero" && veteran && hardened) throw Error("This advance is already at its limit.");
      if (!free) { if (!["experience","supply"].includes(tale.tales.phase)) throw Error("Spend Character XP during Experience or Supply."); if (entry.xp < rule.cost) throw Error("Not enough Character XP."); entry.xp -= rule.cost; }
      if (id === "skill" || id === "toughness") stats[id]++; else { if (id !== "hardened") stats.veteran = true; if (id !== "veteran") stats.hardened = true; }
      log(tale,`${entry.name}: ${rule.name}${free ? " (free narrative advance)" : " for "+rule.cost+" Character XP"}.`);
    }
    function deploymentCost(tale, entry) {
      if (entry.role === "leader") return 0; const data = unit(tale,entry);
      if (/tractor/i.test(data.cat)) return /crewed/i.test(data.vehicle?.activation || "") ? 5 : 3;
      if (vehicle(data) || data.crew || /weapon team/i.test(data.cat)) return 2;
      if (/cavalry|lancer|outrider|autoped/i.test(data.cat)) return 2;
      return /specialist|command/i.test(data.cat) ? 1 : 0;
    }
    function patrolErrors(tale, ids, limit) {
      const force = faction(tale), selected = ids.map(id => requireMember(tale,id)), errors = [];
      const count = keys => selected.filter(entry => [].concat(keys).includes(entry.unitId)).length;
      if (!selected.length) errors.push("Select a Patrol from your Force.");
      if (new Set(ids).size !== ids.length) errors.push("A roster entry cannot deploy twice.");
      if (selected.some(entry => entry.status !== "active" || entry.skip || entry.disabled || entry.damage)) errors.push("Dead, absent, Disabled or damaged units cannot deploy.");
      if (selected.filter(entry => entry.role === "character").length > 4) errors.push("A Patrol allows four Characters plus the Leader.");
      if (characters(tale).filter(entry => entry.role === "leader").length !== 1) errors.push("Designate exactly one Force Leader on the roster.");
      if (characters(tale).filter(entry => entry.role === "character").length > characterLimit(tale)) errors.push("Too many Characters for the Force limit.");
      if (selected.reduce((total,entry) => total+unit(tale,entry).pts,0) > limit) errors.push("Patrol exceeds its agreed points limit.");
      const seen = new Set();
      for (const data of force.units.filter(entry => count(entry.id))) {
        const group = force.units.filter(entry => data.faGroup ? entry.faGroup === data.faGroup : entry.id === data.id).map(entry => entry.id);
        const max = data.fa == null || data.faLiftedBy && count(data.faLiftedBy) ? null : data.fa*(limit >= getData().rules.faDoublesAt ? 2 : 1);
        if (max !== null && count(group) > max && !seen.has(data.faGroup || data.id)) errors.push(`${data.name}: Force Allowance ${max} exceeded.`);
        seen.add(data.faGroup || data.id);
        for (const rule of data.rules || []) {
          if (rule.type === "requires" && !rule.soft && count(rule.units) < rule.min) errors.push(`${data.name}: ${rule.text}`);
          if (rule.type === "perPoints" && !(rule.liftedBy && count(rule.liftedBy))) {
            const groupIds = force.units.filter(entry => (entry.rules || []).some(other => other.group === rule.group)).map(entry => entry.id);
            if (count(groupIds) > rule.max*Math.max(1,Math.floor(limit/rule.per))) errors.push(rule.text);
          }
        }
      }
      if (force.advisor) {
        const rule = force.advisor, pool = force.units.filter(entry => entry.advisorPool).map(entry => entry.id);
        const points = keys => selected.filter(entry => [].concat(keys).includes(entry.unitId)).reduce((total,entry) => total+unit(tale,entry).pts,0);
        if (count(pool) && !count(rule.advisor) || count(pool) > rule.max || points([...pool,rule.advisor]) > points(rule.basic)) errors.push("Advisor / Crusader Specialist requirements are not met.");
      }
      if (selected.filter(entry => unit(tale,entry).staff).length > selected.reduce((total,entry) => total+(unit(tale,entry).retinue || 0),0)) errors.push("Staff exceed Retinue capacity.");
      return [...new Set(errors)];
    }
    function start(tale, draft) {
      if (!["muster","supply"].includes(tale.tales.phase)) throw Error("Finish the current Skirmish first.");
      tale.tales.battles = amount(tale.tales.battles)+1;
      const limit = Math.max(1,amount(draft.limit)), ids = draft.deployed || [];
      const errors = patrolErrors(tale,ids,limit); if (errors.length) throw Error(errors.join(" "));
      const cost = ids.reduce((total,id) => total+deploymentCost(tale,requireMember(tale,id)),0);
      spend(tale,"supply",cost); const state = tale.tales;
      if (state.phase === "supply") state.game++;
      const battle = {deployed:[...ids], limit, scenario:String(draft.scenario || "Agreed narrative scenario").slice(0,200), round:1, result:"", primary:0, secondary:0, pluck:0, notes:"", rows:{}, advantages:clone(state.advantages), benefits:[], penalty:state.nextPenalty, squads:[...state.nextSquads]};
      for (const id of ids) { const entry = requireMember(tale,id); battle.rows[id] = {outcome:"ready", damage:0, normal:0, expensive:0, veteran:0, character:0, primary:0, secondary:0, narrative:0, revive:0, jitters:entry.jitters}; entry.jitters = false; }
      alive(tale).forEach(entry => { entry.skip = Math.max(0,entry.skip-1); });
      state.inventory = state.inventory.filter(item => { const rule = R.shop.find(entry => entry.id === item.type); if (rule.temporary || item.type === "map" && ids.includes(item.bearer) && [1,4].includes(item.quality)) { battle.benefits.push(clone(item)); return false; } return true; });
      state.advantages = {}; state.nextPenalty = 0; state.nextSquads = []; state.battle = battle; state.phase = "battle"; delete state.draft;
      log(tale,`Skirmish ${state.game}: ${battle.scenario}, five rounds, ${ids.length} roster entries; mobilization cost ${cost} Supply${state.supply === 0 ? "; all units have -1 Skill while at 0 Supply" : ""}.`);
    }
    function finish(tale) {
      const state = tale.tales, battle = state.battle;
      if (state.phase !== "battle" || !["win","loss","draw"].includes(battle.result)) throw Error("Record the Skirmish result before ending it.");
      battle.pluck = amount(battle.pluck);
      for (const id of battle.deployed) {
        const entry = requireMember(tale,id), row = battle.rows[id], data = unit(tale,entry);
        if (!["ready","gobsmacked","ooa","removed","disabled"].includes(row.outcome)) throw Error("Invalid battle outcome.");
        if (!vehicle(data) && row.outcome === "disabled") throw Error("Only vehicles can be Disabled.");
        row.injured = !vehicle(data) && ["ooa","removed"].includes(row.outcome);
        row.pending = vehicle(data) ? row.outcome === "disabled" : row.injured;
        if (vehicle(data)) { entry.damage = amount(row.damage); entry.disabled = row.outcome === "disabled"; if (entry.disabled && !entry.damage) throw Error("Record maximum damage boxes for a Disabled vehicle."); }
      }
      state.phase = "recovery"; log(tale,`Skirmish ended: ${battle.result}; ${battle.pluck} remaining Pluck for Recovery and Logistics.`);
    }
    function rollRecovery(tale, entry, rolls, reroll = false) {
      const state = tale.tales, row = state.battle.rows[entry.id];
      if (state.phase !== "recovery" || !row?.pending) throw Error("No unresolved recovery for this member.");
      recoveryKey(rolls);
      if (row.roll && !reroll) throw Error("Use a Pluck re-roll to replace this provisional result.");
      if (reroll) { if (vehicle(unit(tale,entry))) throw Error("The PDF only grants Pluck recovery re-rolls to rhyflers; record any agreed vehicle exception in the journal."); if (!row.roll || state.battle.pluck < 1) throw Error("A provisional roll and one remaining Pluck are required."); state.battle.pluck--; }
      row.roll = [...rolls]; log(tale,`${entry.name}: ${reroll ? "Pluck re-roll" : "provisional recovery"} ${rolls.join(" / ")} (${recoveryKey(rolls)}).`);
    }
    function confirmRecovery(tale, entry, choice, auto = false, weaponCount = 1) {
      const state = tale.tales, row = state.battle.rows[entry.id], data = unit(tale,entry);
      if (state.phase !== "recovery" || !row?.pending) throw Error("No pending recovery.");
      if (auto) { if (vehicle(data) || !state.battle.advantages.recover) throw Error("No automatic-recovery advantage available for this rhyfler."); state.battle.advantages.recover--; row.pending = false; row.injured = false; log(tale,`${entry.name}: automatic-recovery advantage used.`); return; }
      const key = recoveryKey(row.roll), kind = vehicle(data) ? "vehicle" : row.forceFodder || entry.role === "fodder" ? "fodder" : "character";
      if (key === "66" && kind !== "vehicle") {
        if (entry.role === "fodder") {
          if (!eligible(data)) throw Error("This entry cannot become a Character. Agree a recovery exception and record it through Journal adjustments.");
          if (characters(tale).filter(other => other.role === "character").length >= characterLimit(tale)) throw Error("Character slots are full. Agree and record a recovery exception using Journal adjustments.");
          entry.role = "character";
        }
        if (!["skill","toughness","other"].includes(choice)) throw Error("Choose the free attribute advance.");
        if (choice === "other") { if (!entry.notes.trim()) throw Error("Record the agreed attribute change and maximum in the member's notes first."); log(tale,`${entry.name}: agreed attribute increase recorded in roster notes.`); }
        else advance(tale,entry,choice,true);
      }
      if (kind === "fodder") {
        if (key === "6-") state.xp += 25;
        if (key === "61") entry.skip = 1;
        if (["1-","11"].includes(key)) entry.status = "dead";
        if (key === "11") { if (!entry.squad.trim()) throw Error("Assign a squad name before confirming the squad-wide penalty."); if (!state.nextSquads.includes(entry.squad)) state.nextSquads.push(entry.squad); }
      } else if (kind === "character") {
        if (key === "6-") entry.jitters = true;
        if (key === "61") entry.skip = 1;
        if (key === "--") entry.injuries.push({text:"Character injury: -1 Skill / -1 MA", sk:-1, t:0, ma:-1});
        if (key === "1-") entry.injuries.push({text:"Character injury: -2 Toughness / -2 MA", sk:0, t:-2, ma:-2});
        if (key === "11") { entry.status = "dead"; state.nextPenalty = 1; }
      } else {
        if (key === "66") { entry.damage = 0; entry.disabled = false; }
        if (key === "--") entry.injuries.push({text:"Vehicle recovery: -1 to each MA value", sk:0, t:0, ma:-1});
        if (key === "1-") { entry.lostWeapons++; if (entry.lostWeapons >= Math.max(1,amount(weaponCount))) entry.status = "dead"; }
        if (key === "11") entry.status = "dead";
        if (key === "61") {
          const target = requireMember(tale,choice), targetRow = state.battle.rows[target.id];
          if (!targetRow || target.id === entry.id || vehicle(unit(tale,target)) || targetRow.injured || targetRow.pending || target.status !== "active") throw Error("Choose another uninjured participating rhyfler for the recovery accident.");
          targetRow.injured = true; targetRow.pending = true; targetRow.forceFodder = true; delete targetRow.roll;
        }
      }
      if (entry.status !== "active") state.inventory = state.inventory.filter(item => item.bearer !== entry.id);
      row.pending = false; row.recovery = key; log(tale,`${entry.name}: confirmed ${kind} recovery ${key}. ${R.recovery[kind].find(rule => rule[0] === key)[1]}`);
    }
    function characterXP(row) {
      const kills = amount(row.normal)+amount(row.expensive);
      if (amount(row.veteran) > kills || amount(row.character) > kills) throw Error("Veteran/Character bonuses cannot exceed total incapacitations.");
      return amount(row.normal)*25+amount(row.expensive)*50+amount(row.veteran)*25+amount(row.character)*25+amount(row.primary)*50+amount(row.secondary)*25+amount(row.narrative)*10+amount(row.revive)*10;
    }
    function awardXP(tale) {
      const state = tale.tales, battle = state.battle;
      if (state.phase !== "experience" || battle.xpAwarded) throw Error("Battle XP is not ready or has already been recorded.");
      for (const id of battle.deployed) { const entry = requireMember(tale,id); if (entry.role !== "fodder") { const xp = characterXP(battle.rows[id]); entry.xp += xp; log(tale,`${entry.name}: +${xp} Character XP.`); } }
      const xp = (battle.result === "win" ? 25 : battle.result === "loss" ? 10 : 0)+amount(battle.primary,1)*25+amount(battle.secondary)*10;
      state.xp += xp; battle.xpAwarded = true; log(tale,`Force earned ${xp} XP for result and objectives.`);
    }
    const logisticsCount = tale => tale.tales.battle.deployed.filter(id => { const entry = requireMember(tale,id), row = tale.tales.battle.rows[id]; return entry.role !== "fodder" && entry.status === "active" && !row.injured; }).length+(tale.tales.battle.result === "win" ? 1 : 0);
    function logisticsAllowance(tale) {
      const battle = tale.tales.battle;
      return (tale.tales.tunnels ? 1 : 0)+tale.tales.inventory.filter(item => item.type === "map" && battle.deployed.includes(item.bearer) && requireMember(tale,item.bearer).status === "active" && !battle.rows[item.bearer].injured).reduce((total,item) => total+(item.quality === 5 ? 3 : [2,3,6].includes(item.quality) ? 1 : 0),0);
    }
    function rollLogistics(tale, rolls) {
      const state = tale.tales, battle = state.battle;
      if (state.phase !== "logistics" || battle.logistics) throw Error("Logistics are not ready, or dice have already been rolled.");
      if (rolls.length !== logisticsCount(tale) || rolls.some(result => !Number.isInteger(result) || result < 1 || result > 6)) throw Error("Enter one D6 per eligible Character, plus one for victory.");
      battle.logistics = {rolls:[...rolls], kept:rolls.map((result,index) => index < 6 ? index : -1).filter(index => index >= 0), free:logisticsAllowance(tale)};
    }
    function rerollLogistics(tale, index, result) {
      const state = tale.tales, battle = state.battle, search = battle.logistics;
      if (state.phase !== "logistics" || !search || !Number.isInteger(index) || index < 0 || index >= search.rolls.length || !Number.isInteger(result) || result < 1 || result > 6) throw Error("Choose a Logistics die and a result from 1 to 6.");
      if (search.free > 0) search.free--; else { if (!battle.pluck) throw Error("No map/tunnel re-rolls or remaining Pluck."); battle.pluck--; }
      search.rolls[index] = result; log(tale,`Logistics die ${index+1} re-rolled to ${result}.`);
    }
    function resolveLogistics(tale, encounterKey) {
      const state = tale.tales, battle = state.battle, search = battle.logistics;
      if (state.phase !== "logistics" || !search || search.kept.length !== Math.min(6,search.rolls.length) || new Set(search.kept).size !== search.kept.length || search.kept.some(index => !Number.isInteger(index) || index < 0 || index >= search.rolls.length)) throw Error("Keep exactly six dice, or all dice if fewer than six were rolled.");
      const rolls = search.kept.map(index => search.rolls[index]), options = matches(rolls), encounter = options.find(entry => `${entry.size}-${entry.face}` === encounterKey);
      if (options.length && !encounter) throw Error("Choose one qualifying encounter.");
      const found = supplies(rolls.reduce((total,result) => total+result,0)); state.supply += found; search.encounter = encounter ? `${encounter.size}-${encounter.face}` : "";
      state.inventory = state.inventory.filter(item => !(item.type === "map" && battle.deployed.includes(item.bearer) && [2,3,5].includes(item.quality))); state.phase = encounter ? "encounter" : "supply";
      log(tale,`Logistics: kept ${rolls.join(", ") || "no dice"}; +${found} Supply${encounter ? "; encounter: "+encounter.name : "; no encounter"}.`);
    }
    function addItem(tale, type, bearer = "", quality = die()) {
      const rule = R.shop.find(entry => entry.id === type); if (!rule) throw Error("Unknown Supply item.");
      if (tale.tales.inventory.length >= 300) throw Error("Inventory is full.");
      if (rule.max && tale.tales.inventory.filter(item => item.type === type).length >= rule.max) throw Error("This Defense is already at its next-Skirmish limit.");
      if (["map","charm","helmet","lantern"].includes(type)) {
        const entry = requireMember(tale,bearer); if (entry.role === "fodder" || entry.status !== "active") throw Error("Assign equipment to a living Character.");
        if (type === "charm" && tale.tales.inventory.some(item => item.type === type && item.bearer === bearer)) throw Error("A Character can equip only one Lucky Charm.");
      }
      const item = {id:uid(), type, bearer, quality:type === "map" ? Math.max(1,Math.min(6,amount(quality))) : 0, earned:tale.tales.game}; tale.tales.inventory.push(item);
      log(tale,`${rule.name}${item.quality ? " ("+R.mapQualities[item.quality-1]+")" : ""} added${bearer ? " for "+requireMember(tale,bearer).name : ""}.`); return item;
    }
    function buy(tale, type, bearer) { between(tale); const rule = R.shop.find(entry => entry.id === type); if (!rule) throw Error("Choose a Supply item."); spend(tale,"supply",rule.cost); addItem(tale,type,bearer); const added = tale.tales.inventory[tale.tales.inventory.length-1]; if (added) added.bought = {win:amount(tale.tales.battles), cost:rule.cost}; log(tale,`Spent ${rule.cost} Supply on ${rule.name}.`); }
    // Undo recruits, Supply purchases and Force XP advantages with a full refund (site owner's request, 5 Nov):
    // only things added since the last Skirmish started, while recruiting/buying is open.
    const win = tale => amount(tale.tales.battles);
    const dismissable = (tale, unitId) => ["muster","supply","encounter"].includes(tale.tales.phase) ? tale.chars.filter(entry => entry.unitId === unitId && entry.status === "active" && entry.fresh && entry.fresh.win === win(tale)) : [];
    function dismiss(tale, unitId) {
      const list = dismissable(tale, unitId), entry = list[list.length-1];
      if (!entry) throw Error("Only recruits added since the last Skirmish can be removed for a refund. Use Retire / dismiss for the others.");
      tale.chars.splice(tale.chars.indexOf(entry),1); tale.tales.supply += amount(entry.fresh.paid);
      tale.tales.inventory = tale.tales.inventory.filter(item => item.bearer !== entry.id || (item.bearer = "", true));
      if (tale.tales.draft) tale.tales.draft.deployed = (tale.tales.draft.deployed || []).filter(id => id !== entry.id);
      log(tale,`Removed recruit ${entry.name}; refunded ${amount(entry.fresh.paid)} Supply.`);
    }
    const sellable = (tale, type) => ["muster","supply","encounter"].includes(tale.tales.phase) ? tale.tales.inventory.filter(item => item.type === type && item.bought && item.bought.win === win(tale)) : [];
    function sell(tale, type) {
      const list = sellable(tale, type), item = list[list.length-1], rule = R.shop.find(entry => entry.id === type);
      if (!item) throw Error("Only items bought since the last Skirmish can be returned.");
      tale.tales.inventory.splice(tale.tales.inventory.indexOf(item),1); tale.tales.supply += amount(item.bought.cost);
      log(tale,`Returned ${rule ? rule.name : "item"}; refunded ${amount(item.bought.cost)} Supply.`);
    }
    const refundable = (tale, id) => { const b = tale.tales.advBought; return ["experience","supply","muster"].includes(tale.tales.phase) && b && b.win === win(tale) ? amount(b.ids?.[id]) : 0; };
    function refundAdvantage(tale, id) {
      const rule = R.advantages.find(entry => entry.id === id); if (!rule || !refundable(tale,id) || !tale.tales.advantages[id]) throw Error("Only advantages bought since the last Skirmish can be refunded.");
      tale.tales.advantages[id]--; tale.tales.advBought.ids[id]--; tale.tales.xp += rule.cost; log(tale,`Refunded ${rule.name}: +${rule.cost} Force XP.`);
    }
    function advantage(tale, id) {
      if (!["experience","supply","muster"].includes(tale.tales.phase)) throw Error("Buy advantages before the next Skirmish.");
      const rule = R.advantages.find(entry => entry.id === id); if (!rule) throw Error("Choose a Force advantage.");
      if (rule.max && (tale.tales.advantages[id] || 0) >= rule.max) throw Error("This advantage is at its next-battle limit.");
      spend(tale,"xp",rule.cost); tale.tales.advantages[id] = (tale.tales.advantages[id] || 0)+1;
      if (!tale.tales.advBought || tale.tales.advBought.win !== amount(tale.tales.battles)) tale.tales.advBought = {win:amount(tale.tales.battles), ids:{}};
      tale.tales.advBought.ids[id] = amount(tale.tales.advBought.ids[id])+1; log(tale,`Bought ${rule.name} for ${rule.cost} Force XP.`);
    }
    function profile(tale, entry, data) {
      const penalties = entry.injuries.reduce((total,injury) => ({sk:total.sk+injury.sk, t:total.t+injury.t, ma:total.ma+injury.ma}),{sk:0,t:0,ma:0});
      const battle = tale.tales.phase === "battle" ? tale.tales.battle : null;
      const temporary = (tale.tales.supply === 0 ? 1 : 0)+(battle ? battle.penalty+(battle.squads.includes(entry.squad) ? 1 : 0) : tale.tales.nextPenalty+(tale.tales.nextSquads.includes(entry.squad) ? 1 : 0));
      return {...data, sk:Number.isFinite(data.sk) ? data.sk+entry.advances.skill+penalties.sk-temporary : null, t:Number.isFinite(data.t) ? data.t+entry.advances.toughness+penalties.t : null, ma:String(data.ma || "-").replace(/\d+/g,value => String(Math.max(0,Number(value)+penalties.ma)))};
    }
    return {dismiss, dismissable, sell, sellable, refundAdvantage, refundable, normalize, create, unit, faction, alive, characters, value, characterLimit, log, requireMember, recruit, setRole, spend, advance, deploymentCost, patrolErrors, between, start, finish, rollRecovery, confirmRecovery, characterXP, awardXP, logisticsCount, rollLogistics, rerollLogistics, resolveLogistics, addItem, buy, advantage, profile};
  }
  function create(context) {
    const E = createEngine(context.getData), esc = context.esc;
    let current = null, tab = "cycle", deleting = null;
    const view = () => document.getElementById("view-narr");
    const tales = () => context.getStories().filter(entry => entry.system === "quar-tales");
    const story = () => tales().find(entry => entry.id === current);
    const save = tale => { tale.updated = Date.now(); context.save(); };
    const PRIMARY = new Set(["create","start","finish","recovery-confirm","to-experience","to-logistics","log-resolve","encounter-done","recruit"]), DANGER = new Set(["delete","retire"]);
    const button = (action,text,attrs = "",disabled = false) => `<button type="button" class="btn ${PRIMARY.has(action) ? "cta" : DANGER.has(action) ? "danger" : "ghost"}" data-tales="${action}" ${attrs}${disabled ? " disabled" : ""}>${text}</button>`;
    const savedTab = id => { try{ return localStorage.getItem("quar-narr-tab|" + id); }catch(e){ return null; } };
    const keepTab = (id, value) => { try{ localStorage.setItem("quar-narr-tab|" + id, value); }catch(e){} };
    const ui = context.ui, tile = (label,value) => `<div class="gt"><small>${ui.stl ? ui.stl(label) : label}</small><b>${esc(value)}</b></div>`;
    const panel = (title,text) => `<section class="card cp-panel"><header><h2>${title}</h2></header><div class="cp-body">${text}</div></section>`;
    const options = (values,selected) => values.map(([key,text]) => `<option value="${esc(key)}"${String(key) === String(selected) ? " selected" : ""}>${esc(text)}</option>`).join("");
    const select = (text,values,selected,attrs = "") => `<label>${text}<select ${attrs}>${options(values,selected)}</select></label>`;
    const input = (text,value,attrs = "") => `<label>${text}<input value="${esc(value)}" ${attrs}></label>`;
    const numeric = (text,value,attrs = "",max = 999999) => input(text,value,`type="number" min="0" max="${max}" step="1" ${attrs}`);
    const chooseMember = (tale,id,attrs = "",choices = E.alive(tale)) => select("Roster member",[["","Choose a member"],...choices.map(entry => [entry.id,entry.name])],id,attrs);
    const idAttr = entry => `data-member="${esc(entry.id)}"`;
    const get = id => document.getElementById(id)?.value || "";
    const checkpoint = tale => { const snapshot = clone(tale); delete snapshot.tales.undo; tale.tales.undo = snapshot; };
    const draft = tale => tale.tales.draft ||= {limit:600,scenario:"",deployed:[]}; // Patrol limit per Skirmish defaults to 600 (site owner, 5 Nov)
    function change(action) {
      const tale = story(); if (!tale) return; const before = clone(tale);
      try { checkpoint(tale); action(tale); save(tale); render(tale.id); }
      catch (error) { Object.keys(tale).forEach(key => delete tale[key]); Object.assign(tale,before); render(tale.id); context.toast(error.message || String(error)); }
    }
    function render(id) {
      const tale = tales().find(entry => entry.id === id);
      if (current !== id) { current = id; const t = current && savedTab(current); tab = ["cycle","roster","supply","journal","rules"].includes(t) ? t : "cycle"; }
      if (!tale) { current = null; renderList(); return; }
      try { E.normalize(tale); } catch (error) { view().innerHTML = panel("Quar Tales unavailable",`<p>${esc(error.message)}</p><a href="#/narrative/quar-tales" data-go="#/narrative/quar-tales">All Tales</a>`); return; }
      const state = tale.tales, faction = E.faction(tale);
      document.body.style.setProperty("--fac",faction.color || "#6b5d45");
      view().innerHTML = `<div class="cp qt">${ui.head(esc(tale.name),`<a class="btn ghost" href="#/narrative/quar-tales" data-go="#/narrative/quar-tales">&larr; Quar Tales</a>${button("undo",'<span class="cp-ul">Undo last action</span><span class="cp-us" aria-hidden="true">&#8630; Undo</span>',"",!state.undo)}`)}<div class="cp-hero"><div class="cp-hero-flag">${context.flag(faction)}</div><div class="cp-hero-txt"><span class="cp-kicker">Quar Tales &middot; Skirmish ${state.game}</span><h2>${esc(faction.name)}</h2><p>Force pool${tale.from ? " &middot; copied from "+esc(tale.from) : ""}</p></div><div class="cp-metrics"><div><strong>${E.value(tale)} / ${state.limit}</strong><span>Force points</span></div><div><strong>${state.supply}</strong><span>Supply</span></div><div><strong>${state.xp}</strong><span>Force XP</span></div><div><strong>${E.characters(tale).length}</strong><span>Characters incl. Leader</span></div></div>${state.supply === 0 ? '<p class="cp-notice">Out of Supply: every unit in the Force has -1 Skill until Supply is gained.</p>' : ""}</div><nav class="cp-tabs" aria-label="Quar Tales pages">${[["cycle","Skirmish cycle"],["roster","Force roster"],["supply","Supply"],["journal","Journal"],["rules","Rules"]].map(([key,text]) => button("tab",text,`data-tab="${key}" aria-pressed="${tab === key}"`)).join("")}</nav>${tab === "cycle" ? cycle(tale) : tab === "roster" ? roster(tale) + ui.mbar(`<span class="cp-mb-k">Force</span> <b>${E.value(tale)} / ${tale.tales.limit} pts</b> <span class="cp-mb-sep">&middot;</span> <span class="cp-mb-k">Supply</span> <b>${tale.tales.supply}</b>`, [["cp-yours","View Force"]], {value:E.value(tale), max:tale.tales.limit}) : tab === "supply" ? shop(tale) : tab === "journal" ? journal(tale) : panel("Quar Tales rules",rules())}</div>`;
    }
    function renderList() {
      document.body.style.removeProperty("--fac");
      const saved = context.getPatrols().filter(entry => context.faction(entry.faction));
      const setup = `<section class="card cp-panel cp-create" id="qt-create"><header><h2>New Tale</h2></header><div class="cp-body">
        <div class="cp-create-main">
          <div class="cp-create-hero"><span class="cp-create-flag"></span><div><strong class="cp-create-faction"></strong><span class="cp-create-summary">600 pts Force pool</span></div></div>
          <div class="cp-create-fields"><div class="cp-create-name">${input("Tale name","",'id="qt-name" maxlength="60" placeholder="The road through Alwyd"')}</div>
            ${select("Faction",context.getData().factions.map(entry => [entry.id,entry.name]),"",'id="qt-faction" data-facpick')}
            <div class="cp-create-limit">${numeric("Force limit (600-1000)",600,'id="qt-limit"',1000)}</div></div>
          ${button("create","Begin Quar Tales")}
        </div>
        <div class="cp-create-source">${select("Starting Force",[["","Fresh Force pool"],...saved.map(entry => [entry.id,entry.name || "Unnamed patrol"])],"",'id="qt-patrol"')}<p class="hint">A copied patrol sets the faction and never changes your normal patrol. Add the rest of the starting Force for free before your first Skirmish.</p></div>
      </div></section>`;
      view().innerHTML = `<div class="cp qt">${ui.head("Quar Tales",'<a class="btn ghost" href="#/narrative" data-go="#/narrative">&larr; Narrative</a>')}${ui.credit("tales")}${ui.warn()}${ui.tip("narr-qt","How Quar Tales works","The Long War, told by your own Force. Muster a 600–1000-point Force pool and pick one Patrol from it for each five-round Skirmish. Start with 2 Supply; name one Leader and up to one other Character per 100 Force points.")}${setup}${panel("Your Tales",tales().length ? `<div class="cp-list cp-recs">${[...tales()].sort((left,right) => right.updated-left.updated).map(entry => `<article><span class="cp-rec-flag">${context.flag(context.faction(entry.faction))}</span><div><h3>${esc(entry.name)}</h3><p class="cp-rec-meta">${esc(context.faction(entry.faction)?.name || "Unknown faction")} &middot; Skirmish ${amount(entry.tales?.game)} &middot; ${esc(entry.tales?.phase || "muster")}</p></div><a class="btn ghost" href="#/narrative/${esc(entry.id)}" data-go="#/narrative/${esc(entry.id)}">Open</a>${button("delete",deleting === entry.id ? "Confirm delete" : "Delete",`data-id="${esc(entry.id)}"`)}</article>`).join("")}</div>` : '<p class="hint">No Tales yet. Begin a Force above.</p>')}${ui.fold("qt-manual","<b>Quar Tales rules reference</b>",rules())}</div>`;
      const form = document.getElementById("qt-create");
      const sync = () => {
        const factionInput = document.getElementById("qt-faction");
        const patrol = context.getPatrols().find(entry => entry.id === document.getElementById("qt-patrol").value);
        if (patrol) factionInput.value = patrol.faction;
        const faction = context.faction(factionInput.value);
        form.style.setProperty("--fac", faction?.color || "#6b5d45");
        form.querySelector(".cp-create-flag").innerHTML = faction ? context.flag(faction) : "";
        form.querySelector(".cp-create-faction").textContent = faction?.name || "Choose a faction";
        form.querySelector(".cp-create-summary").textContent = `${document.getElementById("qt-limit").value || 600} pts Force pool`;
        form.querySelectorAll(".nfpick").forEach(picker => picker._sync?.());
      };
      form.addEventListener("change", sync);
      sync();
    }
    function cycle(tale) {
      const state = tale.tales, stages = [["muster","Muster"],["battle","Skirmish"],["recovery","Recovery"],["experience","Experience"],["logistics","Logistics"],["encounter","Encounter"],["supply","Supply"]];
      const steps = `<ol class="cp-steps">${stages.map(([key,text],index) => `<li${state.phase === key ? ' aria-current="step"' : ""}><span>${index+1}</span>${text}</li>`).join("")}</ol>`;
      if (["muster","supply"].includes(state.phase)) {
        const setup = draft(tale), chosen = E.alive(tale).filter(entry => setup.deployed.includes(entry.id));
        const cost = chosen.reduce((total,entry) => total+E.deploymentCost(tale,entry),0), points = chosen.reduce((total,entry) => total+E.unit(tale,entry).pts,0);
        const errors = E.patrolErrors(tale,chosen.map(entry => entry.id),setup.limit);
        return steps+panel("Prepare the next Skirmish",`<p>Recruit and name your Force on <b>Force roster</b>; assign the Leader and Characters. Visit <b>Supply & advantages</b> to prepare equipment and temporary benefits.</p><div class="cp-form">${numeric("Agreed Patrol points limit",setup.limit,'data-draft="limit"')}${input("Agreed scenario / mission",setup.scenario,'data-draft="scenario" maxlength="200"')}</div>${(() => { const can = E.alive(tale).filter(entry => !entry.skip && !entry.disabled && !entry.damage), on = can.filter(entry => setup.deployed.includes(entry.id)).length; return `<div class="cp-live"><span class="gstep"><span class="gsl">Patrol points</span><b class="cp-live-n">${points} / ${amount(setup.limit)}</b></span><span class="gstep"><span class="gsl">Mobilize cost</span><b class="cp-live-n">${cost} / ${state.supply} Supply</b></span><span class="gstep"><span class="gsl">Deploying</span><b class="cp-live-n">${on} / ${can.length}</b></span><span class="cp-live-x">${button("deploy-all","Select all","",on === can.length)}${button("deploy-none","Select none","",!on)}</span></div>`; })()}<div class="cp-list">${E.alive(tale).map(entry => { const fee = E.deploymentCost(tale,entry); return `<article><div><label class="qt-check"><input type="checkbox" data-deploy="${esc(entry.id)}"${setup.deployed.includes(entry.id) ? " checked" : ""}${entry.skip || entry.disabled || entry.damage ? " disabled" : ""}>${esc(entry.name)} &middot; ${esc(entry.role)} <span class="cp-pill">${E.unit(tale,entry).pts} pts</span> <span class="cp-pill${fee ? "" : " free"}">${fee ? fee + " Supply" : "Free"}</span></label><p class="hint">${esc(label(E.unit(tale,entry)))}${entry.skip ? " - must miss this Skirmish" : ""}${entry.damage || entry.disabled ? " - repair before deploying" : ""}</p></div></article>`; }).join("") || '<p class="hint">Add units on Force roster first.</p>'}</div>${errors.length ? `<ul class="cp-notice">${errors.map(error => `<li>${esc(error)}</li>`).join("")}</ul>` : ""}<p class="hint">Patrol points, Force Allowance, faction dependencies and Character limits are checked before deployment. Supply is charged only when the Skirmish starts.</p>${button("start","Begin five-round Skirmish","",errors.length > 0 || cost > state.supply)}`);
      }
      if (state.phase === "battle") return steps+battle(tale);
      if (state.phase === "recovery") return steps+recovery(tale);
      if (state.phase === "experience") return steps+experience(tale);
      if (state.phase === "logistics") return steps+logistics(tale);
      const encounter = R.encounters.find(entry => `${entry.size}-${entry.face}` === state.battle.logistics.encounter);
      return steps+panel("Resolve the encounter",`<h3>${esc(encounter?.name || "Encounter")}</h3><p>${esc(encounter?.text || "")}</p><p class="hint">PDF p. ${encounter?.page || "-"}. Resolve checks, choices and follow-up dice at the table. Record rewards and effects below or on the roster, then finish this encounter. Only uninjured participating Characters are eligible.</p><p>Eligible Characters: ${state.battle.deployed.map(id => E.requireMember(tale,id)).filter(entry => entry.role !== "fodder" && entry.status === "active" && !state.battle.rows[entry.id].injured).map(entry => esc(entry.name)).join(", ") || "None"}</p>${adjustments(tale)}${button("encounter-done","Encounter resolved - continue to Supply")}`);
    }
    function battle(tale) {
      const state = tale.tales, session = state.battle, fac = E.faction(tale);
      const benefits = session.benefits.map(item => { const rule = R.shop.find(entry => entry.id === item.type); return `<li>${esc(rule.name)}${item.quality ? " - "+esc(R.mapQualities[item.quality-1]) : ""}: ${esc(rule.text)}</li>`; }).join("");
      const stepper = (text, attrs, value, min = 0, max = 99) => `<label class="gstep"><span class="gsl">${text}</span><input aria-label="${esc(text)}" value="${esc(value)}" type="number" min="${min}" max="${max}" step="1" inputmode="numeric" data-stepper ${attrs}></label>`;
      const out = session.deployed.filter(id => ["ooa","removed","disabled"].includes(session.rows[id].outcome)).length;
      const live = `<div class="cp-live" style="--fac:${esc(fac.color || "")}">${stepper("Round of 5",'data-battle="round"',session.round,1,5)}${stepper("Pluck left",'data-battle="pluck"',session.pluck,0,99)}${stepper("Primary done (0/1)",'data-battle="primary"',session.primary,0,1)}${stepper("Secondaries",'data-battle="secondary"',session.secondary,0,20)}<span class="gstep"><span class="gsl">Out</span><b class="cp-live-n">${out} / ${session.deployed.length}</b></span><span class="cp-live-x">${session.round < 5 ? button("next-round",`Next: round ${session.round + 1} &rarr;`) : ""}</span></div>${session.round >= 5 ? '<p class="cp-notice"><b>Final round.</b> When round 5 ends, the Skirmish is over: record the result below and end it.</p>' : ""}`;
      const deeds = [["normal","Kills"],["expensive","Pricier kills"],["veteran","Veterans downed"],["character","Characters downed"],["narrative","Narrative goals"],["revive","Revived"]];
      const rows = session.deployed.map(id => { const entry = E.requireMember(tale,id), row = session.rows[id], data = E.unit(tale,entry), profiles = data.profiles || [data.vehicle || data.crew || {}];
        const tiles = profiles.map(base => { const profile = E.profile(tale,entry,base); return `<div class="gtiles">${profiles.length > 1 && base.label ? `<span class="gtlab">${esc(base.label)}</span>` : ""}${tile("Sk",profile.sk ?? "-")}${tile("Mt",base.mt || "-")}${tile("MA",profile.ma)}${tile("T",profile.t ?? "-")}</div>`; }).join("");
        return `<article class="cp-brow${["ooa","removed","disabled"].includes(row.outcome) ? " is-out" : ""}"><div class="cp-brow-top"><div class="cp-brow-who"><strong>${esc(entry.name)}</strong><span class="hint">${esc(entry.role)} &middot; ${esc(label(data))}${row.jitters ? " - starts Gobsmacked; Recover gives no Pluck" : ""}</span></div>${tiles}</div><select aria-label="Status of ${esc(entry.name)}" data-row="outcome" ${idAttr(entry)} data-seg="tone">${options([["ready","Ready"],["gobsmacked","Gobsmacked"],["ooa","Out of action"],["removed","Removed"],...(vehicle(data) ? [["disabled","Disabled"]] : [])],row.outcome)}</select>${vehicle(data) ? `<div class="cp-brow-rec">${stepper("Damage boxes",`data-row="damage" ${idAttr(entry)}`,row.damage,0,30)}</div>` : ""}${entry.role !== "fodder" ? `<div class="cp-brow-rec">${deeds.map(([key,text]) => stepper(text,`data-row="${key}" ${idAttr(entry)}`,row[key],0,50)).join("")}</div>` : ""}<details class="cp-kit"><summary>Weapons & rules</summary><div class="cp-kitbody">${ui.weapons(tale.faction,data)}<p><b>Abilities:</b> ${ui.tips(tale.faction,[...(data.abilities || []),...(data.profiles?.[0]?.abilities || [])]) || "None"}</p>${ui.rules(tale.faction,data)}</div></details></article>`; }).join("");
      return panel("Five-round Skirmish",`<h3>${esc(session.scenario)}</h3>${live}${session.penalty ? '<p class="cp-notice">Patrol -1 Skill from a Character death last Skirmish (non-stacking).</p>' : ""}${session.squads.length ? `<p class="cp-notice">Squad -1 Skill: ${session.squads.map(esc).join(", ")} (including replacements).</p>` : ""}${benefits ? `<details class="cp-mission"><summary>Prepared benefits this Skirmish</summary><ul>${benefits}</ul></details>` : ""}<details class="cp-mission"><summary>Force advantages this Skirmish</summary>${R.advantages.map(rule => `<p>${esc(rule.name)}: ${amount(session.advantages[rule.id])} ${rule.id !== "recover" ? button("use-advantage","Use one",`data-type="${rule.id}"`,!session.advantages[rule.id]) : "(use during Recovery)"}</p>`).join("")}</details><h3>Your Patrol</h3><p class="hint">Tap a status as it happens. Count each Character's deeds as you go; they carry over to the Experience step, where you can still change them.</p><div class="cp-list">${rows}</div><div class="cp-form"><label>Outcome<select aria-label="Outcome" data-battle="result" data-seg="tone">${options([["","Choose result"],["win","Won"],["loss","Lost"],["draw","Draw"]],session.result)}</select></label></div><p class="hint">A draw gives no printed result XP.</p><label>Battle notes<textarea data-battle="notes" maxlength="4000">${esc(session.notes)}</textarea></label>${button("finish","End Skirmish - resolve Recovery","",!session.result)}`);
    }
    function recovery(tale) {
      const state = tale.tales, session = state.battle, pending = session.deployed.filter(id => session.rows[id].pending);
      return panel("Recovery & injuries",`<p>${session.pluck} remaining Pluck. Roll two D6 or enter physical dice. Results remain provisional until confirmed; replacing a rhyfler result costs 1 Pluck. The PDF grants no Pluck re-roll for vehicle recovery. Gobsmacked units recover automatically. Vehicles must be fully repaired before deploying again.</p>${pending.map(id => {
        const entry = E.requireMember(tale,id), row = session.rows[id], data = E.unit(tale,entry), kind = vehicle(data) ? "vehicle" : row.forceFodder || entry.role === "fodder" ? "fodder" : "character", key = row.roll ? recoveryKey(row.roll) : "";
        return `<section class="cp-casualty"><h3>${esc(entry.name)} - ${kind}</h3><p>${key ? esc(R.recovery[kind].find(rule => rule[0] === key)[1]) : "Not rolled yet"}</p><div class="cp-form">${numeric("Die 1",row.roll?.[0] || 1,`id="qt-d1-${esc(id)}"`,6)}${numeric("Die 2",row.roll?.[1] || 1,`id="qt-d2-${esc(id)}"`,6)}${kind !== "vehicle" ? select("Free attribute on 6/6",[["skill","Skill +1 (maximum +2)"],["toughness","Toughness +1 (maximum +1)"],["other","Other agreed attribute (record in member notes)"]],"skill",`id="qt-choice-${esc(id)}"`) : chooseMember(tale,"",`id="qt-choice-${esc(id)}"`,session.deployed.map(other => E.requireMember(tale,other)).filter(other => other.id !== id && !vehicle(E.unit(tale,other)) && !session.rows[other.id].injured && other.status === "active"))}${vehicle(data) ? numeric("Total original main / integral weapons",Math.max(1,data.weapons?.length || 1),`id="qt-weapons-${esc(id)}"`,30) : ""}</div><div class="cp-actions">${button("recovery-roll",row.roll ? "Re-roll result (1 Pluck)" : "Roll 2D6",idAttr(entry),!!row.roll && (!session.pluck || vehicle(data)))}${button("recovery-manual",row.roll ? "Use entered re-roll (1 Pluck)" : "Use entered dice",idAttr(entry),!!row.roll && (!session.pluck || vehicle(data)))}${button("recovery-confirm","Confirm result",idAttr(entry),!row.roll)}${!vehicle(data) ? button("auto-recover","Use automatic-recovery advantage",idAttr(entry),!session.advantages.recover) : ""}</div><p class="hint">Vehicle 6/1: select the uninjured participating rhyfler. Fodder 1/1: assign their squad on Force roster before confirming. For a source ambiguity, record an agreed recovery exception through Journal adjustments.</p></section>`;
      }).join("") || '<p class="cp-notice">All recoveries resolved.</p>'}${button("to-experience",state.recoveryReturn === "encounter" ? "Return to encounter" : "Continue to Experience","",pending.length > 0)}`);
    }
    function experience(tale) {
      const state = tale.tales, session = state.battle;
      const deeds = [["normal","Ordinary enemy incapacitations (25 each)"],["expensive","More-expensive enemy incapacitations (50 each, not also ordinary)"],["veteran","Incapacitations of Veterans (+25 each)"],["character","Incapacitations of Characters (+25 each)"],["primary","Primary objectives (50 each)"],["secondary","Secondary objectives (25 each)"],["narrative","Narrative objectives (10 each)"],["revive","Rhyflers revived (10 each)"]];
      return panel("Character & Force XP", `${ui.tip("qt-character-force-xp", "How this works", "Unspent XP carries forward. Character XP buys that Character's advances; Force XP buys next-battle advantages.")}<p>Force result: ${esc(session.result)}; primary ${amount(session.primary,1)}, secondary ${amount(session.secondary)}. Result XP: ${session.result === "win" ? 25 : session.result === "loss" ? 10 : 0}, plus 25 for the primary and 10 per secondary.</p>${session.deployed.map(id => E.requireMember(tale,id)).filter(entry => entry.role !== "fodder").map(entry => `<details class="cp-mission" open><summary>${esc(entry.name)} - ${entry.xp} available Character XP</summary><div class="cp-form">${deeds.map(([key,text]) => numeric(text,session.rows[entry.id][key],`data-row="${key}" ${idAttr(entry)}${session.xpAwarded ? " disabled" : ""}`)).join("")}</div></details>`).join("")}${button("award-xp",session.xpAwarded ? "Battle XP recorded" : "Record battle XP","",!!session.xpAwarded)}<p>Buy advances on <b>Force roster</b> and next-battle advantages on <b>Supply & advantages</b>.</p>${button("to-logistics","Continue to Logistics","",!session.xpAwarded)}`);
    }
    function logistics(tale) {
      const state = tale.tales, session = state.battle, search = session.logistics;
      if (!search) return panel("Logistics",`<p>One D6 per uninjured participating Character (including the Leader), plus one for victory: <b>${E.logisticsCount(tale)} dice</b>. If seven or more, roll all and keep six. With no dice, gain no Supply or encounter.</p><label>Physical dice (space or comma separated)<input id="qt-log-dice" placeholder="For example: 2 3 3 6"></label><div class="cp-actions">${button("log-roll","Roll Logistics dice")}${button("log-manual","Use physical dice")}</div>`);
      const rolls = search.kept.map(index => search.rolls[index]), encounters = matches(rolls), total = rolls.reduce((result,value) => result+value,0);
      return panel("Logistics dice & encounter",`<p>Keep ${Math.min(6,search.rolls.length)} dice. Kept total ${total}: <b>${supplies(total)} Supply</b>. Re-rolls: ${search.free} map/tunnel; ${session.pluck} Pluck. Free re-rolls are used first.</p><div class="qt-log-dice">${search.rolls.map((result,index) => `<div class="cp-mission"><label class="qt-check"><input type="checkbox" data-keep="${index}"${search.kept.includes(index) ? " checked" : ""}>Die ${index+1}: <b>${result}</b></label>${numeric("Physical re-roll",result,`id="qt-reroll-${index}"`,6)}${button("log-reroll","Roll again",`data-index="${index}"`,!search.free && !session.pluck)}${button("log-reroll-manual","Use entered re-roll",`data-index="${index}"`,!search.free && !session.pluck)}</div>`).join("") || "<p>No dice.</p>"}</div>${select("One encounter from matching dice",encounters.length ? [["","Choose an encounter"],...encounters.map(entry => [`${entry.size}-${entry.face}`,`${entry.size} x ${entry.face}: ${entry.name}`])] : [["","No encounter"]],"",'id="qt-encounter"')}<p class="hint">Only one encounter. If several sets qualify, choose one; the PDF gives no selection priority. Supply and encounter are committed together, once.</p>${button("log-resolve","Confirm Logistics & collect Supply")}`);
    }
    function roster(tale) {
      const state = tale.tales, editable = ["muster","supply","encounter"].includes(state.phase);
      // Patrol-Builder layout (5 Nov, user request): Muster Roll left, your Force right; names edited with the pencil; tap a name tag
      // for that rhyfler's options (role Fodder / Character / Leader, profile, advances, retire). No card grid below.
      const groups = [...new Set(E.alive(tale).map(member => member.unitId))].map(unitId => { const members = E.alive(tale).filter(member => member.unitId === unitId), data = E.unit(tale,members[0]) || {};
        return {id:unitId,name:data.name || "Unknown unit",variant:data.variant,members,pts:(data.pts || 0)*members.length,canAdd:editable && Number.isFinite(data.pts) && E.value(tale)+data.pts <= state.limit,canRemove:E.dismissable(tale,unitId).length > 0}; });
      const gone = tale.chars.filter(member => member.status !== "active");
      const yours = `<section id="cp-yours" class="card cp-panel cp-yours"><header><h2>Your Force</h2><span class="hint">${E.alive(tale).length} unit${E.alive(tale).length === 1 ? "" : "s"} &middot; ${E.value(tale)} / ${state.limit} pts</span></header>${ui.force({key:"qt|"+tale.id,attr:"data-tales",unit:"pts",groups,input:member => `data-member="${esc(member.id)}" data-member-field="name"`,detail:member => memberBody(tale,member,true),badge:member => `<em class="nrole r-${esc(member.role)}">${member.role === "leader" ? "Leader" : member.role === "character" ? "Character" : "Fodder"}</em>`,hint:"<b>Tap a rhyfler's name</b> to make them Fodder, a Character or the Force Leader, and to see their stats, advances and Retire.",empty:"No units in the Force yet. Tap + on the Muster Roll to add them."})}</section>`;
      return `<div class="cp-build">${yours}`+panel("Muster & recruitment",`<p>Force pool: ${E.value(tale)} / ${state.limit} points. One Leader plus ${E.characterLimit(tale)} other Character slots. Vehicles, animals and heavy weapon crews cannot be Characters.</p><div class="cp-form">${select("Recruitment price",[[1,"1 Supply: basic rifle"],[2,"2 Supply: other weapon or Milwer"],[3,"3 Supply: Yawdryl"]],1,'id="qt-recruit-cost"')}${input("Free encounter / agreed recruitment explanation","",'id="qt-recruit-reason" maxlength="500"')}</div><p class="hint">Initial Force muster is free before the first Skirmish. Later recruitment uses printed costs. Units without a printed cost need an encounter/agreed award and an explanation. Tap a name to see its profile; press + to add it to the Force. New recruits get a random name; change it with the pencil in Your Force, and tap a name there for its role and options.</p>${ui.roll(E.faction(tale),E.faction(tale).units.filter(data => Number.isFinite(data.pts)),{attr:"data-tales",unit:"pts",fac:tale.faction,note:data => { const n = E.alive(tale).filter(member => member.unitId === data.id).length; return [n ? `${n} in Force` : "", eligible(data) ? "" : "Fodder only"].filter(Boolean).join(" · "); },disabled:data => !editable || E.value(tale)+data.pts > state.limit,removable:data => E.dismissable(tale,data.id).length > 0})}`)+`</div>${gone.length ? ui.fold("qt-gone-"+tale.id,`Dead, captured & retired (${gone.length})`,`<div class="cp-roster">${gone.map(entry => { const data = E.unit(tale,entry); return `<article class="card cp-panel cp-character is-gone"><header><div class="cp-who">${context.dtag(entry.name)}<span class="hint">${esc(label(data))}</span></div><span class="cp-status">${esc(entry.status)} &middot; ${esc(entry.role)}</span><span class="cp-cost">${data.pts} pts</span></header><div class="cp-body">${memberBody(tale,entry,false)}</div></article>`; }).join("")}</div>`) : ""}`;
    }
    // One rhyfler's options (role, profile, injuries, advances, squad & story, retire). Shown under its name tag in Your Force
    // (5 Nov, user request: no card grid under the page), or in a card for the dead / captured / retired fold.
    function memberBody(tale, entry, inList) {
      const state = tale.tales, editable = ["muster","supply","encounter"].includes(state.phase);
      const data = E.unit(tale,entry), attrs = idAttr(entry), profiles = data.profiles || [data.vehicle || data.crew || {}];
      return `${eligible(data) ? `<div class="cp-form qt-role">${select("Role",[["fodder","Fodder"],["character","Character"],["leader","Force Leader"]],entry.role,`data-role="1" data-seg="role" ${attrs}${!editable ? " disabled" : ""}`)}</div>` : ""}<p><b>${entry.xp} Character XP</b></p>${profiles.map(base => { const profile = E.profile(tale,entry,base); return `<div class="gtiles">${profiles.length > 1 && base.label ? `<span class="gtlab">${esc(base.label)}</span>` : ""}${tile("Sk",profile.sk ?? "-")}${tile("Mt",base.mt || "-")}${tile("MA",profile.ma)}${tile("T",profile.t ?? "-")}</div>`; }).join("")}${ui.weapons(tale.faction,data)}<p class="hint">Base abilities: ${ui.tips(tale.faction,[...(data.abilities || []),...(data.profiles?.[0]?.abilities || [])]) || "None"}. Advances: Skill +${entry.advances.skill}, Toughness +${entry.advances.toughness}${entry.advances.veteran ? ", Veteran" : ""}${entry.advances.hardened ? ", Hardened" : ""}.</p>${ui.rules(tale.faction,data)}${entry.skip ? '<p class="cp-notice">Must miss next Skirmish.</p>' : ""}${entry.jitters ? '<p class="cp-notice">Starts next Skirmish Gobsmacked; Recover gives no Pluck.</p>' : ""}${entry.injuries.map((injury,index) => `<p>${esc(injury.text)} ${button("heal-injury",deleting === `${entry.id}-injury-${index}` ? "Confirm Doctor treatment" : "Doctor: remove injury",`${attrs} data-index="${index}"`,!editable)}</p>`).join("")}${entry.lostWeapons ? `<p class="cp-notice">${entry.lostWeapons} permanently lost weapon(s). Record the enemy's chosen weapons in notes; do not use them.</p>` : ""}<details class="cp-mission"><summary>${inList ? "Squad & story" : "Name, squad & story"}</summary><div class="cp-form">${inList ? "" : input("Name",entry.name,`data-member-field="name" data-rname ${attrs} maxlength="80"`)}${input("Squad (for death penalties)",entry.squad,`data-member-field="squad" ${attrs} maxlength="60"`)}</div><label>Story, agreed stat changes, armor & lost weapons<textarea data-member-field="notes" ${attrs} maxlength="4000">${esc(entry.notes)}</textarea></label></details>${entry.role !== "fodder" && entry.status === "active" ? `<div class="cp-form">${select("Character advance",R.advances.map(rule => [rule.id,`${rule.name} - ${rule.cost} Character XP`]),"skill",`id="qt-advance-${esc(entry.id)}"`)}</div>${button("advance","Buy advance",attrs,!["experience","supply"].includes(state.phase))}` : ""}${vehicle(data) && entry.status === "active" ? `<p>Damage: ${entry.damage}${entry.disabled ? " - Disabled" : ""}. Repair all damage before deployment.</p>${numeric("Damage boxes to repair",entry.damage,`id="qt-repair-${esc(entry.id)}"`)}${button("repair","Repair (1 Supply / box)",attrs,!editable || !entry.damage)}` : ""}${entry.status === "active" ? `<div class="cp-actions">${button("retire",deleting === entry.id ? "Confirm retirement" : "Retire / dismiss",attrs,!editable)}${entry.skip ? button("medicine","Use Medicine",attrs,!editable || !state.inventory.some(item => item.type === "medicine")) : ""}</div>` : ""}`;
    }
    function shop(tale) {
      const state = tale.tales, editable = ["muster","supply","encounter"].includes(state.phase);
      return panel("Force XP advantages - next Skirmish only",`<p>Available Force XP: ${state.xp}. Separate from Character advances. Repeated purchases obey the per-battle limits.</p><div class="cp-shop">${R.advantages.map(rule => `<article><div class="cp-shoprow"><div><h3>${esc(rule.name)}</h3><p>${rule.cost} Force XP &middot; prepared: ${amount(state.advantages[rule.id])}${rule.max ? " / "+rule.max : ""}</p></div><span class="cp-buy"><button type="button" class="add sub" data-tales="refund-advantage" data-type="${rule.id}" aria-label="Refund one ${esc(rule.name)}"${E.refundable(tale,rule.id) ? "" : " disabled"}>&minus;</button>${button("buy-advantage","Buy",`data-type="${rule.id}"`,state.xp < rule.cost || !["muster","experience","supply"].includes(state.phase))}</span></div><p class="hint">${esc(rule.text)}</p></article>`).join("")}</div>`)+panel("Spend Supply",`<p>${state.supply} Supply available. Mobilization is charged when starting a Skirmish: Command/Specialist 1 per model (Leader free); cavalry 2; heavy crew/standard vehicle 2; squad/individual tractor 3; crewed tractor 5.</p>${chooseMember(tale,"",'id="qt-bearer"',E.characters(tale))}<div class="cp-shop">${R.shop.map(rule => `<article><div class="cp-shoprow"><div><h3>${ui.item(rule.name, rule.temporary ? "use" : "eq")}${esc(rule.name)}</h3><p>${rule.cost} Supply${rule.temporary ? " &middot; next Skirmish only" : ""} (PDF p. ${rule.page})</p></div><span class="cp-buy">${E.sellable(tale,rule.id).length ? `<span class="hint">${E.sellable(tale,rule.id).length} bought</span>` : ""}<button type="button" class="add sub" data-tales="return-item" data-type="${rule.id}" aria-label="Return one ${esc(rule.name)} for a refund"${E.sellable(tale,rule.id).length ? "" : " disabled"}>&minus;</button>${button("buy-item","Buy",`data-type="${rule.id}"`,!editable || state.supply < rule.cost)}</span></div><p class="hint">${esc(rule.text)}</p></article>`).join("")}</div>`)+panel("Equipment & prepared benefits",`<p class="hint">Equipment stays until consumed or lost with its bearer. Mark items used when you use them. Prepared Defenses, Artillery and Ammunition move to the next battle and expire after it.</p><div class="cp-list">${state.inventory.map(item => { const rule = R.shop.find(entry => entry.id === item.type), bearer = tale.chars.find(entry => entry.id === item.bearer); return `<article><div><h3>${ui.item(rule.name, rule.temporary ? "use" : "eq")}${esc(rule.name)}${item.quality ? " - "+esc(R.mapQualities[item.quality-1]) : ""}</h3><p>${bearer ? esc(bearer.name) : "Force supply"}${bearer && bearer.status !== "active" ? " - bearer lost; unavailable" : ""}</p></div>${button("consume-item",deleting === item.id ? "Confirm use / discard" : "Use / discard",`data-item="${esc(item.id)}"`)}</article>`; }).join("") || '<p class="hint">No stored equipment.</p>'}</div>`);
    }
    function adjustments(tale) {
      return `<details class="cp-mission"><summary>Record an encounter, trade or agreed narrative result</summary><p class="hint">Manual bookkeeping, not an automatic reward. Consult the encounter instructions and explain what happened. Record multi-item awards in separate entries. Free armor/weapon changes are recorded in roster notes.</p><div class="cp-form">${input("Required explanation","",'id="qt-adjust-reason" maxlength="1000"')}${input("Supply change (+/-)",0,'id="qt-adjust-supply" type="number" step="1"')}${input("Force XP change (+/-)",0,'id="qt-adjust-xp" type="number" step="1"')}${chooseMember(tale,"",'id="qt-adjust-member"',tale.chars)}${input("Selected Character XP change (+/-)",0,'id="qt-adjust-char-xp" type="number" step="1"')}${select("Free encounter item",[["","None"],...R.shop.map(rule => [rule.id,rule.name])],"",'id="qt-adjust-item"')}${numeric("Map quality D6 (if awarded)",1,'id="qt-adjust-map"',6)}${select("Additional roster / narrative effect",[["","None"],["skip","Selected member misses next Skirmish"],["clear-skip","Doctor: clear next-Skirmish absence"],["repair","Mechanic: free vehicle repair"],["skill","Free Skill +1"],["toughness","Free Toughness +1"],["veteran","Free Veteran"],["hardened","Free Hardened"],["tunnels","Secret Tunnels: recurring Logistics re-roll"],["fodder-recovery","Encounter accident: roll Fodder recovery"],["manual-recovery","Agreed recovery exception: mark recovery resolved"]],"",'id="qt-adjust-effect"')}${numeric("Mechanic repair boxes",1,'id="qt-adjust-repair"')}</div>${button("adjust","Record explained result")}</details>`;
    }
    function journal(tale) {
      return panel("Tale notes & journal",`<div class="cp-form">${input("Tale name",tale.name,'data-story-field="name" maxlength="60"')}</div><label>Story notes<textarea data-story-field="notes" maxlength="6000">${esc(tale.notes)}</textarea></label>${adjustments(tale)}<ol class="cp-journal">${[...tale.tales.log].reverse().map(entry => `<li><b>Skirmish ${amount(entry.game)}</b> &middot; ${esc(new Date(entry.at).toLocaleDateString())}<p>${esc(entry.text)}</p></li>`).join("")}</ol>`);
    }
    function rules() {
      return `<p><b>Quar Tales</b> &middot; community supplement &middot; <i>${esc(R.source)}</i> (PDF pp. 1-10). Paraphrased summaries, not an official rules revision.</p><details class="cp-mission" open><summary>Force assembly & Skirmishes (p. 1)</summary><p>Agree a 600-1000-point Force pool, then select one Patrol per Skirmish with normal points and Force Allowance restrictions. Name one Leader plus a Character per 100 Force points. Patrols allow four Characters plus the Leader. Vehicles, animals and heavy weapon crews cannot be Characters; other non-Characters are Fodder. Every Skirmish lasts five rounds; agree scenarios, objectives and events with opponents.</p></details>${Object.entries(R.recovery).map(([kind,table]) => `<details class="cp-mission"><summary>${kind[0].toUpperCase()+kind.slice(1)} recovery (pp. 1-2)</summary><dl>${table.map(([key,text]) => `<dt>${esc(key.split("").join(" / "))}</dt><dd>${esc(text)}</dd>`).join("")}</dl><p>Use two D6 face patterns, not their sum. Gobsmacked units recover automatically. Re-roll recovery with remaining Pluck. Disabled vehicles roll on the vehicle chart; all damaged vehicles need repairs at 1 Supply per damage before reuse.</p></details>`).join("")}<details class="cp-mission"><summary>Experience & advances (pp. 3-4)</summary><p>Character XP: ordinary incapacitation 25; more-expensive target 50 instead; +25 for a Veteran target and +25 for a Character target. Primary objective 50, secondary 25, narrative 10, revive another rhyfler 10. Force XP: win 25, loss 10, primary completed 25, each secondary 10. XP carries forward without a cap.</p><ul>${R.advances.map(rule => `<li>${esc(rule.name)}: ${rule.cost} Character XP${rule.id === "skill" ? ", at most twice" : rule.id === "toughness" ? ", at most once" : ""}.</li>`).join("")}</ul><p>Veteran: Recover does not count towards the two allowed activations, but still spends an activation. Hardened: Skedaddle does not Gobsmack the rhyfler or force it Prone. Hero grants both.</p><ul>${R.advantages.map(rule => `<li>${esc(rule.name)}: ${rule.cost} Force XP${rule.max ? ", limit "+rule.max : ""}. ${esc(rule.text)}</li>`).join("")}</ul></details><details class="cp-mission"><summary>Logistics (p. 4)</summary><p>After Recovery and XP, roll D6 for each uninjured participating Character plus one for victory. Roll all dice but use at most six. Total 1-5 / 6-11 / 12-17 / 18-24 / 25-30 / 31-35 / 36+ earns 1 / 2 / 3 / 4 / 5 / 6 / 7 Supply. No dice earns none. Matching faces produce one encounter. Re-roll dice with remaining Pluck; apply rewards immediately.</p></details><details class="cp-mission"><summary>All 30 encounters (pp. 5-8)</summary>${R.encounters.map(entry => `<h3>${entry.size} x ${entry.face}: ${esc(entry.name)} <small>(p. ${entry.page})</small></h3><p>${esc(entry.text)}</p>`).join("")}</details><details class="cp-mission"><summary>Supply, recruitment & equipment (pp. 9-10)</summary><p>Begin with 2 Supply. At zero Supply every Force unit suffers -1 Skill until resupplied. Spend after Logistics, before the next Skirmish. Mobilization per battle: heavy weapon crew 2; Specialist/Command 1 each except Force Leader; cavalry 2 each; standard vehicle 2; squad/individual tractor 3; crewed tractor 5. Permanent recruitment: basic-rifle rhyfler 1 Supply, other weapon or Milwer 2, Yawdryl 3. Recruits fit the Force limit; Patrols obey Force Allowance.</p>${R.shop.map(rule => `<h3>${esc(rule.name)} - ${rule.cost} Supply</h3><p>${esc(rule.text)}</p>`).join("")}</details>`;
    }
    document.addEventListener("change", event => {
      const target = event.target; if (!target.closest("#view-narr .qt")) return;
      const tale = story(); if (!tale) return;
      if (target.dataset.memberField || target.dataset.storyField || target.dataset.battle || target.dataset.row) {
        try {
          const entry = target.dataset.member ? E.requireMember(tale,target.dataset.member) : null;
          if (target.dataset.memberField) { const key = target.dataset.memberField; if (["name","squad","notes"].includes(key)) entry[key] = target.value.slice(0,key === "notes" ? 4000 : key === "squad" ? 60 : 80); }
          if (target.dataset.storyField) { const key = target.dataset.storyField; if (["name","notes"].includes(key)) tale[key] = target.value.slice(0,key === "name" ? 60 : 6000); }
          if (target.dataset.battle && tale.tales.phase === "battle") { const key = target.dataset.battle; if (["result","notes","round","pluck","primary","secondary"].includes(key)) tale.tales.battle[key] = ["result","notes"].includes(key) ? target.value.slice(0,4000) : amount(target.value,key === "primary" ? 1 : key === "round" ? 5 : 999999); }
          if (target.dataset.row) {
            const key = target.dataset.row, row = tale.tales.battle?.rows[entry.id], battleKeys = ["outcome","damage"], xpKeys = ["normal","expensive","veteran","character","primary","secondary","narrative","revive"];
            if (row && (tale.tales.phase === "battle" && (battleKeys.includes(key) || xpKeys.includes(key)) || tale.tales.phase === "experience" && !tale.tales.battle.xpAwarded && xpKeys.includes(key))) row[key] = key === "outcome" ? target.value : amount(target.value);
          }
          save(tale);
          if (event.fromDice && target.dataset.memberField) render(tale.id);
          if (target.dataset.row === "outcome" || target.dataset.battle === "round" || target.dataset.battle === "result") render(tale.id);
        } catch(error) { context.toast(error.message); }
        return;
      }
      if (target.dataset.draft) { const setup = draft(tale); if (target.dataset.draft === "limit") setup.limit = Math.max(1,amount(target.value)); else if (target.dataset.draft === "scenario") setup.scenario = target.value.slice(0,200); save(tale); render(tale.id); return; }
      if (target.dataset.deploy) { const setup = draft(tale); setup.deployed = target.checked ? [...new Set([...setup.deployed,target.dataset.deploy])] : setup.deployed.filter(id => id !== target.dataset.deploy); save(tale); render(tale.id); return; }
      if (target.dataset.keep !== undefined) { const search = tale.tales.battle?.logistics; if (tale.tales.phase !== "logistics" || !search) return; const index = Number(target.dataset.keep); search.kept = target.checked ? [...new Set([...search.kept,index])] : search.kept.filter(value => value !== index); save(tale); render(tale.id); return; }
      if (target.dataset.role) change(entry => E.setRole(entry,E.requireMember(entry,target.dataset.member),target.value));
    });
    document.addEventListener("click", event => {
      const target = event.target.closest("[data-tales]"); if (!target || !target.closest("#view-narr .qt") || target.disabled) return;
      const action = target.dataset.tales;
      if (action === "create") {
        try {
          const patrol = context.getPatrols().find(entry => entry.id === get("qt-patrol")), limit = Number(get("qt-limit"));
          if (!Number.isInteger(limit) || limit < 600 || limit > 1000) throw Error("Agree a Force limit from 600 to 1000 points.");
          const tale = E.create(get("qt-name").trim() || "A new Tale",patrol?.faction || get("qt-faction"),limit);
          if (patrol) E.faction(tale).units.forEach(data => { for (let index=0; index<amount(patrol.items?.[data.id],200); index++) E.recruit(tale,data.id,patrol.names?.[data.id]?.[index] || context.name(tale.chars.map(entry => entry.name))); });
          context.getStories().push(tale); save(tale); context.navigate(tale.id);
        } catch(error) { context.toast(error.message); }
        return;
      }
      if (action === "delete") {
        if (deleting !== target.dataset.id) { deleting = target.dataset.id; renderList(); return; }
        const list = context.getStories(), index = list.findIndex(entry => entry.id === target.dataset.id && entry.system === "quar-tales"); if (index >= 0) list.splice(index,1); context.save(); deleting = null; renderList(); return;
      }
      if (action === "tab") { tab = target.dataset.tab; keepTab(current, tab); render(current); return; }
      const tale = story(); if (!tale) return;
      if (action === "next-round") { const session = tale.tales.battle; if (tale.tales.phase !== "battle" || session.round >= 5) return; session.round++; save(tale); render(tale.id); return; }
      if (action === "deploy-all" || action === "deploy-none") { const setup = draft(tale); setup.deployed = action === "deploy-none" ? [] : E.alive(tale).filter(entry => !entry.skip && !entry.disabled && !entry.damage).map(entry => entry.id); save(tale); render(tale.id); return; }
      if (action === "undo") { const snapshot = tale.tales.undo; if (!snapshot) return; Object.keys(tale).forEach(key => delete tale[key]); Object.assign(tale,clone(snapshot)); save(tale); render(tale.id); return; }
      if (["retire","consume-item","heal-injury"].includes(action)) { const id = action === "heal-injury" ? `${target.dataset.member}-injury-${target.dataset.index}` : target.dataset.member || target.dataset.item; if (deleting !== id) { deleting = id; render(tale.id); return; } deleting = null; }
      change(entry => {
        const state = entry.tales, session = state.battle, member = target.dataset.member ? E.requireMember(entry,target.dataset.member) : null;
        if (action === "start") E.start(entry,draft(entry));
        if (action === "finish") E.finish(entry);
        if (action === "recruit") E.recruit(entry,target.dataset.unit,context.name(entry.chars.map(other => other.name)),Number(get("qt-recruit-cost")),get("qt-recruit-reason").trim());
        if (action === "retire") { E.between(entry); member.status = "retired"; state.inventory = state.inventory.filter(item => item.bearer !== member.id); E.log(entry,`${member.name} retired / dismissed.`); }
        if (action === "advance") E.advance(entry,member,get("qt-advance-"+member.id));
        if (action === "repair") { E.between(entry); const boxes = amount(get("qt-repair-"+member.id)); if (!vehicle(E.unit(entry,member)) || !boxes || boxes > member.damage) throw Error("Choose repair boxes from 1 to current damage."); E.spend(entry,"supply",boxes); member.damage -= boxes; if (!member.damage) member.disabled = false; E.log(entry,`${member.name}: repaired ${boxes} damage for ${boxes} Supply.`); }
        if (action === "heal-injury") { E.between(entry); member.injuries.splice(Number(target.dataset.index),1); E.log(entry,`${member.name}: Doctor removed an injury and its stat penalties (agreed encounter result).`); }
        if (action === "medicine") { E.between(entry); const index = state.inventory.findIndex(item => item.type === "medicine"); if (index < 0 || !member.skip || member.role === "fodder") throw Error("A Character with an absence and one Medicine are required."); state.inventory.splice(index,1); member.skip = 0; E.log(entry,`${member.name}: Medicine cleared the next-Skirmish absence.`); }
        if (action === "buy-item") E.buy(entry,target.dataset.type,get("qt-bearer"));
        if (action === "buy-advantage") E.advantage(entry,target.dataset.type);
        if (action === "refund-advantage") E.refundAdvantage(entry,target.dataset.type);
        if (action === "return-item") E.sell(entry,target.dataset.type);
        if (action === "dismiss") E.dismiss(entry,target.dataset.unit);
        if (action === "use-advantage") { const id = target.dataset.type; if (state.phase !== "battle" || id === "recover" || !session.advantages[id]) throw Error("No such advantage available this Skirmish."); session.advantages[id]--; E.log(entry,`Used one ${R.advantages.find(rule => rule.id === id).name}.`); }
        if (action === "consume-item") { const index = state.inventory.findIndex(item => item.id === target.dataset.item); if (index < 0) throw Error("Item no longer available."); const item = state.inventory.splice(index,1)[0]; E.log(entry,`Used / discarded ${R.shop.find(rule => rule.id === item.type).name}.`); }
        if (action === "recovery-roll" || action === "recovery-manual") { const row = session.rows[member.id]; E.rollRecovery(entry,member,action === "recovery-roll" ? [die(),die()] : [Number(get("qt-d1-"+member.id)),Number(get("qt-d2-"+member.id))],!!row.roll); }
        if (action === "recovery-confirm" || action === "auto-recover") E.confirmRecovery(entry,member,get("qt-choice-"+member.id),action === "auto-recover",Number(get("qt-weapons-"+member.id)) || 1);
          if (action === "to-experience") { if (state.phase !== "recovery" || session.deployed.some(id => session.rows[id].pending)) throw Error("Resolve all recoveries first."); state.phase = state.recoveryReturn === "encounter" ? "encounter" : "experience"; delete state.recoveryReturn; }
        if (action === "award-xp") E.awardXP(entry);
        if (action === "to-logistics") { if (state.phase !== "experience" || !session.xpAwarded) throw Error("Record XP first."); state.phase = "logistics"; }
        if (action === "log-roll" || action === "log-manual") { const rolls = action === "log-roll" ? Array.from({length:E.logisticsCount(entry)},die) : get("qt-log-dice").trim().split(/[\s,]+/).filter(Boolean).map(Number); E.rollLogistics(entry,rolls); }
        if (action === "log-reroll" || action === "log-reroll-manual") { const index = Number(target.dataset.index); E.rerollLogistics(entry,index,action === "log-reroll" ? die() : Number(get("qt-reroll-"+index))); }
        if (action === "log-resolve") E.resolveLogistics(entry,get("qt-encounter"));
        if (action === "encounter-done") { if (state.phase !== "encounter") throw Error("No pending encounter."); E.log(entry,"Encounter resolved using tabletop choices and recorded narrative adjustments."); state.phase = "supply"; }
        if (action === "adjust") {
          const reason = get("qt-adjust-reason").trim(); if (!reason) throw Error("Explain the encounter or agreed narrative result.");
          const supply = signed(get("qt-adjust-supply")), xp = signed(get("qt-adjust-xp")), characterXP = signed(get("qt-adjust-char-xp")), recipient = get("qt-adjust-member") ? E.requireMember(entry,get("qt-adjust-member")) : null;
          if (state.supply+supply < 0 || state.xp+xp < 0) throw Error("Resources cannot fall below zero; record only the available amount.");
          state.supply += supply; state.xp += xp;
          if (characterXP) { if (!recipient || recipient.role === "fodder" || recipient.xp+characterXP < 0) throw Error("Choose a Character with enough XP for this adjustment."); recipient.xp += characterXP; }
          const item = get("qt-adjust-item"); if (item) E.addItem(entry,item,recipient?.id || "",Number(get("qt-adjust-map")));
          const effect = get("qt-adjust-effect");
          if (["skip","clear-skip","repair","skill","toughness","veteran","hardened","fodder-recovery","manual-recovery"].includes(effect) && !recipient) throw Error("Select the affected roster member.");
          if (effect === "skip") recipient.skip = 1;
          if (effect === "clear-skip") recipient.skip = 0;
          if (effect === "repair") { if (!vehicle(E.unit(entry,recipient))) throw Error("Choose a vehicle."); recipient.damage = Math.max(0,recipient.damage-amount(get("qt-adjust-repair"))); if (!recipient.damage) recipient.disabled = false; }
          if (["skill","toughness","veteran","hardened"].includes(effect)) E.advance(entry,recipient,effect,true);
          if (effect === "tunnels") { if (state.tunnels) E.addItem(entry,"trenches"); else state.tunnels = true; }
          if (effect === "fodder-recovery") {
            if (state.phase !== "encounter" || !session.deployed.includes(recipient.id) || recipient.status !== "active" || vehicle(E.unit(entry,recipient))) throw Error("Choose a living participating rhyfler during an encounter.");
            const row = session.rows[recipient.id]; row.pending = true; row.injured = true; row.forceFodder = true; delete row.roll;
            state.recoveryReturn = "encounter"; state.phase = "recovery"; tab = "cycle";
          }
          if (effect === "manual-recovery") { if (state.phase !== "recovery" || !session.rows[recipient.id]?.pending) throw Error("Choose a member with pending Recovery."); session.rows[recipient.id].pending = false; }
          E.log(entry,`${reason} | Supply ${supply >= 0 ? "+" : ""}${supply}; Force XP ${xp >= 0 ? "+" : ""}${xp}${recipient ? "; "+recipient.name+" XP "+characterXP : ""}${effect ? "; effect: "+effect : ""}.`);
        }
      });
    });
    return {render, importStory:value => { const entry = clone(value); delete entry.tales?.undo; return E.normalize(entry); }};
  }
  return {create, createEngine, recoveryKey, supplies, matches, eligible, vehicle};
})();
