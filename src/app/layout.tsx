import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stardew Wrapped",
  description: "Spotify Wrapped-style summary for your Stardew Valley save",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
