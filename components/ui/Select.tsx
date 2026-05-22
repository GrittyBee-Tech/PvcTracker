
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
  labelClassName = "text-black",
  selectClassName = "text-black border-primary/50 bg-white/10 border-green-500/30 text-blaxk placeholder:text-white/50 focus:border-green-500",
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className={`font-dm-sans font-semibold text-sm ${labelClassName}`}
      >
        {label}
      </label>
      <select
        id={name}
        value={value}
        onChange={(e) => onChange(e.target.id, e.target.value)}
        className={`w-full mt-1.5 p-2 text-sm font-dm-sans font-medium border outline-none rounded-lg ${selectClassName}`}
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
