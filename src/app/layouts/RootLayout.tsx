import { Outlet, useLocation } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function RootLayout() {
  const location = useLocation();
  
  // Pages that don't need navbar/footer
  const noLayoutPages = ['/security/scanner'];
  const hideLayout = noLayoutPages.includes(location.pathname);

  if (hideLayout) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
