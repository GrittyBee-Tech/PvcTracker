import React, { ChangeEventHandler } from "react";

const InputGroup = ({
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  name: string;
  label: string;
  type?: string;
  value: string;
  onChange: (field: string, value: string) => void;
  placeholder: string;
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-[#10200e] font-Montserrat font-semibold text-sm"
      >
        {label}
      </label>
      <input
        id={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.id, e.target.value)}
        className="w-full mt-1.5 p-2 text-[#10200e] text-sm font-Montserrat font-medium border border-[#10200e]/50 outline-none rounded-lg"
      />
    </div>
  );
};

export default InputGroup;
