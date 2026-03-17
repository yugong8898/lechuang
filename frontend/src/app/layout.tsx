import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '广告 ROI 数据分析系统',
  description: '多时间维度 ROI 趋势分析',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <body>{children}</body>
    </html>
  );
}
