'use client';
import dynamic from 'next/dynamic';

const DocumentEditor = dynamic(
  () => import('@/components/DocumentEditor'),
  { ssr: false }
);

export default function Home() {
  return <DocumentEditor />;
}