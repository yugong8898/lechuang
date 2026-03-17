import axios from 'axios';
import type { Filters, RoiRecord, FilterState } from '@/types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export async function fetchFilters(): Promise<Filters> {
  const { data } = await api.get<Filters>('/filters');
  return data;
}

export async function fetchRoiData(
  filters: Partial<FilterState> & { start?: string; end?: string }
): Promise<RoiRecord[]> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined)
  );
  const { data } = await api.get<{ data: RoiRecord[]; total: number }>('/roi', { params });
  return data.data;
}

export async function importCsvFile(file: File): Promise<{ inserted: number; skipped: number; total: number }> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post('/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return data;
}
