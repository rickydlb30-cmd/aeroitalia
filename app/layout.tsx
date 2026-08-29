import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Boeing 737 EU Fleet Tracker',
  description: 'Real-time tracking of Boeing 737 NG and MAX aircraft operating over European airspace',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0a] text-[#e5e5e5] antialiased">
        {children}
      </body>
    </html>
  );
}
