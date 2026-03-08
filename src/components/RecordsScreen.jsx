import { useState } from 'react';
import styles from './RecordsScreen.module.css';

const resultStyle = {
  Win: styles.resultWin,
  Loss: styles.resultLoss,
  Draw: styles.resultDraw,
};

function winPct(w, l, d) {
  const total = w + l + d;
  if (total === 0) return '—';
  return `${Math.round((w / total) * 100)}%`;
}

function getWinStreak(playerGames, playerName) {
  const sorted = playerGames.slice().sort((a, b) => b.id - a.id);
  let streak = 0;
  for (const game of sorted) {
    const isP1 = game.player1.name === playerName;
    const result =
      game.winner === 'draw' ? 'draw' :
      (game.winner === 'player1') === isP1 ? 'win' : 'loss';
    if (result === 'win') streak++;
    else break;
  }
  return streak;
}

function getTeamStats(playerGames, playerName) {
  const map = {};
  for (const game of playerGames) {
    const isP1 = game.player1.name === playerName;
    const me = isP1 ? game.player1 : game.player2;
    const result =
      game.winner === 'draw' ? 'draw' :
      (game.winner === 'player1') === isP1 ? 'win' : 'loss';

    const key = me.spearhead || me.faction;
    if (!map[key]) {
      map[key] = { team: key, faction: me.spearhead ? me.faction : null, wins: 0, losses: 0, draws: 0 };
    }
    map[key][result === 'win' ? 'wins' : result === 'loss' ? 'losses' : 'draws'] += 1;
  }

  const arr = Object.values(map).sort((a, b) => {
    const pctA = a.wins / (a.wins + a.losses + a.draws);
    const pctB = b.wins / (b.wins + b.losses + b.draws);
    if (pctB !== pctA) return pctB - pctA;
    return (b.wins + b.losses + b.draws) - (a.wins + a.losses + a.draws);
  });

  const maxGames = Math.max(...arr.map((t) => t.wins + t.losses + t.draws));
  return arr.map((t) => ({
    ...t,
    isMostPlayed: (t.wins + t.losses + t.draws) === maxGames && maxGames > 0,
  }));
}

// Handle both old string format and new { winner, firstTurn } object format
function getPriorityWinner(p) {
  if (!p) return null;
  if (typeof p === 'string') return p;
  return p.winner ?? null;
}

function getFirstTurnPlayer(p) {
  if (!p) return null;
  if (typeof p === 'string') return p; // old format: priority winner = first turn
  return p.firstTurn ?? null;
}

function getPriorityStats(playerGames, playerName) {
  const priorityBuckets = {
    advantage:    { label: 'Priority majority', wins: 0, losses: 0, draws: 0 },
    disadvantage: { label: 'Priority minority', wins: 0, losses: 0, draws: 0 },
    tied:         { label: 'Priority tied',     wins: 0, losses: 0, draws: 0 },
  };
  const firstTurnBuckets = {
    advantage:    { label: '1st turn majority', wins: 0, losses: 0, draws: 0 },
    disadvantage: { label: '1st turn minority', wins: 0, losses: 0, draws: 0 },
    tied:         { label: '1st turn tied',     wins: 0, losses: 0, draws: 0 },
  };

  let gamesWithPriority = 0;
  let gamesWithFirstTurn = 0;

  for (const game of playerGames) {
    if (!game.priorities || game.priorities.length === 0) continue;

    const isP1 = game.player1.name === playerName;
    const myKey = isP1 ? 'player1' : 'player2';
    const oppKey = isP1 ? 'player2' : 'player1';
    const resultKey =
      game.winner === 'draw' ? 'draws' :
      (game.winner === 'player1') === isP1 ? 'wins' : 'losses';

    const myPrio = game.priorities.filter((p) => getPriorityWinner(p) === myKey).length;
    const oppPrio = game.priorities.filter((p) => getPriorityWinner(p) === oppKey).length;
    if (myPrio + oppPrio > 0) {
      gamesWithPriority++;
      if (myPrio > oppPrio) priorityBuckets.advantage[resultKey]++;
      else if (myPrio < oppPrio) priorityBuckets.disadvantage[resultKey]++;
      else priorityBuckets.tied[resultKey]++;
    }

    const hasFirstTurnData = game.priorities.some((p) => p && typeof p === 'object');
    if (hasFirstTurnData) {
      const myFT = game.priorities.filter((p) => getFirstTurnPlayer(p) === myKey).length;
      const oppFT = game.priorities.filter((p) => getFirstTurnPlayer(p) === oppKey).length;
      if (myFT + oppFT > 0) {
        gamesWithFirstTurn++;
        if (myFT > oppFT) firstTurnBuckets.advantage[resultKey]++;
        else if (myFT < oppFT) firstTurnBuckets.disadvantage[resultKey]++;
        else firstTurnBuckets.tied[resultKey]++;
      }
    }
  }

  if (gamesWithPriority === 0) return null;
  return {
    priority: Object.values(priorityBuckets).filter((b) => b.wins + b.losses + b.draws > 0),
    firstTurn: gamesWithFirstTurn > 0
      ? Object.values(firstTurnBuckets).filter((b) => b.wins + b.losses + b.draws > 0)
      : null,
  };
}

function getHeadToHead(playerGames, playerName) {
  const map = {};
  for (const game of playerGames) {
    const isP1 = game.player1.name === playerName;
    const opp = isP1 ? game.player2.name : game.player1.name;
    const result =
      game.winner === 'draw' ? 'draw' :
      (game.winner === 'player1') === isP1 ? 'win' : 'loss';
    if (!map[opp]) map[opp] = { wins: 0, losses: 0, draws: 0 };
    map[opp][result === 'win' ? 'wins' : result === 'loss' ? 'losses' : 'draws'] += 1;
  }
  return Object.entries(map)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => (b.wins + b.losses + b.draws) - (a.wins + a.losses + a.draws));
}

function TeamStatsSection({ playerGames, playerName }) {
  const teams = getTeamStats(playerGames, playerName);
  if (teams.length === 0) return null;

  return (
    <div className={styles.teamStatsSection}>
      <p className={styles.sectionHeading}>By Team</p>
      {teams.map((t) => (
        <div key={t.team} className={styles.teamStatRow}>
          <div className={styles.teamStatName}>
            <span className={styles.teamStatLabel}>{t.team}</span>
            {t.faction && <span className={styles.teamStatFaction}> · {t.faction}</span>}
          </div>
          {t.isMostPlayed && <span className={styles.mostPlayedTag}>Most Played</span>}
          <div className={`${styles.teamStatRecord} record-stats`}>
            <span className="stat win">{t.wins}W</span>
            <span className="stat loss">{t.losses}L</span>
            <span className="stat draw">{t.draws}D</span>
            <span className="stat pct">{winPct(t.wins, t.losses, t.draws)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatRows({ rows }) {
  return rows.map((row) => (
    <div key={row.label} className={styles.priorityStatRow}>
      <span className={styles.priorityStatLabel}>{row.label}</span>
      <div className={styles.priorityStatRecord}>
        <span className="stat win">{row.wins}W</span>
        <span className="stat loss">{row.losses}L</span>
        <span className="stat draw">{row.draws}D</span>
        <span className="stat pct">{winPct(row.wins, row.losses, row.draws)}</span>
      </div>
    </div>
  ));
}

function PriorityStatsSection({ playerGames, playerName }) {
  const stats = getPriorityStats(playerGames, playerName);
  if (!stats) return null;

  return (
    <div className={styles.priorityStatsSection}>
      <p className={styles.sectionHeading}>Priority Impact</p>
      <StatRows rows={stats.priority} />
      {stats.firstTurn && (
        <>
          <p className={`${styles.sectionHeading} ${styles.sectionHeadingSpaced}`}>First Turn Impact</p>
          <StatRows rows={stats.firstTurn} />
        </>
      )}
    </div>
  );
}

function HeadToHeadSection({ playerGames, playerName }) {
  const h2h = getHeadToHead(playerGames, playerName);
  if (h2h.length === 0) return null;

  return (
    <div className={styles.headToHeadSection}>
      <p className={styles.sectionHeading}>Head to Head</p>
      {h2h.map((entry) => (
        <div key={entry.name} className={styles.h2hRow}>
          <span className={styles.h2hName}>{entry.name}</span>
          <div className={styles.h2hRecord}>
            <span className="stat win">{entry.wins}W</span>
            <span className="stat loss">{entry.losses}L</span>
            <span className="stat draw">{entry.draws}D</span>
            <span className="stat pct">{winPct(entry.wins, entry.losses, entry.draws)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function GameHistoryItem({ game, playerName }) {
  const isP1 = game.player1.name === playerName;
  const me = isP1 ? game.player1 : game.player2;
  const opp = isP1 ? game.player2 : game.player1;
  const result =
    game.winner === 'draw' ? 'Draw' :
    (game.winner === 'player1') === isP1 ? 'Win' : 'Loss';

  const date = new Date(game.date).toLocaleDateString();

  return (
    <div className={styles.gameHistoryItem}>
      <div className={styles.historyRow}>
        <span className={styles.historyDate}>{date}</span>
        <span className={`${styles.historyResult} ${resultStyle[result]}`}>{result}</span>
      </div>
      <div className={styles.historyRow}>
        <span className={styles.historyFaction}>
          {me.spearhead || me.faction}
          {me.spearhead && <span className={styles.historySubfaction}> · {me.faction}</span>}
        </span>
        <span className={styles.historyScore}>{me.total} – {opp.total}</span>
        <span className={`${styles.historyFaction} ${styles.historyFactionRight}`}>
          {opp.spearhead || opp.faction}
          {opp.spearhead && <span className={styles.historySubfaction}> · {opp.faction}</span>}
        </span>
      </div>
      <div className={styles.historyOpponent}>vs {opp.name}</div>
    </div>
  );
}

function PlayerRecord({ playerName, record, games }) {
  const [expanded, setExpanded] = useState(false);

  const playerGames = games.filter(
    (g) => g.player1.name === playerName || g.player2.name === playerName
  );

  const streak = getWinStreak(playerGames, playerName);

  return (
    <div className={styles.playerRecordCard}>
      <button
        className={styles.playerRecordHeader}
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <span className={styles.recordPlayerName}>{playerName}</span>
        {streak >= 1 && <span className={styles.streakBadge}>🔥{streak}</span>}
        <div className={styles.recordStats}>
          <span className="stat win">{record.wins}W</span>
          <span className="stat loss">{record.losses}L</span>
          <span className="stat draw">{record.draws}D</span>
          <span className="stat pct">{winPct(record.wins, record.losses, record.draws)}</span>
        </div>
        <span className={styles.expandIcon}>{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className={styles.playerGamesList}>
          {playerGames.length === 0 ? (
            <p className={styles.noGames}>No games recorded.</p>
          ) : (
            <>
              <TeamStatsSection playerGames={playerGames} playerName={playerName} />
              <PriorityStatsSection playerGames={playerGames} playerName={playerName} />
              <HeadToHeadSection playerGames={playerGames} playerName={playerName} />
              <p className={styles.gameHistoryHeading}>Game History</p>
              {playerGames
                .slice()
                .sort((a, b) => b.id - a.id)
                .map((g) => (
                  <GameHistoryItem key={g.id} game={g} playerName={playerName} />
                ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Derive records map from a games array (for group view)
function deriveRecords(gamesList) {
  const map = {};
  for (const game of gamesList) {
    const { player1, player2, winner } = game;
    for (const [key, player] of [['player1', player1], ['player2', player2]]) {
      if (!map[player.name]) map[player.name] = { wins: 0, losses: 0, draws: 0 };
      if (winner === 'draw') map[player.name].draws += 1;
      else if (winner === key) map[player.name].wins += 1;
      else map[player.name].losses += 1;
    }
  }
  return map;
}

export default function RecordsScreen({ records, games, groupGames = [], activeGroup = null, onClearAll, onBack }) {
  const [search, setSearch] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [view, setView] = useState('local'); // 'local' | 'group'

  const isGroupView = view === 'group' && activeGroup;
  const displayGames = isGroupView ? groupGames : games;
  const displayRecords = isGroupView ? deriveRecords(groupGames) : records;

  const playerNames = Object.keys(displayRecords).filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`screen ${styles.recordsScreen}`}>
      <div className="screen-header">
        <button className="btn btn-ghost back-btn" onClick={onBack}>← Back</button>
        <h2>Records</h2>
      </div>

      {activeGroup && (
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${!isGroupView ? styles.toggleActive : ''}`}
            onClick={() => setView('local')}
          >
            My Games
          </button>
          <button
            className={`${styles.toggleBtn} ${isGroupView ? styles.toggleActive : ''}`}
            onClick={() => setView('group')}
          >
            Group: {activeGroup.name}
          </button>
        </div>
      )}

      <input
        className={`input ${styles.searchInput}`}
        type="search"
        placeholder="Search player..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {playerNames.length === 0 ? (
        <p className={styles.emptyRecords}>No records yet. Play a game!</p>
      ) : (
        <div className={styles.recordsList}>
          {playerNames.map((name) => (
            <PlayerRecord
              key={name}
              playerName={name}
              record={displayRecords[name]}
              games={displayGames}
            />
          ))}
        </div>
      )}

      {!isGroupView && (
        <div className={styles.recordsDangerZone}>
          {confirmClear ? (
            <div className={styles.confirmClear}>
              <p>Delete all records and game history?</p>
              <div className={styles.confirmActions}>
                <button className="btn btn-danger" onClick={() => { onClearAll(); setConfirmClear(false); }}>
                  Yes, clear all
                </button>
                <button className="btn btn-secondary" onClick={() => setConfirmClear(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button className="btn btn-danger btn-sm" onClick={() => setConfirmClear(true)}>
              Clear All Records
            </button>
          )}
        </div>
      )}
    </div>
  );
}
