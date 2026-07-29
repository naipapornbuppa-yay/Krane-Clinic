import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Krane Client Review",
  description: "Krane Clinic brand, patient, doctor and operations prototype for client review.",
  icons: {
    icon: "/assets/krane-clinic-logo-charcoal.svg",
    shortcut: "/assets/krane-clinic-logo-charcoal.svg",
  },
  openGraph: {
    title: "Krane Clinic Client Review",
    description: "ดูแลสุขภาพได้ในจังหวะของคุณ",
    siteName: "Krane Clinic",
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Krane Clinic Client Review",
    description: "ดูแลสุขภาพได้ในจังหวะของคุณ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
