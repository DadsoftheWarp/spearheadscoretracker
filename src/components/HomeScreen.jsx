import styles from './HomeScreen.module.css';

export default function HomeScreen({
  user,
  authLoading,
  onSignIn,
  onSignOut,
  onNewGame,
  onRecords,
  onGroups,
  activeGroup,
  syncing,
}) {
  return (
    <div className={`screen ${styles.homeScreen}`}>
      {/* Auth pill — top-right, does not affect flex layout */}
      {!authLoading && (
        <div className={styles.authCorner}>
          {user ? (
            <button className={styles.authPill} onClick={onSignOut} title="Sign out">
              {user.photoURL ? (
                <img className={styles.authAvatar} src={user.photoURL} alt="" referrerPolicy="no-referrer" />
              ) : (
                <span className={styles.authInitial}>{(user.displayName ?? 'U')[0]}</span>
              )}
              <span className={styles.authName}>{(user.displayName ?? '').split(' ')[0]}</span>
            </button>
          ) : (
            <button className={styles.authPill} onClick={onSignIn}>
              Sign in
            </button>
          )}
        </div>
      )}

      <div className={styles.homeHero}>
        <h1 className={styles.appTitle}>Age of Sigmar: Spearhead</h1>
        <p className={styles.appSubtitle}>Score Tracker</p>
        <p className={styles.appTagline}>Presented by Dads of the Warp</p>
      </div>

      <div className={styles.homeActions}>
        <button className="btn btn-primary btn-large" onClick={onNewGame}>
          New Game
        </button>
        <button className="btn btn-secondary btn-large" onClick={onRecords}>
          Records
        </button>
        {user && (
          <button className={`btn btn-secondary btn-large ${styles.groupsBtn}`} onClick={onGroups}>
            {activeGroup ? (
              <>
                <span className={styles.groupDot} />
                {activeGroup.name}
                {syncing && <span className={styles.syncDot} />}
              </>
            ) : (
              'Groups'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
