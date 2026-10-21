import { Metadata } from "next";
import "./globals.css";
import Chrome from "@/components/Chrome";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "OSP Civic Data API - Free Congressional Accountability Data",
  description:
    "Free REST API for congressional accountability data. Campaign finance, stock trades, voting records, travel disclosures, and legislation.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Chrome>{children}</Chrome>
        <Analytics />
      </body>
    </html>
  );
}
