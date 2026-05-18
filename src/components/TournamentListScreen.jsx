import styles from './TournamentListScreen.module.css';

function statusLabel(status) {
  if (status === 'registration') return 'Registration';
  if (status === 'active') return 'In Progress';
  return 'Complete';
}

function TournamentCard({ tournament, onClick }) {
  const status = tournament.status;
  return (
    <button className={styles.card} onClick={onClick}>
      <div className={styles.cardTop}>
        <span className={styles.cardName}>{tournament.name}</span>
        <span className={`${styles.statusBadge} ${styles['status_' + status]}`}>
          {statusLabel(status)}
        </span>
      </div>
      <div className={styles.cardMeta}>
        <span>{tournament.players?.length ?? 0} players</span>
        {status !== 'registration' && (
          <span>Round {tournament.currentRound} of {tournament.totalRounds}</span>
        )}
      </div>
    </button>
  );
}

export default function TournamentListScreen({
  tournaments,
  onSelect,
  onNew,
  onHowTo,
  onBack,
  activeGroup,
  user,
}) {
  return (
    <div className={`screen ${styles.listScreen}`}>
      <div className="screen-header">
        <button className="btn btn-ghost back-btn" onClick={onBack}>← Back</button>
        <h2>Tournaments</h2>
      </div>

      {!user && (
        <p className={styles.hint}>Sign in to sync tournaments with your group.</p>
      )}
      {user && !activeGroup && (
        <p className={styles.hint}>Tournaments are saved locally. Join a group to sync with others.</p>
      )}
      {activeGroup && (
        <p className={styles.groupLabel}>{activeGroup.name}</p>
      )}

      {tournaments.length === 0 ? (
        <div className={styles.empty}>
          <p>No tournaments yet.</p>
          <p className={styles.emptyHint}>Create one to get started.</p>
        </div>
      ) : (
        <div className={styles.cardList}>
          {tournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t} onClick={() => onSelect(t)} />
          ))}
        </div>
      )}

      <div className={styles.actions}>
        <button className="btn btn-primary btn-large" onClick={onNew}>
          New Tournament
        </button>
        <button className="btn btn-ghost" onClick={onHowTo}>
          How to set up a tournament
        </button>
      </div>
    </div>
  );
}
