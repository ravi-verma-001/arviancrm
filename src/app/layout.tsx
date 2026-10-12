import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arvian Marketing CRM & Agency Management System",
  description: "Enterprise Digital Marketing CRM, Lead Pipeline, Meta Ads Tracker & Social Media Agency Suite",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 font-sans">{children}</body>
    </html>
  );
}
