const storagePrefix = 'avinyaAiCRM_';

export const getToken = (): string | null => {
  return localStorage.getItem(`${storagePrefix}token`);
};

export const saveToken = (token: string): void => {
  localStorage.setItem(`${storagePrefix}token`, token);
};

export const clearToken = (): void => {
  localStorage.removeItem(`${storagePrefix}token`);
};
