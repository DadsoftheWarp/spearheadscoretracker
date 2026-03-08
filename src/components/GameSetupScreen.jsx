import { useState } from 'react';
import { factions, alliances, spearheads, rosters, getAllianceForFaction, getFactionForTeam } from '../data/factions.js';
import styles from './GameSetupScreen.module.css';

const allianceBadgeStyle = {
  order: styles.allianceOrder,
  chaos: styles.allianceChaos,
  death: styles.allianceDeath,
  destruction: styles.allianceDestruction,
};

// Derive faction/spearhead/alliance from the selected team option value.
function resolveTeam(teamValue) {
  if (!teamValue) return { faction: '', spearhead: '', alliance: '' };
  const faction = getFactionForTeam(teamValue) || teamValue;
  const spearhead = getFactionForTeam(teamValue) ? teamValue : '';
  const alliance = getAllianceForFaction(faction) || '';
  return { faction, spearhead, alliance };
}

function RosterPanel({ team }) {
  const roster = rosters[team];
  if (!roster) return null;
  // TODO: re-enable once roster data is finalized
  return null;

  return (
    <div className={styles.rosterPanel}>
      <p className={styles.rosterGeneral}>
        <span className={styles.rosterGeneralBadge}>General</span>
        <span className={styles.rosterGeneralName}>{roster.general}</span>
      </p>
      <ul className={styles.rosterUnits}>
        {roster.units.map((unit, i) => (
          <li key={i} className={styles.rosterUnit}>{unit}</li>
        ))}
      </ul>
    </div>
  );
}

function PlayerSetup({ label, name, setName, team, setTeam, listId, knownPlayers }) {
  const { faction, alliance } = resolveTeam(team);

  return (
    <div className={styles.playerSetup}>
      <h3 className={styles.playerLabel}>{label}</h3>

      <input
        className="input"
        type="text"
        placeholder="Player name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={30}
        list={knownPlayers.length > 0 ? listId : undefined}
      />
      {knownPlayers.length > 0 && (
        <datalist id={listId}>
          {knownPlayers.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
      )}

      <select
        className="input"
        value={team}
        onChange={(e) => setTeam(e.target.value)}
      >
        <option value="">— Select Team —</option>
        {alliances.map((allianceName) =>
          factions[allianceName].map((factionName) => {
            const factionTeams = spearheads[factionName] || [];
            const options = factionTeams.length > 0 ? factionTeams : [factionName];
            return (
              <optgroup key={factionName} label={factionName}>
                {options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </optgroup>
            );
          })
        )}
      </select>

      {faction && (
        <p className={`${styles.allianceBadge} ${allianceBadgeStyle[alliance.toLowerCase()] || ''}`}>
          {alliance}{faction !== team ? ` · ${faction}` : ''}
        </p>
      )}
      <RosterPanel team={team} />
    </div>
  );
}

export default function GameSetupScreen({ onStart, onBack, knownPlayers = [] }) {
  const [p1Name, setP1Name] = useState('');
  const [p1Team, setP1Team] = useState('');
  const [p2Name, setP2Name] = useState('');
  const [p2Team, setP2Team] = useState('');
  const [error, setError] = useState('');

  function handleStart() {
    if (!p1Name.trim() || !p2Name.trim()) {
      setError('Both players need a name.');
      return;
    }
    setError('');
    const p1 = resolveTeam(p1Team);
    const p2 = resolveTeam(p2Team);
    onStart({
      player1: { name: p1Name.trim(), faction: p1.faction || 'Unknown', spearhead: p1.spearhead, alliance: p1.alliance || 'Unknown' },
      player2: { name: p2Name.trim(), faction: p2.faction || 'Unknown', spearhead: p2.spearhead, alliance: p2.alliance || 'Unknown' },
    });
  }

  return (
    <div className={`screen ${styles.setupScreen}`}>
      <div className="screen-header">
        <button className="btn btn-ghost back-btn" onClick={onBack}>← Back</button>
        <h2>New Game</h2>
      </div>
      <div className={styles.setupPlayers}>
        <PlayerSetup
          label="Player 1"
          name={p1Name}
          setName={setP1Name}
          team={p1Team}
          setTeam={setP1Team}
          listId="p1-names"
          knownPlayers={knownPlayers}
        />
        <div className={styles.vsDivider}>VS</div>
        <PlayerSetup
          label="Player 2"
          name={p2Name}
          setName={setP2Name}
          team={p2Team}
          setTeam={setP2Team}
          listId="p2-names"
          knownPlayers={knownPlayers}
        />
      </div>
      {error && <p className="error-msg">{error}</p>}
      <button className={`btn btn-primary btn-large ${styles.setupStartBtn}`} onClick={handleStart}>
        Start Game
      </button>
    </div>
  );
}
