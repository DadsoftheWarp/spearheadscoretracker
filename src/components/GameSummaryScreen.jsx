import { Fragment } from 'react';
import styles from './GameSummaryScreen.module.css';

function resolveEntry(p) {
  if (!p) return { winner: null, firstTurn: null };
  if (typeof p === 'string') return { winner: p, firstTurn: p };
  return { winner: p.winner ?? null, firstTurn: p.firstTurn ?? null };
}

function PrioritySection({ priorities, player1Name, player2Name }) {
  const totalRounds = Math.max(priorities.length, 4);
  const anySet = priorities.some((p) => {
    const { winner, firstTurn } = resolveEntry(p);
    return winner || firstTurn;
  });
  if (!anySet) return null;

  const hasPassedAny = priorities.some((p) => {
    const { winner, firstTurn } = resolveEntry(p);
    return winner && firstTurn && winner !== firstTurn;
  });

  return (
    <div className={styles.prioritySection}>
      <p className={styles.prioritySectionTitle}>Priority &amp; First Turn</p>
      <div className={styles.priorityGrid}>
        {Array.from({ length: totalRounds }, (_, i) => {
          const { winner, firstTurn } = resolveEntry(priorities[i]);
          const winnerName =
            winner === 'player1'
              ? player1Name
              : winner === 'player2'
                ? player2Name
                : null;
          const _firstTurnName =
            firstTurn === 'player1'
              ? player1Name
              : firstTurn === 'player2'
                ? player2Name
                : null;
          const _passed = winner && firstTurn && winner !== firstTurn;

          let doubleTurn = false;
          if (i > 0 && firstTurn) {
            const { firstTurn: prevFT } = resolveEntry(priorities[i - 1]);
            doubleTurn = prevFT === firstTurn;
          }

          const isSet = !!(winner || firstTurn);

          return (
            <div
              key={i}
              className={`${styles.priorityChip} ${isSet ? styles.priorityChipSet : ''} ${doubleTurn ? styles.priorityChipDouble : ''}`}
            >
              <span className={styles.priorityRound}>R{i + 1}</span>
              {doubleTurn && (
                <span className={styles.doubleTurnBadge}>Double!</span>
              )}
              <span className={styles.prioritySubLabel}>Priority</span>
              <span
                className={`${styles.priorityName} ${winnerName ? styles.priorityNameSet : styles.priorityNameUnset}`}
              >
                {winnerName ?? '—'}
              </span>
            </div>
          );
        })}
      </div>
      {hasPassedAny && (
        <p className={styles.priorityPassedNote}>
          * priority winner chose to go second
        </p>
      )}
    </div>
  );
}

export default function GameSummaryScreen({ result, onSave, onDiscard }) {
  const { player1, player2, winner, priorities = [], realmLabel, map } = result;

  const winnerName =
    winner === 'player1'
      ? player1.name
      : winner === 'player2'
        ? player2.name
        : null;

  return (
    <div className={`screen ${styles.summaryScreen}`}>
      <h2 className={styles.summaryTitle}>Game Over</h2>

      <div
        className={`${styles.winnerBanner} ${winner === 'draw' ? styles.bannerDraw : styles.bannerWin}`}
      >
        {winner === 'draw' ? "It's a Draw!" : `${winnerName} Wins!`}
      </div>

      <div className={styles.summaryTableWrap}>
        <table className={styles.summaryTable}>
          <thead>
            <tr>
              <th>Round</th>
              <th>{player1.name}</th>
              <th>{player2.name}</th>
            </tr>
          </thead>
          <tbody>
            {player1.rounds.map((r, i) => {
              const p1rnd = r.vp + r.battleTactics + r.twistPoints;
              const p2r = player2.rounds[i] || {
                vp: 0,
                battleTactics: 0,
                twistPoints: 0,
              };
              const p2rnd = p2r.vp + p2r.battleTactics + p2r.twistPoints;
              return (
                <Fragment key={i}>
                  <tr className={styles.roundTotalRow}>
                    <td className={styles.roundLabel}>R{i + 1}</td>
                    <td>{p1rnd}</td>
                    <td>{p2rnd}</td>
                  </tr>
                  <tr className={styles.breakdownRow}>
                    <td></td>
                    <td>
                      <div className={styles.breakdownCell}>
                        <span className={styles.vpStat}>{r.vp} VP</span>
                        <span className={styles.btStat}>
                          {r.battleTactics} BT
                        </span>
                        <span className={styles.twStat}>
                          {r.twistPoints} Tw
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.breakdownCell}>
                        <span className={styles.vpStat}>{p2r.vp} VP</span>
                        <span className={styles.btStat}>
                          {p2r.battleTactics} BT
                        </span>
                        <span className={styles.twStat}>
                          {p2r.twistPoints} Tw
                        </span>
                      </div>
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
          <tfoot>
            <tr className={styles.summaryTotalRow}>
              <td>Total</td>
              <td>{player1.total}</td>
              <td>{player2.total}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <PrioritySection
        priorities={priorities}
        player1Name={player1.name}
        player2Name={player2.name}
      />

      <div className={styles.factionSummary}>
        <span className={styles.factionChip}>
          {player1.name}: {player1.spearhead || player1.faction}
          {player1.spearhead && (
            <span className={styles.factionChipSub}> · {player1.faction}</span>
          )}
        </span>
        <span className={styles.factionChip}>
          {player2.name}: {player2.spearhead || player2.faction}
          {player2.spearhead && (
            <span className={styles.factionChipSub}> · {player2.faction}</span>
          )}
        </span>
        {realmLabel && (
          <span className={styles.factionChip}>
            {realmLabel}{map && <span className={styles.factionChipSub}> · {map}</span>}
          </span>
        )}
      </div>

      <div className={styles.summaryActions}>
        <button className="btn btn-primary btn-large" onClick={onSave}>
          Save &amp; Return Home
        </button>
        <button className="btn btn-danger" onClick={onDiscard}>
          Discard
        </button>
      </div>
    </div>
  );
}
