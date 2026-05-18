import { useState } from 'react';
import { factions, alliances, spearheads, getAllianceForFaction, getFactionForTeam } from '../data/factions.js';
import { calcStandings } from '../utils/tournamentUtils.js';
import styles from './TournamentScreen.module.css';

// ── Faction picker (join flow) ───────────────────────────────────────────────

function FactionPicker({ onJoin, loading }) {
  const [selectedAlliance, setSelectedAlliance] = useState('');
  const [team, setTeam] = useState('');

  const allianceFactions = selectedAlliance ? factions[selectedAlliance] : [];

  function resolveTeam(teamValue) {
    if (!teamValue) return null;
    const faction = getFactionForTeam(teamValue) || teamValue;
    const spearhead = getFactionForTeam(teamValue) ? teamValue : '';
    const alliance = getAllianceForFaction(faction) || selectedAlliance;
    return { faction, spearhead, alliance };
  }

  function handleJoin() {
    const resolved = resolveTeam(team);
    if (!resolved) return;
    onJoin(resolved);
  }

  const resolved = resolveTeam(team);

  return (
    <div className={styles.factionPicker}>
      <p className={styles.sectionLabel}>Choose your faction to join</p>
      <select
        className="input"
        value={selectedAlliance}
        onChange={(e) => { setSelectedAlliance(e.target.value); setTeam(''); }}
      >
        <option value="">— Select Alliance —</option>
        {alliances.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
      {selectedAlliance && (
        <select className="input" value={team} onChange={(e) => setTeam(e.target.value)}>
          <option value="">— Select Team —</option>
          {allianceFactions.map((factionName) => {
            const teams = spearheads[factionName] || [];
            const options = (teams.length > 0 ? teams : [factionName]).slice().sort((a, b) => a.localeCompare(b));
            return (
              <optgroup key={factionName} label={factionName}>
                {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </optgroup>
            );
          })}
        </select>
      )}
      <button
        className="btn btn-primary"
        onClick={handleJoin}
        disabled={!resolved || loading}
      >
        {loading ? 'Joining…' : 'Join Tournament'}
      </button>
    </div>
  );
}

// ── Registration phase ───────────────────────────────────────────────────────

function RegistrationPhase({ tournament, user, isTO, onJoin, onLeave, onStart, onAddTestPlayers, joining, leaving }) {
  const joined = tournament.players.find((p) => p.uid === user?.uid);
  const canStart = tournament.players.length >= 4;
  const needsTestPlayers = tournament.players.length < 4;

  return (
    <div className={styles.phase}>
      <div className={styles.phaseHeader}>
        <p className={styles.sectionLabel}>Registered Players ({tournament.players.length}/16)</p>
        {isTO && (
          <button
            className="btn btn-primary btn-sm"
            onClick={onStart}
            disabled={!canStart}
            title={!canStart ? 'Need at least 4 players' : ''}
          >
            Start Tournament
          </button>
        )}
      </div>

      {tournament.players.length === 0 ? (
        <p className={styles.emptyPlayers}>No players registered yet.</p>
      ) : (
        <ul className={styles.playerList}>
          {tournament.players.map((p) => (
            <li key={p.uid} className={`${styles.playerRow} ${p.uid.startsWith('test_bot_') ? styles.playerRowBot : ''}`}>
              <span className={styles.playerName}>
                {p.displayName}
                {p.uid.startsWith('test_bot_') && <span className={styles.botBadge}>Test</span>}
              </span>
              <span className={styles.playerFaction}>{p.spearhead || p.faction || '—'}</span>
            </li>
          ))}
        </ul>
      )}

      {isTO && needsTestPlayers && (
        <button className={`btn btn-ghost btn-sm ${styles.testBtn}`} onClick={onAddTestPlayers}>
          + Fill with test players
        </button>
      )}

      {user && !joined && (
        <FactionPicker onJoin={onJoin} loading={joining} />
      )}

      {user && joined && !isTO && (
        <button className="btn btn-ghost btn-sm" onClick={onLeave} disabled={leaving}>
          {leaving ? 'Leaving…' : 'Leave Tournament'}
        </button>
      )}

      {!user && (
        <p className={styles.hint}>Sign in to join this tournament.</p>
      )}
    </div>
  );
}

// ── Active phase ─────────────────────────────────────────────────────────────

function PairingsPhase({ tournament, user, isTO, onPlayGame, onAdvanceRound }) {
  const [confirmAdvance, setConfirmAdvance] = useState(false);
  const roundIndex = tournament.currentRound - 1;
  const round = tournament.rounds[roundIndex];
  if (!round) return null;

  const playerMap = Object.fromEntries(tournament.players.map((p) => [p.uid, p]));
  const standings = calcStandings(tournament);
  const allDone = round.pairings.every((p) => p.status !== 'pending');

  return (
    <div className={styles.phase}>
      {/* Pairings */}
      <p className={styles.sectionLabel}>Round {tournament.currentRound} Pairings</p>

      {round.byePlayerId && playerMap[round.byePlayerId] && (
        <div className={styles.byeRow}>
          <span className={styles.byeBadge}>BYE</span>
          <span>{playerMap[round.byePlayerId].displayName}</span>
        </div>
      )}

      <div className={styles.pairingList}>
        {round.pairings.map((pairing) => {
          const p1 = playerMap[pairing.player1Uid];
          const p2 = playerMap[pairing.player2Uid];
          if (!p1 || !p2) return null;
          const isMyGame = user && (pairing.player1Uid === user.uid || pairing.player2Uid === user.uid);
          const canPlay = isMyGame || isTO;
          const isDone = pairing.status === 'complete';
          const isForfeit = pairing.status === 'forfeit';

          return (
            <div
              key={pairing.id}
              className={`${styles.pairingCard} ${isDone ? styles.pairingDone : ''} ${isForfeit ? styles.pairingForfeit : ''}`}
            >
              <div className={styles.pairingPlayers}>
                <div className={styles.pairingPlayer}>
                  <span className={styles.pairingName}>{p1.displayName}</span>
                  <span className={styles.pairingFaction}>{p1.spearhead || p1.faction}</span>
                </div>
                <span className={styles.pairingVs}>VS</span>
                <div className={`${styles.pairingPlayer} ${styles.pairingPlayerRight}`}>
                  <span className={styles.pairingName}>{p2.displayName}</span>
                  <span className={styles.pairingFaction}>{p2.spearhead || p2.faction}</span>
                </div>
              </div>

              {isDone && (
                <div className={styles.pairingResult}>
                  <span>{pairing.result.player1Score}</span>
                  <span className={styles.resultDash}>–</span>
                  <span>{pairing.result.player2Score}</span>
                </div>
              )}
              {isForfeit && <p className={styles.forfeitLabel}>Forfeit</p>}

              {pairing.status === 'pending' && canPlay && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onPlayGame(pairing, p1, p2)}
                >
                  {isMyGame ? 'Play Game' : 'Record Result'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Standings */}
      <p className={styles.sectionLabel}>Standings</p>
      <StandingsTable standings={standings} />

      {/* TO controls */}
      {isTO && (
        <div className={styles.toControls}>
          {confirmAdvance ? (
            <div className={styles.confirmBox}>
              <p>
                {allDone
                  ? tournament.currentRound >= tournament.totalRounds
                    ? 'End tournament and show final standings?'
                    : `Advance to round ${tournament.currentRound + 1}?`
                  : 'Some games are unfinished. Unplayed matches will be marked as forfeits.'}
              </p>
              <div className={styles.confirmActions}>
                <button className="btn btn-danger" onClick={() => { onAdvanceRound(); setConfirmAdvance(false); }}>
                  {tournament.currentRound >= tournament.totalRounds ? 'End Tournament' : 'Advance Round'}
                </button>
                <button className="btn btn-secondary" onClick={() => setConfirmAdvance(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-secondary" onClick={() => setConfirmAdvance(true)}>
              {tournament.currentRound >= tournament.totalRounds ? 'End Tournament' : 'Advance Round'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Standings table (shared) ─────────────────────────────────────────────────

function StandingsTable({ standings }) {
  return (
    <div className={styles.standingsWrap}>
      <table className={styles.standingsTable}>
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>W-D-L</th>
            <th>TP</th>
            <th>VP</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr key={s.uid} className={i === 0 ? styles.rowFirst : ''}>
              <td className={styles.rankCell}>{i + 1}</td>
              <td>
                <div className={styles.playerCell}>
                  <span className={styles.standingName}>{s.displayName}</span>
                  <span className={styles.standingFaction}>{s.spearhead || s.faction}</span>
                </div>
              </td>
              <td className={styles.recordCell}>{s.wins}-{s.draws}-{s.losses}</td>
              <td className={styles.tpCell}>{s.tournamentPoints}</td>
              <td className={styles.vpCell}>{s.totalVP}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Complete phase ───────────────────────────────────────────────────────────

function CompletePhase({ tournament, isTO, onDelete }) {
  const standings = calcStandings(tournament);
  const winner = standings[0];
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className={styles.phase}>
      <div className={styles.winnerBanner}>
        <p className={styles.winnerLabel}>Tournament Champion</p>
        <p className={styles.winnerName}>{winner?.displayName}</p>
        <p className={styles.winnerFaction}>{winner?.spearhead || winner?.faction}</p>
      </div>
      <p className={styles.sectionLabel}>Final Standings</p>
      <StandingsTable standings={standings} />

      {isTO && (
        confirmDelete ? (
          <div className={styles.confirmBox}>
            <p>Delete this tournament? This cannot be undone.</p>
            <div className={styles.confirmActions}>
              <button className="btn btn-danger" onClick={onDelete}>Delete</button>
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className={`btn btn-ghost btn-sm ${styles.deleteBtn}`} onClick={() => setConfirmDelete(true)}>
            Delete Tournament
          </button>
        )
      )}
    </div>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────

export default function TournamentScreen({
  tournament,
  user,
  onBack,
  onJoin,
  onLeave,
  onStart,
  onAddTestPlayers,
  onPlayGame,
  onAdvanceRound,
  onDelete,
  joining,
  leaving,
}) {
  const isTO = user?.uid === tournament.createdBy;

  return (
    <div className={`screen ${styles.tournamentScreen}`}>
      <div className="screen-header">
        <button className="btn btn-ghost back-btn" onClick={onBack}>← Back</button>
        <h2>{tournament.name}</h2>
      </div>

      <div className={styles.statusRow}>
        {tournament.status === 'registration' && (
          <span className={styles.statusBadge + ' ' + styles.statusRegistration}>Registration Open</span>
        )}
        {tournament.status === 'active' && (
          <span className={styles.statusBadge + ' ' + styles.statusActive}>
            Round {tournament.currentRound} of {tournament.totalRounds}
          </span>
        )}
        {tournament.status === 'complete' && (
          <span className={styles.statusBadge + ' ' + styles.statusComplete}>Complete</span>
        )}
        {isTO && <span className={styles.toBadge}>TO</span>}
      </div>

      {tournament.status === 'registration' && (
        <RegistrationPhase
          tournament={tournament}
          user={user}
          isTO={isTO}
          onJoin={onJoin}
          onLeave={onLeave}
          onStart={onStart}
          onAddTestPlayers={onAddTestPlayers}
          joining={joining}
          leaving={leaving}
        />
      )}

      {tournament.status === 'active' && (
        <PairingsPhase
          tournament={tournament}
          user={user}
          isTO={isTO}
          onPlayGame={onPlayGame}
          onAdvanceRound={onAdvanceRound}
        />
      )}

      {tournament.status === 'complete' && (
        <CompletePhase tournament={tournament} isTO={isTO} onDelete={onDelete} />
      )}
    </div>
  );
}
