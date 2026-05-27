interface InputGroupProps<T extends string> {
  name: T;
  label: string;
  type?: string;
  value: string;
  onChange: (field: T, value: string) => void;
  placeholder: string;
  labelClassName?: string;
  inputClassName?: string;
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
}: InputGroupProps<T>) => {
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
        onChange={(e) => onChange(name, e.target.value)}
        className={`w-full mt-1.5 p-2 text-sm font-dm-sans font-medium border outline-none rounded-lg bg-white border-border text-black placeholder:text-gray-400 focus:border-green-500 ${inputClassName}`}
      />
    </div>
  );
};

export default InputGroup;
