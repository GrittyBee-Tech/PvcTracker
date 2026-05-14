import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap", // Prevents layout shift
  variable: "--font-playfair-display", // Useful for Tailwind
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap", // Prevents layout shift
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "PVC WAKA - Empowering Voters, Strengthening Democracy",
  description:
    "PVC WAKA is a platform dedicated to empowering Nigerian voters by providing easy access to information about Permanent Voter's Card (PVC) registration and collection. Our mission is to strengthen democracy by ensuring that every eligible voter can easily check their PVC status, find INEC centers, and track their registration progress online. Join us in our movement for electoral reform and make your voice heard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
