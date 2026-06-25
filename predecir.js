// Unified Predictor Logic - predecir.js

let groupRankings = {}; // Group rankings: { groupLetter: [teamId1, teamId2, teamId3] }
let selectedThirds = []; // Selected 8 third-place team IDs: [teamId1, teamId2, ...]
let koWinners = {}; // Knockout winners: { matchId: teamId }

let groupStandings = {};
let thirdsAssignment = {};
let resolvedTeams = {};

const slots = [
  { matchId: 74, allowed: ['A', 'B', 'C', 'D', 'F'] },
  { matchId: 77, allowed: ['C', 'D', 'F', 'G', 'H'] },
  { matchId: 79, allowed: ['C', 'E', 'F', 'H', 'I'] },
  { matchId: 80, allowed: ['E', 'H', 'I', 'J', 'K'] },
  { matchId: 82, allowed: ['A', 'E', 'H', 'I', 'J'] },
  { matchId: 81, allowed: ['B', 'E', 'F', 'I', 'J'] },
  { matchId: 85, allowed: ['E', 'F', 'G', 'I', 'J'] },
  { matchId: 87, allowed: ['D', 'E', 'I', 'J', 'L'] }
];

document.addEventListener('DOMContentLoaded', () => {
  setupSidebar();
  loadData();
  setupEventListeners();
  renderAll();
});

function loadData() {
  // Clear any existing stored predictions to start completely fresh
  localStorage.removeItem('wc2026_group_rankings');
  localStorage.removeItem('wc2026_selected_thirds');
  localStorage.removeItem('wc2026_ko_winners');

  // Initialize empty rankings for all groups
  groupRankings = {};
  Object.keys(WORLD_CUP_DATA.groups).forEach(g => {
    groupRankings[g] = [];
  });
  selectedThirds = [];
  koWinners = {};
}

function saveGroupRankings() {
  localStorage.setItem('wc2026_group_rankings', JSON.stringify(groupRankings));
  updateStatsBadge();
}

function saveSelectedThirds() {
  localStorage.setItem('wc2026_selected_thirds', JSON.stringify(selectedThirds));
  updateStatsBadge();
}

function saveKoWinners() {
  localStorage.setItem('wc2026_ko_winners', JSON.stringify(koWinners));
  updateStatsBadge();
}

function setupEventListeners() {
  // Reset prediction event
  document.getElementById('btn-reset-all').addEventListener('click', () => {
    resetAllPredictionsFlow();
  });

  // Next step button (Groups -> Bracket)
  document.getElementById('btn-next-step').addEventListener('click', () => {
    if (isStep1Complete()) {
      document.getElementById('groups-section').style.display = 'none';
      document.getElementById('bracket-section').style.display = 'block';
      window.scrollTo(0, 0);
    }
  });

  // Back button (Bracket -> Groups)
  document.getElementById('btn-back-to-groups').addEventListener('click', () => {
    document.getElementById('groups-section').style.display = 'block';
    document.getElementById('bracket-section').style.display = 'none';
    window.scrollTo(0, 0);
  });
}

function resetAllPredictionsFlow() {
  // Clear all states
  groupRankings = {};
  Object.keys(WORLD_CUP_DATA.groups).forEach(g => {
    groupRankings[g] = [];
  });
  selectedThirds = [];
  koWinners = {};

  saveGroupRankings();
  saveSelectedThirds();
  saveKoWinners();

  // Return to Step 1
  document.getElementById('groups-section').style.display = 'block';
  document.getElementById('bracket-section').style.display = 'none';

  renderAll();
  window.scrollTo(0, 0);
}

function invalidateKnockoutPredictions() {
  koWinners = {};
  localStorage.removeItem('wc2026_ko_winners');
}

function isStep1Complete() {
  // 1. Every group must have exactly 3 selected teams
  const allGroupsRanked = Object.keys(WORLD_CUP_DATA.groups).every(g => {
    return groupRankings[g] && groupRankings[g].length === 3;
  });

  // 2. Exactly 8 best thirds must be selected
  const bestThirdsSelected = selectedThirds.length === 8;

  return allGroupsRanked && bestThirdsSelected;
}

function updateStatsBadge() {
  // Update thirds selected progress
  const groupTextElement = document.getElementById('stat-group-text');
  const groupDotElement = document.getElementById('stat-group-dot');

  if (groupTextElement) {
    groupTextElement.innerText = `${selectedThirds.length}/8 terceros clasificados`;
  }
  if (groupDotElement) {
    if (selectedThirds.length === 8) {
      groupDotElement.classList.add('completed');
    } else {
      groupDotElement.classList.remove('completed');
    }
  }

  // Knockout Stage progress
  let filledKoMatches = 0;
  const koMatchIds = [
    ...WORLD_CUP_DATA.knockoutMatches.R32.map(m => m.id),
    ...WORLD_CUP_DATA.knockoutMatches.R16.map(m => m.id),
    ...WORLD_CUP_DATA.knockoutMatches.QF.map(m => m.id),
    ...WORLD_CUP_DATA.knockoutMatches.SF.map(m => m.id),
    ...WORLD_CUP_DATA.knockoutMatches['3RD'].map(m => m.id),
    ...WORLD_CUP_DATA.knockoutMatches.F.map(m => m.id)
  ];

  koMatchIds.forEach(id => {
    if (koWinners[id]) {
      filledKoMatches++;
    }
  });

  const koTextElement = document.getElementById('stat-ko-text');
  const koDotElement = document.getElementById('stat-ko-dot');

  if (koTextElement) {
    koTextElement.innerText = `${filledKoMatches}/32 ganadores`;
  }
  if (koDotElement) {
    if (filledKoMatches === 32) {
      koDotElement.classList.add('completed');
    } else {
      koDotElement.classList.remove('completed');
    }
  }

  // Update navigation and reset buttons state
  const nextBtn = document.getElementById('btn-next-step');
  if (nextBtn) {
    const isNextDisabled = !isStep1Complete();
    nextBtn.disabled = isNextDisabled;
    if (isNextDisabled) {
      nextBtn.classList.add('disabled');
    } else {
      nextBtn.classList.remove('disabled');
    }
  }

  const resetBtn = document.getElementById('btn-reset-all');
  if (resetBtn) {
    // Enable reset button when there is any prediction selection
    const hasAnyRankings = Object.values(groupRankings).some(arr => arr.length > 0);
    const hasAnyThirds = selectedThirds.length > 0;
    const hasAnyKoWinners = Object.keys(koWinners).length > 0;
    const shouldDisable = !(hasAnyRankings || hasAnyThirds || hasAnyKoWinners);
    resetBtn.disabled = shouldDisable;
    if (shouldDisable) {
      resetBtn.classList.add('disabled');
    } else {
      resetBtn.classList.remove('disabled');
    }
  }
}

// -------------------------------------------------------------
// STANDINGS CALCULATIONS (MANUAL SELECTION BASED)
// -------------------------------------------------------------
function calculateStandings(groupLetter) {
  const defaultTeams = WORLD_CUP_DATA.groups[groupLetter];
  const ranked = groupRankings[groupLetter] || [];

  // Fill rest of teams in default order to preserve complete array structure
  const unranked = defaultTeams.filter(id => !ranked.includes(id));
  const fullOrder = [...ranked, ...unranked];

  return fullOrder.map((id, idx) => {
    const team = WORLD_CUP_DATA.teams[id];
    // Dummy realistic stats: 1st=9pts, 2nd=6pts, 3rd=3pts, 4th=0pts
    const pts = [9, 6, 3, 0][idx];
    const pj = 3;
    const g = [3, 2, 1, 0][idx];
    const e = 0;
    const p = [0, 1, 2, 3][idx];
    const gf = [6, 4, 2, 1][idx];
    const gc = [1, 2, 4, 6][idx];
    const gd = gf - gc;

    return {
      ...team,
      pj, g, e, p, gf, gc, gd, pts
    };
  });
}

function getAllStandings() {
  const all = {};
  Object.keys(WORLD_CUP_DATA.groups).forEach(g => {
    all[g] = calculateStandings(g);
  });
  return all;
}

function getBestThirdPlaces() {
  const thirds = [];
  Object.keys(groupRankings).forEach(groupLetter => {
    const rankedTeams = groupRankings[groupLetter] || [];
    // Only fetch 3rd place if group has ranked all 3 spots
    if (rankedTeams.length === 3) {
      const teamId = rankedTeams[2];
      thirds.push({
        ...WORLD_CUP_DATA.teams[teamId],
        groupOrigin: groupLetter
      });
    }
  });
  return thirds;
}

// -------------------------------------------------------------
// BACKTRACKING RESOLVER FOR ROUND OF 32 THIRD PLACES
// -------------------------------------------------------------
function assignThirdPlaces(bestThirdTeams) {
  const result = findAssignment(slots, bestThirdTeams, 0, {}, new Set());
  if (result) return result;

  // Fallback greedy matching
  const assignment = {};
  const used = new Set();
  slots.forEach(slot => {
    const matched = bestThirdTeams.find(t => !used.has(t.id) && slot.allowed.includes(t.groupOrigin));
    if (matched) {
      assignment[slot.matchId] = matched;
      used.add(matched.id);
    }
  });
  slots.forEach(slot => {
    if (!assignment[slot.matchId]) {
      const matched = bestThirdTeams.find(t => !used.has(t.id));
      if (matched) {
        assignment[slot.matchId] = matched;
        used.add(matched.id);
      }
    }
  });
  return assignment;
}

function findAssignment(slots, teams, index, currentAssignment, usedTeamIds) {
  if (index === slots.length) {
    return { ...currentAssignment };
  }

  const slot = slots[index];
  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];
    if (usedTeamIds.has(team.id)) continue;

    if (slot.allowed.includes(team.groupOrigin)) {
      usedTeamIds.add(team.id);
      currentAssignment[slot.matchId] = team;

      const res = findAssignment(slots, teams, index + 1, currentAssignment, usedTeamIds);
      if (res) return res;

      usedTeamIds.delete(team.id);
      delete currentAssignment[slot.matchId];
    }
  }
  return null;
}

// -------------------------------------------------------------
// BRACKET SELECTION AND TEAM SOURCE RESOLUTION
// -------------------------------------------------------------
function getR32Teams(groupStandings, thirdsAssignment) {
  const teamsMap = {};
  const getTeam = (group, pos) => {
    const table = groupStandings[group];
    return table ? table[pos - 1] : null;
  };

  // Make sure we only feed the bracket if positions are manually chosen
  const getSafeTeam = (group, pos) => {
    const ranked = groupRankings[group] || [];
    if (ranked.length < pos) return null; // Unresolved group spot
    return getTeam(group, pos);
  };

  teamsMap[73] = { t1: getSafeTeam('A', 2), t2: getSafeTeam('B', 2) };
  teamsMap[76] = { t1: getSafeTeam('C', 1), t2: getSafeTeam('F', 2) };
  teamsMap[74] = { t1: getSafeTeam('E', 1), t2: thirdsAssignment[74] || null };
  teamsMap[75] = { t1: getSafeTeam('F', 1), t2: getSafeTeam('C', 2) };
  teamsMap[78] = { t1: getSafeTeam('E', 2), t2: getSafeTeam('I', 2) };
  teamsMap[77] = { t1: getSafeTeam('I', 1), t2: thirdsAssignment[77] || null };
  teamsMap[79] = { t1: getSafeTeam('A', 1), t2: thirdsAssignment[79] || null };
  teamsMap[80] = { t1: getSafeTeam('L', 1), t2: thirdsAssignment[80] || null };
  teamsMap[82] = { t1: getSafeTeam('G', 1), t2: thirdsAssignment[82] || null };
  teamsMap[83] = { t1: getSafeTeam('K', 2), t2: getSafeTeam('L', 2) };
  teamsMap[81] = { t1: getSafeTeam('D', 1), t2: thirdsAssignment[81] || null };
  teamsMap[85] = { t1: getSafeTeam('B', 1), t2: thirdsAssignment[85] || null };
  teamsMap[84] = { t1: getSafeTeam('H', 1), t2: getSafeTeam('J', 2) };
  teamsMap[86] = { t1: getSafeTeam('J', 1), t2: getSafeTeam('H', 2) };
  teamsMap[87] = { t1: getSafeTeam('K', 1), t2: thirdsAssignment[87] || null };
  teamsMap[88] = { t1: getSafeTeam('D', 2), t2: getSafeTeam('G', 2) };

  return teamsMap;
}

function resolveMatchTeams(matchId, groupStandings, thirdsAssignment) {
  if (resolvedTeams[matchId]) {
    return resolvedTeams[matchId];
  }

  let match = null;
  let stageName = '';
  for (const [stage, matches] of Object.entries(WORLD_CUP_DATA.knockoutMatches)) {
    match = matches.find(m => m.id === matchId);
    if (match) {
      stageName = stage;
      break;
    }
  }

  if (!match) return { t1: null, t2: null };

  if (stageName === 'R32') {
    const r32Teams = getR32Teams(groupStandings, thirdsAssignment);
    resolvedTeams[matchId] = r32Teams[matchId] || { t1: null, t2: null };
    return resolvedTeams[matchId];
  }

  const resolveSource = (source) => {
    if (!source) return null;
    const res = getMatchResult(source.matchId, groupStandings, thirdsAssignment);
    return source.loser ? res.loser : res.winner;
  };

  const t1 = resolveSource(match.team1Source);
  const t2 = resolveSource(match.team2Source);

  resolvedTeams[matchId] = { t1, t2 };
  return resolvedTeams[matchId];
}

function getMatchResult(matchId, groupStandings, thirdsAssignment) {
  const { t1, t2 } = resolveMatchTeams(matchId, groupStandings, thirdsAssignment);
  if (!t1 || !t2) return { winner: null, loser: null };

  const winnerId = koWinners[matchId];
  if (winnerId === t1.id) {
    return { winner: t1, loser: t2 };
  } else if (winnerId === t2.id) {
    return { winner: t2, loser: t1 };
  } else {
    return { winner: null, loser: null };
  }
}

function clearDownstream(matchId, oldWinnerId, newWinnerId) {
  if (oldWinnerId === newWinnerId) return;

  for (const [stage, matches] of Object.entries(WORLD_CUP_DATA.knockoutMatches)) {
    matches.forEach(m => {
      const usesSource1 = m.team1Source && m.team1Source.matchId === matchId;
      const usesSource2 = m.team2Source && m.team2Source.matchId === matchId;

      if (usesSource1 || usesSource2) {
        const oldDescWinner = getMatchResult(m.id, groupStandings, thirdsAssignment).winner;
        const oldDescWinnerId = oldDescWinner ? oldDescWinner.id : null;

        delete koWinners[m.id];

        if (oldDescWinnerId) {
          clearDownstream(m.id, oldDescWinnerId, null);
        }
      }
    });
  }
}

// -------------------------------------------------------------
// GLOBAL RENDERER
// -------------------------------------------------------------
function renderAll() {
  // Update calculations
  groupStandings = getAllStandings();
  const bestThirds = getBestThirdPlaces().filter(t => selectedThirds.includes(t.id));
  thirdsAssignment = assignThirdPlaces(bestThirds);
  resolvedTeams = {};

  renderGroupStage();
  renderBracket();
  updateStatsBadge();
}

// -------------------------------------------------------------
// GROUPS RENDERER (CLICK TO RANK FLOW)
// -------------------------------------------------------------
function renderGroupStage() {
  const container = document.getElementById('groups-container');
  if (!container) return;

  container.innerHTML = '';

  Object.keys(groupRankings).sort().forEach(groupLetter => {
    const defaultTeams = WORLD_CUP_DATA.groups[groupLetter];
    const rankedTeams = groupRankings[groupLetter] || [];

    const card = document.createElement('div');
    card.className = 'neon-card';

    let headerHTML = `
      <div class="group-header">
        <h3 class="group-name">Grupo ${groupLetter}</h3>
      </div>
    `;

    let listHTML = `<div class="group-rank-list">`;

    defaultTeams.forEach(teamId => {
      const team = WORLD_CUP_DATA.teams[teamId];
      const rankIdx = rankedTeams.indexOf(teamId);
      const isRanked = rankIdx > -1;
      const rank = rankIdx + 1;

      let badgeHTML = `<div class="pos-badge pos-4">-</div>`;
      let itemClass = 'group-team-item';

      if (isRanked) {
        badgeHTML = `<div class="pos-badge pos-${rank}">${rank}º</div>`;
        itemClass += ' selected';
      }

      listHTML += `
        <div class="${itemClass}" onclick="toggleTeamRank('${groupLetter}', '${team.id}')" style="cursor: pointer;">
          ${badgeHTML}
          <div class="group-team-content">
            <img class="match-flag" src="https://flagcdn.com/w40/${team.flag}.png" alt="${team.name}">
            <span>${team.name}</span>
          </div>
        </div>
      `;
    });

    listHTML += `</div>`;
    card.innerHTML = headerHTML + listHTML;
    container.appendChild(card);
  });

  renderThirdPlacesStandings();
}

function toggleTeamRank(groupLetter, teamId) {
  if (!groupRankings[groupLetter]) {
    groupRankings[groupLetter] = [];
  }

  const arr = groupRankings[groupLetter];
  const idx = arr.indexOf(teamId);

  if (idx > -1) {
    // Deselect (remove from array)
    arr.splice(idx, 1);
  } else {
    // Select (limit to 3 ranked per group)
    if (arr.length < 3) {
      arr.push(teamId);
    }
  }

  invalidateKnockoutPredictions();
  saveGroupRankings();
  validateSelectedThirdsList();
  renderAll();
}

function validateSelectedThirdsList() {
  const actualThirds = getBestThirdPlaces().map(t => t.id);
  selectedThirds = selectedThirds.filter(id => actualThirds.includes(id));
  saveSelectedThirds();
}

function renderThirdPlacesStandings() {
  const container = document.getElementById('thirds-container');
  if (!container) return;

  let html = `
    <div class="thirds-standings-section">
      <div class="thirds-header">
        <h3 class="thirds-title">Selección de Mejores Terceros</h3>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span class="thirds-selection-counter" id="thirds-counter-badge">${selectedThirds.length} / 8 clasificados</span>
          <span class="thirds-badge-icon">Pasan 8 de 12</span>
        </div>
      </div>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
        Haz clic en los 8 equipos terceros que clasificarán a las eliminatorias de la Copa del Mundo.
      </p>
      
      <div class="thirds-selection-grid">
  `;

  Object.keys(WORLD_CUP_DATA.groups).sort().forEach(groupLetter => {
    const rankedTeams = groupRankings[groupLetter] || [];
    const teamId = rankedTeams[2]; // 3rd place team in group

    if (teamId) {
      const team = WORLD_CUP_DATA.teams[teamId];
      const isSelected = selectedThirds.includes(teamId);
      const cardClass = isSelected ? 'thirds-selection-card selected' : 'thirds-selection-card';

      html += `
        <div class="${cardClass}" onclick="toggleThirdPlaceSelection('${teamId}')">
          <div class="thirds-card-header-row">
            <span>Grupo ${groupLetter}</span>
            <div class="thirds-check-badge">✓</div>
          </div>
          <div class="thirds-card-body-row">
            <img class="match-flag" src="https://flagcdn.com/w40/${team.flag}.png" alt="${team.name}">
            <span>${team.name}</span>
          </div>
        </div>
      `;
    } else {
      // Disabled placeholder when group ranking is incomplete
      html += `
        <div class="thirds-selection-card placeholder" style="opacity: 0.4; cursor: not-allowed; border: 1px dashed var(--text-muted); background: transparent;">
          <div class="thirds-card-header-row" style="color: var(--text-muted);">
            <span>Grupo ${groupLetter}</span>
          </div>
          <div class="thirds-card-body-row" style="font-style: italic; color: var(--text-muted); font-size: 0.8rem; height: 24px; display: flex; align-items: center;">
            Por definir 3º
          </div>
        </div>
      `;
    }
  });

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function toggleThirdPlaceSelection(teamId) {
  const idx = selectedThirds.indexOf(teamId);
  if (idx > -1) {
    selectedThirds.splice(idx, 1);
  } else {
    if (selectedThirds.length >= 8) {
      alert("Ya has seleccionado a los 8 mejores terceros. Deselecciona alguno para elegir otro.");
      return;
    }
    selectedThirds.push(teamId);
  }

  invalidateKnockoutPredictions();
  saveSelectedThirds();
  renderAll();
}

// -------------------------------------------------------------
// BRACKET RENDERER
// -------------------------------------------------------------
function renderBracket() {
  const container = document.getElementById('bracket-container');
  if (!container) return;
  container.innerHTML = '';

  const getMatchById = (id) => {
    for (const stage of Object.values(WORLD_CUP_DATA.knockoutMatches)) {
      const found = stage.find(m => m.id === id);
      if (found) return found;
    }
    return null;
  };
  const getMatchesByIds = (ids) => ids.map(id => getMatchById(id)).filter(Boolean);

  const getShortPlaceholder = (text) => {
    if (!text) return 'TBD';
    let short = text;
    short = short.replace(/1º Grupo\s+([A-L])/i, '1º $1');
    short = short.replace(/2º Grupo\s+([A-L])/i, '2º $1');
    short = short.replace(/3º Grupo\s+([A-L/]+)/i, '3º $1');
    if (short === 'Por definir') return 'TBD';
    return short;
  };

  const columnsData = [
    { key: 'R32_L', title: '16avos', matches: getMatchesByIds([73, 75, 74, 77, 81, 82, 83, 84]) },
    { key: 'R16_L', title: '8avos', matches: getMatchesByIds([90, 89, 94, 93]) },
    { key: 'QF_L', title: '4tos', matches: getMatchesByIds([97, 98]) },
    { key: 'SF_L', title: 'Semis', matches: getMatchesByIds([101]) },
    { key: 'CENTER', title: 'FINAL', matches: getMatchesByIds([104, 103]), isCenter: true },
    { key: 'SF_R', title: 'Semis', matches: getMatchesByIds([102]) },
    { key: 'QF_R', title: '4tos', matches: getMatchesByIds([99, 100]) },
    { key: 'R16_R', title: '8avos', matches: getMatchesByIds([91, 92, 96, 95]) },
    { key: 'R32_R', title: '16avos', matches: getMatchesByIds([76, 78, 79, 80, 85, 87, 86, 88]) }
  ];

  columnsData.forEach(col => {
    const colElem = document.createElement('div');
    colElem.className = 'bracket-column';

    const headerElem = document.createElement('div');
    headerElem.className = 'bracket-col-header';
    headerElem.innerText = col.title;
    colElem.appendChild(headerElem);

    const createMatchCardHTML = (m) => {
      let headerHTML = `
        <div class="bracket-match-header">
          <div>
            <span>${formatShortDate(m.date)}  -  ${m.time}</span>
          </div>
        </div>
      `;

      const { t1, t2 } = resolveMatchTeams(m.id, groupStandings, thirdsAssignment);
      const result = getMatchResult(m.id, groupStandings, thirdsAssignment);

      // Team 1 HTML
      let t1HTML = '';
      if (t1) {
        const isWinner = result.winner && result.winner.id === t1.id;
        const rowClass = isWinner ? 'winner' : '';

        t1HTML = `
          <div class="bracket-team-row ${rowClass}" draggable="true" data-team-id="${t1.id}" data-match-id="${m.id}" onmouseenter="highlightTeam('${t1.id}')" onmouseleave="unhighlightTeam('${t1.id}')" onclick="selectMatchWinnerClick(${m.id}, '${t1.id}')">
            <div class="bracket-team-info">
              <img class="match-flag" src="https://flagcdn.com/w40/${t1.flag}.png" alt="${t1.name}">
              <span class="team-name-full" title="${t1.name}">${t1.name}</span>
              <span class="team-name-acronym" title="${t1.name}">${t1.id}</span>
            </div>
          </div>
        `;
      } else {
        const placeholderText = m.team1Placeholder || 'Por definir';
        t1HTML = `
          <div class="bracket-team-row placeholder">
            <div class="bracket-team-info">
              <span class="team-name-full">${placeholderText}</span>
              <span class="team-name-acronym">${getShortPlaceholder(placeholderText)}</span>
            </div>
          </div>
        `;
      }

      // Team 2 HTML
      let t2HTML = '';
      if (t2) {
        const isWinner = result.winner && result.winner.id === t2.id;
        const rowClass = isWinner ? 'winner' : '';

        t2HTML = `
          <div class="bracket-team-row ${rowClass}" draggable="true" data-team-id="${t2.id}" data-match-id="${m.id}" onmouseenter="highlightTeam('${t2.id}')" onmouseleave="unhighlightTeam('${t2.id}')" onclick="selectMatchWinnerClick(${m.id}, '${t2.id}')">
            <div class="bracket-team-info">
              <img class="match-flag" src="https://flagcdn.com/w40/${t2.flag}.png" alt="${t2.name}">
              <span class="team-name-full" title="${t2.name}">${t2.name}</span>
              <span class="team-name-acronym" title="${t2.name}">${t2.id}</span>
            </div>
          </div>
        `;
      } else {
        const placeholderText = m.team2Placeholder || 'Por definir';
        t2HTML = `
          <div class="bracket-team-row placeholder">
            <div class="bracket-team-info">
              <span class="team-name-full">${placeholderText}</span>
              <span class="team-name-acronym">${getShortPlaceholder(placeholderText)}</span>
            </div>
          </div>
        `;
      }

      return headerHTML + t1HTML + t2HTML;
    };

    const bodyElem = document.createElement('div');
    bodyElem.className = 'bracket-column-body';

    if (col.isCenter) {
      const centerBox = document.createElement('div');
      centerBox.className = 'bracket-center-box';

      const finalMatch = col.matches.find(m => m.id === 104);
      const thirdMatch = col.matches.find(m => m.id === 103);

      if (finalMatch) {
        const finalSection = document.createElement('div');
        finalSection.className = 'bracket-center-match-section';
        finalSection.innerHTML = `<div class="bracket-center-stage-title">Final</div>`;
        const matchCard = document.createElement('div');
        matchCard.className = 'bracket-match';
        matchCard.id = `match-${finalMatch.id}`;
        matchCard.innerHTML = createMatchCardHTML(finalMatch);
        finalSection.appendChild(matchCard);
        centerBox.appendChild(finalSection);
      }

      if (thirdMatch) {
        const thirdSection = document.createElement('div');
        thirdSection.className = 'bracket-center-match-section';
        thirdSection.innerHTML = `<div class="bracket-center-stage-title">Tercer Puesto</div>`;
        const matchCard = document.createElement('div');
        matchCard.className = 'bracket-match';
        matchCard.id = `match-${thirdMatch.id}`;
        matchCard.innerHTML = createMatchCardHTML(thirdMatch);
        thirdSection.appendChild(matchCard);
        centerBox.appendChild(thirdSection);
      }

      bodyElem.appendChild(centerBox);
    } else {
      col.matches.forEach(m => {
        const matchCard = document.createElement('div');
        matchCard.className = 'bracket-match';
        matchCard.id = `match-${m.id}`;
        matchCard.innerHTML = createMatchCardHTML(m);
        bodyElem.appendChild(matchCard);
      });
    }

    colElem.appendChild(bodyElem);
    container.appendChild(colElem);
  });

  renderChampionCard();
  setupBracketDragAndDrop();
}

function renderChampionCard() {
  const container = document.getElementById('champion-container');
  if (!container) return;

  const finalResult = getMatchResult(104, groupStandings, thirdsAssignment);
  if (finalResult.winner) {
    const champion = finalResult.winner;
    container.innerHTML = `
      <div class="champion-hero-card" id="champion-card-target">
        <div class="champion-trophy">🏆</div>
        <div class="champion-title">Campeón del Mundo 2026</div>
        <div class="champion-team-box">
          <img class="champion-flag" src="https://flagcdn.com/w80/${champion.flag}.png" alt="${champion.name}">
          <span class="champion-name">${champion.name}</span>
        </div>
        <div style="margin-top: 1.5rem;">
          <button class="btn btn-reset" onclick="resetAllPredictionsFlow()" style="font-size: 1rem; padding: 0.7rem 1.5rem; border-radius: 30px; border-color: rgba(239, 68, 68, 0.4); box-shadow: 0 0 10px rgba(239, 68, 68, 0.25);">
            🔄 Empezar Nueva Predicción
          </button>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="champion-hero-card placeholder" id="champion-card-target" style="border: 2px dashed rgba(255, 255, 255, 0.1); background: rgba(0,0,0,0.15); box-shadow: none; animation: none;">
        <div class="champion-trophy" style="opacity: 0.3; filter: grayscale(1);">🏆</div>
        <div class="champion-title" style="color: var(--text-muted);">Campeón del Mundo</div>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem; font-style: italic;">
          Arrastra aquí el ganador de la final
        </div>
      </div>
    `;
  }
}

// -------------------------------------------------------------
// BRACKET DRAG AND DROP HANDLERS
// -------------------------------------------------------------
function selectMatchWinnerClick(matchId, teamId) {
  selectMatchWinner(matchId, teamId);
}

function selectMatchWinner(matchId, teamId) {
  const oldWinnerId = koWinners[matchId];
  koWinners[matchId] = teamId;

  resolvedTeams = {};
  const newWinnerId = teamId;

  if (oldWinnerId && oldWinnerId !== newWinnerId) {
    clearDownstream(matchId, oldWinnerId, newWinnerId);
  }

  saveKoWinners();
  renderAll();
}

function setupBracketDragAndDrop() {
  const cards = document.querySelectorAll('.bracket-match');
  const championHero = document.getElementById('champion-card-target');

  const getDownstreamMatches = (matchId) => {
    const list = [];
    for (const stageMatches of Object.values(WORLD_CUP_DATA.knockoutMatches)) {
      stageMatches.forEach(m => {
        if ((m.team1Source && m.team1Source.matchId === matchId) ||
          (m.team2Source && m.team2Source.matchId === matchId)) {
          list.push(m.id);
        }
      });
    }
    return list;
  };

  const draggables = document.querySelectorAll('.bracket-team-row[draggable="true"]');
  draggables.forEach(row => {
    row.addEventListener('dragstart', (e) => {
      const matchId = parseInt(row.dataset.matchId, 10);
      const teamId = row.dataset.teamId;
      row.classList.add('dragging');

      e.dataTransfer.setData('text/plain', JSON.stringify({ matchId, teamId }));
      e.dataTransfer.effectAllowed = 'move';

      // Highlight downstream drop targets
      const nextMatchIds = getDownstreamMatches(matchId);
      nextMatchIds.forEach(id => {
        const card = document.getElementById(`match-${id}`);
        if (card) card.classList.add('drop-target-active');
      });

      // If final, highlight champion hero target
      if (matchId === 104) {
        const champ = document.getElementById('champion-card-target');
        if (champ) champ.classList.add('drop-target-active');
      }
    });

    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      document.querySelectorAll('.drop-target-active').forEach(el => {
        el.classList.remove('drop-target-active');
        el.classList.remove('drag-hover');
      });
    });
  });

  cards.forEach(card => {
    const targetMatchId = parseInt(card.id.replace('match-', ''), 10);

    card.addEventListener('dragover', (e) => {
      // Allow drop if card is a downstream target or the card of the dragged team itself
      if (card.classList.contains('drop-target-active') || card.id === `match-${e.target.closest('.bracket-match')?.id?.replace('match-', '')}`) {
        e.preventDefault();
      }
    });

    card.addEventListener('dragenter', () => {
      if (card.classList.contains('drop-target-active')) {
        card.classList.add('drag-hover');
      }
    });

    card.addEventListener('dragleave', () => {
      card.classList.remove('drag-hover');
    });

    card.addEventListener('drop', (e) => {
      e.preventDefault();
      card.classList.remove('drag-hover');

      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      try {
        const data = JSON.parse(dataStr);
        const sourceMatchId = data.matchId;
        const teamId = data.teamId;

        const validNext = getDownstreamMatches(sourceMatchId);
        if (validNext.includes(targetMatchId) || sourceMatchId === targetMatchId) {
          selectMatchWinner(sourceMatchId, teamId);
        }
      } catch (err) {
        console.error(err);
      }
    });
  });

  if (championHero && !championHero.classList.contains('placeholder')) {
    championHero.addEventListener('dragover', (e) => {
      if (championHero.classList.contains('drop-target-active')) {
        e.preventDefault();
      }
    });

    championHero.addEventListener('dragenter', () => {
      if (championHero.classList.contains('drop-target-active')) {
        championHero.classList.add('drag-hover');
      }
    });

    championHero.addEventListener('dragleave', () => {
      championHero.classList.remove('drag-hover');
    });

    championHero.addEventListener('drop', (e) => {
      e.preventDefault();
      championHero.classList.remove('drag-hover');

      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      try {
        const data = JSON.parse(dataStr);
        if (data.matchId === 104) {
          selectMatchWinner(104, data.teamId);
        }
      } catch (err) {
        console.error(err);
      }
    });
  } else if (championHero && championHero.classList.contains('placeholder')) {
    // Allow drop even on placeholder target
    championHero.addEventListener('dragover', (e) => {
      if (championHero.classList.contains('drop-target-active')) {
        e.preventDefault();
      }
    });

    championHero.addEventListener('dragenter', () => {
      if (championHero.classList.contains('drop-target-active')) {
        championHero.classList.add('drag-hover');
      }
    });

    championHero.addEventListener('dragleave', () => {
      championHero.classList.remove('drag-hover');
    });

    championHero.addEventListener('drop', (e) => {
      e.preventDefault();
      championHero.classList.remove('drag-hover');

      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      try {
        const data = JSON.parse(dataStr);
        if (data.matchId === 104) {
          selectMatchWinner(104, data.teamId);
        }
      } catch (err) {
        console.error(err);
      }
    });
  }
}

// -------------------------------------------------------------
// EXTRA INTERACTION HELPERS
// -------------------------------------------------------------
function highlightTeam(teamId) {
  if (!teamId) return;
  const rows = document.querySelectorAll(`.bracket-team-row[data-team-id="${teamId}"]`);
  rows.forEach(row => {
    row.classList.add('team-highlighted');
  });
}

function unhighlightTeam(teamId) {
  if (!teamId) return;
  const rows = document.querySelectorAll(`.bracket-team-row[data-team-id="${teamId}"]`);
  rows.forEach(row => {
    row.classList.remove('team-highlighted');
  });
}

function showStadiumDetails(stadium, city) {
  const modal = document.getElementById('stadium-modal');
  const title = document.getElementById('modal-stadium-title');
  const details = document.getElementById('modal-stadium-details');

  if (!modal || !title || !details) return;

  title.innerText = stadium;
  details.innerHTML = `
    <p><strong>Sede:</strong> ${city}</p>
    <p><strong>Copa del Mundo:</strong> Estados Unidos, México y Canadá 2026</p>
    <p>Este emblemático estadio albergará enfrentamientos decisivos en las rondas de la Copa del Mundo de la FIFA 2026.</p>
  `;

  modal.classList.add('open');
}

function closeStadiumModal() {
  const modal = document.getElementById('stadium-modal');
  if (modal) modal.classList.remove('open');
}

function setupSidebar() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('app-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const layout = document.querySelector('.app-layout');
  
  if (toggle && sidebar && overlay && layout) {
    const toggleSidebar = () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
        layout.classList.remove('sidebar-collapsed');
      } else {
        layout.classList.toggle('sidebar-collapsed');
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
      }
    };
    toggle.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
    
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
      } else {
        layout.classList.remove('sidebar-collapsed');
      }
    });
  }
}
