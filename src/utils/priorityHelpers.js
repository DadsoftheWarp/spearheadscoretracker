// Handle both old string format and new { winner, firstTurn } object format for priority entries.
export function resolveEntry(p) {
  if (!p) return { winner: null, firstTurn: null };
  if (typeof p === 'string') return { winner: p, firstTurn: p };
  return { winner: p.winner ?? null, firstTurn: p.firstTurn ?? null };
}

export function getPriorityWinner(p) {
  return resolveEntry(p).winner;
}

export function getFirstTurnPlayer(p) {
  return resolveEntry(p).firstTurn;
}
