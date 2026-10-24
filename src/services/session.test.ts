import { afterEach, describe, expect, it } from 'vitest';
import { clearAccessToken, getAccessToken, setAccessToken } from './session';

describe('session', () => {
  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('keeps the token only for the tab without "Manter conectado"', () => {
    setAccessToken('tab-token');

    expect(sessionStorage.getItem('silpo.accessToken')).toBe('tab-token');
    expect(localStorage.getItem('silpo.accessToken')).toBeNull();
    expect(getAccessToken()).toBe('tab-token');
  });

  it('persists the token with "Manter conectado"', () => {
    setAccessToken('persistent-token', true);

    expect(localStorage.getItem('silpo.accessToken')).toBe('persistent-token');
    expect(sessionStorage.getItem('silpo.accessToken')).toBeNull();
    expect(getAccessToken()).toBe('persistent-token');
  });

  it('clears the token from both storages', () => {
    setAccessToken('persistent-token', true);
    sessionStorage.setItem('silpo.accessToken', 'tab-token');

    clearAccessToken();

    expect(getAccessToken()).toBeNull();
  });
});
