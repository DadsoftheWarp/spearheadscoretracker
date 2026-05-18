export function calcRounds(playerCount) {
  return Math.max(4, Math.ceil(Math.log2(playerCount)));
}

export function calcStandings(tournament) {
  const stats = {};
  for (const p of tournament.players) {
    stats[p.uid] = {
      uid: p.uid,
      displayName: p.displayName,
      faction: p.faction,
      spearhead: p.spearhead,
      alliance: p.alliance,
      wins: 0, losses: 0, draws: 0,
      tournamentPoints: 0,
      totalVP: 0,
      byeCount: 0,
    };
  }

  for (const round of tournament.rounds) {
    if (round.byePlayerId && stats[round.byePlayerId]) {
      stats[round.byePlayerId].wins += 1;
      stats[round.byePlayerId].tournamentPoints += 3;
      stats[round.byePlayerId].byeCount += 1;
    }
    for (const pairing of round.pairings) {
      if (pairing.status !== 'complete' && pairing.status !== 'forfeit') continue;
      const { winner, player1Score = 0, player2Score = 0 } = pairing.result;
      if (!stats[pairing.player1Uid] || !stats[pairing.player2Uid]) continue;
      stats[pairing.player1Uid].totalVP += player1Score;
      stats[pairing.player2Uid].totalVP += player2Score;
      if (winner === 'player1') {
        stats[pairing.player1Uid].wins += 1;
        stats[pairing.player1Uid].tournamentPoints += 3;
        stats[pairing.player2Uid].losses += 1;
      } else if (winner === 'player2') {
        stats[pairing.player2Uid].wins += 1;
        stats[pairing.player2Uid].tournamentPoints += 3;
        stats[pairing.player1Uid].losses += 1;
      } else if (winner === 'draw') {
        stats[pairing.player1Uid].draws += 1;
        stats[pairing.player1Uid].tournamentPoints += 1;
        stats[pairing.player2Uid].draws += 1;
        stats[pairing.player2Uid].tournamentPoints += 1;
      } else {
        // forfeit — both take a loss, no VP
        stats[pairing.player1Uid].losses += 1;
        stats[pairing.player2Uid].losses += 1;
      }
    }
  }

  return Object.values(stats).sort((a, b) => {
    if (b.tournamentPoints !== a.tournamentPoints) return b.tournamentPoints - a.tournamentPoints;
    return b.totalVP - a.totalVP;
  });
}

export function generatePairings(players, completedRounds) {
  const standings = calcStandings({ players, rounds: completedRounds });

  const byeHistory = new Set(
    completedRounds.filter((r) => r.byePlayerId).map((r) => r.byePlayerId)
  );
  const matchups = new Set();
  for (const round of completedRounds) {
    for (const p of round.pairings) {
      matchups.add([p.player1Uid, p.player2Uid].sort().join('|'));
    }
  }

  let eligible = [...standings];
  let byePlayerId = null;

  if (eligible.length % 2 !== 0) {
    // Give bye to lowest-ranked player who hasn't had one yet
    let byeIdx = -1;
    for (let i = eligible.length - 1; i >= 0; i--) {
      if (!byeHistory.has(eligible[i].uid)) { byeIdx = i; break; }
    }
    // Fallback: everyone's had a bye, take the lowest
    if (byeIdx === -1) byeIdx = eligible.length - 1;
    byePlayerId = eligible[byeIdx].uid;
    eligible.splice(byeIdx, 1);
  }

  const pairings = [];
  const used = new Set();
  const ts = Date.now();

  for (let i = 0; i < eligible.length; i++) {
    if (used.has(eligible[i].uid)) continue;
    let found = false;
    // Prefer pairing with adjacent player, avoid rematches
    for (let j = i + 1; j < eligible.length; j++) {
      if (used.has(eligible[j].uid)) continue;
      const key = [eligible[i].uid, eligible[j].uid].sort().join('|');
      if (!matchups.has(key)) {
        pairings.push(makePairing(ts, i, eligible[i].uid, eligible[j].uid));
        used.add(eligible[i].uid);
        used.add(eligible[j].uid);
        found = true;
        break;
      }
    }
    // Couldn't avoid rematch — pair with next available
    if (!found) {
      for (let j = i + 1; j < eligible.length; j++) {
        if (used.has(eligible[j].uid)) continue;
        pairings.push(makePairing(ts, i, eligible[i].uid, eligible[j].uid));
        used.add(eligible[i].uid);
        used.add(eligible[j].uid);
        break;
      }
    }
  }

  return { pairings, byePlayerId };
}

function makePairing(ts, idx, p1Uid, p2Uid) {
  return {
    id: `${ts}_${idx}`,
    player1Uid: p1Uid,
    player2Uid: p2Uid,
    status: 'pending',
    result: { winner: null, player1Score: 0, player2Score: 0 },
  };
}

export function applyPairingResult(tournament, roundIndex, pairingId, result) {
  const rounds = tournament.rounds.map((round, ri) => {
    if (ri !== roundIndex) return round;
    return {
      ...round,
      pairings: round.pairings.map((p) =>
        p.id === pairingId ? { ...p, status: 'complete', result } : p
      ),
    };
  });
  return { ...tournament, rounds };
}

export function advanceRound(tournament) {
  // Mark all pending pairings in current round as forfeit
  const roundIndex = tournament.currentRound - 1;
  const rounds = tournament.rounds.map((round, ri) => {
    if (ri !== roundIndex) return round;
    return {
      ...round,
      pairings: round.pairings.map((p) =>
        p.status === 'pending'
          ? { ...p, status: 'forfeit', result: { winner: null, player1Score: 0, player2Score: 0 } }
          : p
      ),
    };
  });

  const nextRound = tournament.currentRound + 1;
  const isComplete = nextRound > tournament.totalRounds;

  if (isComplete) {
    return { ...tournament, rounds, status: 'complete' };
  }

  const { pairings, byePlayerId } = generatePairings(tournament.players, rounds);
  const newRound = {
    roundNumber: nextRound,
    byePlayerId: byePlayerId ?? null,
    pairings,
  };

  return {
    ...tournament,
    rounds: [...rounds, newRound],
    currentRound: nextRound,
    status: 'active',
  };
}

export function startTournament(tournament) {
  const { pairings, byePlayerId } = generatePairings(tournament.players, []);
  return {
    ...tournament,
    status: 'active',
    currentRound: 1,
    rounds: [{
      roundNumber: 1,
      byePlayerId: byePlayerId ?? null,
      pairings,
    }],
  };
}
