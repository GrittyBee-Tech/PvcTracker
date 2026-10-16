import Connect from "@/components/landing-page/connect";
import Faq from "@/components/landing-page/faq";
import LandingPage from "@/components/landing-page/home";
import Objective from "@/components/landing-page/objective";
import Partners from "@/components/landing-page/partners";

export default function Home() {
  return (
    <>
      <LandingPage />
      <Objective />
      <Partners />
      <Connect />
      <Faq />
    </>
  );
}
