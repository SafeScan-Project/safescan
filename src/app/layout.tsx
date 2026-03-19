
// Root layout for the application, includes global styles, header, and providers
import './globals.css';
import Header from '../components/Header';
import Providers from '../components/Providers';


// Metadata for the app (used by Next.js)
export const metadata = {
  title: 'SafeScan',
  description: 'A beginner-friendly web security scanner',
};


// Main layout component
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="app-html">
      <body className="app-body min-h-screen bg-gray-50 text-gray-900">
        {/* Provide session and global context */}
        <Providers>
          {/* App header */}
          <Header />
          {/* Main content area */}
          <main className="app-main p-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}

