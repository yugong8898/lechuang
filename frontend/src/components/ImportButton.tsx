'use client';
import React, { useState, useCallback } from 'react';
import { importCsvFile } from '@/lib/api';

interface Props {
  onSuccess?: () => void;
}

export default function ImportButton({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await importCsvFile(file);
      setResult(`导入完成：共 ${res.total} 条，新增 ${res.inserted} 条，更新 ${res.skipped} 条`);
      onSuccess?.();
    } catch (err: any) {
      setResult(`导入失败：${err?.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  }, [onSuccess]);

  return (
    <div className="flex items-center gap-3">
      <label className="cursor-pointer">
        <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              导入中...
            </>
          ) : '导入 CSV'}
        </span>
        <input type="file" accept=".csv" className="hidden" onChange={handleFile} disabled={loading} />
      </label>
      {result && (
        <span className={`text-xs ${result.includes('失败') ? 'text-red-400' : 'text-green-400'}`}>
          {result}
        </span>
      )}
    </div>
  );
}
