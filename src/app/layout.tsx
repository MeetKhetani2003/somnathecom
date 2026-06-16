import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { StoreProvider } from '@/store';

export const metadata: Metadata = {
  title: 'Somnath NX',
  description: 'Premium e-commerce platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-bg text-ink flex flex-col">
        <StoreProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
