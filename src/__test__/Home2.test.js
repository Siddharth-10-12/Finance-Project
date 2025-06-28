import React from 'react';
import { render, screen } from '@testing-library/react';
import Home2 from '../src/components/Home2';

test('renders Home2 component', () => {
  render(<Home2 />);
  const linkElement = screen.getByText(/Home2/i);
  expect(linkElement).toBeInTheDocument();
});