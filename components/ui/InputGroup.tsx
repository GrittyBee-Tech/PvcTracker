import React, { ChangeEventHandler } from "react";

const InputGroup = ({
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  labelClassName = "",
  inputClassName = "text-black border-primary/50",
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
        className={`font-dm-sans font-semibold text-sm text-black ${labelClassName}`}
      >
        {label}
      </label>
      <input
        id={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.id, e.target.value)}
        className={`w-full mt-1.5 p-2 text-sm font-dm-sans font-medium border outline-none rounded-lg bg-white/10 border-green-500/30 text-black placeholder:text-gray-400 focus:border-green-500 ${inputClassName}`}
      />
    </div>
  );
};

export default InputGroup;
