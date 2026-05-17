import React, { ChangeEventHandler } from "react";

const InputGroup = ({
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  labelClassName = "text-[#10200e]",
  inputClassName = "text-[#10200e] border-[#10200e]/50",
}: {
  name: string;
  label: string;
  type?: string;
  value: string;
  onChange: (field: string, value: string) => void;
  placeholder: string;
  labelClassName?: string;
  inputClassName?: string;
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className={`font-Montserrat font-semibold text-sm ${labelClassName}`}
      >
        {label}
      </label>
      <input
        id={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.id, e.target.value)}
        className={`w-full mt-1.5 p-2 text-sm font-Montserrat font-medium border outline-none rounded-lg ${inputClassName}`}
      />
    </div>
  );
};

export default InputGroup;
