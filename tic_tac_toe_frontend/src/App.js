import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Ocean Professional theme data used across components.
 */
const theme = {
  name: 'Ocean Professional',
  colors: {
    primary: '#2563EB',
    secondary: '#F59E0B',
    success: '#F59E0B',
    error: '#EF4444',
    background: '#f9fafb',
    surface: '#ffffff',
    text: '#111827',
  },
};

// Helpers
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],            // diagonals
];

function calculateWinner(squares) {
  for (const [a, b, c] of WIN_LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], line: [a, b, c] };
    }
  }
  return null;
}

function isBoardFull(squares) {
  return squares.every(Boolean);
}

// PUBLIC_INTERFACE
export default function App() {
  /**
   * The main application container implementing a themed two-player Tic Tac Toe game.
   * - Local two-player on the same device.
   * - Shows status, current player, and history.
   * - Ocean Professional theme and modern UI elements.
   */
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [step, setStep] = useState(0);
  const [prefersDark, setPrefersDark] = useState(false);

  const winnerInfo = useMemo(() => calculateWinner(squares), [squares]);
  const winner = winnerInfo?.player ?? null;
  const draw = !winner && isBoardFull(squares);
  const nextPlayer = xIsNext ? 'X' : 'O';

  // Apply body background based on theme
  useEffect(() => {
    document.body.style.background = theme.colors.background;
    document.body.style.color = theme.colors.text;
  }, []);

  // Track system preference for optional dark header tone
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setPrefersDark(!!media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  function handleSquareClick(index) {
    if (squares[index] || winner) return; // ignore if taken or finished
    const next = squares.slice();
    next[index] = xIsNext ? 'X' : 'O';
    setSquares(next);
    setXIsNext(!xIsNext);

    const newHistory = history.slice(0, step + 1);
    setHistory([...newHistory, next]);
    setStep(step + 1);
  }

  function jumpTo(moveIndex) {
    const snapshot = history[moveIndex];
    setSquares(snapshot);
    setStep(moveIndex);
    // X starts first; if moveIndex is even, it's X's turn next
    setXIsNext(moveIndex % 2 === 0);
  }

  // PUBLIC_INTERFACE
  function resetGame() {
    /**
     * Reset the game board, history, and step to initial state.
     */
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setHistory([Array(9).fill(null)]);
    setStep(0);
  }

  // PUBLIC_INTERFACE
  function undoMove() {
    /**
     * Undo the last move if possible.
     */
    if (step === 0) return;
    jumpTo(step - 1);
  }

  const statusText = winner
    ? `Winner: ${winner}`
    : draw
    ? 'Draw'
    : `Next player: ${nextPlayer}`;

  return (
    <div className="ocean-app">
      <Header prefersDark={prefersDark} />
      <main className="container">
        <Card>
          <h1 className="title">Tic Tac Toe</h1>
          <p className={`status ${winner ? 'status-win' : draw ? 'status-draw' : ''}`}>
            {statusText}
          </p>

          <div className="board-wrapper">
            <Board
              squares={squares}
              onClick={handleSquareClick}
              highlightLine={winnerInfo?.line ?? []}
            />
          </div>

          <div className="controls">
            <button className="btn primary" onClick={resetGame} aria-label="Reset game">
              ⟲ Reset
            </button>
            <button
              className="btn secondary"
              onClick={undoMove}
              disabled={step === 0 || !!winner}
              aria-label="Undo last move"
            >
              ↶ Undo
            </button>
          </div>

          <History
            history={history}
            onJumpTo={jumpTo}
            currentStep={step}
          />
        </Card>
      </main>

      <Footer />
    </div>
  );
}

function Header({ prefersDark }) {
  return (
    <header
      className="header"
      style={{
        background: prefersDark
          ? 'linear-gradient(180deg, rgba(17,24,39,0.85), rgba(17,24,39,0.4))'
          : 'linear-gradient(180deg, rgba(37,99,235,0.08), rgba(249,250,251,0))',
        borderBottom: '1px solid rgba(17,24,39,0.06)',
      }}
    >
      <div className="header-inner">
        <div className="brand">
          <span className="brand-mark" />
          <span className="brand-name">Ocean Play</span>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <p className="footer-text">
        Built with
        <span className="dot" /> Ocean Professional theme
      </p>
    </footer>
  );
}

function Card({ children }) {
  return <section className="card">{children}</section>;
}

function Board({ squares, onClick, highlightLine }) {
  return (
    <div className="board" role="grid" aria-label="Tic Tac Toe board">
      {squares.map((value, idx) => {
        const highlighted = highlightLine.includes(idx);
        return (
          <Square
            key={idx}
            value={value}
            onClick={() => onClick(idx)}
            highlighted={highlighted}
            ariaLabel={`Cell ${idx + 1} ${value ? `occupied by ${value === 'X' ? 'knight' : 'queen'}` : 'empty'}`}
          />
        );
      })}
    </div>
  );
}

function Square({ value, onClick, highlighted, ariaLabel }) {
  const classes = ['square'];
  if (highlighted) classes.push('highlighted');
  return (
    <button
      type="button"
      className={classes.join(' ')}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <span
        className={`piece ${value === 'X' ? 'x' : value === 'O' ? 'o' : 'empty'}`}
        aria-hidden="true"
      >
        {value === 'X' ? '♘' : value === 'O' ? '♛' : ''}
      </span>
    </button>
  );
}

function History({ history, onJumpTo, currentStep }) {
  return (
    <div className="history">
      <h2 className="subtitle">Moves</h2>
      <div className="history-list" role="list">
        {history.map((_, move) => {
          const label = move === 0 ? 'Go to start' : `Go to move #${move}`;
          const isCurrent = move === currentStep;
          return (
            <button
              key={move}
              onClick={() => onJumpTo(move)}
              className={`history-item ${isCurrent ? 'current' : ''}`}
              aria-current={isCurrent ? 'true' : 'false'}
            >
              {isCurrent ? '• ' : ''}{label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
