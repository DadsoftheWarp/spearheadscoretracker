import styles from './HomeScreen.module.css';

export default function HomeScreen({
  user,
  authLoading,
  authError,
  onSignIn,
  onSignOut,
  onNewGame,
  onRecords,
  onGroups,
  onFeedback,
  activeGroup,
  syncing,
}) {
  return (
    <div className={`screen ${styles.homeScreen}`}>

      {/* Signed-in user chip — top right corner */}
      {!authLoading && user && (
        <div className={styles.authCorner}>
          <div className={styles.authUserInfo}>
            {user.photoURL ? (
              <img
                className={styles.authAvatar}
                src={user.photoURL}
                alt=""
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className={styles.authInitial}>
                {(user.displayName ?? 'U')[0]}
              </span>
            )}
            <span className={styles.authName}>
              {(user.displayName ?? '').split(' ')[0]}
            </span>
          </div>
        </div>
      )}

      {/* App title */}
      <div className={styles.homeHero}>
        <h1 className={styles.appTitle}>Age of Sigmar: Spearhead</h1>
        <p className={styles.appSubtitle}>Score Tracker</p>
        <p className={styles.appTagline}>Presented by Dads of the Warp</p>
        <p className={styles.appTagline}>Alpha Version</p>
      </div>

      {/* Main actions */}
      <div className={styles.homeActions}>
        <button className="btn btn-primary btn-large" onClick={onNewGame}>
          New Game
        </button>
        <button className="btn btn-secondary btn-large" onClick={onRecords}>
          Records
        </button>

        {/* Groups button — only shown when signed in */}
        {user && (
          <button
            className={`btn btn-secondary btn-large ${styles.groupsBtn}`}
            onClick={onGroups}
          >
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

        <button className={`btn btn-ghost btn-large ${styles.feedbackBtn}`} onClick={onFeedback}>
          Suggest a Feature
        </button>

        {/* Sign In / Sign Out — always at the bottom */}
        {!authLoading && (
          user ? (
            <button
              className={`btn btn-ghost btn-large ${styles.signOutBtn}`}
              onClick={onSignOut}
            >
              Sign Out
            </button>
          ) : (
            <div className={styles.signInWrap}>
              <button className="btn btn-ghost btn-large" onClick={onSignIn}>
                Sign In with Google
              </button>
              {authError && <p className={styles.authError}>{authError}</p>}
            </div>
          )
        )}
      </div>
    </div>
  );
}
