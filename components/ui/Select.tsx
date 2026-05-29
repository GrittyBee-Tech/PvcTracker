interface SelectOption {
  name: string;
  value: string;
}

// ✅ Add the generic constraint <T extends string> to the props interface
interface SelectProps<T extends string> {
  name: T; // The name must match the tracked key exactly
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (field: T, value: string) => void; // ✅ Enforces type alignment here
  placeholder?: string;
  labelClassName?: string;
  selectClassName?: string;
}

// ✅ Pass the generic parameter down into the functional component definition
const Select = <T extends string>({
  name,
  label,
  options,
  value,
  onChange,
  placeholder,
  labelClassName,
  selectClassName,
}: SelectProps<T>) => {
  return (
    <div className="w-full">
      <label
        htmlFor={name}
        className={`font-semibold text-sm block text-black ${labelClassName}`}
      >
        {label}
      </label>
      <select
        id={name}
        value={value}
        // ✅ TypeScript now guarantees that 'name' matches your strict type T
        onChange={(e) => onChange(name, e.target.value)}
        className={`w-full mt-1.5 p-2.5 text-sm border outline-none rounded-lg text-primary border-zinc-700 bg-white focus:border-green-500 ${selectClassName}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option className="" key={option.value} value={option.value}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
