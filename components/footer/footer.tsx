import Logo from "../ui/Logo";

const Footer = () => {
  return (
    <footer className="grid md:grid-flow-col  bg-[#F9FDFA] border-border border-t lg:px-20 px-6  gap-4 items-center justify-between md:py-5 py-7 shadow-xl">
      <Logo />

      <div className="grid md:grid-flow-col items-center gap-10 text-lg">
        <p className="text-black font-dm-sans text-sm">
          © 2026 PVC Waka All Right Reserved-{" "}
          <a
            className="text-primary font-bold"
            href="https://www.abenolfoundation.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            abenolfoundation.org
          </a>{" "}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
