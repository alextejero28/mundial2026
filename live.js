// Live Results Dashboard Logic - live.js
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
  setupViewTabs();
  initApiLoading();

  // Set up auto-refresh interval every 30 seconds
  setInterval(() => {
    initApiLoading(true);
  }, 30000);
});

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

function setupViewTabs() {
  const btnGroups = document.getElementById('btn-show-groups');
  const btnBracket = document.getElementById('btn-show-bracket');
  const sectionGroups = document.getElementById('groups-section');
  const sectionBracket = document.getElementById('bracket-section');

  if (btnGroups && btnBracket && sectionGroups && sectionBracket) {
    btnGroups.addEventListener('click', () => {
      sectionGroups.style.display = 'block';
      sectionBracket.style.display = 'none';
      btnGroups.classList.add('btn-accent');
      btnBracket.classList.remove('btn-accent');
    });

    btnBracket.addEventListener('click', () => {
      sectionGroups.style.display = 'none';
      sectionBracket.style.display = 'block';
      btnGroups.classList.remove('btn-accent');
      btnBracket.classList.add('btn-accent');
    });
  }
}

function calculateStandings(groupLetter) {
  const teamIds = WORLD_CUP_DATA.groups[groupLetter];
  const standings = teamIds.map(id => ({
    ...WORLD_CUP_DATA.teams[id],
    pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, gd: 0, pts: 0
  }));

  const matches = WORLD_CUP_DATA.groupMatches.filter(m => m.group === groupLetter);

  matches.forEach(m => {
    if (m.g1 === null || m.g2 === null) return;

    const t1 = standings.find(t => t.id === m.team1);
    const t2 = standings.find(t => t.id === m.team2);

    t1.pj++;
    t2.pj++;
    t1.gf += m.g1;
    t1.gc += m.g2;
    t2.gf += m.g2;
    t2.gc += m.g1;

    if (m.g1 > m.g2) {
      t1.g++;
      t1.pts += 3;
      t2.p++;
    } else if (m.g1 < m.g2) {
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
    if (h2hMatch && h2hMatch.g1 !== null && h2hMatch.g2 !== null) {
      if (h2hMatch.team1 === a.id) {
        if (h2hMatch.g1 !== h2hMatch.g2) return h2hMatch.g2 - h2hMatch.g1;
      } else {
        if (h2hMatch.g1 !== h2hMatch.g2) return h2hMatch.g1 - h2hMatch.g2;
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
  // Check if any match in the group stage has been played.
  // If no matches have been played, we do not assign third places yet.
  const anyGroupPlayed = WORLD_CUP_DATA.groupMatches.some(m => m.g1 !== null);
  if (!anyGroupPlayed) return {};

  // Official FIFA combinations override for BDEFIJKL
  const qualifiedGroups = bestThirdTeams.slice(0, 8).map(t => t.groupOrigin).sort().join('');
  if (qualifiedGroups === 'BDEFIJKL') {
    const groupsMap = {
      74: 'D', // Alemania vs Paraguay
      77: 'F', // Francia vs Suecia
      79: 'E', // México vs Ecuador
      80: 'K', // Inglaterra vs RD Congo
      81: 'B', // Estados Unidos vs Bosnia
      82: 'I', // Bélgica vs Senegal
      85: 'J', // Suiza vs Argelia
      87: 'L'  // Portugal vs Ghana
    };
    const assignment = {};
    for (const [matchId, groupLetter] of Object.entries(groupsMap)) {
      const team = bestThirdTeams.find(t => t.groupOrigin === groupLetter);
      if (team) {
        assignment[matchId] = team;
      }
    }
    return assignment;
  }

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

function getR32Teams(groupStandings, thirdsAssignment) {
  const teamsMap = {};
  const getTeam = (group, pos) => {
    // Check if any match in this specific group has been played.
    // If not, we return null to keep the team as a placeholder (e.g. "1º Grupo A").
    const groupMatches = WORLD_CUP_DATA.groupMatches.filter(m => m.group === group);
    const anyPlayed = groupMatches.some(m => m.g1 !== null);
    if (!anyPlayed) return null;

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

  let match = null;
  for (const matches of Object.values(WORLD_CUP_DATA.knockoutMatches)) {
    match = matches.find(m => m.id === matchId);
    if (match) break;
  }

  if (!match || match.g1 === null || match.g2 === null) {
    return { winner: null, loser: null, g1: null, g2: null };
  }

  if (match.g1 > match.g2) {
    return { winner: t1, loser: t2, g1: match.g1, g2: match.g2 };
  } else if (match.g1 < match.g2) {
    return { winner: t2, loser: t1, g1: match.g1, g2: match.g2 };
  } else {
    // If it's a draw, check for a penaltyWinnerId property
    const pWinnerId = match.penaltyWinnerId || t1.id; // Fallback to t1 for display safety
    if (pWinnerId === t1.id) {
      return { winner: t1, loser: t2, g1: match.g1, g2: match.g2, penaltyWinnerId: t1.id };
    } else {
      return { winner: t2, loser: t1, g1: match.g1, g2: match.g2, penaltyWinnerId: t2.id };
    }
  }
}

function renderAll() {
  groupStandings = getAllStandings();
  const bestThirds = getBestThirdPlaces().slice(0, 8);
  thirdsAssignment = assignThirdPlaces(bestThirds);
  resolvedTeams = {};

  renderUpcomingMatches();
  renderGroupStage();
  renderThirdPlacesStandings();
  renderBracket();
  renderChampionCard();
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
      
      const g1Val = m.g1 !== null ? m.g1 : 0;
      const g2Val = m.g2 !== null ? m.g2 : 0;
      
      let winnerClass1 = '';
      let winnerClass2 = '';
      if (m.g1 !== null && m.g2 !== null) {
        if (m.g1 > m.g2) winnerClass1 = 'predicted-winner';
        else if (m.g2 > m.g1) winnerClass2 = 'predicted-winner';
      }
      
      const isLive = isMatchLive(m);
      const hasScore = m.g1 !== null && m.g2 !== null;
      const liveClass = isLive ? ' live-match-item' : '';
      const clickableClass = hasScore ? ' clickable-match-item' : '';
      const clickAttr = hasScore ? `onclick="showMatchDetails(${m.id})"` : '';
      const liveBadgeHTML = isLive ? `<span class="match-live-badge-dot" title="Partido en vivo"></span> ` : '';
      const liveTimeLabel = isLive ? `<span class="live-time-text">${formatTimeElapsed(m.timeElapsed)}</span>` : `${m.date} - ${m.time}`;
      
      fixturesHTML += `
        <div class="match-item${liveClass}${clickableClass}" ${clickAttr}>
          <div class="match-info-meta">
            <span style="display: flex; align-items: center; gap: 0.35rem;">
              ${liveBadgeHTML}
              ${liveTimeLabel}
            </span>
            <span class="match-stadium" title="${m.stadium}, ${m.city}" onclick="${hasScore ? 'event.stopPropagation(); ' : ''}showStadiumDetails('${m.stadium.replace(/'/g, "\\'")}', '${m.city.replace(/'/g, "\\'")}')" style="cursor: help;">${m.city}</span>
          </div>
          <div class="match-grid-row">
            <div class="match-team team-home ${winnerClass1}">
              <span class="team-name-long">${t1.name}</span>
              <span class="team-name-short">${t1.id}</span>
              <img class="match-flag" src="https://flagcdn.com/w40/${t1.flag}.png" alt="${t1.name}">
            </div>
            
            <div class="score-display" style="font-weight: 800; font-size: 1.1rem; color: var(--accent-cyan); min-width: 60px; text-align: center;">
              ${m.g1 !== null ? m.g1 : '-'} : ${m.g2 !== null ? m.g2 : '-'}
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
        <h3 class="thirds-title">Tabla de Terceros Oficial</h3>
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
      const isLive = isMatchLive(m);
      const liveBadgeHTML = isLive ? `<span class="bracket-live-dot" title="En Vivo"></span> ` : '';
      const liveTimeLabel = isLive ? `<span class="live-time-text">${formatTimeElapsed(m.timeElapsed)}</span>` : `${formatShortDate(m.date)}  -  ${m.time}`;
      
      let headerHTML = `
        <div class="bracket-match-header">
          <div style="display: flex; align-items: center; justify-content: center; gap: 0.25rem;">
            ${liveBadgeHTML}
            ${liveTimeLabel}
          </div>
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
        
        const isLive = isMatchLive(finalMatch);
        const hasScore = finalMatch.g1 !== null && finalMatch.g2 !== null;
        if (isLive) {
          matchCard.classList.add('live-bracket-match');
        }
        if (hasScore) {
          matchCard.classList.add('clickable-bracket-match');
          matchCard.setAttribute('onclick', `showMatchDetails(${finalMatch.id})`);
        }
        
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
        
        const isLive = isMatchLive(thirdMatch);
        const hasScore = thirdMatch.g1 !== null && thirdMatch.g2 !== null;
        if (isLive) {
          matchCard.classList.add('live-bracket-match');
        }
        if (hasScore) {
          matchCard.classList.add('clickable-bracket-match');
          matchCard.setAttribute('onclick', `showMatchDetails(${thirdMatch.id})`);
        }
        
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
        
        const isLive = isMatchLive(m);
        const hasScore = m.g1 !== null && m.g2 !== null;
        if (isLive) {
          matchCard.classList.add('live-bracket-match');
        }
        if (hasScore) {
          matchCard.classList.add('clickable-bracket-match');
          matchCard.setAttribute('onclick', `showMatchDetails(${m.id})`);
        }
        
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
        <div class="champion-title">Campeón del Mundo Oficial</div>
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

function getMatchTimestamp(m) {
  if (!m || !m.date) return 0;
  const dateStr = m.date.toLowerCase();
  let month = 6; // junio por defecto
  if (dateStr.includes('julio')) {
    month = 7;
  }
  const matchDay = dateStr.match(/\d+/);
  const day = matchDay ? parseInt(matchDay[0], 10) : 1;
  
  let hour = 0;
  let minute = 0;
  if (m.time) {
    const matchTime = m.time.match(/(\d+):(\d+)/);
    if (matchTime) {
      hour = parseInt(matchTime[1], 10);
      minute = parseInt(matchTime[2], 10);
    }
  }
  return month * 100000 + day * 100 + hour + minute / 100;
}

function getMatchDate(m) {
  if (!m || !m.date || !m.time) return null;
  const dateStr = m.date.toLowerCase();
  let monthIdx = 5; // June (0-indexed = 5)
  if (dateStr.includes('julio')) {
    monthIdx = 6; // July (0-indexed = 6)
  }
  const matchDay = dateStr.match(/\d+/);
  const day = matchDay ? parseInt(matchDay[0], 10) : 1;
  
  let hour = 0;
  let minute = 0;
  if (m.time) {
    const matchTime = m.time.match(/(\d+):(\d+)/);
    if (matchTime) {
      hour = parseInt(matchTime[1], 10);
      minute = parseInt(matchTime[2], 10);
    }
  }
  return new Date(2026, monthIdx, day, hour, minute);
}

function getLocalCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (year < 2026 || (year === 2026 && month < 5)) {
    // Mock date: 1 hour before first match (first match is at 15:00 EDT / 19:00 UTC, so mock is 14:00 EDT / 18:00 UTC)
    return new Date(Date.UTC(2026, 5, 11, 18, 0));
  }
  return now;
}

function getUpcomingMatches() {
  const allMatches = [
    ...WORLD_CUP_DATA.groupMatches,
    ...Object.values(WORLD_CUP_DATA.knockoutMatches).flat()
  ];
  
  const nowLocal = getLocalCurrentDate();
  
  const upcoming = allMatches.filter(m => {
    const matchDate = getMatchDate(m);
    if (!matchDate) return false;
    
    const timeDiffMs = nowLocal - matchDate; // positive if match started, negative if in future
    const isFutureOrInProgress = timeDiffMs <= 2.5 * 60 * 60 * 1000;
    
    if (m.g1 !== null && m.g2 !== null) {
      // If it has a score, we only keep it if it is currently in progress (live)
      const inProgress = timeDiffMs >= 0 && timeDiffMs <= 2.5 * 60 * 60 * 1000;
      return inProgress;
    }
    
    return isFutureOrInProgress;
  });
  
  upcoming.sort((a, b) => {
    const dateA = getMatchDate(a);
    const dateB = getMatchDate(b);
    if (dateA && dateB) {
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
    }
    return a.id - b.id;
  });
  
  return upcoming.slice(0, 5);
}

function renderUpcomingMatches() {
  const container = document.getElementById('upcoming-container');
  const section = document.getElementById('upcoming-section');
  if (!container || !section) return;

  const upcoming = getUpcomingMatches();
  if (upcoming.length === 0) {
    section.style.display = 'none';
    return;
  }
  section.style.display = 'block';
  container.innerHTML = '';

  upcoming.forEach(m => {
    let t1Name = '', t2Name = '', t1Flag = '', t2Flag = '';
    let isKnockout = !m.group;
    let stageLabel = isKnockout ? m.label : `Grupo ${m.group}`;

    if (!isKnockout) {
      const t1 = WORLD_CUP_DATA.teams[m.team1];
      const t2 = WORLD_CUP_DATA.teams[m.team2];
      t1Name = t1 ? t1.name : m.team1;
      t1Flag = t1 ? t1.flag : '';
      t2Name = t2 ? t2.name : m.team2;
      t2Flag = t2 ? t2.flag : '';
    } else {
      const { t1, t2 } = resolveMatchTeams(m.id, groupStandings, thirdsAssignment);
      t1Name = t1 ? t1.name : (m.team1Placeholder || 'Por definir');
      t1Flag = t1 ? t1.flag : '';
      t2Name = t2 ? t2.name : (m.team2Placeholder || 'Por definir');
      t2Flag = t2 ? t2.flag : '';
    }

    const t1FlagHTML = t1Flag 
      ? `<img class="match-flag" src="https://flagcdn.com/w40/${t1Flag}.png" alt="${t1Name}">`
      : `<div class="match-flag-placeholder">TBD</div>`;
    const t2FlagHTML = t2Flag 
      ? `<img class="match-flag" src="https://flagcdn.com/w40/${t2Flag}.png" alt="${t2Name}">`
      : `<div class="match-flag-placeholder">TBD</div>`;

    const isLive = isMatchLive(m);

    const hasScore = m.g1 !== null && m.g2 !== null;
    const card = document.createElement('div');
    card.className = 'upcoming-match-card' + (isLive ? ' live-card' : '') + (hasScore ? ' clickable-card' : '');
    if (hasScore) {
      card.setAttribute('onclick', `showMatchDetails(${m.id})`);
    }
    
    const dateFormatted = m.date.replace(/de junio/i, 'Jun').replace(/de julio/i, 'Jul');
    const escapedStadium = m.stadium.replace(/'/g, "\\'");
    const escapedCity = m.city.replace(/'/g, "\\'");

    let liveBadgeHTML = '';
    if (isLive) {
      liveBadgeHTML = `<span class="upcoming-live-badge"><span class="live-dot"></span> ${formatTimeElapsed(m.timeElapsed)}</span>`;
    }

    card.innerHTML = `
      <div class="upcoming-match-header">
        <span class="upcoming-stage-badge">${stageLabel}</span>
        ${isLive ? liveBadgeHTML : `<span class="upcoming-match-time">${m.time}</span>`}
      </div>
      <div class="upcoming-teams-list">
        <div class="upcoming-team-row ${!t1Flag ? 'placeholder' : ''}">
          <div class="upcoming-team-left">
            ${t1FlagHTML}
            <span>${t1Name}</span>
          </div>
          <span class="upcoming-score-val ${m.g1 !== null ? 'has-score' : 'no-score'}">${m.g1 !== null ? m.g1 : '-'}</span>
        </div>
        <div class="upcoming-team-row ${!t2Flag ? 'placeholder' : ''}">
          <div class="upcoming-team-left">
            ${t2FlagHTML}
            <span>${t2Name}</span>
          </div>
          <span class="upcoming-score-val ${m.g2 !== null ? 'has-score' : 'no-score'}">${m.g2 !== null ? m.g2 : '-'}</span>
        </div>
      </div>
      <div class="upcoming-match-footer">
        <span>${dateFormatted}</span>
        <span class="upcoming-stadium" title="${m.stadium}, ${m.city}" onclick="showStadiumDetails('${escapedStadium}', '${escapedCity}')">
          📍 ${m.city}
        </span>
      </div>
    `;
    container.appendChild(card);
  });
}

// Stadium info
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

// Famous players list for simulating scorers when not present in API JSON
const FAMOUS_PLAYERS = {
  "MEX": ["S. Giménez", "H. Lozano", "H. Martín", "U. Antuna", "L. Chávez", "O. Pineda"],
  "RSA": ["P. Tau", "T. Zwane", "M. Mayambela", "L. Lepasa", "A. Modiba"],
  "KOR": ["Son Heung-min", "Hwang Hee-chan", "Cho Gue-sung", "Lee Kang-in", "Lee Jae-sung"],
  "CZE": ["P. Schick", "T. Souček", "V. Černý", "A. Hložek", "J. Kuchta"],
  "CAN": ["J. David", "A. Davies", "C. Larin", "T. Buchanan", "S. Eustáquio"],
  "BIH": ["E. Džeko", "H. Dulić", "L. Menalo", "M. Stevanović", "A. Rahmanović"],
  "QAT": ["Almoez Ali", "Akram Afif", "H. Al-Haydos", "Y. Abdurisag", "M. Waad"],
  "SUI": ["B. Embolo", "X. Shaqiri", "Z. Amdouni", "R. Vargas", "G. Xhaka"],
  "BRA": ["Vinicius Jr.", "Neymar Jr.", "Rodrygo", "Richarlison", "Gabriel Jesus", "Raphinha"],
  "MAR": ["Y. En-Nesyri", "H. Ziyech", "A. El Kaabi", "S. Boufal", "A. Ounahi"],
  "HAI": ["F. Frantzdy", "D. Nazon", "C. Arcus", "D. Guerrier"],
  "SCO": ["J. McGinn", "S. McTominay", "L. Shankland", "C. Adams", "R. Christie"],
  "USA": ["C. Pulisic", "T. Weah", "F. Balogun", "G. Reyna", "W. McKennie"],
  "PAR": ["M. Almirón", "A. Sanabria", "G. Ávalos", "R. Gómez", "M. Rojas"],
  "AUS": ["M. Duke", "C. Goodwin", "J. Maclaren", "M. Boyle", "Jackson Irvine"],
  "TUR": ["C. Under", "K. Aktürkoğlu", "B. Yılmaz", "H. Calhanoğlu", "C. Tosun"],
  "GER": ["J. Musiala", "F. Wirtz", "K. Havertz", "N. Füllkrug", "L. Sané", "S. Gnabry"],
  "CUW": ["J. Bacuna", "R. Janga", "K. Felida", "G. Kastaneer"],
  "CIV": ["S. Haller", "J. Bamba", "K. Konaté", "I. Sangaré", "S. Adingra"],
  "ECU": ["Enner Valencia", "J. Caicedo", "K. Rodríguez", "Á. Mena", "J. Sornoza"],
  "NED": ["M. Depay", "C. Gakpo", "D. Malen", "X. Simons", "W. Weghorst"],
  "JPN": ["K. Mitoma", "T. Kubo", "T. Minamino", "R. Doan", "K. Furuhashi"],
  "SWE": ["A. Isak", "V. Gyökeres", "D. Kulusevski", "E. Forsberg", "J. Larsson"],
  "TUN": ["Y. Msakni", "N. Sliti", "H. Jelassi", "A. Layouni"],
  "BEL": ["R. Lukaku", "K. De Bruyne", "J. Doku", "L. Trossard", "L. Openda"],
  "EGY": ["M. Salah", "M. Mostafa", "Trezeguet", "M. Marmoush", "Zizo"],
  "IRN": ["M. Taremi", "S. Azmoun", "A. Jahanbakhsh", "S. Ghoddos", "M. Mohebi"],
  "NZL": ["Chris Wood", "Ben Waine", "E. Just", "M. Garbett"],
  "ESP": ["Á. Morata", "Dani Olmo", "Nico Williams", "Lamine Yamal", "Gavi", "Pedri"],
  "CPV": ["Ryan Mendes", "Garry Rodrigues", "Bebé", "Jovane Cabral"],
  "KSA": ["Salem Al-Dawsari", "Firas Al-Buraikan", "Saleh Al-Shehri", "Abdulrahman Ghareeb"],
  "URU": ["D. Núñez", "L. Suárez", "F. Valverde", "G. de Arrascaeta", "F. Pellistri"],
  "FRA": ["K. Mbappé", "A. Griezmann", "O. Dembélé", "K. Coman", "M. Thuram"],
  "SEN": ["Sadio Mané", "N. Jackson", "I. Sarr", "H. Diallo", "P. Gueye"],
  "IRQ": ["Ayman Hussein", "Mohanad Ali", "Ali Al-Hamadi", "Ibrahim Bayesh"],
  "NOR": ["E. Haaland", "M. Ødegaard", "A. Sørloth", "J. Strand Larsen", "O. Solbakken"],
  "ARG": ["L. Messi", "Á. Di María", "Lautaro Martínez", "J. Álvarez", "E. Fernández", "A. Mac Allister"],
  "ALG": ["R. Mahrez", "Islam Slimani", "Amine Gouiri", "Baghdad Bounedjah", "F. Chaïbi"],
  "AUT": ["M. Sabitzer", "M. Arnautović", "C. Baumgartner", "Michael Gregoritsch", "K. Laimer"],
  "JOR": ["Musa Al-Taamari", "Yazan Al-Naimat", "Ali Olwan", "Hamza Al-Dardour"],
  "POR": ["C. Ronaldo", "B. Fernandes", "Bernardo Silva", "Rafael Leão", "João Félix", "Gonçalo Ramos"],
  "COD": ["Yoane Wissa", "C. Bakambu", "Theo Bongonda", "Meschack Elia"],
  "UZB": ["E. Shomurodov", "O. Urunov", "J. Yakhshiboev", "A. Fayzullaev"],
  "COL": ["Luis Díaz", "James Rodríguez", "Rafael Borré", "J. Arias", "J. Durán"],
  "ENG": ["Harry Kane", "J. Bellingham", "Bukayo Saka", "Phil Foden", "Cole Palmer", "Ollie Watkins"],
  "CRO": ["L. Modrić", "A. Kramarić", "Ivan Perišić", "M. Pašalić", "L. Majer"],
  "GHA": ["Iñaki Williams", "Mohammed Kudus", "Jordan Ayew", "Antoine Semenyo"],
  "PAN": ["Ismael Díaz", "J. Fajardo", "Cecilio Waterman", "Yoel Bárcenas"]
};

// Generates simulated scorers consistently based on seed
function generateMockGoalsDeterministic(teamId, numGoals, seedValue) {
  const goals = [];
  const players = FAMOUS_PLAYERS[teamId] || ["Jugador A", "Jugador B", "Jugador C", "Jugador D"];
  
  for (let i = 0; i < numGoals; i++) {
    const seed = Math.sin(seedValue + i) * 10000;
    const rand = seed - Math.floor(seed);
    const min = Math.floor(rand * 90) + 1;
    const playerIdx = Math.floor((rand * 100) % players.length);
    goals.push({
      name: players[playerIdx],
      min: min
    });
  }
  return goals;
}

// Parses and normalizes scorer list in case of multiple schemas
function getMatchScorers(m) {
  let team1Scorers = [];
  let team2Scorers = [];

  let t1Id = m.team1;
  let t2Id = m.team2;

  // Resolve knockout team ids if missing on match object
  if (!t1Id || !t2Id) {
    const { t1, t2 } = resolveMatchTeams(m.id, groupStandings, thirdsAssignment);
    if (t1) t1Id = t1.id;
    if (t2) t2Id = t2.id;
  }

  // Schema 1: goals1 / goals2 or goleadores1 / goleadores2
  if (m.goals1 && Array.isArray(m.goals1)) {
    team1Scorers = m.goals1.map(g => ({ name: g.name || g.nombre || g.player, min: g.min || g.minuto || g.minute }));
  } else if (m.goleadores1 && Array.isArray(m.goleadores1)) {
    team1Scorers = m.goleadores1.map(g => ({ name: g.name || g.nombre || g.player, min: g.min || g.minuto || g.minute }));
  }
  
  if (m.goals2 && Array.isArray(m.goals2)) {
    team2Scorers = m.goals2.map(g => ({ name: g.name || g.nombre || g.player, min: g.min || g.minuto || g.minute }));
  } else if (m.goleadores2 && Array.isArray(m.goleadores2)) {
    team2Scorers = m.goleadores2.map(g => ({ name: g.name || g.nombre || g.player, min: g.min || g.minuto || g.minute }));
  }

  // Schema 2: Single goals / goleadores list
  const singleList = m.goals || m.goleadores;
  if (singleList && Array.isArray(singleList) && team1Scorers.length === 0 && team2Scorers.length === 0) {
    singleList.forEach(g => {
      const name = g.name || g.nombre || g.player;
      const min = g.min || g.minuto || g.minute;
      const teamId = g.team || g.equipo;
      const isTeam1 = g.team1 || g.isHome || (teamId && teamId === t1Id);
      const isTeam2 = g.team2 || g.isAway || (teamId && teamId === t2Id);
      
      if (isTeam1) {
        team1Scorers.push({ name, min });
      } else if (isTeam2) {
        team2Scorers.push({ name, min });
      } else {
        if (teamId === t1Id) {
          team1Scorers.push({ name, min });
        } else if (teamId === t2Id) {
          team2Scorers.push({ name, min });
        } else {
          team1Scorers.push({ name, min });
        }
      }
    });
  }

  // Fallback: Generate mock scorers if scores exist but no list was provided
  if (m.g1 > 0 && team1Scorers.length === 0 && t1Id) {
    team1Scorers = generateMockGoalsDeterministic(t1Id, m.g1, m.id * 3);
  }
  if (m.g2 > 0 && team2Scorers.length === 0 && t2Id) {
    team2Scorers = generateMockGoalsDeterministic(t2Id, m.g2, m.id * 7);
  }

  // Sort chronologically
  team1Scorers.sort((a, b) => parseInt(a.min) - parseInt(b.min));
  team2Scorers.sort((a, b) => parseInt(a.min) - parseInt(b.min));

  return { team1Scorers, team2Scorers };
}

function findMatchById(matchId) {
  let match = WORLD_CUP_DATA.groupMatches.find(m => m.id === matchId);
  if (match) return { match, isKnockout: false };
  
  for (const [stage, matches] of Object.entries(WORLD_CUP_DATA.knockoutMatches)) {
    match = matches.find(m => m.id === matchId);
    if (match) return { match, isKnockout: true, stage };
  }
  return { match: null };
}

function formatTimeElapsed(val) {
  if (!val) return 'En Vivo';
  const valLower = val.toLowerCase().trim();
  if (valLower === 'ht' || valLower === 'half-time' || valLower === 'halftime') return 'Descanso';
  if (valLower === 'ft' || valLower === 'full-time' || valLower === 'finished') return 'Finalizado';
  if (/^\d+$/.test(val)) return `${val}'`;
  return val;
}

function isMatchLive(m) {
  if (m && m.isLive !== undefined) {
    return m.isLive;
  }
  const matchDate = getMatchDate(m);
  if (!matchDate) return false;
  const nowLocal = getLocalCurrentDate();
  const timeDiffMs = nowLocal - matchDate;
  return m.g1 !== null && m.g2 !== null && timeDiffMs >= 0 && timeDiffMs <= 2.5 * 60 * 60 * 1000;
}

function showMatchDetails(matchId) {
  const { match: m, isKnockout, stage } = findMatchById(matchId);
  if (!m) return;

  const modal = document.getElementById('match-modal');
  const header = document.getElementById('modal-match-header');
  const scoreSection = document.getElementById('modal-match-score-section');
  const scorersSection = document.getElementById('modal-match-scorers');
  const footer = document.getElementById('modal-match-footer');

  if (!modal || !header || !scoreSection || !scorersSection || !footer) return;

  let t1Name = '', t2Name = '', t1Flag = '', t2Flag = '', t1Id = '', t2Id = '';

  if (!isKnockout) {
    const t1 = WORLD_CUP_DATA.teams[m.team1];
    const t2 = WORLD_CUP_DATA.teams[m.team2];
    t1Name = t1 ? t1.name : m.team1;
    t1Flag = t1 ? t1.flag : '';
    t1Id = m.team1;
    t2Name = t2 ? t2.name : m.team2;
    t2Flag = t2 ? t2.flag : '';
    t2Id = m.team2;
  } else {
    const { t1, t2 } = resolveMatchTeams(m.id, groupStandings, thirdsAssignment);
    t1Name = t1 ? t1.name : (m.team1Placeholder || 'Por definir');
    t1Flag = t1 ? t1.flag : '';
    t1Id = t1 ? t1.id : '';
    t2Name = t2 ? t2.name : (m.team2Placeholder || 'Por definir');
    t2Flag = t2 ? t2.flag : '';
    t2Id = t2 ? t2.id : '';
  }

  const t1FlagHTML = t1Flag 
    ? `<img src="https://flagcdn.com/w80/${t1Flag}.png" alt="${t1Name}">`
    : `<div class="match-flag-placeholder" style="width: 55px; height: 55px; font-size: 0.9rem;">TBD</div>`;
  const t2FlagHTML = t2Flag 
    ? `<img src="https://flagcdn.com/w80/${t2Flag}.png" alt="${t2Name}">`
    : `<div class="match-flag-placeholder" style="width: 55px; height: 55px; font-size: 0.9rem;">TBD</div>`;

  const isLive = isMatchLive(m);
  const stageLabel = isKnockout ? (m.label || stage) : `Grupo ${m.group}`;

  let liveBadgeHTML = '';
  if (isLive) {
    liveBadgeHTML = `<span class="upcoming-live-badge"><span class="live-dot"></span> ${formatTimeElapsed(m.timeElapsed)}</span>`;
  }

  header.innerHTML = `
    <span class="upcoming-stage-badge">${stageLabel}</span>
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      ${liveBadgeHTML}
      <span>${isLive ? '' : `${m.date} - `}${m.time}</span>
    </div>
  `;

  const scoreText = m.g1 !== null ? `${m.g1} : ${m.g2}` : '- : -';
  const scoreClass = isLive ? 'modal-match-score-numbers live-score' : 'modal-match-score-numbers';
  
  let penaltyDetailsHTML = '';
  if (isKnockout && m.g1 !== null && m.g1 === m.g2 && m.penaltyWinnerId) {
    const pWinner = WORLD_CUP_DATA.teams[m.penaltyWinnerId];
    penaltyDetailsHTML = `<div style="font-size: 0.75rem; color: var(--accent-gold); font-weight: 700; margin-top: 0.25rem;">(Ganador Pen.: ${pWinner ? pWinner.name : m.penaltyWinnerId})</div>`;
  }

  scoreSection.innerHTML = `
    <div class="modal-match-team">
      ${t1FlagHTML}
      <span class="modal-match-team-name">${t1Name}</span>
      <span class="modal-match-team-id">${t1Id}</span>
    </div>
    
    <div class="modal-match-score-display">
      <span class="${scoreClass}">${scoreText}</span>
      ${penaltyDetailsHTML}
    </div>
    
    <div class="modal-match-team">
      ${t2FlagHTML}
      <span class="modal-match-team-name">${t2Name}</span>
      <span class="modal-match-team-id">${t2Id}</span>
    </div>
  `;

  const { team1Scorers, team2Scorers } = getMatchScorers(m);
  
  if (team1Scorers.length === 0 && team2Scorers.length === 0) {
    scorersSection.innerHTML = `<div class="modal-no-goals">No se registraron goles en este encuentro</div>`;
  } else {
    let homeColHTML = `<div class="modal-match-scorers-column home-scorers">`;
    if (team1Scorers.length === 0) {
      homeColHTML += `<div style="height: 100%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: var(--text-muted); font-style: italic;">Sin goles</div>`;
    } else {
      team1Scorers.forEach(s => {
        homeColHTML += `
          <div class="modal-scorer-item">
            <span class="modal-scorer-ball">⚽</span>
            <span class="modal-scorer-name" title="${s.name}">${s.name}</span>
            <span class="modal-scorer-min">${s.min}'</span>
          </div>
        `;
      });
    }
    homeColHTML += `</div>`;

    let awayColHTML = `<div class="modal-match-scorers-column away-scorers">`;
    if (team2Scorers.length === 0) {
      awayColHTML += `<div style="height: 100%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: var(--text-muted); font-style: italic;">Sin goles</div>`;
    } else {
      team2Scorers.forEach(s => {
        awayColHTML += `
          <div class="modal-scorer-item">
            <span class="modal-scorer-ball">⚽</span>
            <span class="modal-scorer-name" title="${s.name}">${s.name}</span>
            <span class="modal-scorer-min">${s.min}'</span>
          </div>
        `;
      });
    }
    awayColHTML += `</div>`;

    scorersSection.innerHTML = homeColHTML + awayColHTML;
  }

  footer.innerHTML = `
    <span class="modal-match-stadium">📍 ${m.stadium}</span>
    <span>Sede: ${m.city}</span>
  `;

  modal.classList.add('open');
}

function closeMatchModal() {
  const modal = document.getElementById('match-modal');
  if (modal) modal.classList.remove('open');
}

// Country names to 3-letter code mapper (Spanish & English variations)
const TEAM_NAME_TO_ID = {
  // Grupo A
  "mexico": "MEX", "méxico": "MEX",
  "south africa": "RSA", "sudafrica": "RSA", "sudáfrica": "RSA",
  "south korea": "KOR", "corea del sur": "KOR", "korea republic": "KOR", "republic of korea": "KOR",
  "czech republic": "CZE", "república checa": "CZE", "republica checa": "CZE", "czechia": "CZE",
  
  // Grupo B
  "canada": "CAN", "canadá": "CAN",
  "bosnia": "BIH", "bosnia and herzegovina": "BIH", "bosnia y herzegovina": "BIH",
  "qatar": "QAT", "catar": "QAT",
  "switzerland": "SUI", "suiza": "SUI",
  
  // Grupo C
  "brazil": "BRA", "brasil": "BRA",
  "morocco": "MAR", "marruecos": "MAR",
  "haiti": "HAI", "haití": "HAI",
  "scotland": "SCO", "escocia": "SCO",
  
  // Grupo D
  "united states": "USA", "estados unidos": "USA", "usa": "USA", "us": "USA",
  "paraguay": "PAR",
  "australia": "AUS",
  "turkey": "TUR", "turquia": "TUR", "turquía": "TUR", "türkiye": "TUR",
  
  // Grupo E
  "germany": "GER", "alemania": "GER",
  "curacao": "CUW", "curazao": "CUW", "curaçao": "CUW",
  "ivory coast": "CIV", "costa de marfil": "CIV", "cote d'ivoire": "CIV", "côte d'ivoire": "CIV",
  "ecuador": "ECU",
  
  // Grupo F
  "netherlands": "NED", "paises bajos": "NED", "países bajos": "NED", "holland": "NED",
  "japan": "JPN", "japon": "JPN", "japón": "JPN",
  "sweden": "SWE", "suecia": "SWE",
  "tunisia": "TUN", "tunez": "TUN", "túnez": "TUN",
  
  // Grupo G
  "belgium": "BEL", "belgica": "BEL", "bélgica": "BEL",
  "egypt": "EGY", "egipto": "EGY",
  "iran": "IRN", "irán": "IRN", "ri de irán": "IRN", "ri de iran": "IRN",
  "new zealand": "NZL", "nueva zelanda": "NZL",
  
  // Grupo H
  "spain": "ESP", "españa": "ESP",
  "cape verde": "CPV", "cabo verde": "CPV",
  "saudi arabia": "KSA", "arabia saudita": "KSA", "arabia saudí": "KSA", "arabia saudi": "KSA",
  "uruguay": "URU",
  
  // Grupo I
  "france": "FRA", "francia": "FRA",
  "senegal": "SEN",
  "iraq": "IRQ", "irak": "IRQ",
  "norway": "NOR", "noruega": "NOR",
  
  // Grupo J
  "argentina": "ARG",
  "algeria": "ALG", "argelia": "ALG",
  "austria": "AUT",
  "jordan": "JOR", "jordania": "JOR",
  
  // Grupo K
  "portugal": "POR",
  "dr congo": "COD", "rd congo": "COD", "congo dr": "COD", "democratic republic of congo": "COD", "democratic republic of the congo": "COD",
  "uzbekistan": "UZB", "uzbekistán": "UZB",
  "colombia": "COL",
  
  // Grupo L
  "england": "ENG", "inglaterra": "ENG",
  "croatia": "CRO", "croacia": "CRO",
  "ghana": "GHA",
  "panama": "PAN", "panamá": "PAN"
};

function getTeamIdByName(name) {
  if (!name) return null;
  return TEAM_NAME_TO_ID[name.toLowerCase().trim()] || null;
}

function clearScores() {
  WORLD_CUP_DATA.groupMatches.forEach(m => {
    m.g1 = null;
    m.g2 = null;
  });
  for (const stage of Object.keys(WORLD_CUP_DATA.knockoutMatches)) {
    WORLD_CUP_DATA.knockoutMatches[stage].forEach(m => {
      m.g1 = null;
      m.g2 = null;
      m.penaltyWinnerId = null;
    });
  }
}

const DEFAULT_API_URL = 'https://worldcup26.ir/get/games';

// Fetch and load live scores silently in the background
async function initApiLoading(isAutoRefresh = false) {
  let url = localStorage.getItem('worldcup_api_url');
  if (url === 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json' || url === 'live_scores_sample.json') {
    localStorage.removeItem('worldcup_api_url');
    url = null;
  }
  if (!url) {
    url = DEFAULT_API_URL;
  }

  const cacheKey = `cached_scores_${url}`;

  if (!isAutoRefresh) {
    // Clear the simulated scores immediately
    clearScores();

    // 1. Try to load from localStorage cache first (Stale-While-Revalidate)
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const data = JSON.parse(cachedData);
        applyLiveScores(data);
      } catch (e) {
        console.warn('Failed to parse cached scores', e);
      }
    }

    // Render immediately with cached (or cleared) data so the page displays instantly
    renderAll();
  }

  // 2. Fetch fresh data in the background with a 5-second timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Save to cache
    localStorage.setItem(cacheKey, JSON.stringify(data));
    
    // Apply and re-render
    applyLiveScores(data);
    renderAll();
  } catch (error) {
    console.warn('No se pudieron cargar los resultados en vivo de la red. Permaneciendo con datos en caché.', error);
  }
}

// Dual format parser
function applyLiveScores(data) {
  if (!data) return false;

  let parsedAny = false;

  // Format C: worldcup26.ir matches list: { games: [...] }
  if (data.games && Array.isArray(data.games)) {
    // Reset scores first so we don't mix old simulation with the new API data
    WORLD_CUP_DATA.groupMatches.forEach(m => { 
      m.g1 = null; m.g2 = null; m.goals1 = null; m.goals2 = null; m.goals = null; 
      m.isLive = false; m.isFinished = false; m.timeElapsed = null;
    });
    for (const stage of Object.keys(WORLD_CUP_DATA.knockoutMatches)) {
      WORLD_CUP_DATA.knockoutMatches[stage].forEach(m => { 
        m.g1 = null; m.g2 = null; m.penaltyWinnerId = null; m.goals1 = null; m.goals2 = null; m.goals = null; 
        m.isLive = false; m.isFinished = false; m.timeElapsed = null;
      });
    }

    // Helper to parse scorers string to { name, min } array
    const parseWorldCup26Scorers = (scorersStr) => {
      if (!scorersStr || scorersStr === "null" || scorersStr === "{}") return null;
      
      // Clean up string to be a valid JSON array of strings
      let cleanStr = scorersStr.replace(/[“”]/g, '"');
      cleanStr = cleanStr.replace(/\\"/g, '"');
      cleanStr = cleanStr.trim();
      
      // Convert curly braces to square brackets if needed
      if (cleanStr.startsWith('{')) {
        cleanStr = '[' + cleanStr.substring(1);
      }
      if (cleanStr.endsWith('}')) {
        cleanStr = cleanStr.substring(0, cleanStr.length - 1) + ']';
      }

      const list = [];
      try {
        const parsed = JSON.parse(cleanStr);
        if (Array.isArray(parsed)) {
          parsed.forEach(text => {
            if (typeof text !== 'string') return;
            const digitMatch = text.match(/\d+/);
            if (digitMatch) {
              const firstDigitIndex = digitMatch.index;
              const name = text.substring(0, firstDigitIndex).trim();
              let min = text.substring(firstDigitIndex).trim();
              // Remove single quotes to prevent duplicate quotes (e.g. 9'' instead of 9')
              min = min.replace(/'/g, '');
              if (name) {
                list.push({ name, min });
              }
            }
          });
        }
      } catch (e) {
        console.warn('Error parsing scorers JSON', e, scorersStr);
        
        // Fallback to regex-based parser if JSON.parse fails
        const regex = /["“'']([^"“”'']+?)["”'']/g;
        let match;
        while ((match = regex.exec(cleanStr)) !== null) {
          const text = match[1].trim();
          if (!text) continue;
          const digitMatch = text.match(/\d+/);
          if (digitMatch) {
            const firstDigitIndex = digitMatch.index;
            const name = text.substring(0, firstDigitIndex).trim();
            let min = text.substring(firstDigitIndex).trim().replace(/'/g, '');
            list.push({ name, min });
          }
        }
      }
      return list.length > 0 ? list : null;
    };

    // 1. Process group matches
    data.games.forEach(g => {
      const isGroupType = g.type === "group" || (g.id && parseInt(g.id, 10) <= 72);
      if (!isGroupType) return;
      if (!g.home_team_name_en || !g.away_team_name_en) return;

      const t1Id = getTeamIdByName(g.home_team_name_en);
      const t2Id = getTeamIdByName(g.away_team_name_en);

      if (t1Id && t2Id) {
        const groupMatch = WORLD_CUP_DATA.groupMatches.find(gm => 
          (gm.team1 === t1Id && gm.team2 === t2Id) || (gm.team1 === t2Id && gm.team2 === t1Id)
        );
        if (groupMatch) {
          const elapsedLower = g.time_elapsed ? g.time_elapsed.toLowerCase().trim() : "";
          const isFinished = g.finished === "TRUE" || elapsedLower === "finished";
          const isLive = elapsedLower && elapsedLower !== "notstarted" && elapsedLower !== "finished";

          if (isFinished || isLive) {
            const isT1Home = groupMatch.team1 === t1Id;
            const homeScore = g.home_score !== "null" && g.home_score !== null ? parseInt(g.home_score, 10) : 0;
            const awayScore = g.away_score !== "null" && g.away_score !== null ? parseInt(g.away_score, 10) : 0;

            groupMatch.g1 = isT1Home ? homeScore : awayScore;
            groupMatch.g2 = isT1Home ? awayScore : homeScore;
            groupMatch.goals1 = isT1Home ? parseWorldCup26Scorers(g.home_scorers) : parseWorldCup26Scorers(g.away_scorers);
            groupMatch.goals2 = isT1Home ? parseWorldCup26Scorers(g.away_scorers) : parseWorldCup26Scorers(g.home_scorers);
            groupMatch.isLive = isLive;
            groupMatch.isFinished = isFinished;
            groupMatch.timeElapsed = g.time_elapsed;
            parsedAny = true;
          }
        }
      }
    });

    // Re-calculate standings up to group stage so knockout teams can be resolved sequentially
    groupStandings = getAllStandings();
    const bestThirds = getBestThirdPlaces().slice(0, 8);
    thirdsAssignment = assignThirdPlaces(bestThirds);
    resolvedTeams = {}; // clear cache

    // 2. Process knockout matches sequentially: R32, R16, QF, SF, 3RD, F
    const stages = ['R32', 'R16', 'QF', 'SF', '3RD', 'F'];
    stages.forEach(stage => {
      const localMatches = WORLD_CUP_DATA.knockoutMatches[stage] || [];
      localMatches.forEach(lm => {
        const { t1, t2 } = resolveMatchTeams(lm.id, groupStandings, thirdsAssignment);
        if (!t1 || !t2) return; // not resolved yet

        // Look for matching team pairing in fetched games
        const g = data.games.find(game => {
          if (game.type === "group") return false;
          if (!game.home_team_name_en || !game.away_team_name_en) return false;
          const apiT1Id = getTeamIdByName(game.home_team_name_en);
          const apiT2Id = getTeamIdByName(game.away_team_name_en);
          return (apiT1Id === t1.id && apiT2Id === t2.id) || (apiT1Id === t2.id && apiT2Id === t1.id);
        });

        if (!g) return;

        const elapsedLower = g.time_elapsed ? g.time_elapsed.toLowerCase().trim() : "";
        const isFinished = g.finished === "TRUE" || elapsedLower === "finished";
        const isLive = elapsedLower && elapsedLower !== "notstarted" && elapsedLower !== "finished";

        if (!isFinished && !isLive) return;

        const apiT1Id = getTeamIdByName(g.home_team_name_en);
        const isT1Home = apiT1Id === t1.id;

        const homeScore = g.home_score !== "null" && g.home_score !== null ? parseInt(g.home_score, 10) : 0;
        const awayScore = g.away_score !== "null" && g.away_score !== null ? parseInt(g.away_score, 10) : 0;

        lm.g1 = isT1Home ? homeScore : awayScore;
        lm.g2 = isT1Home ? awayScore : homeScore;
        lm.goals1 = isT1Home ? parseWorldCup26Scorers(g.home_scorers) : parseWorldCup26Scorers(g.away_scorers);
        lm.goals2 = isT1Home ? parseWorldCup26Scorers(g.away_scorers) : parseWorldCup26Scorers(g.home_scorers);
        lm.isLive = isLive;
        lm.isFinished = isFinished;
        lm.timeElapsed = g.time_elapsed;

        // If it's a draw and finished, we need a penalty winner
        if (lm.g1 === lm.g2 && isFinished) {
          // Find if t1 or t2 is scheduled in any other match of a higher round
          const t1Qualified = data.games.some(game => {
            const gameId = parseInt(game.id, 10);
            if (gameId <= lm.id) return false;
            const apiHomeId = getTeamIdByName(game.home_team_name_en);
            const apiAwayId = getTeamIdByName(game.away_team_name_en);
            return apiHomeId === t1.id || apiAwayId === t1.id;
          });
          const t2Qualified = data.games.some(game => {
            const gameId = parseInt(game.id, 10);
            if (gameId <= lm.id) return false;
            const apiHomeId = getTeamIdByName(game.home_team_name_en);
            const apiAwayId = getTeamIdByName(game.away_team_name_en);
            return apiHomeId === t2.id || apiAwayId === t2.id;
          });
          if (t1Qualified) {
            lm.penaltyWinnerId = t1.id;
          } else if (t2Qualified) {
            lm.penaltyWinnerId = t2.id;
          } else {
            lm.penaltyWinnerId = t1.id; // Fallback
          }
        }

        parsedAny = true;
      });

      // Clear cache to allow resolving next round matches using these new scores
      resolvedTeams = {};
    });

    return parsedAny;
  }

  // Format A: { groupMatches: [...], knockoutMatches: [...] }
  if (data.groupMatches && Array.isArray(data.groupMatches)) {
    data.groupMatches.forEach(m => {
      const match = WORLD_CUP_DATA.groupMatches.find(gm => gm.id === m.id);
      if (match) {
        match.g1 = m.g1;
        match.g2 = m.g2;
        match.goals1 = m.goals1 || m.goleadores1 || null;
        match.goals2 = m.goals2 || m.goleadores2 || null;
        match.goals = m.goals || m.goleadores || null;
        parsedAny = true;
      }
    });

    if (data.knockoutMatches && Array.isArray(data.knockoutMatches)) {
      data.knockoutMatches.forEach(m => {
        let match = null;
        for (const matches of Object.values(WORLD_CUP_DATA.knockoutMatches)) {
          match = matches.find(km => km.id === m.id);
          if (match) break;
        }
        if (match) {
          match.g1 = m.g1;
          match.g2 = m.g2;
          if (m.penaltyWinnerId !== undefined) {
            match.penaltyWinnerId = m.penaltyWinnerId;
          }
          match.goals1 = m.goals1 || m.goleadores1 || null;
          match.goals2 = m.goals2 || m.goleadores2 || null;
          match.goals = m.goals || m.goleadores || null;
          parsedAny = true;
        }
      });
    }
    return parsedAny;
  }

  // Format B: openfootball-style matches list: { matches: [...] }
  if (data.matches && Array.isArray(data.matches)) {
    // Reset scores first so we don't mix old simulation with openfootball data
    WORLD_CUP_DATA.groupMatches.forEach(m => { m.g1 = null; m.g2 = null; m.goals1 = null; m.goals2 = null; m.goals = null; });
    for (const stage of Object.keys(WORLD_CUP_DATA.knockoutMatches)) {
      WORLD_CUP_DATA.knockoutMatches[stage].forEach(m => { m.g1 = null; m.g2 = null; m.penaltyWinnerId = null; m.goals1 = null; m.goals2 = null; m.goals = null; });
    }

    // Process group matches
    data.matches.forEach(m => {
      if (!m.team1 || !m.team2) return;
      const t1Id = getTeamIdByName(m.team1);
      const t2Id = getTeamIdByName(m.team2);

      if (t1Id && t2Id) {
        const groupMatch = WORLD_CUP_DATA.groupMatches.find(gm => 
          (gm.team1 === t1Id && gm.team2 === t2Id) || (gm.team1 === t2Id && gm.team2 === t1Id)
        );
        if (groupMatch) {
          if (m.score && m.score.ft) {
            const isT1Home = groupMatch.team1 === t1Id;
            groupMatch.g1 = isT1Home ? m.score.ft[0] : m.score.ft[1];
            groupMatch.g2 = isT1Home ? m.score.ft[1] : m.score.ft[0];
            groupMatch.goals = m.goals || m.goleadores || null;
            parsedAny = true;
          }
        }
      }
    });

    // Re-calculate standings up to group stage so knockout teams can be resolved sequentially
    groupStandings = getAllStandings();
    const bestThirds = getBestThirdPlaces().slice(0, 8);
    thirdsAssignment = assignThirdPlaces(bestThirds);
    resolvedTeams = {}; // clear cache

    // Process knockout stages sequentially: R32, R16, QF, SF, 3RD, F
    const stages = ['R32', 'R16', 'QF', 'SF', '3RD', 'F'];
    
    stages.forEach(stage => {
      const localMatches = WORLD_CUP_DATA.knockoutMatches[stage] || [];
      
      localMatches.forEach(lm => {
        const { t1, t2 } = resolveMatchTeams(lm.id, groupStandings, thirdsAssignment);
        if (!t1 || !t2) return; // not resolved yet

        // Look for matching team pairing in fetched data
        const fetchedMatch = data.matches.find(m => {
          if (!m.team1 || !m.team2) return false;
          const t1Id = getTeamIdByName(m.team1);
          const t2Id = getTeamIdByName(m.team2);
          return (t1Id === t1.id && t2Id === t2.id) || (t1Id === t2.id && t2Id === t1.id);
        });

        if (fetchedMatch && fetchedMatch.score && fetchedMatch.score.ft) {
          const t1IdFetched = getTeamIdByName(fetchedMatch.team1);
          const isT1Home = t1IdFetched === t1.id;
          
          lm.g1 = isT1Home ? fetchedMatch.score.ft[0] : fetchedMatch.score.ft[1];
          lm.g2 = isT1Home ? fetchedMatch.score.ft[1] : fetchedMatch.score.ft[0];
          
          if (fetchedMatch.score.p) {
            const p1 = fetchedMatch.score.p[0];
            const p2 = fetchedMatch.score.p[1];
            if (p1 !== undefined && p2 !== undefined) {
              const pWinnerIdFetched = p1 > p2 ? t1IdFetched : getTeamIdByName(fetchedMatch.team2);
              lm.penaltyWinnerId = pWinnerIdFetched;
            }
          }
          lm.goals = fetchedMatch.goals || fetchedMatch.goleadores || null;
          parsedAny = true;
        }
      });

      // Clear cache to allow resolving next round matches using these new scores
      resolvedTeams = {};
    });

    return parsedAny;
  }

  return false;
}

// Simple floating notification (toast) for feedback
function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: rgba(239, 68, 68, 0.95);
    color: white;
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: auto;
    border: 1px solid rgba(255, 255, 255, 0.1);
  `;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}
