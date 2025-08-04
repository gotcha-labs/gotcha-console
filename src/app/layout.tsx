import type { Metadata } from "next";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Gotcha Dashboard",
  description: "Manage your applications and settings in the Gotcha Dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <UserProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground dark:bg-background dark:text-foreground`}
        >
          {children}
        </body>
      </UserProvider>
    </html>
  );
}
