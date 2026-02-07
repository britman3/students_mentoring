import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PKH Mentoring - Slot Selection",
  description: "Property Know How mentoring group slot selection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
