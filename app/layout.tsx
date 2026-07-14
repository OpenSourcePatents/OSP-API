import { Metadata } from "next";
import "./globals.css";
import Chrome from "@/components/Chrome";

export const metadata: Metadata = {
  title: "OSP Civic Data API - Free Congressional Accountability Data",
  description:
    "Free REST API for congressional accountability data. Campaign finance, stock trades, voting records, travel disclosures, and legislation.",
  icons: { icon: "/favicon.ico" },
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
      </body>
    </html>
  );
}
