import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import HomeScreen from './components/HomeScreen.jsx';
import GameSetupScreen from './components/GameSetupScreen.jsx';
import GameScreen from './components/GameScreen.jsx';
import GameSummaryScreen from './components/GameSummaryScreen.jsx';
import RecordsScreen from './components/RecordsScreen.jsx';

const SCREENS = {
  HOME: 'home',
  SETUP: 'setup',
  GAME: 'game',
  SUMMARY: 'summary',
  RECORDS: 'records',
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.HOME);
  const [setup, setSetup] = useState(null);
  const [result, setResult] = useState(null);

  const [games, setGames] = useLocalStorage('spearhead_games', []);
  const [records, setRecords] = useLocalStorage('spearhead_records', {});

  function handleStartGame(setupData) {
    setSetup(setupData);
    setScreen(SCREENS.GAME);
  }

  function handleEndGame(gameResult) {
    setResult(gameResult);
    setScreen(SCREENS.SUMMARY);
  }

  function handleSave() {
    const id = Date.now();
    const newGame = {
      id,
      date: new Date().toISOString(),
      player1: result.player1,
      player2: result.player2,
      winner: result.winner,
      priorities: result.priorities ?? [],
      realmSet: result.realmSet ?? null,
      realmLabel: result.realmLabel ?? null,
      map: result.map ?? null,
    };

    setGames((prev) => [...prev, newGame]);

    setRecords((prev) => {
      const next = { ...prev };
      const { player1, player2, winner } = result;

      for (const [key, player] of [['player1', player1], ['player2', player2]]) {
        if (!next[player.name]) {
          next[player.name] = { wins: 0, losses: 0, draws: 0 };
        }
        if (winner === 'draw') {
          next[player.name].draws += 1;
        } else if (winner === key) {
          next[player.name].wins += 1;
        } else {
          next[player.name].losses += 1;
        }
      }

      return next;
    });

    setSetup(null);
    setResult(null);
    setScreen(SCREENS.HOME);
  }

  function handleDiscard() {
    setSetup(null);
    setResult(null);
    setScreen(SCREENS.HOME);
  }

  function handleClearAll() {
    setGames([]);
    setRecords({});
  }

  return (
    <div className="app-container">
      {screen === SCREENS.HOME && (
        <HomeScreen
          onNewGame={() => setScreen(SCREENS.SETUP)}
          onRecords={() => setScreen(SCREENS.RECORDS)}
        />
      )}
      {screen === SCREENS.SETUP && (
        <GameSetupScreen
          onStart={handleStartGame}
          onBack={() => setScreen(SCREENS.HOME)}
          knownPlayers={Object.keys(records)}
        />
      )}
      {screen === SCREENS.GAME && setup && (
        <GameScreen
          setup={setup}
          onEndGame={handleEndGame}
        />
      )}
      {screen === SCREENS.SUMMARY && result && (
        <GameSummaryScreen
          result={result}
          onSave={handleSave}
          onDiscard={handleDiscard}
        />
      )}
      {screen === SCREENS.RECORDS && (
        <RecordsScreen
          records={records}
          games={games}
          onClearAll={handleClearAll}
          onBack={() => setScreen(SCREENS.HOME)}
        />
      )}
    </div>
  );
}
