import Footer from "@/components/footer/footer";
import Navbar from "@/components/navbar/navbar";

export default function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen border-b bg-linear-to-b from-accent/40 to-background ">
      <div className=""></div>
      <div className=""></div>
      <div className="">
        <Navbar />
        {children}
        <Footer />
      </div>
    </div>
  );
}
