const storagePrefix = 'avinyaAiCRM_';

export const getToken = (): string | null => {
  return localStorage.getItem(`${storagePrefix}token`);
};

export const saveToken = (token: string): void => {
  localStorage.setItem(`${storagePrefix}token`, token);
};

export const saveUserId = (userId : string): void => {
  localStorage.setItem(`${storagePrefix}userId`, userId);
};

export const getUserId = (): string | null => {
  return localStorage.getItem(`${storagePrefix}userId`);
};

export const clearToken = (): void => {
  localStorage.removeItem(`${storagePrefix}token`);
};

export const clearUserId = (): void => {
  localStorage.removeItem(`${storagePrefix}userId`);
};

