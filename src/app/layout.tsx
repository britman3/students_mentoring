import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PKH Mentoring",
  description: "PKH Mentoring Programme — Student Enrolment & Management",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
