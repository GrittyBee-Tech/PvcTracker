import { OBJECTIVE_SCHEMA } from "@/utils/constants/objective";

const Objective = () => {
  return (
    <section>
      <hr className="border-[#F9FDFA]" />
      <div className="lg:px-20 md:py-20 py-10 px-6 ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {OBJECTIVE_SCHEMA.map((item, index) => (
            <div
              key={index}
              className="bg-[#F9FDFA]  border-gray-200 border  group  hover:bg-white  shadow-xl  rounded-2xl p-6 max-h-112 flex flex-col justify-between"
            >
              <span className="text-4xl group-hover:text-[#0A140F] text-[#4B6F52] mb-4 grid justify-center">
                <item.icon />
              </span>
              <h2 className="md:text-2xl font-space-grotesk text-[#4B6F52] text-center mt-3  w-11/12 mx-auto font-bold mb-4">
                {item.title}
              </h2>
              <p className="text-[#0A140F] font-dm-sans group-hover:text-black text-center h-50">
                {item.description}
              </p>

              <a
                href={item.btnLink}
                className="bg-[#4B6F52] grid  justify-center w-60 hover:bg-[#a58a3a] mx-auto text-white font-bold py-2 px-4 rounded-lg mt-4"
              >
                {item.btntext}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Objective;
