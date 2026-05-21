import Connect from "@/components/landing-page/connect";
import Faq from "@/components/landing-page/faq";
import LandingPage from "@/components/landing-page/home";
import Objective from "@/components/landing-page/objective";

export default function Home() {
  return (
    <>
      <LandingPage />
      <Objective />
      <Connect />
      <Faq />
    </>
  );
}
