import { useState, useEffect } from 'react';
import {
  collection, addDoc, doc, setDoc, deleteDoc, query, orderBy,
  getDocs, serverTimestamp, onSnapshot,
} from 'firebase/firestore';
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
import TournamentListScreen from './components/TournamentListScreen.jsx';
import TournamentSetupScreen from './components/TournamentSetupScreen.jsx';
import TournamentScreen from './components/TournamentScreen.jsx';
import TournamentHowToScreen from './components/TournamentHowToScreen.jsx';
import {
  calcRounds, applyPairingResult, advanceRound as advanceRoundUtil,
  startTournament as startTournamentUtil,
} from './utils/tournamentUtils.js';

const SCREENS = {
  HOME: 'home',
  SETUP: 'setup',
  GAME: 'game',
  SUMMARY: 'summary',
  RECORDS: 'records',
  GROUP: 'group',
  FEEDBACK: 'feedback',
  TOURNAMENT_LIST: 'tournament_list',
  TOURNAMENT_SETUP: 'tournament_setup',
  TOURNAMENT: 'tournament',
  TOURNAMENT_HOWTO: 'tournament_howto',
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.HOME);
  const [setup, setSetup] = useState(null);
  const [result, setResult] = useState(null);

  const [games, setGames] = useLocalStorage('spearhead_games', []);
  const [records, setRecords] = useLocalStorage('spearhead_records', {});

  const { user, loading: authLoading, signIn, signOut, authError } = useAuth();
  const [activeGroup, setActiveGroup] = useLocalStorage('spearhead_active_group', null);

  const [groupGames, setGroupGames] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [userGames, setUserGames] = useState([]);
  const [userSyncing, setUserSyncing] = useState(false);

  // Tournament state
  const [localTournaments, setLocalTournaments] = useLocalStorage('spearhead_tournaments', []);
  const [groupTournaments, setGroupTournaments] = useState([]);
  const [activeTournament, setActiveTournament] = useState(null);
  // Context set when a tournament pairing launches a game
  const [tournamentContext, setTournamentContext] = useState(null);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // ── Group games fetch ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function fetchGroupGames() {
      if (!user || !activeGroup?.id) { setGroupGames([]); return; }
      setSyncing(true);
      try {
        const q = query(collection(db, 'groups', activeGroup.id, 'games'), orderBy('date', 'desc'));
        const snap = await getDocs(q);
        if (!cancelled) setGroupGames(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
      } catch { /* offline */ } finally {
        if (!cancelled) setSyncing(false);
      }
    }
    fetchGroupGames();
    return () => { cancelled = true; };
  }, [user, activeGroup?.id]);

  // ── User games fetch ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function fetchUserGames() {
      if (!user) { setUserGames([]); return; }
      setUserSyncing(true);
      try {
        const q = query(collection(db, 'users', user.uid, 'games'), orderBy('date', 'desc'));
        const snap = await getDocs(q);
        if (!cancelled) setUserGames(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
      } catch { /* offline */ } finally {
        if (!cancelled) setUserSyncing(false);
      }
    }
    fetchUserGames();
    return () => { cancelled = true; };
  }, [user]);

  // ── Group tournaments live listener ──────────────────────────────────────────
  useEffect(() => {
    if (!user || !activeGroup?.id) { setGroupTournaments([]); return; }
    const q = query(
      collection(db, 'groups', activeGroup.id, 'tournaments'),
      orderBy('createdAt', 'desc'),
    );
    const unsub = onSnapshot(q, (snap) => {
      setGroupTournaments(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
      // Keep activeTournament in sync if we're viewing one
      setActiveTournament((prev) => {
        if (!prev) return prev;
        const updated = snap.docs.find((d) => d.id === prev.id);
        return updated ? { ...updated.data(), id: updated.id } : prev;
      });
    }, () => { /* offline */ });
    return unsub;
  }, [user, activeGroup?.id]);

  // ── Game handlers ────────────────────────────────────────────────────────────
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
        if (!next[player.name]) next[player.name] = { wins: 0, losses: 0, draws: 0 };
        if (winner === 'draw') next[player.name].draws += 1;
        else if (winner === key) next[player.name].wins += 1;
        else next[player.name].losses += 1;
      }
      return next;
    });

    // If this game came from a tournament pairing, write the result back
    if (tournamentContext) {
      const { roundIndex, pairingId } = tournamentContext;
      const updated = applyPairingResult(activeTournament, roundIndex, pairingId, {
        winner: result.winner,
        player1Score: result.player1.total,
        player2Score: result.player2.total,
      });
      saveTournament(updated);
      setTournamentContext(null);
      setSetup(null);
      setResult(null);
      setScreen(SCREENS.TOURNAMENT);
      return;
    }

    setSetup(null);
    setResult(null);
    setScreen(SCREENS.HOME);

    if (user) {
      const firestoreGame = {
        ...newGame,
        recordedBy: user.uid,
        recordedByName: user.displayName ?? '',
        createdAt: serverTimestamp(),
      };
      setDoc(doc(db, 'users', user.uid, 'games', String(id)), firestoreGame)
        .then(() => setUserGames((prev) => [newGame, ...prev.filter((g) => String(g.id) !== String(id))]))
        .catch((err) => console.warn('Failed to sync game to user account:', err));

      if (activeGroup?.id) {
        addDoc(collection(db, 'groups', activeGroup.id, 'games'), firestoreGame)
          .then((docRef) => setGroupGames((prev) => [{ ...newGame, id: docRef.id }, ...prev]))
          .catch((err) => console.warn('Failed to sync game to group:', err));
      }
    }
  }

  function handleDiscard() {
    const returnScreen = tournamentContext ? SCREENS.TOURNAMENT : SCREENS.HOME;
    setTournamentContext(null);
    setSetup(null);
    setResult(null);
    setScreen(returnScreen);
  }

  function handleClearAll() { setGames([]); setRecords({}); }

  // ── Tournament persistence helpers ───────────────────────────────────────────
  async function saveTournament(tournament) {
    setActiveTournament(tournament);
    if (user && activeGroup?.id) {
      try {
        await setDoc(
          doc(db, 'groups', activeGroup.id, 'tournaments', tournament.id),
          { ...tournament, updatedAt: serverTimestamp() },
        );
      } catch (err) {
        console.warn('Failed to sync tournament:', err);
      }
    } else {
      setLocalTournaments((prev) =>
        prev.map((t) => t.id === tournament.id ? tournament : t)
      );
    }
  }

  // ── Tournament handlers ──────────────────────────────────────────────────────
  async function handleCreateTournament(name) {
    const id = String(Date.now());
    const tournament = {
      id,
      name,
      status: 'registration',
      totalRounds: calcRounds(8), // always 4
      currentRound: 0,
      players: [],
      rounds: [],
      createdBy: user?.uid ?? 'local',
      groupId: activeGroup?.id ?? null,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    if (user && activeGroup?.id) {
      const docRef = await addDoc(
        collection(db, 'groups', activeGroup.id, 'tournaments'),
        { ...tournament, createdAt: serverTimestamp() },
      );
      tournament.id = docRef.id;
    } else {
      setLocalTournaments((prev) => [tournament, ...prev]);
    }

    setActiveTournament(tournament);
    setScreen(SCREENS.TOURNAMENT);
  }

  async function handleJoinTournament(factionData) {
    if (!user) return;
    setJoining(true);
    try {
      const player = {
        uid: user.uid,
        displayName: user.displayName ?? user.email ?? 'Unknown',
        faction: factionData.faction,
        spearhead: factionData.spearhead,
        alliance: factionData.alliance,
        joinedAt: new Date().toISOString(),
      };
      const updated = {
        ...activeTournament,
        players: [...activeTournament.players.filter((p) => p.uid !== user.uid), player],
      };
      await saveTournament(updated);
    } finally {
      setJoining(false);
    }
  }

  async function handleLeaveTournament() {
    if (!user) return;
    setLeaving(true);
    try {
      const updated = {
        ...activeTournament,
        players: activeTournament.players.filter((p) => p.uid !== user.uid),
      };
      await saveTournament(updated);
    } finally {
      setLeaving(false);
    }
  }

  async function handleDeleteTournament() {
    const id = activeTournament.id;
    if (user && activeGroup?.id) {
      try {
        await deleteDoc(doc(db, 'groups', activeGroup.id, 'tournaments', id));
      } catch (err) {
        console.warn('Failed to delete tournament from Firestore:', err);
      }
    } else {
      setLocalTournaments((prev) => prev.filter((t) => t.id !== id));
    }
    setActiveTournament(null);
    setScreen(SCREENS.TOURNAMENT_LIST);
  }

  async function handleAddTestPlayers() {
    const existing = new Set(activeTournament.players.map((p) => p.uid));
    const bots = [
      { uid: 'test_bot_1', displayName: 'Test Player 2', faction: 'Unknown', spearhead: '', alliance: 'Unknown' },
      { uid: 'test_bot_2', displayName: 'Test Player 3', faction: 'Unknown', spearhead: '', alliance: 'Unknown' },
      { uid: 'test_bot_3', displayName: 'Test Player 4', faction: 'Unknown', spearhead: '', alliance: 'Unknown' },
    ].filter((b) => !existing.has(b.uid));
    const needed = Math.max(0, 4 - activeTournament.players.length);
    const toAdd = bots.slice(0, needed).map((b) => ({ ...b, joinedAt: new Date().toISOString() }));
    if (toAdd.length === 0) return;
    await saveTournament({ ...activeTournament, players: [...activeTournament.players, ...toAdd] });
  }

  async function handleStartTournament() {
    const started = startTournamentUtil(activeTournament);
    await saveTournament(started);
  }

  async function handleAdvanceRound() {
    const advanced = advanceRoundUtil(activeTournament);
    await saveTournament(advanced);
  }

  function handlePlayGame(pairing, p1, p2) {
    const roundIndex = activeTournament.currentRound - 1;
    setTournamentContext({ tournamentId: activeTournament.id, roundIndex, pairingId: pairing.id });
    setSetup({
      player1: { name: p1.displayName, faction: p1.faction, spearhead: p1.spearhead, alliance: p1.alliance },
      player2: { name: p2.displayName, faction: p2.faction, spearhead: p2.spearhead, alliance: p2.alliance },
      realmSet: null,
      realmLabel: null,
      map: null,
      fromTournament: true,
    });
    setScreen(SCREENS.SETUP);
  }

  const tournaments = user && activeGroup?.id ? groupTournaments : localTournaments;

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
          onTournaments={() => setScreen(SCREENS.TOURNAMENT_LIST)}
          activeGroup={activeGroup}
          syncing={syncing}
        />
      )}
      {screen === SCREENS.SETUP && (
        <GameSetupScreen
          onStart={handleStartGame}
          onBack={() => {
            if (tournamentContext) {
              setTournamentContext(null);
              setScreen(SCREENS.TOURNAMENT);
            } else {
              setScreen(SCREENS.HOME);
            }
          }}
          knownPlayers={Object.keys(records)}
          tournamentSetup={setup?.fromTournament ? setup : null}
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
          fromTournament={!!tournamentContext}
        />
      )}
      {screen === SCREENS.RECORDS && (
        <RecordsScreen
          records={records}
          games={games}
          userGames={userGames}
          userSyncing={userSyncing}
          groupGames={groupGames}
          activeGroup={activeGroup}
          user={user}
          onClearAll={handleClearAll}
          onBack={() => setScreen(SCREENS.HOME)}
        />
      )}
      {screen === SCREENS.GROUP && user && (
        <GroupScreen
          user={user}
          activeGroup={activeGroup}
          onGroupChange={setActiveGroup}
          onBack={() => setScreen(SCREENS.HOME)}
        />
      )}
      {screen === SCREENS.FEEDBACK && (
        <FeedbackScreen user={user} onBack={() => setScreen(SCREENS.HOME)} />
      )}
      {screen === SCREENS.TOURNAMENT_LIST && (
        <TournamentListScreen
          tournaments={tournaments}
          onSelect={(t) => { setActiveTournament(t); setScreen(SCREENS.TOURNAMENT); }}
          onNew={() => setScreen(SCREENS.TOURNAMENT_SETUP)}
          onHowTo={() => setScreen(SCREENS.TOURNAMENT_HOWTO)}
          onBack={() => setScreen(SCREENS.HOME)}
          activeGroup={activeGroup}
          user={user}
        />
      )}
      {screen === SCREENS.TOURNAMENT_SETUP && (
        <TournamentSetupScreen
          onBack={() => setScreen(SCREENS.TOURNAMENT_LIST)}
          onCreate={handleCreateTournament}
        />
      )}
      {screen === SCREENS.TOURNAMENT && activeTournament && (
        <TournamentScreen
          tournament={activeTournament}
          user={user}
          onBack={() => setScreen(SCREENS.TOURNAMENT_LIST)}
          onJoin={handleJoinTournament}
          onLeave={handleLeaveTournament}
          onStart={handleStartTournament}
          onAddTestPlayers={handleAddTestPlayers}
          onPlayGame={handlePlayGame}
          onAdvanceRound={handleAdvanceRound}
          onDelete={handleDeleteTournament}
          joining={joining}
          leaving={leaving}
        />
      )}
      {screen === SCREENS.TOURNAMENT_HOWTO && (
        <TournamentHowToScreen onBack={() => setScreen(SCREENS.TOURNAMENT_LIST)} />
      )}
    </div>
  );
}
