import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom';
import Home from '../Home';

// Mock only useLocation and useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Use the actual implementation for everything except the hooks
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

describe('Home Component', () => {
  const mockNavigate = jest.fn();
  const mockLocation = { state: { userName: 'Test User' } };

  beforeEach(() => {
    useLocation.mockReturnValue(mockLocation);
    useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders welcome message with user name', () => {
    render(
      <Router>
        <Home />
      </Router>
    );

    const welcomeMessage = screen.getByText(/Welcome, Test User/i);
    expect(welcomeMessage).toBeInTheDocument();
  });

  test('toggles dark mode on button click', () => {
    render(
      <Router>
        <Home />
      </Router>
    );

    const darkModeButton = screen.getByRole('button', { name: /dark mode/i });
    fireEvent.click(darkModeButton);

    expect(document.body).toHaveClass('dark-mode');
  });

  test('navigates to subscription page on button click', () => {
    render(
      <Router>
        <Home />
      </Router>
    );

    const subscriptionButton = screen.getByRole('button', { name: /start subscription/i });
    fireEvent.click(subscriptionButton);

    expect(mockNavigate).toHaveBeenCalledWith('/Sub');
  });

  test('navigates to bank page on feature card click', () => {
    render(
      <Router>
        <Home />
      </Router>
    );

    const bankCard = screen.getByText(/Bank & Loan Recommendation/i);
    fireEvent.click(bankCard);

    expect(mockNavigate).toHaveBeenCalledWith('/bank');
  });

  test('logs out the user on logout button click', async () => {
    render(
      <Router>
        <Home />
      </Router>
    );

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});