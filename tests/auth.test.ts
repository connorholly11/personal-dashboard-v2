import { renderHook } from '@testing-library/react-hooks';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/lib/firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
  },
}));

describe('useAuth hook', () => {
  it('should initialize with loading true and user null', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
    expect(result.current.isAdmin).toBe(false);
  });

  // Add more tests as needed
});