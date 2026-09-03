interface InputGroupProps<T extends string> {
  name: T;
  label: string;
  type?: string;
  value: string;
  onChange: (field: T, value: string) => void;
  placeholder: string;
  labelClassName?: string;
  inputClassName?: string;
  disabled?: boolean;
  prefix?: string;
}

const InputGroup = <T extends string>({
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  labelClassName,
  inputClassName = "text-black border-primary/50",
  disabled = false,
  prefix,
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
      <div className="flex mt-1.5">
        {prefix && (
          <span className="flex items-center px-3 text-sm font-dm-sans font-medium text-black bg-gray-100 border border-r-0 border-border rounded-l-lg">
            {prefix}
          </span>
        )}
        <input
          id={name}
          type={type}
          value={inputValue}
          placeholder={placeholder}
          onChange={(e) => {
            if (!prefix) {
              onChange(name, e.target.value);
              return;
            }

            const digits = e.target.value.replace(/\D/g, "").replace(/^0+/, "");
            onChange(name, digits ? `${prefix}${digits}` : "");
          }}
          disabled={disabled}
          className={`w-full p-2 text-sm font-dm-sans font-medium border outline-none ${prefix ? "rounded-r-lg" : "rounded-lg"} bg-white border-border text-black placeholder:text-gray-400 focus:border-green-500 disabled:opacity-60 disabled:cursor-not-allowed ${inputClassName}`}
        />
      </div>
    </div>
  );
};

export default InputGroup;
