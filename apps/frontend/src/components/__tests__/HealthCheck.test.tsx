import { render, screen, waitFor } from '@testing-library/react';
import { HealthCheck } from '../HealthCheck';
import { vi, describe, it, expect } from 'vitest';
import * as api from '../../lib/api';

// Mock the API module
vi.mock('../../lib/api', () => ({
  fetchHealthStatus: vi.fn(),
}));

describe('HealthCheck Component', () => {
  it('renders checking status initially', () => {
    (api.fetchHealthStatus as any).mockReturnValue(new Promise(() => {}));
    render(<HealthCheck />);
    expect(screen.getByText(/Verificando API.../i)).toBeInTheDocument();
  });

  it('renders success message when API is healthy', async () => {
    (api.fetchHealthStatus as any).mockResolvedValue({ message: 'API Online' });
    render(<HealthCheck />);
    
    await waitFor(() => {
      expect(screen.getByText(/API Online/i)).toBeInTheDocument();
    });
  });

  it('renders error message when API fails', async () => {
    (api.fetchHealthStatus as any).mockRejectedValue(new Error('Fail'));
    render(<HealthCheck />);
    
    await waitFor(() => {
      expect(screen.getByText(/Erro ao conectar com API/i)).toBeInTheDocument();
    });
  });
});
