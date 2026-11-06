"use strict";
window.QuarCampaign = (() => {
  const R = window.QuarCampaignRules;
  const phases = ["muster", "battle", "casualties", "experience", "exploration", "purchase"];
  const clone = value => JSON.parse(JSON.stringify(value));
  const number = (value, max = 99999) => Math.max(0, Math.min(max, Math.floor(Number(value) || 0)));
  const dice = sides => 1 + Math.floor(Math.random() * sides);
  const sumDice = (count, sides = 6) => Array.from({length:count}, () => dice(sides)).reduce((total, value) => total + value, 0);
  const uid = () => "q" + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  const isVehicle = unit => /vehicle|tractor/i.test(unit.cat || "");
  const startsSenior = unit => !/attached|weapon crew/i.test(unit.cat || "") && /command|specialist|cavalry|lancer|outrider|autoped/i.test(unit.cat || "");
  const levelAt = xp => R.levels.reduce((level, threshold, index) => xp >= threshold ? index : level, 0);
  // Underquar bonuses STACK (site owner's ruling, 5 Nov): the Underquar gets every bonus from its own band and all the bands above it in the chart.
  const UNDER_BANDS = [[6, "D3 starting Pluck."], [16, "Choose the scenario."], [36, "Two PykPyks, not attached to a model."], [56, "At each turn end, use the discarded card as an extra round; normal round order is unchanged."], [76, "Every patrol member gains 2 XP after battle, even if OOA."]];
  function underquar(own, opponent) {
    const difference = opponent - own, all = UNDER_BANDS.filter(([from]) => difference >= from).map(([, text]) => text);
    return {difference, bonuses:all, bonus: all.length ? all.join(" ") : "No band bonus."};
  }
  function createEngine(getData) {
    const faction = story => getData().factions.find(item => item.id === story.faction);
    const unit = (story, character) => faction(story).units.find(item => item.id === character.unitId);
    const living = story => story.chars.filter(character => character.campaign.status === "active");
    const gear = item => R.shop.find(entry => entry.name === item.name);
    function character(unitData, name) {
      const senior = startsSenior(unitData) && !isVehicle(unitData);
      return {id:uid(), unitId:unitData.id, name, backstory:"", fallen:false, campaign:{xp:senior ? 3 : 0, level:senior ? 1 : 0, senior, specialization:"", advances:[], injuries:[], equipment:[], status:"active", skip:0}};
    }
    function normalize(story) {
      if (!story || !faction(story) || !Array.isArray(story.chars)) throw Error("Unknown faction or invalid campaign roster.");
      story.name = String(story.name || "Unnamed campaign").slice(0, 60);
      story.notes = String(story.notes || "").slice(0, 6000);
      story.created = number(story.created, Number.MAX_SAFE_INTEGER) || Date.now();
      story.updated = number(story.updated, Number.MAX_SAFE_INTEGER) || story.created;
      story.rels = Array.isArray(story.rels) ? story.rels : [];
      story.chars = story.chars.filter(entry => entry && unit(story, entry)).slice(0, 200);
      story.chars.forEach(entry => {
        const defaults = character(unit(story, entry), String(entry.name || "Unnamed"));
        entry.id = String(entry.id || uid()); entry.name = String(entry.name || "Unnamed").slice(0, 80);
        entry.backstory = String(entry.backstory || "").slice(0, 4000);
        const saved = entry.campaign && typeof entry.campaign === "object" ? entry.campaign : {};
        entry.campaign = {...defaults.campaign, ...saved};
        const stats = entry.campaign;
        stats.xp = number(stats.xp); stats.level = number(stats.level, 3); stats.skip = number(stats.skip, 1);
        if (!["active", "dead", "retired", "captured"].includes(stats.status)) stats.status = "active";
        if (entry.fallen) stats.status = "dead";
        stats.injuries = (Array.isArray(stats.injuries) ? stats.injuries : []).filter(value => [3, 4, 10, 11].includes(value));
        stats.advances = (Array.isArray(stats.advances) ? stats.advances : []).filter(value => value && typeof value.effect === "string" && value.level >= 1 && value.level <= 3).slice(0, 3);
        stats.equipment = (Array.isArray(stats.equipment) ? stats.equipment : []).filter(value => value && typeof value.name === "string").map(value => ({...value, cost:number(value.cost), id:String(value.id || uid())})).slice(0, 3);
        if (!R.advances[stats.specialization]) stats.specialization = "";
        stats.senior = defaults.campaign.senior;
        if (isVehicle(unit(story, entry))) { stats.xp = 0; stats.level = 0; stats.advances = []; stats.injuries = []; stats.skip = 0; stats.status = "active"; }
      });
      if (!story.campaign) {
        story.campaign = {version:1, bank:Math.max(0, 250 - living(story).reduce((total, entry) => total + unit(story, entry).pts, 0)), phase:"muster", gameNumber:1, supply:[], log:[], legacy:true};
      }
      const campaign = story.campaign;
      campaign.bank = number(campaign.bank); campaign.gameNumber = Math.max(1, number(campaign.gameNumber));
      if (!phases.includes(campaign.phase)) campaign.phase = "muster";
      if (campaign.phase !== "muster" && (!campaign.battle || typeof campaign.battle.rows !== "object" || !Array.isArray(campaign.battle.missed) || !Array.isArray(campaign.battle.tools))) throw Error("Campaign battle data is incomplete; restore a complete backup.");
      campaign.supply = (Array.isArray(campaign.supply) ? campaign.supply : []).filter(value => value && typeof value.name === "string").map(value => ({...value, id:String(value.id || uid()), cost:number(value.cost)})).slice(0, 500);
      campaign.log = (Array.isArray(campaign.log) ? campaign.log : []).filter(value => value && typeof value.text === "string").slice(-500);
      return story;
    }
    function cost(story, entry) {
      if (entry.campaign.status !== "active") return 0;
      return unit(story, entry).pts + entry.campaign.advances.reduce((total, advance) => total + (advance.level === 3 ? 4 : 3), 0) + entry.campaign.equipment.reduce((total, item) => total + number(item.cost), 0);
    }
    const value = story => story.chars.reduce((total, entry) => total + cost(story, entry), 0);
    function abilities(story, entry) {
      const data = unit(story, entry); const base = [...(data.abilities || []), ...(data.profiles || []).flatMap(profile => profile.abilities || [])];
      return [...new Set([...base, ...entry.campaign.advances.map(advance => advance.effect), ...entry.campaign.equipment.flatMap(item => item.name === "Short Range Radio" ? ["Communications"] : item.name === "Trench Armor" ? ["Trench Armor"] : item.name === "AT Grenades" ? ["AT Grenades"] : [])])];
    }
    const leader = (story, entry) => Math.max(0, ...abilities(story, entry).map(ability => Number((ability.match(/^Leader\s*\((\d+)/i) || [])[1]) || 0));
    const pendingLevel = entry => Math.min(3, entry.campaign.level + 1) <= levelAt(entry.campaign.xp) && entry.campaign.level < 3;
    function log(story, text) { story.campaign.log.push({at:Date.now(), game:story.campaign.gameNumber, text}); story.campaign.log = story.campaign.log.slice(-500); }
    function addXP(story, entry, amount, reason) {
      if (isVehicle(unit(story, entry)) || entry.campaign.status !== "active" || amount <= 0) return;
      entry.campaign.xp += number(amount); log(story, `${entry.name}: +${amount} XP (${reason}).`);
    }
    function recruit(story, unitId, name, free = false) {
      const unitData = faction(story).units.find(entry => entry.id === unitId);
      if (!unitData || !Number.isFinite(unitData.pts)) throw Error("Select a priced unit.");
      if (story.chars.length >= 200) throw Error("Roster limit reached.");
      if (!free && story.campaign.bank < unitData.pts) throw Error("Not enough Marks.");
      if (!free) story.campaign.bank -= unitData.pts;
      const entry = character(unitData, name); entry.campaign.fresh = {win:number(story.campaign.battles), paid:free ? 0 : unitData.pts}; story.chars.push(entry);
      log(story, `Recruited ${name}: ${unitData.name} (${free ? "free" : unitData.pts + " Marks"}).`); return entry;
    }
    // Undo a recruit with a full refund (site owner's request, 5 Nov): only recruits made since the last battle started, while recruiting is open.
    const undoable = (story, entry) => entry.campaign.status === "active" && entry.campaign.fresh && entry.campaign.fresh.win === number(story.campaign.battles);
    const dismissable = (story, unitId) => ["muster","purchase"].includes(story.campaign.phase) ? story.chars.filter(entry => entry.unitId === unitId && undoable(story, entry)) : [];
    function dismiss(story, unitId) {
      const list = dismissable(story, unitId), entry = list[list.length - 1];
      if (!entry) throw Error("Only recruits added since the last battle can be removed for a refund. Use Retire for veterans.");
      entry.campaign.equipment.forEach(gear => story.campaign.supply.push(gear)); entry.campaign.equipment = [];
      story.chars.splice(story.chars.indexOf(entry), 1); story.campaign.bank += number(entry.campaign.fresh.paid);
      if (story.campaign.setupDraft) story.campaign.setupDraft.deployed = story.campaign.setupDraft.deployed.filter(id => id !== entry.id);
      log(story, `Removed recruit ${entry.name} (${unit(story, entry)?.name || "unit"}); refunded ${number(entry.campaign.fresh.paid)} Marks.`);
    }
    const sellable = (story, name) => ["muster","purchase"].includes(story.campaign.phase) ? story.campaign.supply.filter(gear => gear.name === name && gear.bought && gear.bought.win === number(story.campaign.battles)) : [];
    function sell(story, name) {
      const list = sellable(story, name), gear = list[list.length - 1];
      if (!gear) throw Error("Only unused items bought since the last battle can be returned.");
      story.campaign.supply.splice(story.campaign.supply.indexOf(gear), 1); story.campaign.bank += number(gear.bought.cost);
      log(story, `Returned ${name}; refunded ${number(gear.bought.cost)} Marks.`);
    }
    function remove(story, entry, status) {
      entry.campaign.status = status; entry.fallen = status === "dead";
      if (status === "captured") entry.campaign.capturedEquipment = clone(entry.campaign.equipment);
      entry.campaign.equipment = []; log(story, `${entry.name}: ${status}; model and equipment leave the roster.`);
    }
    function applyCasualty(story, entry, roll) {
      const stats = entry.campaign;
      if (roll === 2) remove(story, entry, "dead");
      else if ([3, 4, 10, 11].includes(roll)) {
        if (stats.injuries.length) remove(story, entry, "retired");
        else stats.injuries.push(roll);
      } else if ([5, 9].includes(roll)) stats.skip = 1;
      else if (roll === 12) addXP(story, entry, 1, "ancestors");
      log(story, `${entry.name}: casualty ${roll}. ${R.casualties[roll - 2]}`);
    }
    function advance(story, entry, specialization, roll, choice) {
      if (!pendingLevel(entry)) throw Error("No advancement pending.");
      const stats = entry.campaign, level = stats.level + 1;
      if (stats.specialization && stats.specialization !== specialization) throw Error("Specialization is permanent.");
      const chart = R.advances[specialization] && R.advances[specialization][level - 1];
      if (!chart || roll < 1 || roll > 6) throw Error("Choose a specialization and roll D6.");
      const effect = chart[roll - 1];
      const normalizeAbility = ability => ability.toLowerCase().replace(/\([^)]*\)/g, "").replace(/\s/g, "");
      const duplicate = abilities(story, entry).some(ability => normalizeAbility(ability) === normalizeAbility(effect));
      if (duplicate && !chart.includes(choice)) return {duplicate:true, effect};
      stats.specialization = specialization; stats.level = level;
      stats.advances.push({level, roll, effect:duplicate ? choice : effect});
      log(story, `${entry.name}: ${specialization} level ${level}, D6 ${roll}: ${duplicate ? choice + " (duplicate choice)" : effect}.`);
      return {duplicate:false};
    }
    function item(story, name, costOverride) {
      const shop = R.shop.find(entry => entry.name === name);
      const entry = {id:uid(), name, cost:costOverride == null ? (shop ? shop.cost : 0) : number(costOverride), unpriced:!shop && costOverride == null};
      story.campaign.supply.push(entry); return entry;
    }
    function buy(story, name) {
      const shop = R.shop.find(entry => entry.name === name);
      if (!shop || story.campaign.bank < shop.cost) throw Error("Not enough Marks.");
      story.campaign.bank -= shop.cost; item(story, name).bought = {win:number(story.campaign.battles), cost:shop.cost}; log(story, `Bought ${name}: ${shop.cost} Marks.`);
    }
    function assign(story, itemId, characterId) {
      const supply = story.campaign.supply, index = supply.findIndex(entry => entry.id === itemId), entry = story.chars.find(character => character.id === characterId);
      if (index < 0 || !entry || entry.campaign.status !== "active" || isVehicle(unit(story, entry))) throw Error("Choose an active Rhyfler.");
      const equipment = supply[index];
      if (gear(equipment)?.item) throw Error("Consumables stay in the patrol supply.");
      if (equipment.unpriced) throw Error("Agree this recovered weapon's added value first.");
      const locked = entry.campaign.startingEquipmentLost ? 0 : Math.max(0, ...(unit(story, entry).profiles || []).map(profile => (profile.equip || []).length));
      if (locked + entry.campaign.equipment.length >= 3) throw Error("Maximum three pieces, including locked starting equipment.");
      entry.campaign.equipment.push(equipment); supply.splice(index, 1); log(story, `${equipment.name} assigned to ${entry.name}.`);
    }
    function startBattle(story, setup) {
      if (story.campaign.phase !== "muster") throw Error("A battle is already in progress.");
      story.campaign.battles = number(story.campaign.battles) + 1;
      if (!living(story).length) throw Error("Recruit your patrol first.");
      if (story.campaign.gameNumber === 1 && story.campaign.phase === "muster" && value(story) > 250) throw Error("The starting patrol may not exceed 250 Marks. Remove entries or start with a smaller saved patrol.");
      if (story.chars.some(entry => entry.campaign.status === "active" && pendingLevel(entry))) throw Error("Resolve pending advancements first.");
      const deployed = living(story).filter(entry => !entry.campaign.skip && !setup.failed.includes(entry.id) && setup.deployed.includes(entry.id));
      if (!deployed.length) throw Error("Deploy at least one model.");
      const difference = number(setup.opponent) - value(story);
      story.campaign.battle = {id:uid(), ownValue:value(story), opponent:number(setup.opponent), difference, mission:setup.mission, role:setup.role, turn:1, pluck:0, vp:0, enemyVP:0, result:"", notes:"", bonusXP:difference >= 76 ? 2 : 0, rows:Object.fromEntries(deployed.map(entry => [entry.id, {outcome:"ready", tend:0, objective:0, mvq:false, scenarioXP:0}])), missed:living(story).filter(entry => entry.campaign.skip).map(entry => entry.id), casualties:{}, tools:[], surgeons:[], countdown:null};
      story.campaign.phase = "battle"; log(story, `Battle ${story.campaign.gameNumber}: ${setup.mission}, ${setup.role}; ${value(story)} vs ${setup.opponent} Marks.`);
    }
    function recover(story, entry, withEquipment) {
      if (!entry || entry.campaign.status !== "captured") throw Error("Choose a captured Rhyfler.");
      entry.campaign.status = "active";
      entry.campaign.startingEquipmentLost = !withEquipment;
      entry.campaign.equipment = withEquipment ? (entry.campaign.capturedEquipment || []) : [];
      delete entry.campaign.capturedEquipment;
    }
    function finishBattle(story) {
      if (story.campaign.phase !== "battle") throw Error("This battle has already ended.");
      const battle = story.campaign.battle;
      if (!["win", "draw", "loss"].includes(battle.result)) throw Error("Record the battle result first.");
      if (Object.values(battle.rows).filter(row => row.mvq).length > 1) throw Error("Choose only one MVQ.");
      battle.missed.forEach(id => { const entry = story.chars.find(character => character.id === id); if (entry) entry.campaign.skip = 0; });
      battle.eligible = Object.keys(battle.rows).filter(id => battle.rows[id].outcome === "ready");
      story.campaign.phase = "casualties"; log(story, `Battle result: ${battle.result}; VP ${battle.vp}-${battle.enemyVP}. ${battle.notes}`);
    }
    function casualtyRoll(story, entry, screening, total) {
      if (story.campaign.phase !== "casualties") throw Error("Not in the casualty step.");
      const battle = story.campaign.battle, row = battle.rows[entry.id];
      if (!row || !["ooa", "removed"].includes(row.outcome) || isVehicle(unit(story, entry))) throw Error("This model does not need a casualty roll.");
      if (battle.casualties[entry.id]?.committed) throw Error("Casualty already committed.");
      if (row.outcome === "ooa" && (!Number.isInteger(screening) || screening < 1 || screening > 6)) throw Error("Roll the OOA screening D6 first.");
      if ((row.outcome === "removed" || screening <= 3) && (!Number.isInteger(total) || total < 2 || total > 12)) throw Error("Roll 2D6 on the casualty chart.");
      battle.casualties[entry.id] = {screening:row.outcome === "removed" ? null : screening, total:row.outcome === "ooa" && screening >= 4 ? null : total, committed:false, rerolled:false};
    }
    function commitCasualties(story) {
      if (story.campaign.phase !== "casualties") throw Error("Casualties and XP are already resolved.");
      const battle = story.campaign.battle;
      const required = story.chars.filter(entry => battle.rows[entry.id] && ["ooa", "removed"].includes(battle.rows[entry.id].outcome) && !isVehicle(unit(story, entry)));
      if (required.some(entry => !battle.casualties[entry.id])) throw Error("Resolve every casualty before continuing.");
      required.forEach(entry => { const result = battle.casualties[entry.id]; if (!result.committed) { if (result.total) applyCasualty(story, entry, result.total); else log(story, `${entry.name}: OOA screening ${result.screening}, no ill effects.`); result.committed = true; } });
      story.campaign.phase = "experience";
      living(story).forEach(entry => {
        const row = battle.rows[entry.id];
        const earned = row ? (row.outcome === "ready" ? 1 : 0) + number(row.tend) + number(row.objective) + (row.mvq ? 1 : 0) + number(row.scenarioXP) : 0;
        addXP(story, entry, earned + battle.bonusXP, "battle, tasks, MVQ and Underquar");
      });
    }
    function explorationPool(story) {
      const battle = story.campaign.battle;
      const leaders = living(story).filter(entry => battle.eligible.includes(entry.id) && leader(story, entry) > 0);
      const base = Math.min(6, leaders.reduce((total, entry) => total + leader(story, entry), 0));
      return {leaders, base, count:base + (battle.result === "win" ? 1 : 0)};
    }
    function explorationEvents(rolls, groups = {}) {
      return Array.from({length:6}, (_, index) => index + 1).flatMap(face => {
        const count = rolls.filter(value => value === face).length;
        const size = Math.min(4, count, groups[face] || 4);
        return size >= 2 ? [{face, size, text:R.exploration[size][face - 1]}] : [];
      });
    }
    function resolveExploration(story, rolls, groups, selections, rollDie = dice) {
      if (story.campaign.phase !== "exploration") throw Error("Exploration is not available in this step.");
      const battle = story.campaign.battle, pool = explorationPool(story);
      if (battle.exploration) throw Error("Exploration already paid.");
      if (rolls.length !== Math.min(6, pool.count) || rolls.some(value => !Number.isInteger(value) || value < 1 || value > 6)) throw Error("Keep the correct number of D6 results (maximum six).");
      const events = explorationEvents(rolls, groups);
      const choices = events.filter(event => (event.size === 2 && event.face === 5) || (event.size === 3 && [2,4].includes(event.face)) || (event.size === 4 && [5,6].includes(event.face)));
      choices.forEach(event => { const selected = selections[event.face]; const options = event.size === 4 ? R.shop.filter(entry => event.face === 6 || entry.cost <= 10).map(entry => entry.name) : event.face === 4 ? ["Splagen torpedo", "Doru"] : ["Harlech", "Bogen"]; if (!options.includes(selected)) throw Error("Choose each possible recovered item before resolving."); });
      const roll = count => Array.from({length:count}, () => rollDie(6)).reduce((total, value) => total + value, 0);
      const randomLeader = () => pool.leaders.length ? pool.leaders[rollDie(pool.leaders.length) - 1] : null;
      let income = rolls.reduce((total, value) => total + value, 0);
      const details = [];
      events.forEach(event => {
        const {face, size} = event; let detail = `${size} x ${face}: `;
        if (size === 2) {
          if (face === 1) { income -= 2; detail += "-2 Marks"; }
          if (face === 2) { const result = rollDie(6); detail += `D6 ${result}`; if (result === 6) { const basic = faction(story).units.find(entry => entry.cat === "Standard" && /rhyfler/i.test(entry.name)) || faction(story).units.filter(entry => entry.cat === "Standard" && Number.isFinite(entry.pts)).sort((left, right) => left.pts - right.pts)[0]; if (basic) recruit(story, basic.id, "Lost Rhyfler", true); else detail += "; no basic Rhyfler profile available: agree a replacement"; } }
          if (face === 3) { const bonus = roll(1); income += bonus; detail += `+${bonus} Marks`; }
          if (face === 4) { const result = rollDie(6), selected = result === 1 ? randomLeader() : null; if (selected) selected.campaign.skip = 1; detail += `D6 ${result}${selected ? "; " + selected.name + " misses next game" : ""}`; }
          if (face === 5) { const result = rollDie(6); detail += `D6 ${result}`; if (result === 6) { item(story, selections[face]); detail += "; " + selections[face]; } }
          if (face === 6) { item(story, "First aid kit"); detail += "First aid kit"; }
        } else if (size === 3) {
          if (face === 1) { const loss = roll(3); income -= loss; detail += `-${loss} income Marks`; }
          if (face === 2) { const result = rollDie(6); detail += `D6 ${result}; `; if (result <= 2) { const bonus = roll(1); income += bonus; detail += `+${bonus} Marks`; } else { const name = result === 6 ? "Cryfen" : selections[face]; item(story, name); detail += name; } }
          if (face === 3) { const bonus = roll(2); income += bonus; detail += `+${bonus} Marks`; }
          if (face === 4) { item(story, selections[face]); detail += selections[face]; }
          if (face === 5) { item(story, "Pistol"); item(story, "Sword"); detail += "Pistol and Sword"; }
          if (face === 6) { item(story, "Trench Armor"); detail += "Trench Armor"; }
        } else {
          if (face === 1) { const selected = randomLeader(); if (selected) { remove(story, selected, "captured"); detail += selected.name + " captured"; } else detail += "no searching leader to capture"; }
          if (face === 2) { const selected = randomLeader(); if (selected) { const xp = rollDie(3); addXP(story, selected, xp, "exploration tale"); detail += `${selected.name} +${xp} XP`; } else detail += "no searching leader"; }
          if (face === 3) { const bonus = roll(3); income += bonus; detail += `+${bonus} Marks`; }
          if (face === 4) { item(story, "Grifkis Shotgun"); detail += "Grifkis Shotgun"; }
          if ([5, 6].includes(face)) { item(story, selections[face]); detail += selections[face]; }
        }
        details.push(detail);
      });
      income = Math.max(0, income); story.campaign.bank += income;
      battle.exploration = {rolls, groups, events:details, income};
      story.campaign.phase = "purchase"; log(story, `Exploration [${rolls.join(", ")}]: ${details.join("; ") || "no events"}. Income ${income} Marks.`);
    }
    return {normalize, character, unit, faction, living, cost, value, abilities, leader, pendingLevel, log, addXP, recruit, dismiss, dismissable, sell, sellable, remove, recover, advance, item, buy, assign, startBattle, finishBattle, casualtyRoll, commitCasualties, explorationPool, explorationEvents, resolveExploration};
  }
  function create(context) {
    const E = createEngine(context.getData), esc = context.esc;
    const tales = window.QuarTales.create(context);
    const mhuddball = window.QuarMhuddball.create(context);
    let current = null, tab = "cycle", confirmDelete = null;
    
    const view = () => document.getElementById("view-narr");
    const story = () => context.getStories().find(entry => entry.id === current);
    const save = entry => { entry.updated = Date.now(); context.save(); };
    const options = (values, selected) => values.map(value => { const [key, label] = Array.isArray(value) ? value : [value, value]; return `<option value="${esc(key)}"${String(key) === String(selected) ? " selected" : ""}>${esc(label)}</option>`; }).join("");
    const PRIMARY = new Set(["create","start","finish-battle","commit-casualties","to-exploration","resolve-exploration","next-game","recruit"]), DANGER = new Set(["delete","retire"]);
    const button = (action, text, attributes = "", disabled = false) => `<button type="button" class="btn ${PRIMARY.has(action) ? "cta" : DANGER.has(action) ? "danger" : "ghost"}" data-camp="${action}" ${attributes}${disabled ? " disabled" : ""}>${text}</button>`;
    const savedTab = id => { try{ return localStorage.getItem("quar-narr-tab|" + id); }catch(e){ return null; } };
    const keepTab = (id, value) => { try{ localStorage.setItem("quar-narr-tab|" + id, value); }catch(e){} };
    const ui = context.ui, tile = (label, value) => `<div class="gt"><small>${label}</small><b>${esc(value)}</b></div>`;
    const select = (name, values, selected, attributes = "") => `<select aria-label="${esc(name)}" ${attributes}>${options(values, selected)}</select>`;
    const input = (name, value, attributes = "") => `<input aria-label="${esc(name)}" value="${esc(value)}" ${attributes}>`;
    const panel = (title, content, hint = "") => `<section class="card cp-panel"><header><h2>${title}</h2>${hint ? `<span class="hint">${hint}</span>` : ""}</header><div class="cp-body">${content}</div></section>`;
    const numeric = (name, value, attributes = "") => input(name, value, `type="number" min="0" max="9999" step="1" ${attributes}`);
    const safeCharacters = entry => E.living(entry).filter(character => !isVehicle(E.unit(entry, character)));
    const characterOptions = entry => safeCharacters(entry).map(character => [character.id, character.name]);
    const fail = error => context.toast(error.message || String(error));
    function checkpoint(entry) {
      const snapshot = clone(entry); delete snapshot.campaign.undo;
      entry.campaign.undo = snapshot;
    }
    function change(action) {
      const entry = story(); if (!entry) return;
      const before = clone(entry);
      try { checkpoint(entry); action(entry); save(entry); render(entry.id); }
      catch (error) { Object.keys(entry).forEach(key => delete entry[key]); Object.assign(entry, before); fail(error); }
    }
    function importStory(value) {
      if (value?.system === "mhuddball") return mhuddball.importStory(value);
      if (value?.system === "quar-tales") return tales.importStory(value);
      const entry = clone(value);
      if (!entry.id || typeof entry.id !== "string") entry.id = context.id();
      delete entry.campaign?.undo;
      return E.normalize(entry);
    }
    function render(id) {
      if (id === "mhuddball" || String(id || "").startsWith("mhudd-") || context.getStories().some(entry => entry.id === id && entry.system === "mhuddball")) { current = null; mhuddball.render(id); return; }
      if (id === "quar-tales" || String(id || "").startsWith("tale-") || context.getStories().some(entry => entry.id === id && entry.system === "quar-tales")) { current = null; tales.render(id); return; }
      if (!id || id === "every-quar-is-his-own-king") {
        current = null;
        if (id === "every-quar-is-his-own-king") renderList();
        else renderCommunity();
        return;
      }
      const entry = id && context.getStories().find(item => item.id === id);
      if (id !== current) { current = id || null; const t = current && savedTab(current); tab = ["cycle","roster","supply","journal","rules"].includes(t) ? t : "cycle"; }
      if (!entry) { current = null; renderList(); return; }
      try { const legacy = !entry.campaign; E.normalize(entry); if (legacy) save(entry); }
      catch (error) { view().innerHTML = panel("Campaign unavailable", `<p>${esc(error.message)}</p><a href="#/narrative">All campaigns</a>`); return; }
      const campaign = entry.campaign, faction = E.faction(entry);
      document.body.style.setProperty("--fac", faction.color || "#6b5d45");
      view().innerHTML = `<div class="cp">${ui.head(esc(entry.name), `<a class="btn ghost" href="#/narrative/every-quar-is-his-own-king" data-go="#/narrative/every-quar-is-his-own-king">&larr; ${esc(R.title)}</a>${button("undo", '<span class="cp-ul">Undo last action</span><span class="cp-us" aria-hidden="true">&#8630; Undo</span>', "", !campaign.undo)}`)}
        <div class="cp-hero"><div class="cp-hero-flag">${context.flag(faction)}</div><div class="cp-hero-txt"><span class="cp-kicker">${esc(R.title)} &middot; Battle ${campaign.gameNumber}</span><h2>${esc(faction.name)}</h2><p>Campaign patrol${entry.from ? " &middot; copied from " + esc(entry.from) : ""}</p></div>
        <div class="cp-metrics"><div><strong>${E.value(entry)}</strong><span>Patrol Marks</span></div><div><strong>${campaign.bank}</strong><span>Banked Marks</span></div><div><strong>${E.living(entry).length}</strong><span>On the roster</span></div><div><strong>${campaign.gameNumber}</strong><span>Battle</span></div></div></div>
        <nav class="cp-tabs" aria-label="Campaign pages">${[["cycle","Campaign cycle"],["roster","Roster"],["supply","Supply & recruits"],["journal","Journal"],["rules","Rules & scenarios"]].map(([key, label]) => `<button type="button" class="btn ghost" data-camp="tab" data-tab="${key}" aria-pressed="${tab === key}">${label}</button>`).join("")}</nav>
        ${tab === "cycle" ? cycle(entry) : tab === "roster" ? roster(entry) : tab === "supply" ? supply(entry) : tab === "journal" ? journal(entry) : rules(entry)}</div>`;
    }
    const ICONS = {
      eq:'<svg viewBox="0 0 24 24"><path d="M3 8l4 4 5-7 5 7 4-4-2 11H5L3 8z"/><path d="M5 19h14"/></svg>',
      tales:'<svg viewBox="0 0 24 24"><path d="M4 5.5C6.5 4 9.5 4 12 6c2.5-2 5.5-2 8-.5V19c-2.5-1.5-5.5-1.5-8 .5-2.5-2-5.5-2-8-.5V5.5z"/><path d="M12 6v13.5"/></svg>',
      mhudd:'<svg viewBox="0 0 24 24"><path d="M12 7.2c-1.3-.9-3.3-1-4.9-.2C4.6 8.2 3.4 11 3.6 14c.3 3.9 3.3 6.4 8.4 6.4s8.1-2.5 8.4-6.4c.2-3-1-5.8-3.5-7-1.6-.8-3.6-.7-4.9.2z"/><path d="M12 7.2c-1.8 1.9-2.6 4.6-2.6 7s.8 4.8 2.6 6.2c1.8-1.4 2.6-3.8 2.6-6.2s-.8-5.1-2.6-7z"/><path d="M12 7.2V5c0-1.2.8-2.1 2-2.3"/><path d="M12.2 5.3c1.2-1.4 3.4-1.6 4.7-.6-1 1.5-3 2-4.7.6z"/></svg>'
    };
    const modeOf = entry => entry.system === "quar-tales" ? ["Quar Tales", "m-tales"] : entry.system === "mhuddball" ? ["Mhuddball", "m-mhudd"] : [R.title, "m-eq"];
    function recordRow(entry, withMode) {
      const [mode] = modeOf(entry), fac = entry.system === "mhuddball" ? null : context.faction(entry.faction);
      const detail = entry.system === "mhuddball" ? `${esc(entry.mhuddball?.teams?.map(team => team.name + " " + (team.score || 0)).join(" – ") || "Match")}` : entry.system === "quar-tales" ? `${esc(fac?.name || "Unknown faction")} &middot; Skirmish ${number(entry.tales?.game || 1)}` : `${esc(fac?.name || "Unknown faction")} &middot; ${entry.campaign ? "Battle " + number(entry.campaign.gameNumber) + " &middot; " + esc(entry.campaign.phase) : "Older story, ready to convert"}`;
      return `<article>${fac ? `<span class="cp-rec-flag">${context.flag(fac)}</span>` : ""}<div><h3>${esc(entry.name)}</h3><p class="cp-rec-meta">${withMode ? `<b>${esc(mode)}</b> &middot; ` : ""}${detail}${entry.updated ? ` &middot; ${esc(new Date(entry.updated).toLocaleDateString())}` : ""}</p></div><a class="btn ghost" href="#/narrative/${esc(entry.id)}" data-go="#/narrative/${esc(entry.id)}">Open</a></article>`;
    }
    function renderCommunity() {
      document.body.style.removeProperty("--fac");
      const all = context.getStories(), count = system => all.filter(entry => system ? entry.system === system : !["quar-tales", "mhuddball"].includes(entry.system)).length;
      const recent = [...all].sort((left, right) => (right.updated || 0) - (left.updated || 0)).slice(0, 5);
      const card = (cls, icon, kicker, title, text, tags, href, n, noun) => `<article class="cp-mode ${cls}"><div class="cp-mode-top"><span class="cp-mode-ico" aria-hidden="true">${ICONS[icon]}</span><div><span class="cp-kicker">${kicker}</span><h2>${title}</h2></div></div><p>${text}</p><ul>${tags.map(tag => `<li>${tag}</li>`).join("")}</ul>${ui.credit(icon)}${icon === "mhudd" ? '<p class="cp-inspired">Inspired by the <i>Mhudd rules of play</i> in <i>Tales of the Breach</i>, an official book by Zombiesmith.</p>' : ""}<div class="cp-mode-go"><span class="hint">${n ? `${n} ${noun}${n === 1 ? "" : "s"} saved` : "Nothing saved yet"}</span><a class="btn cta" href="${href}" data-go="${href}">Open</a></div></article>`;
      view().innerHTML = `<div class="cp">${ui.head("Narrative")}${ui.warn()}${ui.tip("narr", "How the Narrative tab works", "Three community-made ways to play Quar beyond a single battle. Each one keeps its own rules, rosters and progress, separate from your patrols and from the other two. Their rules come from the community PDFs, not the official rulebooks.")}
        <div class="cp-modes">${card("m-eq", "eq", "Campaign", esc(R.title), "A 250-Mark patrol, a long war, and a story earned on the battlefield.", ["Small patrol", "Lasting injuries", "Specialisations"], "#/narrative/every-quar-is-his-own-king", count(), "campaign")}${card("m-tales", "tales", "Campaign", "Quar Tales", "Muster a 600–1000-point Force and follow it through the Long War: Characters, Supply, recovery and encounters.", ["Large Force", "Characters & Fodder", "Supply logistics"], "#/narrative/quar-tales", count("quar-tales"), "Tale")}${card("m-mhudd", "mhudd", "Gamemode", "Mhuddball", "Six Mhudders, five on the pitch, six gourds and one winner. Build two teams and run the match.", ["Five-a-side", "Pass & tackle", "One-off match"], "#/narrative/mhuddball", count("mhuddball"), "match")}</div>
        ${recent.length ? panel("Pick up where you left off", `<div class="cp-list cp-recs">${recent.map(entry => recordRow(entry, true).replace("</a></article>", `</a>${button("delete", confirmDelete === entry.id ? "Confirm delete" : "Delete", `data-id="${esc(entry.id)}" data-from="landing"`)}</article>`)).join("")}</div>`) : ""}</div>`;
    }
    function renderList() {
      document.body.style.removeProperty("--fac");
      const stories = context.getStories().filter(entry => !["quar-tales", "mhuddball"].includes(entry.system));
      const patrols = context.getPatrols().filter(entry => context.faction(entry.faction) && Object.values(entry.items || {}).some(value => value > 0));
      const setup = `<section class="card cp-panel cp-create" id="cp-create"><header><h2>New campaign</h2></header><div class="cp-body">
        <div class="cp-create-main">
          <div class="cp-create-hero"><span class="cp-create-flag"></span><div><strong class="cp-create-faction"></strong><span class="cp-create-summary">250 Marks to muster</span></div></div>
          <div class="cp-create-fields"><label class="cp-create-name">Campaign name${input("Campaign name", "", 'id="cp-name" maxlength="60" placeholder="The long road home"')}</label>
            <label>Faction${select("Faction", context.getData().factions.map(faction => [faction.id, faction.name]), null, 'id="cp-faction" data-facpick')}</label></div>
          ${button("create", "Begin campaign")}
        </div>
        <div class="cp-create-source"><label>Starting patrol${select("Starting patrol", [["", "Fresh muster - 250 Marks"], ...patrols.map(patrol => [patrol.id, patrol.name || "Unnamed patrol"])], "", 'id="cp-patrol"')}</label><p class="hint">Start fresh with 250 Marks, or copy a saved patrol worth at most 250 Marks. Your normal patrol stays unchanged.</p></div>
      </div></section>`;
      view().innerHTML = `<div class="cp">${ui.head(esc(R.title), '<a class="btn ghost" href="#/narrative" data-go="#/narrative">&larr; Narrative</a>')}${ui.credit("eq")}${ui.warn()}${ui.tip("narr-eq", "How campaigns work", "A 250-Mark patrol, a long war, and a story earned on the battlefield. Start from a 250-Mark bank, or copy a saved patrol worth at most 250 Marks. Campaign patrols never change your normal patrols. Vehicles return without lasting damage and never earn XP.")}
        ${setup}
        ${panel("Your campaigns", stories.length ? `<div class="cp-list cp-recs">${[...stories].sort((left, right) => (right.updated || 0) - (left.updated || 0)).map(entry => recordRow(entry).replace("</a></article>", `</a>${button("delete", confirmDelete === entry.id ? "Confirm delete" : "Delete", `data-id="${esc(entry.id)}"`)}</article>`)).join("")}</div>` : '<p class="hint">No campaigns yet. Start one above.</p>')}${ui.fold("cp-manual", "<b>Campaign rules & scenarios</b>", rules())}</div>`;
      const form = document.getElementById("cp-create");
      const sync = () => {
        const factionInput = document.getElementById("cp-faction");
        const patrol = context.getPatrols().find(entry => entry.id === document.getElementById("cp-patrol").value);
        if (patrol) factionInput.value = patrol.faction;
        const faction = context.faction(factionInput.value);
        form.style.setProperty("--fac", faction?.color || "#6b5d45");
        form.querySelector(".cp-create-flag").innerHTML = faction ? context.flag(faction) : "";
        form.querySelector(".cp-create-faction").textContent = faction?.name || "Choose a faction";
        form.querySelectorAll(".nfpick").forEach(picker => picker._sync?.());
      };
      form.addEventListener("change", sync);
      sync();
    }
    function cycle(entry) {
      const campaign = entry.campaign;
      const step = `<ol class="cp-steps">${phases.map((phase, index) => `<li${campaign.phase === phase ? ' aria-current="step"' : ""}><span>${index + 1}</span>${({muster:"Play game",battle:"In battle",casualties:"Casualties",experience:"Experience",exploration:"Exploration",purchase:"Purchase"})[phase]}</li>`).join("")}</ol>`;
      return step + (campaign.preparations?.length ? `<p class="cp-notice">Consumed preparations for this battle: ${esc(campaign.preparations.join(", "))}. Apply their effects when arranging the battlefield and choosing roles.</p>` : "") + (campaign.phase === "muster" ? setup(entry) : campaign.phase === "battle" ? battle(entry) : campaign.phase === "casualties" ? casualties(entry) : campaign.phase === "experience" ? experience(entry) : campaign.phase === "exploration" ? exploration(entry) : purchase(entry));
    }
    function getDraft(entry) {
      if (!entry.campaign.setupDraft) entry.campaign.setupDraft = {opponent:250, mission:entry.chars.some(character => character.campaign.status === "captured") ? "Daring Rescue" : R.missions[0].name, role:"attacker", failed:[], checks:{}, deployed:E.living(entry).filter(character => !character.campaign.skip).map(character => character.id)};
      return entry.campaign.setupDraft;
    }
    function boardMap(name) {
      const zone = (x, y, width, height, side) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" class="cp-zone-${side}"/>`;
      const label = (x, y, text) => `<text x="${x}" y="${y}" text-anchor="middle">${text}</text>`;
      const marker = (x, y, text) => `<circle cx="${x}" cy="${y}" r="9" class="cp-map-objective"/>${label(x, y - 16, text)}`;
      const diagrams = {
        "Surround and Confound": zone(0,0,80,360,"a") + zone(280,0,80,360,"a") + '<circle cx="180" cy="180" r="40" class="cp-zone-d"/>' + label(40,180,"A") + label(320,180,"A") + label(180,185,"D"),
        "Burn and Turn": zone(0,0,360,80,"d") + zone(0,240,360,120,"a") + label(310,45,"D") + label(180,300,"A") + marker(180,40,"Cache"),
        "Smash and Grab": zone(0,0,90,360,"a") + zone(270,0,90,360,"d") + label(45,180,"A") + label(315,180,"D") + label(180,180,"Village"),
        "Take the Town": zone(0,120,80,120,"a") + zone(280,120,80,120,"d") + marker(40,180,"Beacon") + marker(320,180,"Beacon") + [120,240].flatMap(x => [40,320].map(y => marker(x,y,"Cache"))).join(""),
        "Brave Little Quar": zone(0,180,90,180,"a") + zone(270,0,90,180,"d") + label(45,275,"A") + label(315,90,"D") + marker(180,180,"Brewery") + marker(30,30,"Ale") + marker(330,330,"Ale"),
        "Daring Rescue": zone(0,0,360,200,"d") + zone(0,280,360,80,"a") + label(310,45,"D") + label(180,330,"A") + marker(180,100,"Captive"),
        "PykPyk Pillagers": zone(0,0,180,360,"a") + zone(180,0,180,360,"d") + label(90,180,"A") + label(270,180,"D") + label(180,330,"2D6 scattered objectives")
      };
      if (!diagrams[name]) return "";
      return `<figure class="cp-map"><svg viewBox="-10 -10 380 380" role="img" aria-label="${esc(name)} deployment schematic: attacker A, defender D"><rect width="360" height="360" class="cp-map-board"/>${diagrams[name]}<rect width="360" height="360" fill="none" class="cp-map-outline"/></svg><figcaption>3 &times; 3 feet &middot; A: attacker &middot; D: defender<br>Schematic redrawn from the PDF; use the measurements below.</figcaption></figure>`;
    }
    function missionCard(name, closed = false) {
      const mission = R.missions.find(item => item.name === name);
      return mission ? `<details class="cp-mission"${closed ? "" : " open"}><summary>${closed ? "Scenario: " : ""}${esc(mission.name)} <span class="hint">PDF pp. ${mission.pages}</span></summary>${boardMap(name)}<dl><dt>Battlefield & deployment</dt><dd>${esc(mission.setup)}</dd><dt>Objectives</dt><dd>${esc(mission.objective)}</dd><dt>Twists</dt><dd>${esc(mission.twist)}</dd><dt>Campaign rewards</dt><dd>${esc(mission.reward)}</dd><dt>Ends</dt><dd>${esc(mission.end)}</dd></dl></details>` : '<p class="hint">Use your chosen core-book scenario. Record scenario XP and rewards below.</p>';
    }
    function setup(entry) {
      const draft = getDraft(entry), under = underquar(E.value(entry), draft.opponent);
      return panel("Before the next game", `${ui.tip("eq-before-the-next-game", "How this works", "Start at 250 Marks. Spend the bank on the Supply & recruiting page. All faction profiles are available; campaign recruitment is not restricted by the normal builder's Force Allowance checks.")}${entry.campaign.legacy ? '<p class="cp-notice">Converted story: names, notes and fallen entries were retained. Starting XP uses each unit category. Review the roster; an over-250 opening patrol must be reduced before play.</p>' : ""}<div class="cp-form"><label>Opponent's patrol value${numeric("Opponent Marks", draft.opponent, 'data-draft="opponent"')}</label><label>Scenario${select("Scenario", [...R.missions.map(mission => mission.name), "Core rulebook scenario"], draft.mission, 'data-draft="mission"')}</label><label>Your role${select("Your role", ["attacker", "defender"], draft.role, 'data-draft="role"')}</label></div>
        <div class="cp-notice">${under.difference > 0 ? `You are the Underquar by ${under.difference} Marks.${under.bonuses.length ? `<ul>${under.bonuses.map(text => `<li>${esc(text)}</li>`).join("")}</ul>` : " No band bonus."}` : under.difference < 0 ? `Your opponent is the Underquar by ${-under.difference} Marks.${(() => { const theirs = underquar(draft.opponent, E.value(entry)).bonuses; return theirs.length ? `<ul>${theirs.map(text => `<li>${esc(text)}</li>`).join("")}</ul>` : " No band bonus."; })()}` : "Equal patrol values; no Underquar."}</div><p class="hint">Underquar bonuses stack: you get the bonus for your band and every band above it. The roster value includes models missing this game, excludes captives and unassigned supplies/bank.</p>
        ${button("roll-mission", "Roll mission D6")}${missionCard(draft.mission)}
        <h3>Deployment roll call</h3>${(() => { const can = E.living(entry).filter(character => !character.campaign.skip && !draft.failed.includes(character.id)), on = can.filter(character => draft.deployed.includes(character.id)).length; return `<div class="cp-selall">${button("deploy-all", "Select all", "", on === can.length)}${button("deploy-none", "Select none", "", !on)}<span class="hint"><b>${on}</b> of ${can.length} deploying</span></div>`; })()}${under.difference >= 36 ? `<div class="cp-notice"><b>Extra on the table this game (Underquar):</b><ul>${under.bonuses.filter(text => /PykPyk|2 XP/.test(text)).map(text => `<li>${esc(text)}</li>`).join("")}</ul></div>` : ""}<div class="cp-list">${E.living(entry).map(character => { const deep = character.campaign.injuries.includes(3), checked = draft.checks[character.id]; return `<article><label><input type="checkbox" data-deploy="${esc(character.id)}"${draft.deployed.includes(character.id) && !character.campaign.skip && !draft.failed.includes(character.id) ? " checked" : ""}${character.campaign.skip || draft.failed.includes(character.id) ? " disabled" : ""}> ${esc(character.name)} <span class="hint">${character.campaign.skip ? "Misses this game" : isVehicle(E.unit(entry, character)) ? "Vehicle: restored for every game" : deep ? checked ? "Deep wound D6: " + checked : "Deep wound: check required" : "Available"}</span></label>${deep && !character.campaign.skip ? button("deep", checked ? "Reroll deep wound" : "Check deep wound D6", `data-id="${esc(character.id)}"`, !!checked) : ""}</article>`; }).join("")}</div>
        <p class="hint">Uncheck models that are not participating. Every deployed survivor earns 1 XP; undeployed models do not, except the 76+ Underquar bonus applies to the entire roster.</p>${button("start", "Begin battle")}`, "PDF pp. 1-2");
    }
    function battle(entry) {
      const session = entry.campaign.battle, mission = session.mission, fac = context.faction(entry.faction);
      const ids = Object.keys(session.rows), out = ids.filter(id => ["ooa","removed"].includes(session.rows[id].outcome)).length;
      const neverRout = mission === "Burn and Turn" && session.role === "defender", pct = mission === "Daring Rescue" && session.role === "attacker" ? 50 : 25;
      const routing = !neverRout && ids.length && out / ids.length >= pct / 100;
      const stepper = (label, field, value, min = 0, max = 99) => `<label class="gstep"><span class="gsl">${label}</span>${input(label, value, `type="number" min="${min}" max="${max}" step="1" inputmode="numeric" data-stepper data-battle="${field}"`)}</label>`;
      const live = `<div class="cp-live" style="--fac:${esc(fac?.color || "")}">${stepper("Turn", "turn", session.turn, 1, 30)}${stepper("Your Pluck", "pluck", session.pluck)}${stepper("Your VP", "vp", session.vp, 0, 999)}${stepper("Enemy VP", "enemyVP", session.enemyVP, 0, 999)}<span class="gstep"><span class="gsl">Out of action</span><b class="cp-live-n">${out} / ${ids.length}</b></span><span class="cp-live-x">${session.difference >= 6 ? button("under-pluck", session.pluckRolled ? "Underquar Pluck rolled" : "Roll Underquar D3 Pluck", "", !!session.pluckRolled) : ""}</span></div>`;
      const routNote = neverRout ? "Defender never routs in this mission." : routing ? `<b>Rout test due:</b> ${out} of ${ids.length} models are out (${pct}% or more). At each round start, test your highest available Skill; failure loses the battle. At round end you may choose to rout.` : `Rout tests start once ${Math.ceil(ids.length * pct / 100)} of ${ids.length} models are out (${pct}%).`;
      const rosterRows = ids.map(id => { const row = session.rows[id], character = entry.chars.find(item => item.id === id), data = E.unit(entry, character), vehicle = isVehicle(data), gear = character.campaign.equipment.map(item => item.name);
        return `<article class="cp-brow${["ooa","removed"].includes(row.outcome) ? " is-out" : ""}" data-character="${esc(id)}"><div class="cp-brow-top"><div class="cp-brow-who"><strong>${esc(character.name)}</strong><span class="hint">${esc(data.name)}${data.variant ? " (" + esc(data.variant) + ")" : ""}${vehicle ? " · vehicle: no XP or casualty roll" : ""}</span></div>${statTiles(entry, character)}</div>${select("Status of " + character.name, [["ready","Ready / on table"],["ooa","Out of action"],["removed","Removed by damage"]], row.outcome, 'data-brow="outcome" data-seg="tone"')}<div class="cp-brow-rec"><label>Tend 6s${input("Tend rolls of 6 for " + character.name, row.tend, 'type="number" min="0" max="20" step="1" data-stepper data-brow="tend"')}</label><label>Objective XP${input("Objective XP for " + character.name, row.objective, 'type="number" min="0" max="20" step="1" data-stepper data-brow="objective"')}</label><label class="qt-mvq">${input("MVQ", "1", `type="checkbox" data-brow="mvq"${row.mvq ? " checked" : ""}`)} MVQ</label>${row.scenarioXP ? `<span class="hint">+${row.scenarioXP} scenario XP</span>` : ""}</div><details class="cp-kit"><summary>Weapons & rules</summary><div class="cp-kitbody">${ui.weapons(entry.faction, data)}<p><b>Abilities:</b> ${ui.tips(entry.faction, E.abilities(entry, character)) || "None"}${character.campaign.injuries.includes(4) ? " - Ranged -1 from lost eye" : ""}</p>${gear.length ? `<p><b>Carried:</b> ${gear.map(esc).join(", ")}</p>` : ""}${ui.rules(entry.faction, data)}</div></details></article>`; }).join("");
      return panel("Battle field desk", `${live}<p class="cp-notice">${routNote}</p>${session.difference >= 36 ? `<p class="hint"><b>Underquar extras:</b> ${esc(underquar(session.ownValue, session.opponent).bonuses.filter(text => /PykPyk|discarded card|2 XP/.test(text)).join(" "))}</p>` : ""}<h3>Your patrol</h3><p class="hint">Tap a status as it happens at the table. Tend 6s, objective XP and MVQ are paid out after the battle.</p><div class="cp-list">${rosterRows}</div>${missionCard(mission, true)}${missionTools(entry)}<div class="cp-form"><label>Result${select("Battle result", [["","Select result"],["win","Victory"],["draw","Draw"],["loss","Defeat / routed"]], session.result, 'data-battle="result" data-seg="tone"')}</label><label>Battle notes<textarea data-battle="notes" maxlength="4000">${esc(session.notes)}</textarea></label></div><p class="hint">Removed means removed by damage. An escaped messenger counts as surviving. Only one MVQ.</p>${button("finish-battle", "End battle & roll casualties")}`, `Battle ${entry.campaign.gameNumber} - ${esc(session.role)}`);
    }
    function missionTools(entry) {
      const session = entry.campaign.battle;
      const tools = ({
        "Surround and Confound":[["messenger","Messenger escapes (turn 3+): D3 XP"]],
        "Burn and Turn":[["plant","Place demolition charge"],["plant-enemy","Enemy places demolition charge"],["card","Draw next card: countdown -1"],["defuse","Successful Defuse: 1 XP"]],
        "Smash and Grab":[["house","Investigate house D6"],["informant-death","Enemy killed informant: gain 2D6 Marks"]],
        "Take the Town":[],
        "Brave Little Quar":[["ale1","Ale barrel: 1 contributor"],["ale2","Ale barrel: 2 contributors"],["ale3","Ale barrel: 3 contributors"]],
        "Daring Rescue":[["rescue-status","Reveal captive D6"],["rescue-xp","Defender task OOA near captive: +1 XP"],["rescue-return","Captive escapes: restore roster"]],
        "PykPyk Pillagers":[["investigate","Investigate supplies D6"],["automatic-supplies","Collect after rout D6 (no XP)"]]
      })[session.mission] || [];
      const attackerOnly = ["plant", "rescue-status", "rescue-return"];
      const defenderOnly = ["messenger", "plant-enemy", "defuse", "rescue-xp"];
      const availableTools = tools.filter(([key]) => !(session.role === "attacker" && defenderOnly.includes(key)) && !(session.role === "defender" && attackerOnly.includes(key)));
      return `<details class="cp-mission"><summary>Scenario action tools & reward ledger</summary><p class="hint">Select the acting model. Click only when the action happens; repeated legitimate actions are recorded separately. Use Undo for a mistaken click. Tool XP is awarded during the Experience step.</p><label>Acting model${select("Acting model", Object.keys(session.rows).map(id => [id, entry.chars.find(character => character.id === id).name]), session.actor, 'id="cp-actor" data-battle="actor"')}</label>${session.mission === "Daring Rescue" && session.role === "attacker" ? `<label>Captive being rescued${select("Captive", entry.chars.filter(character => character.campaign.status === "captured").map(character => [character.id, character.name]), null, 'id="cp-captive"')}</label><label><input type="checkbox" id="cp-rescue-equipment"> Equipment recovered (agree with opponent)</label>` : ""}<div class="cp-actions">${availableTools.map(([key, label]) => button("tool", label, `data-tool="${key}"`)).join("")}</div>${session.countdown != null ? `<p>Charge countdown: <b>${session.countdown}</b></p>` : ""}<p class="hint">House investigations, barrel use and supply-objective availability are tracked at the table. Take the Town VP, messenger VP and brewery control are entered above, not auto-inferred.</p><ul>${session.tools.slice(-8).map(tool => `<li>${esc(tool)}</li>`).join("")}</ul></details>`;
    }
    function casualties(entry) {
      const session = entry.campaign.battle;
      const required = entry.chars.filter(character => session.rows[character.id] && ["ooa","removed"].includes(session.rows[character.id].outcome) && !isVehicle(E.unit(entry, character)));
      const surgeons = E.living(entry).filter(character => E.abilities(entry, character).includes("Field Surgeon"));
      return panel("Determine casualties", `${ui.tip("eq-determine-casualties", "How this works", "OOA: screen on D6 (1-3 rolls on chart; 4-6 no lasting effect). Removed by damage: always roll 2D6. Results stay provisional until you continue. Vehicles never roll.")}${required.filter(character => !session.casualties[character.id]).length > 1 ? `<div class="cp-selall">${button("casualty-all", `Roll all ${required.filter(character => !session.casualties[character.id]).length} casualties`)}<span class="hint">Or roll one at a time below.</span></div>` : ""}${required.map(character => { const result = session.casualties[character.id]; return `<article class="cp-casualty"><h3>${esc(character.name)}</h3><p>${result ? `${result.screening ? "Screen D6 " + result.screening + "; " : ""}${result.total ? "Chart 2D6 " + result.total + ": " + esc(R.casualties[result.total - 2]) : "No ill effects."}${result.rerolled ? " (rerolled)" : ""}` : "Awaiting roll"}</p>${button("casualty", "Roll casualty", `data-id="${esc(character.id)}"`, !!result)}${!result ? `<div class="cp-inline">${input("Screening D6", "", `type="number" min="1" max="6" id="cp-screen-${character.id}" placeholder="D6"`)}${input("Casualty 2D6", "", `type="number" min="2" max="12" id="cp-total-${character.id}" placeholder="2D6"`)}${button("manual-casualty", "Record physical dice", `data-id="${esc(character.id)}"`)}</div>` : ""}${result?.total && !result.rerolled ? `<div class="cp-actions">${button("reroll-kit", "Use First aid kit", `data-id="${esc(character.id)}"`, !entry.campaign.supply.some(item => item.name === "First aid kit"))}${surgeons.map(surgeon => button("reroll-surgeon", "Field Surgeon: " + esc(surgeon.name), `data-id="${esc(character.id)}" data-surgeon="${esc(surgeon.id)}"`, session.surgeons.includes(surgeon.id))).join("")}</div>` : ""}</article>`; }).join("") || '<p class="hint">No non-vehicle casualties this battle.</p>'}<p class="hint">First aid kits are consumed; each Field Surgeon permits one reroll this casualty step. One reroll per casualty result is the builder's conservative convention. A second lasting injury in the 3/4/10/11 group causes retirement. See the interpretation notes.</p>${button("commit-casualties", "Confirm casualties & award XP")}`, "PDF p. 3");
    }
    function advancement(entry, character) {
      if (!E.pendingLevel(character) || character.campaign.status !== "active") return "";
      const stats = character.campaign, pending = stats.pendingAdvance;
      const specialization = stats.specialization || pending?.specialization || "Raider";
      return `<div class="cp-advance" data-character="${esc(character.id)}"><h4>Level ${stats.level + 1} advancement pending</h4><label>Specialization${select("Specialization", Object.keys(R.advances), specialization, `data-specialization="${esc(character.id)}"${stats.specialization || pending ? " disabled" : ""}`)}</label>${pending ? `<p>D6 ${pending.roll}: ${esc(pending.effect)} already known. Choose a result from this level's chart.</p>${select("Duplicate advancement choice", R.advances[pending.specialization][stats.level], null, `id="cp-choice-${character.id}"`)}${button("choose-advance", "Confirm chosen result", `data-id="${esc(character.id)}"`)}` : `<div class="cp-inline">${button("advance", "Roll advancement D6", `data-id="${esc(character.id)}"`)}${input("Advancement physical D6", "", `type="number" min="1" max="6" id="cp-advance-${character.id}"`)}${button("manual-advance", "Record D6", `data-id="${esc(character.id)}"`)}</div>`}</div>`;
    }
    function experience(entry) {
      return panel("Experience & advancement", `${ui.tip("eq-experience-advancement", "How this works", "XP has been awarded once: +1 per survivor, +1 per Tend Wounded roll of 6, recorded objective XP, +1 to your chosen MVQ, and any scenario/Underquar XP. Vehicles never gain XP. Standard, Attached Specialist and Weapon Team entries start at 0; Command, Specialist and Cavalry start at 3 XP without a free advancement.")}<div class="cp-list">${E.living(entry).filter(character => !isVehicle(E.unit(entry, character))).map(character => `<article class="cp-xp"><div><strong>${esc(character.name)}</strong><span class="hint">${character.campaign.xp} XP &middot; level ${character.campaign.level} &middot; ${esc(character.campaign.specialization || "No specialization yet")}</span></div>${advancement(entry, character)}</article>`).join("")}</div>${button("to-exploration", "Continue to exploration", "", E.living(entry).some(E.pendingLevel))}`, "PDF pp. 4-6 - levels at 0 / 3 / 7 / 12 XP");
    }
    function exploration(entry) {
      const pool = E.explorationPool(entry), session = entry.campaign.battle;
      const draft = session.explorationDraft;
      const kept = draft ? draft.rolls.filter((value, index) => index !== draft.discard) : [];
      const events = draft ? E.explorationEvents(kept, draft.groups) : [];
      return panel("Explore the battlefield", `${ui.tip("eq-explore-the-battlefield", "How this works", "Each surviving Leader contributes dice equal to the first number in Leader. Cap at six, then add the winner's die; if seven are rolled, discard one before resolving. Sum the kept dice for income, then apply events.")}<p>Searching leaders: ${pool.leaders.map(character => `${esc(character.name)} (${E.leader(entry, character)} dice)`).join(", ") || "None"}. <b>${pool.count} D6 to roll${pool.count === 7 ? "; keep six" : ""}.</b></p>${!draft ? `${button("roll-exploration", "Roll exploration dice")}<div class="cp-inline">${input("Physical exploration dice", "", 'id="cp-physical-exploration" placeholder="e.g. 1 3 3 5"')}${button("manual-exploration", "Record physical dice")}</div>` : `<div class="cp-dice">${draft.rolls.map((value, index) => button("discard", String(value) + (draft.discard === index ? " (discarded)" : ""), `data-index="${index}" aria-pressed="${draft.discard === index}"`, pool.count !== 7)).join("")}</div><p class="hint">Income before events: ${kept.reduce((total, value) => total + value, 0)} Marks. Default: highest set per face, capped at quadruples.</p>${Array.from({length:6}, (_, index) => index + 1).filter(face => kept.filter(value => value === face).length >= 3).map(face => `<label>Event group for face ${face}${select("Event group", Array.from({length:Math.min(4, kept.filter(value => value === face).length) - 1}, (_, index) => index + 2), draft.groups[face] || Math.min(4, kept.filter(value => value === face).length), `data-group="${face}"`)}</label>`).join("")}<ul>${events.map(event => `<li>${event.size} x ${event.face}: ${esc(event.text)}${(event.size === 2 && event.face === 5) || (event.size === 3 && [2,4].includes(event.face)) || (event.size === 4 && [5,6].includes(event.face)) ? select("Possible recovered item", event.size === 4 ? R.shop.filter(item => event.face === 6 || item.cost <= 10).map(item => item.name) : event.face === 4 ? ["Splagen torpedo","Doru"] : ["Harlech","Bogen"], draft.choices[event.face], `data-find="${event.face}"`) : ""}</li>`).join("") || "<li>No matching sets.</li>"}</ul><p class="hint">Select any possible reward before resolving. Follow-up dice and randomly selected searching leaders are recorded in the journal.</p>${button("resolve-exploration", "Resolve events & bank income", "", pool.count === 7 && draft.discard == null)}`}`, "PDF pp. 7-8");
    }
    function purchase(entry) {
      const exploration = entry.campaign.battle.exploration;
      return panel("Purchase & prepare", `<p>Exploration banked <b>${exploration.income} Marks</b>. ${esc(exploration.events.join("; "))}</p><p>Spend Marks on new Rhyflers or shop equipment, move purchased equipment between Rhyflers, and resolve any exploration advancement before the next game. Banked Marks carry forward.</p>${button("tab-supply", "Open supply & recruiting")}${button("tab-roster", "Review roster & advancement")}<p>Patrol value for the next game: <b>${E.value(entry)} Marks</b>. Bank: <b>${entry.campaign.bank} Marks</b>.</p>${button("next-game", "Finish purchase & prepare next battle", "", E.living(entry).some(E.pendingLevel))}`, "PDF pp. 9-10");
    }
    function profile(entry, character) {
      const stats = character.campaign;
      return statTiles(entry, character) + `<p><b>Abilities:</b> ${ui.tips(entry.faction, E.abilities(entry, character)) || "None"}${stats.injuries.includes(4) ? " - Ranged -1 from lost eye" : ""}</p>`;
    }
    // Stat tiles with advances, injuries and a Sword already applied (also shown on each battle-desk row).
    function statTiles(entry, character) {
      const stats = character.campaign, data = E.unit(entry, character);
      const profiles = data.profiles || [{label:data.crew ? "Weapon crew (" + data.crew.crew + ")" : "Vehicle", ...(data.crew || data.vehicle || {}), equip:(data.weapons || []).map(weapon => weapon.name)}];
      return profiles.map(base => {
        const count = effect => stats.advances.filter(advance => advance.effect === effect).length;
        const skill = Number(base.sk) + count("+1 Skill") - (stats.injuries.includes(11) ? 1 : 0);
        const toughness = Number(base.t) + count("+1 T");
        const movement = String(base.ma).replace(/\d+/g, value => String(Math.max(0, Number(value) + count("+1 MA") - (stats.injuries.includes(10) ? 1 : 0))));
        const might = stats.equipment.some(item => item.name === "Sword") ? "2d6" : (base.mt || "n/a");
        return `<div class="gtiles">${profiles.length > 1 && base.label ? `<span class="gtlab">${esc(base.label)}</span>` : ""}${tile("Sk", Number.isFinite(skill) ? skill : base.sk)}${tile("Mt", might)}${tile("MA", movement)}${tile("T", Number.isFinite(toughness) ? toughness : base.t)}</div>`;
      }).join("");
    }
    function effectReference(entry, character) {
      const definitions = context.getData().abilities;
      const normalizeName = value => value.toLowerCase().replace(/[^a-z]/g, "");
      const rows = E.abilities(entry, character).map(ability => {
        const name = ability.replace(/\([^)]*\)/g, "").trim();
        const key = Object.keys(definitions).find(key => normalizeName(key) === normalizeName(name) || (name === "Blunt-rounds" && key === "Blunt Round"));
        const custom = name === "Slippery" ? "+1 to disengage skill checks." : name === "Field Surgeon" ? "One casualty-chart reroll per casualty step for each patrol member with this ability." : name.startsWith("+1") ? "Permanent characteristic increase, included in the displayed profile." : "";
        return key || custom ? `<dt>${esc(ability)}</dt><dd>${esc(custom || definitions[key].text)}${key ? ` <span class="hint">${esc(definitions[key].src || "Core rules")}</span>` : ""}</dd>` : "";
      });
      rows.push(...character.campaign.equipment.map(item => `<dt>${esc(item.name)}</dt><dd>${esc(R.shop.find(shop => shop.name === item.name)?.rule || "Recovered faction weapon: use its core profile.")}</dd>`));
      return `<details class="cp-mission"><summary>Ability & equipment effects</summary><dl>${rows.join("") || "<dd>No additional rules.</dd>"}</dl></details>`;
    }
    function roster(entry) {
      const mutable = ["muster","purchase"].includes(entry.campaign.phase);
      return panel("Campaign roster", `${ui.tip("eq-roster", "About the profiles", "Profiles include permanent Skill, MA, Toughness and Sword changes. Rolled combat modifiers, abilities and equipment effects are listed separately. Slippery gives +1 to disengage skill checks; Field Surgeon gives one casualty reroll per member with the ability per casualty step.")}<div class="cp-roster">${entry.chars.map(character => { const stats = character.campaign, data = E.unit(entry, character); const baseGear = stats.startingEquipmentLost ? ["Lost on capture; field with recovered equipment only"] : [...new Set([...(data.profiles || []).flatMap(base => base.equip || []), ...(data.weapons || []).map(weapon => weapon.name)])]; return `<article class="card cp-character${stats.status !== "active" ? " is-gone" : ""}" data-character="${esc(character.id)}"><header><div class="cp-who">${context.dtag(character.name)}<span class="hint">${esc(data.name)}${data.variant ? " &middot; " + esc(data.variant) : ""} &middot; ${esc(data.cat)}</span></div><span class="cp-status">${esc(stats.status)}${stats.skip ? " &middot; misses next game" : ""}</span><span class="cp-cost">${E.cost(entry, character)} M</span></header><div class="cp-body">${isVehicle(data) ? "<p>Vehicle: no XP, advancement or lasting injury. Automatically available next game.</p>" : `<p><b>${stats.xp} XP &middot; Level ${stats.level}</b> &middot; ${esc(stats.specialization || "Unspecialized")}${stats.senior ? ' <span class="hint">(senior starting level, no +3 Mark charge)</span>' : ""}</p>`}${profile(entry, character)}${effectReference(entry, character)}${stats.startingEquipmentLost ? '<p class="cp-notice">Returned without original equipment. Original base profile cost is retained; agree any disarmed weapon-dependent combat stats at the table, then equip replacements from supply.</p>' : ""}${stats.startingEquipmentLost ? `<p><b>Starting equipment:</b> ${esc(baseGear.join(", "))}</p>` : `<p><b>Starting equipment (locked)</b></p>${ui.weapons(entry.faction, data) || '<p class="hint">None listed</p>'}`}${stats.advances.length ? `<p><b>Advancements:</b> ${stats.advances.map(advance => `${esc(advance.effect)} (+${advance.level === 3 ? 4 : 3} M)`).join(", ")}</p>` : ""}${stats.injuries.length ? `<p><b>Lasting injuries:</b> ${stats.injuries.map(roll => esc(R.casualties[roll - 2])).join(" ")}</p>` : ""}${stats.equipment.length ? `<div class="cp-list">${stats.equipment.map(item => `<article><div><b>${esc(item.name)}</b> <span class="hint">+${item.cost} M${item.attachment ? " &middot; " + esc(item.attachment) : ""}</span></div>${button("unequip", "Return to supply", `data-item="${esc(item.id)}" data-id="${esc(character.id)}"`, !mutable)}</article>`).join("")}</div>` : ""}${["experience","purchase","muster"].includes(entry.campaign.phase) ? advancement(entry, character) : ""}<details class="cp-mission"><summary>Name & service record</summary><label>Name${input("Rhyfler name", character.name, 'data-character-field="name" data-rname maxlength="80"')}</label><label>Service record<textarea data-character-field="backstory" maxlength="4000" rows="2">${esc(character.backstory || "")}</textarea></label></details>${mutable && stats.status === "active" ? button("retire", "Retire (no refund)", `data-id="${esc(character.id)}"`) : ""}${mutable && stats.status === "captured" ? `<p>Ransom cost and equipment return are negotiated. Enter the agreed cost; recovered gear is optional.</p>${numeric("Ransom Marks", 0, `id="cp-ransom-${character.id}"`)}<label><input type="checkbox" id="cp-return-gear-${esc(character.id)}"> Return all captured equipment (including starting weapons)</label>${button("ransom", "Pay ransom & restore", `data-id="${esc(character.id)}"`)}` : ""}</div></article>`; }).join("") || '<p class="hint">No one on the roster yet. Recruit on Supply & recruits.</p>'}</div>`, "Patrol value leaves out the bank, supplies, and dead, retired or captured members");
    }
    function supply(entry) {
      const mutable = ["muster","purchase"].includes(entry.campaign.phase);
      const units = E.faction(entry).units.filter(unit => Number.isFinite(unit.pts));
      // Patrol-Builder layout (5 Nov, user request): your patrol on the left, the Muster Roll on the right; names edited with the pencil.
      const groups = [...new Set(E.living(entry).map(character => character.unitId))].map(unitId => { const members = E.living(entry).filter(character => character.unitId === unitId), data = E.unit(entry, members[0]) || {};
        return {id:unitId, name:data.name || "Unknown unit", variant:data.variant, members, pts:members.reduce((total, character) => total + E.cost(entry, character), 0), canAdd:mutable && Number.isFinite(data.pts) && entry.campaign.bank >= data.pts, canRemove:E.dismissable(entry, unitId).length > 0}; });
      const yours = `<section id="cp-yours" class="card cp-panel cp-yours"><header><h2>Your patrol</h2><span class="hint">${E.living(entry).length} rhyfler${E.living(entry).length === 1 ? "" : "s"} &middot; ${groups.reduce((total, group) => total + group.pts, 0)} M</span></header>${ui.force({key:"eq|" + entry.id, attr:"data-camp", unit:"M", groups, input:character => `data-character="${esc(character.id)}" data-character-field="name"`, empty:"No one on the roster yet. Tap + on the Muster Roll to recruit."})}</section>`;
      const jump = (to, text) => `<div class="cp-jumps"><button type="button" class="btn ghost cp-jump" data-jump="${to}">${text}</button></div>`;
      const recruit = panel("Recruit reinforcements", `${jump("eq-shop", "Go to the Equipment shop &darr;")}<p>Bank: <b>${entry.campaign.bank} Marks</b>. ${mutable ? "Purchase now. New entries use their printed profile cost." : "Purchases and transfers unlock during Muster and Purchase."}</p><p class="hint">Tap a name to see its profile; press + to recruit it with Marks. New recruits get a random name; change it with the pencil in Your patrol.</p>${ui.roll(E.faction(entry), units, {attr:"data-camp", unit:"M", fac:entry.faction, disabled:unit => !mutable || entry.campaign.bank < unit.pts, removable:unit => E.dismissable(entry, unit.id).length > 0, note:unit => { const n = E.living(entry).filter(character => character.unitId === unit.id).length; return n ? `${n} on roster` : ""; }})}`).replace('<section class="card cp-panel"', '<section id="eq-recruits" class="card cp-panel"');
      // v.47 (user request): one two-column layout. Left: Muster Roll, then the Equipment shop. Right: Your patrol with Your equipment
      // right under it. "Go to the Equipment shop" / "Back to recruiting" buttons jump between the two (handled in index.html, data-jump).
      const equipment = equipmentSection(entry, mutable, jump);
      const patrolPts = groups.reduce((total, group) => total + group.pts, 0);
      return `<div class="cp-build cp-build2"><div class="cp-main">${recruit}${equipment.left}</div><div class="cp-side">${yours}${equipment.right}</div></div>${ui.mbar(`<span class="cp-mb-k">Bank</span> <b>${entry.campaign.bank} M</b> <span class="cp-mb-sep">&middot;</span> <span class="cp-mb-k">Patrol</span> <b>${patrolPts} M</b>`, [["eq-shop","Shop"],["cp-yours","View patrol"]])}`;
    }
    // Equipment laid out like recruiting (5 Nov, user request: "the equipment shop should be in a better spot and there should be another
    // right hand menu for the added equipment"): the shop as a Muster-Roll-style list on the left (tap a name for its rule, − returns, + buys),
    // and "Your equipment" on the right: what is in the patrol supply (assign / consume / agree a value) and what each rhyfler carries (Return).
    function equipmentSection(entry, mutable, jump) {
      const kinds = [["Equipment", R.shop.filter(item => !item.item)], ["Consumables", R.shop.filter(item => item.item)]];
      const shop = `<div class="cat cp-roll">${kinds.map(([kind, list]) => `<details class="catdd" open><summary><span class="chev">&#9656;</span><h3>${kind}</h3><span class="ccount">${list.length}</span></summary>${list.map((item, index) => { const bought = E.sellable(entry, item.name).length, have = entry.campaign.supply.filter(value => value.name === item.name).length + E.living(entry).reduce((total, character) => total + character.campaign.equipment.filter(value => value.name === item.name).length, 0);
        return `<div class="unit${index % 2 ? " alt" : ""}"><div class="urow"><button type="button" class="uname" data-roll="toggle" aria-expanded="false"><span class="chev">&#9656;</span>${ui.item(item.name, item.item ? "use" : "eq")}<b>${esc(item.name)}</b></button><span class="fa">${have ? `${have} owned` : ""}</span><span class="pts">${item.cost}<small>M</small></span><span class="btns"><button type="button" class="add sub" data-camp="sell" data-name="${esc(item.name)}" aria-label="Return one ${esc(item.name)} for a refund"${bought ? "" : " disabled"}>&minus;</button><button type="button" class="add" data-camp="buy" data-name="${esc(item.name)}" aria-label="Buy ${esc(item.name)}"${!mutable || entry.campaign.bank < item.cost ? " disabled" : ""}>+</button></span></div><div class="cp-udet" hidden><p>${esc(item.rule)}</p></div></div>`; }).join("")}</details>`).join("")}</div>`;
      const left = panel("Equipment shop", `${jump("eq-recruits", "&uarr; Back to recruiting")}<p>Bank: <b>${entry.campaign.bank} Marks</b>. ${mutable ? "Buy now; new items go to Your equipment." : "Buying unlocks during Muster and Purchase."}</p>${ui.tip("eq-equipment-shop", "How this works", "Tap a name to see what it does; press + to buy it. Bought items wait in the patrol supply (Your equipment) until you give them to a rhyfler. Carried equipment adds its cost to that rhyfler's value. Maximum three pieces per rhyfler, including locked starting equipment. Consumables stay in the supply until used. − returns an item bought since the last battle for a full refund.")}${shop}`);
      const supplyRows = entry.campaign.supply.map(item => { const gearRule = R.shop.find(value => value.name === item.name);
        return `<div class="prow eq-row" data-item="${esc(item.id)}"><div class="pname"><div class="pnm">${ui.item(item.name, gearRule?.item ? "use" : "eq")}<b>${esc(item.name)}</b> <span>${gearRule?.item ? "Consumable" : "In supply"}</span></div></div><span></span><span class="pts">${item.unpriced ? "?" : item.cost}<small>M</small></span><div class="eq-acts">${item.unpriced ? `<p class="hint">Recovered weapon: agree its added model value (the PDF supplies no price).</p><div class="cp-inline">${numeric("Agreed item value", item.cost, 'data-item-field="cost"')}${button("price", "Confirm value", `data-item="${esc(item.id)}"`, !mutable)}</div>` : ""}${gearRule?.item ? (item.name !== "First aid kit" ? `<div class="cp-inline">${button("consume", "Use for next game", `data-item="${esc(item.id)}"`, entry.campaign.phase !== "muster")}</div>` : '<p class="hint">Use during Casualties, before committing the result.</p>') : `<div class="cp-inline">${select("Give to", [["","Choose a rhyfler"], ...characterOptions(entry)], "", `id="cp-recipient-${esc(item.id)}"`)}${button("assign", "Give", `data-item="${esc(item.id)}"`, !mutable || item.unpriced)}</div>${item.name === "Scope" ? `<label>Eligible weapon (no special ability)${input("Scope weapon attachment", item.attachment || "", 'data-item-field="attachment" maxlength="80"')}</label>` : ""}`}</div></div>`; }).join("");
      const carriers = E.living(entry).filter(character => character.campaign.equipment.length);
      const carriedRows = carriers.map(character => `<div class="prow eq-row"><div class="pname"><div class="pnm">${context.dtag(character.name) || `<b>${esc(E.unit(entry, character)?.name || "Rhyfler")}</b>`} <span>${esc(E.unit(entry, character)?.name || "")}</span></div></div><span></span><span class="pts">${character.campaign.equipment.reduce((total, item) => total + number(item.cost), 0)}<small>M</small></span><div class="eq-acts eq-carried">${character.campaign.equipment.map(item => `<span class="eq-chip">${ui.item(item.name, "eq")}${esc(item.name)}${item.attachment ? ` <small>(${esc(item.attachment)})</small>` : ""} <span class="hint">${item.cost} M</span><button type="button" class="add sub" data-camp="unequip" data-item="${esc(item.id)}" data-id="${esc(character.id)}" title="Return to supply" aria-label="Return ${esc(item.name)} to supply"${mutable ? "" : " disabled"}>&minus;</button></span>`).join("")}</div></div>`).join("");
      const count = entry.campaign.supply.length + carriers.reduce((total, character) => total + character.campaign.equipment.length, 0);
      const right = `<section id="eq-mine" class="card cp-panel cp-yours cp-eqmine"><header><h2>Your equipment</h2><span class="hint">${count} item${count === 1 ? "" : "s"}</span></header><div class="plist npl eq-list">${count ? "" : '<p class="empty">Nothing bought yet. Tap + in the Equipment shop.</p>'}${supplyRows ? `<h3 class="eq-h">In the patrol supply</h3>${supplyRows}` : ""}${carriedRows ? `<h3 class="eq-h">Carried by your rhyflers</h3>${carriedRows}` : ""}</div></section>`;
      return {left:left.replace('<section class="card cp-panel"', '<section id="eq-shop" class="card cp-panel"'), right};
    }
    function journal(entry) {
      return panel("Patrol identity & chronicle", `<label>Campaign name${input("Campaign name", entry.name, 'data-story-field="name" maxlength="60"')}</label><label>The story so far<textarea data-story-field="notes" rows="4" maxlength="6000">${esc(entry.notes || "")}</textarea></label>`) + panel("Campaign journal", `<ol class="cp-journal">${[...entry.campaign.log].reverse().map(item => `<li><span class="hint">Battle ${number(item.game)} - ${esc(new Date(item.at).toLocaleString())}</span><p>${esc(item.text)}</p></li>`).join("") || "<li>No events yet.</li>"}</ol>`);
    }
    function rules() {
      return panel("Campaign field manual", `<p><b>${esc(R.title)}</b>, community campaign supplement, <i>${esc(R.source)}</i>. These are implementation summaries, not an official rules revision. Keep the source PDF handy for its deployment diagrams. No rules from Quar Tales are mixed in.</p><h3>The sequence</h3><p>Play - Casualties - Experience - Exploration - Purchase - Play. Start with 250 Marks; unspent starting and earned Marks stay in the bank. Vehicles suffer no lasting damage and gain no experience. Models departing through death, retirement or capture take their equipment with them.</p><h3>Underquar (p. 2)</h3><p>The bonuses stack: the Underquar gets the bonus for its band and every band above it in the chart.</p><dl>${[["0-5","No bonus"],["6-15","D3 Pluck"],["16-35","Choose scenario"],["36-55","Two unassigned PykPyks"],["56-75","Use discarded card as an extra round at each turn end"],["76+","Entire patrol gains 2 XP regardless of OOA"]].map(([band, rule]) => `<dt>${band} Marks behind</dt><dd>${rule}</dd>`).join("")}</dl><h3>Casualties (p. 3)</h3><p>OOA: D6, 1-3 requires chart, 4-6 no effect. Removed by damage: always chart. Repeat lasting injuries (3/4/10/11) retire the model.</p><ol start="2">${R.casualties.map(rule => `<li>${esc(rule)}</li>`).join("")}</ol><h3>Experience (pp. 4-6)</h3><p>+1 surviving (neither OOA nor removed by damage), +1 per Tend Wounded roll of 6, scenario XP, +1 MVQ. Levels: 0/3/7/12 XP. Senior categories begin at level 1 with 3 XP and no level-1 cost or advancement. Other level gains cost +3/+3/+4 Marks, and specialization locks on first advancement.</p>${Object.entries(R.advances).map(([name, charts]) => `<details class="cp-mission"><summary>${name} advancement charts</summary>${charts.map((chart, index) => `<h4>Level ${index + 1} (+${index === 2 ? 4 : 3} Marks)</h4><ol>${chart.map(effect => `<li>${esc(effect)}</li>`).join("")}</ol>`).join("")}</details>`).join("")}<h3>Exploration (pp. 7-8)</h3><p>Each Leader not OOA contributes its first Leader number in D6, capped at 6. Winner adds a die; at 7, keep 6. Sum kept dice and apply matching events. Unspent money carries forward. Only searching leaders can be chosen by exploration events.</p>${[2,3,4].map(size => `<details class="cp-mission"><summary>${size === 2 ? "Doubles" : size === 3 ? "Triples" : "Quadruples"}</summary><ol>${R.exploration[size].map(rule => `<li>${esc(rule)}</li>`).join("")}</ol></details>`).join("")}<h3>Rout & mission selection (p. 11)</h3><p>At each round start, if at least 25% of models are OOA/incapacitated, test highest available Skill; fail and lose. At that round's end you may voluntarily rout if still at threshold. Burn and Turn defenders never rout; Daring Rescue attackers test at 50%. A captive requires Daring Rescue. Otherwise D6: 1 Surround and Confound; 2 Burn and Turn; 3 Smash and Grab; 4 Take the Town; 5 Brave Little Quar; 6 a core scenario chosen by Underquar (roll off without one). Underquar may choose PykPyk Pillagers.</p><h3>Source interpretations - agree before play</h3><ul>${R.notes.map(note => `<li>${esc(note)}</li>`).join("")}</ul>`) + panel("Campaign scenarios", R.missions.map(mission => missionCard(mission.name)).join(""));
    }
    function runTool(entry, tool, actor) {
      const session = entry.campaign.battle;
      if (!actor || !session.rows[actor.id]) throw Error("Select a participating model.");
      const row = session.rows[actor.id]; let text = actor.name + ": ";
      const gain = amount => { entry.campaign.bank += amount; text += `+${amount} Marks. `; };
      const xp = amount => { row.scenarioXP += amount; text += `+${amount} scenario XP. `; };
      if (tool === "messenger") {
        if (session.turn < 3 || session.messengerEscaped) throw Error("Messenger XP requires turn 3+ and can only be claimed once.");
        session.messengerEscaped = true; xp(dice(3));
      }
      if (tool === "plant") { if (session.countdown != null) throw Error("A charge is already active."); session.countdown = 3; session.planter = actor.id; text += "Demolition charge placed: countdown 3."; }
      if (tool === "plant-enemy") { if (session.countdown != null) throw Error("A charge is already active."); session.countdown = 3; session.planter = null; text += "Enemy demolition charge placed: countdown 3."; }
      if (tool === "card") {
        if (session.countdown == null || session.countdown <= 0) throw Error("No active charge.");
        session.countdown--; text += `Charge countdown ${session.countdown}.`;
        if (session.countdown === 0) { const planter = session.rows[session.planter]; const earned = dice(3); if (planter) planter.scenarioXP += earned; text += ` Cache destroyed${planter ? ": planter +" + earned + " XP" : " (enemy charge)"}; blast radius ${sumDice(2)} inches, 2D6 Mt attack.`; }
      }
      if (tool === "defuse") { if (session.countdown == null || session.countdown <= 0) throw Error("No active charge to defuse."); session.countdown = null; xp(1); text += "Charge defused after successful skill check."; }
      if (tool === "house") {
        session.houses = (session.houses || 0) + 1;
        if (session.informantFound || session.houses > 3) throw Error("Informant already found or all houses investigated.");
        const roll = session.houses === 3 ? 6 : dice(6); text += `House ${session.houses}, D6 ${roll}: `;
        if (roll === 1) text += "Booby trap: D6 blast to models within 3 inches of house edge.";
        else if (roll <= 4) gain(roll); else { session.informantFound = true; text += "Informant located; escort off your home edge."; }
      }
      if (tool === "informant-death") { if (session.informantDeathPaid) throw Error("Reward already recorded."); session.informantDeathPaid = true; gain(sumDice(2)); }
      if (/^ale[123]$/.test(tool)) { const count = Number(tool.slice(-1)), roll = dice(6); text += `Ale barrel (${count} contributors), D6 ${roll}: `; if (roll <= count) text += "Kicked! Remove barrel; Gobsmack one friendly model."; else if (roll >= 7 - count) gain(sumDice(count)); else text += "Ale flows; no change."; }
      if (tool === "rescue-status") { if (session.captiveStatus) throw Error("Captive status already revealed."); const roll = dice(6); session.captiveStatus = roll; text += `Captive D6 ${roll}: ${roll <= 2 ? "incapacitated" : roll <= 4 ? "one non-combat action per turn, no abilities" : "pistol only; otherwise normal"}.`; }
      if (tool === "rescue-xp") xp(1);
      if (tool === "rescue-return") {
        const captive = entry.chars.find(character => character.id === document.getElementById("cp-captive")?.value);
        const withEquipment = document.getElementById("cp-rescue-equipment")?.checked;
        E.recover(entry, captive, withEquipment); session.rows[captive.id] = {outcome:"ready", tend:0, objective:0, mvq:false, scenarioXP:0}; text += `${captive.name} rescued ${withEquipment ? "with" : "without"} equipment.`;
      }
      if (["investigate","automatic-supplies"].includes(tool)) { const roll = dice(6); text += `Supplies D6 ${roll}: `; if (roll <= 2) text += "Damaged; no Marks. "; else gain(roll <= 4 ? dice(6) : sumDice(3, 3)); if (roll === 1) text += "Gobsmacked by PykPyk. "; if (roll === 6 && tool === "investigate") xp(1); }
      session.tools.push(text); E.log(entry, text);
    }
    document.addEventListener("change", event => {
      const target = event.target;
      if (!target.closest("#view-narr")) return;
      const entry = story();
      if (!entry) {
        if (target.id === "cp-patrol" && target.value) { const patrol = context.getPatrols().find(item => item.id === target.value); document.getElementById("cp-faction").value = patrol.faction; }
        return;
      }
      const characterId = target.closest("[data-character]")?.dataset.character;
      const character = entry.chars.find(item => item.id === characterId);
      const itemId = target.closest("[data-item]")?.dataset.item;
      const item = entry.campaign.supply.find(value => value.id === itemId);
      if (target.dataset.draft) { const draft = getDraft(entry); draft[target.dataset.draft] = target.dataset.draft === "opponent" ? number(target.value) : target.value; save(entry); render(entry.id); return; }
      if (target.dataset.deploy) { const draft = getDraft(entry); draft.deployed = draft.deployed.filter(id => id !== target.dataset.deploy); if (target.checked) draft.deployed.push(target.dataset.deploy); save(entry); return; }
      if (target.dataset.battle) { const field = target.dataset.battle; entry.campaign.battle[field] = ["notes","result","actor"].includes(field) ? target.value.slice(0,4000) : number(target.value); save(entry); return; }
      if (target.dataset.brow && character) { const field = target.dataset.brow; entry.campaign.battle.rows[character.id][field] = field === "mvq" ? target.checked : field === "outcome" ? target.value : number(target.value); save(entry); if (field === "outcome") render(entry.id); return; }
      if (target.dataset.characterField && character) { character[target.dataset.characterField] = target.value.slice(0, target.dataset.characterField === "name" ? 80 : 4000); save(entry); if (event.fromDice) render(entry.id); return; }
      if (target.dataset.storyField) { entry[target.dataset.storyField] = target.value.slice(0, target.dataset.storyField === "name" ? 60 : 6000); save(entry); return; }
      if (target.dataset.itemField && item) { item[target.dataset.itemField] = target.dataset.itemField === "cost" ? number(target.value) : target.value.slice(0,80); save(entry); return; }
      if (target.dataset.group) { entry.campaign.battle.explorationDraft.groups[target.dataset.group] = number(target.value, 4); save(entry); render(entry.id); return; }
      if (target.dataset.find) { entry.campaign.battle.explorationDraft.choices[target.dataset.find] = target.value; save(entry); }
    });
    document.addEventListener("click", event => {
      const target = event.target.closest("[data-camp]");
      if (!target || !target.closest("#view-narr") || target.disabled) return;
      const action = target.dataset.camp;
      if (action === "tab") { tab = target.dataset.tab; keepTab(current, tab); render(current); return; }
      if (action === "open") { context.navigate(target.dataset.id); return; }
      if (action === "create") {
        try {
          const patrolId = document.getElementById("cp-patrol").value;
          const patrol = context.getPatrols().find(item => item.id === patrolId);
          const factionId = patrol ? patrol.faction : document.getElementById("cp-faction").value;
          const now = Date.now();
          const entry = {id:context.id(), name:document.getElementById("cp-name").value.trim() || (patrol?.name || "New campaign"), faction:factionId, chars:[], rels:[], notes:"", from:patrol?.name || "", created:now, updated:now, campaign:{version:1, bank:250, phase:"muster", gameNumber:1, supply:[], log:[]}};
          if (patrol) {
            const faction = context.faction(factionId);
            const price = faction.units.reduce((total, unit) => total + (Number.isFinite(unit.pts) ? unit.pts * number(patrol.items[unit.id],200) : 0), 0);
            if (price > 250) throw Error(`Starting patrol costs ${price} Marks; the campaign starts at 250. Make a smaller saved patrol or use a fresh muster.`);
            faction.units.forEach(unit => { for (let index = 0; index < number(patrol.items[unit.id],200); index++) E.recruit(entry, unit.id, patrol.names?.[unit.id]?.[index] || context.name(entry.chars.map(character => character.name))); });
          }
          E.normalize(entry); E.log(entry, "Campaign founded with 250 Marks; normal patrols remain unchanged.");
          context.getStories().push(entry); save(entry); context.navigate(entry.id);
        } catch (error) { fail(error); }
        return;
      }
      if (action === "delete") {
        // also used on the Narrative landing page ("Pick up where you left off"), where it can delete a campaign, Tale or match
        const redraw = target.dataset.from === "landing" ? renderCommunity : renderList;
        if (confirmDelete !== target.dataset.id) { confirmDelete = target.dataset.id; redraw(); return; }
        const stories = context.getStories(), index = stories.findIndex(entry => entry.id === target.dataset.id);
        const gone = index >= 0 ? stories[index].name : "";
        if (index >= 0) stories.splice(index, 1); context.save(); confirmDelete = null; redraw(); if (gone) context.toast(`Deleted “${gone}”`); return;
      }
      const entry = story(); if (!entry) return;
      if (action === "undo") {
        const snapshot = entry.campaign.undo; if (!snapshot) return;
        Object.keys(entry).forEach(key => delete entry[key]); Object.assign(entry, clone(snapshot)); delete entry.campaign.setupDraft; save(entry); render(entry.id); return;
      }
      if (action === "tab-supply" || action === "tab-roster") { tab = action === "tab-supply" ? "supply" : "roster"; keepTab(entry.id, tab); render(entry.id); return; }
      const character = entry.chars.find(value => value.id === target.dataset.id);
      if (action === "deep") {
        const draft = getDraft(entry), roll = dice(6); draft.checks[character.id] = roll;
        if (roll === 1) { draft.failed.push(character.id); draft.deployed = draft.deployed.filter(id => id !== character.id); }
        E.log(entry, `${character.name}: pre-game deep wound D6 ${roll}${roll === 1 ? ", misses this game" : ", available"}.`); save(entry); render(entry.id); return;
      }
      if (action === "deploy-all" || action === "deploy-none") {
        const draft = getDraft(entry);
        draft.deployed = action === "deploy-none" ? [] : E.living(entry).filter(value => !value.campaign.skip && !draft.failed.includes(value.id)).map(value => value.id);
        save(entry); render(entry.id); return;
      }
      if (action === "roll-mission") {
        const draft = getDraft(entry), roll = dice(6);
        draft.mission = entry.chars.some(value => value.campaign.status === "captured") ? "Daring Rescue" : roll === 6 ? "Core rulebook scenario" : R.missions[roll - 1].name;
        E.log(entry, `Mission D6 ${roll}: ${draft.mission}.`); save(entry); render(entry.id); return;
      }
      const specialization = character && target.closest("[data-character]")?.querySelector("[data-specialization]")?.value;
      const physicalAdvance = character && document.getElementById("cp-advance-" + character.id)?.value;
      const actorId = document.getElementById("cp-actor")?.value;
      const physicalExploration = document.getElementById("cp-physical-exploration")?.value;
      const recipient = target.dataset.item && document.getElementById("cp-recipient-" + target.dataset.item)?.value;
      const ransom = character && document.getElementById("cp-ransom-" + character.id)?.value;
      const returnGear = character && document.getElementById("cp-return-gear-" + character.id)?.checked;
      change(currentStory => {
        const campaign = currentStory.campaign, session = campaign.battle;
        const requirePhase = allowed => { if (!allowed.includes(campaign.phase)) throw Error("That action is not available during this campaign step."); };
        if (["buy","recruit","assign","unequip","price","retire","ransom"].includes(action)) requirePhase(["muster","purchase"]);
        if (["advance","manual-advance","choose-advance"].includes(action)) requirePhase(["muster","experience","purchase"]);
        if (action === "start") {
          requirePhase(["muster"]); const draft = getDraft(currentStory);
          if (E.living(currentStory).some(value => value.campaign.injuries.includes(3) && !value.campaign.skip && !draft.checks[value.id])) throw Error("Check every deep wound before deployment.");
          if (currentStory.chars.some(value => value.campaign.status === "captured") && draft.mission !== "Daring Rescue") throw Error("A captive requires the Daring Rescue mission (or ransom them first).");
          E.startBattle(currentStory, draft);
        }
        if (action === "under-pluck") { requirePhase(["battle"]); if (session.pluckRolled || session.difference < 6) throw Error("Pluck bonus unavailable."); const roll = dice(3); session.pluck += roll; session.pluckRolled = true; E.log(currentStory, `Underquar D3: +${roll} Pluck.`); }
        if (action === "tool") { requirePhase(["battle"]); runTool(currentStory, target.dataset.tool, currentStory.chars.find(value => value.id === actorId)); }
        if (action === "finish-battle") {
          requirePhase(["battle"]); E.finishBattle(currentStory);
          if (session.mission === "Smash and Grab" && session.result === "win") { const earned = sumDice(2); campaign.bank += earned; E.log(currentStory, `Smash and Grab victory: 2D6 = ${earned} Marks.`); }
        }
        if (action === "casualty-all") {
          requirePhase(["casualties"]);
          const waiting = currentStory.chars.filter(value => session.rows[value.id] && ["ooa","removed"].includes(session.rows[value.id].outcome) && !isVehicle(E.unit(currentStory, value)) && !session.casualties[value.id]);
          if (!waiting.length) throw Error("Every casualty has been rolled.");
          waiting.forEach(value => E.casualtyRoll(currentStory, value, dice(6), sumDice(2)));
        }
        if (["casualty","manual-casualty"].includes(action)) {
          requirePhase(["casualties"]);
          const screen = action === "casualty" ? dice(6) : Number(document.getElementById("cp-screen-" + character.id)?.value);
          const total = action === "casualty" ? sumDice(2) : Number(document.getElementById("cp-total-" + character.id)?.value);
          E.casualtyRoll(currentStory, character, screen, total);
        }
        if (["reroll-kit","reroll-surgeon"].includes(action)) {
          requirePhase(["casualties"]); const result = session.casualties[character.id];
          if (!result?.total || result.committed || result.rerolled) throw Error("No casualty result available for a reroll.");
          if (action === "reroll-kit") { const index = campaign.supply.findIndex(item => item.name === "First aid kit"); if (index < 0) throw Error("No First aid kit in supply."); campaign.supply.splice(index,1); }
          else { const surgeon = currentStory.chars.find(value => value.id === target.dataset.surgeon); if (!surgeon || !E.abilities(currentStory, surgeon).includes("Field Surgeon") || session.surgeons.includes(surgeon.id)) throw Error("Surgeon unavailable."); session.surgeons.push(surgeon.id); }
          const previous = result.total; result.total = sumDice(2); result.rerolled = true; E.log(currentStory, `${character.name}: ${action === "reroll-kit" ? "First aid kit consumed" : "Field Surgeon used"}, casualty ${previous} rerolled to ${result.total}.`);
        }
        if (action === "commit-casualties") { requirePhase(["casualties"]); E.commitCasualties(currentStory); }
        if (["advance","manual-advance","choose-advance"].includes(action)) {
          if (action === "choose-advance") {
            const pending = character.campaign.pendingAdvance; if (!pending) throw Error("No duplicate advancement to resolve.");
            const result = E.advance(currentStory, character, pending.specialization, pending.roll, document.getElementById("cp-choice-" + character.id).value);
            if (!result.duplicate) delete character.campaign.pendingAdvance;
          } else {
            if (character.campaign.pendingAdvance) throw Error("Choose the duplicate result first.");
            const roll = action === "advance" ? dice(6) : Number(physicalAdvance);
            if (!Number.isInteger(roll)) throw Error("Enter a whole D6 result.");
            const result = E.advance(currentStory, character, specialization, roll);
            if (result.duplicate) character.campaign.pendingAdvance = {specialization, roll, effect:result.effect};
          }
        }
        if (action === "to-exploration") { requirePhase(["experience"]); if (E.living(currentStory).some(E.pendingLevel)) throw Error("Resolve every advancement first."); campaign.phase = "exploration"; }
        if (["roll-exploration","manual-exploration"].includes(action)) {
          requirePhase(["exploration"]); if (session.explorationDraft) throw Error("Exploration dice already rolled.");
          const pool = E.explorationPool(currentStory);
          const rolls = action === "roll-exploration" ? Array.from({length:pool.count}, () => dice(6)) : String(physicalExploration || "").trim().split(/[\s,]+/).filter(Boolean).map(Number);
          if (rolls.length !== pool.count || rolls.some(value => !Number.isInteger(value) || value < 1 || value > 6)) throw Error(`Enter exactly ${pool.count} results from 1 to 6.`);
          session.explorationDraft = {rolls, discard:null, groups:{}, choices:{}};
          E.log(currentStory, `Exploration dice rolled: [${rolls.join(", ")}].`);
        }
        if (action === "discard") { requirePhase(["exploration"]); if (E.explorationPool(currentStory).count !== 7) throw Error("No discard needed."); session.explorationDraft.discard = Number(target.dataset.index); }
        if (action === "resolve-exploration") {
          requirePhase(["exploration"]); const draft = session.explorationDraft; if (!draft) throw Error("Roll exploration first.");
          if (E.explorationPool(currentStory).count === 7 && draft.discard == null) throw Error("Discard one die.");
          const rolls = draft.rolls.filter((value, index) => index !== draft.discard);
          E.explorationEvents(rolls, draft.groups).forEach(event => {
            if (!draft.choices[event.face]) draft.choices[event.face] = event.size === 4 ? R.shop.find(item => event.face === 6 || item.cost <= 10)?.name : event.face === 4 ? "Splagen torpedo" : "Harlech";
          });
          E.resolveExploration(currentStory, rolls, draft.groups, draft.choices);
        }
        if (action === "next-game") { requirePhase(["purchase"]); if (E.living(currentStory).some(E.pendingLevel)) throw Error("Resolve exploration advancements first."); campaign.gameNumber++; campaign.phase = "muster"; campaign.lastBattle = clone(session); delete campaign.battle; delete campaign.preparations; delete campaign.setupDraft; E.log(currentStory, `Purchase complete. Patrol value ${E.value(currentStory)} Marks; bank ${campaign.bank}.`); }
        if (action === "recruit") { const recruited = E.recruit(currentStory, target.dataset.unit, context.name(currentStory.chars.map(character => character.name))); if (campaign.setupDraft) campaign.setupDraft.deployed.push(recruited.id); }
        if (action === "buy") E.buy(currentStory, target.dataset.name);
        if (action === "sell") E.sell(currentStory, target.dataset.name);
        if (action === "dismiss") E.dismiss(currentStory, target.dataset.unit);
        if (action === "assign") { const item = campaign.supply.find(value => value.id === target.dataset.item); if (item?.name === "Scope" && !item.attachment?.trim()) throw Error("Record an eligible scope weapon first."); E.assign(currentStory, target.dataset.item, recipient); }
        if (action === "unequip") { const index = character.campaign.equipment.findIndex(item => item.id === target.dataset.item); if (index < 0) throw Error("Equipment not found."); const item = character.campaign.equipment.splice(index,1)[0]; campaign.supply.push(item); E.log(currentStory, `${character.name}: ${item.name} returned to supply.`); }
        if (action === "price") { const item = campaign.supply.find(value => value.id === target.dataset.item); item.unpriced = false; E.log(currentStory, `${item.name}: agreed added value ${item.cost} Marks.`); }
        if (action === "consume") {
          requirePhase(["muster"]); const index = campaign.supply.findIndex(value => value.id === target.dataset.item), item = campaign.supply[index];
          if (!item || !["Pykpyk Treats","Local Map"].includes(item.name)) throw Error("That item cannot be used here.");
          campaign.supply.splice(index,1); campaign.preparations = [...(campaign.preparations || []), item.name]; E.log(currentStory, `${item.name} consumed for next battle: ${R.shop.find(value => value.name === item.name).rule}`);
        }
        if (action === "retire") { if (character.campaign.status !== "active") throw Error("Model is not active."); E.remove(currentStory, character, "retired"); const draft = campaign.setupDraft; if (draft) draft.deployed = draft.deployed.filter(id => id !== character.id); }
        if (action === "ransom") {
          if (character.campaign.status !== "captured") throw Error("Model is not captured."); const price = number(ransom);
          if (campaign.bank < price) throw Error("Not enough Marks for ransom."); campaign.bank -= price;
          E.recover(currentStory, character, returnGear);
          E.log(currentStory, `${character.name}: ransomed for ${price} Marks${returnGear ? " with equipment" : " without equipment"}.`);
        }
      });
    });
    return {render, importStory};
  }
  return {create, createEngine, underquar, isVehicle, startsSenior, levelAt};
})();
