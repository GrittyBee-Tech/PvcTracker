import { IoFootstepsSharp } from "react-icons/io5";

const Logo = () => {
  return (
    <a href="/" className="grid grid-flow-col gap-2 font-bold">
      <h1 className="text-2xl md:text-3xl text-primary">PVC WAKA</h1>
      <IoFootstepsSharp className="text-2xl md:text-3xl text-primary" />
    </a>
  );
};

export default Logo;
