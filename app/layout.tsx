import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Superdocs",
  description: "Just a really good document editor. Create and edit documents online. ",
  icons: {
    icon: '/favicon.ico',
  },
  themeColor: '#000000',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  openGraph: {
    title: "Superdocs",
    description: "Just a really good document editor. Create and edit documents online. ",
    images: [
      { url: '/og-image.png' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Superdocs",
    description: "Just a really good document editor. Create and edit documents online. ",
    images: [
      { url: '/og-image.png' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    noimageindex: true,
    'max-image-preview': 'standard',
    'max-video-preview': 0,
  },

};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
