import { useState } from 'react';
import { calcRounds } from '../utils/tournamentUtils.js';
import styles from './TournamentSetupScreen.module.css';

export default function TournamentSetupScreen({ onBack, onCreate }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const previewRounds = calcRounds(8); // always 4 — shown as info

  async function handleCreate(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('Enter a tournament name.'); return; }
    setError('');
    setLoading(true);
    try {
      await onCreate(trimmed);
    } catch {
      setError('Failed to create tournament. Check your connection.');
      setLoading(false);
    }
  }

  return (
    <div className={`screen ${styles.setupScreen}`}>
      <div className="screen-header">
        <button className="btn btn-ghost back-btn" onClick={onBack}>← Back</button>
        <h2>New Tournament</h2>
      </div>

      <form className={styles.form} onSubmit={handleCreate}>
        <label className={styles.fieldLabel}>Tournament Name</label>
        <input
          className="input"
          type="text"
          placeholder="e.g. Friday Night Championship"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          autoFocus
        />

        <div className={styles.infoCard}>
          <p className={styles.infoRow}>
            <span className={styles.infoKey}>Players</span>
            <span className={styles.infoVal}>4 – 16</span>
          </p>
          <p className={styles.infoRow}>
            <span className={styles.infoKey}>Rounds</span>
            <span className={styles.infoVal}>{previewRounds}</span>
          </p>
          <p className={styles.infoRow}>
            <span className={styles.infoKey}>Format</span>
            <span className={styles.infoVal}>Swiss</span>
          </p>
          <p className={styles.infoRow}>
            <span className={styles.infoKey}>Tiebreaker</span>
            <span className={styles.infoVal}>Total VP scored</span>
          </p>
        </div>

        <p className={styles.hint}>
          After creating, share the tournament with your group. Players join and select their faction before you start.
        </p>

        {error && <p className="error-msg">{error}</p>}

        <button
          className="btn btn-primary btn-large"
          type="submit"
          disabled={loading || !name.trim()}
        >
          {loading ? 'Creating…' : 'Create Tournament'}
        </button>
      </form>
    </div>
  );
}
