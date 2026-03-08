import { useState } from 'react';
import styles from './GameScreen.module.css';
import {
  playScoreUp,
  playScoreDown,
  playDiceRoll,
  playCoinFlip,
} from '../utils/sounds.js';

const TOTAL_ROUNDS = 4;
const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

function CoinFlipper() {
  const [coin, setCoin] = useState(null);
  const [flipKey, setFlipKey] = useState(0);

  function flip() {
    setCoin(Math.random() < 0.5 ? 'Heads' : 'Tails');
    setFlipKey((k) => k + 1);
    playCoinFlip();
  }

  return (
    <div className={styles.coinRow}>
      <button className={styles.coinBtn} onClick={flip} aria-label="Flip coin">
        <span className={styles.coinLabel}>Coin</span>
        <span
          key={flipKey}
          className={`${styles.coinResult} ${coin ? styles.animateCoin : ''}`}
        >
          {coin ? (coin === 'Heads' ? '👑 Heads' : '🔵 Tails') : '—'}
        </span>
      </button>
      <button
        className={styles.coinReset}
        onClick={() => setCoin(null)}
        aria-label="Reset coin"
      >
        ✕
      </button>
    </div>
  );
}

function D6Roller() {
  const [die, setDie] = useState(null);
  const [rollKey, setRollKey] = useState(0);

  function roll() {
    setDie(Math.floor(Math.random() * 6) + 1);
    setRollKey((k) => k + 1);
    playDiceRoll();
  }

  return (
    <div className={styles.cardDice}>
      <button
        className={styles.cardDiceRoll}
        onClick={roll}
        aria-label="Roll D6"
      >
        <span className={styles.cardDiceLabel}>D6</span>
        <span
          key={rollKey}
          className={`${styles.cardDiceResult} ${die ? styles.animateDice : ''}`}
        >
          {die ? `${DICE_FACES[die - 1]} ${die}` : '—'}
        </span>
      </button>
      <button
        className={styles.cardDiceReset}
        onClick={() => setDie(null)}
        aria-label="Reset die"
      >
        ✕
      </button>
    </div>
  );
}

function ScoreCounter({ label, value, onChange, type }) {
  const [flashKey, setFlashKey] = useState(0);
  const [flashDir, setFlashDir] = useState(null);

  function handleChange(newVal) {
    if (newVal === value) return;
    const dir = newVal > value ? 'up' : 'down';
    setFlashDir(dir);
    setFlashKey((k) => k + 1);
    if (dir === 'up') playScoreUp();
    else playScoreDown();
    onChange(newVal);
  }

  const rowClass = type ? styles[`${type}Row`] : '';
  const labelClass = type ? styles[`${type}Label`] : '';

  return (
    <div className={`${styles.scoreRow} ${rowClass}`}>
      <span className={`${styles.scoreLabel} ${labelClass}`}>{label}</span>
      <div className={styles.counter}>
        <button
          className={styles.counterBtn}
          onClick={() => handleChange(Math.max(0, value - 1))}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span
          key={flashKey}
          className={`${styles.counterValue} ${flashDir === 'up' ? styles.flashUp : flashDir === 'down' ? styles.flashDown : ''}`}
        >
          {value}
        </span>
        <button
          className={styles.counterBtn}
          onClick={() => handleChange(value + 1)}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function PreviousRoundCard({ round, p1Score, p2Score, p1Name, p2Name }) {
  const p1Total = p1Score.vp + p1Score.battleTactics + p1Score.twistPoints;
  const p2Total = p2Score.vp + p2Score.battleTactics + p2Score.twistPoints;

  return (
    <div className={styles.prevRoundCard}>
      <div className={styles.prevRoundLabel}>Round {round} Recap</div>
      <table className={styles.prevRoundTable}>
        <thead>
          <tr>
            <th className={styles.prevRoundTh}></th>
            <th className={styles.prevRoundTh}>VP</th>
            <th className={styles.prevRoundTh}>Tactics</th>
            <th className={styles.prevRoundTh}>Twist</th>
            <th className={`${styles.prevRoundTh} ${styles.prevRoundTotalCol}`}>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={styles.prevRoundRowLabel}>{p1Name}</td>
            <td className={styles.prevRoundVal}>{p1Score.vp}</td>
            <td className={styles.prevRoundVal}>{p1Score.battleTactics}</td>
            <td className={styles.prevRoundVal}>{p1Score.twistPoints}</td>
            <td
              className={`${styles.prevRoundVal} ${styles.prevRoundTotalCol}`}
            >
              {p1Total}
            </td>
          </tr>
          <tr>
            <td className={styles.prevRoundRowLabel}>{p2Name}</td>
            <td className={styles.prevRoundVal}>{p2Score.vp}</td>
            <td className={styles.prevRoundVal}>{p2Score.battleTactics}</td>
            <td className={styles.prevRoundVal}>{p2Score.twistPoints}</td>
            <td
              className={`${styles.prevRoundVal} ${styles.prevRoundTotalCol}`}
            >
              {p2Total}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function PriorityTracker({ entry, p1Name, p2Name, onSetWinner }) {
  const { winner = null } = entry || {};

  return (
    <div className={styles.priorityCard}>
      <div className={styles.priorityRow}>
        <span className={styles.priorityRowLabel}>Priority</span>
        <div className={styles.initiativeBtns}>
          <button
            className={`${styles.initiativeBtn} ${winner === 'player1' ? styles.initiativeActive : ''}`}
            onClick={() => onSetWinner(winner === 'player1' ? null : 'player1')}
          >
            {p1Name}
          </button>
          <button
            className={`${styles.initiativeBtn} ${winner === 'player2' ? styles.initiativeActive : ''}`}
            onClick={() => onSetWinner(winner === 'player2' ? null : 'player2')}
          >
            {p2Name}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayerRoundCard({ player, roundScore, onUpdate }) {
  return (
    <div className={styles.roundCard}>
      <div className={styles.roundCardHeader}>
        <span className={styles.roundPlayerName}>{player.name}</span>
        <span className={styles.roundPlayerFaction}>
          {player.spearhead || player.faction}
          {player.spearhead && (
            <span className={styles.roundPlayerSubfaction}>
              {' '}
              · {player.faction}
            </span>
          )}
        </span>
      </div>
      <D6Roller />
      <ScoreCounter
        label="Victory Points"
        value={roundScore.vp}
        onChange={(v) => onUpdate({ ...roundScore, vp: v })}
        type="vp"
      />
      <ScoreCounter
        label="Battle Tactics"
        value={roundScore.battleTactics}
        onChange={(v) => onUpdate({ ...roundScore, battleTactics: v })}
        type="bt"
      />
      <ScoreCounter
        label="Twist Points"
        value={roundScore.twistPoints}
        onChange={(v) => onUpdate({ ...roundScore, twistPoints: v })}
        type="twist"
      />
      <div className={styles.roundSubtotal}>
        Round total:{' '}
        <strong>
          {roundScore.vp + roundScore.battleTactics + roundScore.twistPoints}
        </strong>
      </div>
    </div>
  );
}

function runningTotal(rounds) {
  return rounds.reduce(
    (sum, r) => sum + r.vp + r.battleTactics + r.twistPoints,
    0
  );
}

const emptyRound = () => ({ vp: 0, battleTactics: 0, twistPoints: 0 });

export default function GameScreen({ setup, onEndGame }) {
  const [currentRound, setCurrentRound] = useState(1);
  const [p1Rounds, setP1Rounds] = useState([emptyRound()]);
  const [p2Rounds, setP2Rounds] = useState([emptyRound()]);
  const [priorities, setPriorities] = useState([]);
  const [undoState, setUndoState] = useState(null);

  const idx = currentRound - 1;
  const p1Score = p1Rounds[idx] || emptyRound();
  const p2Score = p2Rounds[idx] || emptyRound();

  function updateP1Round(updated) {
    setUndoState({ p1Rounds, p2Rounds });
    setP1Rounds((prev) => {
      const next = [...prev];
      next[idx] = updated;
      return next;
    });
  }

  function updateP2Round(updated) {
    setUndoState({ p1Rounds, p2Rounds });
    setP2Rounds((prev) => {
      const next = [...prev];
      next[idx] = updated;
      return next;
    });
  }

  function handleUndo() {
    if (!undoState) return;
    setP1Rounds(undoState.p1Rounds);
    setP2Rounds(undoState.p2Rounds);
    setUndoState(null);
  }

  function setPriorityWinner(val) {
    setPriorities((prev) => {
      const next = [...prev];
      // Auto-set firstTurn to the winner; clearing winner also clears firstTurn
      next[idx] = { winner: val, firstTurn: val };
      return next;
    });
  }

  function setFirstTurn(val) {
    setPriorities((prev) => {
      const next = [...prev];
      const current = next[idx] || { winner: null, firstTurn: null };
      next[idx] = { ...current, firstTurn: val };
      return next;
    });
  }

  function handleBack() {
    setUndoState(null);
    setCurrentRound((r) => r - 1);
  }

  function handleAdvance() {
    setUndoState(null);
    if (currentRound < TOTAL_ROUNDS) {
      setCurrentRound((r) => r + 1);
      // Only push a new empty round if we haven't already visited the next round
      if (currentRound >= p1Rounds.length) {
        setP1Rounds((prev) => [...prev, emptyRound()]);
        setP2Rounds((prev) => [...prev, emptyRound()]);
      }
    } else {
      const p1Total = runningTotal(p1Rounds);
      const p2Total = runningTotal(p2Rounds);
      let winner = 'draw';
      if (p1Total > p2Total) winner = 'player1';
      else if (p2Total > p1Total) winner = 'player2';
      onEndGame({
        player1: { ...setup.player1, rounds: p1Rounds, total: p1Total },
        player2: { ...setup.player2, rounds: p2Rounds, total: p2Total },
        winner,
        priorities,
      });
    }
  }

  const p1Total = runningTotal(p1Rounds);
  const p2Total = runningTotal(p2Rounds);
  const isLastRound = currentRound === TOTAL_ROUNDS;
  const prevIdx = idx - 1;
  const hasPrevRound = prevIdx >= 0;

  return (
    <div className={`screen ${styles.gameScreen}`}>
      <div className={styles.gameHeader}>
        <div className={styles.gameHeaderInfo}>
          <div className={styles.roundIndicator}>
            Round {currentRound} of {TOTAL_ROUNDS}
          </div>
          <div className={styles.gameTotals}>
            <span className={styles.totalChip}>
              {setup.player1.name}: <strong>{p1Total}</strong>
            </span>
            <span className={styles.totalChip}>
              {setup.player2.name}: <strong>{p2Total}</strong>
            </span>
          </div>
        </div>
        <CoinFlipper />
      </div>

      {hasPrevRound && (
        <PreviousRoundCard
          round={prevIdx + 1}
          p1Score={p1Rounds[prevIdx]}
          p2Score={p2Rounds[prevIdx]}
          p1Name={setup.player1.name}
          p2Name={setup.player2.name}
        />
      )}

      <PriorityTracker
        entry={priorities[idx] ?? null}
        p1Name={setup.player1.name}
        p2Name={setup.player2.name}
        onSetWinner={setPriorityWinner}
      />

      <div className={styles.roundCards}>
        <PlayerRoundCard
          player={setup.player1}
          roundScore={p1Score}
          onUpdate={updateP1Round}
        />
        <PlayerRoundCard
          player={setup.player2}
          roundScore={p2Score}
          onUpdate={updateP2Round}
        />
      </div>

      <div className={styles.roundNav}>
        {currentRound > 1 && (
          <button className={`btn btn-secondary ${styles.prevRoundBtn}`} onClick={handleBack}>
            ← Prev
          </button>
        )}
        {undoState && (
          <button className={`btn btn-ghost ${styles.undoBtn}`} onClick={handleUndo} title="Undo last score change">
            ↩ Undo
          </button>
        )}
        <button className={`btn btn-primary ${styles.advanceBtn}`} onClick={handleAdvance}>
          {isLastRound ? 'End Game' : 'Next Round →'}
        </button>
      </div>
    </div>
  );
}
