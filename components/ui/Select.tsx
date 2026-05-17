
import React from "react";

interface SelectOption {
  name: string;
  value: string;
}

interface SelectProps {
  name: string;
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (field: string, value: string) => void;
  placeholder?: string;
  labelClassName?: string;
  selectClassName?: string;
}

const Select: React.FC<SelectProps> = ({
  name,
  label,
  options,
  value,
  onChange,
  placeholder,
  labelClassName = "text-[#10200e]",
  selectClassName = "text-[#10200e] border-[#10200e]/50",
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className={`font-Montserrat font-semibold text-sm ${labelClassName}`}
      >
        {label}
      </label>
      <select
        id={name}
        value={value}
        onChange={(e) => onChange(e.target.id, e.target.value)}
        className={`w-full mt-1.5 p-2 text-sm font-Montserrat font-medium border outline-none rounded-lg ${selectClassName}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
