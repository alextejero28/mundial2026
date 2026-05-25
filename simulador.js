// Automatic Simulator Logic - simulador.js

let simPredictions = {}; // Simulated group scores: { matchId: { g1, g2 } }
let simKoPredictions = {}; // Simulated knockout scores: { matchId: { g1, g2 } }
let simKoWinners = {}; // Simulated knockout penalty winners: { matchId: teamId }

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
  const savedGroupSims = localStorage.getItem('wc2026_sim_group_scores');
  if (savedGroupSims) {
    simPredictions = JSON.parse(savedGroupSims);
  } else {
    simPredictions = {};
  }

  const savedKoSims = localStorage.getItem('wc2026_sim_ko_scores');
  if (savedKoSims) {
    simKoPredictions = JSON.parse(savedKoSims);
  } else {
    simKoPredictions = {};
  }

  const savedKoWinnersSims = localStorage.getItem('wc2026_sim_ko_winners');
  if (savedKoWinnersSims) {
    simKoWinners = JSON.parse(savedKoWinnersSims);
  } else {
    simKoWinners = {};
  }
}

function savePredictions() {
  localStorage.setItem('wc2026_sim_group_scores', JSON.stringify(simPredictions));
  localStorage.setItem('wc2026_sim_ko_scores', JSON.stringify(simKoPredictions));
  localStorage.setItem('wc2026_sim_ko_winners', JSON.stringify(simKoWinners));
  updateStatsBadge();
}

function setupEventListeners() {
  document.getElementById('btn-sim-groups').addEventListener('click', () => {
    simulateGroups();
  });

  document.getElementById('btn-sim-ko').addEventListener('click', () => {
    simulateKnockout();
  });

  document.getElementById('btn-sim-all').addEventListener('click', () => {
    simulateAll();
  });

  document.getElementById('btn-reset-sim').addEventListener('click', () => {
    resetSimulation();
  });

  // View toggle buttons
  document.getElementById('btn-show-groups').addEventListener('click', () => {
    document.getElementById('groups-section').style.display = 'block';
    document.getElementById('bracket-section').style.display = 'none';
    document.getElementById('btn-show-groups').classList.add('btn-accent');
    document.getElementById('btn-show-bracket').classList.remove('btn-accent');
  });

  document.getElementById('btn-show-bracket').addEventListener('click', () => {
    document.getElementById('groups-section').style.display = 'none';
    document.getElementById('bracket-section').style.display = 'block';
    document.getElementById('btn-show-groups').classList.remove('btn-accent');
    document.getElementById('btn-show-bracket').classList.add('btn-accent');
  });
}

function resetSimulation() {
  simPredictions = {};
  simKoPredictions = {};
  simKoWinners = {};
  savePredictions();
  renderAll();
}

// -------------------------------------------------------------
// MODELO PROBABILÍSTICO (POISSON-BIASED)
// -------------------------------------------------------------
function poissonRandom(lambda) {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1.0;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

function simulateMatch(team1Rating, team2Rating) {
  // Average goals in football matches is around 1.35 goals per team
  // We bias the lambda (mean goals) based on rating difference
  let lambda1 = 1.35 + (team1Rating - team2Rating) / 25;
  let lambda2 = 1.35 + (team2Rating - team1Rating) / 25;

  lambda1 = Math.max(0.1, Math.min(4.5, lambda1));
  lambda2 = Math.max(0.1, Math.min(4.5, lambda2));

  return {
    g1: poissonRandom(lambda1),
    g2: poissonRandom(lambda2)
  };
}

// -------------------------------------------------------------
// TOURNAMENT SIMULATION ENGINE
// -------------------------------------------------------------
function simulateGroups() {
  WORLD_CUP_DATA.groupMatches.forEach(m => {
    const t1 = WORLD_CUP_DATA.teams[m.team1];
    const t2 = WORLD_CUP_DATA.teams[m.team2];
    const result = simulateMatch(t1.rating, t2.rating);
    simPredictions[m.id] = result;
  });

  // Clearing knockout simulations because group standings changed
  simKoPredictions = {};
  simKoWinners = {};
  savePredictions();
  renderAll();
}

function simulateKnockout() {
  // If groups are not simulated yet, simulate them first!
  const totalGroupMatches = WORLD_CUP_DATA.groupMatches.length;
  if (Object.keys(simPredictions).length < totalGroupMatches) {
    simulateGroups();
  }

  // Calculate standings to populate R32
  groupStandings = getAllStandings();
  const bestThirds = getBestThirdPlaces().slice(0, 8);
  thirdsAssignment = assignThirdPlaces(bestThirds);
  resolvedTeams = {};
  simKoPredictions = {};
  simKoWinners = {};

  const stages = ['R32', 'R16', 'QF', 'SF', 'F', '3RD'];

  stages.forEach(stageName => {
    const matches = WORLD_CUP_DATA.knockoutMatches[stageName];
    matches.forEach(m => {
      // Resolve teams dynamically (which works because we simulate sequentially)
      const { t1, t2 } = resolveMatchTeams(m.id, groupStandings, thirdsAssignment);
      if (t1 && t2) {
        const result = simulateMatch(t1.rating, t2.rating);
        simKoPredictions[m.id] = result;

        if (result.g1 === result.g2) {
          // Resolve penalty draw
          const prob1 = 0.5 + (t1.rating - t2.rating) / 100;
          const cappedProb = Math.max(0.25, Math.min(0.75, prob1));
          if (Math.random() < cappedProb) {
            simKoWinners[m.id] = t1.id;
          } else {
            simKoWinners[m.id] = t2.id;
          }
        }
      }
    });
    // Invalidate resolved teams cache for next stage
    resolvedTeams = {};
  });

  savePredictions();
  renderAll();

  // Automatically switch view to bracket so user sees results
  document.getElementById('btn-show-bracket').click();
}

function simulateAll() {
  simulateGroups();
  simulateKnockout();
}

// -------------------------------------------------------------
// STANDINGS & R32 ASSIGNMENT COPIED & ADAPTED FOR SIMULATION
// -------------------------------------------------------------
function calculateStandings(groupLetter) {
  const teamIds = WORLD_CUP_DATA.groups[groupLetter];
  const standings = teamIds.map(id => ({
    ...WORLD_CUP_DATA.teams[id],
    pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, gd: 0, pts: 0
  }));

  const matches = WORLD_CUP_DATA.groupMatches.filter(m => m.group === groupLetter);

  matches.forEach(m => {
    const pred = simPredictions[m.id];
    if (!pred || pred.g1 === null || pred.g2 === null) return;

    const t1 = standings.find(t => t.id === m.team1);
    const t2 = standings.find(t => t.id === m.team2);

    t1.pj++;
    t2.pj++;
    t1.gf += pred.g1;
    t1.gc += pred.g2;
    t2.gf += pred.g2;
    t2.gc += pred.g1;

    if (pred.g1 > pred.g2) {
      t1.g++;
      t1.pts += 3;
      t2.p++;
    } else if (pred.g1 < pred.g2) {
      t2.g++;
      t2.pts += 3;
      t1.p++;
    } else {
      t1.e++;
      t2.e++;
      t1.pts += 1;
      t2.pts += 1;
    }
    
    t1.gd = t1.gf - t1.gc;
    t2.gd = t2.gf - t2.gc;
  });

  standings.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    
    const h2hMatch = matches.find(m => 
      (m.team1 === a.id && m.team2 === b.id) || (m.team1 === b.id && m.team2 === a.id)
    );
    if (h2hMatch) {
      const pred = simPredictions[h2hMatch.id];
      if (pred && pred.g1 !== null && pred.g2 !== null) {
        if (h2hMatch.team1 === a.id) {
          if (pred.g1 !== pred.g2) return pred.g2 - pred.g1;
        } else {
          if (pred.g1 !== pred.g2) return pred.g1 - pred.g2;
        }
      }
    }
    
    return b.rating - a.rating;
  });

  return standings;
}

function getAllStandings() {
  const all = {};
  Object.keys(WORLD_CUP_DATA.groups).forEach(g => {
    all[g] = calculateStandings(g);
  });
  return all;
}

function getBestThirdPlaces() {
  const standings = getAllStandings();
  const thirds = [];
  
  Object.keys(standings).forEach(groupLetter => {
    const groupTable = standings[groupLetter];
    const thirdTeam = groupTable[2];
    if (thirdTeam) {
      thirds.push({
        ...thirdTeam,
        groupOrigin: groupLetter
      });
    }
  });

  thirds.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return b.rating - a.rating;
  });

  return thirds;
}

function assignThirdPlaces(bestThirdTeams) {
  const result = findAssignment(slots, bestThirdTeams, 0, {}, new Set());
  if (result) return result;

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
// KNOCKOUT BRACKET RESOLVER
// -------------------------------------------------------------
function getR32Teams(groupStandings, thirdsAssignment) {
  const teamsMap = {};
  const getTeam = (group, pos) => {
    const table = groupStandings[group];
    return table ? table[pos - 1] : null;
  };
  
  teamsMap[73] = { t1: getTeam('A', 2), t2: getTeam('B', 2) };
  teamsMap[76] = { t1: getTeam('C', 1), t2: getTeam('F', 2) };
  teamsMap[74] = { t1: getTeam('E', 1), t2: thirdsAssignment[74] || null };
  teamsMap[75] = { t1: getTeam('F', 1), t2: getTeam('C', 2) };
  teamsMap[78] = { t1: getTeam('E', 2), t2: getTeam('I', 2) };
  teamsMap[77] = { t1: getTeam('I', 1), t2: thirdsAssignment[77] || null };
  teamsMap[79] = { t1: getTeam('A', 1), t2: thirdsAssignment[79] || null };
  teamsMap[80] = { t1: getTeam('L', 1), t2: thirdsAssignment[80] || null };
  teamsMap[82] = { t1: getTeam('G', 1), t2: thirdsAssignment[82] || null };
  teamsMap[83] = { t1: getTeam('K', 2), t2: getTeam('L', 2) };
  teamsMap[81] = { t1: getTeam('D', 1), t2: thirdsAssignment[81] || null };
  teamsMap[85] = { t1: getTeam('B', 1), t2: thirdsAssignment[85] || null };
  teamsMap[84] = { t1: getTeam('H', 1), t2: getTeam('J', 2) };
  teamsMap[86] = { t1: getTeam('J', 1), t2: getTeam('H', 2) };
  teamsMap[87] = { t1: getTeam('K', 1), t2: thirdsAssignment[87] || null };
  teamsMap[88] = { t1: getTeam('D', 2), t2: getTeam('G', 2) };
  
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
  if (!t1 || !t2) return { winner: null, loser: null, g1: null, g2: null };

  const pred = simKoPredictions[matchId] || { g1: null, g2: null };
  if (pred.g1 === null || pred.g2 === null) {
    return { winner: null, loser: null, g1: null, g2: null };
  }

  if (pred.g1 > pred.g2) {
    return { winner: t1, loser: t2, g1: pred.g1, g2: pred.g2 };
  } else if (pred.g1 < pred.g2) {
    return { winner: t2, loser: t1, g1: pred.g1, g2: pred.g2 };
  } else {
    const pWinnerId = simKoWinners[matchId];
    if (pWinnerId === t1.id) {
      return { winner: t1, loser: t2, g1: pred.g1, g2: pred.g2, penaltyWinnerId: t1.id };
    } else if (pWinnerId === t2.id) {
      return { winner: t2, loser: t1, g1: pred.g1, g2: pred.g2, penaltyWinnerId: t2.id };
    } else {
      return { winner: null, loser: null, g1: pred.g1, g2: pred.g2 };
    }
  }
}

// -------------------------------------------------------------
// RENDERERS (GROUPS AND BRACKETS)
// -------------------------------------------------------------
function renderAll() {
  groupStandings = getAllStandings();
  const bestThirds = getBestThirdPlaces().slice(0, 8);
  thirdsAssignment = assignThirdPlaces(bestThirds);
  resolvedTeams = {};

  renderGroupStage();
  renderThirdPlacesStandings();
  renderBracket();
  renderChampionCard();
  updateStatsBadge();
}

function renderGroupStage() {
  const container = document.getElementById('groups-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  Object.keys(WORLD_CUP_DATA.groups).sort().forEach(groupLetter => {
    const groupTable = groupStandings[groupLetter];
    const groupMatches = WORLD_CUP_DATA.groupMatches.filter(m => m.group === groupLetter);
    
    const card = document.createElement('div');
    card.className = 'neon-card';
    
    let headerHTML = `
      <div class="group-header">
        <h3 class="group-name">Grupo ${groupLetter}</h3>
      </div>
    `;
    
    let tableHTML = `
      <div class="standings-table-container">
        <table class="standings-table">
          <thead>
            <tr>
              <th class="pos-col">Pos</th>
              <th class="team-col">Equipo</th>
              <th>PJ</th>
              <th>G</th>
              <th>E</th>
              <th>P</th>
              <th>GF</th>
              <th>GC</th>
              <th class="pts-col">Pts</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    groupTable.forEach((team, idx) => {
      let qClass = '';
      if (idx === 0) qClass = 'q1 row-q1';
      else if (idx === 1) qClass = 'q2 row-q2';
      else if (idx === 2) qClass = 'q3 row-q3';
      
      tableHTML += `
        <tr class="${qClass}">
          <td class="pos-col ${qClass}">${idx + 1}</td>
          <td class="team-col">
            <div class="team-cell-content">
              <img class="match-flag" src="https://flagcdn.com/w40/${team.flag}.png" alt="${team.name}">
              <span>${team.id}</span>
            </div>
          </td>
          <td>${team.pj}</td>
          <td>${team.g}</td>
          <td>${team.e}</td>
          <td>${team.p}</td>
          <td>${team.gf}</td>
          <td>${team.gc}</td>
          <td class="pts-col">${team.pts}</td>
        </tr>
      `;
    });
    
    tableHTML += `
          </tbody>
        </table>
      </div>
    `;
    
    let fixturesHTML = `<div class="fixtures-list">`;
    let currentJornada = 0;
    
    groupMatches.forEach(m => {
      if (m.jornada !== currentJornada) {
        currentJornada = m.jornada;
        fixturesHTML += `<div class="jornada-divider">Jornada ${currentJornada}</div>`;
      }
      
      const t1 = WORLD_CUP_DATA.teams[m.team1];
      const t2 = WORLD_CUP_DATA.teams[m.team2];
      const pred = simPredictions[m.id] || { g1: null, g2: null };
      
      const g1Val = pred.g1 !== null ? pred.g1 : '';
      const g2Val = pred.g2 !== null ? pred.g2 : '';
      
      let winnerClass1 = '';
      let winnerClass2 = '';
      if (pred.g1 !== null && pred.g2 !== null) {
        if (pred.g1 > pred.g2) winnerClass1 = 'predicted-winner';
        else if (pred.g2 > pred.g1) winnerClass2 = 'predicted-winner';
      }
      
      fixturesHTML += `
        <div class="match-item">
          <div class="match-info-meta">
            <span>${m.date} - ${m.time}</span>
            <span class="match-stadium" title="${m.stadium}, ${m.city}" onclick="showStadiumDetails('${m.stadium}', '${m.city}')" style="cursor: help;">${m.city}</span>
          </div>
          <div class="match-grid-row">
            <div class="match-team team-home ${winnerClass1}">
              <span class="team-name-long">${t1.name}</span>
              <span class="team-name-short">${t1.id}</span>
              <img class="match-flag" src="https://flagcdn.com/w40/${t1.flag}.png" alt="${t1.name}">
            </div>
            
            <div class="score-display" style="font-weight: 800; font-size: 1.1rem; color: var(--accent-cyan); min-width: 60px; text-align: center;">
              ${g1Val !== '' ? `${g1Val} : ${g2Val}` : '- : -'}
            </div>
            
            <div class="match-team team-away ${winnerClass2}">
              <img class="match-flag" src="https://flagcdn.com/w40/${t2.flag}.png" alt="${t2.name}">
              <span class="team-name-long">${t2.name}</span>
              <span class="team-name-short">${t2.id}</span>
            </div>
          </div>
        </div>
      `;
    });
    
    fixturesHTML += `</div>`;
    card.innerHTML = headerHTML + tableHTML + fixturesHTML;
    container.appendChild(card);
  });
}

function renderThirdPlacesStandings() {
  const container = document.getElementById('thirds-container');
  if (!container) return;
  
  const thirds = getBestThirdPlaces();
  
  let html = `
    <div class="thirds-standings-section">
      <div class="thirds-header">
        <h3 class="thirds-title">Tabla de Terceros (Simulado)</h3>
        <span class="thirds-badge-icon">Pasan 8 de 12</span>
      </div>
      <div class="standings-table-container">
        <table class="standings-table">
          <thead>
            <tr>
              <th class="pos-col">Pos</th>
              <th class="team-col">Equipo</th>
              <th>Grupo</th>
              <th>PJ</th>
              <th>G</th>
              <th>E</th>
              <th>P</th>
              <th>GF</th>
              <th>GC</th>
              <th class="pts-col">Pts</th>
            </tr>
          </thead>
          <tbody>
  `;
  
  thirds.forEach((team, idx) => {
    const isQualifying = idx < 8;
    const qClass = isQualifying ? 'q1 row-q1' : 'row-eliminated';
    const posColClass = isQualifying ? 'q1' : '';
    
    html += `
      <tr class="${qClass}" style="${!isQualifying ? 'opacity: 0.5;' : ''}">
        <td class="pos-col ${posColClass}">${idx + 1}</td>
        <td class="team-col">
          <div class="team-cell-content">
            <img class="match-flag" src="https://flagcdn.com/w40/${team.flag}.png" alt="${team.name}">
            <span>${team.name}</span>
          </div>
        </td>
        <td style="font-weight: 700;">Grupo ${team.groupOrigin}</td>
        <td>${team.pj}</td>
        <td>${team.g}</td>
        <td>${team.e}</td>
        <td>${team.p}</td>
        <td>${team.gf}</td>
        <td>${team.gc}</td>
        <td class="pts-col">${team.pts}</td>
      </tr>
    `;
  });
  
  html += `
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}

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
      let labelText = m.label;
      let headerHTML = `
        <div class="bracket-match-header">
          <span>${labelText}</span>
          <span class="match-stadium" title="${m.stadium}, ${m.city}" onclick="showStadiumDetails('${m.stadium}', '${m.city}')" style="cursor: help;">${m.city}</span>
        </div>
      `;

      const { t1, t2 } = resolveMatchTeams(m.id, groupStandings, thirdsAssignment);
      const result = getMatchResult(m.id, groupStandings, thirdsAssignment);

      // Team 1 HTML
      let t1HTML = '';
      if (t1) {
        const isWinner = result.winner && result.winner.id === t1.id;
        const scoreVal = result.g1 !== null ? result.g1 : '';
        const rowClass = isWinner ? 'winner' : '';
        
        let penaltyBadge = '';
        if (result.g1 !== null && result.g1 === result.g2 && result.penaltyWinnerId === t1.id) {
          penaltyBadge = `<span class="penalty-badge-btn active" style="cursor: default; pointer-events: none; margin-left: 0.5rem; font-size: 0.6rem; padding: 0.1rem 0.3rem;">Pen.</span>`;
        }

        t1HTML = `
          <div class="bracket-team-row ${rowClass}" data-team-id="${t1.id}" onmouseenter="highlightTeam('${t1.id}')" onmouseleave="unhighlightTeam('${t1.id}')">
            <div class="bracket-team-info">
              <img class="match-flag" src="https://flagcdn.com/w40/${t1.flag}.png" alt="${t1.name}">
              <span class="team-name-full" title="${t1.name}">${t1.name}</span>
              <span class="team-name-acronym" title="${t1.name}">${t1.id}</span>
            </div>
            <div style="display: flex; align-items: center;">
              ${penaltyBadge}
              <div class="bracket-team-score" style="margin-left: 0.5rem; width: 20px; text-align: right; font-weight: 700;">${scoreVal !== '' ? scoreVal : '-'}</div>
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
            <div class="bracket-team-score">-</div>
          </div>
        `;
      }

      // Team 2 HTML
      let t2HTML = '';
      if (t2) {
        const isWinner = result.winner && result.winner.id === t2.id;
        const scoreVal = result.g2 !== null ? result.g2 : '';
        const rowClass = isWinner ? 'winner' : '';
        
        let penaltyBadge = '';
        if (result.g1 !== null && result.g1 === result.g2 && result.penaltyWinnerId === t2.id) {
          penaltyBadge = `<span class="penalty-badge-btn active" style="cursor: default; pointer-events: none; margin-left: 0.5rem; font-size: 0.6rem; padding: 0.1rem 0.3rem;">Pen.</span>`;
        }

        t2HTML = `
          <div class="bracket-team-row ${rowClass}" data-team-id="${t2.id}" onmouseenter="highlightTeam('${t2.id}')" onmouseleave="unhighlightTeam('${t2.id}')">
            <div class="bracket-team-info">
              <img class="match-flag" src="https://flagcdn.com/w40/${t2.flag}.png" alt="${t2.name}">
              <span class="team-name-full" title="${t2.name}">${t2.name}</span>
              <span class="team-name-acronym" title="${t2.name}">${t2.id}</span>
            </div>
            <div style="display: flex; align-items: center;">
              ${penaltyBadge}
              <div class="bracket-team-score" style="margin-left: 0.5rem; width: 20px; text-align: right; font-weight: 700;">${scoreVal !== '' ? scoreVal : '-'}</div>
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
            <div class="bracket-team-score">-</div>
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

      // Match 104 is Final, Match 103 is 3rd place
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
}

function renderChampionCard() {
  const container = document.getElementById('champion-container');
  if (!container) return;

  const finalResult = getMatchResult(104, groupStandings, thirdsAssignment);
  if (finalResult.winner) {
    const champion = finalResult.winner;
    container.innerHTML = `
      <div class="champion-hero-card">
        <div class="champion-trophy">🏆</div>
        <div class="champion-title">Campeón del Mundo 2026</div>
        <div class="champion-team-box">
          <img class="champion-flag" src="https://flagcdn.com/w80/${champion.flag}.png" alt="${champion.name}">
          <span class="champion-name">${champion.name}</span>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = '';
  }
}

function updateStatsBadge() {
  const totalGroups = WORLD_CUP_DATA.groupMatches.length;
  const groupsDone = Object.keys(simPredictions).length;
  const simGroupText = document.getElementById('sim-group-text');
  const simGroupDot = document.getElementById('sim-group-dot');

  if (simGroupText) {
    if (groupsDone === totalGroups) {
      simGroupText.innerText = 'Simulado';
      if (simGroupDot) simGroupDot.classList.add('completed');
    } else {
      simGroupText.innerText = `${groupsDone}/${totalGroups} part.`;
      if (simGroupDot) simGroupDot.classList.remove('completed');
    }
  }

  // Knockout stats
  let koDone = 0;
  const matchIds = [
    ...WORLD_CUP_DATA.knockoutMatches.R32.map(m => m.id),
    ...WORLD_CUP_DATA.knockoutMatches.R16.map(m => m.id),
    ...WORLD_CUP_DATA.knockoutMatches.QF.map(m => m.id),
    ...WORLD_CUP_DATA.knockoutMatches.SF.map(m => m.id),
    ...WORLD_CUP_DATA.knockoutMatches['3RD'].map(m => m.id),
    ...WORLD_CUP_DATA.knockoutMatches.F.map(m => m.id)
  ];
  
  matchIds.forEach(id => {
    const pred = simKoPredictions[id];
    if (pred && pred.g1 !== null && pred.g2 !== null) {
      if (pred.g1 === pred.g2) {
        if (simKoWinners[id]) koDone++;
      } else {
        koDone++;
      }
    }
  });

  const simKoText = document.getElementById('sim-ko-text');
  const simKoDot = document.getElementById('sim-ko-dot');

  if (simKoText) {
    if (koDone === 32) {
      simKoText.innerText = 'Simulado';
      if (simKoDot) simKoDot.classList.add('completed');
    } else {
      simKoText.innerText = `${koDone}/32 part.`;
      if (simKoDot) simKoDot.classList.remove('completed');
    }
  }

  const resetBtn = document.getElementById('btn-reset-sim');
  if (resetBtn) {
    const shouldDisable = groupsDone === 0 && koDone === 0;
    resetBtn.disabled = shouldDisable;
    if (shouldDisable) {
      resetBtn.classList.add('disabled');
    } else {
      resetBtn.classList.remove('disabled');
    }
  }
}

// -------------------------------------------------------------
// INTERACTIONS
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

// Stadium Details Modal
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
