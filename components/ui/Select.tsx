import { ScrollableSelect } from "./scrollable-select";

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
  disabled?: boolean;
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
  disabled = false,
}: SelectProps<T>) => {
  return (
    <div className="w-full">
      <label
        htmlFor={name}
        className={`font-semibold text-sm block text-black ${labelClassName}`}
      >
        {label}
      </label>
      <ScrollableSelect
        selectClassName={selectClassName}
        name={name}
        onValueChange={(val) => onChange(name, val)}
        options={options}
        id={name}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
      />
    </div>
  );
};

export default Select;
