// app/layout.tsx - 基础布局
import type { Metadata } from "next";
import './globals.css';
import 'leaflet/dist/leaflet.css';


export const metadata: Metadata = {
  title: "History in Art",
  description: "Art as eyes, witness history",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
