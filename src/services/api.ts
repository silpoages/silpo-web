const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = `Request to ${path} failed with status ${response.status}`;
    try {
      const body: unknown = await response.json();
      if (typeof body === 'object' && body !== null && 'detail' in body) {
        if (typeof body.detail === 'string') {
          message = body.detail;
        } else if (Array.isArray(body.detail)) {
          const validationMessages = body.detail.flatMap((issue: unknown) => {
            if (
              typeof issue !== 'object' ||
              issue === null ||
              !('msg' in issue) ||
              typeof issue.msg !== 'string'
            ) {
              return [];
            }
            const location =
              'loc' in issue && Array.isArray(issue.loc)
                ? issue.loc.filter((part): part is string => typeof part === 'string').at(-1)
                : undefined;
            return [location ? `${location}: ${issue.msg}` : issue.msg];
          });
          if (validationMessages.length > 0) {
            message = validationMessages.join('; ');
          }
        }
      }
    } catch {
      // Keep the status-based message when the server does not return JSON.
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
