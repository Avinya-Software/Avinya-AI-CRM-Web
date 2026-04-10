const storagePrefix = 'avinyaAiCRM_';

export const isValidJSON = (value: string | null): boolean => {
  if (!value) return false;
  try { JSON.parse(value); return true; }
  catch { return false; }
};

export const storage = {
  getToken: (): string => {
    const raw = localStorage.getItem(`${storagePrefix}token`);
    return isValidJSON(raw) ? JSON.parse(raw!) : (raw ?? '');
  },
  setToken: (t: string): void => localStorage.setItem(`${storagePrefix}token`, t),
  clearToken: (): void => localStorage.removeItem(`${storagePrefix}token`),

  getUserId: (): string | null => localStorage.getItem(`${storagePrefix}userId`),
  setUserId: (v: string): void => localStorage.setItem(`${storagePrefix}userId`, v),
  clearUserId: (): void => localStorage.removeItem(`${storagePrefix}userId`),
};
