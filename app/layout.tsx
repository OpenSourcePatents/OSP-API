import { Metadata } from "next";

export const metadata: Metadata = {
  title: "OSP Civic Data API - Free Congressional Accountability Data",
  description:
    "Free REST API for congressional accountability data. Campaign finance, stock trades, voting records, travel disclosures, and legislation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
