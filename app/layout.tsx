import type { Metadata } from 'next';
import { IBM_Plex_Mono, Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';
import { Toaster } from 'sonner';

import '@/app/globals.css';
import { BillingProvider } from '@/contexts/billing-context';
import { ConfirmationProvider } from '@/contexts/confirmation-context';
import { ModalProvider } from '@/contexts/modal-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { AuthProvider } from '@/infra/auth-context';

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
});

const plexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'VetAI - Veterinary AI Assistant',
  description:
    'Plataforma veterinária com inteligência artificial para diagnósticos, análise de exames e monitoramento de pacientes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='pt-br' suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${spaceGrotesk.variable} ${plexMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            <BillingProvider>
              <ModalProvider>
                <ConfirmationProvider>{children}</ConfirmationProvider>
              </ModalProvider>
            </BillingProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster position='top-right' richColors />
      </body>
    </html>
  );
}
