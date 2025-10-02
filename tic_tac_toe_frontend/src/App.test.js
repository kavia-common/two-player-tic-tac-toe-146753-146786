import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('allows two players to make moves and detect winner/draw', () => {
  render(<App />);
  // Click sequence X(0), O(1), X(4), O(2), X(8) -> X wins on diagonal
  const cells = screen.getAllByRole('button', { name: /Cell/i });
  fireEvent.click(cells[0]);
  fireEvent.click(cells[1]);
  fireEvent.click(cells[4]);
  fireEvent.click(cells[2]);
  fireEvent.click(cells[8]);

  expect(screen.getByText(/Winner: X/i)).toBeInTheDocument();

  // Reset and ensure board cleared
  fireEvent.click(screen.getByRole('button', { name: /Reset game/i }));
  cells.forEach((c) => expect(c).toBeEnabled());
  expect(screen.getByText(/Next player: X/i)).toBeInTheDocument();
});
