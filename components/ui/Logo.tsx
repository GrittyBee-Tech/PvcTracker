import { IoFootstepsSharp } from "react-icons/io5";

const Logo = () => {
  return (
    <a href="/" className="grid grid-flow-col gap-2 text-primary text-pretty font-bold">
      <h1 className="text-xl sm:text-2xl md:text-2xl">PVC WAKA</h1>
      <IoFootstepsSharp className="text-xl sm:text-2xl md:text-3xl" />
    </a>
  );
};

export default Logo;
