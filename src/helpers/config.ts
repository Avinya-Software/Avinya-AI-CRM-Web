import api from '../api/axios';

export const get = (url: string, params?: Record<string, any>) =>
  api.get(url, { params }).then(r => r.data);

export const post = (url: string, data?: any) =>
  api.post(url, data).then(r => r.data);

export const patch = (url: string, data?: any) =>
  api.patch(url, data).then(r => r.data);

export const put = (url: string, data?: any) =>
  api.put(url, data).then(r => r.data);

export const del = (url: string) =>
  api.delete(url).then(r => r.data);
