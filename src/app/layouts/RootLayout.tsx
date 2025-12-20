import { ReactNode } from 'react';

interface RootLayoutProps {
  children: ReactNode;
}

function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen bg-figma-bg overflow-hidden">{children}</div>
  );
}

export default RootLayout;

