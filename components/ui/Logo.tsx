import Link from "next/link";
import { IoFootstepsSharp } from "react-icons/io5";

const Logo = () => {
  return (
    <Link
      href="/"
      className="grid grid-flow-col gap-2 text-primary w-max text-pretty font-bold"
    >
      <h1 className="text-xl sm:text-2xl md:text-2xl">PVC WAKA</h1>
      <IoFootstepsSharp className="text-xl sm:text-2xl md:text-3xl" />
    </Link>
  );
};

export default Logo;
