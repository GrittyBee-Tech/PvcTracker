import Footer from "@/components/footer/footer";
import Navbar from "@/components/navbar/navbar";

export default function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <div className="hero-grid"></div>
      <div className="hero-bg"></div>
      <div className="">
        <Navbar />
        {children}
        <Footer />
      </div>
    </div>
  );
}
