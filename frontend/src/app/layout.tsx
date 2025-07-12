import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { NotificationProvider } from "@/components/ui/NotificationSystem";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";
import AuthLoadingWrapper from "@/components/AuthLoadingWrapper";
import RouterEventListener from "@/components/RouterEventListener";
import { LoadingPerformancePanel } from "@/components/LoadingPerformancePanel";
import ConditionalLayout from "@/components/ConditionalLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Holidays by Bells - Your Gateway to Amazing Travel Experiences",
  description: "Premium travel services crafted by Bells with 15+ years of expertise. Book flights, hotels, and activities with confidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LoadingProvider>
          <NotificationProvider>
            <AuthProvider>
              <RouterEventListener>
                <AuthLoadingWrapper>
                  <ConditionalLayout>
                    {children}
                  </ConditionalLayout>
                  <ScrollToTopButton />
                  <LoadingPerformancePanel />
                </AuthLoadingWrapper>
              </RouterEventListener>
            </AuthProvider>
          </NotificationProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
