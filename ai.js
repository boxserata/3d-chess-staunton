const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

function evaluateBoard(chess) {
  let total = 0;
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const centerBonus = (3.5 - Math.abs(3.5 - c)) * 4 + (3.5 - Math.abs(3.5 - r)) * 4;
      const val = PIECE_VALUES[p.type] + centerBonus;
      total += p.color === 'b' ? val : -val;
    }
  }
  return total;
}

function minimax(chess, depth, alpha, beta, maximizing) {
  if (depth === 0 || chess.game_over()) {
    if (chess.in_checkmate()) return maximizing ? -99999 : 99999;
    return evaluateBoard(chess);
  }
  const moves = chess.moves({ verbose: true });
  if (maximizing) {
    let best = -Infinity;
    for (const m of moves) {
      chess.move(m);
      best = Math.max(best, minimax(chess, depth - 1, alpha, beta, false));
      chess.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      chess.move(m);
      best = Math.min(best, minimax(chess, depth - 1, alpha, beta, true));
      chess.undo();
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

window.chooseBestMove = function (chess, depth = 2) {
  const moves = chess.moves({ verbose: true });
  let bestMove = moves[0], bestVal = -Infinity;
  for (const m of moves) {
    chess.move(m);
    const val = minimax(chess, depth - 1, -Infinity, Infinity, false) + Math.random() * 2;
    chess.undo();
    if (val > bestVal) { bestVal = val; bestMove = m; }
  }
  return bestMove;
};

window.playChessSound = function (isCapture) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isCapture ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isCapture ? 220 : 340, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.09);
  } catch (_) {}
};
