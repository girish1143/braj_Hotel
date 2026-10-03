import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Brijnidhi — Braj Hotel & Stay Platform | Mathura, Vrindavan, Barsana, Govardhan',
  description: 'Dedicated spiritual hotel and dharamshala booking platform for Braj Bhumi pilgrimage. Stay close to Banke Bihari, Krishna Janmasthan, Radha Rani, and Govardhan Parikrama.',
  keywords: ['Brijnidhi', 'Vrindavan hotels', 'Mathura hotels', 'Banke Bihari stay', 'Govardhan Parikrama dharamshala', 'Barsana stays', 'Radha Rani temple', 'Satvik food hotels'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#fffaf0] text-neutral-900 antialiased selection:bg-amber-200 selection:text-amber-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
