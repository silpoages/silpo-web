import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('fails loudly outside the AuthProvider', () => {
    // O React registra o erro no console antes de repassá-lo.
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used inside AuthProvider');
  });
});
