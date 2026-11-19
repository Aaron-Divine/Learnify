import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { StudentAuthProvider } from '@/components/StudentAuthContext';
import { StudentAuthModal } from '@/components/StudentAuthModal';

export const metadata: Metadata = {
  title: 'Learnify | Online Learning Platform',
  description: 'Learn skills from world-class instructors. Multi-currency course marketplace with native pricing and secure wallet checkout.',
  icons: {
    icon: '/logo-dark.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var saved = localStorage.getItem('learnify-theme');
                if (saved === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.remove('light');
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            })();`,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider>
          <StudentAuthProvider>
            {children}
            <StudentAuthModal />
          </StudentAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
