const ACCESS_TOKEN_KEY = 'silpo.accessToken';

// "Manter conectado" guarda o token no localStorage (sobrevive ao fechar o navegador);
// sem ele, o token fica só no sessionStorage da aba.
function getStorage(isPersistent: boolean) {
  return isPersistent ? localStorage : sessionStorage;
}

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY) ?? localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(accessToken: string, isPersistent = false) {
  clearAccessToken();
  getStorage(isPersistent).setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function clearAccessToken() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}
