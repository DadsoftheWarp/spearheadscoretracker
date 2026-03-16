import styles from './HomeScreen.module.css';

export default function HomeScreen({ onNewGame, onRecords }) {
  return (
    <div className={`screen ${styles.homeScreen}`}>
      <div className={styles.homeHero}>
        <h1 className={styles.appTitle}>Age of Sigmar: Spearhead</h1>
        <p className={styles.appSubtitle}>Score Tracker</p>
        <p className={styles.appTagline}>Presented by Dads of the Warp</p>
        <p className={styles.appTagline}>Alpha Version</p>
      </div>

      <div className={styles.homeActions}>
        <button className="btn btn-primary btn-large" onClick={onNewGame}>
          New Game
        </button>
        <button className="btn btn-secondary btn-large" onClick={onRecords}>
          Records
        </button>
      </div>
    </div>
  );
}
