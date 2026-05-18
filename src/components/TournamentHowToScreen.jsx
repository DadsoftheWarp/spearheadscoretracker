import styles from './TournamentHowToScreen.module.css';

const STEPS = [
  {
    number: 1,
    title: 'Create a tournament',
    body: 'From the Tournaments screen, tap "New Tournament" and give it a name. You become the Tournament Organiser (TO).',
  },
  {
    number: 2,
    title: 'Players register',
    body: 'Share the tournament with your group. Each player opens it, picks their faction and Spearhead team, and taps "Join Tournament". You need at least 4 players (maximum 16).',
  },
  {
    number: 3,
    title: 'Start the tournament',
    body: 'Once everyone has joined, the TO taps "Start Tournament". Round 1 pairings are generated automatically using the Swiss system — players with similar records are paired together.',
  },
  {
    number: 4,
    title: 'Play your games',
    body: 'Each pair of players taps "Play Game" on their pairing. This opens the normal game flow. Play through all 4 rounds, recording scores as you go.',
  },
  {
    number: 5,
    title: 'Advance rounds',
    body: 'After all games in a round are finished the TO taps "Advance Round" to generate the next round\'s pairings. If a game can\'t be completed, the TO can advance early — that match is recorded as a forfeit.',
  },
  {
    number: 6,
    title: 'Final standings',
    body: 'After 4 rounds the tournament ends and final standings are shown. Ties are broken by total victory points scored across all games.',
  },
];

const FAQ = [
  {
    q: 'How are pairings decided?',
    a: 'Swiss format: players with the same win/loss record are paired against each other each round, avoiding rematches where possible.',
  },
  {
    q: 'What happens if there\'s an odd number of players?',
    a: 'One player receives a "bye" — a free win with 0 victory points. The bye is given to the lowest-ranked player who hasn\'t had one yet.',
  },
  {
    q: 'How is the winner decided?',
    a: 'Tournament points: 3 for a win, 1 for a draw, 0 for a loss. If players are tied on tournament points, total victory points scored across all games breaks the tie.',
  },
  {
    q: 'Can I run a tournament without a group?',
    a: 'Yes — the tournament is saved locally on your device. You won\'t be able to sync with other players, but you can still record all results manually.',
  },
];

export default function TournamentHowToScreen({ onBack }) {
  return (
    <div className={`screen ${styles.howToScreen}`}>
      <div className="screen-header">
        <button className="btn btn-ghost back-btn" onClick={onBack}>← Back</button>
        <h2>How to Run a Tournament</h2>
      </div>

      <div className={styles.content}>
        <div className={styles.stepsSection}>
          {STEPS.map((step) => (
            <div key={step.number} className={styles.step}>
              <div className={styles.stepNumber}>{step.number}</div>
              <div className={styles.stepBody}>
                <p className={styles.stepTitle}>{step.title}</p>
                <p className={styles.stepText}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.divider} />

        <p className={styles.faqHeading}>FAQ</p>
        <div className={styles.faqList}>
          {FAQ.map((item) => (
            <div key={item.q} className={styles.faqItem}>
              <p className={styles.faqQ}>{item.q}</p>
              <p className={styles.faqA}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
