import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/components/theme';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://enfinotes.com'),
  title: "Enfinotes",
  description: "The all-in-one content creation workspace for modern creators.",
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: "Enfinotes",
    description: "The all-in-one content creation workspace for modern creators.",
    images: [
      { url: '/og-image.png' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Enfinotes",
    description: "The all-in-one content creation workspace for modern creators.",
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('enfinotes-theme');var r=document.documentElement;r.classList.remove('dark','light');r.classList.add(t==='light'?'light':'dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
