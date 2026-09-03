interface InputGroupProps<T extends string> {
  name: T;
  label: string;
  type?: string;
  value: string;
  onChange: (field: T, value: string) => void;
  placeholder: string;
  required?: boolean;
  labelClassName?: string;
  inputClassName?: string;
  disabled?: boolean;
  prefix?: string;
  maxLength?: number;
}

const InputGroup = <T extends string>({
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  labelClassName,
  inputClassName = "text-black border-primary/50",
  disabled = false,
  prefix,
  maxLength,
}: InputGroupProps<T>) => {
  const inputValue =
    prefix && value.startsWith(prefix) ? value.slice(prefix.length) : value;

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
        required={required}
        onChange={(e) => onChange(name, e.target.value)}
        disabled={disabled}
        className={`w-full mt-1.5 p-2 text-sm font-dm-sans font-medium border outline-none rounded-lg bg-white border-border text-black placeholder:text-gray-400 disabled:opacity-60 disabled:cursor-not-allowed ${inputClassName}`}
      />
    </div>
  );
};

export default InputGroup;
