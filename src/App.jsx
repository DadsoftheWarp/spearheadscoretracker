import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { useAuth } from './hooks/useAuth.js';
import HomeScreen from './components/HomeScreen.jsx';
import GameSetupScreen from './components/GameSetupScreen.jsx';
import GameScreen from './components/GameScreen.jsx';
import GameSummaryScreen from './components/GameSummaryScreen.jsx';
import RecordsScreen from './components/RecordsScreen.jsx';
import GroupScreen from './components/GroupScreen.jsx';
import FeedbackScreen from './components/FeedbackScreen.jsx';

const SCREENS = {
  HOME: 'home',
  SETUP: 'setup',
  GAME: 'game',
  SUMMARY: 'summary',
  RECORDS: 'records',
  GROUP: 'group',
  FEEDBACK: 'feedback',
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.HOME);
  const [setup, setSetup] = useState(null);
  const [result, setResult] = useState(null);

  // Local game history and win/loss records stored in the browser
  const [games, setGames] = useLocalStorage('spearhead_games', []);
  const [records, setRecords] = useLocalStorage('spearhead_records', {});

  // Auth state
  const { user, loading: authLoading, signIn, signOut, authError } = useAuth();

  // The group this player has joined (stored locally so it persists between sessions)
  const [activeGroup, setActiveGroup] = useLocalStorage('spearhead_active_group', null);

  // Games fetched from Firestore for the active group
  const [groupGames, setGroupGames] = useState([]);
  const [syncing, setSyncing] = useState(false);

  // Fetch group games from Firestore whenever the user or active group changes
  useEffect(() => {
    let cancelled = false;

    async function fetchGroupGames() {
      if (!user || !activeGroup?.id) {
        setGroupGames([]);
        return;
      }
      setSyncing(true);
      try {
        const q = query(
          collection(db, 'groups', activeGroup.id, 'games'),
          orderBy('date', 'desc'),
        );
        const snap = await getDocs(q);
        if (!cancelled) {
          setGroupGames(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
        }
      } catch {
        // Fail silently when offline
      } finally {
        if (!cancelled) setSyncing(false);
      }
    }

    fetchGroupGames();
    return () => { cancelled = true; };
  }, [user, activeGroup?.id]);

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

    // Save to local storage
    setGames((prev) => [...prev, newGame]);
    setRecords((prev) => {
      const next = { ...prev };
      const { player1, player2, winner } = result;
      for (const [key, player] of [['player1', player1], ['player2', player2]]) {
        if (!next[player.name]) next[player.name] = { wins: 0, losses: 0, draws: 0 };
        if (winner === 'draw') next[player.name].draws += 1;
        else if (winner === key) next[player.name].wins += 1;
        else next[player.name].losses += 1;
      }
      return next;
    });

    setSetup(null);
    setResult(null);
    setScreen(SCREENS.HOME);

    // Also save to Firestore if the player is in a group
    if (user && activeGroup?.id) {
      const firestoreGame = {
        ...newGame,
        recordedBy: user.uid,
        recordedByName: user.displayName ?? '',
        createdAt: serverTimestamp(),
      };
      addDoc(collection(db, 'groups', activeGroup.id, 'games'), firestoreGame)
        .then((docRef) => {
          setGroupGames((prev) => [{ ...newGame, id: docRef.id }, ...prev]);
        })
        .catch(() => {});
    }
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
          user={user}
          authLoading={authLoading}
          authError={authError}
          onSignIn={signIn}
          onSignOut={signOut}
          onNewGame={() => setScreen(SCREENS.SETUP)}
          onRecords={() => setScreen(SCREENS.RECORDS)}
          onGroups={() => setScreen(SCREENS.GROUP)}
          onFeedback={() => setScreen(SCREENS.FEEDBACK)}
          activeGroup={activeGroup}
          syncing={syncing}
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
        <GameScreen setup={setup} onEndGame={handleEndGame} />
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
          groupGames={groupGames}
          activeGroup={activeGroup}
          onClearAll={handleClearAll}
          onBack={() => setScreen(SCREENS.HOME)}
        />
      )}
      {/* GroupScreen is only reachable when signed in */}
      {screen === SCREENS.GROUP && user && (
        <GroupScreen
          user={user}
          activeGroup={activeGroup}
          onGroupChange={setActiveGroup}
          onBack={() => setScreen(SCREENS.HOME)}
        />
      )}
      {screen === SCREENS.FEEDBACK && (
        <FeedbackScreen
          user={user}
          onBack={() => setScreen(SCREENS.HOME)}
        />
      )}
    </div>
  );
}
