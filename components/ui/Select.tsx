
const Select = ({
  name,
  label,
  value,
  onChange,
  options,
  placeholder = "Select to Choose",
}: {
  name: string;
  label?: string;
  value: string;
  options: { name: string; value: string }[];
  onChange: (field: string, value: string) => void;
  placeholder?: string;
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-[#10200e] font-Montserrat font-medium text-sm"
      >
        {label}
      </label>
      <select
        id={name}
        onChange={(e) => onChange(e.target.id, e.target.value)}
        value={value}
        className="w-full h-9 mt-1.5 px-1.5 text-gray-500 text-sm font-Montserrat font-medium border border-[#10200e]/50 outline-none rounded-lg"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
