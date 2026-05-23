import type { Metadata } from "next";
import { DM_Sans, Montserrat, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppSessionProvider } from "@/components/SessionProvider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap", // Prevents layout shift
  variable: "--font-dm-sans", // Useful for Tailwind
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap", // Prevents layout shift
  variable: "--font-space-grotesk  ", // Useful for Tailwind
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
  icons: [
    { rel: "icon", url: "/favicon.png" },
    { rel: "apple-touch-icon", url: "/favicon.png" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${montserrat.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="">
        <AppSessionProvider>{children}</AppSessionProvider>
      </body>
    </html>
  );
}
